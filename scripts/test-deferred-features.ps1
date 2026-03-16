# Test Script for Deferred Features
# Run this script to test all newly implemented features

Write-Host "🧪 Testing Deferred Features Implementation" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8081"
$userId = 1

# Function to display results
function Show-Result {
    param($response, $description)
    Write-Host "✅ $description" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
    Write-Host ""
}

# Test 1: Submit multiple surveys to trigger badge earning
Write-Host "`n📊 Test 1: Submitting surveys to earn badges..." -ForegroundColor Yellow

for ($i = 0; $i -lt 7; $i++) {
    $date = (Get-Date).AddDays(-$i).ToString("yyyy-MM-dd")
    $survey = @{
        userId = $userId
        surveyDate = $date
        transportMode = "Bicycle"
        distanceKmPerDay = 10
        fuelType = "None"
        mealsVegPerWeek = 18
        mealsNonVegPerWeek = 3
        electricityKwhPerMonth = 120
        cookingGasCylindersPerMonth = 0.5
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/survey" -Method POST -Body $survey -ContentType "application/json"
        Write-Host "  ✓ Survey submitted for $date - Total Emission: $($response.totalEmission) kg CO2e" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ Error submitting survey for $date" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 2: Check earned badges
Write-Host "`n🏆 Test 2: Checking earned badges..." -ForegroundColor Yellow
try {
    $badges = Invoke-RestMethod -Uri "$baseUrl/api/badges/user/$userId" -Method GET
    Show-Result $badges "Earned Badges (should include 'First Step' and 'Week Warrior'):"
} catch {
    Write-Host "✗ Error fetching badges" -ForegroundColor Red
}

# Test 3: Create goals
Write-Host "`n🎯 Test 3: Creating carbon reduction goals..." -ForegroundColor Yellow

$goals = @(
    @{
        userId = $userId
        goalType = "reduce_transport"
        targetValue = 5.0
        deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
        status = "active"
    },
    @{
        userId = $userId
        goalType = "weekly_target"
        targetValue = 100.0
        deadline = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        status = "active"
    }
)

foreach ($goal in $goals) {
    try {
        $goalJson = $goal | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/goals" -Method POST -Body $goalJson -ContentType "application/json"
        Write-Host "  ✓ Created goal: $($response.goalType)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ Error creating goal: $($goal.goalType)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# Test 4: Check goal progress
Write-Host "`n📈 Test 4: Checking goal progress (should auto-update from surveys)..." -ForegroundColor Yellow
try {
    $userGoals = Invoke-RestMethod -Uri "$baseUrl/api/goals/user/$userId" -Method GET
    Show-Result $userGoals "User Goals with Progress:"
} catch {
    Write-Host "✗ Error fetching goals" -ForegroundColor Red
}

# Test 5: Check notifications
Write-Host "`n📬 Test 5: Checking notifications..." -ForegroundColor Yellow
try {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications/user/$userId" -Method GET
    Show-Result $notifications "Notifications (badges earned, goal progress):"
    
    $unreadCount = Invoke-RestMethod -Uri "$baseUrl/api/notifications/user/$userId/unread/count" -Method GET
    Write-Host "Unread notifications: $($unreadCount.unreadCount)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error fetching notifications" -ForegroundColor Red
}

# Test 6: Get marketplace products
Write-Host "`n🛒 Test 6: Fetching marketplace products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/marketplace/products" -Method GET
    Write-Host "✅ Found $($products.Count) products in marketplace" -ForegroundColor Green
    
    if ($products.Count -gt 0) {
        $product = $products[0]
        Write-Host "`nSample Product:" -ForegroundColor Cyan
        Write-Host "  Name: $($product.name)" -ForegroundColor Gray
        Write-Host "  Category: $($product.category)" -ForegroundColor Gray
        Write-Host "  Price: `$$($product.price)" -ForegroundColor Gray
        Write-Host "  Carbon Saving: $($product.carbonSaving) kg CO2e/year" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error fetching products" -ForegroundColor Red
}

# Test 7: Get products by category
Write-Host "`n📦 Test 7: Fetching products by category (REUSABLE)..." -ForegroundColor Yellow
try {
    $reusableProducts = Invoke-RestMethod -Uri "$baseUrl/api/marketplace/products/category/REUSABLE" -Method GET
    Write-Host "✅ Found $($reusableProducts.Count) reusable products" -ForegroundColor Green
} catch {
    Write-Host "✗ Error fetching category products" -ForegroundColor Red
}

# Test 8: Create an order
Write-Host "`n🛍️ Test 8: Creating a marketplace order..." -ForegroundColor Yellow
try {
    $allProducts = Invoke-RestMethod -Uri "$baseUrl/api/marketplace/products" -Method GET
    if ($allProducts.Count -ge 2) {
        $order = @{
            userId = $userId
            items = @{
                "$($allProducts[0].id)" = 1
                "$($allProducts[1].id)" = 2
            }
            shippingAddress = "123 Green Street, EcoCity, EC 12345"
            contactPhone = "+1234567890"
            useEcoPoints = $false
        } | ConvertTo-Json

        $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/marketplace/orders" -Method POST -Body $order -ContentType "application/json"
        Show-Result $orderResponse "Created Order:"
        
        $orderId = $orderResponse.id
        
        # Test 9: Confirm the order
        Write-Host "`n✔️ Test 9: Confirming order..." -ForegroundColor Yellow
        $confirmResponse = Invoke-RestMethod -Uri "$baseUrl/api/marketplace/orders/$orderId/confirm" -Method PUT
        Write-Host "✅ Order confirmed: $($confirmResponse.message)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Not enough products in marketplace to create order. Run seed-marketplace.sql first." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error creating/confirming order: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get user orders
Write-Host "`n📋 Test 10: Fetching user orders..." -ForegroundColor Yellow
try {
    $orders = Invoke-RestMethod -Uri "$baseUrl/api/marketplace/orders/user/$userId" -Method GET
    Show-Result $orders "User Orders:"
} catch {
    Write-Host "✗ Error fetching orders" -ForegroundColor Red
}

# Test 11: Mark notification as read
Write-Host "`n✅ Test 11: Marking notifications as read..." -ForegroundColor Yellow
try {
    $allNotifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications/user/$userId" -Method GET
    if ($allNotifications.Count -gt 0) {
        $firstNotificationId = $allNotifications[0].id
        $markReadResponse = Invoke-RestMethod -Uri "$baseUrl/api/notifications/$firstNotificationId/read" -Method PUT
        Write-Host "✅ $($markReadResponse.message)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No notifications to mark as read" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error marking notification as read" -ForegroundColor Red
}

# Test 12: Get dashboard data
Write-Host "`n📊 Test 12: Fetching dashboard data..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/user/$userId" -Method GET
    Show-Result $dashboard "Dashboard Summary:"
} catch {
    Write-Host "✗ Error fetching dashboard (Note: DashboardService needs to be implemented if missing)" -ForegroundColor Red
}

# Test 13: Get leaderboard
Write-Host "`n🏅 Test 13: Fetching leaderboard..." -ForegroundColor Yellow
try {
    $leaderboard = Invoke-RestMethod -Uri "$baseUrl/api/leaderboard/top?limit=10" -Method GET
    Show-Result $leaderboard "Top 10 Leaderboard:"
} catch {
    Write-Host "✗ Error fetching leaderboard" -ForegroundColor Red
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host "`nSummary of Tested Features:" -ForegroundColor Cyan
Write-Host "  ✓ Badge auto-awarding" -ForegroundColor Gray
Write-Host "  ✓ Goal progress tracking" -ForegroundColor Gray
Write-Host "  ✓ Notifications system" -ForegroundColor Gray
Write-Host "  ✓ Marketplace products" -ForegroundColor Gray
Write-Host "  ✓ Order creation and management" -ForegroundColor Gray
Write-Host "  ✓ Dashboard integration" -ForegroundColor Gray
Write-Host "  ✓ Leaderboard rankings" -ForegroundColor Gray
Write-Host "`n" -ForegroundColor Cyan
