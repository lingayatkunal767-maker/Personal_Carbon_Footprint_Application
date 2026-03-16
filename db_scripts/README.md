# CarbonCalc — DB Scripts

## Overview

This folder contains database schema creation and seed scripts for the CarbonCalc project (MySQL). Use these scripts to create the `users`, `surveys`, `carbon_logs`, `goals`, `badges`, `leaderboards`, `marketplace`, and `transactions` tables.

## Files

- `create_schema.sql` — DDL statements to create tables, constraints, and indexes.
- `seed_data.sql` — Optional: seed the database with sample users, marketplace items, and badges.
- `migrations/` — (optional) place migration files here if using Flyway or Liquibase.

## Example: run scripts locally

```bash
# create database (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS carboncalc;"

# apply schema
mysql -u root -p carboncalc < create_schema.sql

# optional: seed sample data
mysql -u root -p carboncalc < seed_data.sql
```

## Recommended workflow

- For development: use Docker Compose to start MySQL and run scripts automatically.
- For production: use a migration tool (Flyway/Liquibase) to keep a reliable migration history.

## Schema summary

Tables (high-level):

- `users` (id, name, email, password_hash, role, created_at)
- `surveys` (id, user_id, transport_mode, diet_type, energy_usage, frequency JSON, created_at)
- `carbon_logs` (id, user_id, date, transport_emission, food_emission, energy_emission, total_emission)
- `goals` (id, user_id, goal_title, target_emission, current_emission, status, created_at)
- `badges` (id, user_id, badge_name, description, awarded_at)
- `leaderboards` (id, team_name, user_id, score, updated_at)
- `marketplace` (id, item_name, item_type, price, description, created_at)
- `transactions` (id, user_id, marketplace_item_id, amount, created_at)

## Notes

- Ensure foreign key constraints and proper indexing for query performance.
- Keep sensitive DB credentials out of checked-in files; use env vars or secrets manager.
