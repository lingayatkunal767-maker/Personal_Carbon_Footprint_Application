# ============================================================
# Sustainability Tracker - One-Click Database Setup Script
# Run this script ONCE to set up the PostgreSQL database
# Usage: Right-click -> "Run with PowerShell"
#        or: pwsh -File setup-database.ps1
# ============================================================

$psqlDir    = "C:\Program Files\PostgreSQL\18\bin"
$mavenDir   = "C:\maven\apache-maven-3.9.6\bin"
$schemaFile = "$PSScriptRoot\database\schema.sql"
$seedFile   = "$PSScriptRoot\database\seed-data.sql"

# --- Add tools to PATH for this session ---
$env:PATH = "$psqlDir;$mavenDir;$env:PATH"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Sustainability Tracker - DB Setup" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# --- Prompt for postgres superuser password ---
$pgPassword = Read-Host "Enter your PostgreSQL superuser (postgres) password" -AsSecureString
$pgPlain    = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

$env:PGPASSWORD = $pgPlain

Write-Host "`n[1/4] Creating database 'sustainability_tracker'..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE sustainability_tracker;" 2>&1 | Out-Null

Write-Host "[2/4] Creating user 'tracker_user'..." -ForegroundColor Yellow
psql -U postgres -c "CREATE USER tracker_user WITH PASSWORD 'tracker123';" 2>&1 | Out-Null
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sustainability_tracker TO tracker_user;" 2>&1 | Out-Null
psql -U postgres -d sustainability_tracker -c "GRANT ALL ON SCHEMA public TO tracker_user;" 2>&1 | Out-Null

Write-Host "[3/4] Loading schema..." -ForegroundColor Yellow
psql -U tracker_user -d sustainability_tracker -f $schemaFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Schema load failed!" -ForegroundColor Red; exit 1
}

Write-Host "[4/4] Loading seed data..." -ForegroundColor Yellow
psql -U tracker_user -d sustainability_tracker -f $seedFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Seed data load failed!" -ForegroundColor Red; exit 1
}

# --- Update application.properties with the correct password ---
$propsFile = "$PSScriptRoot\backend\src\main\resources\application.properties"
(Get-Content $propsFile) -replace 'spring.datasource.password=.*', 'spring.datasource.password=tracker123' |
    Set-Content $propsFile
Write-Host "`n[OK] Updated application.properties with database password." -ForegroundColor Green

$env:PGPASSWORD = ""

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Database setup COMPLETE!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Green
Write-Host " DB:       sustainability_tracker" -ForegroundColor White
Write-Host " User:     tracker_user" -ForegroundColor White
Write-Host " Password: tracker123" -ForegroundColor White
Write-Host "`n Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd backend  ->  mvn spring-boot:run" -ForegroundColor White
Write-Host "  2. cd ..       ->  npm run dev`n" -ForegroundColor White
