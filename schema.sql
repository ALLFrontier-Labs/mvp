-- ═══════════════════════════════════════════════════════════════════════════
-- LiteDaemon V1 — Complete Database Schema
-- Run this ENTIRE block in:
--   Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- users: every developer who signs up
-- NUMERIC(18,8) gives 8 decimal places — financial-grade precision for micro-billing
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  email                    TEXT            NOT NULL UNIQUE,
  password_hash            TEXT,
  first_name               TEXT,
  last_name                TEXT,
  balance_usd              NUMERIC(18, 8)  NOT NULL DEFAULT 0,
  credit_balance           NUMERIC(18, 8)  NOT NULL DEFAULT 0,
  monthly_call_count       INTEGER         NOT NULL DEFAULT 0,
  billing_period_start     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  stripe_customer_id       TEXT,
  stripe_payment_method_id TEXT,
  plan                     TEXT            NOT NULL DEFAULT 'free',
  is_active                BOOLEAN         NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- api_keys: separate table allows multiple keys per user + key rotation
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE api_keys (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash     TEXT        NOT NULL UNIQUE,  -- SHA-256(SALT + raw_key)
  name         TEXT        NOT NULL DEFAULT 'Default',
  last_used_at TIMESTAMPTZ,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_keys_hash   ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user   ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- providers: the 10 V1 adapters with encrypted master API keys
-- cost_per_call_usd = exact wholesale price = what developer wallet is debited
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE providers (
  id                TEXT            PRIMARY KEY,
  name              TEXT            NOT NULL,
  endpoint          TEXT            NOT NULL,
  adapter_type      TEXT            NOT NULL,
  response_type     TEXT            NOT NULL DEFAULT 'sync',
  api_key_encrypted TEXT            NOT NULL,
  cost_per_call_usd NUMERIC(18, 8)  NOT NULL,
  config            JSONB           NOT NULL DEFAULT '{}',
  is_active         BOOLEAN         NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed all 10 V1 providers
INSERT INTO providers (id, name, endpoint, adapter_type, response_type, cost_per_call_usd, api_key_encrypted)
VALUES
  ('firecrawl',   'Firecrawl',      'scrape',  'firecrawl',   'sync',  0.00300000, 'PLACEHOLDER'),
  ('jina',        'Jina AI Reader', 'scrape',  'jina',        'sync',  0.00100000, 'PLACEHOLDER'),
  ('apify',       'Apify Actors',   'scrape',  'apify',       'async', 0.00500000, 'PLACEHOLDER'),
  ('spider',      'Spider Cloud',   'scrape',  'spider',      'sync',  0.00200000, 'PLACEHOLDER'),
  ('tavily',      'Tavily Search',  'search',  'tavily',      'sync',  0.00100000, 'PLACEHOLDER'),
  ('exa',         'Exa AI',         'search',  'exa',         'sync',  0.00200000, 'PLACEHOLDER'),
  ('serper',      'Serper.dev',     'search',  'serper',      'sync',  0.00100000, 'PLACEHOLDER'),
  ('browserbase', 'Browserbase',    'browser', 'browserbase', 'sync',  0.01500000, 'PLACEHOLDER'),
  ('steel',       'Steel Browser',  'browser', 'steel',       'sync',  0.01500000, 'PLACEHOLDER'),
  ('e2b',         'E2B Sandbox',    'execute', 'e2b',         'sync',  0.00800000, 'PLACEHOLDER');

-- ─────────────────────────────────────────────────────────────────────────────
-- ledger_entries: immutable audit log — every credit and debit
-- Never update or delete rows. Append only.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE ledger_entries (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES users(id),
  type              TEXT            NOT NULL,
  direction         TEXT            NOT NULL,
  amount_usd        NUMERIC(18, 8)  NOT NULL,
  raw_provider_cost NUMERIC(18, 8),
  markup_amount     NUMERIC(18, 8),
  total_deducted    NUMERIC(18, 8),
  provider_id       TEXT            REFERENCES providers(id),
  job_id            UUID,
  description       TEXT            NOT NULL,
  balance_after     NUMERIC(18, 8)  NOT NULL,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_user    ON ledger_entries(user_id);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);
CREATE INDEX idx_ledger_job     ON ledger_entries(job_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- jobs: every call made through the gateway
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE jobs (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL REFERENCES users(id),
  provider_id     TEXT            NOT NULL REFERENCES providers(id),
  endpoint        TEXT            NOT NULL,
  provider_job_id TEXT,
  params          JSONB           NOT NULL DEFAULT '{}',
  status          TEXT            NOT NULL DEFAULT 'pending',
  result          JSONB,
  cost_usd        NUMERIC(18, 8)  NOT NULL,
  is_byok         BOOLEAN         NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_jobs_user    ON jobs(user_id);
CREATE INDEX idx_jobs_status  ON jobs(status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- user_provider_keys: BYOK — encrypted provider API keys per user
-- Supports multi-key prioritization and fallback chains
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE user_provider_keys (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id       TEXT            NOT NULL REFERENCES providers(id),
  api_key_encrypted TEXT            NOT NULL,
  key_type          TEXT            NOT NULL DEFAULT 'prioritized',  -- 'prioritized' or 'fallback'
  priority_order    INTEGER         NOT NULL DEFAULT 0,
  label             TEXT,
  is_active         BOOLEAN         NOT NULL DEFAULT true,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_key_type CHECK (key_type IN ('prioritized', 'fallback'))
);
CREATE INDEX idx_upk_user_provider ON user_provider_keys(user_id, provider_id);
CREATE INDEX idx_upk_active        ON user_provider_keys(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- view: used by GET /v1/usage
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW user_usage AS
SELECT
  user_id,
  COUNT(*)                                                 AS total_calls,
  COUNT(*) FILTER (WHERE type = 'debit')                   AS billed_calls,
  COALESCE(SUM(amount_usd) FILTER (WHERE type = 'debit'), 0) AS total_spent_usd
FROM ledger_entries
GROUP BY user_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification query — run this after to confirm everything was created
-- ─────────────────────────────────────────────────────────────────────────────
SELECT id, name, cost_per_call_usd,
       CASE WHEN api_key_encrypted = 'PLACEHOLDER' THEN '⚠ PLACEHOLDER' ELSE '✓ OK' END AS key_status
FROM providers
ORDER BY endpoint, id;
