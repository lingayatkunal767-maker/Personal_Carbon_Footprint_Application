# Deferred Features Implementation Guide

## Overview
This guide documents the implementation of features that were originally deferred but are now fully integrated into the Sustainability Tracker platform.

## ✅ Implemented Features

### 1. **Badge Auto-Awarding System** 🏆

Badges are automatically awarded when users achieve specific milestones during their carbon tracking journey.

#### Badge Types

**Milestone Badges:**
- **First Step** - Complete your first carbon log
- **Carbon Conscious** - Track over 100 kg of CO2e
- **Data Driven** - Track over 1000 kg of CO2e

**Streak Badges:**
- **Week Warrior** - Log carbon footprint for 7 consecutive days
- **Month Master** - 30-day logging streak
- **Century Champion** - 100 days of consistent tracking

**Achievement Badges:**
- **Goal Getter** - Complete your first carbon reduction goal
- **Goal Master** - Complete 5 carbon reduction goals
- **Eco Warrior** - Maintain low emissions (< 10 kg/day) for 5 days

**Category Badges:**
- **Green Commuter** - Average transport emissions below 2 kg/day
- **Plant Pioneer** - Average food emissions below 3 kg/day
- **Energy Saver** - Average energy emissions below 5 kg/day

#### How It Works

1. User submits a lifestyle survey via `POST /api/survey`
2. System calculates carbon emissions and creates a carbon log
3. `BadgeEarningService` automatically checks all badge criteria
4. New badges are awarded if criteria are met
5. User receives a notification about the badge earned

#### Technical Details

**Service:** `BadgeEarningService.java`
- `checkAndAwardBadges(userId)` - Main method called after each survey
- Individual check methods for each badge category
- `calculateStreak(userId)` - Calculates consecutive logging days
- `awardBadge()` - Creates badge and sends notification

**Integration Points:**
- Called from `SurveyService.processSurvey()` after carbon log creation
- Notifies user via `NotificationService.notifyBadgeEarned()`

---

### 2. **Goal Progress Tracking Automation** 🎯

Goals automatically update their progress based on carbon log data, with milestone notifications.

#### Goal Types Supported

1. **reduce_transport** - Reduce transport emissions
2. **reduce_food** - Reduce food emissions
3. **reduce_energy** - Reduce energy emissions
4. **reduce_total** / **overall_reduction** - Reduce total emissions
5. **weekly_target** - Weekly logging consistency
6. **monthly_target** - Monthly logging consistency

#### How It Works

1. User creates a goal via `POST /api/goals`
2. After each survey submission, `GoalService.updateGoalProgress()` is called
3. System calculates progress based on goal type:
   - **Category goals**: Compares first half vs second half of logs to measure reduction
   - **Weekly/Monthly targets**: Calculates percentage of days logged
4. `currentValue` field is updated automatically
5. Notifications sent at 25%, 50%, 75% milestones
6. Goal marked as "completed" when `currentValue >= targetValue`

#### Progress Calculation Methods

**Category Reduction:**
```
Average emission (first half) - Average emission (second half) = Reduction
```

**Total Reduction:**
```
Average total emission (first half) - Average total emission (second half) = Reduction
```

**Weekly Progress:**
```
(Days logged this week / 7) × 100 = Progress %
```

**Monthly Progress:**
```
(Days logged this month / Days in month) × 100 = Progress %
```

#### Technical Details

**Service:** `GoalService.java`
- `updateGoalProgress(userId)` - Updates all active goals for a user
- `updateSingleGoalProgress(goal)` - Updates individual goal
- `calculateCategoryReduction()` - Calculates emission reduction for specific category
- `calculateTotalReduction()` - Calculates overall emission reduction
- `calculateWeeklyProgress()` / `calculateMonthlyProgress()` - Calculates consistency progress

**Integration Points:**
- Called from `SurveyService.processSurvey()` after carbon log creation
- Sends notifications via `NotificationService` at milestones and completion

---

### 3. **Notifications System** 📬

Comprehensive notification system for user engagement and alerts.

#### Notification Types

1. **BADGE_EARNED** - User earned a new badge
2. **GOAL_PROGRESS** - Goal progress milestone reached (25%, 50%, 75%)
3. **GOAL_COMPLETED** - User completed a goal
4. **HIGH_EMISSIONS** - Emissions exceed normal levels (warning)
5. **REMINDER** - General reminders to log activities
6. **MARKETPLACE** - Order confirmations and updates

#### Priority Levels
- **LOW** - General reminders
- **NORMAL** - Progress updates
- **HIGH** - Badge earned, goal completed
- **URGENT** - High emissions warning

#### Notification Features

- Mark as read/unread
- Mark all as read
- Get unread count
- Link to related entities (Goal, Badge, Order)
- Action URLs for deep linking

#### API Endpoints

```
GET    /api/notifications/user/{userId}              - Get all notifications
GET    /api/notifications/user/{userId}/unread       - Get unread notifications
GET    /api/notifications/user/{userId}/unread/count - Get unread count
PUT    /api/notifications/{id}/read                  - Mark notification as read
PUT    /api/notifications/user/{userId}/read-all     - Mark all as read
```

#### Technical Details

**Entity:** `Notification.java`
- Fields: id, user, notificationType, title, message, isRead, priority, relatedEntityType, relatedEntityId, actionUrl, createdAt, readAt

**Service:** `NotificationService.java`
- `createNotification()` - Generic notification creation
- `notifyBadgeEarned()` - Badge notification
- `notifyGoalProgress()` - Goal progress notification
- `notifyGoalCompleted()` - Goal completion notification
- `notifyHighEmissions()` - High emissions warning
- `notifyOrderConfirmed()` - Order confirmation

**Controller:** `NotificationController.java`

---

### 4. **Marketplace System** 🛒

Eco-friendly product marketplace with order management and eco-points payment.

#### Product Categories

1. **REUSABLE** - Reusable bags, bottles, containers
2. **ENERGY_EFFICIENT** - LED bulbs, solar chargers, smart devices
3. **SUSTAINABLE_FASHION** - Organic clothing, hemp shoes
4. **ORGANIC_FOOD** - Organic produce, plant-based products
5. **ECO_TRANSPORT** - E-bikes, e-scooters, bike accessories
6. **HOME_GARDEN** - Composting bins, herb gardens, rain barrels

#### Product Features

- **Carbon Saving**: Estimated CO2e saved per year by using the product
- **Eco Points Price**: Alternative payment using eco points
- **Stock Management**: Automatic stock reduction on order
- **Ratings & Reviews**: Product rating system
- **Sustainability Score**: 0-10 rating of product sustainability

#### Order Workflow

1. **PENDING** - Order created, payment processing
2. **CONFIRMED** - Payment confirmed, preparing shipment
3. **SHIPPED** - Order shipped to customer
4. **DELIVERED** - Order delivered successfully
5. **CANCELLED** - Order cancelled (stock restored)

#### Payment Methods

- **CREDIT_CARD** - Standard payment
- **ECO_POINTS** - Pay with earned eco points
- **MIXED** - Combination of both

#### API Endpoints

**Products:**
```
GET    /api/marketplace/products                    - Get all active products
GET    /api/marketplace/products/category/{category} - Get products by category
GET    /api/marketplace/products/in-stock           - Get products in stock
GET    /api/marketplace/products/{id}               - Get product details
```

**Orders:**
```
POST   /api/marketplace/orders                      - Create order
GET    /api/marketplace/orders/user/{userId}        - Get user orders
GET    /api/marketplace/orders/{orderNumber}        - Get order by number
PUT    /api/marketplace/orders/{id}/confirm         - Confirm order
PUT    /api/marketplace/orders/{id}/ship            - Ship order
PUT    /api/marketplace/orders/{id}/deliver         - Deliver order
PUT    /api/marketplace/orders/{id}/cancel          - Cancel order
```

#### Create Order Request Format

```json
{
  "userId": 1,
  "items": {
    "1": 2,    // Product ID 1, quantity 2
    "5": 1     // Product ID 5, quantity 1
  },
  "shippingAddress": "123 Green St, EcoCity, EC 12345",
  "contactPhone": "+1234567890",
  "useEcoPoints": false
}
```

#### Technical Details

**Entities:**
- `Product.java` - Marketplace products
- `Order.java` - Customer orders
- `OrderItem.java` - Individual items in orders

**Service:** `MarketplaceService.java`
- `createOrder()` - Creates order, validates stock, reduces inventory
- `confirmOrder()` - Confirms order and sends notification
- `cancelOrder()` - Cancels order and restores stock

**Controller:** `MarketplaceController.java`

**Sample Data:** `database/seed-marketplace.sql` - 24 sample eco-friendly products

---

### 5. **Enhanced Leaderboard Scoring** 🏆

The existing leaderboard materialized view is maintained with manual refresh capability.

#### Leaderboard Metrics

- **Badge Count** - Number of badges earned
- **Total Carbon Saved** - Total carbon emissions tracked
- **Rank** - User ranking based on carbon saved

#### API Endpoints

```
GET    /api/leaderboard/top?limit=10                - Get top users
POST   /api/leaderboard/refresh                     - Refresh leaderboard
```

#### Refresh Mechanism

The leaderboard is a materialized view that must be manually refreshed:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
```

Call `POST /api/leaderboard/refresh` to update rankings after significant activity.

---

## Database Schema Updates

### New Tables

1. **notifications** - User notifications and alerts
2. **products** - Marketplace eco-friendly products
3. **orders** - Customer orders
4. **order_items** - Line items in orders
5. **lifestyle_surveys** - Detailed lifestyle survey data
6. **carbon_logs** - Calculated carbon emissions

### Schema File
Updated schema: `database/schema.sql`
Marketplace seed data: `database/seed-marketplace.sql`

---

## Integration Flow

### Complete User Journey

1. **User signs up** → Account created
2. **Submits lifestyle survey** → `POST /api/survey`
3. **System calculates emissions** → `CarbonCalculationService`
4. **Carbon log created** → `carbon_logs` table
5. **Goal progress updated** → `GoalService.updateGoalProgress()`
6. **Badges checked and awarded** → `BadgeEarningService.checkAndAwardBadges()`
7. **Notifications created** → Badge earned, goal progress alerts
8. **User views dashboard** → `GET /api/dashboard/user/{id}`
9. **User shops marketplace** → Browses eco-products
10. **User places order** → `POST /api/marketplace/orders`
11. **Order confirmation sent** → Notification created

---

## Testing the Features

### 1. Test Badge Awarding

```powershell
# Submit 7 surveys on consecutive days
for ($i = 0; $i -lt 7; $i++) {
    $date = (Get-Date).AddDays(-$i).ToString("yyyy-MM-dd")
    $body = @{
        userId = 1
        surveyDate = $date
        transportMode = "Bicycle"
        distanceKmPerDay = 10
        mealsVegPerWeek = 21
        electricityKwhPerMonth = 120
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:8081/api/survey" -Method POST -Body $body -ContentType "application/json"
}

# Check badges
Invoke-RestMethod -Uri "http://localhost:8081/api/badges/user/1" -Method GET
```

### 2. Test Goal Progress

```powershell
# Create a goal
$goal = @{
    userId = 1
    goalType = "reduce_transport"
    targetValue = 5.0
    deadline = "2024-12-31"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/goals" -Method POST -Body $goal -ContentType "application/json"

# Submit surveys to trigger progress update
# (Goal progress updates automatically after each survey)

# Check goal progress
Invoke-RestMethod -Uri "http://localhost:8081/api/goals/user/1" -Method GET
```

### 3. Test Notifications

```powershell
# Get all notifications
Invoke-RestMethod -Uri "http://localhost:8081/api/notifications/user/1" -Method GET

# Get unread count
Invoke-RestMethod -Uri "http://localhost:8081/api/notifications/user/1/unread/count" -Method GET

# Mark as read
Invoke-RestMethod -Uri "http://localhost:8081/api/notifications/1/read" -Method PUT
```

### 4. Test Marketplace

```powershell
# Get all products
Invoke-RestMethod -Uri "http://localhost:8081/api/marketplace/products" -Method GET

# Get products by category
Invoke-RestMethod -Uri "http://localhost:8081/api/marketplace/products/category/REUSABLE" -Method GET

# Create an order
$order = @{
    userId = 1
    items = @{
        "1" = 2
        "5" = 1
    }
    shippingAddress = "123 Green St, EcoCity, EC 12345"
    contactPhone = "+1234567890"
    useEcoPoints = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/marketplace/orders" -Method POST -Body $order -ContentType "application/json"

# Get user orders
Invoke-RestMethod -Uri "http://localhost:8081/api/marketplace/orders/user/1" -Method GET
```

---

## Performance Considerations

### Badge Earning Service
- Runs after each survey submission
- Lightweight queries with indexed lookups
- Only checks badges not already earned (prevents duplicates)

### Goal Progress Updates
- Automatically triggered on survey submission
- Processes only active goals for the user
- Efficient date range queries with indexes

### Notifications
- Uses composite index on (user_id, is_read)
- Ordered by created_at DESC with index
- Lightweight queries for unread count

### Leaderboard
- Uses materialized view for fast reads
- Requires manual refresh (call refresh endpoint)
- Concurrent refresh to avoid blocking

---

## Configuration Requirements

No additional configuration needed beyond existing setup. All features use the existing Spring Boot and PostgreSQL configuration.

Ensure database schema is updated:
```powershell
psql -U tracker_user -d sustainability_tracker -f database/schema.sql
psql -U tracker_user -d sustainability_tracker -f database/seed-marketplace.sql
```

---

## Frontend Integration Points

### Badge Display
- Fetch badges: `GET /api/badges/user/{userId}`
- Display badge cards with icons and descriptions
- Show earning date

### Goal Progress
- Fetch goals: `GET /api/goals/user/{userId}`
- Display progress bar: `(currentValue / targetValue) × 100`
- Show goal status and deadline

### Notifications
- Fetch unread count for badge indicator
- Poll `GET /api/notifications/user/{userId}/unread/count` periodically
- Display notification panel with list
- Mark as read on click

### Marketplace
- Product listing page with category filters
- Product detail page with carbon saving info
- Shopping cart and checkout flow
- Order history page

---

## Next Steps

1. **Frontend Implementation**: Build React components for new features
2. **Email Notifications**: Add email service for important notifications
3. **Push Notifications**: Integrate web push for real-time alerts
4. **Analytics Dashboard**: Admin dashboard for marketplace metrics
5. **Review System**: Add product reviews and ratings
6. **Eco Points Earning**: Implement eco points earning mechanism

---

## Support

For issues or questions about these features:
- Check API Reference: `docs/API_REFERENCE.md`
- Review Carbon Tracking Guide: `docs/CARBON_TRACKING.md`
- Check error logs in console output
- Verify database schema is up to date
