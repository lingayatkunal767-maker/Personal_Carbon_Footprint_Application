-- Standardize historical notification message wording.
-- Safe to run multiple times.

-- Collapse repeated whitespace and trim.
UPDATE notifications
SET message = btrim(regexp_replace(message, '\s+', ' ', 'g'))
WHERE message IS NOT NULL
  AND message <> btrim(regexp_replace(message, '\s+', ' ', 'g'));

-- Remove spaces before punctuation marks.
UPDATE notifications
SET message = regexp_replace(message, '\s+([,.;:!?])', '\1', 'g')
WHERE message IS NOT NULL
  AND message ~ '\s+[,.;:!?]';

-- Collapse repeated terminal punctuation sequences (for example '..', '!..').
UPDATE notifications
SET message = regexp_replace(message, '([.!?])[.!?]+', '\1', 'g')
WHERE message IS NOT NULL
  AND message ~ '([.!?])[.!?]+';

-- Capitalize leading lowercase letter for sentence consistency.
UPDATE notifications
SET message = upper(substring(message from 1 for 1)) || substring(message from 2)
WHERE message IS NOT NULL
  AND message ~ '^[a-z]';

-- Ensure separator before Reason clause when preceding sentence has no punctuation.
UPDATE notifications
SET message = regexp_replace(message, '([^.!?])\s+Reason:', '\1. Reason:', 'g')
WHERE message IS NOT NULL
  AND message ~ '([^.!?])\s+Reason:';

-- Ensure punctuation has exactly one space before trailing symbol glyphs.
UPDATE notifications
SET message = regexp_replace(message, '([.!?])\s*([^[:alnum:][:space:]])$', '\1 \2', 'g')
WHERE message IS NOT NULL
  AND message ~ '([.!?])\s*[^[:alnum:][:space:]]$';

-- Remove redundant period in mixed endings like '!. <symbol>'.
UPDATE notifications
SET message = regexp_replace(message, '([!?])\.\s*([^[:alnum:][:space:]])$', '\1 \2', 'g')
WHERE message IS NOT NULL
  AND message ~ '([!?])\.\s*[^[:alnum:][:space:]]$';

-- Remove redundant period in spaced mixed endings like '! . <symbol>'.
UPDATE notifications
SET message = regexp_replace(message, '([!?])\s*\.\s*([^[:alnum:][:space:]])$', '\1 \2', 'g')
WHERE message IS NOT NULL
  AND message ~ '([!?])\s*\.\s*[^[:alnum:][:space:]]$';

-- Move trailing period before ending symbol glyphs for natural sentence flow.
UPDATE notifications
SET message = regexp_replace(message, '([^[:alnum:][:space:]])\.$', '. \1', 'g')
WHERE message IS NOT NULL
  AND message ~ '[^[:alnum:][:space:]]\.$';

-- Ensure terminal punctuation.
UPDATE notifications
SET message = message || '.'
WHERE message IS NOT NULL
  AND message !~ '[.!?]$'
  AND message !~ '[^[:alnum:][:space:]]$';
