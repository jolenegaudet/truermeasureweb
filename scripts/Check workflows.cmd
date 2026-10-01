@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0list-ghl-workflows.ps1" %*
echo.
pause
