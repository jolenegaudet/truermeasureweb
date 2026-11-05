<#
.SYNOPSIS
  Says whether the value you pasted into Netlify is the right one, without
  showing either value to anyone.

.DESCRIPTION
  TM_CURRENCY_KEY has to hold the same value in two places: Netlify, where the
  edge function signs the currency, and the customer app, which checks the
  signature. If they differ by one character every signature fails, and the
  failure is silent: no error anywhere, and every visitor is read as US
  dollars.

  This compares a fingerprint rather than a value. A fingerprint is the first
  eight characters of the SHA-256 of the key, which cannot be turned back into
  the key, so it is safe on screen and safe to read out.

  HOW TO USE IT

    1. Open Netlify: Site configuration, Environment variables.
    2. Reveal TM_CURRENCY_KEY and copy its value to the clipboard.
    3. Run this script.

  It prints two fingerprints and one word. MATCH means Netlify holds the same
  value as the secrets file on this machine, which is the value the customer
  app was configured from. DIFFERS means the paste went wrong and should be
  done again.

  Nothing is sent anywhere, nothing is written, and neither value is printed.

.PARAMETER Path
  Compare a file's contents instead of the clipboard. The file must contain
  the key and nothing else. Useful when the clipboard is not available.

.NOTES
  The expected value is read from the secrets file outside this repository:
  $env:TRUERMEASURE_SECRETS_DIR, or the .secrets folder beside the repo.
#>

[CmdletBinding()]
param(
    [string] $Path
)

$ErrorActionPreference = 'Stop'

function Fingerprint([string] $value) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($value)
        return ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join '' |
               ForEach-Object { $_.Substring(0, 8) }
    } finally {
        $sha.Dispose()
    }
}

# ── The expected value, from outside the repository ──────────────────────────

$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) { throw 'Run this from inside the repository.' }
$repoRoot = [IO.Path]::GetFullPath($repoRoot)

$secretsHome = if ($env:TRUERMEASURE_SECRETS_DIR) {
    $env:TRUERMEASURE_SECRETS_DIR
} else {
    Join-Path (Split-Path $repoRoot -Parent) '.secrets'
}
$secretsFile = Join-Path $secretsHome 'currency-link.env'

if (-not (Test-Path $secretsFile)) {
    Write-Host ''
    Write-Host "No key file at $secretsFile" -ForegroundColor Yellow
    Write-Host 'Nothing to compare against. The app session created that file.'
    exit 2
}

$line = Get-Content $secretsFile |
        Where-Object { $_ -match '^TM_CURRENCY_KEY=' } |
        Select-Object -First 1

if (-not $line) { throw "No TM_CURRENCY_KEY line in $secretsFile" }

$expected = ($line -replace '^TM_CURRENCY_KEY=', '').Trim().Trim('"').Trim("'")
if (-not $expected) { throw "TM_CURRENCY_KEY is empty in $secretsFile" }

# ── What you pasted ──────────────────────────────────────────────────────────

$candidate = if ($Path) {
    (Get-Content -Raw -Path $Path)
} else {
    Get-Clipboard -Raw
}

if ($null -eq $candidate) { $candidate = '' }
$candidate = $candidate.Trim()

if (-not $candidate) {
    Write-Host ''
    Write-Host 'The clipboard is empty.' -ForegroundColor Yellow
    Write-Host 'Copy the value out of Netlify first, then run this again.'
    exit 2
}

# ── The answer ───────────────────────────────────────────────────────────────

$expectedPrint = Fingerprint $expected
$candidatePrint = Fingerprint $candidate

Write-Host ''
Write-Host "  the secrets file   $expectedPrint"
Write-Host "  what you copied    $candidatePrint"
Write-Host ''

if ($expectedPrint -eq $candidatePrint) {
    Write-Host '  MATCH. Netlify holds the same key as the customer app.' -ForegroundColor Green
    Write-Host ''
    Write-Host '  That is one of the three deploy checks done early. The other two,'
    Write-Host '  that Netlify places a real visitor and that the signed link survives'
    Write-Host '  end to end, still need the site to be deployed.'
    exit 0
}

Write-Host '  DIFFERS. What you copied is not the key the app was configured with.' -ForegroundColor Red
Write-Host ''
Write-Host '  Nothing is broken yet, because the variable only reaches the edge at'
Write-Host '  the next deploy. Paste it again in Netlify and run this once more.'
Write-Host '  Watch for a trailing space, a missing first character, or a value'
Write-Host '  copied from the wrong line of the file.'
exit 1
