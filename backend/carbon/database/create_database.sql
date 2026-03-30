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

-- =========================================
-- MARKETPLACE
-- =========================================
CREATE TABLE IF NOT EXISTS marketplace (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    carbon_offset_value NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TRANSACTIONS
-- =========================================
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    marketplace_item_id BIGINT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (marketplace_item_id) REFERENCES marketplace(id) ON DELETE RESTRICT
);

-- =========================================
-- NOTIFICATIONS
-- =========================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- EMISSION HISTORY
-- =========================================
CREATE TABLE IF NOT EXISTS emission_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_emission NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- ACTIVITY HISTORY
-- =========================================
CREATE TABLE IF NOT EXISTS activity_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type VARCHAR(100),
    reference_id BIGINT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- ADMIN LOGS
-- =========================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- EMISSION FACTORS
-- =========================================
CREATE TABLE IF NOT EXISTS emission_factors (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100),
    activity_type VARCHAR(100),
    emission_factor NUMERIC(10,4),
    unit VARCHAR(50)
);

-- =========================================
-- BADGES (MASTER)
-- =========================================
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    badge_name VARCHAR(255),
    description TEXT,
    condition_type VARCHAR(100),
    threshold_value NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- USER BADGES (MAPPING TABLE)
-- =========================================
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- =========================================
-- LEADERBOARDS (FIXED)
-- =========================================
CREATE TABLE IF NOT EXISTS leaderboards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    score NUMERIC(10,2),
    rank INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item ON transactions(marketplace_item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_emission_history_user ON emission_history(user_id);