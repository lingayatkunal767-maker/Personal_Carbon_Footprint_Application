-- ============================================================
-- Run this ENTIRE file in pgAdmin Query Tool
-- Connected as: postgres (superuser)
-- Steps: Open pgAdmin -> right-click postgres server -> Query Tool
--        Paste this file -> Click "Run" (F5)
-- ============================================================

-- 1. Create the database
CREATE DATABASE ce;

-- ============================================================
-- IMPORTANT: After running the above line, you must:
-- 1. Disconnect from 'postgres' database
-- 2. Connect to 'sustainability_tracker' database
-- Then run the rest of this file (lines below)
-- ============================================================

-- 2. Grant privileges to the configured app user
GRANT ALL PRIVILEGES ON DATABASE ce TO postgres;
ALTER DATABASE ce OWNER TO postgres;
