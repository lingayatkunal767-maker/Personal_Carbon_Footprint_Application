-- ============================================================
-- Run this ENTIRE file in pgAdmin Query Tool
-- Connected as: postgres (superuser)
-- Steps: Open pgAdmin -> right-click postgres server -> Query Tool
--        Paste this file -> Click "Run" (F5)
-- ============================================================

-- 1. Create the database
CREATE DATABASE sustainability_tracker;

-- ============================================================
-- IMPORTANT: After running the above line, you must:
-- 1. Disconnect from 'postgres' database
-- 2. Connect to 'sustainability_tracker' database
-- Then run the rest of this file (lines below)
-- ============================================================

-- 2. Create the application user
CREATE USER tracker_user WITH PASSWORD 'tracker123';

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sustainability_tracker TO tracker_user;
GRANT ALL ON SCHEMA public TO tracker_user;
ALTER DATABASE sustainability_tracker OWNER TO tracker_user;
