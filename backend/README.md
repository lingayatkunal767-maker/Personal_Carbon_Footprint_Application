<<<<<<< HEAD
# 🌱 Sustainability Tracker - Backend (Spring Boot)

RESTful API for the Sustainability Tracker application.

## 🚀 Quick Start

### Prerequisites
- Java 17+ ✅ (Already installed)
- PostgreSQL 15+
- Maven 3.8+

### Setup Steps

1. **Install PostgreSQL**
   - Download: https://www.postgresql.org/download/windows/
   - Install and remember your password
   - Default port: 5432

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE sustainability_tracker;
   
   # Exit
   \q
   ```

3. **Run Database Schema**
   ```bash
   cd database
   psql -U postgres -d sustainability_tracker -f schema.sql
   psql -U postgres -d sustainability_tracker -f seed-data.sql
   ```

4. **Generate Spring Boot Project**
   - Go to: https://start.spring.io/
   - Configuration:
     - Project: Maven
     - Language: Java
     - Spring Boot: 3.2.2
     - Java: 17
     - Group: com.sustainability
     - Artifact: tracker
   - Dependencies:
     - Spring Web
     - Spring Data JPA
     - PostgreSQL Driver
     - Lombok
     - Validation
   - Generate and extract to this folder

5. **Configure Application**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/sustainability_tracker
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_PASSWORD_HERE
   
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   
   server.port=8080
   ```

6. **Run Application**
   ```bash
   mvn spring-boot:run
   ```

   Or in IDE: Run `SustainabilityTrackerApplication.java`

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/sustainability/tracker/
│   │   │   ├── SustainabilityTrackerApplication.java  # Main class
│   │   │   ├── controller/                            # REST endpoints
│   │   │   │   ├── UserController.java
│   │   │   │   ├── CarbonActivityController.java
│   │   │   │   ├── GoalController.java
│   │   │   │   └── BadgeController.java
│   │   │   ├── model/                                 # JPA entities
│   │   │   │   ├── User.java
│   │   │   │   ├── CarbonActivity.java
│   │   │   │   ├── Goal.java
│   │   │   │   └── Badge.java
│   │   │   ├── repository/                            # Data access
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── CarbonActivityRepository.java
│   │   │   │   ├── GoalRepository.java
│   │   │   │   └── BadgeRepository.java
│   │   │   ├── service/                               # Business logic
│   │   │   │   ├── UserService.java
│   │   │   │   ├── ActivityService.java
│   │   │   │   └── GoalService.java
│   │   │   └── config/                                # Configuration
│   │   │       └── CorsConfig.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## 🔌 API Endpoints

### Users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user

### Carbon Activities
- `GET /api/activities/user/{userId}` - Get user's activities
- `POST /api/activities` - Log new activity
- `DELETE /api/activities/{id}` - Delete activity

### Goals
- `GET /api/goals/user/{userId}` - Get user's goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/{id}` - Update goal

### Badges
- `GET /api/badges/user/{userId}` - Get user's badges

### Leaderboard
- `GET /api/leaderboard` - Get global rankings

## 🧪 Testing APIs

### Using Postman

**Create User:**
```
POST http://localhost:8080/api/users
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "oauthProvider": "google",
  "oauthId": "google-test-123"
}
```

**Get User:**
```
GET http://localhost:8080/api/users/1
```

**Log Activity:**
```
POST http://localhost:8080/api/activities
Content-Type: application/json

{
  "userId": 1,
  "activityType": "transport",
  "activityName": "Bike to work",
  "carbonAmount": 5.5,
  "activityDate": "2026-02-18",
  "description": "Cycled instead of driving"
}
```

### Using cURL

```bash
# Create user
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Get activities
curl http://localhost:8080/api/activities/user/1
```

## 🔐 Security (Future Enhancement)

Current: Open API for development
Todo: Add JWT authentication, OAuth 2.0, input validation

## 📦 Dependencies

```xml
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- PostgreSQL Driver
- Lombok
- Validation API
```

## 🐛 Troubleshooting

**Port 8080 already in use:**
```
Change server.port in application.properties to 8081
```

**Database connection refused:**
```
1. Check PostgreSQL is running: services.msc
2. Verify credentials in application.properties
3. Test connection: psql -U postgres
```

**CORS errors:**
```
Add @CrossOrigin annotation to controllers
Or configure CorsConfig class
```

## 📚 Learning Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

## 🚀 Deployment

**Heroku:**
```bash
heroku create sustainability-tracker-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

**Railway:**
1. Connect GitHub repo
2. Add PostgreSQL service
3. Deploy automatically

## ✅ Development Checklist

- [x] Database schema created
- [x] Seed data loaded
- [ ] Spring Boot project generated
- [ ] Models created
- [ ] Repositories created
- [ ] Services implemented
- [ ] Controllers implemented
- [ ] CORS configured
- [ ] Application running
- [ ] APIs tested
- [ ] Frontend connected

---

**Need help?** Check the main `BACKEND_SETUP_GUIDE.md` for detailed instructions!
=======
# CarbonCalc — Backend

## Overview

This Spring Boot (Java) backend implements the API and business logic for the Personal Carbon Footprint application. It handles authentication (JWT access + refresh tokens), user management, surveys, carbon calculations, goals, gamification, marketplace transactions, and integrations with external carbon-data APIs.

## Tech stack

- Java 17+ with Spring Boot (REST controllers, Spring Data JPA)
- Build: Maven (default)
- Database: MySQL
- Authentication: JWT (access + refresh tokens)
- External APIs: Carbon Interface API, Open Energy Data, UN Carbon datasets

## Prerequisites

- JDK 17+
- Maven 3.6+
- Running MySQL instance
- (Optional) Docker for local MySQL

## Configuration

Set environment variables or application properties for database and security:

- `SPRING_DATASOURCE_URL` (e.g. jdbc:mysql://localhost:3306/carboncalc)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_EXP_MS` (access token lifetime)
- `JWT_REFRESH_EXP_MS` (refresh token lifetime)
- `CARBON_INTERFACE_API_KEY` (if using Carbon Interface)

## Run (development)

```bash
# start MySQL and ensure DB is created (see db_scripts)
mvn spring-boot:run
```

## Build and run

```bash
mvn clean package
java -jar target/*.jar
```

## Database migrations

SQL schema and seed scripts are in the `db_scripts/` folder. Use them to create the schema or integrate Flyway/Liquibase.

## Key API endpoints (examples)

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login, returns access + refresh tokens
- `POST /api/surveys` — submit lifestyle survey
- `GET /api/carbon/logs` — get carbon logs / history
- `POST /api/goals` — create a goal
- `GET /api/marketplace` — list items
- `POST /api/transactions` — purchase offset

## Testing

```bash
mvn test
```

## Notes

- Use strong `JWT_SECRET` in production and secure DB credentials.
- Configure HTTPS, rate limiting, and logging for production.
- Connect external API keys via secure vault or env vars.
>>>>>>> 0c1c7023c8a74ca38276aa35989583d9e420dc25
