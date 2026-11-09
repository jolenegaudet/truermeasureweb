<#
    Build one of the three website builds, then prove which one it is.

    Written 2 November 2026. Her brief: "Prepare and verify the intended launch
    configuration locally. Keep it unpublished and separate from any maintenance
    build of the current live site."

    The three builds differ only in environment variables. Nothing here edits a
    file, nothing publishes, and nothing talks to Netlify.

      -Mode maintenance   No variables. What Netlify builds today: no amounts,
                          no billing selector, buttons on the demo. Build this
                          to see exactly what a maintenance redeploy of the
                          live site would serve.

      -Mode review        NEXT_PUBLIC_TM_PRICE_PREVIEW=1
                          The release candidate: her three amounts, the
                          monthly/yearly choice, buttons still on the demo with
                          both demo labels. This is what she is reviewing.

      -Mode launch        NEXT_PUBLIC_TM_PRICES_APPROVED=1
                          NEXT_PUBLIC_TM_APP_URL=<-AppHost>
                          The real thing: amounts plus buttons on the customer
                          app, with the demo labels gone. Needs -AppHost,
                          because without a host it is only the review build
                          again. The app session confirmed on 2 November that
                          the production app does not exist yet, so this mode
                          cannot be used honestly until it does.

    The country override (NEXT_PUBLIC_TM_COUNTRY_OVERRIDE) is deliberately not
    an option here. It is a local reading aid and it has no business in a build
    anybody might screenshot, approve or publish; scripts/check-launch-build.mjs
    fails if it reaches the HTML. For a local look at another country's price,
    run `npm run dev` with that variable set.

    Examples:

      pwsh -File scripts/launch-build.ps1 -Mode review -Serve
      pwsh -File scripts/launch-build.ps1 -Mode maintenance
      pwsh -File scripts/launch-build.ps1 -Mode launch -AppHost https://app.example.com

    Exit code 0 means the build came out as the mode asked for and every check
    passed. Anything else leaves out/ alone for inspection and says why.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('maintenance', 'review', 'launch')]
    [string] $Mode,

    # The customer app's origin, for -Mode launch. Scheme and host, no path.
    [string] $AppHost = '',

    # Serve out/ afterwards, for screenshots and a read-through. This runs
    # scripts/preview-edge.mjs, which also runs the currency edge function, so
    # the preview shows a real price instead of the USD fallback.
    [switch] $Serve,

    # Bind the preview to every interface, so it can be opened on a phone on
    # the same wifi. It serves an unapproved build: bind it no wider than the
    # room you are in, and stop it when the read-through is done.
    [switch] $Lan,

    # What Netlify would have resolved for the reader. Any page also takes
    # ?sim-country=XX, and an empty ?sim-country= for an unplaceable visitor.
    [string] $Country = 'CA',

    # Build with the legal documents routed even while they are still drafts,
    # so their exact texts can be read at their real addresses. Her instruction,
    # 5 November 2026: "Montre-moi les versions exactes en apercu."
    #
    # IT CANNOT BE PUBLISHED. check-launch-build.mjs refuses a build carrying a
    # draft marker unless it is told this is that preview, and the publish
    # procedure never tells it so.
    [switch] $LegalPreview,

    [int] $Port = 3200
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Say([string] $text) { Write-Host "  $text" }

# ─────────────────────────────────────────────────────────────────────────────
# What the mode means
# ─────────────────────────────────────────────────────────────────────────────

$vars = @{}
if ($LegalPreview) { $vars['TM_LEGAL_PREVIEW'] = '1' }
switch ($Mode) {
    'review' {
        $vars['NEXT_PUBLIC_TM_PRICE_PREVIEW'] = '1'
    }
    'launch' {
        if (-not $AppHost) {
            throw "-Mode launch needs -AppHost. Without a host it is the review build. The app session confirmed on 2 November 2026 that the production app has not been created, so there is no host to give yet."
        }
        $parsed = $null
        if (-not [Uri]::TryCreate($AppHost, [UriKind]::Absolute, [ref] $parsed) -or
            $parsed.Scheme -notin @('http', 'https')) {
            throw "-AppHost must be an absolute http(s) origin, for example https://app.example.com"
        }
        if ($parsed.AbsolutePath -ne '/') {
            throw "-AppHost is an origin, not a path. The landing path is recorded in content/app-plans.ts (REGISTRATION.path)."
        }
        $vars['NEXT_PUBLIC_TM_PRICES_APPROVED'] = '1'
        $vars['NEXT_PUBLIC_TM_APP_URL'] = $parsed.GetLeftPart([UriPartial]::Authority)
    }
}

Write-Host ""
Write-Host "Building the $Mode build." -ForegroundColor Cyan
if ($vars.Count -eq 0) {
    Say "No environment variables, which is the point of this mode."
}
else {
    foreach ($name in $vars.Keys | Sort-Object) { Say "$name = $($vars[$name])" }
}

# ─────────────────────────────────────────────────────────────────────────────
# The preview server holds out/ open, and `next build` then fails with EBUSY
# ─────────────────────────────────────────────────────────────────────────────

$held = $null
try {
    $held = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
        Select-Object -First 1 -ExpandProperty OwningProcess
}
catch { $held = $null }

if ($held) {
    Say "Stopping what is serving port $Port (pid $held), because it holds out/ open."
    Stop-Process -Id $held -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 400
}

# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────

# Set for this process only, and cleared afterwards whatever happens, so a
# second run in the same shell cannot inherit the first one's configuration.
$saved = @{}
foreach ($name in $vars.Keys) {
    $saved[$name] = [Environment]::GetEnvironmentVariable($name)
    Set-Item -Path "Env:$name" -Value $vars[$name]
}
# Clear the two that belong to another mode, in case the shell carries them.
foreach ($name in @('NEXT_PUBLIC_TM_PRICE_PREVIEW', 'NEXT_PUBLIC_TM_PRICES_APPROVED',
                    'NEXT_PUBLIC_TM_APP_URL', 'NEXT_PUBLIC_TM_COUNTRY_OVERRIDE',
                    'TM_LEGAL_PREVIEW')) {
    if (-not $vars.ContainsKey($name)) {
        if (-not $saved.ContainsKey($name)) { $saved[$name] = [Environment]::GetEnvironmentVariable($name) }
        Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue
    }
}

$log = Join-Path ([System.IO.Path]::GetTempPath()) "tm-build-$Mode.log"
try {
    Say "npm run build  (log: $log)"
    & npm run build 2>&1 | Tee-Object -FilePath $log | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Get-Content $log -Tail 30
        throw "The build failed. Full output in $log"
    }
    Say "Build finished."
}
finally {
    foreach ($name in $saved.Keys) {
        if ($null -eq $saved[$name]) { Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue }
        else { Set-Item -Path "Env:$name" -Value $saved[$name] }
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Prove it is the build that was asked for
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
$check = @('scripts/check-launch-build.mjs', '--expect', $Mode)
if ($Mode -eq 'launch') { $check += @('--app-host', $vars['NEXT_PUBLIC_TM_APP_URL']) }
if ($LegalPreview) { $check += '--legal-preview' }
& node $check
if ($LASTEXITCODE -ne 0) { throw "out/ is not a clean $Mode build. Nothing was published; see above." }

Write-Host ""
Write-Host "out/ is a verified $Mode build. Not published." -ForegroundColor Green
if ($Mode -ne 'maintenance') {
    Say "It holds unapproved amounts. Do not publish it, and do not leave it where a deploy could pick it up."
}
if ($LegalPreview) {
    Write-Host ""
    Write-Host "  It also holds legal documents that are still marked drafts." -ForegroundColor Yellow
    Say "They are readable so she can approve the exact texts. They are not publishable."
}

# ─────────────────────────────────────────────────────────────────────────────
# Serve, for the read-through and the screenshots
# ─────────────────────────────────────────────────────────────────────────────

if ($Serve) {
    # scripts/preview-edge.mjs, not `python -m http.server`, for two reasons.
    # The export writes /fr as fr.html, and reading the preview at that address
    # puts an English footer on the French pages and makes link clicks
    # unservable. And without the edge function no currency attribute is
    # written, so every price falls back to USD. That file explains both.
    $serveArgs = @((Join-Path $PSScriptRoot 'preview-edge.mjs'), $Port, (Join-Path $repo 'out'),
                   '--country', $Country)
    if ($Lan) { $serveArgs += '--lan' }

    $addresses = @("http://127.0.0.1:$Port")
    if ($Lan) {
        $lanIp = Get-NetIPAddress -AddressFamily IPv4 |
            Where-Object { $_.PrefixOrigin -in 'Dhcp', 'Manual' -and
                           $_.IPAddress -notlike '127.*' -and
                           $_.IPAddress -notlike '169.254.*' } |
            Select-Object -First 1 -ExpandProperty IPAddress
        if ($lanIp) { $addresses += "http://${lanIp}:$Port" }
    }

    Write-Host ""
    foreach ($base in $addresses) {
        $where = if ($base -like 'http://127.*') { 'this computer' } else { 'phone, same wifi' }
        Say "$where"
        Say "  English  $base/"
        Say "  French   $base/fr"
    }
    Say "Ctrl+C to stop."
    & node $serveArgs
}
