# CarbonTracker - Database

## Overview

PostgreSQL schema notes for the CarbonCalc backend.

---

## Setup

### Create database

```sql
CREATE DATABASE carbon_tracker;
```

---

### Default local connection

Configured in backend properties:
- URL: `jdbc:postgresql://localhost:5432/carbon_tracker`
- Username: `postgres`
- Password: `root`

---

## Schema

- Main reference file: `schema.sql`
- Runtime schema is managed by Hibernate (`spring.jpa.hibernate.ddl-auto=update`)

If you are creating a fresh DB manually, run `schema.sql` first, then start backend.

---

## Tables

The schema currently includes:

1. `users`
2. `auth_tokens`
3. `badge_templates`
4. `badges`
5. `carbon_logs`
6. `goals`
7. `marketplace`
8. `marketplace_items`
9. `notifications`
10. `surveys`
11. `transactions`
12. `admin_audit_logs`
13. `weekly_leaderboard`

---

## Notes

- Added missing tables to match current project DB:  
  `admin_audit_logs`, `marketplace`, `marketplace_items`, `notifications`, `transactions`.
- Aligned table definitions with live PostgreSQL metadata for those newly added tables.
- `weekly_leaderboard` is used to persist weekly leaderboard snapshots for `Last week` views.
