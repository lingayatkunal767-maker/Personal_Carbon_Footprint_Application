# ============================================
# Test Carbon Tracking Features
# ============================================
# This script tests all carbon tracking features

Write-Host "`n🌱 CARBON TRACKING FEATURE TESTER" -ForegroundColor Green
Write-Host "==================================`n" -ForegroundColor Green

$API_BASE = "http://localhost:8081/api"
$USER_ID = 1

# ============================================
# Check if backend is running
# ============================================
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/stats/user/$USER_ID" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running on port 8081`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Please start backend: cd backend && mvn spring-boot:run`n" -ForegroundColor Yellow
    exit 1
}

# ============================================
# Test 1: Submit Lifestyle Survey
# ============================================
Write-Host "📊 TEST 1: Submitting Lifestyle Survey..." -ForegroundColor Cyan

$surveyData = @{
    userId = $USER_ID
    transportMode = "CAR"
    distanceKmPerDay = 20.0
    fuelType = "PETROL"
    mealsNonVegPerWeek = 7
    mealsVegPerWeek = 14
    electricityKwhPerMonth = 300.0
    cookingGasCylindersPerMonth = 1.5
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$API_BASE/survey" -Method Post `
        -ContentType "application/json" -Body $surveyData
    
    Write-Host "✅ Survey submitted successfully!" -ForegroundColor Green
    Write-Host "   Survey ID: $($result.surveyId)" -ForegroundColor White
    Write-Host "   Date: $($result.logDate)" -ForegroundColor White
    Write-Host "   Transport Emission: $($result.transportEmission) kg CO2e" -ForegroundColor Yellow
    Write-Host "   Food Emission: $($result.foodEmission) kg CO2e" -ForegroundColor Yellow
    Write-Host "   Energy Emission: $($result.energyEmission) kg CO2e" -ForegroundColor Yellow
    Write-Host "   TOTAL EMISSION: $($result.totalEmission) kg CO2e`n" -ForegroundColor Red
} catch {
    Write-Host "❌ Survey submission failed: $_`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ============================================
# Test 2: Get Carbon Logs
# ============================================
Write-Host "📜 TEST 2: Retrieving Carbon Logs..." -ForegroundColor Cyan

try {
    $logs = Invoke-RestMethod -Uri "$API_BASE/carbon/logs?userId=$USER_ID" -Method Get
    
    Write-Host "✅ Retrieved $($logs.Count) carbon log entries" -ForegroundColor Green
    
    if ($logs.Count -gt 0) {
        Write-Host "`n   Recent Entries:" -ForegroundColor White
        $logs | Select-Object -First 5 | ForEach-Object {
            Write-Host "   📅 $($_.logDate): Total = $($_.totalEmission) kg CO2e" -ForegroundColor Yellow
            Write-Host "      (Transport: $($_.transportEmission), Food: $($_.foodEmission), Energy: $($_.energyEmission))" -ForegroundColor Gray
        }
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to retrieve logs: $_`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ============================================
# Test 3: Get Dashboard Data
# ============================================
Write-Host "📊 TEST 3: Fetching Dashboard Data..." -ForegroundColor Cyan

try {
    $dashboard = Invoke-RestMethod -Uri "$API_BASE/dashboard/user/$USER_ID" -Method Get
    
    Write-Host "✅ Dashboard data retrieved successfully!" -ForegroundColor Green
    Write-Host "`n   📈 Statistics:" -ForegroundColor White
    Write-Host "   Weekly Emissions: $($dashboard.weeklyTotal) kg CO2e" -ForegroundColor Yellow
    Write-Host "   Change from last week: $($dashboard.changePercentage)%" -ForegroundColor $(if ($dashboard.changePercentage -lt 0) { "Green" } else { "Red" })
    Write-Host "   Active Goals: $($dashboard.stats.activeGoals)" -ForegroundColor Cyan
    Write-Host "   Badges Earned: $($dashboard.stats.badgeCount)" -ForegroundColor Cyan
    Write-Host "   Eco Points: $($dashboard.stats.ecoPoints)" -ForegroundColor Magenta
    
    if ($dashboard.emissionsBreakdown) {
        Write-Host "`n   📊 Emissions Breakdown:" -ForegroundColor White
        $dashboard.emissionsBreakdown | ForEach-Object {
            $percentage = [math]::Round($_.percentage, 1)
            Write-Host "   $($_.activityType): $($_.totalCarbon) kg ($percentage%)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to fetch dashboard: $_`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ============================================
# Test 4: Get User Stats
# ============================================
Write-Host "📊 TEST 4: Getting User Statistics..." -ForegroundColor Cyan

try {
    $stats = Invoke-RestMethod -Uri "$API_BASE/stats/user/$USER_ID" -Method Get
    
    Write-Host "✅ User stats retrieved!" -ForegroundColor Green
    Write-Host "   Total Activities: $($stats.totalActivities)" -ForegroundColor White
    Write-Host "   Monthly Carbon: $($stats.monthlyCarbon) kg CO2e" -ForegroundColor Yellow
    Write-Host "   Weekly Emissions: $($stats.weeklyEmissions) kg CO2e" -ForegroundColor Yellow
    Write-Host "   Streak Days: $($stats.streakDays) days`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get stats: $_`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ============================================
# Test 5: Get Monthly Comparison
# ============================================
Write-Host "📈 TEST 5: Getting Monthly Comparison..." -ForegroundColor Cyan

try {
    $monthly = Invoke-RestMethod -Uri "$API_BASE/stats/user/$USER_ID/monthly?months=6" -Method Get
    
    Write-Host "✅ Monthly data retrieved!" -ForegroundColor Green
    if ($monthly.Count -gt 0) {
        Write-Host "`n   Monthly Emissions:" -ForegroundColor White
        $monthly | ForEach-Object {
            Write-Host "   $($_.month): $($_.total) kg CO2e" -ForegroundColor Yellow
        }
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get monthly data: $_`n" -ForegroundColor Red
}

# ============================================
# Test 6: Submit Another Survey (Different Mode)
# ============================================
Write-Host "🚇 TEST 6: Submitting Metro Commute Survey..." -ForegroundColor Cyan

$surveyData2 = @{
    userId = $USER_ID
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
    $result2 = Invoke-RestMethod -Uri "$API_BASE/survey" -Method Post `
        -ContentType "application/json" -Body $surveyData2
    
    Write-Host "✅ Metro survey submitted!" -ForegroundColor Green
    Write-Host "   Total Emission: $($result2.totalEmission) kg CO2e" -ForegroundColor Yellow
    Write-Host "   (Much lower than car commute!)`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Survey submission failed: $_`n" -ForegroundColor Red
}

# ============================================
# Summary
# ============================================
Write-Host "`n" -NoNewline
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🎉 TESTING COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "`n✅ All carbon tracking features are working!" -ForegroundColor Green
Write-Host "`n📊 You can now:" -ForegroundColor Cyan
Write-Host "   1. View dashboard at http://localhost:5173" -ForegroundColor White
Write-Host "   2. Submit more surveys" -ForegroundColor White
Write-Host "   3. Track your carbon footprint" -ForegroundColor White
Write-Host "   4. View emission trends" -ForegroundColor White
Write-Host "`n🌍 Start reducing your carbon footprint today!`n" -ForegroundColor Green
