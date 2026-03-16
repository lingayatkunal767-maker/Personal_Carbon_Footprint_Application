-- Sustainability Tracker Database Schema
-- PostgreSQL 15+

-- Drop existing tables if they exist
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS carbon_activities CASCADE;
DROP TABLE IF EXISTS lifestyle_surveys CASCADE;
DROP TABLE IF EXISTS carbon_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP MATERIALIZED VIEW IF EXISTS leaderboard;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    profile_picture TEXT,
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lifestyle Surveys Table
CREATE TABLE lifestyle_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    transport_mode VARCHAR(20) NOT NULL,
    distance_km_per_day DECIMAL(10, 2) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    meals_non_veg_per_week INTEGER,
    meals_veg_per_week INTEGER,
    electricity_kwh_per_month DECIMAL(10, 2) NOT NULL,
    cooking_gas_cylinders_per_month DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon Logs Table (Daily Aggregates)
CREATE TABLE carbon_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    transport_emission DECIMAL(10, 2),
    food_emission DECIMAL(10, 2),
    energy_emission DECIMAL(10, 2),
    total_emission DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_carbon_logs_user_date UNIQUE (user_id, log_date)
);

-- Carbon Activities Table (Granular Events)
CREATE TABLE carbon_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'transport', 'energy', 'food', 'waste'
    activity_name VARCHAR(255) NOT NULL,
    carbon_amount DECIMAL(10, 2) NOT NULL, -- in kg CO2
    activity_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals Table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) DEFAULT 0,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges Table
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Indexes for performance
CREATE INDEX idx_activities_user_date ON carbon_activities(user_id, activity_date);
CREATE INDEX idx_activities_type ON carbon_activities(activity_type);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_badges_user ON badges(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_id);
CREATE INDEX idx_surveys_user_date ON lifestyle_surveys(user_id, survey_date);
CREATE INDEX idx_logs_user_date ON carbon_logs(user_id, log_date);

-- Leaderboard Materialized View (for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    u.id,
    u.name,
    u.profile_picture,
    COUNT(DISTINCT b.id) as badge_count,
    COALESCE(SUM(ca.carbon_amount), 0) as total_carbon_saved,
    RANK() OVER (ORDER BY COALESCE(SUM(ca.carbon_amount), 0) DESC) as rank
FROM users u
LEFT JOIN badges b ON u.id = b.user_id
LEFT JOIN carbon_activities ca ON u.id = ca.user_id
GROUP BY u.id, u.name, u.profile_picture;

-- Create unique index on leaderboard
CREATE UNIQUE INDEX idx_leaderboard_id ON leaderboard(id);

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with OAuth support';
COMMENT ON TABLE lifestyle_surveys IS 'User submitted lifestyle data for calculation';
COMMENT ON TABLE carbon_logs IS 'Daily aggregated carbon footprint logs';
COMMENT ON TABLE carbon_activities IS 'Granular logged carbon emission activities';
COMMENT ON TABLE goals IS 'User carbon reduction goals';
COMMENT ON TABLE badges IS 'Achievement badges earned by users';
COMMENT ON MATERIALIZED VIEW leaderboard IS 'Cached user rankings by carbon savings';
