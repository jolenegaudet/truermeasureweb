@echo off
chcp 65001 >nul
title Truer Measure - update the checkout text

rem PowerShell 7 handles UTF-8 script files natively. Fall back to Windows
rem PowerShell only if it is not installed; the script carries its own guard
rem against mis-decoded accents either way.
where pwsh >nul 2>nul
if %errorlevel%==0 (
    pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0set-checkout-authorization.ps1"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0set-checkout-authorization.ps1"
)

echo.
echo ---------------------------------------------------------------
echo Done. Close this window when you have read the result above.
echo ---------------------------------------------------------------
pause
