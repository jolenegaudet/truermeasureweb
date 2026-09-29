<#
.SYNOPSIS
  Creates the founders rate: US$47 a month for the first 9 months, then US$79.

.DESCRIPTION
  Stripe has no "intro price" object. The way to charge less at the start and
  more later, without anyone remembering to do anything, is one price plus a
  repeating coupon:

      price   US$79 / month              the real, standing price
      coupon  US$32 off, 9 months        makes it US$47 while it lasts
      then    Stripe stops applying it and bills US$79

  The step up happens by itself on the tenth invoice. Nobody has to migrate a
  customer, and nobody has to remember. That is the whole reason for doing it
  this way instead of creating a second US$47 price.

  The discount is an amount, not a percentage, so US$79 minus US$32 is exactly
  US$47 rather than something with pennies on it.

  Tax: the price is tax_behavior=exclusive, so the discount comes off the US$79
  before tax is calculated, and a parent is taxed on the US$47 she actually pays.

.PARAMETER MonthlyUsd
  The standing price the discount comes off. Defaults to 79.

.PARAMETER FoundersUsd
  What a founding parent pays while the discount lasts. Defaults to 47.

.PARAMETER Months
  How many months the founders rate lasts. Defaults to 9.

.PARAMETER Code
  The promotion code parents redeem. Defaults to FOUNDING47.

.PARAMETER MaxRedemptions
  Cap on how many founding parents can redeem it. Omit for no cap.
  This cannot be changed after the code is created: Stripe allows only `active`
  and `metadata` to be updated on a promotion code. Getting it wrong means
  making a new code, which changes the code printed on the website.

.PARAMETER DryRun
  Shows what would be created and creates nothing.

.NOTES
  The key comes from the secrets file, then STRIPE_SECRET_KEY, then a prompt.
  It is never printed or stored in this repository.
  Needs Prices Read, Coupons Write, Payment Links Write.
#>

[CmdletBinding()]
param(
    [ValidateRange(1, 10000)][int]$MonthlyUsd  = 79,
    [ValidateRange(1, 10000)][int]$FoundersUsd = 47,
    [ValidateRange(1, 36)]  [int]$Months       = 9,
    [string]$Code = 'FOUNDING47',
    [int]$MaxRedemptions = 0,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if ($FoundersUsd -ge $MonthlyUsd) {
    throw "The founders rate (US`$$FoundersUsd) must be less than the standing price (US`$$MonthlyUsd)."
}
$offUsd   = $MonthlyUsd - $FoundersUsd
$offCents = $offUsd * 100

# --- credentials -------------------------------------------------------------

function Get-StripeKey {
    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if ($repoRoot) {
        $repoRoot = [IO.Path]::GetFullPath($repoRoot)
        $secretsHome = if ($env:TRUERMEASURE_SECRETS_DIR) {
            $env:TRUERMEASURE_SECRETS_DIR
        } else {
            Join-Path (Split-Path $repoRoot -Parent) '.secrets'
        }
        $secretsFile = Join-Path $secretsHome 'azure.local.env'
        if (Test-Path $secretsFile) {
            $line = Get-Content $secretsFile |
                    Where-Object { $_ -match '^STRIPE_PRICING_KEY=' } |
                    Select-Object -First 1
            if ($line) {
                Write-Host 'Using STRIPE_PRICING_KEY from the secrets file.'
                return ($line -replace '^STRIPE_PRICING_KEY=', '').Trim().Trim('"').Trim("'")
            }
        }
    }
    if ($env:STRIPE_SECRET_KEY) {
        Write-Host 'Using STRIPE_SECRET_KEY from the environment.'
        return $env:STRIPE_SECRET_KEY
    }
    Write-Host ''
    Write-Host 'No saved key found. Run "Save Stripe key.cmd" once and this stops asking.' -ForegroundColor Cyan
    $secure = Read-Host 'Key' -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

$key = Get-StripeKey
if (-not $key) { throw 'No key provided.' }
if ($key -match '_test_') { throw 'That is a test-mode key. This creates a live discount.' }

$headers = @{ Authorization = "Bearer $key" }
$form    = @{ 'Content-Type' = 'application/x-www-form-urlencoded' }

function Invoke-Stripe {
    param([string]$Method, [string]$Path, [hashtable]$Body)
    $uri = "https://api.stripe.com/v1/$Path"
    try {
        if ($Method -eq 'Get') {
            return Invoke-RestMethod -Method Get -Headers $headers -Uri $uri
        }
        $encoded = ($Body.GetEnumerator() | ForEach-Object {
            "$([uri]::EscapeDataString($_.Key))=$([uri]::EscapeDataString([string]$_.Value))"
        }) -join '&'
        return Invoke-RestMethod -Method $Method -Headers ($headers + $form) -Uri $uri -Body $encoded
    } catch {
        $detail = $_.ErrorDetails.Message
        if ($detail -and $detail -match '"code":\s*"more_permissions_required"') {
            $needed = if ($detail -match 'Enabling ([A-Za-z ]+) \(') { $Matches[1] } else { 'another' }
            Write-Host ''
            Write-Host "Your Stripe key is missing the $needed permission." -ForegroundColor Yellow
            Write-Host 'Add it at https://dashboard.stripe.com/apikeys' -ForegroundColor Yellow
            Write-Host 'Nothing was changed.' -ForegroundColor Green
            exit 1
        }
        throw
    }
}

# --- find the monthly price and its link ------------------------------------

$monthlyCents = $MonthlyUsd * 100
$prices = Invoke-Stripe Get 'prices?limit=100&expand[]=data.product'
$price = $prices.data | Where-Object {
    $_.active -and $_.unit_amount -eq $monthlyCents -and $_.currency -eq 'usd' -and
    $_.recurring -and $_.recurring.interval -eq 'month'
} | Select-Object -First 1

if (-not $price) {
    throw "No active US`$$MonthlyUsd monthly price found. Run new-monthly-price.ps1 first."
}

$links = Invoke-Stripe Get 'payment_links?limit=100'
$link = $null
foreach ($l in @($links.data | Where-Object { $_.active })) {
    $items = Invoke-Stripe Get "payment_links/$($l.id)/line_items?limit=10"
    if ($items.data | Where-Object { $_.price.id -eq $price.id }) { $link = $l; break }
}
if (-not $link) { throw "No active payment link found for price $($price.id)." }

# --- already there? ----------------------------------------------------------

$existing = Invoke-Stripe Get "promotion_codes?limit=100&code=$([uri]::EscapeDataString($Code))"
$live = @($existing.data | Where-Object { $_.active })
if ($live.Count -gt 0) {
    Write-Host ''
    Write-Host "$Code already exists and is active:" -ForegroundColor Yellow
    foreach ($c in $live) {
        Write-Host "  $($c.id)  cap=$(if ($null -eq $c.max_redemptions) { 'none' } else { $c.max_redemptions })  used=$($c.times_redeemed)"
    }
    Write-Host 'Nothing created. Deactivate it first if it is wrong.'
    return
}

# --- plan --------------------------------------------------------------------

Write-Host ''
Write-Host 'Plan' -ForegroundColor Cyan
Write-Host "  price it applies to : $($price.id)  US`$$MonthlyUsd / month"
Write-Host "  coupon              : US`$$offUsd off, repeating, $Months months"
Write-Host "  promotion code      : $Code   cap $(if ($MaxRedemptions -gt 0) { $MaxRedemptions } else { 'none' })"
Write-Host "  payment link        : $($link.id), promotion codes switched on"
Write-Host ''
Write-Host "  A founding parent pays US`$$FoundersUsd a month for $Months months," -ForegroundColor DarkGray
Write-Host "  then US`$$MonthlyUsd. Stripe steps it up by itself." -ForegroundColor DarkGray

if ($DryRun) {
    Write-Host ''
    Write-Host 'Dry run. Nothing was created.' -ForegroundColor Green
    return
}

# --- create ------------------------------------------------------------------

$coupon = Invoke-Stripe Post 'coupons' @{
    name                = "Founding Families: US`$$FoundersUsd for $Months months"
    amount_off          = $offCents
    currency            = 'usd'
    duration            = 'repeating'
    duration_in_months  = $Months
    'applies_to[products][0]' = $price.product.id
}
Write-Host "Created coupon  $($coupon.id)"

$promoBody = @{
    'promotion[type]'   = 'coupon'
    'promotion[coupon]' = $coupon.id
    code                = $Code
}
if ($MaxRedemptions -gt 0) { $promoBody['max_redemptions'] = $MaxRedemptions }

$promo = Invoke-Stripe Post 'promotion_codes' $promoBody
Write-Host "Created code    $($promo.code)  ($($promo.id))"

$updated = Invoke-Stripe Post "payment_links/$($link.id)" @{ allow_promotion_codes = 'true' }
Write-Host "Link updated    $($updated.id)  allow_promotion_codes=$($updated.allow_promotion_codes)"

# --- what the site should use ------------------------------------------------

Write-Host ''
Write-Host 'Checkout URL with the founders rate already applied:' -ForegroundColor Cyan
Write-Host "  $($updated.url)?prefilled_promo_code=$Code"
Write-Host ''
Write-Host 'Verify that link in a browser before publishing it. It should show' -ForegroundColor Yellow
Write-Host "  US`$$FoundersUsd due today, and US`$$MonthlyUsd from month $($Months + 1)." -ForegroundColor Yellow
