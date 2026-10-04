<#
.SYNOPSIS
  Prepares the Kit account for the "Be the first to know" signup, and checks
  that an API key works before it goes anywhere near Netlify.

.DESCRIPTION
  The signup on truermeasure.com posts to netlify/functions/kit-subscribe.ts,
  which adds the person to Kit and tags them. That function needs one thing from
  the Kit account: an API key, set as KIT_API_KEY in Netlify.

  This script does everything else, so there is nothing to click in Kit:

    1. Checks the key is valid and says which Kit account it belongs to.
    2. Creates the tag  Truer Measure - First to Know  if it is missing.
    3. Creates the two custom fields that hold the consent record,
       TM signup source and TM consent, if they are missing.
    4. Prints the tag id.

  Safe to run more than once. It only ever creates what is missing, and it
  never edits or deletes a tag, a field or a subscriber.

  The function creates all three of these by itself on the first signup, so
  running this is not strictly required. It is here so the account is in a known
  state, and so a bad key is found now rather than by a parent.

.PARAMETER ApiKey
  Your Kit v4 API key. If you leave it out, the script reads KIT_API_KEY from
  the environment, then from the secrets file, and otherwise prompts for it.

  Get one at  https://app.kit.com/account_settings/developer_settings
  under "V4 Keys", click "Add a new key". Kit shows the key once and never
  again, so paste it straight into this script.

.PARAMETER SaveToSecrets
  Also writes KIT_API_KEY into the secrets file outside the repository, so the
  key is on this machine for later runs. Never writes it inside the repo.

.PARAMETER DryRun
  Reports what exists and what would be created, and changes nothing.

.EXAMPLE
  .\setup-kit.ps1 -DryRun
  .\setup-kit.ps1
  .\setup-kit.ps1 -SaveToSecrets

.NOTES
  The key is never printed, never logged, and never written inside this
  repository. With -SaveToSecrets it goes to the secrets folder that sits beside
  the repo, which is the only place credentials live on this machine.

  Override that location with the TRUERMEASURE_SECRETS_FILE environment
  variable if the workspace ever moves.
#>

[CmdletBinding()]
param(
    [string]$ApiKey,
    [switch]$SaveToSecrets,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# These three names must match content/first-to-know.ts and
# netlify/functions/kit-subscribe.ts. The tag name carries an en dash, the same
# character Jolene used when she named it.
$TagName      = 'Truer Measure ' + [char]0x2013 + ' First to Know'
$FieldSource  = 'TM signup source'
$FieldConsent = 'TM consent'

$Kit = 'https://api.kit.com/v4'

# --- where credentials live: outside the repo, never in it -------------------

$SecretsFile = if ($env:TRUERMEASURE_SECRETS_FILE) {
    $env:TRUERMEASURE_SECRETS_FILE
} else {
    Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.secrets\azure.local.env'
}

function Get-KeyFromSecretsFile {
    if (-not (Test-Path $SecretsFile)) { return $null }
    foreach ($line in Get-Content -LiteralPath $SecretsFile) {
        if ($line -match '^\s*KIT_API_KEY\s*=\s*(.+?)\s*$') { return $Matches[1].Trim('"').Trim("'") }
    }
    return $null
}

if (-not $ApiKey) { $ApiKey = $env:KIT_API_KEY }
if (-not $ApiKey) { $ApiKey = Get-KeyFromSecretsFile }
if (-not $ApiKey) {
    Write-Host ''
    Write-Host 'Kit API key needed.' -ForegroundColor Yellow
    Write-Host 'Get one at https://app.kit.com/account_settings/developer_settings' -ForegroundColor DarkGray
    Write-Host 'Under "V4 Keys", click "Add a new key". Kit shows it once.' -ForegroundColor DarkGray
    $secure = Read-Host 'Paste your Kit API key' -AsSecureString
    $ApiKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}
if (-not $ApiKey) { throw 'No API key given. Nothing done.' }

$Headers = @{
    'X-Kit-Api-Key' = $ApiKey
    'Accept'        = 'application/json'
}

function Invoke-Kit {
    param([string]$Method, [string]$Path, $Body)
    $req = @{
        Method      = $Method
        Uri         = "$Kit$Path"
        Headers     = $Headers
        ContentType = 'application/json'
    }
    if ($Body) { $req.Body = ($Body | ConvertTo-Json -Compress) }
    return Invoke-RestMethod @req
}

Write-Host ''
Write-Host '=== Kit setup for "Be the first to know" ===' -ForegroundColor Cyan
if ($DryRun) { Write-Host 'DRY RUN. Nothing will be created.' -ForegroundColor Yellow }
Write-Host ''

# --- 1. does the key work ----------------------------------------------------

Write-Host '1. Checking the API key' -ForegroundColor White
try {
    $account = Invoke-Kit -Method GET -Path '/account'
    $who = if ($account.account.name) { $account.account.name } else { $account.account.primary_email_address }
    Write-Host "   Key works. Kit account: $who" -ForegroundColor Green
} catch {
    Write-Host '   The key was rejected by Kit.' -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor DarkGray
    Write-Host '   Check it is a key from the "V4 Keys" section, not an older one.' -ForegroundColor Yellow
    throw 'Stopping: the key is not valid, so nothing was changed.'
}

# --- 2. the tag --------------------------------------------------------------

Write-Host ''
Write-Host "2. Tag: $TagName" -ForegroundColor White
$tag = $null
$after = $null
do {
    $path = '/tags?per_page=500'
    if ($after) { $path += "&after=$after" }
    $page = Invoke-Kit -Method GET -Path $path
    $tag = $page.tags | Where-Object { $_.name.Trim().ToLower() -eq $TagName.ToLower() } | Select-Object -First 1
    $after = if ($page.pagination.has_next_page) { $page.pagination.end_cursor } else { $null }
} while (-not $tag -and $after)

if ($tag) {
    Write-Host "   Already there. id $($tag.id)" -ForegroundColor Green
} elseif ($DryRun) {
    Write-Host '   Missing. Would create it.' -ForegroundColor Yellow
} else {
    $tag = (Invoke-Kit -Method POST -Path '/tags' -Body @{ name = $TagName }).tag
    Write-Host "   Created. id $($tag.id)" -ForegroundColor Green
}

# --- 3. the consent fields ---------------------------------------------------

Write-Host ''
Write-Host '3. Custom fields that hold the consent record' -ForegroundColor White
$fields = (Invoke-Kit -Method GET -Path '/custom_fields?per_page=500').custom_fields
foreach ($label in @($FieldSource, $FieldConsent)) {
    $hit = $fields | Where-Object { $_.label.Trim().ToLower() -eq $label.ToLower() } | Select-Object -First 1
    if ($hit) {
        Write-Host "   $label - already there (key: $($hit.key))" -ForegroundColor Green
    } elseif ($DryRun) {
        Write-Host "   $label - missing. Would create it." -ForegroundColor Yellow
    } else {
        $made = (Invoke-Kit -Method POST -Path '/custom_fields' -Body @{ label = $label }).custom_field
        Write-Host "   $label - created (key: $($made.key))" -ForegroundColor Green
    }
}

# --- 4. optionally keep the key on this machine, outside the repo ------------

if ($SaveToSecrets -and -not $DryRun) {
    Write-Host ''
    Write-Host '4. Saving the key outside the repository' -ForegroundColor White
    $dir = Split-Path $SecretsFile -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $existing = if (Test-Path $SecretsFile) { Get-Content -LiteralPath $SecretsFile } else { @() }
    if ($existing -match '^\s*KIT_API_KEY\s*=') {
        Write-Host '   KIT_API_KEY is already in the secrets file. Left as it was.' -ForegroundColor Green
    } else {
        Add-Content -LiteralPath $SecretsFile -Value "KIT_API_KEY=$ApiKey"
        Write-Host "   Added KIT_API_KEY to $SecretsFile" -ForegroundColor Green
    }
    Write-Host '   (That folder sits beside the repo, never inside it.)' -ForegroundColor DarkGray
}

# --- what is left for a human ------------------------------------------------

Write-Host ''
Write-Host '=== One thing left, and it needs your Netlify login ===' -ForegroundColor Cyan
Write-Host ''
Write-Host '  1. Open  https://app.netlify.com' -ForegroundColor White
Write-Host '  2. Pick the truermeasure site' -ForegroundColor White
Write-Host '  3. Site configuration  >  Environment variables' -ForegroundColor White
Write-Host '  4. Add a variable:' -ForegroundColor White
Write-Host '        Key    KIT_API_KEY' -ForegroundColor Green
Write-Host '        Value  the same key you just used here' -ForegroundColor Green
Write-Host '        Scope  Functions (Builds too is fine)' -ForegroundColor Green
Write-Host '  5. Save, then redeploy so the function picks it up.' -ForegroundColor White
Write-Host ''
Write-Host '  Until that variable is set, the form answers "Something went wrong"' -ForegroundColor Yellow
Write-Host '  and nobody is added to Kit. Nothing else on the site is affected.' -ForegroundColor Yellow
Write-Host ''
if ($tag -and $tag.id) {
    Write-Host "  Optional: set KIT_TAG_ID = $($tag.id) as well, to skip a lookup." -ForegroundColor DarkGray
    Write-Host ''
}
Write-Host '  New subscribers appear at  https://app.kit.com/subscribers' -ForegroundColor DarkGray
Write-Host "  filtered by the tag  $TagName" -ForegroundColor DarkGray
Write-Host ''
