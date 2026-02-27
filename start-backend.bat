@echo off
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

cd /d "%~dp0backend"
mvn spring-boot:run
pause
