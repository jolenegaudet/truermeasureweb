@echo off
rem Takes the US$597 annual offer down, AFTER the monthly one is working.
rem This launcher runs the dry run only. It changes nothing.
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0retire-annual-price.ps1" -DryRun -RetireFoundingCode
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0retire-annual-price.ps1" -DryRun -RetireFoundingCode
)
echo.
pause
