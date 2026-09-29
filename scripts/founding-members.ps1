<#
.SYNOPSIS
  Who is a member, what they pay now, and the date their founders rate ends.

.DESCRIPTION
  The founders rate is a repeating coupon that expires by itself, so the answer
  to "how do I keep track" is not a spreadsheet. It is this, run whenever you
  want to know.

  For every active subscription it shows:

    what they pay this month
    whether the founders discount is still on
    the date it runs out, and what they pay from then
    when the next payment is taken

  It changes nothing. It only reads.

  The column that matters is "rate ends". That is the date Stripe stops applying
  the discount and starts billing the standing price, on its own. Anyone you
  need to email before their price changes is in that column.

.PARAMETER NoticeDays
  Flag members whose founders rate ends within this many days, so you know who
  to email. Defaults to 30.

.NOTES
  The key comes from the secrets file, then STRIPE_SECRET_KEY, then a prompt.
  Needs Subscriptions Read and Customers Read.
#>

[CmdletBinding()]
param([int]$NoticeDays = 30)

$ErrorActionPreference = 'Stop'

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
$headers = @{ Authorization = "Bearer $key" }

function Invoke-Stripe {
    param([string]$Path, [switch]$Soft)
    try {
        return Invoke-RestMethod -Method Get -Headers $headers -Uri "https://api.stripe.com/v1/$Path"
    } catch {
        # -Soft means this call is a nicety, not the job. Customer names are the
        # only such call here: without Customers Read the table still shows every
        # rate and date, just keyed by customer id instead of email.
        if ($Soft) { return $null }
        $detail = $_.ErrorDetails.Message
        if ($detail -and $detail -match '"code":\s*"more_permissions_required"') {
            $needed = if ($detail -match 'Enabling ([A-Za-z ]+) \(') { $Matches[1] } else { 'another' }
            Write-Host ''
            Write-Host "Your Stripe key is missing the $needed permission." -ForegroundColor Yellow
            Write-Host 'Add it at https://dashboard.stripe.com/apikeys' -ForegroundColor Yellow
            exit 1
        }
        throw
    }
}

function From-Unix {
    param($seconds)
    if (-not $seconds) { return $null }
    return ([DateTimeOffset]::FromUnixTimeSeconds([int64]$seconds)).LocalDateTime
}

$withNames = Invoke-Stripe 'subscriptions?status=active&limit=100&expand[]=data.customer' -Soft
if ($withNames) {
    $subs = $withNames.data
} else {
    Write-Host 'Customer names need Customers Read on the key. Showing customer ids instead.' -ForegroundColor DarkGray
    $subs = (Invoke-Stripe 'subscriptions?status=active&limit=100').data
}

if (-not $subs -or @($subs).Count -eq 0) {
    Write-Host ''
    Write-Host 'No active subscriptions.' -ForegroundColor Yellow
    return
}

$today = Get-Date
$rows = foreach ($s in $subs) {

    $item     = $s.items.data[0]
    $price    = $item.price
    $standing = [math]::Round(($price.unit_amount | ForEach-Object { $_ }) / 100, 2)
    $interval = $price.recurring.interval

    # Stripe moved from a single `discount` to a `discounts` array. Read either.
    $discount = if ($s.discounts -and @($s.discounts).Count -gt 0) {
        $s.discounts[0]
    } elseif ($s.discount) { $s.discount } else { $null }

    $off = 0
    if ($discount -and $discount.coupon) {
        if ($discount.coupon.amount_off)  { $off = $discount.coupon.amount_off / 100 }
        elseif ($discount.coupon.percent_off) { $off = $standing * $discount.coupon.percent_off / 100 }
    }

    $paysNow = [math]::Round($standing - $off, 2)
    $endsOn  = if ($discount) { From-Unix $discount.end } else { $null }

    $email = if ($s.customer -is [string]) { $s.customer } else { $s.customer.email }

    # Recent Stripe API versions moved current_period_end onto the subscription
    # item. Read whichever one this account's version returns.
    $periodEnd = if ($s.current_period_end) { $s.current_period_end }
                 elseif ($item.current_period_end) { $item.current_period_end }
                 else { $null }
    $nextBill = From-Unix $periodEnd

    [pscustomobject]@{
        Member    = if ($email) { $email } else { '(no email on file)' }
        PaysNow   = "`$$paysNow / $interval"
        RateEnds  = if ($endsOn) { $endsOn.ToString('yyyy-MM-dd') } else { 'no discount' }
        ThenPays  = if ($endsOn) { "`$$standing / $interval" } else { '' }
        NextBill  = if ($nextBill) { $nextBill.ToString('yyyy-MM-dd') } else { 'unknown' }
        DaysLeft  = if ($endsOn) { [int]($endsOn - $today).TotalDays } else { $null }
    }
}

Write-Host ''
$rows | Select-Object Member, PaysNow, RateEnds, ThenPays, NextBill | Format-Table -AutoSize

$soon = @($rows | Where-Object { $null -ne $_.DaysLeft -and $_.DaysLeft -le $NoticeDays -and $_.DaysLeft -ge 0 })
if ($soon.Count -gt 0) {
    Write-Host ''
    Write-Host "Founders rate ends within $NoticeDays days for these members. Email them:" -ForegroundColor Yellow
    foreach ($r in $soon) {
        Write-Host "  $($r.Member)   ends $($r.RateEnds), then $($r.ThenPays)"
    }
} else {
    Write-Host "No founders rate ends within $NoticeDays days." -ForegroundColor DarkGray
}

Write-Host ''
Write-Host 'Nothing was changed. This script only reads.' -ForegroundColor DarkGray
