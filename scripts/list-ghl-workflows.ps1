<#
.SYNOPSIS
  Lists the GoHighLevel workflows and whether each one is published.

.DESCRIPTION
  A workflow left in Draft does nothing at all and nothing warns you. This is
  how to check that without opening a browser.

  Needs the scope `workflows.readonly` on the private integration token. If it
  is missing, this script says so and tells you the one checkbox to tick.

.PARAMETER Name
  Show only workflows whose name contains this text.

.NOTES
  Token from the secrets file, then GHL_API_TOKEN, then a prompt. Never printed.
#>

[CmdletBinding()]
param([string]$Name)

$ErrorActionPreference = 'Stop'

function Get-GhlCreds {
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
            $lines = Get-Content $secretsFile
            $t = $lines | Where-Object { $_ -match '^GHL_API_TOKEN=' }      | Select-Object -First 1
            $l = $lines | Where-Object { $_ -match '^GHL_LOCATION_ID=' }   | Select-Object -First 1
            if ($t -and $l) {
                Write-Host 'Using GHL_API_TOKEN from the secrets file.'
                return @{
                    Token    = ($t -replace '^GHL_API_TOKEN=', '').Trim().Trim('"').Trim("'")
                    Location = ($l -replace '^GHL_LOCATION_ID=', '').Trim().Trim('"').Trim("'")
                }
            }
        }
    }
    if ($env:GHL_API_TOKEN -and $env:GHL_LOCATION_ID) {
        return @{ Token = $env:GHL_API_TOKEN; Location = $env:GHL_LOCATION_ID }
    }
    $secure = Read-Host 'GoHighLevel token' -AsSecureString
    $tok = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    $loc = Read-Host 'Location id'
    return @{ Token = $tok; Location = $loc }
}

$c = Get-GhlCreds
if (-not $c.Token) { throw 'No token provided.' }

$headers = @{
    Authorization = "Bearer $($c.Token)"
    Version       = '2021-07-28'
    Accept        = 'application/json'
}
$uri = "https://services.leadconnectorhq.com/workflows/?locationId=$($c.Location)"

try {
    $res = Invoke-RestMethod -Method Get -Headers $headers -Uri $uri
} catch {
    $detail = $_.ErrorDetails.Message
    if ($detail -and $detail -match 'not authorized for this scope') {
        Write-Host ''
        Write-Host 'The token cannot read workflows.' -ForegroundColor Yellow
        Write-Host 'In GoHighLevel: Settings > Private Integrations > open the' -ForegroundColor Yellow
        Write-Host 'integration this token belongs to > tick the scope' -ForegroundColor Yellow
        Write-Host '  View Workflows   (workflows.readonly)' -ForegroundColor Cyan
        Write-Host 'Save. The token itself does not change, so nothing else breaks.' -ForegroundColor Yellow
        exit 1
    }
    throw
}

$workflows = @($res.workflows)
if ($Name) { $workflows = @($workflows | Where-Object { $_.name -like "*$Name*" }) }

Write-Host ''
if ($workflows.Count -eq 0) {
    if ($Name) { Write-Host "No workflow whose name contains '$Name'." -ForegroundColor Yellow }
    else       { Write-Host 'This location has no workflows.' -ForegroundColor Yellow }
    return
}

Write-Host "$($workflows.Count) workflow(s):" -ForegroundColor Cyan
foreach ($w in ($workflows | Sort-Object name)) {
    $published = ($w.status -eq 'published')
    $colour = if ($published) { 'Green' } else { 'Yellow' }
    $note   = if ($published) { '' } else { '   <-- DRAFT: this one does nothing' }
    Write-Host ("  {0,-10} {1}{2}" -f $w.status, $w.name, $note) -ForegroundColor $colour
}
