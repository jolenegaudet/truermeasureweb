@echo off
rem Paste the Stripe pricing key once. It is saved outside the repository,
rem in the same secrets file as your other credentials, and never printed.
cd /d "%~dp0.."
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0save-stripe-pricing-key.ps1"
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0save-stripe-pricing-key.ps1"
)
echo.
pause
