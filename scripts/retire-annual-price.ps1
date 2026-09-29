<#
.SYNOPSIS
  Retires the US$597 annual offer, once the monthly one is actually working.

.DESCRIPTION
  Jolène's ruling: US$79 a month REPLACES the US$597 annual membership.

  Replacing is two separate acts, and the order matters. new-monthly-price.ps1
  creates the monthly price and link. This script takes the annual one down, and
  it refuses to run until the monthly replacement exists and is live. That guard
  is the point of this file: the failure worth engineering against is a site with
  nothing a parent can buy.

  WHAT ARCHIVING DOES AND DOES NOT DO:

    Does      stops NEW customers buying at US$597 a year
    Does      stops the annual payment link opening
    Does NOT  cancel, move, reprice or notify any existing subscriber

  There is an active subscriber on the annual price. A Stripe subscription is
  attached to the price it was bought at, and archiving that price does not
  reach into it. That customer keeps paying US$597 a year until they cancel.
  This is the normal, correct outcome of a price change and needs no action.

  FOUNDING40 is a first-year discount written for the annual price. Left active
  after the switch it would take 40% off a monthly subscription instead, which
  is not what it was created for, and it is advertised on the live home page.
  -RetireFoundingCode deactivates it. Off by default: retiring a discount code
  is its own decision and should be typed, not inherited.

.PARAMETER DryRun
  Reports what would happen and changes nothing. Run this first.

.PARAMETER RetireFoundingCode
  Also deactivate the FOUNDING40 promotion code.

.PARAMETER Force
  Skip the "does a working monthly replacement exist" guard. Do not use this
  unless you intend the site to sell nothing.

.EXAMPLE
  .\retire-annual-price.ps1 -DryRun
  .\retire-annual-price.ps1 -RetireFoundingCode

.NOTES
  Your Stripe key is read from STRIPE_SECRET_KEY if present, otherwise you are
  prompted for it. It is never written to disk, never printed, never stored in
  this repository.

  Needs a restricted key with:
      Prices           Write
      Payment Links    Write
      Subscriptions    Read
      Coupons          Write   (only for -RetireFoundingCode)
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$RetireFoundingCode,
    [switch]$Force,
    [ValidateRange(1, 10000)]
    [int]$MonthlyUsd = 79
)

$ErrorActionPreference = 'Stop'
$monthlyCents = $MonthlyUsd * 100

# --- credentials -------------------------------------------------------------
#
# Order: the key saved by save-stripe-pricing-key.ps1, then STRIPE_SECRET_KEY
# from the environment, then a hidden prompt. The saved key lives outside the
# repository; see that script for where and why.

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
    Write-Host 'Paste a live Stripe key, or press Enter to stop.' -ForegroundColor DarkGray
    Write-Host ''
    $secure = Read-Host 'Key' -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

$key = Get-StripeKey

if (-not $key) { throw 'No key provided.' }
if (-not ($key.StartsWith('sk_') -or $key.StartsWith('rk_'))) {
    throw 'That does not look like a Stripe key. It should start with sk_ or rk_.'
}
if ($key.StartsWith('sk_test_') -or $key.StartsWith('rk_test_')) {
    throw 'That is a test-mode key. This retires a live offer, so it needs a live key.'
}

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
        # A restricted key missing one permission is the most likely failure
        # here, and a raw REST stack trace is no help to the person running it.
        $detail = $_.ErrorDetails.Message
        if ($detail -and $detail -match '"code":\s*"more_permissions_required"') {
            $needed = if ($detail -match 'Enabling ([A-Za-z ]+) \(') { $Matches[1] } else { 'another' }
            Write-Host ''
            Write-Host "Your Stripe key is missing the $needed permission." -ForegroundColor Yellow
            Write-Host 'Add it, or make a new restricted key, at:' -ForegroundColor Yellow
            Write-Host '  https://dashboard.stripe.com/apikeys' -ForegroundColor Yellow
            Write-Host ''
            Write-Host 'Nothing was changed.' -ForegroundColor Green
            exit 1
        }
        throw
    }
}

# --- the guard ---------------------------------------------------------------

Write-Host ''
Write-Host 'Checking that a replacement exists before taking anything down.' -ForegroundColor DarkGray

$prices = Invoke-Stripe Get 'prices?limit=100&expand[]=data.product'

$monthly = @($prices.data | Where-Object {
    $_.active -and $_.unit_amount -eq $monthlyCents -and $_.currency -eq 'usd' -and
    $_.recurring -and $_.recurring.interval -eq 'month'
})

$links = Invoke-Stripe Get 'payment_links?limit=100'
$monthlyIds = $monthly | ForEach-Object { $_.id }
$monthlyLinks = @($links.data | Where-Object {
    $_.active -and ($_.line_items.data | Where-Object { $monthlyIds -contains $_.price.id })
})

# The list endpoint does not always expand line_items, so fall back to asking
# each active link what it sells rather than assuming the guard passed.
if ($monthlyLinks.Count -eq 0 -and $monthly.Count -gt 0) {
    foreach ($l in @($links.data | Where-Object { $_.active })) {
        $full = Invoke-Stripe Get "payment_links/$($l.id)/line_items?limit=10"
        if ($full.data | Where-Object { $monthlyIds -contains $_.price.id }) {
            $monthlyLinks += $l
        }
    }
}

Write-Host "  US`$$MonthlyUsd monthly prices found : $($monthly.Count)"
Write-Host "  active payment links for them    : $($monthlyLinks.Count)"

$ready = ($monthly.Count -gt 0 -and $monthlyLinks.Count -gt 0)

if (-not $ready) {
    Write-Host ''
    if ($Force) {
        Write-Host 'No working monthly replacement, and -Force was given.' -ForegroundColor Red
        Write-Host 'Retiring the annual offer now leaves NOTHING a parent can buy.' -ForegroundColor Red
    } else {
        Write-Host 'STOPPED. There is no working US$' -NoNewline -ForegroundColor Yellow
        Write-Host "$MonthlyUsd monthly price with a live payment link." -ForegroundColor Yellow
        Write-Host 'Run new-monthly-price.ps1 first. Taking the annual offer down now' -ForegroundColor Yellow
        Write-Host 'would leave the site with nothing to sell.' -ForegroundColor Yellow
        return
    }
}

# --- what would come down ----------------------------------------------------

$annualPrices = @($prices.data | Where-Object {
    $_.active -and $_.recurring -and $_.recurring.interval -eq 'year'
})

$annualIds = $annualPrices | ForEach-Object { $_.id }
$annualLinks = @()
foreach ($l in @($links.data | Where-Object { $_.active })) {
    $full = Invoke-Stripe Get "payment_links/$($l.id)/line_items?limit=10"
    if ($full.data | Where-Object { $annualIds -contains $_.price.id }) { $annualLinks += $l }
}

$subsBefore = @((Invoke-Stripe Get 'subscriptions?status=active&limit=100').data)

Write-Host ''
Write-Host 'Would archive these prices:' -ForegroundColor Cyan
foreach ($p in $annualPrices) {
    $pname = if ($p.product -is [string]) { $p.product } else { $p.product.name }
    Write-Host "  $($p.id)   $pname   (`$$($p.unit_amount / 100)/yr)"
}
Write-Host 'Would deactivate these payment links:' -ForegroundColor Cyan
foreach ($l in $annualLinks) { Write-Host "  $($l.id)   $($l.url)" }

if ($RetireFoundingCode) {
    Write-Host 'Would deactivate this promotion code:' -ForegroundColor Cyan
    Write-Host '  FOUNDING40'
}

Write-Host ''
Write-Host "Active subscriptions: $($subsBefore.Count). None of them is touched by any of this." -ForegroundColor DarkGray
foreach ($s in $subsBefore) {
    foreach ($it in $s.items.data) {
        Write-Host "  keeps paying `$$($it.price.unit_amount / 100) / $($it.price.recurring.interval)"
    }
}

if ($DryRun) {
    Write-Host ''
    Write-Host 'Dry run. Nothing was changed.' -ForegroundColor Green
    return
}

# --- do it -------------------------------------------------------------------

Write-Host ''
$confirm = Read-Host 'Retire the annual offer? Type RETIRE to proceed'
if ($confirm -cne 'RETIRE') {
    Write-Host 'Stopped. Nothing was changed.' -ForegroundColor Yellow
    return
}

foreach ($p in $annualPrices) {
    $null = Invoke-Stripe Post "prices/$($p.id)" @{ active = 'false' }
    Write-Host "archived price  $($p.id)"
}
foreach ($l in $annualLinks) {
    $null = Invoke-Stripe Post "payment_links/$($l.id)" @{ active = 'false' }
    Write-Host "deactivated link $($l.id)"
}

if ($RetireFoundingCode) {
    $codes = Invoke-Stripe Get 'promotion_codes?limit=100&code=FOUNDING40'
    foreach ($c in @($codes.data | Where-Object { $_.active })) {
        $null = Invoke-Stripe Post "promotion_codes/$($c.id)" @{ active = 'false' }
        Write-Host "deactivated code $($c.code)  $($c.id)"
    }
}

# --- prove nothing else moved ------------------------------------------------

$subsAfter = @((Invoke-Stripe Get 'subscriptions?status=active&limit=100').data)

Write-Host ''
if ($subsAfter.Count -eq $subsBefore.Count) {
    Write-Host "Active subscriptions still $($subsAfter.Count). No customer was affected." -ForegroundColor Green
} else {
    Write-Host "Active subscriptions went $($subsBefore.Count) -> $($subsAfter.Count). Check this now." -ForegroundColor Red
}

Write-Host ''
Write-Host 'The annual offer is retired. The home page still advertises it until the' -ForegroundColor Yellow
Write-Host 'founding-families-preview branch is merged and deployed.' -ForegroundColor Yellow
