<#
.SYNOPSIS
  Ends the founding rate for everyone, on 1 July 2027. Run it once, on the day.

.DESCRIPTION
  The promise on the site is that US$47 runs until 30 June 2027 and then becomes
  US$67, for every founding family on the same date, whenever they joined.

  Stripe cannot express that on its own. A coupon's duration is counted from
  each subscriber's own start date, never to a fixed calendar date, so
  "repeating, 9 months" would give someone who joins in June 2027 a discount
  running into March 2028. The only way to land everyone on the same date is a
  discount that does not expire, removed from every subscription at once.

  This is that removal. It is the second half of the promise, and without it
  every founding family stays at US$47 indefinitely.

  WHAT IT DOES
    Removes the founding discount from every active subscription carrying it.
    Their next invoice is the standing price. Nothing else about the
    subscription changes: same plan, same billing date, same card.

  WHAT IT DOES NOT DO
    It does not cancel anyone, change anyone's plan, or charge anyone early.
    It does not touch EARLY100 members, whose discount is a different coupon
    and is meant to be permanent.

  BEFORE RUNNING IT, EMAIL THEM. The site says "we email you before it does".
  `Who is a member.cmd` lists exactly who is affected.

.PARAMETER DryRun
  Lists who would be affected and what they would pay. Changes nothing.

.PARAMETER CouponId
  The founding coupon. Defaults to the one live as of 29 September 2026.

.PARAMETER Force
  Run before the end date. Refused otherwise, because ending it early is a
  price rise nobody was told about.

.NOTES
  The key comes from the secrets file, then STRIPE_SECRET_KEY, then a prompt.
  Needs Subscriptions Write.
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [string]$CouponId = '7kTcuAi4',
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

# End of 30 June 2027, Atlantic time. The same instant the site and the
# promotion code both use.
$EndsAt = [DateTimeOffset]::FromUnixTimeSeconds(1814410800)

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
    if ($env:STRIPE_SECRET_KEY) { return $env:STRIPE_SECRET_KEY }
    $secure = Read-Host 'Stripe key' -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

$key = Get-StripeKey
if (-not $key) { throw 'No key provided.' }
if ($key -match '_test_') { throw 'That is a test-mode key. This changes what live members pay.' }
$headers = @{ Authorization = "Bearer $key" }

function Invoke-Stripe {
    param([string]$Method = 'Get', [string]$Path)
    try {
        return Invoke-RestMethod -Method $Method -Headers $headers -Uri "https://api.stripe.com/v1/$Path"
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

# --- not before the date -----------------------------------------------------

$now = [DateTimeOffset]::UtcNow
Write-Host ''
Write-Host "Founding rate ends : $($EndsAt.ToLocalTime().ToString('yyyy-MM-dd HH:mm')) local"
Write-Host "Right now          : $($now.ToLocalTime().ToString('yyyy-MM-dd HH:mm')) local"

if ($now -lt $EndsAt -and -not $Force) {
    $days = [int]($EndsAt - $now).TotalDays
    Write-Host ''
    Write-Host "STOPPED. The founding rate still has $days days to run." -ForegroundColor Yellow
    Write-Host 'Ending it now is a price rise nobody was told about. Members were' -ForegroundColor Yellow
    Write-Host 'promised US$47 until 30 June 2027.' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Use -DryRun to see who it would affect, or -Force if you really mean it.' -ForegroundColor DarkGray
    if (-not $DryRun) { return }
}

# --- who carries the founding discount --------------------------------------

$subs = @((Invoke-Stripe -Path 'subscriptions?status=active&limit=100').data)

$affected = foreach ($s in $subs) {
    $discount = if ($s.discounts -and @($s.discounts).Count -gt 0) { $s.discounts[0] }
                elseif ($s.discount) { $s.discount } else { $null }
    if (-not $discount) { continue }

    $couponOnSub = if ($discount.coupon -is [string]) { $discount.coupon } else { $discount.coupon.id }
    if ($couponOnSub -ne $CouponId) { continue }

    $item     = $s.items.data[0]
    $standing = ($item.price.unit_amount | ForEach-Object { $_ }) / 100
    $off      = if ($discount.coupon.amount_off) { $discount.coupon.amount_off / 100 } else { 0 }

    [pscustomobject]@{
        Id       = $s.id
        Customer = if ($s.customer -is [string]) { $s.customer } else { $s.customer.id }
        PaysNow  = $standing - $off
        WillPay  = $standing
        DiscId   = $discount.id
    }
}

$affected = @($affected)

Write-Host ''
if ($affected.Count -eq 0) {
    Write-Host "No active subscription carries coupon $CouponId. Nothing to do." -ForegroundColor Green
    return
}

Write-Host "$($affected.Count) subscription(s) on the founding rate:" -ForegroundColor Cyan
foreach ($a in $affected) {
    Write-Host ("  {0}  {1}  US`${2} -> US`${3}" -f $a.Id, $a.Customer, $a.PaysNow, $a.WillPay)
}

if ($DryRun) {
    Write-Host ''
    Write-Host 'Dry run. Nothing was changed.' -ForegroundColor Green
    return
}

# --- do it -------------------------------------------------------------------

Write-Host ''
Write-Host 'Have you emailed them? The site promises notice before this happens.' -ForegroundColor Yellow
$confirm = Read-Host "Type END to move $($affected.Count) member(s) to the standing price"
if ($confirm -cne 'END') {
    Write-Host 'Stopped. Nothing was changed.' -ForegroundColor Yellow
    return
}

$done = 0
foreach ($a in $affected) {
    try {
        $null = Invoke-Stripe -Method Delete -Path "subscriptions/$($a.Id)/discount"
        Write-Host "  ended  $($a.Id)  now US`$$($a.WillPay)"
        $done++
    } catch {
        Write-Host "  FAILED $($a.Id)  $($_.Exception.Message)" -ForegroundColor Red
    }
}

# --- prove nobody was cancelled ---------------------------------------------

$after = @((Invoke-Stripe -Path 'subscriptions?status=active&limit=100').data)

Write-Host ''
Write-Host "$done of $($affected.Count) moved to the standing price."
if ($after.Count -eq $subs.Count) {
    Write-Host "Active subscriptions still $($after.Count). Nobody was cancelled." -ForegroundColor Green
} else {
    Write-Host "Active subscriptions went $($subs.Count) -> $($after.Count). Check this now." -ForegroundColor Red
}
