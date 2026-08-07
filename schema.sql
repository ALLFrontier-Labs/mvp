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
  config            JSONB           NOT NULL DEFAULT '{}',
  is_active         BOOLEAN         NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed all 10 V1 providers
INSERT INTO providers (id, name, endpoint, adapter_type, response_type, api_key_encrypted)
VALUES
  ('firecrawl',   'Firecrawl',      'scrape',  'firecrawl',   'sync',  'PLACEHOLDER'),
  ('jina',        'Jina AI Reader', 'scrape',  'jina',        'sync',  'PLACEHOLDER'),
  ('apify',       'Apify Actors',   'scrape',  'apify',       'async', 'PLACEHOLDER'),
  ('spider',      'Spider Cloud',   'scrape',  'spider',      'sync',  'PLACEHOLDER'),
  ('tavily',      'Tavily Search',  'search',  'tavily',      'sync',  'PLACEHOLDER'),
  ('exa',         'Exa AI',         'search',  'exa',         'sync',  'PLACEHOLDER'),
  ('serper',      'Serper.dev',     'search',  'serper',      'sync',  'PLACEHOLDER'),
  ('browserbase', 'Browserbase',    'browser', 'browserbase', 'sync',  'PLACEHOLDER'),
  ('steel',       'Steel Browser',  'browser', 'steel',       'sync',  'PLACEHOLDER'),
  ('e2b',         'E2B Sandbox',    'execute', 'e2b',         'sync',  'PLACEHOLDER');



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
  COUNT(*) AS total_calls
FROM jobs
GROUP BY user_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification query — run this after to confirm everything was created
-- ─────────────────────────────────────────────────────────────────────────────
SELECT id, name,
       CASE WHEN api_key_encrypted = 'PLACEHOLDER' THEN '⚠ PLACEHOLDER' ELSE '✓ OK' END AS key_status
FROM providers
ORDER BY endpoint, id;
