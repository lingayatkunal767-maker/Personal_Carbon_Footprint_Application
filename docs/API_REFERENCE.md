# 📖 API Quick Reference

## Base URL
```
http://localhost:8081/api
```

---

## 🔐 Authentication

### Google OAuth Login
```http
POST /auth/google
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "googleId": "123456789",
  "profilePicture": "https://..."
}
```

### Email/Password Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📊 Lifestyle Survey

### Submit Survey
```http
POST /survey
Content-Type: application/json

{
  "userId": 1,
  "surveyDate": "2024-03-11",          // Optional, defaults to today
  "transportMode": "CAR",               // CAR, BUS, TRAIN, WALK, BIKE, AUTO, METRO
  "distanceKmPerDay": 20.0,
  "fuelType": "PETROL",                 // PETROL, DIESEL, EV, NA
  "mealsNonVegPerWeek": 7,              // 0-21
  "mealsVegPerWeek": 14,                // 0-21
  "electricityKwhPerMonth": 300.0,
  "cookingGasCylindersPerMonth": 1.5
}

Response 201:
{
  "surveyId": 123,
  "logDate": "2024-03-11",
  "transportEmission": 3.84,
  "foodEmission": 4.90,
  "energyEmission": 10.33,
  "totalEmission": 19.07
}
```

---

## 📈 Carbon Logs

### Get Carbon Logs
```http
GET /carbon/logs?userId=1&from=2024-02-01&to=2024-03-11

Response 200:
[
  {
    "logDate": "2024-03-11",
    "transportEmission": 3.84,
    "foodEmission": 4.90,
    "energyEmission": 10.33,
    "totalEmission": 19.07
  },
  ...
]
```

---

## 📊 Dashboard

### Get Complete Dashboard
```http
GET /dashboard/user/1

Response 200:
{
  "stats": {
    "totalActivities": 45,
    "totalCarbonSaved": 150.5,
    "monthlyCarbon": 450.5,
    "weeklyEmissions": 102.7,
    "totalOffset": 25.3,
    "activeGoals": 2,
    "badgeCount": 3,
    "ecoPoints": 1500,
    "streakDays": 15
  },
  "recentLogs": [...],
  "monthlyComparison": [
    { "month": "2024-03", "total": 450.5 },
    { "month": "2024-02", "total": 523.2 }
  ],
  "emissionsBreakdown": [
    { "activityType": "Transport", "totalCarbon": 142.0, "percentage": 31.5 },
    { "activityType": "Food & Diet", "totalCarbon": 98.0, "percentage": 21.8 },
    { "activityType": "Energy Usage", "totalCarbon": 210.0, "percentage": 46.7 }
  ],
  "weeklyTotal": 102.7,
  "changePercentage": -12.5
}
```

---

## 📊 Statistics

### Get User Stats
```http
GET /stats/user/1

Response 200:
{
  "totalActivities": 45,
  "totalCarbonSaved": 150.5,
  "monthlyCarbon": 450.5,
  "weeklyEmissions": 102.7,
  "totalOffset": 25.3,
  "activeGoals": 2,
  "badgeCount": 3,
  "ecoPoints": 1500,
  "streakDays": 15
}
```

### Get Monthly Comparison
```http
GET /stats/user/1/monthly?months=6

Response 200:
[
  { "month": "2024-03", "total": 450.5 },
  { "month": "2024-02", "total": 523.2 },
  { "month": "2024-01", "total": 498.7 }
]
```

### Get Emissions Breakdown
```http
GET /stats/user/1/breakdown

Response 200:
[
  { "activityType": "Transport", "totalCarbon": 142.0, "percentage": 31.5 },
  { "activityType": "Food", "totalCarbon": 98.0, "percentage": 21.8 },
  { "activityType": "Energy", "totalCarbon": 210.0, "percentage": 46.7 }
]
```

---

## 👤 Users

### Get User by ID
```http
GET /users/1

Response 200:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00"
}
```

### Get User by Email
```http
GET /users/email/john@example.com
```

### Update User
```http
PUT /users/1
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

---

## 🎯 Goals

### Get User Goals
```http
GET /goals/user/1

Response 200:
[
  {
    "id": 1,
    "userId": 1,
    "title": "Reduce transport emissions by 30%",
    "targetValue": 100.0,
    "currentValue": 65.0,
    "status": "active",
    "deadline": "2024-06-30"
  }
]
```

### Create Goal
```http
POST /goals
Content-Type: application/json

{
  "userId": 1,
  "title": "Go vegetarian 4 days a week",
  "targetValue": 100.0,
  "deadline": "2024-12-31"
}
```

### Update Goal
```http
PUT /goals/1
Content-Type: application/json

{
  "currentValue": 75.0,
  "status": "in_progress"
}
```

### Delete Goal
```http
DELETE /goals/1

Response 204: No Content
```

---

## 🏆 Badges

### Get User Badges
```http
GET /badges/user/1

Response 200:
[
  {
    "id": 1,
    "userId": 1,
    "badgeName": "Eco Warrior",
    "badgeIcon": "🌟",
    "earnedAt": "2024-02-15T10:30:00"
  }
]
```

---

## 🏅 Leaderboard

### Get Leaderboard
```http
GET /leaderboard?limit=10

Response 200:
[
  {
    "rank": 1,
    "userId": 5,
    "userName": "Jane Smith",
    "totalCarbon": 1250.5,
    "badgeCount": 8
  },
  {
    "rank": 2,
    "userId": 3,
    "userName": "Mike Johnson",
    "totalCarbon": 1180.2,
    "badgeCount": 6
  }
]
```

---

## 📝 Activities

### Get User Activities
```http
GET /activities/user/1

Response 200:
[
  {
    "id": 1,
    "userId": 1,
    "activityType": "TRANSPORT",
    "description": "Commute to office",
    "carbonAmount": 3.84,
    "activityDate": "2024-03-11"
  }
]
```

### Create Activity
```http
POST /activities
Content-Type: application/json

{
  "userId": 1,
  "activityType": "TRANSPORT",
  "description": "Bike to work",
  "carbonAmount": -2.5,
  "activityDate": "2024-03-11"
}
```

### Delete Activity
```http
DELETE /activities/1

Response 204: No Content
```

---

## 🔍 Query Parameters

### Date Filtering
- `from` - Start date (ISO 8601: YYYY-MM-DD)
- `to` - End date (ISO 8601: YYYY-MM-DD)

### Pagination
- `page` - Page number (default: 0)
- `size` - Items per page (default: 20)

### Sorting
- `sort` - Sort field and direction (e.g., `activityDate,desc`)

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2024-03-11T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: Distance must be non-negative",
  "path": "/api/survey"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-03-11T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with ID: 999",
  "path": "/api/users/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2024-03-11T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 💡 Tips

1. **Authentication**: In production, add JWT tokens to Authorization header
2. **Date Formats**: Always use ISO 8601 (YYYY-MM-DD)
3. **Validation**: Check error messages for validation requirements
4. **Rate Limiting**: Implement rate limiting for production
5. **CORS**: Configure allowed origins in application.properties

---

## 📚 Related Documentation

- [Carbon Tracking Features](CARBON_TRACKING.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Setup Guide](../SETUP.md)
