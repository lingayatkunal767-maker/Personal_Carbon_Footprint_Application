-- ============================================
-- Test Data for Carbon Tracking System
-- ============================================
-- Run this after schema.sql and seed-data.sql
-- This will create sample lifestyle surveys and carbon logs

-- Ensure we have a test user (user_id = 1)
INSERT INTO users (name, email, password_hash, created_at)
VALUES ('Test User', 'test@example.com', '$2a$10$dummyhashforpostgrestest', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Get the user_id (assuming it's 1 for simplicity)
-- In production, you'd use the actual user_id from your application

-- ============================================
-- Sample Lifestyle Surveys (Last 30 Days)
-- ============================================

-- Day 1: High emissions (Car commute + non-veg diet + high electricity)
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES (1, CURRENT_DATE - INTERVAL '30 days', 'CAR', 25.0, 'PETROL', 10, 11, 350, 2.0);

-- Day 2: Medium emissions (Bus commute)
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES (1, CURRENT_DATE - INTERVAL '29 days', 'BUS', 20.0, 'NA', 8, 13, 300, 1.5);

-- Day 3: Low emissions (Train + vegetarian)
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES (1, CURRENT_DATE - INTERVAL '28 days', 'TRAIN', 30.0, 'NA', 3, 18, 280, 1.5);

-- Day 4: Electric vehicle
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES (1, CURRENT_DATE - INTERVAL '27 days', 'CAR', 22.0, 'EV', 7, 14, 320, 1.8);

-- Day 5: Walk to work (zero transport emissions)
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES (1, CURRENT_DATE - INTERVAL '26 days', 'WALK', 5.0, 'NA', 5, 16, 290, 1.5);

-- Days 6-15: Varied data
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES 
(1, CURRENT_DATE - INTERVAL '25 days', 'AUTO', 15.0, 'NA', 6, 15, 310, 1.7),
(1, CURRENT_DATE - INTERVAL '24 days', 'METRO', 18.0, 'NA', 7, 14, 305, 1.6),
(1, CURRENT_DATE - INTERVAL '23 days', 'BUS', 20.0, 'NA', 8, 13, 295, 1.5),
(1, CURRENT_DATE - INTERVAL '22 days', 'CAR', 24.0, 'DIESEL', 9, 12, 330, 1.8),
(1, CURRENT_DATE - INTERVAL '21 days', 'BIKE', 10.0, 'NA', 6, 15, 285, 1.4),
(1, CURRENT_DATE - INTERVAL '20 days', 'TRAIN', 28.0, 'NA', 5, 16, 300, 1.5),
(1, CURRENT_DATE - INTERVAL '19 days', 'CAR', 25.0, 'PETROL', 10, 11, 340, 2.0),
(1, CURRENT_DATE - INTERVAL '18 days', 'BUS', 19.0, 'NA', 7, 14, 310, 1.6),
(1, CURRENT_DATE - INTERVAL '17 days', 'AUTO', 14.0, 'NA', 8, 13, 295, 1.5),
(1, CURRENT_DATE - INTERVAL '16 days', 'CAR', 23.0, 'EV', 6, 15, 315, 1.7);

-- Days 16-30: Recent data with improving trend
INSERT INTO lifestyle_surveys (user_id, survey_date, transport_mode, distance_km_per_day, fuel_type, 
                               meals_non_veg_per_week, meals_veg_per_week, electricity_kwh_per_month, 
                               cooking_gas_cylinders_per_month)
VALUES 
(1, CURRENT_DATE - INTERVAL '15 days', 'METRO', 20.0, 'NA', 5, 16, 290, 1.5),
(1, CURRENT_DATE - INTERVAL '14 days', 'TRAIN', 25.0, 'NA', 4, 17, 285, 1.4),
(1, CURRENT_DATE - INTERVAL '13 days', 'BUS', 18.0, 'NA', 5, 16, 280, 1.5),
(1, CURRENT_DATE - INTERVAL '12 days', 'WALK', 6.0, 'NA', 3, 18, 275, 1.3),
(1, CURRENT_DATE - INTERVAL '11 days', 'BIKE', 8.0, 'NA', 4, 17, 270, 1.4),
(1, CURRENT_DATE - INTERVAL '10 days', 'METRO', 20.0, 'NA', 5, 16, 280, 1.5),
(1, CURRENT_DATE - INTERVAL '9 days', 'TRAIN', 22.0, 'NA', 4, 17, 275, 1.4),
(1, CURRENT_DATE - INTERVAL '8 days', 'BUS', 17.0, 'NA', 5, 16, 285, 1.5),
(1, CURRENT_DATE - INTERVAL '7 days', 'WALK', 5.0, 'NA', 3, 18, 270, 1.3),
(1, CURRENT_DATE - INTERVAL '6 days', 'BIKE', 7.0, 'NA', 4, 17, 275, 1.4),
(1, CURRENT_DATE - INTERVAL '5 days', 'METRO', 19.0, 'NA', 5, 16, 280, 1.5),
(1, CURRENT_DATE - INTERVAL '4 days', 'TRAIN', 24.0, 'NA', 4, 17, 275, 1.4),
(1, CURRENT_DATE - INTERVAL '3 days', 'BUS', 16.0, 'NA', 5, 16, 270, 1.4),
(1, CURRENT_DATE - INTERVAL '2 days', 'WALK', 6.0, 'NA', 3, 18, 265, 1.3),
(1, CURRENT_DATE - INTERVAL '1 day', 'BIKE', 8.0, 'NA', 4, 17, 270, 1.4);

-- ============================================
-- Corresponding Carbon Logs (Auto-calculated)
-- ============================================
-- In production, these would be automatically generated by the CarbonCalculationService
-- For testing, we'll insert calculated values

-- Helper calculations:
-- Transport: distance_km × emission_factor
-- Food: (non_veg_meals × 2.5 + veg_meals × 1.2) / 7
-- Energy: (electricity/30 × 0.82) + (lpg_cylinders/30 × 42.6)

INSERT INTO carbon_logs (user_id, log_date, transport_emission, food_emission, energy_emission, total_emission)
SELECT 
    user_id,
    survey_date as log_date,
    CASE 
        WHEN transport_mode = 'CAR' AND fuel_type = 'PETROL' THEN distance_km_per_day * 0.192
        WHEN transport_mode = 'CAR' AND fuel_type = 'DIESEL' THEN distance_km_per_day * 0.192
        WHEN transport_mode = 'CAR' AND fuel_type = 'EV' THEN distance_km_per_day * 0.060
        WHEN transport_mode = 'BUS' THEN distance_km_per_day * 0.105
        WHEN transport_mode = 'TRAIN' OR transport_mode = 'METRO' THEN distance_km_per_day * 0.041
        WHEN transport_mode = 'AUTO' THEN distance_km_per_day * 0.120
        ELSE 0
    END as transport_emission,
    ((meals_non_veg_per_week * 2.5) + (meals_veg_per_week * 1.2)) / 7.0 as food_emission,
    ((electricity_kwh_per_month / 30.0 * 0.82) + (cooking_gas_cylinders_per_month / 30.0 * 42.6)) as energy_emission,
    (
        CASE 
            WHEN transport_mode = 'CAR' AND fuel_type = 'PETROL' THEN distance_km_per_day * 0.192
            WHEN transport_mode = 'CAR' AND fuel_type = 'DIESEL' THEN distance_km_per_day * 0.192
            WHEN transport_mode = 'CAR' AND fuel_type = 'EV' THEN distance_km_per_day * 0.060
            WHEN transport_mode = 'BUS' THEN distance_km_per_day * 0.105
            WHEN transport_mode = 'TRAIN' OR transport_mode = 'METRO' THEN distance_km_per_day * 0.041
            WHEN transport_mode = 'AUTO' THEN distance_km_per_day * 0.120
            ELSE 0
        END +
        ((meals_non_veg_per_week * 2.5) + (meals_veg_per_week * 1.2)) / 7.0 +
        ((electricity_kwh_per_month / 30.0 * 0.82) + (cooking_gas_cylinders_per_month / 30.0 * 42.6))
    ) as total_emission
FROM lifestyle_surveys
WHERE user_id = 1
ON CONFLICT (user_id, log_date) DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Check lifestyle surveys
SELECT COUNT(*) as survey_count FROM lifestyle_surveys WHERE user_id = 1;

-- Check carbon logs
SELECT COUNT(*) as log_count FROM carbon_logs WHERE user_id = 1;

-- View recent emissions
SELECT 
    log_date,
    ROUND(transport_emission::numeric, 2) as transport,
    ROUND(food_emission::numeric, 2) as food,
    ROUND(energy_emission::numeric, 2) as energy,
    ROUND(total_emission::numeric, 2) as total
FROM carbon_logs 
WHERE user_id = 1 
ORDER BY log_date DESC 
LIMIT 10;

-- Summary statistics
SELECT 
    COUNT(*) as total_days,
    ROUND(AVG(total_emission)::numeric, 2) as avg_daily_emission,
    ROUND(SUM(total_emission)::numeric, 2) as total_emissions,
    ROUND(AVG(transport_emission)::numeric, 2) as avg_transport,
    ROUND(AVG(food_emission)::numeric, 2) as avg_food,
    ROUND(AVG(energy_emission)::numeric, 2) as avg_energy
FROM carbon_logs 
WHERE user_id = 1;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 
    '✅ Test data inserted successfully!' as message,
    COUNT(*) as records_created
FROM carbon_logs 
WHERE user_id = 1;
