<#
.SYNOPSIS
  Lists every discount code in the live Stripe account with its real cap and
  how many times it has been used. Reads only. Changes nothing.

.DESCRIPTION
  The website says "40 founding parents" and the CRM is set to 40. Neither of
  those holds the door. A parent pays on Stripe's hosted checkout page, and the
  only thing that can refuse a 41st redemption of FOUNDING40 is the cap stored
  on the promotion code in Stripe itself.

  This script shows, for each code:

    active           whether it can still be typed in at checkout
    max_redemptions  the real cap, or "no cap" if there isn't one
    times_redeemed   how many have gone through
    remaining        what is still available to anyone who knows the code
    discount         what it takes off
    expires          when it stops working by itself, if ever

  A code showing "no cap" is open to anyone who learns it, for as long as it is
  active, however many places the CRM thinks are left.

.PARAMETER Code
  Check one code instead of all of them, e.g. -Code FOUNDING40

.NOTES
  Your Stripe key is read from the STRIPE_SECRET_KEY environment variable if
  present, otherwise you are prompted for it. It is never written to disk, never
  printed, and never stored in this repository.

  A restricted key (rk_live_...) with Coupons set to Read is all this needs, and
  is safer than the account secret key. Create one at
  https://dashboard.stripe.com/apikeys under "Restricted keys".

  max_redemptions cannot be changed after a promotion code is created. Stripe
  allows only `active` and `metadata` to be updated. If a cap is wrong, the fix
  is to deactivate the code and create a replacement, which means the code
  printed on the website changes too.
#>

[CmdletBinding()]
param(
    [string]$Code
)

$ErrorActionPreference = 'Stop'

# --- credentials -------------------------------------------------------------

if ($env:STRIPE_SECRET_KEY) {
    $key = $env:STRIPE_SECRET_KEY
    Write-Host 'Using STRIPE_SECRET_KEY from the environment.'
} else {
    Write-Host ''
    Write-Host 'You need a Stripe key. Get one here:' -ForegroundColor Cyan
    Write-Host '  https://dashboard.stripe.com/apikeys'
    Write-Host ''
    Write-Host '  Best: under "Restricted keys", create a key with Coupons set to Read.'
    Write-Host '  Or:   under "Standard keys", click "Reveal live key" on the Secret key.'
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
    throw 'That is a test-mode key. The real codes live in live mode, so this needs a live key.'
}

$headers = @{ Authorization = "Bearer $key" }

# --- fetch -------------------------------------------------------------------

$uri = 'https://api.stripe.com/v1/promotion_codes?limit=100'
if ($Code) { $uri += "&code=$([uri]::EscapeDataString($Code))" }

$response = Invoke-RestMethod -Method Get -Headers $headers -Uri $uri

if (-not $response.data -or $response.data.Count -eq 0) {
    Write-Host ''
    Write-Host 'No promotion codes found.' -ForegroundColor Yellow
    return
}

# --- report ------------------------------------------------------------------

$rows = foreach ($p in $response.data) {

    $cap  = if ($null -ne $p.max_redemptions) { $p.max_redemptions } else { $null }
    $used = [int]$p.times_redeemed

    $remaining =
        if (-not $p.active)      { 'off' }
        elseif ($null -eq $cap)  { 'NO CAP' }
        else                     { [string]([int]$cap - $used) }

    $discount =
        if ($p.coupon.percent_off) { "$($p.coupon.percent_off)% off" }
        elseif ($p.coupon.amount_off) { "$([math]::Round($p.coupon.amount_off / 100, 2)) $($p.coupon.currency.ToUpper()) off" }
        else { 'unknown' }

    $duration =
        if ($p.coupon.duration -eq 'repeating') { "$($p.coupon.duration) x$($p.coupon.duration_in_months)m" }
        else { $p.coupon.duration }

    $expires =
        if ($p.expires_at) { ([DateTimeOffset]::FromUnixTimeSeconds($p.expires_at)).ToLocalTime().ToString('yyyy-MM-dd') }
        else { 'never' }

    [pscustomobject]@{
        Code      = $p.code
        Active    = if ($p.active) { 'yes' } else { 'no' }
        Cap       = if ($null -eq $cap) { 'none' } else { [string]$cap }
        Used      = $used
        Remaining = $remaining
        Discount  = "$discount ($duration)"
        Expires   = $expires
    }
}

Write-Host ''
$rows | Sort-Object Active, Code | Format-Table -AutoSize

# --- the thing worth noticing ------------------------------------------------

$uncapped = $rows | Where-Object { $_.Remaining -eq 'NO CAP' }
if ($uncapped) {
    Write-Host ''
    Write-Host 'These codes are live with no redemption cap in Stripe:' -ForegroundColor Yellow
    foreach ($r in $uncapped) {
        Write-Host "  $($r.Code)  $($r.Discount)  expires $($r.Expires)"
    }
    Write-Host ''
    Write-Host 'Anyone who learns one of these can use it, as many times as they like,' -ForegroundColor Yellow
    Write-Host 'no matter what limit is set in the CRM. The CRM counts people; it cannot' -ForegroundColor Yellow
    Write-Host 'refuse a payment.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Nothing was changed. This script only reads.' -ForegroundColor DarkGray
