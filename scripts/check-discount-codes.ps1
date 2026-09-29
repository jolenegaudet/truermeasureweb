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
    throw 'That does not look like a Stripe key. It should start with sk_ (secret) or rk_ (restricted).'
}
if ($key.StartsWith('sk_test_') -or $key.StartsWith('rk_test_')) {
    throw 'That is a test-mode key. The real codes live in live mode, so this needs a live key.'
}

$headers = @{ Authorization = "Bearer $key" }

# --- fetch -------------------------------------------------------------------

$uri = 'https://api.stripe.com/v1/promotion_codes?limit=100&expand[]=data.coupon'
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

    # A restricted key needs Coupons set to Read before any of this comes back.
    # Without it Stripe still lists the codes and their caps, but sends no
    # coupon object at all, so the discount cannot be shown.
    $couponReadable = $null -ne $p.coupon

    $discount =
        if (-not $couponReadable) { 'key cannot read coupons' }
        elseif ($p.coupon.percent_off) { "$($p.coupon.percent_off)% off" }
        elseif ($p.coupon.amount_off) { "$([math]::Round($p.coupon.amount_off / 100, 2)) $($p.coupon.currency.ToUpper()) off" }
        else { 'unknown' }

    $duration =
        if (-not $couponReadable) { $null }
        elseif ($p.coupon.duration -eq 'repeating') { "$($p.coupon.duration) x$($p.coupon.duration_in_months)m" }
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
        Discount  = if ($duration) { "$discount ($duration)" } else { $discount }
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

$blind = $rows | Where-Object { $_.Discount -eq 'key cannot read coupons' }
if ($blind) {
    Write-Host ''
    Write-Host 'The caps above are real, but this key cannot see how much each code' -ForegroundColor DarkGray
    Write-Host 'takes off. Add Coupons = Read to the restricted key and run again:' -ForegroundColor DarkGray
    Write-Host '  https://dashboard.stripe.com/apikeys' -ForegroundColor DarkGray
}

Write-Host ''
Write-Host 'Nothing was changed. This script only reads.' -ForegroundColor DarkGray
