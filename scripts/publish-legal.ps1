<#
.SYNOPSIS
  Fill a legal document's effective date and take off its draft banner, in one
  auditable command, on the day it is published.

.DESCRIPTION
  Two edits stand between a reviewed legal document and a published one:

    1. the effective date, which replaces [EFFECTIVE_DATE]
    2. the draft banner, whose deletion is what declares the text final

  Both are inside a legal document, so neither is a thing to do by hand at the
  moment of publishing, with a deploy waiting. A typo in a date, or a banner
  half removed, is a published mistake in a contract.

  Her rule, 5 November 2026: "Apres approbation du texte, la date d'entree en
  vigueur sera celle de la publication reelle." So the date is not a decision
  taken in advance. It is the day the page goes up, which is exactly the day
  this runs.

  WHAT IT WILL NOT DO. It never guesses a date, never runs without -Date, and
  changes nothing unless -Apply is given. Without -Apply it prints what it
  would change and stops, which is how it should normally be run first.

  It does not publish anything. After it, the build still has to pass
  scripts/check-legal-placeholders.mjs and scripts/check-launch-build.mjs, and
  those two now have nothing to object to, which is the point: the walls come
  down because the document is finished, not because a flag was passed.

.PARAMETER Document
  Which document to finish. Each name covers both languages, because a policy
  published in one language and not the other is its own kind of wrong.

.PARAMETER Date
  The effective date, as it should read on the page. Required, and no default.
  Written into the English file as given and into the French file in the French
  order, so pass it as "14 November 2026".

.PARAMETER Apply
  Make the changes. Without it, nothing is written.

.EXAMPLE
  pwsh -File scripts/publish-legal.ps1 -Document website-privacy -Date "5 November 2026"
  pwsh -File scripts/publish-legal.ps1 -Document website-privacy -Date "5 November 2026" -Apply
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('website-privacy', 'app-privacy', 'terms', 'licence')]
    [string] $Document,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d{1,2} [A-Za-zÀ-ſ]+ \d{4}$')]
    [string] $Date,

    [switch] $Apply
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

# Which files each document is, in both languages.
$files = switch ($Document) {
    'website-privacy' {
        @('content/privacy-policy.website.mdx', 'content/politique-de-confidentialite.site-web.mdx')
    }
    'app-privacy' {
        # Both languages, because a policy published in one is a different
        # policy for half the readers. The French file does not exist yet: the
        # app session has not sent her approved text, so this exits 2 until it
        # does. Her instruction, 6 November 2026: "Je veux m'assurer que les
        # deux versions de la politique de l'app sont egalement verifiees avant
        # publication."
        @('content/privacy-policy.mdx', 'content/politique-de-confidentialite.mdx')
    }
    'terms' {
        @('content/terms-of-service.mdx', 'content/conditions-d-utilisation.mdx')
    }
    'licence' {
        # Neither file exists yet. The Licence is not in this repository in
        # either language. The English draft is in the counsel package, outside
        # it; she wrote a French draft and sent it to the app session on
        # 6 November 2026 to be checked against the English, and said she would
        # forward both approved versions here for integration. Until they
        # arrive this document cannot be finished, and scripts/
        # check-legal-placeholders.mjs additionally refuses to build it in one
        # language only. See content/i18n.ts.
        @('content/licence.mdx', 'content/contrat-de-licence.mdx')
    }
}

# The French date reads "le 14 novembre 2026", with a lower-case month.
$frenchMonths = @{
    january = 'janvier'; february = 'fevrier'; march = 'mars'; april = 'avril'
    may = 'mai'; june = 'juin'; july = 'juillet'; august = 'aout'
    september = 'septembre'; october = 'octobre'; november = 'novembre'
    december = 'decembre'
}

function FrenchDate([string] $english) {
    $parts = $english -split '\s+'
    $month = $frenchMonths[$parts[1].ToLowerInvariant()]
    if (-not $month) { return $english }   # Already French, or unknown: leave it.
    # The accents the table drops, restored.
    $month = $month -replace 'fevrier', 'février' -replace 'aout', 'août' `
                    -replace 'decembre', 'décembre'
    "$($parts[0]) $month $($parts[2])"
}

$banners = @(
    '> **DRAFT for counsel',
    '> **ÉBAUCHE destinée au conseiller juridique'
)

Write-Host ""
Write-Host "$Document, effective $Date" -ForegroundColor Cyan
if (-not $Apply) { Write-Host "  Nothing will be written. Add -Apply to make these changes." -ForegroundColor Yellow }
Write-Host ""

$missing = @()
$changed = 0

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        $missing += $file
        Write-Host "  $file" -ForegroundColor Red
        Write-Host "    does not exist, so there is nothing to finish."
        continue
    }

    $text = Get-Content -Raw -Path $file
    $isFrench = $file -match 'politique-de-confidentialite|conditions-d-utilisation|contrat-de-licence'
    $written = if ($isFrench) { FrenchDate $Date } else { $Date }

    $actions = @()

    if ($text -match '\[EFFECTIVE_DATE\]') {
        $actions += "set the effective date to '$written'"
        $text = $text -replace '\[EFFECTIVE_DATE\]', $written
    }

    foreach ($banner in $banners) {
        if ($text.Contains($banner)) {
            # A banner is a blockquote: every line from "> **" until a line that
            # is not part of the quote.
            $lines = $text -split "`r?`n"
            $start = ($lines | Select-String -SimpleMatch $banner | Select-Object -First 1).LineNumber - 1
            $stop = $start
            while ($stop -lt $lines.Count -and $lines[$stop].TrimStart().StartsWith('>')) { $stop++ }
            # And the blank line it leaves behind.
            while ($stop -lt $lines.Count -and $lines[$stop].Trim() -eq '') { $stop++ }
            $kept = @()
            if ($start -gt 0) { $kept += $lines[0..($start - 1)] }
            if ($stop -lt $lines.Count) { $kept += $lines[$stop..($lines.Count - 1)] }
            $text = $kept -join "`n"
            $actions += "remove the draft banner ($($stop - $start) lines)"
        }
    }

    if (-not $actions) {
        Write-Host "  $file"
        Write-Host "    already finished: no placeholder and no draft banner."
        continue
    }

    Write-Host "  $file"
    foreach ($a in $actions) { Write-Host "    $a" }

    if ($Apply) {
        Set-Content -Path $file -Value $text -NoNewline -Encoding utf8
        $changed++
    }
}

Write-Host ""

if ($missing.Count) {
    Write-Host "  $($missing.Count) file(s) do not exist. Nothing was written for those." -ForegroundColor Red
    Write-Host "  A document missing in one language must not be published in the other."
    Write-Host ""
    exit 2
}

if (-not $Apply) {
    Write-Host "  Run it again with -Apply to make these changes." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "  $changed file(s) written." -ForegroundColor Green
Write-Host "  Now build. The two legal checks should pass with no flag at all:" -ForegroundColor Green
Write-Host "    pwsh -File scripts/launch-build.ps1 -Mode launch -AppHost https://app.truermeasure.com"
Write-Host "  If either still objects, the document is not finished. Do not pass a"
Write-Host "  preview flag to get past it."
Write-Host ""
