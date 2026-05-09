-- Seed Data for Sustainability Tracker
-- Sample data for testing

-- Insert sample users
INSERT INTO users (name, email, oauth_provider, oauth_id, profile_picture, role, is_active, member_since) VALUES
('John Doe', 'john.doe@example.com', 'google', 'google-123456', 'https://i.pravatar.cc/150?img=1', 'USER', true, '2024-01-15 10:00:00'),
('Jane Smith', 'jane.smith@example.com', 'google', 'google-789012', 'https://i.pravatar.cc/150?img=5', 'USER', true, '2024-02-01 14:30:00'),
('Mike Johnson', 'mike.j@example.com', 'google', 'google-345678', 'https://i.pravatar.cc/150?img=3', 'USER', true, '2024-01-20 09:15:00'),
('Sarah Williams', 'sarah.w@example.com', 'google', 'google-901234', 'https://i.pravatar.cc/150?img=9', 'USER', true, '2024-02-10 16:45:00');

-- Backfill admin profiles for any seeded or pre-existing admin users
INSERT INTO admin_profiles (user_id, access_level, department)
SELECT id, 'ADMIN', 'Platform Operations'
FROM users
WHERE role = 'ADMIN'
ON CONFLICT (user_id) DO NOTHING;

-- Default emission factors (admin can update these in panel)
INSERT INTO emission_factors (category, factor_key, factor_value, unit, description) VALUES
('transport', 'car', 0.192, 'kg CO2e/km', 'Petrol/diesel car average factor'),
('transport', 'bus', 0.105, 'kg CO2e/km', 'Public bus average factor'),
('transport', 'train', 0.041, 'kg CO2e/km', 'Train/metro average factor'),
('transport', 'auto', 0.120, 'kg CO2e/km', 'Auto-rickshaw average factor'),
('transport', 'ev_car', 0.060, 'kg CO2e/km', 'Electric car average factor'),
('food', 'non_veg', 2.500, 'kg CO2e/meal', 'Non-vegetarian meal factor'),
('food', 'veg', 1.200, 'kg CO2e/meal', 'Vegetarian meal factor'),
('energy', 'electricity', 0.820, 'kg CO2e/kWh', 'Grid electricity emission factor'),
('energy', 'lpg_cylinder', 42.600, 'kg CO2e/cylinder', 'LPG cylinder emission factor');

-- Badge definitions (admin-managed templates)
INSERT INTO badge_definitions (badge_name, badge_type, description, threshold_percent, is_active) VALUES
('Eco Starter', 'MILESTONE', 'Awarded for beginning carbon reduction journey', 5.00, true),
('Green Momentum', 'ACHIEVEMENT', 'Awarded for consistent reduction in emissions', 10.00, true),
('Carbon Champion', 'ACHIEVEMENT', 'Awarded for high carbon reduction performance', 20.00, true),
('Net Zero Hero', 'SPECIAL', 'Awarded for exceptional sustainability impact', 30.00, true);

-- Insert sample carbon activities
INSERT INTO carbon_activities (user_id, activity_type, activity_name, carbon_amount, activity_date, description) VALUES
-- John's activities
(1, 'transport', 'Bike to work', 5.5, '2026-02-18', 'Cycled instead of driving'),
(1, 'transport', 'Public transport', 3.2, '2026-02-17', 'Took bus instead of car'),
(1, 'energy', 'Solar panel usage', 10.0, '2026-02-16', 'Generated solar energy'),
(1, 'food', 'Vegetarian meal', 2.1, '2026-02-15', 'Plant-based lunch'),

-- Jane's activities
(2, 'transport', 'Electric vehicle', 8.0, '2026-02-18', 'Used EV instead of gas car'),
(2, 'waste', 'Recycling', 1.5, '2026-02-17', 'Recycled plastic and paper'),
(2, 'energy', 'LED bulbs', 4.3, '2026-02-16', 'Replaced traditional bulbs'),

-- Mike's activities
(3, 'transport', 'Carpool', 6.5, '2026-02-18', 'Shared ride with 3 colleagues'),
(3, 'food', 'Local produce', 3.0, '2026-02-17', 'Bought from farmers market'),
(3, 'energy', 'Energy-efficient appliances', 5.2, '2026-02-16', 'New fridge saves energy'),

-- Sarah's activities
(4, 'transport', 'Walk to store', 2.8, '2026-02-18', 'Walked instead of driving'),
(4, 'waste', 'Composting', 1.2, '2026-02-17', 'Started home composting');

-- Insert sample goals
INSERT INTO goals (user_id, goal_type, target_value, current_value, deadline, status) VALUES
(1, 'monthly_reduction', 50.0, 20.8, '2026-03-01', 'active'),
(2, 'transport', 30.0, 13.8, '2026-02-28', 'active'),
(3, 'yearly_reduction', 200.0, 45.0, '2026-12-31', 'active'),
(4, 'waste_reduction', 15.0, 4.0, '2026-03-15', 'active');

-- Insert sample badges
INSERT INTO badges (user_id, badge_name, badge_type, description) VALUES
(1, 'First Steps', 'beginner', 'Logged first activity'),
(1, 'Week Warrior', 'streak', 'Logged activities for 7 consecutive days'),
(2, 'Green Commuter', 'transport', 'Used eco-friendly transport 10 times'),
(2, 'First Steps', 'beginner', 'Logged first activity'),
(3, 'Community Hero', 'social', 'Inspired 5 others to join'),
(3, 'First Steps', 'beginner', 'Logged first activity'),
(4, 'First Steps', 'beginner', 'Logged first activity');

-- Initial badge assignments to align with existing user badges
INSERT INTO user_badge_assignments (user_id, badge_definition_id, assigned_reason)
SELECT 1, id, 'Seed assignment for starter badge' FROM badge_definitions WHERE badge_name = 'Eco Starter';

-- Refresh the leaderboard view
REFRESH MATERIALIZED VIEW leaderboard;

-- Verify data
SELECT 'Users:' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'Activities:', COUNT(*) FROM carbon_activities
UNION ALL
SELECT 'Goals:', COUNT(*) FROM goals
UNION ALL
SELECT 'Badges:', COUNT(*) FROM badges;

-- Show leaderboard
SELECT * FROM leaderboard ORDER BY rank;
