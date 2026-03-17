# CarbonCalc — Backend

## Overview

This Spring Boot (Java 17) backend powers the **Personal Carbon Footprint** application.

It is responsible for:
- OAuth2 login (Google / GitHub) and JWT token generation
- User management (including admin block / unblock / soft delete)
- Lifestyle surveys and carbon logs
- Goals (create, update, monitor) and automatic progress updates
- Badge templates, user badges, and auto‑awarding rules
- Leaderboard calculation based on emission reductions, goals, and badges

The React frontend (in `../frontend`) talks to this backend at `http://localhost:8080`.

---

## Tech stack

- Java 17, Spring Boot 3
- Spring Data JPA (Hibernate) with **PostgreSQL**
- Spring Security (OAuth2 client + JWT)
- Maven build

---

## Prerequisites

- JDK 17+
- Maven 3.8+
- PostgreSQL running locally

Recommended local DB:

- Database: `carbon_tracker`
- User: `postgres`
- Password: `root`

You can change these in `src/main/resources/application-local.properties`.

---

## Configuration

Key properties (see `application.properties` + `application-local.properties`):

- **Database**
  - `spring.datasource.url=jdbc:postgresql://localhost:5432/carbon_tracker`
  - `spring.datasource.username=postgres`
  - `spring.datasource.password=root`
  - `spring.jpa.hibernate.ddl-auto=update`
- **OAuth2**
  - `spring.security.oauth2.client.registration.google.*`
  - `spring.security.oauth2.client.registration.github.*`
  - `app.oauth2.authorizedRedirectUri=http://localhost:3000/oauth2/redirect`
- **Mail (optional)**
  - `app.mail.enabled`, `spring.mail.*` — used for forgot‑password / OTP flows.

---

## Database schema & seeding

- Tables are created/updated automatically by Hibernate (`ddl-auto=update`).
- `db_scripts/schema.sql` contains a reference PostgreSQL schema for manual setup.
- `DataInitializer.java` seeds default **badge templates** and related data on startup when the database is empty.

---

## Running the backend (development)

From the `backend` folder:

```bash
# 1. Ensure PostgreSQL is running and the DB exists
#    psql -U postgres -c "CREATE DATABASE carbon_tracker;"   # run once

# 2. Start Spring Boot
mvn spring-boot:run
```

Backend will listen on `http://localhost:8080`.

---

## Build & run (packaged JAR)

```bash
mvn clean package
java -jar target/carbontracker-0.0.1-SNAPSHOT.jar
```

---

## Important API endpoints (current project)

### Auth & users

- `GET /api/auth/me` — current user details (used by layout, dashboard, leaderboard)
- `GET /api/users` — list all users (admin)
- `PUT /api/users/{id}/block` / `PUT /api/users/{id}/unblock` — admin block / unblock
- `DELETE /api/users/{id}` — admin soft delete (marks user inactive)

### Carbon logs & survey

- `GET /api/carbon/logs?from=YYYY-MM-DD&to=YYYY-MM-DD` — carbon logs for current user
- `PUT /api/carbon/logs/{id}` — update a carbon log
- `GET /api/surveys` / `POST /api/surveys` — lifestyle survey responses (used for badges like ECO_STARTER, SURVEY_MASTER)

### Goals

- `POST /api/goals` — create a goal for logged‑in user
- `GET /api/goals` — list current user’s goals
- `GET /api/goals/admin` — all non‑admin user goals (admin dashboard)
- `PUT /api/goals/{id}` / `DELETE /api/goals/{id}` — update / delete goals

### Badges

- `GET /api/badge-templates` — list badge templates
- `POST /api/badge-templates` — create new badge template
- `PUT /api/badge-templates/{id}` — update name/description/condition/icon/active
- `GET /api/badges` — list badges for current user
- `POST /api/badges/award/{userId}` — award a badge to a user (admin “Award Badge” modal)

### Leaderboard

- `GET /api/leaderboard` — global leaderboard for **non‑admin** users.

Score formula in `LeaderboardService`:

- Compute `emissionReduction` as **% drop in total emissions** (last 30 days vs previous 30).
- Count:
  - `goalsCompleted` = number of goals with status `COMPLETED`
  - `badgesEarned`   = number of badges awarded to the user
- Final score:

```text
score = (emissionReduction × 50)
      + (goalsCompleted  × 20)
      + (badgesEarned    × 10)
```

---

## Testing

```bash
mvn test
```

---

## Production notes

- Use separate configuration (DB, OAuth2, mail) for non‑dev environments.
- Store secrets (DB password, OAuth client secrets, JWT keys, mail password) outside source control.
- Add HTTPS, logging, metrics, and backups for a real deployment.

