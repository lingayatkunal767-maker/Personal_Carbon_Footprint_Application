-- CarbonCalc / CarbonTracker reference schema
-- NOTE: The real app uses Spring Data JPA with `spring.jpa.hibernate.ddl-auto=update`,
-- so tables will be created/updated automatically on backend startup.
-- This script is a clean schema you can run on a new Postgres DB
-- if you want to pre-create tables manually.

-- Create database (run once manually, not inside this script):
--   CREATE DATABASE carbon_tracker;

-- Switch to DB:
--   \c carbon_tracker

-- ============================================================
--  USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                   BIGSERIAL PRIMARY KEY,
  name                 VARCHAR(255),
  email                VARCHAR(255) UNIQUE NOT NULL,
  password             VARCHAR(255),
  created_at           TIMESTAMP,
  reset_token          VARCHAR(255),
  reset_token_expiry   TIMESTAMP,
  role                 VARCHAR(50),
  active               BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
--  AUTH TOKENS (minimal reference)
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_tokens (
  id         BIGSERIAL PRIMARY KEY,
  token      VARCHAR(512) NOT NULL,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  user_id    BIGINT REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
--  BADGE TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS badge_templates (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  code           VARCHAR(100) UNIQUE NOT NULL,
  description    TEXT,
  condition_text TEXT,
  icon           VARCHAR(16),
  active         BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
--  BADGES (awarded to users)
-- ============================================================

CREATE TABLE IF NOT EXISTS badges (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id  BIGINT REFERENCES badge_templates(id) ON DELETE SET NULL,
  badge_name   VARCHAR(255) NOT NULL,
  description  TEXT,
  awarded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

-- ============================================================
--  GOALS
-- ============================================================

CREATE TABLE IF NOT EXISTS goals (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_title           VARCHAR(255),
  category             VARCHAR(50),
  reduction_target     INTEGER,
  timeframe            VARCHAR(50),
  description          TEXT,
  target_emission      NUMERIC(19,2),
  current_emission     NUMERIC(19,2),
  progress_percentage  DOUBLE PRECISION,
  status               VARCHAR(32),
  start_date           DATE,
  end_date             DATE,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- ============================================================
--  CARBON LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS carbon_logs (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date                 DATE NOT NULL,
  transport_emission   NUMERIC(19,2),
  food_emission        NUMERIC(19,2),
  energy_emission      NUMERIC(19,2),
  total_emission       NUMERIC(19,2),

  -- lifestyle snapshot fields
  transport_mode       VARCHAR(50),
  distance_per_day     NUMERIC(19,2),
  fuel_type            VARCHAR(50),
  diet_type            VARCHAR(50),
  meals_per_day        INTEGER,
  eating_out_frequency VARCHAR(50),
  monthly_electricity  NUMERIC(19,2),
  renewable            BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_carbon_logs_user_date
  ON carbon_logs(user_id, date);

-- ============================================================
--  SURVEYS (used for ECO_STARTER / SURVEY_MASTER badges)
-- ============================================================

CREATE TABLE IF NOT EXISTS surveys (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers    JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);

-- ============================================================
--  MARKETPLACE ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS marketplace_items (
  id                       BIGSERIAL PRIMARY KEY,
  item_name                VARCHAR(255) NOT NULL,
  item_type                VARCHAR(255),
  price                    NUMERIC(38,2) NOT NULL,
  description              VARCHAR(1000),
  carbon_offset_value      NUMERIC(38,2),
  rating                   NUMERIC(3,2),
  badge                    VARCHAR(32),
  impact_progress_percent  INTEGER,
  price_unit               VARCHAR(64),
  header_icon              VARCHAR(32),
  banner_key               VARCHAR(64),
  created_at               TIMESTAMP NOT NULL,
  updated_at               TIMESTAMP,
  created_by               VARCHAR(255),
  updated_by               VARCHAR(255),
  ip_address               VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_type
  ON marketplace_items(item_type);

-- Optional legacy table name (kept because some deployments list `marketplace`).
-- The application currently uses `marketplace_items`.
CREATE TABLE IF NOT EXISTS marketplace (
  id                  BIGSERIAL PRIMARY KEY,
  item_name           VARCHAR(255) NOT NULL,
  item_type           VARCHAR(255),
  price               NUMERIC(38,2) NOT NULL,
  description         VARCHAR(1000),
  carbon_offset_value NUMERIC(38,2),
  created_at          TIMESTAMP NOT NULL
);

-- ============================================================
--  TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id                   BIGSERIAL PRIMARY KEY,
  amount               NUMERIC(38,2) NOT NULL,
  created_at           TIMESTAMP,
  status               VARCHAR(20),
  marketplace_item_id  BIGINT NOT NULL REFERENCES marketplace_items(id),
  user_id              BIGINT NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_marketplace_item_id
  ON transactions(marketplace_item_id);

-- ============================================================
--  NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id               BIGSERIAL PRIMARY KEY,
  created_at       TIMESTAMP,
  is_read          BOOLEAN,
  message          VARCHAR(255) NOT NULL,
  title            VARCHAR(255) NOT NULL,
  type             VARCHAR(255),
  user_id          BIGINT REFERENCES users(id),
  admin_name       VARCHAR(255),
  ip_address       VARCHAR(255),
  updated_at       TIMESTAMP,
  hidden_for_user  BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at);

-- ============================================================
--  ADMIN AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id             BIGSERIAL PRIMARY KEY,
  action         VARCHAR(200) NOT NULL,
  admin_email    VARCHAR(255),
  admin_name     VARCHAR(255),
  admin_user_id  BIGINT,
  created_at     TIMESTAMP NOT NULL,
  details        TEXT,
  ip_address     VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at
  ON admin_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id
  ON admin_audit_logs(admin_user_id);

-- ============================================================
--  WEEKLY LEADERBOARD SNAPSHOTS
-- ============================================================

-- The live leaderboard is computed on the fly by backend services.
-- This table persists weekly snapshot rows (one row per user per week).
-- NOTE: matches backend entity: WeeklyLeaderboard (@Table = weekly_leaderboard)

CREATE TABLE IF NOT EXISTS weekly_leaderboard (
  id                  BIGSERIAL PRIMARY KEY,
  week_start          DATE NOT NULL,
  week_end            DATE NOT NULL,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name           VARCHAR(255) NOT NULL,
  rank_position       INTEGER NOT NULL,
  emission_reduction  DOUBLE PRECISION NOT NULL,
  goals_completed     INTEGER NOT NULL,
  badges_earned       INTEGER NOT NULL,
  score               DOUBLE PRECISION NOT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weekly_leaderboard_week_start
  ON weekly_leaderboard(week_start);

CREATE INDEX IF NOT EXISTS idx_weekly_leaderboard_week_start_rank
  ON weekly_leaderboard(week_start, rank_position);

CREATE INDEX IF NOT EXISTS idx_weekly_leaderboard_user_week
  ON weekly_leaderboard(user_id, week_start);


