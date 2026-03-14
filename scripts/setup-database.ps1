# ============================================================
# Sustainability Tracker - One-Click Database Setup Script
# Run this script ONCE to set up the PostgreSQL database
# Usage: Right-click -> "Run with PowerShell"
#        or: pwsh -File .\scripts\setup-database.ps1
# ============================================================

$psqlDir    = "C:\Program Files\PostgreSQL\18\bin"
$mavenDir   = "C:\maven\apache-maven-3.9.6\bin"
$schemaFile = Join-Path $PSScriptRoot "..\database\schema.sql"
$seedFile   = Join-Path $PSScriptRoot "..\database\seed-data.sql"
$dbName     = "ce"
$dbUser     = "postgres"

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

Write-Host "[1/3] Ensuring database '$dbName' exists..." -ForegroundColor Yellow
$dbExists = psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName';"
if (($dbExists | Out-String).Trim() -ne "1") {
    psql -U postgres -d postgres -c "CREATE DATABASE $dbName;"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Could not create database '$dbName'." -ForegroundColor Red
        exit 1
    }
}

Write-Host "[2/3] Loading schema into '$dbName'..." -ForegroundColor Yellow
psql -U $dbUser -d $dbName -f $schemaFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Schema load failed!" -ForegroundColor Red; exit 1
}

Write-Host "[3/3] Loading seed data into '$dbName'..." -ForegroundColor Yellow
psql -U $dbUser -d $dbName -f $seedFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Seed data load failed!" -ForegroundColor Red; exit 1
}

$env:PGPASSWORD = ""

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Database setup COMPLETE!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Green
Write-Host " DB:       $dbName" -ForegroundColor White
Write-Host " User:     $dbUser" -ForegroundColor White
Write-Host "`n Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd backend  ->  mvn spring-boot:run" -ForegroundColor White
Write-Host "  2. cd ..       ->  npm run dev`n" -ForegroundColor White
