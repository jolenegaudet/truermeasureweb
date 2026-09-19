@echo off
rem Double-click this to see the real caps on the Stripe discount codes.
rem Reads only. Nothing is changed.
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-discount-codes.ps1"
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-discount-codes.ps1"
)
echo.
pause
