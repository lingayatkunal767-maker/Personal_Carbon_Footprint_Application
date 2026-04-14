-- Normalize historical text variants for notifications and badge types.
-- Safe to run multiple times.

-- Canonicalize marketplace titles
UPDATE notifications
SET title = 'Order Confirmed'
WHERE notification_type = 'MARKETPLACE'
  AND lower(title) LIKE '%order confirmed%'
  AND title <> 'Order Confirmed';

UPDATE notifications
SET title = 'Order Cancelled'
WHERE notification_type = 'MARKETPLACE'
  AND lower(title) LIKE '%order cancelled%'
  AND title <> 'Order Cancelled';

-- Canonicalize badge notification titles
UPDATE notifications
SET title = 'Badge Earned'
WHERE notification_type = 'BADGE_EARNED'
  AND (
    lower(title) LIKE '%badge assigned%'
    OR lower(title) LIKE '%badge earned%'
  )
  AND title <> 'Badge Earned';

-- Canonicalize badge type variants in earned badges
UPDATE badges
SET badge_type = 'MILESTONE'
WHERE lower(trim(badge_type)) IN ('beginner', 'streak');

UPDATE badges
SET badge_type = 'CATEGORY'
WHERE lower(trim(badge_type)) IN ('transport', 'social');

UPDATE badges
SET badge_type = upper(trim(badge_type))
WHERE badge_type IS NOT NULL
  AND badge_type <> upper(trim(badge_type));

-- Keep badge definition types normalized too
UPDATE badge_definitions
SET badge_type = upper(trim(badge_type))
WHERE badge_type IS NOT NULL
  AND badge_type <> upper(trim(badge_type));
