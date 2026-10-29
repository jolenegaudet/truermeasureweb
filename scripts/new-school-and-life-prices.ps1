<#
.SYNOPSIS
  Creates the School & Life monthly and yearly prices in Stripe, in three
  currencies, so the website and the checkout cannot disagree.

.DESCRIPTION
  Her figures, 29 October 2026: CAD $47 plus taxes, USD $47 plus taxes, EUR 47
  VAT included, monthly or yearly with 10% off the yearly.

  TWO PRICES, NOT SIX. A Stripe price carries other currencies inside it
  (`currency_options`), each with its own amount and its own tax behaviour.
  That is how the Founding Families price already works: one id, CA$/US$ before
  tax and the euro amount VAT-inclusive. It also matches the app, which keeps
  exactly two ids, TM_STRIPE_PRICE_MONTHLY and TM_STRIPE_PRICE_YEARLY
  (server/billing.js).

      monthly   CA$47      US$47      EUR47      base currency CAD
      yearly    CA$507.60  US$507.60  EUR507.60  = 47 x 12 less 10%

  TEST MODE BY DEFAULT. It refuses a live key unless you pass -Live, and -Live
  asks you to type the word LIVE. Her standing instruction is that live
  payments stay off until she turns them on.

  A PRICE IS IMMUTABLE. Neither the amount nor the tax behaviour can be edited
  afterwards: a wrong one is archived and replaced, never corrected. So run
  -DryRun first. It prints every amount in every currency and creates nothing.

  IDEMPOTENT. Each price is given a lookup key
  (truermeasure_school_and_life_monthly / _yearly). If a price with that key
  already exists the script reports it and creates nothing, so running twice
  does not litter the account.

  WHAT IT NEVER TOUCHES:
    - the Founding Families price, its coupon or its payment link
    - any existing subscription
    - the live-payments switch (TM_ALLOW_LIVE_PAYMENTS), which is hers to give

.PARAMETER DryRun
  Prints the plan and creates nothing. Run this first.

.PARAMETER Live
  Use a live key instead of a test key. Asks for typed confirmation.

.PARAMETER MonthlyAmount
  The monthly figure, the same number in all three currencies. Defaults to 47.

.PARAMETER YearlyDiscount
  Taken off twelve months to give the yearly amount. Defaults to 0.10.

.PARAMETER YearlyAmount
  Overrides the computed yearly figure, if you want a rounder number than
  507.60. Must match content/app-plans.ts, or the page and the checkout differ.

.PARAMETER WriteEnv
  Appends the two price ids to launch.env in the workspace secrets folder,
  where the app's deploy script reads them. Ids are not secrets; the file is
  simply where they belong.

.EXAMPLE
  .\new-school-and-life-prices.ps1 -DryRun
  .\new-school-and-life-prices.ps1
  .\new-school-and-life-prices.ps1 -WriteEnv

.NOTES
  The key is read, in order, from the workspace secrets folder outside this
  repository, then STRIPE_SECRET_KEY in the environment, then a hidden prompt.
  It is never printed, never logged and never written into the repository.

    test  <workspace>\.secrets\stripe-test.env   STRIPE_SECRET_KEY
    live  <workspace>\.secrets\azure.local.env   STRIPE_PRICING_KEY

  Override the folder with TRUERMEASURE_SECRETS_DIR.

  The key needs these permissions (https://dashboard.stripe.com/apikeys):

      Products       Write
      Prices         Write
      Subscriptions  Read     (so the script can confirm it disturbed nothing)
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Live,
    [ValidateRange(1, 10000)]
    [double]$MonthlyAmount = 47,
    [ValidateRange(0, 0.9)]
    [double]$YearlyDiscount = 0.10,
    [ValidateRange(0, 100000)]
    [double]$YearlyAmount = 0,
    [string]$ProductName = 'Truer Measure - School & Life',
    [switch]$WriteEnv,
    # Skips the typed YES, for when the person asking has already said to go
    # ahead. It does NOT skip the typed LIVE that -Live asks for: creating
    # prices customers can be charged at stays a deliberate act at the keyboard.
    [switch]$Yes
)

$ErrorActionPreference = 'Stop'

# --- the amounts -------------------------------------------------------------
#
# Computed here so the 10% rule lives in one place. Minor units via Round on
# the cents, never on a float: 507.6 * 100 is not exactly 50760 in binary.

if ($YearlyAmount -le 0) {
    $YearlyAmount = [math]::Round($MonthlyAmount * 12 * (1 - $YearlyDiscount), 2)
}
$monthlyCents = [int][math]::Round($MonthlyAmount * 100)
$yearlyCents  = [int][math]::Round($YearlyAmount * 100)
$monthlyEquiv = [math]::Round($YearlyAmount / 12, 2)
$saving       = [math]::Round($MonthlyAmount * 12 - $YearlyAmount, 2)

# Two decimals only when there are cents, so this prints 47 and 507.60 exactly
# as the website does (the money() helper in content/app-plans.ts). PowerShell
# would otherwise print 507.6, and a figure that reads differently here than on
# the page is the one thing this script exists to prevent.
function Fmt([double]$n) {
    if ($n -eq [math]::Floor($n)) { return [string][int]$n }
    return $n.ToString('0.00', [Globalization.CultureInfo]::InvariantCulture)
}

# CAD leads, as the website does. Her wording: "CAD $47 plus taxes, USD $47
# plus taxes and Euros 47 Euros VAT included."
$BASE = 'cad'
$TAX  = @{ cad = 'exclusive'; usd = 'exclusive'; eur = 'inclusive' }
$LOOKUP_MONTHLY = 'truermeasure_school_and_life_monthly'
$LOOKUP_YEARLY  = 'truermeasure_school_and_life_yearly'

# --- credentials -------------------------------------------------------------

function Get-StripeKey {
    param([bool]$WantLive)

    $repoRoot = (git rev-parse --show-toplevel 2>$null)
    if ($repoRoot) {
        $repoRoot = [IO.Path]::GetFullPath($repoRoot)
        $secretsHome = if ($env:TRUERMEASURE_SECRETS_DIR) {
            $env:TRUERMEASURE_SECRETS_DIR
        } else {
            Join-Path (Split-Path $repoRoot -Parent) '.secrets'
        }
        $file, $name = if ($WantLive) { 'azure.local.env', 'STRIPE_PRICING_KEY' }
                       else           { 'stripe-test.env', 'STRIPE_SECRET_KEY' }
        $secretsFile = Join-Path $secretsHome $file
        if (Test-Path $secretsFile) {
            $line = Get-Content $secretsFile |
                    Where-Object { $_ -match "^\s*$name\s*=" } |
                    Select-Object -First 1
            if ($line) {
                Write-Host "Using $name from $file in the secrets folder."
                return ($line -replace "^\s*$name\s*=", '').Trim().Trim('"').Trim("'")
            }
        }
        Write-Host "No $name found in $file." -ForegroundColor DarkGray
    }

    if ($env:STRIPE_SECRET_KEY) {
        Write-Host 'Using STRIPE_SECRET_KEY from the environment.'
        return $env:STRIPE_SECRET_KEY
    }

    Write-Host ''
    Write-Host ('Paste a {0} Stripe key, or press Enter to stop. It is not saved or shown.' -f
        $(if ($WantLive) { 'LIVE' } else { 'TEST' })) -ForegroundColor DarkGray
    $secure = Read-Host 'Key' -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

if ($Live) {
    Write-Host ''
    Write-Host 'LIVE MODE. This creates prices real customers can be charged at.' -ForegroundColor Yellow
    Write-Host 'Her standing instruction is that live payments stay off until she turns them on,' -ForegroundColor Yellow
    Write-Host 'and the app still refuses a live key without TM_ALLOW_LIVE_PAYMENTS=1.' -ForegroundColor Yellow
    Write-Host ''
    if ((Read-Host 'Type LIVE to continue') -cne 'LIVE') {
        Write-Host 'Stopped. Nothing was created.' -ForegroundColor Green
        return
    }
}

$key = Get-StripeKey -WantLive:$Live.IsPresent
if (-not $key) { throw 'No key provided. Nothing was created.' }
if (-not ($key.StartsWith('sk_') -or $key.StartsWith('rk_'))) {
    throw 'That does not look like a Stripe key. It should start with sk_ or rk_.'
}
$isTestKey = $key.StartsWith('sk_test_') -or $key.StartsWith('rk_test_')
if ($Live -and $isTestKey) {
    throw '-Live was given but that is a test-mode key. Nothing was created.'
}
if (-not $Live -and -not $isTestKey) {
    throw 'That is a LIVE key and -Live was not given. Nothing was created. Pass -Live deliberately, or put a test key in stripe-test.env.'
}

$mode = if ($isTestKey) { 'TEST' } else { 'LIVE' }

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
            Write-Host 'Add it, or make a new restricted key, at https://dashboard.stripe.com/apikeys' -ForegroundColor Yellow
            Write-Host 'Nothing was changed.' -ForegroundColor Green
            exit 1
        }
        throw
    }
}

# --- what is there now -------------------------------------------------------

Write-Host ''
Write-Host "Reading the account ($mode mode) before changing anything." -ForegroundColor DarkGray

$subsBefore = @((Invoke-Stripe Get 'subscriptions?status=active&limit=100').data).Count
Write-Host "  active subscriptions right now: $subsBefore"

$found = @{}
foreach ($lk in @($LOOKUP_MONTHLY, $LOOKUP_YEARLY)) {
    $hit = (Invoke-Stripe Get "prices?limit=1&active=true&lookup_keys[]=$lk").data | Select-Object -First 1
    if ($hit) { $found[$lk] = $hit }
}

if ($found.Count -eq 2) {
    Write-Host ''
    Write-Host 'Both prices already exist. Nothing created.' -ForegroundColor Yellow
    Write-Host "  TM_STRIPE_PRICE_MONTHLY=$($found[$LOOKUP_MONTHLY].id)"
    Write-Host "  TM_STRIPE_PRICE_YEARLY=$($found[$LOOKUP_YEARLY].id)"
    Write-Host ''
    Write-Host 'A price cannot be edited. If an amount is wrong, archive it in the Dashboard' -ForegroundColor DarkGray
    Write-Host 'and run this again.' -ForegroundColor DarkGray
    return
}

# --- plan --------------------------------------------------------------------

Write-Host ''
Write-Host "Plan ($mode mode)" -ForegroundColor Cyan
Write-Host "  product            : $ProductName (reused if it exists)"
Write-Host ''
$m = Fmt $MonthlyAmount
$y = Fmt $YearlyAmount
Write-Host ("  monthly  CA`$$m / US`$$m / EUR$m")
Write-Host ("  yearly   CA`$$y / US`$$y / EUR$y" +
            "   ($([math]::Round($YearlyDiscount * 100))% off; $(Fmt $monthlyEquiv) a month, saves $(Fmt $saving))")
Write-Host ''
Write-Host "  base currency      : $($BASE.ToUpper())"
Write-Host "  tax behaviour      : CAD $($TAX.cad), USD $($TAX.usd), EUR $($TAX.eur)"
Write-Host ''
Write-Host '  These amounts must match content/app-plans.ts, or the page quotes one' -ForegroundColor DarkGray
Write-Host '  figure and the checkout charges another. The app enforces the same rule:' -ForegroundColor DarkGray
Write-Host '  "a checkout is never opened for a price the parent has not been shown."' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  NOT touched: Founding Families, its coupon, its link, any subscription.'

foreach ($lk in @($LOOKUP_MONTHLY, $LOOKUP_YEARLY)) {
    if ($found.ContainsKey($lk)) {
        Write-Host ''
        Write-Host "  $lk already exists as $($found[$lk].id) and will be left alone." -ForegroundColor Yellow
    }
}

if ($DryRun) {
    Write-Host ''
    Write-Host 'Dry run. Nothing was created.' -ForegroundColor Green
    return
}

Write-Host ''
if ($Yes) {
    Write-Host "Creating these in $mode mode (-Yes given)." -ForegroundColor Cyan
} elseif ((Read-Host "Create these in $mode mode? Type YES to proceed") -cne 'YES') {
    Write-Host 'Stopped. Nothing was created.' -ForegroundColor Yellow
    return
}

# --- create ------------------------------------------------------------------

$product = (Invoke-Stripe Get 'products?limit=100&active=true').data |
           Where-Object { $_.name -eq $ProductName } | Select-Object -First 1
if ($product) {
    Write-Host "Reusing product $($product.id)"
} else {
    $product = Invoke-Stripe Post 'products' @{
        name        = $ProductName
        description = 'The paid plan: report cards and what life adds to them.'
    }
    Write-Host "Created product $($product.id)"
}

function New-TmPrice {
    param([string]$Interval, [int]$Cents, [string]$LookupKey, [string]$Nickname)

    $body = @{
        product                           = $product.id
        currency                          = $BASE
        unit_amount                       = $Cents
        tax_behavior                      = $TAX[$BASE]
        'recurring[interval]'             = $Interval
        lookup_key                        = $LookupKey
        nickname                          = $Nickname
        'metadata[plan]'                  = 'school_and_life'
        'metadata[set_by]'                = 'new-school-and-life-prices.ps1'
    }
    # The other two currencies, each with its own amount and its own tax
    # behaviour. Checkout shows the local one by itself as long as the app does
    # not force a currency on the session.
    foreach ($cur in @('usd', 'eur')) {
        $body["currency_options[$cur][unit_amount]"]  = $Cents
        $body["currency_options[$cur][tax_behavior]"] = $TAX[$cur]
    }
    return Invoke-Stripe Post 'prices' $body
}

$created = @{}

if (-not $found.ContainsKey($LOOKUP_MONTHLY)) {
    $p = New-TmPrice -Interval 'month' -Cents $monthlyCents -LookupKey $LOOKUP_MONTHLY `
                     -Nickname "School & Life $(Fmt $MonthlyAmount) monthly (CAD/USD/EUR)"
    $created['TM_STRIPE_PRICE_MONTHLY'] = $p.id
    Write-Host "Created monthly price $($p.id)"
} else {
    $created['TM_STRIPE_PRICE_MONTHLY'] = $found[$LOOKUP_MONTHLY].id
}

if (-not $found.ContainsKey($LOOKUP_YEARLY)) {
    $p = New-TmPrice -Interval 'year' -Cents $yearlyCents -LookupKey $LOOKUP_YEARLY `
                     -Nickname "School & Life $(Fmt $YearlyAmount) yearly (CAD/USD/EUR)"
    $created['TM_STRIPE_PRICE_YEARLY'] = $p.id
    Write-Host "Created yearly price  $($p.id)"
} else {
    $created['TM_STRIPE_PRICE_YEARLY'] = $found[$LOOKUP_YEARLY].id
}

# --- read them back ---------------------------------------------------------
#
# Confirming from the account rather than from what was sent: a tax behaviour
# that silently did not take is the failure that would reach a customer.

Write-Host ''
Write-Host 'Reading the prices back from Stripe' -ForegroundColor Cyan
foreach ($pair in $created.GetEnumerator()) {
    # expand[]=currency_options, or Stripe leaves it out of the response and the
    # other two currencies look missing when they are there.
    $p = Invoke-Stripe Get "prices/$($pair.Value)?expand[]=currency_options"
    $line = "  $($p.id)  $($p.recurring.interval)ly  base $($p.currency.ToUpper()) " +
            "$($p.unit_amount / 100) $($p.tax_behavior)"
    $missing = @()
    foreach ($cur in @('usd', 'eur')) {
        $opt = if ($p.currency_options) { $p.currency_options.$cur } else { $null }
        if ($opt) {
            $line += "  |  $($cur.ToUpper()) $(Fmt ($opt.unit_amount / 100)) $($opt.tax_behavior)"
        } else {
            $line += "  |  $($cur.ToUpper()) MISSING"
            $missing += $cur.ToUpper()
        }
    }
    Write-Host $line -ForegroundColor $(if ($missing.Count) { 'Red' } else { 'Gray' })
    if ($missing.Count) {
        Write-Host ("      $($missing -join ' and ') did not take. The price cannot be edited: " +
            'archive it in the Dashboard and run this again.') -ForegroundColor Red
    }
}

$subsAfter = @((Invoke-Stripe Get 'subscriptions?status=active&limit=100').data).Count
Write-Host ''
if ($subsAfter -eq $subsBefore) {
    Write-Host "Active subscriptions still $subsAfter. Nothing existing was touched." -ForegroundColor Green
} else {
    Write-Host "Active subscriptions went from $subsBefore to $subsAfter. Check this." -ForegroundColor Red
}

# --- where the ids go -------------------------------------------------------

Write-Host ''
Write-Host "The app reads these two from $(if ($mode -eq 'TEST') { 'stripe-test.env' } else { 'launch.env' }) in the secrets folder:" -ForegroundColor Cyan
Write-Host ''
foreach ($pair in $created.GetEnumerator()) { Write-Host "  $($pair.Key)=$($pair.Value)" }

if ($WriteEnv) {
    $repoRoot = [IO.Path]::GetFullPath((git rev-parse --show-toplevel))
    $secretsHome = if ($env:TRUERMEASURE_SECRETS_DIR) {
        $env:TRUERMEASURE_SECRETS_DIR
    } else {
        Join-Path (Split-Path $repoRoot -Parent) '.secrets'
    }
    if (-not (Test-Path $secretsHome)) { throw "Secrets folder not found: $secretsHome" }
    # Test ids never go into launch.env. That is the file the production deploy
    # script reads, and a test price id sitting in it would be picked up by a
    # live deployment later, where it cannot work. Test mode writes to the test
    # file instead.
    $envName = if ($mode -eq 'TEST') { 'stripe-test.env' } else { 'launch.env' }
    $envFile = Join-Path $secretsHome $envName
    if (-not (Test-Path $envFile)) { New-Item -ItemType File -Path $envFile | Out-Null }
    # Every assignment stays wrapped in @(): a one-line file filtered by
    # Where-Object comes back as a bare string, and += on a string concatenates
    # instead of appending, which once joined a key and two price ids onto one
    # line and broke the file.
    $lines = @(Get-Content $envFile -ErrorAction SilentlyContinue)
    foreach ($pair in $created.GetEnumerator()) {
        $pattern = '^\s*' + [regex]::Escape($pair.Key) + '\s*='
        $lines = @($lines | Where-Object { $_ -notmatch $pattern })
        $lines = @($lines) + ($pair.Key + '=' + $pair.Value)
    }
    $lines = @($lines | Where-Object { $null -ne $_ -and $_ -ne '' })
    Set-Content -Path $envFile -Value $lines -Encoding UTF8
    Write-Host ''
    Write-Host "Written to $envFile (outside every repository)." -ForegroundColor Green
}

Write-Host ''
Write-Host 'STILL TO DO, and none of it is this script' -ForegroundColor Yellow
Write-Host '  1. Stripe Tax must be on, or the inclusive euro amount is not carved out.'
Write-Host '  2. The app picks the currency at checkout, not the website. Checkout localises'
Write-Host '     by the customer''s own location while the page has a selector, so a parent'
Write-Host '     who chooses USD in Canada would still be charged CAD. Closing that gap is a'
Write-Host '     change in server/billing.js: pass the chosen currency on the session.'
Write-Host '  3. Live payments stay off until TM_ALLOW_LIVE_PAYMENTS=1, which is hers to give.'
if ($mode -eq 'TEST') {
    Write-Host '  4. These are TEST prices. Run again with -Live when she says so.'
}
