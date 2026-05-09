# 🌱 Carbon Tracking Features - Complete Guide

## Overview

The Sustainability Tracker now supports complete carbon footprint tracking with lifestyle surveys, emission calculations, and dashboard visualization.

---

## 🎯 Feature Components

### 1. **Lifestyle Survey**
Users input daily lifestyle data across three categories:
- **Transport**: Mode of transport, distance, fuel type
- **Food & Diet**: Vegetarian and non-vegetarian meal counts
- **Energy**: Electricity usage and cooking gas consumption

### 2. **Emission Calculation**
Backend automatically calculates carbon emissions using scientifically-backed emission factors:
- Transport emissions based on vehicle type and distance
- Food emissions based on meal types
- Energy emissions based on electricity and gas usage

### 3. **Carbon Logs**
System stores daily emission logs in the database with:
- Category-wise breakdowns (Transport, Food, Energy)
- Total daily emissions
- Historical tracking

### 4. **Dashboard Visualization**
Real-time dashboard showing:
- Total emissions and trends
- Category breakdowns with percentages
- Monthly comparisons
- Weekly progress
- Historical charts

---

## 📊 API Endpoints

### **Submit Lifestyle Survey**
```http
POST /api/survey
Content-Type: application/json

{
  "userId": 1,
  "surveyDate": "2024-03-11",
  "transportMode": "CAR",
  "distanceKmPerDay": 15.5,
  "fuelType": "PETROL",
  "mealsNonVegPerWeek": 7,
  "mealsVegPerWeek": 14,
  "electricityKwhPerMonth": 250,
  "cookingGasCylindersPerMonth": 1.5
}
```

**Response:**
```json
{
  "surveyId": 123,
  "logDate": "2024-03-11",
  "transportEmission": 2.98,
  "foodEmission": 4.16,
  "energyEmission": 7.53,
  "totalEmission": 14.67
}
```

### **Get Carbon Logs**
```http
GET /api/carbon/logs?userId=1&from=2024-02-01&to=2024-03-11
```

**Response:**
```json
[
  {
    "logDate": "2024-03-11",
    "transportEmission": 2.98,
    "foodEmission": 4.16,
    "energyEmission": 7.53,
    "totalEmission": 14.67
  }
]
```

### **Get Dashboard Data**
```http
GET /api/dashboard/user/1
```

**Response:**
```json
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
  "monthlyComparison": [...],
  "emissionsBreakdown": [
    {
      "activityType": "Transport",
      "totalCarbon": 142.0,
      "percentage": 31.5
    },
    {
      "activityType": "Food & Diet",
      "totalCarbon": 98.0,
      "percentage": 21.8
    },
    {
      "activityType": "Energy Usage",
      "totalCarbon": 210.0,
      "percentage": 46.7
    }
  ],
  "weeklyTotal": 102.7,
  "changePercentage": -12.5
}
```

### **Get User Stats**
```http
GET /api/stats/user/1
```

### **Get Monthly Comparison**
```http
GET /api/stats/user/1/monthly?months=6
```

### **Get Emissions Breakdown**
```http
GET /api/stats/user/1/breakdown
```

---

## 🔢 Emission Factors

### Transport (kg CO2e per km)
- **Car (Petrol/Diesel)**: 0.192
- **Bus**: 0.105
- **Train/Metro**: 0.041
- **Auto-rickshaw**: 0.120
- **Electric Car**: 0.060
- **Bike/Walk**: 0.0

### Food (kg CO2e per meal)
- **Non-Vegetarian**: 2.5
- **Vegetarian**: 1.2

### Energy
- **Electricity**: 0.82 kg CO2e per kWh
- **LPG Cylinder**: 42.6 kg CO2e per cylinder

---

## 💡 Calculation Logic

### Daily Transport Emissions
```
Daily Transport = Distance (km/day) × Emission Factor (kg CO2e/km)
```

### Daily Food Emissions
```
Daily Food = (Non-Veg Meals per Week × 2.5 + Veg Meals per Week × 1.2) ÷ 7
```

### Daily Energy Emissions
```
Daily Electricity = (Monthly kWh ÷ 30) × 0.82
Daily LPG = (Monthly Cylinders ÷ 30) × 42.6
Daily Energy = Daily Electricity + Daily LPG
```

### Total Daily Emissions
```
Total = Transport + Food + Energy
```

---

## 🎨 Frontend Integration

### Using the Survey API
```javascript
import { surveyAPI } from './services/api';

const submitSurvey = async (surveyData) => {
  try {
    const response = await surveyAPI.submitSurvey({
      userId: currentUser.id,
      transportMode: 'CAR',
      distanceKmPerDay: 15.5,
      fuelType: 'PETROL',
      mealsNonVegPerWeek: 7,
      mealsVegPerWeek: 14,
      electricityKwhPerMonth: 250,
      cookingGasCylindersPerMonth: 1.5
    });
    
    console.log('Emissions calculated:', response);
  } catch (error) {
    console.error('Survey submission failed:', error);
  }
};
```

### Using the Dashboard API
```javascript
import { dashboardAPI } from './services/api';

const fetchDashboard = async () => {
  try {
    const data = await dashboardAPI.getDashboard(currentUser.id);
    // Use data.stats, data.recentLogs, etc.
  } catch (error) {
    console.error('Dashboard fetch failed:', error);
  }
};
```

### Using the Carbon Log API
```javascript
import { carbonLogAPI } from './services/api';

const fetchCarbonHistory = async () => {
  const logs = await carbonLogAPI.getCarbonLogs(
    currentUser.id,
    '2024-02-01',
    '2024-03-11'
  );
};
```

---

## 🧪 Testing the Features

### 1. Start Backend and Frontend
```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Submit a Lifestyle Survey
Use the Lifestyle Survey page or send a POST request:
```bash
curl -X POST http://localhost:8081/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "transportMode": "CAR",
    "distanceKmPerDay": 20,
    "fuelType": "PETROL",
    "mealsNonVegPerWeek": 10,
    "mealsVegPerWeek": 11,
    "electricityKwhPerMonth": 300,
    "cookingGasCylindersPerMonth": 2
  }'
```

### 3. View Dashboard
Navigate to the dashboard or fetch data:
```bash
curl http://localhost:8081/api/dashboard/user/1
```

### 4. Check Carbon Logs
```bash
curl "http://localhost:8081/api/carbon/logs?userId=1"
```

---

## 📈 Example Data Flow

1. **User fills lifestyle survey** → Frontend submits to `/api/survey`
2. **Backend receives survey** → Validates data
3. **Calculate emissions** → Uses emission factors
4. **Store in database** → Creates/updates `carbon_logs` entry
5. **Return results** → Sends calculated emissions back
6. **Dashboard updates** → Fetches latest data from `/api/dashboard/user/{id}`
7. **User views progress** → Sees charts, breakdowns, and trends

---

## 🔐 Data Validation

### Transport Mode
- Valid values: `CAR`, `BIKE`, `BUS`, `TRAIN`, `WALK`, `AUTO`, `METRO`

### Fuel Type
- Valid values: `PETROL`, `DIESEL`, `EV`, `NA`
- Must be `NA` for `WALK` or `BIKE` transport modes
- Must be `EV`, `PETROL`, or `DIESEL` for `CAR`

### Constraints
- Distance must be ≥ 0
- Meals per week: 0-21
- Electricity usage must be ≥ 0
- Cooking gas cylinders must be ≥ 0

---

## 🎯 Next Steps

1. **Add Authentication**: Integrate survey endpoints with authenticated users
2. **Add Goals**: Link emission reductions to user goals
3. **Add Badges**: Award badges for milestones
4. **Add Leaderboard**: Compare emissions with other users
5. **Add Notifications**: Alert users about high emissions
6. **Export Data**: Allow users to download CSV reports

---

## 📝 Database Schema

### `carbon_logs` Table
```sql
CREATE TABLE carbon_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    transport_emission DECIMAL(10,2),
    food_emission DECIMAL(10,2),
    energy_emission DECIMAL(10,2),
    total_emission DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, log_date)
);
```

### `lifestyle_surveys` Table
```sql
CREATE TABLE lifestyle_surveys (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    survey_date DATE NOT NULL,
    transport_mode VARCHAR(20) NOT NULL,
    distance_km_per_day DECIMAL(10,2) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    meals_non_veg_per_week INT,
    meals_veg_per_week INT,
    electricity_kwh_per_month DECIMAL(10,2) NOT NULL,
    cooking_gas_cylinders_per_month DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎉 Features Successfully Implemented

✅ **Lifestyle survey submission**  
✅ **Automatic emission calculations**  
✅ **Carbon logs storage and retrieval**  
✅ **Dashboard with complete analytics**  
✅ **Category-wise breakdowns**  
✅ **Monthly comparison charts**  
✅ **Weekly progress tracking**  
✅ **Real-time data visualization**  
✅ **RESTful API endpoints**  
✅ **Data validation and error handling**  

Your carbon tracking system is now fully functional! 🌍
