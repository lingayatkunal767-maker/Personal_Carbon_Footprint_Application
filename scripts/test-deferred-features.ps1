# Test Script for Deferred Features
# Run this script to validate deferred feature APIs.

$ErrorActionPreference = "Stop"

Write-Host "DEFERRED FEATURES TESTER" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

$BaseUrl = "http://localhost:8081"
$UserId = 1

function Show-Result {
    param(
        [Parameter(Mandatory = $true)]$Response,
        [Parameter(Mandatory = $true)][string]$Description
    )
    Write-Host ("OK {0}" -f $Description) -ForegroundColor Green
    $Response | ConvertTo-Json -Depth 6 | Write-Host
    Write-Host ""
}

Write-Host "[1] Submitting surveys to trigger badges" -ForegroundColor Yellow
for ($i = 0; $i -lt 7; $i++) {
    $date = (Get-Date).AddDays(-$i).ToString("yyyy-MM-dd")
    $survey = @{
        userId = $UserId
        surveyDate = $date
        transportMode = "BIKE"
        distanceKmPerDay = 10
        fuelType = "NA"
        mealsVegPerWeek = 18
        mealsNonVegPerWeek = 3
        electricityKwhPerMonth = 120
        cookingGasCylindersPerMonth = 0.5
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/survey" -Method Post -Body $survey -ContentType "application/json"
        Write-Host ("   OK Survey submitted for {0} (totalEmission={1})" -f $date, $response.totalEmission) -ForegroundColor Gray
    } catch {
        Write-Host ("   ERROR Survey submit failed for {0}: {1}" -f $date, $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host "[2] Checking earned badges" -ForegroundColor Yellow
try {
    $badges = Invoke-RestMethod -Uri "$BaseUrl/api/badges/user/$UserId" -Method Get
    Show-Result -Response $badges -Description "Earned badges"
} catch {
    Write-Host ("ERROR Fetching badges failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[3] Creating reduction goals" -ForegroundColor Yellow
$goals = @(
    @{
        userId = $UserId
        goalType = "reduce_transport"
        targetValue = 5.0
        deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
        status = "active"
    },
    @{
        userId = $UserId
        goalType = "weekly_target"
        targetValue = 100.0
        deadline = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        status = "active"
    }
)

foreach ($goal in $goals) {
    try {
        $goalJson = $goal | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/goals" -Method Post -Body $goalJson -ContentType "application/json"
        Write-Host ("   OK Created goal: {0}" -f $response.goalType) -ForegroundColor Gray
    } catch {
        Write-Host ("   ERROR Creating goal {0}: {1}" -f $goal.goalType, $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host "[4] Reading goal progress" -ForegroundColor Yellow
try {
    $userGoals = Invoke-RestMethod -Uri "$BaseUrl/api/goals/user/$UserId" -Method Get
    Show-Result -Response $userGoals -Description "User goals with progress"
} catch {
    Write-Host ("ERROR Fetching goals failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[5] Reading notifications" -ForegroundColor Yellow
try {
    $notifications = Invoke-RestMethod -Uri "$BaseUrl/api/notifications/user/$UserId" -Method Get
    Show-Result -Response $notifications -Description "Notifications"

    $unreadCount = Invoke-RestMethod -Uri "$BaseUrl/api/notifications/user/$UserId/unread/count" -Method Get
    Write-Host ("Unread notifications: {0}" -f $unreadCount.unreadCount) -ForegroundColor Cyan
} catch {
    Write-Host ("ERROR Fetching notifications failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[6] Fetching marketplace products" -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$BaseUrl/api/marketplace/products" -Method Get
    $count = @($products).Count
    Write-Host ("OK Found {0} products" -f $count) -ForegroundColor Green

    if ($count -gt 0) {
        $product = @($products)[0]
        Write-Host ("   Name: {0}" -f $product.name) -ForegroundColor Gray
        Write-Host ("   Category: {0}" -f $product.category) -ForegroundColor Gray
        Write-Host ("   Price: {0}" -f $product.price) -ForegroundColor Gray
        Write-Host ("   Carbon Saving: {0} kg CO2e/year" -f $product.carbonSaving) -ForegroundColor Gray
    }
} catch {
    Write-Host ("ERROR Fetching products failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[7] Fetching reusable products" -ForegroundColor Yellow
try {
    $reusableProducts = Invoke-RestMethod -Uri "$BaseUrl/api/marketplace/products/category/REUSABLE" -Method Get
    Write-Host ("OK Found {0} reusable products" -f @($reusableProducts).Count) -ForegroundColor Green
} catch {
    Write-Host ("ERROR Fetching reusable products failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[8] Creating and confirming an order" -ForegroundColor Yellow
try {
    $allProducts = Invoke-RestMethod -Uri "$BaseUrl/api/marketplace/products" -Method Get
    $productsArr = @($allProducts)

    if ($productsArr.Count -ge 2) {
        $order = @{
            userId = $UserId
            items = @{
                "$($productsArr[0].id)" = 1
                "$($productsArr[1].id)" = 2
            }
            shippingAddress = "123 Green Street, EcoCity, EC 12345"
            contactPhone = "+1234567890"
            paymentMethod = "COD"
            ecoPointsUsed = 0
        } | ConvertTo-Json -Depth 5

        $orderResponse = Invoke-RestMethod -Uri "$BaseUrl/api/marketplace/orders" -Method Post -Body $order -ContentType "application/json"
        Show-Result -Response $orderResponse -Description "Created order"

        $orderId = $orderResponse.id
        $confirmResponse = Invoke-RestMethod -Uri "$BaseUrl/api/marketplace/orders/$orderId/confirm" -Method Put
        Write-Host ("OK Order confirmed: {0}" -f $confirmResponse.message) -ForegroundColor Green
    } else {
        Write-Host "WARN Not enough products to create an order. Load seed data first." -ForegroundColor Yellow
    }
} catch {
    Write-Host ("ERROR Creating/confirming order failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[9] Fetching user orders" -ForegroundColor Yellow
try {
    $orders = Invoke-RestMethod -Uri "$BaseUrl/api/marketplace/orders/user/$UserId" -Method Get
    Show-Result -Response $orders -Description "User orders"
} catch {
    Write-Host ("ERROR Fetching orders failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[10] Marking first notification as read" -ForegroundColor Yellow
try {
    $allNotifications = Invoke-RestMethod -Uri "$BaseUrl/api/notifications/user/$UserId" -Method Get
    $allNotificationsArr = @($allNotifications)
    if ($allNotificationsArr.Count -gt 0) {
        $firstNotificationId = $allNotificationsArr[0].id
        $markReadResponse = Invoke-RestMethod -Uri "$BaseUrl/api/notifications/$firstNotificationId/read" -Method Put
        Write-Host ("OK {0}" -f $markReadResponse.message) -ForegroundColor Green
    } else {
        Write-Host "WARN No notifications to mark as read" -ForegroundColor Yellow
    }
} catch {
    Write-Host ("ERROR Marking notification failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[11] Fetching dashboard data" -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard/user/$UserId" -Method Get
    Show-Result -Response $dashboard -Description "Dashboard summary"
} catch {
    Write-Host ("ERROR Fetching dashboard failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "[12] Fetching leaderboard" -ForegroundColor Yellow
try {
    $leaderboard = Invoke-RestMethod -Uri "$BaseUrl/api/leaderboard?limit=10" -Method Get
    Show-Result -Response $leaderboard -Description "Top 10 leaderboard"
} catch {
    Write-Host ("ERROR Fetching leaderboard failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
}

Write-Host "`n========================" -ForegroundColor Cyan
Write-Host "DEFERRED TEST COMPLETE" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
