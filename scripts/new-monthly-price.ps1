<#
.SYNOPSIS
  Creates the US$79 monthly price and its payment link in live Stripe.

.DESCRIPTION
  A Stripe price is immutable. Its amount and interval can never be edited, so
  there is no way to "change" US$597 a year into US$79 a month. You create a new
  price and a new payment link, and then decide what happens to the old ones.

  This script does the creating. It does not decide.

  WHAT IT DOES NOT TOUCH, EVER:
    - the existing US$597 annual price
    - the existing annual payment link
    - any live subscription

  There is one active subscriber on the annual price. A subscription is attached
  to the price it was bought at and stays there. Archiving the annual price would
  stop new sign-ups at that price and would NOT move, cancel or reprice that
  customer. Nothing below archives anything: -Replace only reports what you would
  need to archive by hand, so the destructive half stays a deliberate act in the
  Dashboard rather than a side effect of running a script.

.PARAMETER DryRun
  Shows exactly what would be created and creates nothing. Run this first.

.PARAMETER AmountUsd
  Monthly amount in dollars. Defaults to 79.

.PARAMETER ProductName
  The product the new price is attached to. If a product with this name already
  exists it is reused, so running twice does not litter the account with
  duplicates.

.PARAMETER Replace
  Reports what you would need to archive to retire the annual offer. Archives
  nothing itself.

.EXAMPLE
  .\new-monthly-price.ps1 -DryRun
  .\new-monthly-price.ps1

.NOTES
  Your Stripe key is read from STRIPE_SECRET_KEY if present, otherwise you are
  prompted for it. It is never written to disk, never printed, never stored in
  this repository.

  This needs WRITE permission that the restricted key in .secrets does not
  currently have. That key can read prices and subscriptions but is refused on
  payment links. Create a restricted key with these four, at
  https://dashboard.stripe.com/apikeys :

      Products       Write
      Prices         Write
      Payment Links  Write
      Subscriptions  Read     (so the script can confirm it disturbed nothing)
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [ValidateRange(1, 10000)]
    [int]$AmountUsd = 79,
    [string]$ProductName = 'Truer Measure - Founding Families Monthly',
    # Stripe Tax is active on this account and the US$597 annual price is set to
    # 'exclusive', meaning the amount is before tax and Stripe adds HST/GST/VAT
    # on top at checkout. The monthly price matches it by default so the two
    # behave the same way. 'inclusive' would make US$79 the all-in figure, with
    # tax carved out of it, which is a pricing decision and not a default.
    [ValidateSet('exclusive', 'inclusive')]
    [string]$TaxBehavior = 'exclusive',
    [switch]$Replace
)

$ErrorActionPreference = 'Stop'

$amountCents = $AmountUsd * 100

# --- credentials -------------------------------------------------------------

if ($env:STRIPE_SECRET_KEY) {
    $key = $env:STRIPE_SECRET_KEY
    Write-Host 'Using STRIPE_SECRET_KEY from the environment.'
} else {
    Write-Host ''
    Write-Host 'You need a Stripe key with write access. Get one here:' -ForegroundColor Cyan
    Write-Host '  https://dashboard.stripe.com/apikeys'
    Write-Host ''
    Write-Host '  Under "Restricted keys", create a key with:'
    Write-Host '    Products Write, Prices Write, Payment Links Write, Subscriptions Read'
    Write-Host ''
    Write-Host 'Copy it, then right-click here to paste. Nothing will appear as you paste.' -ForegroundColor DarkGray
    Write-Host ''
    $secure = Read-Host 'Paste the key, then press Enter' -AsSecureString
    $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

if (-not $key) { throw 'No key provided.' }
if (-not ($key.StartsWith('sk_') -or $key.StartsWith('rk_'))) {
    throw 'That does not look like a Stripe key. It should start with sk_ (secret) or rk_ (restricted).'
}
if ($key.StartsWith('sk_test_') -or $key.StartsWith('rk_test_')) {
    throw 'That is a test-mode key. This creates a real price customers can pay, so it needs a live key.'
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

# --- what is there now -------------------------------------------------------

Write-Host ''
Write-Host 'Reading the account before changing anything.' -ForegroundColor DarkGray

$existingSubs = Invoke-Stripe Get 'subscriptions?status=active&limit=100'
$subCount = @($existingSubs.data).Count
Write-Host "  active subscriptions right now: $subCount"

$prices = Invoke-Stripe Get 'prices?limit=100&expand[]=data.product'
$monthly = @($prices.data | Where-Object {
    $_.active -and $_.unit_amount -eq $amountCents -and $_.currency -eq 'usd' -and
    $_.recurring -and $_.recurring.interval -eq 'month'
})

if ($monthly.Count -gt 0) {
    Write-Host ''
    Write-Host "A US`$$AmountUsd monthly price already exists:" -ForegroundColor Yellow
    foreach ($p in $monthly) {
        $pname = if ($p.product -is [string]) { $p.product } else { $p.product.name }
        Write-Host "  $($p.id)   $pname"
    }
    Write-Host 'Nothing created. Use the price id above, or archive it first if it is wrong.'
    return
}

$annual = @($prices.data | Where-Object {
    $_.active -and $_.recurring -and $_.recurring.interval -eq 'year'
})

# --- plan --------------------------------------------------------------------

Write-Host ''
Write-Host 'Plan' -ForegroundColor Cyan
Write-Host "  1. find or create product   : $ProductName"
Write-Host "  2. create price             : US`$$AmountUsd / month, recurring, tax $TaxBehavior"
Write-Host '  3. create payment link      : pointing at it, automatic tax ON'
Write-Host ''
Write-Host '  NOT touched: the annual price, the annual payment link, any subscription.'

if ($Replace) {
    Write-Host ''
    Write-Host 'To retire the annual offer afterwards, by hand, in the Dashboard:' -ForegroundColor Yellow
    foreach ($p in $annual) {
        $pname = if ($p.product -is [string]) { $p.product } else { $p.product.name }
        Write-Host "  archive price  $($p.id)   $pname   (`$$($p.unit_amount / 100)/yr)"
    }
    Write-Host '  deactivate the annual payment link on the Payment Links page'
    Write-Host ''
    Write-Host "  Your $subCount active subscriber(s) keep their current price and are not" -ForegroundColor Yellow
    Write-Host '  affected by archiving. Archiving only stops NEW sign-ups at that price.' -ForegroundColor Yellow
    Write-Host '  This script does not archive. Do it deliberately, or ask Claude to.' -ForegroundColor Yellow
}

if ($DryRun) {
    Write-Host ''
    Write-Host 'Dry run. Nothing was created.' -ForegroundColor Green
    return
}

# --- create ------------------------------------------------------------------

Write-Host ''
$confirm = Read-Host "Create a live US`$$AmountUsd/month price and payment link? Type YES to proceed"
if ($confirm -cne 'YES') {
    Write-Host 'Stopped. Nothing was created.' -ForegroundColor Yellow
    return
}

$products = Invoke-Stripe Get 'products?limit=100&active=true'
$product  = $products.data | Where-Object { $_.name -eq $ProductName } | Select-Object -First 1

if ($product) {
    Write-Host "Reusing product $($product.id)"
} else {
    $product = Invoke-Stripe Post 'products' @{ name = $ProductName }
    Write-Host "Created product $($product.id)"
}

$price = Invoke-Stripe Post 'prices' @{
    product                 = $product.id
    currency                = 'usd'
    unit_amount             = $amountCents
    'recurring[interval]'   = 'month'
    tax_behavior            = $TaxBehavior
    nickname                = "Founding Families US`$$AmountUsd monthly"
}
Write-Host "Created price   $($price.id)"

# automatic_tax has to be asked for. Without it Stripe Tax is active on the
# account and still calculates nothing on this link, and the annual membership
# would be collecting tax while the monthly one silently was not.
$link = Invoke-Stripe Post 'payment_links' @{
    'line_items[0][price]'     = $price.id
    'line_items[0][quantity]'  = 1
    'automatic_tax[enabled]'   = 'true'
}
Write-Host "Created link    $($link.id)"
Write-Host ""
Write-Host "  tax behaviour : $TaxBehavior  (US`$$AmountUsd is the pre-tax amount)" -ForegroundColor DarkGray
Write-Host "  automatic tax : $($link.automatic_tax.enabled)" -ForegroundColor DarkGray

# --- confirm nothing else moved ---------------------------------------------

$after = Invoke-Stripe Get 'subscriptions?status=active&limit=100'
$afterCount = @($after.data).Count

Write-Host ''
if ($afterCount -eq $subCount) {
    Write-Host "Active subscriptions still $afterCount. Nothing existing was touched." -ForegroundColor Green
} else {
    Write-Host "Active subscriptions went from $subCount to $afterCount. Check this." -ForegroundColor Red
}

Write-Host ''
Write-Host 'Paste this into content/founding-families.ts:' -ForegroundColor Cyan
Write-Host ''
Write-Host '  export const checkoutReady = true;'
Write-Host "  export const CHECKOUT_URL = `"$($link.url)`";"
Write-Host ''
Write-Host 'The old annual price and link are still active and still selling.' -ForegroundColor DarkGray
