<<<<<<< HEAD
<<<<<<< HEAD
# 🌱 Sustainability Tracker - Backend (Spring Boot)
=======
# Sustainability Tracker Backend
>>>>>>> f092aa54cae86847b29efb6ddd014aa7928cd220

Spring Boot backend for authentication, survey-based carbon calculations, history, goals, badges, leaderboard, notifications, and marketplace.

## Stack
- Java 17
- Spring Boot 3.2.x
- Spring Data JPA
- PostgreSQL 15+
- Maven

## Project Scope
The backend serves these functional areas end-to-end:
- Auth: register, login, Google login
- Survey and calculations: lifestyle input to carbon emissions
- Carbon history and dashboard stats
- Goals and badge automation
- Notifications
- Leaderboard (materialized view)
- Marketplace products and orders

## Database Configuration
The application reads database values from backend/.ENV through spring.config.import in application.properties.

Current required keys in backend/.ENV:
- POSTGRES_HOST
- POSTGRES_PORT
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD

Example currently used:
- POSTGRES_HOST=localhost
- POSTGRES_PORT=5432
- POSTGRES_DB=ce
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=your_password

You can still override with standard Spring variables if needed:
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD

## First-Time DB Setup
1. Create database ce in PostgreSQL (if not created already).
2. Run schema:
   - psql -U postgres -d ce -f database/schema.sql
3. Optional seed data:
   - psql -U postgres -d ce -f database/seed-data.sql
4. Optional marketplace seed:
   - psql -U postgres -d ce -f database/seed-marketplace.sql

## Run Backend
From repository root:
- cd backend
- mvn spring-boot:run

Backend starts on:
- http://localhost:8081

## Build and Test
- Compile: mvn -DskipTests compile
- Test: mvn test
- Package: mvn clean package

## Important Data Notes
- carbon_logs has a unique key on user_id + log_date.
- lifestyle_surveys and carbon_logs include created_at and updated_at.
- Goal status values are lowercase (active, completed, failed) for consistency with service queries.
- Leaderboard uses a materialized view named leaderboard and supports refresh.

## API Base Path
- /api

Main endpoint groups:
- /api/auth
- /api/survey
- /api/carbon
- /api/stats
- /api/dashboard
- /api/goals
- /api/badges
- /api/leaderboard
- /api/notifications
- /api/marketplace

<<<<<<< HEAD
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
=======
## Troubleshooting
1. Connection refused to PostgreSQL:
   - Confirm service is running on POSTGRES_HOST:POSTGRES_PORT.
2. Authentication failed:
   - Recheck POSTGRES_USER and POSTGRES_PASSWORD in backend/.ENV.
3. Relation does not exist:
   - Re-run database/schema.sql on database ce.
4. Port already in use:
   - Change server.port in application.properties or free port 8081.
>>>>>>> f092aa54cae86847b29efb6ddd014aa7928cd220
