-- CarbonTracker – optional reference schema (backend creates tables via JPA)
-- Create the database first: CREATE DATABASE carbon_tracker;

-- Users (structure matches JPA entity; table name may be 'users' or 'user' per JPA)
-- CREATE TABLE IF NOT EXISTS users (
--   id BIGSERIAL PRIMARY KEY,
--   name VARCHAR(255),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   password_hash VARCHAR(255),
--   created_at TIMESTAMP,
--   ...
-- );

-- Run the backend once so JPA creates/updates tables, or use this as reference only.
