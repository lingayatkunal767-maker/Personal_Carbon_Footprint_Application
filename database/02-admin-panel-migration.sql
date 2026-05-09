-- Admin Panel Migration Script (non-destructive)
-- Apply on existing databases before running the updated backend.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS admin_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    access_level VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    department VARCHAR(100) DEFAULT 'Platform Operations',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

UPDATE users
SET role = 'USER'
WHERE role IS NULL OR TRIM(role) = '';

UPDATE users
SET is_active = TRUE
WHERE is_active IS NULL;

CREATE TABLE IF NOT EXISTS emission_factors (
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

CREATE TABLE IF NOT EXISTS badge_definitions (
    id BIGSERIAL PRIMARY KEY,
    badge_name VARCHAR(120) NOT NULL UNIQUE,
    badge_type VARCHAR(50) NOT NULL,
    description TEXT,
    threshold_percent DECIMAL(5, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badge_assignments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    badge_definition_id BIGINT REFERENCES badge_definitions(id) ON DELETE CASCADE,
    assigned_reason TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_badge_assignment UNIQUE (user_id, badge_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_emission_factors_category_key ON emission_factors(category, factor_key);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_active ON badge_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_badge_assignments_user ON user_badge_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user ON admin_profiles(user_id);

INSERT INTO admin_profiles (user_id, access_level, department)
SELECT id, 'ADMIN', 'Platform Operations'
FROM users
WHERE role = 'ADMIN'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO emission_factors (category, factor_key, factor_value, unit, description)
VALUES
('transport', 'car', 0.192, 'kg CO2e/km', 'Petrol/diesel car average factor'),
('transport', 'bus', 0.105, 'kg CO2e/km', 'Public bus average factor'),
('transport', 'train', 0.041, 'kg CO2e/km', 'Train/metro average factor'),
('transport', 'auto', 0.120, 'kg CO2e/km', 'Auto-rickshaw average factor'),
('transport', 'ev_car', 0.060, 'kg CO2e/km', 'Electric car average factor'),
('food', 'non_veg', 2.500, 'kg CO2e/meal', 'Non-vegetarian meal factor'),
('food', 'veg', 1.200, 'kg CO2e/meal', 'Vegetarian meal factor'),
('energy', 'electricity', 0.820, 'kg CO2e/kWh', 'Grid electricity emission factor'),
('energy', 'lpg_cylinder', 42.600, 'kg CO2e/cylinder', 'LPG cylinder emission factor')
ON CONFLICT (category, factor_key) DO NOTHING;

INSERT INTO badge_definitions (badge_name, badge_type, description, threshold_percent, is_active)
VALUES
('Eco Starter', 'MILESTONE', 'Awarded for beginning carbon reduction journey', 5.00, true),
('Green Momentum', 'ACHIEVEMENT', 'Awarded for consistent reduction in emissions', 10.00, true),
('Carbon Champion', 'ACHIEVEMENT', 'Awarded for high carbon reduction performance', 20.00, true),
('Net Zero Hero', 'SPECIAL', 'Awarded for exceptional sustainability impact', 30.00, true)
ON CONFLICT (badge_name) DO NOTHING;
