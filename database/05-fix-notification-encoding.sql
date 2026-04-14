-- Fix legacy/mis-encoded notification titles in historical records
-- Safe to run multiple times.

-- Normalize marketplace cancellation titles
UPDATE notifications
SET title = 'Order Cancelled'
WHERE notification_type = 'MARKETPLACE'
  AND lower(title) LIKE '%order cancelled%'
  AND title <> 'Order Cancelled';

-- Normalize marketplace confirmation titles
UPDATE notifications
SET title = 'Order Confirmed'
WHERE notification_type = 'MARKETPLACE'
  AND lower(title) LIKE '%order confirmed%'
  AND title <> 'Order Confirmed';
