@echo off
rem RUN THIS ON 1 JULY 2027, and not before.
rem It moves every founding family from US$47 to the standing price.
rem This launcher runs the dry run only. It changes nothing.
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0end-founders-rate.ps1" -DryRun
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0end-founders-rate.ps1" -DryRun
)
echo.
pause
