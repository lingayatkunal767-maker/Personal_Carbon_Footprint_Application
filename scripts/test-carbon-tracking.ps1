# Test Carbon Tracking Features
# This script validates key carbon-tracking APIs.

$ErrorActionPreference = "Stop"

Write-Host "`nCARBON TRACKING FEATURE TESTER" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$ApiBase = "http://localhost:8081/api"
$UserId = 1

function Write-Step {
    param([string]$Title)
    Write-Host "`n$Title" -ForegroundColor Cyan
}

Write-Step "[0] Checking if backend is running"
try {
    $null = Invoke-RestMethod -Uri "$ApiBase/stats/user/$UserId" -Method Get
    Write-Host "OK Backend is running on port 8081" -ForegroundColor Green
} catch {
    Write-Host "ERROR Backend is not reachable" -ForegroundColor Red
    Write-Host "Start backend with: Set-Location backend; mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Step "[1] Submitting lifestyle survey"
$surveyData = @{
    userId = $UserId
    transportMode = "CAR"
    distanceKmPerDay = 20.0
    fuelType = "PETROL"
    mealsNonVegPerWeek = 7
    mealsVegPerWeek = 14
    electricityKwhPerMonth = 300.0
    cookingGasCylindersPerMonth = 1.5
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$ApiBase/survey" -Method Post -ContentType "application/json" -Body $surveyData
    Write-Host "OK Survey submitted" -ForegroundColor Green
    Write-Host ("   Survey ID: {0}" -f $result.surveyId)
    Write-Host ("   Date: {0}" -f $result.logDate)
    Write-Host ("   Transport Emission: {0} kg CO2e" -f $result.transportEmission)
    Write-Host ("   Food Emission: {0} kg CO2e" -f $result.foodEmission)
    Write-Host ("   Energy Emission: {0} kg CO2e" -f $result.energyEmission)
    Write-Host ("   Total Emission: {0} kg CO2e" -f $result.totalEmission) -ForegroundColor Yellow
} catch {
    Write-Host ("ERROR Survey submission failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Step "[2] Retrieving carbon logs"
try {
    $logs = Invoke-RestMethod -Uri "$ApiBase/carbon/logs?userId=$UserId" -Method Get
    $logCount = if ($logs -is [System.Array]) { $logs.Count } elseif ($null -ne $logs) { 1 } else { 0 }
    Write-Host ("OK Retrieved {0} carbon log entries" -f $logCount) -ForegroundColor Green

    if ($logCount -gt 0) {
        $sampleLogs = @($logs) | Select-Object -First 5
        foreach ($log in $sampleLogs) {
            Write-Host ("   {0}: total={1} (transport={2}, food={3}, energy={4})" -f $log.logDate, $log.totalEmission, $log.transportEmission, $log.foodEmission, $log.energyEmission)
        }
    }
} catch {
    Write-Host ("ERROR Failed to retrieve logs: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Step "[3] Fetching dashboard data"
try {
    $dashboard = Invoke-RestMethod -Uri "$ApiBase/dashboard/user/$UserId" -Method Get
    Write-Host "OK Dashboard data retrieved" -ForegroundColor Green
    Write-Host ("   Weekly Emissions: {0} kg CO2e" -f $dashboard.weeklyTotal)
    Write-Host ("   Change from last week: {0}%" -f $dashboard.changePercentage)
    Write-Host ("   Active Goals: {0}" -f $dashboard.stats.activeGoals)
    Write-Host ("   Badges Earned: {0}" -f $dashboard.stats.badgeCount)
    Write-Host ("   Eco Points: {0}" -f $dashboard.stats.ecoPoints)

    if ($dashboard.emissionsBreakdown) {
        foreach ($item in $dashboard.emissionsBreakdown) {
            $pct = [math]::Round([double]$item.percentage, 1)
            Write-Host ("   {0}: {1} kg ({2}%)" -f $item.activityType, $item.totalCarbon, $pct)
        }
    }
} catch {
    Write-Host ("ERROR Failed to fetch dashboard: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Step "[4] Getting user statistics"
try {
    $stats = Invoke-RestMethod -Uri "$ApiBase/stats/user/$UserId" -Method Get
    Write-Host "OK User stats retrieved" -ForegroundColor Green
    Write-Host ("   Total Activities: {0}" -f $stats.totalActivities)
    Write-Host ("   Monthly Carbon: {0} kg CO2e" -f $stats.monthlyCarbon)
    Write-Host ("   Weekly Emissions: {0} kg CO2e" -f $stats.weeklyEmissions)
    Write-Host ("   Streak Days: {0}" -f $stats.streakDays)
} catch {
    Write-Host ("ERROR Failed to get stats: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Step "[5] Getting monthly comparison"
try {
    $monthly = Invoke-RestMethod -Uri "$ApiBase/stats/user/$UserId/monthly?months=6" -Method Get
    $rows = @($monthly)
    Write-Host ("OK Monthly data retrieved ({0} rows)" -f $rows.Count) -ForegroundColor Green
    foreach ($row in $rows) {
        Write-Host ("   {0}: {1} kg CO2e" -f $row.month, $row.total)
    }
} catch {
    Write-Host ("ERROR Failed to get monthly data: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Step "[6] Submitting metro commute survey"
$surveyData2 = @{
    userId = $UserId
    surveyDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
    transportMode = "METRO"
    distanceKmPerDay = 15.0
    fuelType = "NA"
    mealsNonVegPerWeek = 3
    mealsVegPerWeek = 18
    electricityKwhPerMonth = 250.0
    cookingGasCylindersPerMonth = 1.0
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "$ApiBase/survey" -Method Post -ContentType "application/json" -Body $surveyData2
    Write-Host "OK Metro survey submitted" -ForegroundColor Green
    Write-Host ("   Total Emission: {0} kg CO2e" -f $result2.totalEmission)
} catch {
    Write-Host ("ERROR Metro survey submission failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "CARBON TRACKING TEST COMPLETE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
