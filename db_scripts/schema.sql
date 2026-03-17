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
--  LEADERBOARD (runtime + history)
-- ============================================================

-- The live leaderboard is computed on the fly from goals, badges,
-- and carbon_logs by the backend.

-- This table stores WEEKLY snapshots so we can track progress over time.

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start          DATE   NOT NULL,
  week_end            DATE   NOT NULL,
  rank                INTEGER,
  score               DOUBLE PRECISION,
  emission_reduction  DOUBLE PRECISION,
  goals_completed     INTEGER,
  badges_earned       INTEGER,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- One row per user per week
CREATE UNIQUE INDEX IF NOT EXISTS ux_leaderboard_snapshots_user_week
  ON leaderboard_snapshots(user_id, week_start, week_end);


