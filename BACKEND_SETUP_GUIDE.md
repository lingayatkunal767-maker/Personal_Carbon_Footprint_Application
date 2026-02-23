# 🚀 Spring Boot Backend + PostgreSQL Setup Guide

**Complete Learning Guide for Your Sustainability Tracker App**

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Create Spring Boot Backend](#create-spring-boot-backend)
4. [Setup PostgreSQL Database](#setup-postgresql-database)
5. [Build the API](#build-the-api)
6. [Connect Frontend to Backend](#connect-frontend-to-backend)
7. [Testing & Deployment](#testing--deployment)

---

## 1️⃣ Prerequisites

### ✅ Already Installed:
- ✅ Java 17 (OpenJDK)
- ✅ Node.js & npm

### 🔧 Need to Install:

**A. PostgreSQL Database**
- Download: https://www.postgresql.org/download/windows/
- Install PostgreSQL 15+
- Remember your password during installation!

**B. Maven (Java build tool)**
- Usually comes with Spring Boot, or download: https://maven.apache.org/download.cgi

**C. Postman (for testing APIs)**
- Download: https://www.postman.com/downloads/

---

## 2️⃣ Project Structure

Your final project will look like this:

```
infosys-project/
│
├── frontend/                    # Your React App (already done! ✅)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Spring Boot (we'll create this)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/sustainability/tracker/
│   │   │   │       ├── SustainabilityTrackerApplication.java
│   │   │   │       ├── controller/     # API endpoints
│   │   │   │       ├── model/          # Database entities
│   │   │   │       ├── repository/     # Database access
│   │   │   │       ├── service/        # Business logic
│   │   │   │       └── config/         # Configurations
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml                 # Maven dependencies
│   └── README.md
│
└── database/                    # SQL scripts
    ├── schema.sql
    └── seed-data.sql
```

---

## 3️⃣ Create Spring Boot Backend

### Step 1: Generate Spring Boot Project

**Option A: Using Spring Initializr (Recommended)**

1. Go to: https://start.spring.io/
2. Configure:
   - **Project**: Maven
   - **Language**: Java
   - **Spring Boot**: 3.2.2
   - **Group**: com.sustainability
   - **Artifact**: tracker
   - **Name**: SustainabilityTracker
   - **Package name**: com.sustainability.tracker
   - **Packaging**: Jar
   - **Java**: 17

3. **Add Dependencies** (click "Add Dependencies"):
   - Spring Web
   - Spring Data JPA
   - PostgreSQL Driver
   - Lombok
   - Spring Boot DevTools
   - Validation

4. Click **Generate** → Download ZIP
5. Extract to `D:\infosys project\backend\`

**Option B: Using Command Line**

```bash
# Navigate to your project
cd "D:\infosys project"

# Create backend folder
mkdir backend
cd backend

# Download Spring Boot CLI or use Spring Initializr website
```

### Step 2: Open Backend in IDE

**Recommended IDEs:**
- IntelliJ IDEA Community (free): https://www.jetbrains.com/idea/download/
- VS Code with Java Extension Pack
- Eclipse

---

## 4️⃣ Setup PostgreSQL Database

### Step 1: Install PostgreSQL

1. Download installer: https://www.postgresql.org/download/windows/
2. Install with these settings:
   - Port: `5432` (default)
   - Password: Choose a strong password (remember it!)
   - Keep all defaults

### Step 2: Create Database

**Option A: Using pgAdmin (GUI)**

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Right-click **Databases** → **Create** → **Database**
3. Name: `sustainability_tracker`
4. Click **Save**

**Option B: Using Command Line (psql)**

```bash
# Open Command Prompt or PowerShell
psql -U postgres

# Enter your password, then:
CREATE DATABASE sustainability_tracker;

# List databases to verify
\l

# Exit
\q
```

### Step 3: Create Database Schema

Create file: `database/schema.sql`

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    profile_picture TEXT,
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon Activities Table
CREATE TABLE carbon_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'transport', 'energy', 'food', 'waste'
    activity_name VARCHAR(255) NOT NULL,
    carbon_amount DECIMAL(10, 2) NOT NULL, -- in kg CO2
    activity_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals Table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) DEFAULT 0,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges Table
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Leaderboard View (Materialized for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    u.id,
    u.name,
    u.profile_picture,
    COUNT(DISTINCT b.id) as badge_count,
    COALESCE(SUM(ca.carbon_amount), 0) as total_carbon_saved,
    RANK() OVER (ORDER BY COALESCE(SUM(ca.carbon_amount), 0) DESC) as rank
FROM users u
LEFT JOIN badges b ON u.id = b.user_id
LEFT JOIN carbon_activities ca ON u.id = ca.user_id
GROUP BY u.id, u.name, u.profile_picture;

-- Indexes for performance
CREATE INDEX idx_activities_user_date ON carbon_activities(user_id, activity_date);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_badges_user ON badges(user_id);
```

Run this in pgAdmin or psql:
```bash
psql -U postgres -d sustainability_tracker -f database/schema.sql
```

---

## 5️⃣ Configure Spring Boot

### Step 1: Configure `application.properties`

Edit: `backend/src/main/resources/application.properties`

```properties
# Application Name
spring.application.name=Sustainability Tracker

# Server Port
server.port=8080

# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/sustainability_tracker
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# CORS Configuration (allow frontend)
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*

# Logging
logging.level.org.springframework.web=DEBUG
logging.level.com.sustainability.tracker=DEBUG
```

### Step 2: Update `pom.xml` (if needed)

Ensure these dependencies are present:

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok (reduces boilerplate) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

---

## 6️⃣ Build the API

### Step 1: Create Entity Models

**File: `backend/src/main/java/com/sustainability/tracker/model/User.java`**

```java
package com.sustainability.tracker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;
    private String oauthProvider;
    private String oauthId;
    private String profilePicture;

    @Column(name = "member_since")
    private LocalDateTime memberSince = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

**File: `CarbonActivity.java`**

```java
package com.sustainability.tracker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_activities")
@Data
public class CarbonActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String activityType; // transport, energy, food, waste

    @Column(nullable = false)
    private String activityName;

    @Column(nullable = false)
    private BigDecimal carbonAmount;

    @Column(nullable = false)
    private LocalDate activityDate;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### Step 2: Create Repositories

**File: `repository/UserRepository.java`**

```java
package com.sustainability.tracker.repository;

import com.sustainability.tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByOauthId(String oauthId);
}
```

**File: `repository/CarbonActivityRepository.java`**

```java
package com.sustainability.tracker.repository;

import com.sustainability.tracker.model.CarbonActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CarbonActivityRepository extends JpaRepository<CarbonActivity, Long> {
    List<CarbonActivity> findByUserIdOrderByActivityDateDesc(Long userId);
    
    @Query("SELECT ca FROM CarbonActivity ca WHERE ca.userId = :userId " +
           "AND ca.activityDate BETWEEN :startDate AND :endDate")
    List<CarbonActivity> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}
```

### Step 3: Create Services

**File: `service/UserService.java`**

```java
package com.sustainability.tracker.service;

import com.sustainability.tracker.model.User;
import com.sustainability.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

### Step 4: Create Controllers (API Endpoints)

**File: `controller/UserController.java`**

```java
package com.sustainability.tracker.controller;

import com.sustainability.tracker.model.User;
import com.sustainability.tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

**File: `controller/CarbonActivityController.java`**

```java
package com.sustainability.tracker.controller;

import com.sustainability.tracker.model.CarbonActivity;
import com.sustainability.tracker.repository.CarbonActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:3000")
public class CarbonActivityController {
    
    @Autowired
    private CarbonActivityRepository activityRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CarbonActivity>> getUserActivities(@PathVariable Long userId) {
        List<CarbonActivity> activities = activityRepository.findByUserIdOrderByActivityDateDesc(userId);
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<CarbonActivity> createActivity(@RequestBody CarbonActivity activity) {
        CarbonActivity saved = activityRepository.save(activity);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 7️⃣ Run and Test Backend

### Step 1: Start Spring Boot Application

**In IDE:**
- Right-click `SustainabilityTrackerApplication.java`
- Click **Run**

**Using Maven:**
```bash
cd backend
mvnw spring-boot:run
# Or if maven is installed globally:
mvn spring-boot:run
```

You should see:
```
Started SustainabilityTrackerApplication in X seconds
Tomcat started on port(s): 8080
```

### Step 2: Test APIs with Postman

**Create User:**
```
POST http://localhost:8080/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "oauthProvider": "google",
  "oauthId": "google-123456"
}
```

**Get User:**
```
GET http://localhost:8080/api/users/1
```

**Create Activity:**
```
POST http://localhost:8080/api/activities
Content-Type: application/json

{
  "userId": 1,
  "activityType": "transport",
  "activityName": "Bike to work",
  "carbonAmount": 5.5,
  "activityDate": "2026-02-18",
  "description": "Saved carbon by cycling"
}
```

---

## 8️⃣ Connect Frontend to Backend

### Step 1: Create API Service in React

Create file: `frontend/src/services/api.js`

```javascript
const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  // User APIs
  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return response.json();
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Activity APIs
  getUserActivities: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/activities/user/${userId}`);
    return response.json();
  },

  createActivity: async (activityData) => {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData)
    });
    return response.json();
  },

  deleteActivity: async (activityId) => {
    await fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'DELETE'
    });
  }
};
```

### Step 2: Use in React Components

Update `HomePage.jsx`:

```javascript
import { api } from '../services/api';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      loadActivities(userId);
    }
  }, []);

  const loadActivities = async (userId) => {
    try {
      const data = await api.getUserActivities(userId);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component...
}
```

---

## 9️⃣ Testing & Deployment

### Local Testing Checklist:

- [ ] PostgreSQL running (port 5432)
- [ ] Backend running (http://localhost:8080)
- [ ] Frontend running (http://localhost:3000)
- [ ] Can create users via API
- [ ] Can log activities via API
- [ ] Frontend displays backend data

### Deployment Options:

**Backend:**
- Heroku (free tier)
- Railway.app
- Render.com
- AWS EC2

**Database:**
- Heroku Postgres
- Railway Postgres
- ElephantSQL
- AWS RDS

**Frontend:**
- Vercel (already configured!)
- Netlify

---

## 📚 Learning Resources

**Spring Boot:**
- Official Docs: https://spring.io/guides
- Baeldung: https://www.baeldung.com/spring-boot
- YouTube: "Spring Boot Tutorial for Beginners"

**PostgreSQL:**
- Official Docs: https://www.postgresql.org/docs/
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/

**REST APIs:**
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP

---

## 🎯 Next Steps

1. **Learn by doing**: Start with the User API, then add more features
2. **Add authentication**: Implement JWT tokens for security
3. **Add validation**: Use Spring Validation annotations
4. **Write tests**: Learn JUnit and Mockito
5. **Add swagger**: Document your APIs automatically

---

## 🐛 Common Issues & Solutions

**Issue: Port 8080 already in use**
```
Solution: Change server.port in application.properties to 8081
```

**Issue: Database connection refused**
```
Solution: Ensure PostgreSQL is running (check Services in Windows)
```

**Issue: CORS errors in browser**
```
Solution: Verify @CrossOrigin annotation on controllers
```

**Issue: Maven dependencies not downloading**
```
Solution: Run `mvn clean install` or reload Maven in IDE
```

---

## ✅ Summary

You now have:
- ✅ Complete project structure
- ✅ PostgreSQL database with schema
- ✅ Spring Boot REST API
- ✅ Frontend-Backend integration
- ✅ Testing strategy
- ✅ Deployment guidance

**Happy Coding! 🚀**
