@echo off
rem Creates the School & Life monthly and yearly prices in Stripe TEST mode,
rem in CAD, USD and EUR, with the euro amount VAT-inclusive.
rem This runs the dry run: it prints every amount and creates nothing.
rem To create them for real, run the .ps1 without -DryRun.
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-school-and-life-prices.ps1" -DryRun
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-school-and-life-prices.ps1" -DryRun
)
echo.
pause
