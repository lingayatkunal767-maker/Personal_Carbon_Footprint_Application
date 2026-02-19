# CarbonTracker – Database

PostgreSQL database for the CarbonTracker backend.

### Create database

1. Install PostgreSQL.
2. Create the database:

```sql
CREATE DATABASE carbon_tracker;
```

### Connection settings

Default connection (see `backend/src/main/resources/application.properties` or `backend/application-local.properties`):

- **URL:** `jdbc:postgresql://localhost:5432/carbon_tracker`
- **Username:** `postgres`
- **Password:** `root`

Update these values if your local PostgreSQL uses different credentials.

### Schema

- Core tables:
  - `Users`
  - `CarbonLogs`
  - `AuthTokens`
- Relationships follow the ER diagram (`Users` ↔ `CarbonLogs`, `Users` ↔ `AuthTokens`).

Tables are created automatically by Spring Data JPA (`ddl-auto=update`).  
You can also open `schema.sql` in this folder for a reference DDL. 
