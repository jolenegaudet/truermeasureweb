@echo off
rem Who is a member, what they pay now, and when their founders rate ends.
rem Reads only. Nothing is changed.
where pwsh >nul 2>nul && (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0founding-members.ps1"
) || (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0founding-members.ps1"
)
echo.
pause
