# Sustainability Tracker Backend

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

## Troubleshooting
1. Connection refused to PostgreSQL:
   - Confirm service is running on POSTGRES_HOST:POSTGRES_PORT.
2. Authentication failed:
   - Recheck POSTGRES_USER and POSTGRES_PASSWORD in backend/.ENV.
3. Relation does not exist:
   - Re-run database/schema.sql on database ce.
4. Port already in use:
   - Change server.port in application.properties or free port 8081.
