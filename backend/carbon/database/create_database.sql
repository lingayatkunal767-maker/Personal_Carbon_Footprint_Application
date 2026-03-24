-- Carbon Footprint Application Database Setup Script
-- Database: carboncals
-- PostgreSQL

-- Create database (run this as superuser/postgres)
-- Note: If database already exists, you can skip this step


-- Connect to the carboncals database before running the following commands
-- \c carboncals

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create emission_records table
CREATE TABLE IF NOT EXISTS emission_records (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(255),
    activity_type VARCHAR(255),
    quantity DOUBLE PRECISION,
    carbon_output DOUBLE PRECISION,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_emission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_emission_records_user_id ON emission_records(user_id);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Create otp_tokens table for email verification during registration
CREATE TABLE IF NOT EXISTS otp_tokens (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index on email for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email);

-- Optional: Add comments to tables
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE emission_records IS 'Stores carbon emission records linked to users';

COMMENT ON COLUMN users.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
COMMENT ON COLUMN users.password IS 'BCrypt encrypted password';
COMMENT ON COLUMN emission_records.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN emission_records.user_id IS 'Foreign key to users table';

-- //Surveys Table//

CREATE TABLE IF NOT EXISTS surveys (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,

    transport_mode VARCHAR(50) NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    fuel_type VARCHAR(50),

    diet_type VARCHAR(50) NOT NULL,
    meals_per_day INT NOT NULL,

    monthly_kwh DOUBLE PRECISION NOT NULL,
    renewable BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_survey_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);

-- //Carbon Logs Table//

CREATE TABLE IF NOT EXISTS carbon_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    transport_emission DOUBLE PRECISION NOT NULL,
    food_emission DOUBLE PRECISION NOT NULL,
    energy_emission DOUBLE PRECISION NOT NULL,
    total_emission DOUBLE PRECISION NOT NULL,

    CONSTRAINT unique_user_date UNIQUE (user_id, date),

    CONSTRAINT fk_carbon_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_carbon_logs_user_id ON carbon_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_logs_date ON carbon_logs(date);

-- ============================================================================
-- PHASE 1: NEW TABLES ADDITION (Do not modify existing tables above)
-- ============================================================================

-- //Marketplace Table//
-- Standalone table for marketplace items used in carbon credit trading

CREATE TABLE IF NOT EXISTS marketplace (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_item_name ON marketplace(item_name);

COMMENT ON TABLE marketplace IS 'Stores marketplace items for carbon credit trading';
COMMENT ON COLUMN marketplace.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN marketplace.item_name IS 'Name of the marketplace item';
COMMENT ON COLUMN marketplace.item_price IS 'Price of the item in carbon credits';
COMMENT ON COLUMN marketplace.description IS 'Detailed description of the item';
COMMENT ON COLUMN marketplace.created_at IS 'Timestamp when item was added';

-- //Leaderboards Table//
-- Stores user rankings and team scores for carbon reduction competitions

CREATE TABLE IF NOT EXISTS leaderboards (
    id BIGSERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL UNIQUE,
    score NUMERIC(10, 2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_leaderboard_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_team_name ON leaderboards(team_name);

COMMENT ON TABLE leaderboards IS 'Stores user rankings and team scores for competitions';
COMMENT ON COLUMN leaderboards.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN leaderboards.team_name IS 'Name of the team user belongs to';
COMMENT ON COLUMN leaderboards.user_id IS 'Unique foreign key to users table';
COMMENT ON COLUMN leaderboards.score IS 'Carbon reduction score for ranking';
COMMENT ON COLUMN leaderboards.updated_at IS 'Timestamp of last score update';

-- //Transactions Table//
-- Records all marketplace transactions (purchases of carbon credits)

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    marketplace_item_id BIGINT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_transaction_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_transaction_marketplace 
        FOREIGN KEY (marketplace_item_id) 
        REFERENCES marketplace(id) 
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_marketplace_item_id ON transactions(marketplace_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

COMMENT ON TABLE transactions IS 'Stores marketplace transaction history';
COMMENT ON COLUMN transactions.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN transactions.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN transactions.marketplace_item_id IS 'Foreign key to marketplace table';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN transactions.created_at IS 'Timestamp of transaction';

-- //Goals Table//
-- Stores user carbon reduction goals and progress tracking

CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_title VARCHAR(255) NOT NULL,
    target_emission NUMERIC(10, 2) NOT NULL,
    current_emission NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_goal_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at);

COMMENT ON TABLE goals IS 'Stores user carbon reduction goals and tracking';
COMMENT ON COLUMN goals.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN goals.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN goals.goal_title IS 'Title of the carbon reduction goal';
COMMENT ON COLUMN goals.target_emission IS 'Target carbon emission limit in kg CO2';
COMMENT ON COLUMN goals.current_emission IS 'Current carbon emission progress';
COMMENT ON COLUMN goals.status IS 'Goal status: active, completed, or abandoned';
COMMENT ON COLUMN goals.created_at IS 'Timestamp when goal was created';

-- //Badges Table//
-- Stores achievement badges awarded to users for milestones

CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    description TEXT,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_badge_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_badge_name ON badges(badge_name);
CREATE INDEX IF NOT EXISTS idx_badges_awarded_at ON badges(awarded_at);

COMMENT ON TABLE badges IS 'Stores achievement badges earned by users';
COMMENT ON COLUMN badges.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN badges.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN badges.badge_name IS 'Name of the achievement badge';
COMMENT ON COLUMN badges.description IS 'Description of what the badge represents';
COMMENT ON COLUMN badges.awarded_at IS 'Timestamp when badge was awarded';
ALTER TABLE surveys DROP COLUMN IF EXISTS average_distance;
ALTER TABLE surveys DROP COLUMN IF EXISTS energy_usage;