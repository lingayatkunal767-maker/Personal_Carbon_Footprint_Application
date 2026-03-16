@echo off
setlocal EnableExtensions EnableDelayedExpansion
:: ============================================================
:: Start Spring Boot backend
:: Double-click this file to start the backend server
:: ============================================================

echo.
echo  ==========================================
echo   Starting Sustainability Tracker Backend
echo   Server will run at http://localhost:8081
echo  ==========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"

if errorlevel 1 (
  echo [ERROR] Backend failed to start. Check logs above for root cause.
)

:done
pause
endlocal
