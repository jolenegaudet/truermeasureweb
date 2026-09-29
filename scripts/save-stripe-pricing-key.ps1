<#
.SYNOPSIS
  Stores the Stripe pricing key in the machine's secrets folder, outside the
  repository, and checks that it can reach everything the pricing scripts need.

.DESCRIPTION
  Paste the key once, here, and it is saved where the other credentials already
  live. After that the pricing scripts find it on their own and nobody has to
  paste anything again.

  The value is read from a hidden prompt, written to one file outside the git
  working tree, and never printed, logged, echoed or committed.

  It is saved as STRIPE_PRICING_KEY. The existing STRIPE_RESTRICTED_KEY and
  STRIPE_PAYMENT_LINK_KEY entries are left exactly as they are.

.PARAMETER Check
  Re-test the key already saved, and save nothing.

.NOTES
  Where it goes:
    $env:TRUERMEASURE_SECRETS_DIR  if set
    otherwise  <workspace>\.secrets\azure.local.env

  The workspace is the folder containing this repository, never the repository
  itself. A credential inside the repo can be destroyed by `git clean -dx`,
  carried off in a zip, or committed by accident, which is why it goes here.
#>

[CmdletBinding()]
param([switch]$Check)

$ErrorActionPreference = 'Stop'

$KeyName = 'STRIPE_PRICING_KEY'

# --- where the secrets live --------------------------------------------------

$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) { throw 'Run this from inside the repository.' }
$repoRoot = $repoRoot -replace '/', '\'

$secretsHome = if ($env:TRUERMEASURE_SECRETS_DIR) {
    $env:TRUERMEASURE_SECRETS_DIR
} else {
    Join-Path (Split-Path $repoRoot -Parent) '.secrets'
}

$secretsFile = Join-Path $secretsHome 'azure.local.env'

# Refuse to write a credential inside the git working tree, whatever the
# override says. This is the one check that must not be bypassable.
$resolvedSecrets = [IO.Path]::GetFullPath($secretsHome)
$resolvedRepo    = [IO.Path]::GetFullPath($repoRoot)
if ($resolvedSecrets.StartsWith($resolvedRepo, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to write a credential inside the repository ($resolvedSecrets). Secrets belong outside the working tree."
}

if (-not (Test-Path $secretsHome)) {
    throw "Secrets folder not found: $secretsHome"
}

Write-Host ''
Write-Host "Secrets file : $secretsFile" -ForegroundColor DarkGray
Write-Host "Key name     : $KeyName" -ForegroundColor DarkGray

# --- get the key -------------------------------------------------------------

function Get-SavedKey {
    if (-not (Test-Path $secretsFile)) { return $null }
    $line = Get-Content $secretsFile | Where-Object { $_ -match "^$KeyName=" } | Select-Object -First 1
    if (-not $line) { return $null }
    return ($line -replace "^$KeyName=", '').Trim().Trim('"').Trim("'")
}

if ($Check) {
    $key = Get-SavedKey
    if (-not $key) { throw "$KeyName is not saved yet. Run this script without -Check first." }
    Write-Host ''
    Write-Host 'Testing the key already saved.' -ForegroundColor DarkGray
} else {
    Write-Host ''
    Write-Host 'Paste the restricted key you just created in Stripe.' -ForegroundColor Cyan
    Write-Host 'Nothing will appear as you paste. Right-click to paste, then press Enter.' -ForegroundColor DarkGray
    Write-Host ''
    $secure = Read-Host 'Key' -AsSecureString
    $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )

    if (-not $key) { throw 'Nothing was pasted.' }
    $key = $key.Trim()

    if (-not ($key.StartsWith('rk_') -or $key.StartsWith('sk_'))) {
        throw 'That does not look like a Stripe key. It should start with rk_ (restricted) or sk_ (secret).'
    }
    if ($key -match '_test_') {
        throw 'That is a test-mode key. The pricing switch happens in live mode.'
    }
}

$headers = @{ Authorization = "Bearer $key" }

# --- can it reach what the pricing scripts need? -----------------------------

# Required: without any one of these the pricing switch cannot happen at all.
# Optional: promotion codes are only touched when FOUNDING40 is retired, which
# is the last step and a separate decision, so a key missing it is still worth
# saving rather than sending someone back to the Dashboard mid-task.
$checks = @(
    @{ Name = 'Products';      Path = 'products?limit=1';        Required = $true }
    @{ Name = 'Prices';        Path = 'prices?limit=1';          Required = $true }
    @{ Name = 'Payment Links'; Path = 'payment_links?limit=1';   Required = $true }
    @{ Name = 'Subscriptions'; Path = 'subscriptions?limit=1';   Required = $true }
    @{ Name = 'Coupons';       Path = 'promotion_codes?limit=1'; Required = $false }
)

Write-Host ''
$missingRequired = @()
$missingOptional = @()
foreach ($c in $checks) {
    try {
        $null = Invoke-RestMethod -Method Get -Headers $headers -Uri "https://api.stripe.com/v1/$($c.Path)"
        Write-Host ("  {0,-14} reachable" -f $c.Name) -ForegroundColor Green
    } catch {
        if ($c.Required) {
            $missingRequired += $c.Name
            Write-Host ("  {0,-14} REFUSED  (needed)" -f $c.Name) -ForegroundColor Red
        } else {
            $missingOptional += $c.Name
            Write-Host ("  {0,-14} refused  (only needed to retire FOUNDING40)" -f $c.Name) -ForegroundColor Yellow
        }
    }
}

if ($missingRequired.Count -gt 0) {
    Write-Host ''
    Write-Host "This key cannot reach: $($missingRequired -join ', ')" -ForegroundColor Yellow
    Write-Host 'Edit its permissions at https://dashboard.stripe.com/apikeys and run this again.' -ForegroundColor Yellow
    Write-Host 'Nothing was saved.' -ForegroundColor Yellow
    exit 1
}

Write-Host ''
Write-Host 'Everything the price switch needs is reachable. Write access is only proven' -ForegroundColor DarkGray
Write-Host 'by the first real write, which stops cleanly and names any missing permission.' -ForegroundColor DarkGray

if ($missingOptional.Count -gt 0) {
    Write-Host ''
    Write-Host 'Promotion codes are not reachable with this key.' -ForegroundColor Yellow
    Write-Host 'Everything up to and including going live still works. The one thing that' -ForegroundColor Yellow
    Write-Host 'will not is retiring FOUNDING40 at the end, which needs Coupons on the key.' -ForegroundColor Yellow
    Write-Host 'In Stripe, look for a Coupons row and also a Promotion codes row: some' -ForegroundColor Yellow
    Write-Host 'accounts list them separately. Add it later and run this script again.' -ForegroundColor Yellow
}

if ($Check) {
    Write-Host ''
    Write-Host 'Key works. Nothing was changed.' -ForegroundColor Green
    return
}

# --- save --------------------------------------------------------------------

$existing = if (Test-Path $secretsFile) { Get-Content $secretsFile } else { @() }
$without  = $existing | Where-Object { $_ -notmatch "^$KeyName=" }
$replaced = $existing.Count -ne $without.Count

Set-Content -Path $secretsFile -Value (@($without) + "$KeyName=$key") -Encoding utf8

Write-Host ''
if ($replaced) {
    Write-Host "$KeyName replaced in $secretsFile" -ForegroundColor Green
} else {
    Write-Host "$KeyName saved to $secretsFile" -ForegroundColor Green
}
Write-Host 'The value was never printed and is not in this window.' -ForegroundColor DarkGray
