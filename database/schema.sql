-- Sustainability Tracker Database Schema
-- PostgreSQL 15+

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS carbon_logs CASCADE;
DROP TABLE IF EXISTS lifestyle_surveys CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS user_badge_assignments CASCADE;
DROP TABLE IF EXISTS badge_definitions CASCADE;
DROP TABLE IF EXISTS emission_factors CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS carbon_activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP MATERIALIZED VIEW IF EXISTS leaderboard;

-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    profile_picture TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Profiles Table
CREATE TABLE admin_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    access_level VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    department VARCHAR(100) DEFAULT 'Platform Operations',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emission Factors (admin managed)
CREATE TABLE emission_factors (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    factor_key VARCHAR(100) NOT NULL,
    factor_value DECIMAL(12, 6) NOT NULL,
    unit VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emission_factor UNIQUE (category, factor_key)
);

-- Badge Definitions (admin managed templates)
CREATE TABLE badge_definitions (
    id BIGSERIAL PRIMARY KEY,
    badge_name VARCHAR(120) NOT NULL UNIQUE,
    badge_type VARCHAR(50) NOT NULL,
    description TEXT,
    threshold_percent DECIMAL(5, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon Activities Table
CREATE TABLE carbon_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'transport', 'energy', 'food', 'waste'
    activity_name VARCHAR(255) NOT NULL,
    carbon_amount DECIMAL(10, 2) NOT NULL, -- in kg CO2
    activity_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals Table
CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
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
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- User badge assignments from admin definitions
CREATE TABLE user_badge_assignments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    badge_definition_id BIGINT REFERENCES badge_definitions(id) ON DELETE CASCADE,
    assigned_reason TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_badge_assignment UNIQUE (user_id, badge_definition_id)
);

-- Indexes for performance
CREATE INDEX idx_activities_user_date ON carbon_activities(user_id, activity_date);
CREATE INDEX idx_activities_type ON carbon_activities(activity_type);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_badges_user ON badges(user_id);
CREATE INDEX idx_badge_definitions_active ON badge_definitions(is_active);
CREATE INDEX idx_user_badge_assignments_user ON user_badge_assignments(user_id);
CREATE INDEX idx_emission_factors_category_key ON emission_factors(category, factor_key);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_id);
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_admin_profiles_user ON admin_profiles(user_id);

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
COMMENT ON TABLE admin_profiles IS 'Admin-only profile records linked to ADMIN users';
COMMENT ON TABLE emission_factors IS 'Admin-managed emission factors used in carbon calculations';
COMMENT ON TABLE badge_definitions IS 'Admin-managed reusable badge templates and thresholds';
COMMENT ON TABLE user_badge_assignments IS 'Badge definition assignments to users by admins or automation';
COMMENT ON TABLE carbon_activities IS 'Logged carbon emission activities';
COMMENT ON TABLE goals IS 'User carbon reduction goals';
COMMENT ON TABLE badges IS 'Achievement badges earned by users';
COMMENT ON MATERIALIZED VIEW leaderboard IS 'Cached user rankings by carbon savings';

-- Lifestyle Surveys Table (for detailed carbon tracking)
CREATE TABLE lifestyle_surveys (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    transport_mode VARCHAR(20) NOT NULL,
    distance_km_per_day DECIMAL(10, 2) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    meals_non_veg_per_week INTEGER,
    meals_veg_per_week INTEGER,
    electricity_kwh_per_month DECIMAL(10, 2) NOT NULL,
    cooking_gas_cylinders_per_month DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_lifestyle_transport_mode CHECK (transport_mode IN ('CAR', 'BIKE', 'BUS', 'TRAIN', 'WALK', 'AUTO', 'METRO')),
    CONSTRAINT chk_lifestyle_fuel_type CHECK (fuel_type IN ('PETROL', 'DIESEL', 'EV', 'NA')),
    CONSTRAINT chk_lifestyle_meals_nonveg CHECK (meals_non_veg_per_week IS NULL OR meals_non_veg_per_week >= 0),
    CONSTRAINT chk_lifestyle_meals_veg CHECK (meals_veg_per_week IS NULL OR meals_veg_per_week >= 0)
);

-- Carbon Logs Table (calculated emissions from surveys)
CREATE TABLE carbon_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    transport_emission DECIMAL(10, 2),
    food_emission DECIMAL(10, 2),
    energy_emission DECIMAL(10, 2),
    total_emission DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_carbon_logs_user_date UNIQUE (user_id, log_date)
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- BADGE_EARNED, GOAL_PROGRESS, GOAL_COMPLETED, HIGH_EMISSIONS, REMINDER, MARKETPLACE
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Products Table (Marketplace)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- REUSABLE, ENERGY_EFFICIENT, SUSTAINABLE_FASHION, ORGANIC_FOOD, ECO_TRANSPORT, HOME_GARDEN
    price DECIMAL(10, 2) NOT NULL,
    eco_points_price DECIMAL(10, 2),
    carbon_saving DECIMAL(10, 2), -- Estimated CO2e saved per year
    image_url VARCHAR(500),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    sustainability_score DECIMAL(3, 1),
    vendor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    eco_points_used DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    payment_method VARCHAR(50),
    shipping_address TEXT,
    contact_phone VARCHAR(20),
    notes TEXT,
    estimated_carbon_saving DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Additional Indexes
CREATE INDEX idx_lifestyle_surveys_user_date ON lifestyle_surveys(user_id, survey_date);
CREATE INDEX idx_carbon_logs_user_date ON carbon_logs(user_id, log_date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Additional Comments
COMMENT ON TABLE lifestyle_surveys IS 'Daily lifestyle survey responses for carbon tracking';
COMMENT ON TABLE carbon_logs IS 'Calculated carbon emissions from lifestyle surveys';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE products IS 'Eco-friendly products in marketplace';
COMMENT ON TABLE orders IS 'Marketplace orders';
COMMENT ON TABLE order_items IS 'Individual items in orders';

