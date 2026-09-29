@echo off
rem Creates the US$79/month price and its payment link in live Stripe.
rem Run the dry run first: it shows the plan and creates nothing.
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-monthly-price.ps1" -DryRun -Replace
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-monthly-price.ps1" -DryRun -Replace
)
echo.
pause
