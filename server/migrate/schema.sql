-- DeltaScreener — PostgreSQL schema
-- Ported from the D1 (SQLite) schema defined in worker-d1-upload.js
--   ensureStockSchema()  → stock_data, stock_universe, stock_universe_stage, app_meta
--   initDB()             → users, watchlists, saved_screens, user_preferences, sessions
--   ensureUserDataSchema() → alerts, alert_events
--   blog handlers        → blog_posts, pro_users
--
-- Type mapping:  SQLite REAL → DOUBLE PRECISION,  INTEGER PK AUTOINCREMENT → IDENTITY.
-- Timestamp columns stay TEXT (ISO-8601) so the worker's string comparisons
-- keep working unchanged.

-- ─────────────────────────────────────────────────────────────────────────────
-- Screener data
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stock_data (
  ticker                  TEXT PRIMARY KEY,
  all_data                TEXT,
  overview                TEXT,
  financials              TEXT,
  ratios                  TEXT,
  chart                   TEXT,
  shareholders            TEXT,
  earnings                TEXT,
  announcements           TEXT,
  news                    TEXT,
  name                    TEXT,
  exchange                TEXT,
  sector                  TEXT,
  industry                TEXT,
  country                 TEXT,
  price                   DOUBLE PRECISION,
  change_pct              DOUBLE PRECISION,
  mkt_cap                 DOUBLE PRECISION,
  pe                      DOUBLE PRECISION,
  pb                      DOUBLE PRECISION,
  ps                      DOUBLE PRECISION,
  roe                     DOUBLE PRECISION,
  roa                     DOUBLE PRECISION,
  roce                    DOUBLE PRECISION,
  net_margin              DOUBLE PRECISION,
  debt_to_equity          DOUBLE PRECISION,
  dividend_yield          DOUBLE PRECISION,
  peg                     DOUBLE PRECISION,
  ev_ebitda               DOUBLE PRECISION,
  fcf_yield               DOUBLE PRECISION,
  rev_growth              DOUBLE PRECISION,
  eps_growth              DOUBLE PRECISION,
  ma_50                   DOUBLE PRECISION,
  ma_200                  DOUBLE PRECISION,
  volume                  DOUBLE PRECISION,
  avg_volume              DOUBLE PRECISION,
  year_high               DOUBLE PRECISION,
  year_low                DOUBLE PRECISION,
  beta                    DOUBLE PRECISION,
  gross_margin            DOUBLE PRECISION,
  op_margin               DOUBLE PRECISION,
  current_ratio           DOUBLE PRECISION,
  enterprise_value        DOUBLE PRECISION,
  ev_sales                DOUBLE PRECISION,
  p_fcf                   DOUBLE PRECISION,
  p_ocf                   DOUBLE PRECISION,
  earnings_yield          DOUBLE PRECISION,
  quick_ratio             DOUBLE PRECISION,
  interest_coverage       DOUBLE PRECISION,
  payout_ratio            DOUBLE PRECISION,
  book_value_ps           DOUBLE PRECISION,
  ebitda                  DOUBLE PRECISION,
  free_cash_flow          DOUBLE PRECISION,
  operating_cash_flow     DOUBLE PRECISION,
  total_debt              DOUBLE PRECISION,
  total_cash              DOUBLE PRECISION,
  net_debt                DOUBLE PRECISION,
  quote_updated_at        TEXT,
  financials_updated_at   TEXT,
  financials_attempted_at TEXT,
  financials_failed_at    TEXT,
  financials_failed_count INTEGER DEFAULT 0,
  updated_at              TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  created_at              TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);

CREATE INDEX IF NOT EXISTS idx_stock_data_mkt_cap        ON stock_data(mkt_cap);
CREATE INDEX IF NOT EXISTS idx_stock_data_change_pct     ON stock_data(change_pct);
CREATE INDEX IF NOT EXISTS idx_stock_data_rev_growth     ON stock_data(rev_growth);
CREATE INDEX IF NOT EXISTS idx_stock_data_sector         ON stock_data(sector);
CREATE INDEX IF NOT EXISTS idx_stock_data_updated        ON stock_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_stock_data_quote_updated  ON stock_data(quote_updated_at);
CREATE INDEX IF NOT EXISTS idx_stock_data_fin_updated    ON stock_data(financials_updated_at);
CREATE INDEX IF NOT EXISTS idx_stock_data_fin_attempted  ON stock_data(financials_attempted_at);

-- These two are NOT in the D1 schema. They exist because the $154 incident was
-- caused by unindexed JOIN COUNT queries in getUniverseCoverageCounts().
-- Postgres does not bill per row read, but these keep those counts off the CPU.
CREATE INDEX IF NOT EXISTS idx_stock_data_overview_notnull
  ON stock_data(ticker) WHERE overview IS NOT NULL AND overview NOT IN ('', '{}', 'null');
CREATE INDEX IF NOT EXISTS idx_stock_data_price_mktcap
  ON stock_data(ticker) WHERE price > 0 AND mkt_cap > 0;

CREATE TABLE IF NOT EXISTS stock_universe (
  ticker     TEXT PRIMARY KEY,
  name       TEXT,
  exchange   TEXT,
  type       TEXT,
  is_active  INTEGER DEFAULT 1,
  source     TEXT,
  updated_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_stock_universe_exchange ON stock_universe(exchange);
CREATE INDEX IF NOT EXISTS idx_stock_universe_active   ON stock_universe(is_active);

CREATE TABLE IF NOT EXISTS stock_universe_stage (
  ticker     TEXT PRIMARY KEY,
  name       TEXT,
  exchange   TEXT,
  type       TEXT,
  is_active  INTEGER DEFAULT 1,
  source     TEXT,
  updated_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);

CREATE TABLE IF NOT EXISTS app_meta (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Users / auth
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  picture    TEXT,
  created_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  created_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS watchlists (
  id          INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id     TEXT NOT NULL,
  ticker      TEXT NOT NULL,
  name        TEXT,
  price       DOUBLE PRECISION,
  exchange    TEXT,
  "change"    DOUBLE PRECISION,
  change_pct  DOUBLE PRECISION,
  added_at    TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  updated_at  TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  UNIQUE (user_id, ticker)
);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);

CREATE TABLE IF NOT EXISTS saved_screens (
  id         INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  query      TEXT NOT NULL,
  created_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  updated_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_saved_screens_user ON saved_screens(user_id);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id                 TEXT PRIMARY KEY,
  screener_columns        TEXT,
  screener_query          TEXT,
  screener_columns_open   INTEGER DEFAULT 0,
  updated_at              TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Alerts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alerts (
  id                INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id           TEXT NOT NULL,
  type              TEXT NOT NULL,          -- 'price' | 'pct' | 'fundamental' | 'screen'
  ticker            TEXT,
  metric            TEXT,
  operator          TEXT NOT NULL,          -- 'above' | 'below'
  threshold         DOUBLE PRECISION,
  screen_id         INTEGER,
  label             TEXT,
  status            TEXT NOT NULL DEFAULT 'active',
  last_value        DOUBLE PRECISION,
  last_meta         TEXT,
  last_triggered_at TEXT,
  created_at        TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_alerts_user   ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(status);

CREATE TABLE IF NOT EXISTS alert_events (
  id         INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  alert_id   INTEGER NOT NULL,
  user_id    TEXT NOT NULL,
  ticker     TEXT,
  message    TEXT,
  value      DOUBLE PRECISION,
  emailed    INTEGER DEFAULT 0,
  created_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_alert_events_user ON alert_events(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Blog + pro users  (env.DB on Cloudflare)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id         INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  slug       TEXT UNIQUE NOT NULL,
  title      TEXT NOT NULL,
  excerpt    TEXT,
  content    TEXT,
  author     TEXT,
  tags       TEXT,
  cover      TEXT,
  status     TEXT DEFAULT 'published',
  created_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  updated_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug   ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

CREATE TABLE IF NOT EXISTS pro_users (
  email      TEXT PRIMARY KEY,
  status     TEXT,
  created_at TEXT DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
);
