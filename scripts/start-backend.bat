@echo off
setlocal EnableExtensions EnableDelayedExpansion
:: ============================================================
:: Start Spring Boot backend
:: Double-click this file to start the backend server
:: ============================================================

SET MAVEN_HOME=C:\maven\apache-maven-3.9.6
SET PATH=%MAVEN_HOME%\bin;%PATH%

echo.
echo  ==========================================
echo   Starting Sustainability Tracker Backend
echo   Server will run at http://localhost:8081
echo  ==========================================
echo.

set "PORT_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":8081 .*LISTENING"') do (
	set "PORT_PID=%%P"
	goto :port_check_done
)

:port_check_done
if defined PORT_PID (
	echo [INFO] Port 8081 is in use by PID !PORT_PID!. Stopping it...
	taskkill /PID !PORT_PID! /F >nul 2>&1
	timeout /t 1 /nobreak >nul

	for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":8081 .*LISTENING"') do (
		echo [ERROR] Port 8081 is still in use. Stop the process manually and retry.
		goto :done
	)
)

cd /d "%~dp0..\backend"
mvn spring-boot:run

if errorlevel 1 (
	echo [ERROR] Backend failed to start. Check the logs above for the root cause.
)

:done
pause
endlocal
