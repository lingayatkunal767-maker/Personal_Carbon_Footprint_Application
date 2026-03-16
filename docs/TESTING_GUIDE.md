# 🧪 Testing Carbon Tracking Features

## Quick Test Guide

Follow these steps to test all carbon tracking features end-to-end.

---

## Prerequisites

✅ PostgreSQL running on port 5432  
✅ Database `sustainability_tracker` created  
✅ Schema and seed data loaded  
✅ Backend running on port 8081  
✅ Frontend running on port 5173  

---

## Step 1: Load Test Data

```bash
# From project root
cd database
psql -U tracker_user -d sustainability_tracker -f test-data-carbon-tracking.sql
```

This will create:
- 30 days of lifestyle survey data
- 30 days of carbon log entries
- Sample user with ID = 1

---

## Step 2: Test Backend APIs

### A. Test Survey Submission

```bash
curl -X POST http://localhost:8081/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "transportMode": "CAR",
    "distanceKmPerDay": 20,
    "fuelType": "PETROL",
    "mealsNonVegPerWeek": 7,
    "mealsVegPerWeek": 14,
    "electricityKwhPerMonth": 300,
    "cookingGasCylindersPerMonth": 1.5
  }'
```

**Expected Response:**
```json
{
  "surveyId": 31,
  "logDate": "2024-03-11",
  "transportEmission": 3.84,
  "foodEmission": 4.90,
  "energyEmission": 10.33,
  "totalEmission": 19.07
}
```

### B. Test Dashboard API

```bash
curl http://localhost:8081/api/dashboard/user/1 | json_pp
```

**Expected: Complete dashboard data with stats, logs, breakdowns**

### C. Test Carbon Logs

```bash
curl "http://localhost:8081/api/carbon/logs?userId=1" | json_pp
```

**Expected: Array of carbon logs with dates and emissions**

### D. Test Stats API

```bash
# User stats
curl http://localhost:8081/api/stats/user/1 | json_pp

# Monthly comparison
curl http://localhost:8081/api/stats/user/1/monthly?months=6 | json_pp

# Emissions breakdown
curl http://localhost:8081/api/stats/user/1/breakdown | json_pp
```

---

## Step 3: Test Frontend Integration

### A. Open Frontend
Navigate to: http://localhost:5173

### B. Login
Use the login page to authenticate with Google OAuth or test credentials.

### C. Navigate to Lifestyle Survey
1. Click on "Lifestyle Survey" in sidebar
2. Fill out the form with test data:
   - **Transport**: Car
   - **Distance**: 20 km/day
   - **Fuel**: Petrol
   - **Non-veg meals**: 7 per week
   - **Veg meals**: 14 per week
   - **Electricity**: 300 kWh/month
   - **Cooking gas**: 1.5 cylinders/month
3. Click "Calculate Footprint"

### D. View Dashboard
1. Navigate to Dashboard
2. Verify you see:
   - ✅ Total emissions card
   - ✅ Category breakdown chart (Transport, Food, Energy)
   - ✅ Emission trend chart
   - ✅ Monthly comparison
   - ✅ Recent activity log

### E. View Carbon History
1. Click "Carbon History" in sidebar
2. Verify:
   - ✅ Table view of all logs
   - ✅ Date, emissions by category, total
   - ✅ Filtering options
   - ✅ Export button (if implemented)

---

## Step 4: Verify Database

```sql
-- Check total logs
SELECT COUNT(*) FROM carbon_logs WHERE user_id = 1;
-- Expected: 31 (30 from test data + 1 from manual submission)

-- Check latest log
SELECT * FROM carbon_logs 
WHERE user_id = 1 
ORDER BY log_date DESC 
LIMIT 1;

-- Check emissions trend (last 7 days)
SELECT 
  log_date,
  ROUND(total_emission::numeric, 2) as total,
  ROUND(transport_emission::numeric, 2) as transport,
  ROUND(food_emission::numeric, 2) as food,
  ROUND(energy_emission::numeric, 2) as energy
FROM carbon_logs 
WHERE user_id = 1 
  AND log_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY log_date;

-- Check monthly totals
SELECT 
  TO_CHAR(log_date, 'YYYY-MM') as month,
  COUNT(*) as days,
  ROUND(SUM(total_emission)::numeric, 2) as total_emissions,
  ROUND(AVG(total_emission)::numeric, 2) as avg_daily
FROM carbon_logs 
WHERE user_id = 1
GROUP BY TO_CHAR(log_date, 'YYYY-MM')
ORDER BY month DESC;
```

---

## Step 5: Test Edge Cases

### A. Duplicate Survey for Same Day
```bash
curl -X POST http://localhost:8081/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "surveyDate": "2024-03-11",
    "transportMode": "BUS",
    "distanceKmPerDay": 15,
    "fuelType": "NA",
    "mealsNonVegPerWeek": 5,
    "mealsVegPerWeek": 16,
    "electricityKwhPerMonth": 250,
    "cookingGasCylindersPerMonth": 1.0
  }'
```

**Expected: Updates existing log for that date**

### B. Invalid Transport Mode
```bash
curl -X POST http://localhost:8081/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "transportMode": "INVALID",
    "distanceKmPerDay": 10,
    "fuelType": "PETROL"
  }'
```

**Expected: 400 Bad Request with validation error**

### C. Invalid Fuel Type for Transport
```bash
curl -X POST http://localhost:8081/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "transportMode": "WALK",
    "distanceKmPerDay": 5,
    "fuelType": "PETROL"
  }'
```

**Expected: 400 Bad Request (WALK should have NA fuel type)**

### D. Zero Values
```bash
curl -X POST http://localhost:8081/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "transportMode": "WALK",
    "distanceKmPerDay": 0,
    "fuelType": "NA",
    "mealsNonVegPerWeek": 0,
    "mealsVegPerWeek": 21,
    "electricityKwhPerMonth": 0,
    "cookingGasCylindersPerMonth": 0
  }'
```

**Expected: Success with low emissions**

---

## Step 6: Performance Testing

### A. Load Test (Optional)
```bash
# Install Apache Bench if needed: sudo apt-get install apache2-utils

# Test survey endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -T "application/json" -p survey-payload.json \
  http://localhost:8081/api/survey

# Test dashboard endpoint
ab -n 100 -c 10 http://localhost:8081/api/dashboard/user/1
```

### B. Database Query Performance
```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM carbon_logs 
WHERE user_id = 1 
  AND log_date BETWEEN '2024-02-01' AND '2024-03-11';

-- Should use index on (user_id, log_date)
```

---

## Expected Results Summary

### ✅ Survey Submission
- Returns calculated emissions for all categories
- Creates or updates carbon_log entry
- Stores lifestyle_survey entry

### ✅ Dashboard
- Shows aggregated statistics
- Displays recent logs (last 30 days)
- Monthly comparison (6 months)
- Category breakdown with percentages
- Weekly total and change percentage

### ✅ Carbon Logs
- Returns chronological list of emissions
- Date range filtering works
- All categories populated correctly

### ✅ Database
- No duplicate entries for same user + date
- Emissions calculated correctly per formula
- Timestamps updated properly

---

## Troubleshooting

### Issue: "User not found"
**Solution:** Ensure test user exists:
```sql
INSERT INTO users (name, email, password_hash) 
VALUES ('Test User', 'test@example.com', 'hash')
ON CONFLICT DO NOTHING;
```

### Issue: "Cannot connect to database"
**Solution:** Check PostgreSQL is running:
```bash
pg_isready -U tracker_user -d sustainability_tracker
```

### Issue: "CORS error"
**Solution:** Check application.properties:
```properties
app.cors.allowed-origins=http://localhost:5173
```

### Issue: "Column 'xyz' does not exist"
**Solution:** Reload schema:
```bash
psql -U tracker_user -d sustainability_tracker -f schema.sql
```

---

## Test Checklist

- [ ] Test data loaded successfully
- [ ] Survey submission works
- [ ] Emissions calculated correctly
- [ ] Carbon logs created/updated
- [ ] Dashboard API returns all data
- [ ] Frontend displays survey form
- [ ] Frontend displays dashboard
- [ ] Charts render correctly
- [ ] Date filtering works
- [ ] Validation errors handled
- [ ] Database constraints enforced
- [ ] Performance acceptable (<500ms)

---

## 🎉 Success Criteria

If all tests pass, you should see:
1. ✅ 30+ carbon log entries in database
2. ✅ Dashboard showing realistic emission data
3. ✅ Charts displaying trends
4. ✅ Category breakdowns with percentages
5. ✅ New survey submissions working
6. ✅ Historical data visible
7. ✅ No console errors
8. ✅ API responses < 500ms

**Your carbon tracking system is fully operational!** 🌍
