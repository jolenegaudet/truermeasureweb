@echo off
rem Double-click after copying TM_CURRENCY_KEY out of Netlify.
rem Says MATCH or DIFFERS. Shows no key, sends nothing, writes nothing.
cd /d "%~dp0.."
pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-currency-key.ps1"
echo.
pause
