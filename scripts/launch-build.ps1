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

    # Serve out/ on 127.0.0.1 afterwards, for screenshots and a read-through.
    [switch] $Serve,

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
                    'NEXT_PUBLIC_TM_APP_URL', 'NEXT_PUBLIC_TM_COUNTRY_OVERRIDE')) {
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
& node $check
if ($LASTEXITCODE -ne 0) { throw "out/ is not a clean $Mode build. Nothing was published; see above." }

Write-Host ""
Write-Host "out/ is a verified $Mode build. Not published." -ForegroundColor Green
if ($Mode -ne 'maintenance') {
    Say "It holds unapproved amounts. Do not publish it, and do not leave it where a deploy could pick it up."
}

# ─────────────────────────────────────────────────────────────────────────────
# Serve, for the read-through and the screenshots
# ─────────────────────────────────────────────────────────────────────────────

if ($Serve) {
    $out = Join-Path $repo 'out'
    Say "Serving $out on http://127.0.0.1:$Port  (Ctrl+C to stop)"
    Say "English  http://127.0.0.1:$Port/index.html"
    Say "French   http://127.0.0.1:$Port/fr.html"
    & python -m http.server $Port --bind 127.0.0.1 --directory $out
}
