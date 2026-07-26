# LITEDAEMON
## V1 Technical Build Blueprint

> **LiteDaemon is OpenRouter for AI Agents and Tools.** One API key, one prepaid wallet, four clean endpoints. Providers own 100% of the compute. LiteDaemon owns the credential layer and the ledger — and takes zero margin on every call.

**Stack:** Node.js 20 · TypeScript · Fastify · Supabase (Postgres) · Upstash Redis · LemonSqueezy · React · Railway

---

## Table of Contents

| # | Section |
|---|---------|
| 01 | What We Are Building |
| 02 | System Architecture |
| 03 | Provider Catalog — 10 V1 Adapters |
| 04 | Tech Stack |
| 05 | Repository Structure |
| 06 | Environment Variables |
| 07 | Database Schema — Complete SQL |
| 08 | Redis Key Schema |
| 09 | API Specification — All Endpoints |
| 10 | TypeScript Type Definitions |
| 11 | All 10 Provider Adapters — Complete Code |
| 12 | Authentication Service |
| 13 | Encryption Service |
| 14 | Ledger Service — SELECT FOR UPDATE |
| 15 | Billing Service — Zero-Margin LemonSqueezy |
| 16 | Rate Limiting |
| 17 | All Route Handlers — Complete Code |
| 18 | Server Entry Point |
| 19 | Frontend — Developer Dashboard |
| 20 | Build Order — 3 Weeks |
| 21 | Deployment — One Railway Service |
| 22 | Post-Launch Provider Backlog |

---

## 01. WHAT WE ARE BUILDING

LiteDaemon is a stateless financial and credential proxy gateway. It is the infrastructure layer between a developer and any AI tool API — not a compute platform.

**What LiteDaemon owns:**
- API key issuance and validation
- Encrypted provider credential storage and rotation
- A unified prepaid wallet (LemonSqueezy deposits → ledger debits)
- HTTP request normalization into four clean unified schemas
- Provider credential management for cloud browser sessions

**What LiteDaemon does not own:**
- Compute, sandboxes, Docker containers
- Job queues or background workers
- Execution state beyond a job reference

### Four Unified Endpoints

Every provider in the catalog maps to one of four endpoints. Developers learn one schema per capability — never a provider-specific format.

| Endpoint | Providers | Normalised Output |
|----------|-----------|-------------------|
| `POST /v1/scrape` | Firecrawl, Jina, Apify, Spider | `{ content: string (markdown), metadata: {} }` |
| `POST /v1/search` | Tavily, Exa, Serper | `[{ title, url, snippet, score? }]` |
| `POST /v1/browser` | Browserbase, Steel | `{ session_id, connect_url, debug_url? }` |
| `POST /v1/execute` | E2B | `{ stdout, stderr, exit_code }` |

### Financial Model — Pre-Revenue, Zero Margin

LiteDaemon is strictly pre-revenue. Every dollar a developer is charged maps directly to a real cost LiteDaemon incurs — either the upstream provider's wholesale price, or LemonSqueezy's own payment processing fee. LiteDaemon inserts no platform fee anywhere in the flow.

**Deposits.** A developer buys a fixed credit package ($10 / $25 / $50 / $100). The checkout price is calibrated so that after LemonSqueezy's processing fee (5% + $0.50), LiteDaemon's net proceeds equal exactly the advertised credit amount. That round number is what lands in the wallet — nothing is skimmed on top.

```
  Credits    Price charged at checkout    LemonSqueezy fee    Wallet credited
  $10.00     $11.05                       $1.05                $10.00
  $25.00     $26.84                       $1.84                $25.00
  $50.00     $53.16                       $3.16                $50.00
  $100.00    $105.79                      $5.79                $100.00

  Formula: checkout_price = (credit_amount + 0.50) / 0.95
```

**Usage.** Every API call debits the wallet by the exact wholesale cost LiteDaemon pays the upstream provider. No markup, no percentage fee, no platform tax. A Jina scrape costs the developer exactly $0.001 — the same $0.001 LiteDaemon pays Jina.

```
CHARGE POLICY:
  Charge when:   the provider API was called and returned any response (success or error)
  Do not charge: the provider was never reached (invalid provider credential found before
                  the call, our own auth failure, network error prior to the request)
  No refunds:    a provider-side failure after the call was accepted still consumed
                  upstream capacity — the charge stands
```

This is a deliberate adoption strategy: remove all platform-tax friction, let LiteDaemon's own runway absorb nothing beyond what it already pays providers, and defer monetization until usage volume justifies a pricing decision.

---

## 02. SYSTEM ARCHITECTURE

One Railway service. One Fastify process. No workers. No queues. Stateless per request.

```
Developer → POST /v1/scrape
     │
     ▼
┌─────────────────────────────────────────────┐
│              FASTIFY GATEWAY                │
│                                             │
│  authHook → rateLimit → debitLedger         │
│       │                                     │
│       ▼                                     │
│  getProvider(slug) → decrypt(api_key)       │
│       │                                     │
│       ▼                                     │
│  adapter.run(params, decryptedKey)          │
│       │                                     │
│       ▼                                     │
│  normalizeResponse() → return unified JSON  │
│                                             │
└─────────────────────────────────────────────┘
     │
     ▼
Upstream Provider API
(Firecrawl / Jina / Tavily / Browserbase / E2B / etc.)
```

### Data Flow — Sync Provider (e.g. Firecrawl)

```
1. POST /v1/scrape { provider: "firecrawl", params: { url: "..." } }
2. authHook: hash key → Redis cache hit → attach user to request
3. rateLimit: Redis INCR → 429 if exceeded
4. debitLedger: SELECT FOR UPDATE → check balance → deduct exact provider cost → INSERT ledger_entry
5. getProvider("firecrawl") → decrypt api_key_encrypted → apiKey
6. firecrawlAdapter.run(params, apiKey) → POST to api.firecrawl.dev → await response
7. normalizeToMarkdown(raw) → { content, metadata }
8. UPDATE job record (completed) → return HTTP 200
```

### Data Flow — Async Provider (e.g. Apify)

```
1. POST /v1/scrape { provider: "apify", params: { actor_id: "...", run_input: {} } }
2–4. Same as above
5. apifyAdapter.run(params, apiKey) → POST to api.apify.com → returns { run_id } in 300ms
6. UPDATE job (running, provider_job_id = run_id) → return HTTP 202 { job_id, status: "running" }
7. Developer polls: GET /v1/jobs/:id
8. apifyAdapter.status(run_id, apiKey) → GET from api.apify.com → proxy current status back
9. On completed: normalizeToMarkdown(raw) → UPDATE job → return result
```

### Data Flow — Browser Provider (Browserbase / Steel)

```
1. POST /v1/browser { provider: "browserbase", params: { project_id: "..." } }
2–4. Same as above
5. browserbaseAdapter.run(params, apiKey) → create session → return { session_id, connect_url }
6. return HTTP 200 { session_id, connect_url, debug_url }

   No automatic teardown call is made here. The developer needs the session to
   still be alive when they open connect_url after parsing the response — an
   immediate server-side DELETE would frequently race the developer's own
   connection attempt. The session instead expires on its own: Steel accepts an
   explicit params.timeout_ms on creation, and Browserbase sessions end via the
   provider's own default or project-configured session timeout.
```

---

## 03. PROVIDER CATALOG — 10 V1 ADAPTERS

| Provider ID | Name | Endpoint | Response Type | Cost Per Call (zero markup) | Get API Key |
|-------------|------|----------|---------------|------------------------------|-------------|
| `firecrawl` | Firecrawl | `/v1/scrape` | sync | $0.003 | firecrawl.dev → Dashboard |
| `jina` | Jina AI Reader | `/v1/scrape` | sync | $0.001 | jina.ai → Sign up (1M free) |
| `apify` | Apify Actors | `/v1/scrape` | **async** | $0.010 | apify.com → Settings → API |
| `spider` | Spider Cloud | `/v1/scrape` | sync | $0.002 | spider.cloud → Dashboard |
| `tavily` | Tavily Search | `/v1/search` | sync | $0.001 | tavily.com → Dashboard (1k free) |
| `exa` | Exa AI | `/v1/search` | sync | $0.002 | exa.ai → Dashboard (1k free) |
| `serper` | Serper.dev | `/v1/search` | sync | $0.001 | serper.dev → Dashboard (2.5k free) |
| `browserbase` | Browserbase | `/v1/browser` | sync | $0.015 | browserbase.com → Settings |
| `steel` | Steel Browser | `/v1/browser` | sync | $0.015 | steel.dev → Dashboard |
| `e2b` | E2B Sandbox | `/v1/execute` | sync | $0.003 | e2b.dev → Dashboard |

> ⚠️ These are exact wholesale prices. LiteDaemon charges developers precisely these amounts — the same amounts it pays each provider. Get free tier keys for Jina, Tavily, and Serper before writing any code; these three are synchronous, free, and fastest to verify end-to-end.

---

## 04. TECH STACK

| Category | Package | Install |
|----------|---------|---------|
| Runtime | Node.js 20 LTS | `nvm install 20` |
| Language | TypeScript 5.x | `npm i -D typescript ts-node @types/node` |
| Server | Fastify 4.x | `npm i fastify @fastify/cors @fastify/raw-body` |
| Postgres | pg 8.x — raw SQL, no ORM | `npm i pg @types/pg` |
| Redis | ioredis 5.x | `npm i ioredis` |
| HTTP | axios 1.x | `npm i axios` |
| Crypto | Node.js built-in | — no install — |
| Billing | LemonSqueezy (webhook verification only) | `npm i @lemonsqueezy/lemonsqueezy.js` |
| Errors | Sentry 7.x | `npm i @sentry/node` |
| Frontend | React 18 + Vite 5 + Tailwind 3 | `npm create vite@latest` |
| Hosting | Railway.app — 1 service | railway.app |
| Database | Supabase Postgres 15 | supabase.com |
| Cache | Upstash Redis (managed) | upstash.com |
| Docs | Mintlify | mintlify.com |

---

## 05. REPOSITORY STRUCTURE

```
litedaemon/
+-- apps/
|   +-- api/                         <- Single Fastify server
|   |   +-- src/
|   |   |   +-- index.ts             <- Entry: register routes, start server
|   |   |   +-- routes/
|   |   |   |   +-- auth.ts          <- POST /v1/auth/signup
|   |   |   |   +-- scrape.ts        <- POST /v1/scrape
|   |   |   |   +-- search.ts        <- POST /v1/search
|   |   |   |   +-- browser.ts       <- POST /v1/browser
|   |   |   |   +-- execute.ts       <- POST /v1/execute
|   |   |   |   +-- jobs.ts          <- GET  /v1/jobs/:id
|   |   |   |   +-- usage.ts         <- GET  /v1/usage
|   |   |   |   +-- billing.ts       <- GET  /v1/billing/checkout
|   |   |   |   |                       POST /v1/webhooks/lemonsqueezy
|   |   |   +-- adapters/
|   |   |   |   +-- types.ts         <- ProviderAdapter interface + unified response types
|   |   |   |   +-- index.ts         <- getAdapter(slug) registry
|   |   |   |   +-- firecrawl.ts     <- scrape sync
|   |   |   |   +-- jina.ts          <- scrape sync
|   |   |   |   +-- apify.ts         <- scrape async (run + status)
|   |   |   |   +-- spider.ts        <- scrape sync
|   |   |   |   +-- tavily.ts        <- search sync
|   |   |   |   +-- exa.ts           <- search sync
|   |   |   |   +-- serper.ts        <- search sync
|   |   |   |   +-- browserbase.ts   <- browser sync
|   |   |   |   +-- steel.ts         <- browser sync
|   |   |   |   +-- e2b.ts           <- execute sync
|   |   |   +-- services/
|   |   |   |   +-- auth.ts          <- generateApiKey, validateApiKey, authHook
|   |   |   |   +-- encryption.ts    <- AES-256-GCM encrypt/decrypt
|   |   |   |   +-- ledger.ts        <- SELECT FOR UPDATE debit/credit
|   |   |   |   +-- billing.ts       <- LemonSqueezy checkout + webhook
|   |   |   |   +-- rateLimit.ts     <- Redis sliding window
|   |   |   |   +-- reconciliation.ts <- Hourly cleanup of orphaned async jobs
|   |   |   +-- db/
|   |   |   |   +-- client.ts        <- pg Pool singleton
|   |   |   +-- redis/
|   |   |   |   +-- client.ts        <- ioredis singleton
|   |   |   +-- types.ts             <- Global TypeScript interfaces
|   |   +-- .env
|   |   +-- tsconfig.json
|   |   +-- package.json
|   |
|   +-- dashboard/                   <- React + Vite + Tailwind
|       +-- src/
|       |   +-- main.tsx
|       |   +-- pages/
|       |   |   +-- Login.tsx
|       |   |   +-- Dashboard.tsx
|       |   |   +-- Jobs.tsx
|       |   |   +-- Providers.tsx
|       |   |   +-- Billing.tsx
|       |   |   +-- Settings.tsx
|       |   +-- lib/api.ts
|       +-- vite.config.ts
|       +-- tailwind.config.ts
|       +-- package.json
+-- README.md
```

---

## 06. ENVIRONMENT VARIABLES — apps/api/.env

> ⚠️ Never commit `.env` to Git. Add to `.gitignore` immediately.

| Variable | Format | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | `postgresql://postgres:[pw]@db.[ref].supabase.co:6543/postgres` | Supabase Transaction pooler — port 6543 in production |
| `REDIS_URL` | `rediss://default:[token]@[host].upstash.io:6379` | Upstash TLS URL |
| `API_KEY_SALT` | 64-char hex | Salt prepended before SHA-256 hash of user API keys |
| `PROVIDER_ENCRYPTION_KEY` | 32-char hex | AES-256-GCM key for provider credentials in DB |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | from LS dashboard | Verifies inbound LemonSqueezy payment events |
| `LS_VARIANT_10` | variant-uuid | LemonSqueezy variant for the $10 credit tier |
| `LS_VARIANT_25` | variant-uuid | LemonSqueezy variant for the $25 credit tier |
| `LS_VARIANT_50` | variant-uuid | LemonSqueezy variant for the $50 credit tier |
| `LS_VARIANT_100` | variant-uuid | LemonSqueezy variant for the $100 credit tier |
| `PORT` | `3000` | Fastify listen port |
| `NODE_ENV` | `production` | production or development |
| `SENTRY_DSN` | `https://[key]@sentry.io/[id]` | Error tracking |

```bash
# Generate all secrets in one command:
node -e "
const c = require('crypto');
console.log('API_KEY_SALT=' + c.randomBytes(32).toString('hex'));
console.log('PROVIDER_ENCRYPTION_KEY=' + c.randomBytes(32).toString('hex'));
"
```

```
# LemonSqueezy setup:
# 1. lemonsqueezy.com → Create Store
# 2. Create 4 products priced with the formula from Section 01:
#      $10 credits  → price the variant at $11.05
#      $25 credits  → price the variant at $26.84
#      $50 credits  → price the variant at $53.16
#      $100 credits → price the variant at $105.79
# 3. Each product → Variants tab → copy UUID → paste as LS_VARIANT_10 etc.
# 4. Settings → Webhooks → Add endpoint → event: order_created → copy secret
```

---

## 07. DATABASE SCHEMA — COMPLETE SQL

Run in Supabase Dashboard → SQL Editor → New Query. Execute each block in order.

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- users: every developer who signs up
-- NUMERIC(18,8) gives 8 decimal places — financial-grade precision for micro-billing
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT            NOT NULL UNIQUE,
  balance_usd NUMERIC(18, 8)  NOT NULL DEFAULT 0,
  plan        TEXT            NOT NULL DEFAULT 'free',
  is_active   BOOLEAN         NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
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
CREATE INDEX idx_api_keys_hash    ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user    ON api_keys(user_id);
CREATE INDEX idx_api_keys_active  ON api_keys(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- providers: the 10 V1 adapters with encrypted master API keys
-- LiteDaemon holds one master key per provider, not per user
-- cost_per_call_usd is the ONLY price field — it is both what LiteDaemon pays
-- the provider and what the developer's wallet is debited. Zero markup.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE providers (
  id                TEXT            PRIMARY KEY,  -- slug: 'firecrawl', 'jina', etc.
  name              TEXT            NOT NULL,
  endpoint          TEXT            NOT NULL,     -- 'scrape' | 'search' | 'browser' | 'execute'
  adapter_type      TEXT            NOT NULL,     -- matches adapter filename
  response_type     TEXT            NOT NULL DEFAULT 'sync',  -- 'sync' | 'async'
  api_key_encrypted TEXT            NOT NULL,     -- AES-256-GCM encrypted
  cost_per_call_usd NUMERIC(18, 8)  NOT NULL,     -- wholesale cost = developer charge
  is_active         BOOLEAN         NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed all 10 V1 providers (api_key_encrypted populated separately — see Section 13)
INSERT INTO providers (id, name, endpoint, adapter_type, response_type, cost_per_call_usd, api_key_encrypted)
VALUES
  ('firecrawl',   'Firecrawl',      'scrape',  'firecrawl',   'sync',  0.00300000, 'PLACEHOLDER'),
  ('jina',        'Jina AI Reader', 'scrape',  'jina',        'sync',  0.00100000, 'PLACEHOLDER'),
  ('apify',       'Apify Actors',   'scrape',  'apify',       'async', 0.01000000, 'PLACEHOLDER'),
  ('spider',      'Spider Cloud',   'scrape',  'spider',      'sync',  0.00200000, 'PLACEHOLDER'),
  ('tavily',      'Tavily Search',  'search',  'tavily',      'sync',  0.00100000, 'PLACEHOLDER'),
  ('exa',         'Exa AI',         'search',  'exa',         'sync',  0.00200000, 'PLACEHOLDER'),
  ('serper',      'Serper.dev',     'search',  'serper',      'sync',  0.00100000, 'PLACEHOLDER'),
  ('browserbase', 'Browserbase',    'browser', 'browserbase', 'sync',  0.01500000, 'PLACEHOLDER'),
  ('steel',       'Steel Browser',  'browser', 'steel',       'sync',  0.01500000, 'PLACEHOLDER'),
  ('e2b',         'E2B Sandbox',    'execute', 'e2b',         'sync',  0.00300000, 'PLACEHOLDER');

-- ─────────────────────────────────────────────────────────────────────────────
-- ledger_entries: immutable audit log — every credit and debit
-- Never update or delete rows. Append only.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE ledger_entries (
  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID            NOT NULL REFERENCES users(id),
  type          TEXT            NOT NULL,     -- 'deposit' | 'debit'
  direction     TEXT            NOT NULL,     -- 'credit' | 'debit'
  amount_usd    NUMERIC(18, 8)  NOT NULL,     -- always positive
  provider_id   TEXT            REFERENCES providers(id),
  job_id        UUID,
  description   TEXT            NOT NULL,
  balance_after NUMERIC(18, 8)  NOT NULL,     -- wallet snapshot after this entry
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_user    ON ledger_entries(user_id);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);
CREATE INDEX idx_ledger_job     ON ledger_entries(job_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- jobs: every call made through the gateway — sync results and async trackers alike
-- provider_job_id is only populated for async providers (Apify). NULL for sync.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE jobs (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL REFERENCES users(id),
  provider_id     TEXT            NOT NULL REFERENCES providers(id),
  endpoint        TEXT            NOT NULL,   -- which unified endpoint was called
  provider_job_id TEXT,                       -- e.g. Apify run_id — NULL for sync providers
  params          JSONB           NOT NULL DEFAULT '{}',
  status          TEXT            NOT NULL DEFAULT 'pending',  -- pending | running | completed | failed
  result          JSONB,
  cost_usd        NUMERIC(18, 8)  NOT NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_jobs_user    ON jobs(user_id);
CREATE INDEX idx_jobs_status  ON jobs(status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- view: used by GET /v1/usage
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW user_usage AS
SELECT
  user_id,
  COUNT(*)                                              AS total_calls,
  COUNT(*) FILTER (WHERE type = 'debit')                AS billed_calls,
  COALESCE(SUM(amount_usd) FILTER (WHERE type='debit'), 0) AS total_spent_usd
FROM ledger_entries
GROUP BY user_id;
```

---

## 08. REDIS KEY SCHEMA

| Key | Value | TTL | Purpose |
|-----|-------|-----|---------|
| `auth:{key_hash}` | JSON: `{id, email, balance_usd, plan}` | 300s | API key validation cache. Bust after any balance change. |
| `rate:{user_id}:{window}` | Integer count | 60s | Sliding window per developer per minute. INCR + expire on first hit. |

> ℹ️ Only two key types. No job state in Redis. Postgres owns all persistent state. Async status polling proxies directly to the upstream provider API.

---

## 09. API SPECIFICATION

### 9.1 POST /v1/scrape

```
Authorization: Bearer ld_...api_key
Content-Type: application/json

REQUEST:
{
  "provider": "firecrawl",            // REQUIRED: provider id (firecrawl|jina|apify|spider)
  "params": {
    "url": "https://example.com",     // REQUIRED for all scrape providers
    "formats": ["markdown"],          // OPTIONAL: firecrawl-specific
    "actor_id": "apify/web-scraper",  // REQUIRED for apify
    "run_input": {}                   // REQUIRED for apify
  }
}

RESPONSE — sync provider:
HTTP 200
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "firecrawl",
  "result": {
    "content": "# Page Title\n\nMarkdown content...",
    "metadata": {
      "title": "Page Title",
      "url": "https://example.com",
      "word_count": 1247
    }
  },
  "cost_usd": 0.003,
  "duration_ms": 2840
}

RESPONSE — async provider (Apify):
HTTP 202
{
  "job_id": "uuid",
  "status": "running",
  "provider": "apify",
  "provider_job_id": "HG7ML...",
  "cost_usd": 0.010
}

ERRORS:
401  { "error": "invalid_api_key" }
402  { "error": "insufficient_balance", "balance_usd": 0.00, "required_usd": 0.003 }
404  { "error": "provider_not_found" }
422  { "error": "validation_error", "fields": ["provider is required"] }
429  { "error": "rate_limit_exceeded", "retry_after": 47 }
502  { "error": "provider_error", "message": "upstream provider returned 500" }
```

### 9.2 POST /v1/search

```
REQUEST:
{
  "provider": "tavily",               // REQUIRED: tavily | exa | serper
  "params": {
    "query": "AI agents 2026",        // REQUIRED
    "max_results": 5,                 // OPTIONAL
    "search_depth": "basic"           // OPTIONAL: tavily-specific (basic|advanced)
  }
}

RESPONSE HTTP 200:
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "tavily",
  "result": {
    "results": [
      { "title": "...", "url": "...", "snippet": "...", "score": 0.95 }
    ],
    "answer": "AI-generated summary if available"
  },
  "cost_usd": 0.001
}
```

### 9.3 POST /v1/browser

```
REQUEST:
{
  "provider": "browserbase",          // REQUIRED: browserbase | steel
  "params": {
    "project_id": "your-bb-project",  // REQUIRED for browserbase
    "proxy": false,                   // OPTIONAL: steel-specific
    "solve_captcha": true             // OPTIONAL: steel-specific
  }
}

RESPONSE HTTP 200:
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "browserbase",
  "result": {
    "session_id": "sess_abc123",
    "connect_url": "wss://connect.browserbase.com/...",
    "debug_url": "https://www.browserbase.com/sessions/..."
  },
  "cost_usd": 0.015
}

NOTE: LiteDaemon does not terminate this session automatically. It remains
active until the provider's own session timeout elapses — explicitly
configurable for Steel via params.timeout_ms, and governed by Browserbase's
own default or project-configured timeout otherwise. The developer is free to
end it early by calling the provider's own session-delete API directly with
the session_id returned here.
```

### 9.4 POST /v1/execute

```
REQUEST:
{
  "provider": "e2b",                  // REQUIRED: e2b (only V1 provider)
  "params": {
    "language": "python",             // REQUIRED
    "code": "print('hello world')",   // REQUIRED
    "timeout_ms": 30000               // OPTIONAL
  }
}

RESPONSE HTTP 200:
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "e2b",
  "result": {
    "stdout": "hello world\n",
    "stderr": "",
    "exit_code": 0
  },
  "cost_usd": 0.003
}
```

### 9.5 GET /v1/jobs/:id — Retrieve job status and result

```
Authorization: Bearer {api_key}

RESPONSE — still running:
{ "job_id": "uuid", "status": "running", "provider": "apify" }

RESPONSE — completed:
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "apify",
  "result": { "content": "...", "metadata": {} },
  "cost_usd": 0.010
}

RESPONSE — failed:
{
  "job_id": "uuid",
  "status": "failed",
  "provider": "apify",
  "error": "Apify run FAILED",
  "cost_usd": 0.010
}

NOTE: Failed async jobs are NOT refunded. The upstream provider consumed resources.
```

### 9.6 GET /v1/usage

```
{ "total_calls": 412, "billed_calls": 409, "total_spent_usd": 1.2637,
  "balance_usd": 18.7363 }
```

### 9.7 GET /v1/billing/checkout?amount=10

```
{ "checkout_url": "https://litedaemon.lemonsqueezy.com/checkout/buy/...?checkout[custom][user_id]=...&checkout[custom][credit_amount]=10" }
Valid amounts: 10 | 25 | 50 | 100
```

### 9.8 POST /v1/webhooks/lemonsqueezy (internal — called by LemonSqueezy)

```
X-Signature: {hmac_hex}
{
  "meta": {
    "event_name": "order_created",
    "custom_data": { "user_id": "uuid", "credit_amount": "10" }
  },
  "data": { "attributes": { "status": "paid" } }
}
→ Credits the user's wallet with exactly $10.00 — the flat tier amount embedded
  at checkout time, not a value derived from LemonSqueezy's fee math.
  Returns { "received": true }
```

---

## 10. TYPESCRIPT TYPE DEFINITIONS

```typescript
// src/types.ts

// ── Unified response schemas ──────────────────────────────────────────────────

export interface ScrapeResult {
  content:  string;
  metadata: {
    title?:        string;
    url?:          string;
    word_count?:   number;
    source_format?: string;
  };
}

export interface SearchResult {
  results: Array<{
    title:    string;
    url:      string;
    snippet:  string;
    score?:   number;
  }>;
  answer?: string;
}

export interface BrowserResult {
  session_id:  string;
  connect_url: string;
  debug_url?:  string;
}

export interface ExecuteResult {
  stdout:    string;
  stderr:    string;
  exit_code: number;
}

export type UnifiedResult = ScrapeResult | SearchResult | BrowserResult | ExecuteResult;

// ── Adapter return types ──────────────────────────────────────────────────────

export interface SyncRunResult  { type: 'sync';  result: UnifiedResult }
export interface AsyncRunResult { type: 'async'; provider_job_id: string }
export type RunResult = SyncRunResult | AsyncRunResult;

export interface StatusResult {
  status:   'running' | 'completed' | 'failed';
  result?:  UnifiedResult;
  error?:   string;
}

// ── Adapter interface ─────────────────────────────────────────────────────────

export interface ProviderAdapter {
  run(params: Record<string, any>, apiKey: string): Promise<RunResult>;
  status?(provider_job_id: string, apiKey: string): Promise<StatusResult>;
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface LDUser {
  id:          string;
  email:       string;
  balance_usd: string;  // string because pg returns NUMERIC as string
  plan:        string;
}

export interface LDProvider {
  id:                string;
  name:              string;
  endpoint:          string;
  adapter_type:      string;
  response_type:     'sync' | 'async';
  api_key_encrypted: string;
  cost_per_call_usd: string;
}

// ── Fastify request augmentation ──────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyRequest {
    user: LDUser;
  }
}
```

---

## 11. ALL 10 PROVIDER ADAPTERS — COMPLETE CODE

### adapters/index.ts — Interface and Registry

```typescript
import type { ProviderAdapter } from '../types';
import { firecrawlAdapter }   from './firecrawl';
import { jinaAdapter }        from './jina';
import { apifyAdapter }       from './apify';
import { spiderAdapter }      from './spider';
import { tavilyAdapter }      from './tavily';
import { exaAdapter }         from './exa';
import { serperAdapter }      from './serper';
import { browserbaseAdapter } from './browserbase';
import { steelAdapter }       from './steel';
import { e2bAdapter }         from './e2b';

const REGISTRY: Record<string, ProviderAdapter> = {
  firecrawl:   firecrawlAdapter,
  jina:        jinaAdapter,
  apify:       apifyAdapter,
  spider:      spiderAdapter,
  tavily:      tavilyAdapter,
  exa:         exaAdapter,
  serper:      serperAdapter,
  browserbase: browserbaseAdapter,
  steel:       steelAdapter,
  e2b:         e2bAdapter,
};

export function getAdapter(slug: string): ProviderAdapter {
  const a = REGISTRY[slug];
  if (!a) throw new Error(`No adapter registered for provider: ${slug}`);
  return a;
}
```

### adapters/firecrawl.ts — scrape, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const firecrawlAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.url) throw new Error('firecrawl requires params.url');
    const r = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url:             params.url,
        formats:         params.formats || ['markdown'],
        onlyMainContent: params.onlyMainContent ?? true,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
    );
    if (!r.data.success) throw new Error(r.data.error || 'Firecrawl returned success=false');

    const result: ScrapeResult = {
      content:  r.data.data?.markdown || r.data.data?.html || '',
      metadata: {
        title:      r.data.data?.metadata?.title,
        url:        r.data.data?.metadata?.url || params.url,
        word_count: r.data.data?.markdown?.split(/\s+/).length,
      },
    };
    return { type: 'sync', result };
  },
};
```

### adapters/jina.ts — scrape, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const jinaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.url) throw new Error('jina requires params.url');
    const r = await axios.get(`https://r.jina.ai/${params.url}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'text/plain' },
      timeout: 20000,
    });
    const result: ScrapeResult = {
      content:  r.data as string,
      metadata: { url: params.url, word_count: (r.data as string).split(/\s+/).length },
    };
    return { type: 'sync', result };
  },
};
```

### adapters/apify.ts — scrape, ASYNC (run + status)

```typescript
import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const apifyAdapter: ProviderAdapter = {
  // run() returns Apify run_id immediately in < 300ms
  async run(params, apiKey) {
    if (!params.actor_id) throw new Error('apify requires params.actor_id');
    if (!params.run_input && !params.url)
      throw new Error('apify requires either params.run_input or params.url');
    const r = await axios.post(
      `https://api.apify.com/v2/acts/${encodeURIComponent(params.actor_id)}/runs`,
      params.run_input || { startUrls: [{ url: params.url }] },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
    );
    return { type: 'async', provider_job_id: r.data.data.id };
  },

  // status() called by GET /v1/jobs/:id on each developer poll
  async status(run_id, apiKey) {
    const s = await axios.get(
      `https://api.apify.com/v2/actor-runs/${run_id}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const st = s.data.data.status;
    if (st === 'SUCCEEDED') {
      const items = await axios.get(
        `https://api.apify.com/v2/actor-runs/${run_id}/dataset/items`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      const text = items.data.map((i: any) => i.markdown || i.text || JSON.stringify(i)).join('\n\n');
      const result: ScrapeResult = {
        content:  text,
        metadata: { url: `apify-run:${run_id}`, word_count: text.split(/\s+/).length },
      };
      return { status: 'completed', result };
    }
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(st))
      return { status: 'failed', error: `Apify run ${st} — run_id: ${run_id}` };
    return { status: 'running' };
  },
};
```

### adapters/spider.ts — scrape, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const spiderAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.url) throw new Error('spider requires params.url');
    const r = await axios.post(
      'https://api.spider.cloud/crawl',
      { url: params.url, limit: params.limit || 1, return_format: 'markdown' },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 }
    );
    const page = Array.isArray(r.data) ? r.data[0] : r.data;
    const result: ScrapeResult = {
      content:  page?.content || page?.markdown || '',
      metadata: { url: page?.url || params.url, title: page?.metadata?.title },
    };
    return { type: 'sync', result };
  },
};
```

### adapters/tavily.ts — search, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';

export const tavilyAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.query) throw new Error('tavily requires params.query');
    const r = await axios.post(
      'https://api.tavily.com/search',
      {
        query:        params.query,
        search_depth: params.search_depth || 'basic',
        max_results:  params.max_results || 5,
        include_answer: true,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
    );
    const result: SearchResult = {
      results: (r.data.results || []).map((x: any) => ({
        title:   x.title,
        url:     x.url,
        snippet: x.content || x.snippet || '',
        score:   x.score,
      })),
      answer: r.data.answer || undefined,
    };
    return { type: 'sync', result };
  },
};
```

### adapters/exa.ts — search, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';

export const exaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.query) throw new Error('exa requires params.query');
    const r = await axios.post(
      'https://api.exa.ai/search',
      {
        query:      params.query,
        numResults: params.max_results || 5,
        type:       params.type || 'neural',
        contents:   { text: { maxCharacters: params.max_chars || 1000 } },
      },
      { headers: { 'x-api-key': apiKey }, timeout: 15000 }
    );
    const result: SearchResult = {
      results: (r.data.results || []).map((x: any) => ({
        title:   x.title || '',
        url:     x.url,
        snippet: x.text || '',
        score:   x.score,
      })),
    };
    return { type: 'sync', result };
  },
};
```

### adapters/serper.ts — search, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';

export const serperAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.query) throw new Error('serper requires params.query');
    const r = await axios.post(
      'https://google.serper.dev/search',
      { q: params.query, num: params.max_results || 10 },
      { headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    const result: SearchResult = {
      results: (r.data.organic || []).map((x: any) => ({
        title:   x.title,
        url:     x.link,
        snippet: x.snippet || '',
        score:   x.position ? 1 / x.position : undefined,
      })),
      answer: r.data.answerBox?.answer || r.data.answerBox?.snippet || undefined,
    };
    return { type: 'sync', result };
  },
};
```

### adapters/browserbase.ts — browser, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, BrowserResult } from '../types';

// No automatic session teardown here. The response gives the developer a
// connect_url they still need to open — deleting the session server-side
// immediately after this call returns would frequently race that connection
// attempt. The session ends on its own via Browserbase's own default or
// project-configured session timeout.
export const browserbaseAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.project_id) throw new Error('browserbase requires params.project_id');
    const r = await axios.post(
      'https://www.browserbase.com/v1/sessions',
      {
        projectId:       params.project_id,
        browserSettings: {
          viewport:    { width: 1920, height: 1080 },
          fingerprint: { devices: ['desktop'], locales: ['en-US'] },
        },
      },
      { headers: { 'x-bb-api-key': apiKey }, timeout: 15000 }
    );
    const result: BrowserResult = {
      session_id:  r.data.id,
      connect_url: r.data.connectUrl,
      debug_url:   r.data.debuggerUrl || undefined,
    };
    return { type: 'sync', result };
  },
};
```

### adapters/steel.ts — browser, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, BrowserResult } from '../types';

// No automatic session teardown here — same reasoning as Browserbase.
// Steel already accepts an explicit sessionTimeout on creation, so the
// session expires on its own after params.timeout_ms without LiteDaemon
// needing to delete it.
export const steelAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    const r = await axios.post(
      'https://api.steel.dev/v1/sessions',
      {
        useProxy:       params.proxy ?? false,
        solveCaptcha:   params.solve_captcha ?? true,
        sessionTimeout: params.timeout_ms || 300000,
      },
      { headers: { 'steel-api-key': apiKey }, timeout: 15000 }
    );
    const result: BrowserResult = {
      session_id:  r.data.id,
      connect_url: r.data.cdpUrl || r.data.connectUrl,
      debug_url:   r.data.debugUrl || undefined,
    };
    return { type: 'sync', result };
  },
};
```

### adapters/e2b.ts — execute, sync

```typescript
import axios from 'axios';
import type { ProviderAdapter, ExecuteResult } from '../types';

// E2B Sandboxes API — https://e2b.dev/docs
// Creates an ephemeral sandbox, runs code, returns output, destroys sandbox.
export const e2bAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.code) throw new Error('e2b requires params.code');

    // Step 1: Create sandbox
    const create = await axios.post(
      'https://api.e2b.dev/sandboxes',
      { template: params.template || 'base', timeout: Math.floor((params.timeout_ms || 30000) / 1000) },
      { headers: { 'X-API-Key': apiKey }, timeout: 15000 }
    );
    const sandboxId: string = create.data.sandboxId;

    try {
      // Step 2: Execute code
      const exec = await axios.post(
        `https://api.e2b.dev/sandboxes/${sandboxId}/process`,
        {
          cmd: params.language === 'python' ? `python3 -c "${params.code.replace(/"/g, '\\"')}"` : params.code,
          envs: params.env || {},
        },
        { headers: { 'X-API-Key': apiKey }, timeout: params.timeout_ms || 30000 }
      );
      const result: ExecuteResult = {
        stdout:    exec.data.stdout || '',
        stderr:    exec.data.stderr || '',
        exit_code: exec.data.exitCode ?? 0,
      };
      return { type: 'sync', result };
    } finally {
      // ALWAYS destroy sandbox — prevent runaway compute charges
      try {
        await axios.delete(`https://api.e2b.dev/sandboxes/${sandboxId}`, {
          headers: { 'X-API-Key': apiKey },
          timeout: 10000,
        });
      } catch { /* log but do not propagate */ }
    }
  },
};
```

---

## 12. AUTHENTICATION SERVICE

```typescript
// services/auth.ts
import crypto from 'crypto';
import { pool }  from '../db/client';
import { redis } from '../redis/client';

const SALT = process.env.API_KEY_SALT!;

export function generateApiKey(): { raw: string; hash: string } {
  const raw  = 'ld_' + crypto.randomBytes(48).toString('hex'); // 99-char key
  const hash = crypto.createHash('sha256').update(SALT + raw).digest('hex');
  return { raw, hash };
}

export async function createUser(email: string): Promise<string> {
  const { raw, hash } = generateApiKey();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const u = await client.query(
      `INSERT INTO users (email) VALUES ($1) RETURNING id`, [email]
    );
    await client.query(
      `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, 'Default')`,
      [u.rows[0].id, hash]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return raw; // Show once — never stored plain
}

// Called on every request — must resolve in under 10ms
export async function validateApiKey(raw: string) {
  const hash  = crypto.createHash('sha256').update(SALT + raw).digest('hex');
  const cache = `auth:${hash}`;

  const hit = await redis.get(cache);
  if (hit) return JSON.parse(hit);

  const r = await pool.query(
    `SELECT u.id, u.email, u.balance_usd, u.plan
     FROM api_keys k
     JOIN users u ON u.id = k.user_id
     WHERE k.key_hash = $1
       AND k.is_active = true
       AND u.is_active = true`,
    [hash]
  );
  if (!r.rows[0]) return null;

  // Update last_used_at async — don't block the request
  pool.query(`UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1`, [hash]).catch(() => {});

  await redis.set(cache, JSON.stringify(r.rows[0]), 'EX', 300);
  return r.rows[0];
}

export async function bustAuthCache(userId: string): Promise<void> {
  const r = await pool.query(
    `SELECT key_hash FROM api_keys WHERE user_id = $1 AND is_active = true`, [userId]
  );
  for (const row of r.rows) {
    await redis.del(`auth:${row.key_hash}`);
  }
}

// Fastify preHandler hook — add via app.addHook('preHandler', authHook)
// Routes registered with { config: { public: true } } skip validation entirely.
// This is required because a route's own `preHandler` option runs IN ADDITION
// to hooks added via app.addHook — it does not replace or cancel them. Marking
// a route "public" via config is the only reliable way to exempt it.
export async function authHook(req: any, reply: any): Promise<void> {
  if (req.routeOptions?.config?.public === true) return;
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer '))
    return reply.code(401).send({ error: 'invalid_api_key' });
  const user = await validateApiKey(h.slice(7));
  if (!user) return reply.code(401).send({ error: 'invalid_api_key' });
  req.user = user;
}
```

---

## 13. ENCRYPTION SERVICE

```typescript
// services/encryption.ts
import crypto from 'crypto';

const KEY = Buffer.from(process.env.PROVIDER_ENCRYPTION_KEY!, 'hex'); // must be 32 bytes
const ALG = 'aes-256-gcm';

export function encrypt(plain: string): string {
  const iv  = crypto.randomBytes(12);
  const c   = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  // Stored as iv:authTag:ciphertext — all hex, colon-separated, self-contained
  return [iv.toString('hex'), c.getAuthTag().toString('hex'), enc.toString('hex')].join(':');
}

export function decrypt(stored: string): string {
  const [ih, th, ch] = stored.split(':');
  const d = crypto.createDecipheriv(ALG, KEY, Buffer.from(ih, 'hex'));
  d.setAuthTag(Buffer.from(th, 'hex'));
  return d.update(Buffer.from(ch, 'hex')).toString('utf8') + d.final('utf8');
}
```

```
// HOW TO STORE PROVIDER API KEYS (run once per provider):
// Step 1: Get raw API key from provider dashboard
// Step 2: Compile: npx tsc (from apps/api)
// Step 3: Run one-off script:
//         node -e "const {encrypt}=require('./dist/services/encryption');console.log(encrypt('YOUR_RAW_KEY'))"
// Step 4: Copy output → run in Supabase SQL Editor:
//         UPDATE providers SET api_key_encrypted = '<output>' WHERE id = 'firecrawl';
// Step 5: Verify all 10:
//         SELECT id, CASE WHEN api_key_encrypted = 'PLACEHOLDER' THEN 'MISSING' ELSE 'OK' END
//         FROM providers;
```

---

## 14. LEDGER SERVICE — SELECT FOR UPDATE

```typescript
// services/ledger.ts
import { pool } from '../db/client';
import { bustAuthCache } from './auth';

export class InsufficientFundsError extends Error {
  constructor(msg: string) { super(msg); this.name = 'InsufficientFundsError'; }
}

// ── ATOMIC DEBIT — SELECT FOR UPDATE ─────────────────────────────────────────
// Uses PostgreSQL row-level locking to guarantee correctness under concurrency.
// SELECT FOR UPDATE acquires an exclusive lock on the user row for the duration
// of the transaction. No other transaction can read or write this row until
// COMMIT or ROLLBACK — eliminates concurrent overdraft.
export async function debitLedger(
  userId:      string,
  amountUsd:   number,
  providerId:  string,
  jobId:       string,
  description: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock user row exclusively for this transaction
    const lock = await client.query(
      `SELECT id, balance_usd FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (!lock.rows[0]) throw new Error('User not found');

    const balance    = parseFloat(lock.rows[0].balance_usd);
    const required   = Math.round(amountUsd * 1e8) / 1e8; // normalize precision

    if (balance < required) {
      await client.query('ROLLBACK');
      throw new InsufficientFundsError(
        `Wallet balance $${balance} is less than required $${required}`
      );
    }

    const newBalance = Math.round((balance - required) * 1e8) / 1e8;

    // Deduct from wallet
    await client.query(
      `UPDATE users SET balance_usd = $1 WHERE id = $2`,
      [newBalance, userId]
    );

    // Append immutable ledger entry — never delete or update these rows
    await client.query(
      `INSERT INTO ledger_entries
         (user_id, type, direction, amount_usd, provider_id, job_id, description, balance_after)
       VALUES ($1, 'debit', 'debit', $2, $3, $4, $5, $6)`,
      [userId, required, providerId, jobId, description, newBalance]
    );

    await client.query('COMMIT');

    // Bust auth cache so next request reads fresh balance
    bustAuthCache(userId).catch(() => {});
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // always return connection to pool
  }
}

// ── CREDIT (deposit) ──────────────────────────────────────────────────────────
export async function creditLedger(
  userId:      string,
  amountUsd:   number,
  description: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query(
      `SELECT id, balance_usd FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (!lock.rows[0]) throw new Error('User not found');

    const balance    = parseFloat(lock.rows[0].balance_usd);
    const newBalance = Math.round((balance + amountUsd) * 1e8) / 1e8;

    await client.query(
      `UPDATE users SET balance_usd = $1 WHERE id = $2`,
      [newBalance, userId]
    );

    await client.query(
      `INSERT INTO ledger_entries
         (user_id, type, direction, amount_usd, description, balance_after)
       VALUES ($1, 'deposit', 'credit', $2, $3, $4)`,
      [userId, amountUsd, description, newBalance]
    );

    await client.query('COMMIT');
    bustAuthCache(userId).catch(() => {});
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

## 15. BILLING SERVICE — ZERO-MARGIN LEMONSQUEEZY

```typescript
// services/billing.ts
import crypto from 'crypto';
import { creditLedger } from './ledger';

// ── CHARGE CALCULATION ────────────────────────────────────────────────────────
// LiteDaemon is pre-revenue. The developer is charged exactly the provider's
// wholesale cost — no markup, no percentage, no platform fee. This function
// exists as a single seam so a future pricing decision only touches one place.
export function calculateCharge(providerCostUsd: number): number {
  return Math.round(providerCostUsd * 1e8) / 1e8;
}

// ── LEMONSQUEEZY CHECKOUT URL ─────────────────────────────────────────────────
// Four fixed tiers. Each LemonSqueezy variant is pre-priced (see Section 06)
// so that after LemonSqueezy's processing fee, LiteDaemon's net proceeds equal
// exactly the advertised credit amount. The credit amount itself travels with
// the checkout session as custom data — the webhook does not need to re-derive
// it from LemonSqueezy's fee breakdown.
const VARIANTS: Record<string, string | undefined> = {
  '10':  process.env.LS_VARIANT_10,
  '25':  process.env.LS_VARIANT_25,
  '50':  process.env.LS_VARIANT_50,
  '100': process.env.LS_VARIANT_100,
};

export function getCheckoutUrl(userId: string, creditAmount: string): string {
  const vid = VARIANTS[creditAmount];
  if (!vid) throw new Error(`Invalid amount. Valid: 10, 25, 50, 100`);
  return `https://litedaemon.lemonsqueezy.com/checkout/buy/${vid}`
       + `?checkout[custom][user_id]=${userId}`
       + `&checkout[custom][credit_amount]=${creditAmount}`;
}

// ── WEBHOOK SIGNATURE VERIFICATION ──────────────────────────────────────────
export function verifyLSSignature(rawBody: Buffer, signature: string): boolean {
  const secret   = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
  } catch { return false; }
}

// ── HANDLE PAYMENT WEBHOOK ────────────────────────────────────────────────────
// The credit_amount is read directly from the custom checkout data embedded
// when the checkout URL was created — not computed from LemonSqueezy's price,
// subtotal, or fee fields. This keeps the wallet credit a clean, predictable
// round number ($10.00, not $9.9something) regardless of exact fee rounding.
export async function handleOrderCreated(body: any): Promise<void> {
  const userId       = body?.meta?.custom_data?.user_id;
  const creditAmount = body?.meta?.custom_data?.credit_amount;
  const status        = body?.data?.attributes?.status;

  if (!userId || !creditAmount || status !== 'paid') return;

  const amountUsd = parseFloat(creditAmount);
  await creditLedger(userId, amountUsd, `LemonSqueezy deposit — $${amountUsd.toFixed(2)} credits`);
}
```

---

## 16. RATE LIMITING

```typescript
// services/rateLimit.ts
import { redis } from '../redis/client';
const LIMITS: Record<string, number> = { free: 100, pro: 1000, enterprise: 10000 };

export async function checkRateLimit(userId: string, plan: string) {
  const limit  = LIMITS[plan] || 100;
  const window = Math.floor(Date.now() / 60000);
  const key    = `rate:${userId}:${window}`;
  const n      = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60);
  return {
    ok:        n <= limit,
    remaining: Math.max(0, limit - n),
    resetAt:   (window + 1) * 60,
    limit,
  };
}
```

---

## 17. ALL ROUTE HANDLERS — COMPLETE CODE

### routes/auth.ts — POST /v1/auth/signup

```typescript
import { FastifyInstance } from 'fastify';
import { createUser } from '../services/auth';

export async function authRoute(app: FastifyInstance) {
  // A new developer has no API key yet, so this route must be marked public —
  // otherwise the global authHook rejects the request before it ever reaches
  // this handler. See Section 12 for how authHook checks this config flag.
  app.post('/v1/auth/signup', { config: { public: true } }, async (req, reply) => {
    const { email } = req.body as any;
    if (!email) return reply.code(422).send({ error: 'validation_error', fields: ['email is required'] });

    try {
      const apiKey = await createUser(email);
      return reply.send({
        api_key: apiKey,
        message: 'Save this key now — it will not be shown again.',
      });
    } catch (e: any) {
      if (e.code === '23505') // Postgres unique_violation on users.email
        return reply.code(409).send({ error: 'email_already_registered' });
      throw e;
    }
  });
}
```

### routes/scrape.ts — POST /v1/scrape

```typescript
import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { getAdapter }       from '../adapters/index';
import { decrypt }          from '../services/encryption';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge }  from '../services/billing';
import { checkRateLimit }   from '../services/rateLimit';
import type { LDProvider }  from '../types';

export async function scrapeRoute(app: FastifyInstance) {
  app.post('/v1/scrape', async (req, reply) => {
    const user = req.user;
    const { provider: providerId, params = {} } = req.body as any;

    if (!providerId)
      return reply.code(422).send({ error: 'validation_error', fields: ['provider is required'] });

    // Rate limit
    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    // Load provider
    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'scrape' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    // Charge = exact wholesale cost, zero markup
    const charge = calculateCharge(parseFloat(provider.cost_per_call_usd));

    // Insert job record
    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd)
       VALUES ($1, $2, 'scrape', $3, 'pending', $4) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge]
    );
    const jobId = jr.rows[0].id;

    // Deduct wallet — SELECT FOR UPDATE
    try {
      await debitLedger(
        user.id, charge, providerId, jobId,
        `${provider.name} scrape — ${params.url || params.actor_id || 'request'}`
      );
    } catch (err: any) {
      await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
      if (err instanceof InsufficientFundsError)
        return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
      throw err;
    }

    // Call adapter
    const adapter = getAdapter(provider.adapter_type);
    const apiKey  = decrypt(provider.api_key_encrypted);
    const started = Date.now();

    try {
      const res = await adapter.run(params, apiKey);

      if (res.type === 'sync') {
        await pool.query(
          `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(res.result), jobId]
        );
        return reply.send({
          job_id:      jobId,
          status:      'completed',
          provider:    providerId,
          result:      res.result,
          cost_usd:    charge,
          duration_ms: Date.now() - started,
        });
      } else {
        // Async provider (Apify) — returns job_id
        await pool.query(
          `UPDATE jobs SET status='running', provider_job_id=$1 WHERE id=$2`,
          [res.provider_job_id, jobId]
        );
        return reply.code(202).send({
          job_id:          jobId,
          status:          'running',
          provider:        providerId,
          provider_job_id: res.provider_job_id,
          cost_usd:        charge,
        });
      }
    } catch (err: any) {
      // Provider was reached (we got an error back), mark failed — no refund per billing policy
      await pool.query(
        `UPDATE jobs SET status='failed', result=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify({ error: err.message }), jobId]
      );
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
```

### routes/search.ts — POST /v1/search

```typescript
import { FastifyInstance } from 'fastify';
import { pool }            from '../db/client';
import { getAdapter }      from '../adapters/index';
import { decrypt }         from '../services/encryption';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge } from '../services/billing';
import { checkRateLimit }  from '../services/rateLimit';
import type { LDProvider } from '../types';

export async function searchRoute(app: FastifyInstance) {
  app.post('/v1/search', async (req, reply) => {
    const user = req.user;
    const { provider: providerId, params = {} } = req.body as any;

    if (!providerId)
      return reply.code(422).send({ error: 'validation_error', fields: ['provider is required'] });
    if (!params.query)
      return reply.code(422).send({ error: 'validation_error', fields: ['params.query is required'] });

    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'search' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    const charge = calculateCharge(parseFloat(provider.cost_per_call_usd));

    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd)
       VALUES ($1, $2, 'search', $3, 'pending', $4) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge]
    );
    const jobId = jr.rows[0].id;

    try {
      await debitLedger(user.id, charge, providerId, jobId, `${provider.name} search — ${params.query}`);
    } catch (err: any) {
      await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
      if (err instanceof InsufficientFundsError)
        return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
      throw err;
    }

    const adapter = getAdapter(provider.adapter_type);
    const apiKey  = decrypt(provider.api_key_encrypted);
    const started = Date.now();

    try {
      const res = await adapter.run(params, apiKey);
      await pool.query(
        `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify((res as any).result), jobId]
      );
      return reply.send({
        job_id:      jobId,
        status:      'completed',
        provider:    providerId,
        result:      (res as any).result,
        cost_usd:    charge,
        duration_ms: Date.now() - started,
      });
    } catch (err: any) {
      await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [jobId]);
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
```

### routes/browser.ts — POST /v1/browser

```typescript
import { FastifyInstance } from 'fastify';
import { pool }            from '../db/client';
import { getAdapter }      from '../adapters/index';
import { decrypt }         from '../services/encryption';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge } from '../services/billing';
import { checkRateLimit }  from '../services/rateLimit';
import type { LDProvider, BrowserResult } from '../types';

export async function browserRoute(app: FastifyInstance) {
  app.post('/v1/browser', async (req, reply) => {
    const user = req.user;
    const { provider: providerId, params = {} } = req.body as any;

    if (!providerId)
      return reply.code(422).send({ error: 'validation_error', fields: ['provider is required'] });

    const rl = await checkRateLimit(user.id, user.plan);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'browser' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    const charge = calculateCharge(parseFloat(provider.cost_per_call_usd));

    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd)
       VALUES ($1, $2, 'browser', $3, 'pending', $4) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge]
    );
    const jobId = jr.rows[0].id;

    try {
      await debitLedger(user.id, charge, providerId, jobId, `${provider.name} browser session`);
    } catch (err: any) {
      await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
      if (err instanceof InsufficientFundsError)
        return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
      throw err;
    }

    const adapter = getAdapter(provider.adapter_type);
    const apiKey  = decrypt(provider.api_key_encrypted);
    const started = Date.now();

    try {
      const res    = await adapter.run(params, apiKey);
      const result = (res as any).result as BrowserResult;

      await pool.query(
        `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify(result), jobId]
      );
      return reply.send({
        job_id:      jobId,
        status:      'completed',
        provider:    providerId,
        result,
        cost_usd:    charge,
        duration_ms: Date.now() - started,
      });
    } catch (err: any) {
      await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [jobId]);
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
```

### routes/execute.ts — POST /v1/execute

```typescript
import { FastifyInstance } from 'fastify';
import { pool }            from '../db/client';
import { getAdapter }      from '../adapters/index';
import { decrypt }         from '../services/encryption';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge } from '../services/billing';
import { checkRateLimit }  from '../services/rateLimit';
import type { LDProvider } from '../types';

export async function executeRoute(app: FastifyInstance) {
  app.post('/v1/execute', async (req, reply) => {
    const user = req.user;
    const { provider: providerId = 'e2b', params = {} } = req.body as any;

    if (!params.code)
      return reply.code(422).send({ error: 'validation_error', fields: ['params.code is required'] });

    const rl = await checkRateLimit(user.id, user.plan);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'execute' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    const charge = calculateCharge(parseFloat(provider.cost_per_call_usd));

    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd)
       VALUES ($1, $2, 'execute', $3, 'pending', $4) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge]
    );
    const jobId = jr.rows[0].id;

    try {
      await debitLedger(user.id, charge, providerId, jobId, `${provider.name} execution`);
    } catch (err: any) {
      await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
      if (err instanceof InsufficientFundsError)
        return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
      throw err;
    }

    const adapter = getAdapter(provider.adapter_type);
    const apiKey  = decrypt(provider.api_key_encrypted);
    const started = Date.now();

    try {
      const res = await adapter.run(params, apiKey);
      await pool.query(
        `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify((res as any).result), jobId]
      );
      return reply.send({
        job_id:      jobId,
        status:      'completed',
        provider:    providerId,
        result:      (res as any).result,
        cost_usd:    charge,
        duration_ms: Date.now() - started,
      });
    } catch (err: any) {
      await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [jobId]);
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
```

### routes/jobs.ts — GET /v1/jobs/:id

```typescript
import { FastifyInstance } from 'fastify';
import { pool }        from '../db/client';
import { getAdapter }  from '../adapters/index';
import { decrypt }     from '../services/encryption';

export async function jobsRoute(app: FastifyInstance) {
  app.get('/v1/jobs/:id', async (req, reply) => {
    const { id } = req.params as any;

    const r = await pool.query(
      `SELECT j.*, p.adapter_type, p.api_key_encrypted
       FROM jobs j
       JOIN providers p ON p.id = j.provider_id
       WHERE j.id = $1 AND j.user_id = $2`,
      [id, req.user.id]
    );
    if (!r.rows[0]) return reply.code(404).send({ error: 'job_not_found' });
    const job = r.rows[0];

    // Terminal states — return cached result
    if (['completed', 'failed'].includes(job.status))
      return reply.send({
        job_id:   id,
        status:   job.status,
        provider: job.provider_id,
        result:   job.result,
        cost_usd: parseFloat(job.cost_usd),
      });

    // Proxy status check to provider
    const adapter = getAdapter(job.adapter_type);
    if (!adapter.status) return reply.send({ job_id: id, status: job.status });
    const apiKey = decrypt(job.api_key_encrypted);

    try {
      const s = await adapter.status(job.provider_job_id, apiKey);

      if (s.status === 'completed') {
        await pool.query(
          `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(s.result), id]
        );
        return reply.send({ job_id: id, status: 'completed', provider: job.provider_id, result: s.result, cost_usd: parseFloat(job.cost_usd) });
      }

      if (s.status === 'failed') {
        // Per billing policy: no refund on provider-side failure
        await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [id]);
        return reply.send({ job_id: id, status: 'failed', provider: job.provider_id, error: s.error, cost_usd: parseFloat(job.cost_usd) });
      }

      return reply.send({ job_id: id, status: 'running', provider: job.provider_id });
    } catch (err: any) {
      // Provider status check failed — job still running
      return reply.send({ job_id: id, status: 'running', note: 'status check error: ' + err.message });
    }
  });
}
```

### routes/usage.ts — GET /v1/usage

```typescript
import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';

export async function usageRoute(app: FastifyInstance) {
  app.get('/v1/usage', async (req, reply) => {
    const u = req.user;
    const [stats, balance] = await Promise.all([
      pool.query(`SELECT * FROM user_usage WHERE user_id = $1`, [u.id]),
      pool.query(`SELECT balance_usd FROM users WHERE id = $1`, [u.id]),
    ]);
    const s = stats.rows[0] || { total_calls: 0, billed_calls: 0, total_spent_usd: 0 };
    return reply.send({
      total_calls:     parseInt(s.total_calls),
      billed_calls:    parseInt(s.billed_calls),
      total_spent_usd: parseFloat(s.total_spent_usd),
      balance_usd:     parseFloat(balance.rows[0]?.balance_usd || '0'),
    });
  });
}
```

### routes/billing.ts — GET /v1/billing/checkout + POST /v1/webhooks/lemonsqueezy

```typescript
import { FastifyInstance } from 'fastify';
import { getCheckoutUrl, verifyLSSignature, handleOrderCreated } from '../services/billing';

export async function billingRoute(app: FastifyInstance) {
  app.get('/v1/billing/checkout', async (req, reply) => {
    const { amount } = req.query as any;
    if (!['10', '25', '50', '100'].includes(amount))
      return reply.code(422).send({ error: 'invalid_amount', valid: [10, 25, 50, 100] });
    return reply.send({ checkout_url: getCheckoutUrl(req.user.id, amount) });
  });

  // LemonSqueezy calls this directly — it sends X-Signature, never a Bearer
  // token, so this route must be marked public or authHook rejects it before
  // signature verification ever runs.
  app.post('/v1/webhooks/lemonsqueezy', { config: { public: true, rawBody: true } }, async (req, reply) => {
    const sig = req.headers['x-signature'] as string;
    if (!sig || !verifyLSSignature(req.rawBody as Buffer, sig))
      return reply.code(401).send({ error: 'invalid_signature' });

    const body = req.body as any;
    if (body?.meta?.event_name === 'order_created') {
      await handleOrderCreated(body);
    }
    return reply.send({ received: true });
  });
}
```

---

## 18. SERVER ENTRY POINT — src/index.ts

### services/reconciliation.ts — orphaned async job cleanup

If a developer submits an Apify job and never calls `GET /v1/jobs/:id` again, that row stays `status='running'` in Postgres forever — nothing else ever revisits it. This runs hourly inside the same process, checks real provider status for anything stuck past 4 hours, and force-resolves it. No new service, no new infrastructure — a single scheduled query.

```typescript
// services/reconciliation.ts
import { pool }       from '../db/client';
import { getAdapter } from '../adapters/index';
import { decrypt }    from './encryption';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every hour

async function reconcileOrphanedJobs(): Promise<void> {
  const stale = await pool.query(
    `SELECT j.id, j.provider_job_id, p.adapter_type, p.api_key_encrypted
     FROM jobs j
     JOIN providers p ON p.id = j.provider_id
     WHERE j.status = 'running'
       AND j.provider_job_id IS NOT NULL
       AND j.created_at < NOW() - INTERVAL '4 hours'`
  );

  for (const job of stale.rows) {
    const adapter = getAdapter(job.adapter_type);
    if (!adapter.status) continue;

    try {
      const s = await adapter.status(job.provider_job_id, decrypt(job.api_key_encrypted));
      if (s.status === 'completed') {
        await pool.query(
          `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(s.result), job.id]
        );
      } else {
        // Either the provider reports failed, or it's still running 4+ hours
        // later — either way, force-close it. No refund per billing policy:
        // the provider already consumed resources on this run.
        await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [job.id]);
      }
    } catch {
      // Status check itself failed — force-close rather than leaving the row
      // stuck in 'running' indefinitely.
      await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [job.id]);
    }
  }

  if (stale.rows.length > 0) {
    console.log(`Reconciliation: resolved ${stale.rows.length} orphaned job(s)`);
  }
}

export function startOrphanJobReconciliation(): void {
  setInterval(reconcileOrphanedJobs, CHECK_INTERVAL_MS);
  console.log('Orphan job reconciliation scheduled — runs every hour');
}
```

### src/index.ts

```typescript
import Fastify       from 'fastify';
import rawBody       from '@fastify/raw-body';
import cors          from '@fastify/cors';
import * as Sentry   from '@sentry/node';
import { authHook }  from './services/auth';
import { startOrphanJobReconciliation } from './services/reconciliation';
import { authRoute }    from './routes/auth';
import { scrapeRoute }  from './routes/scrape';
import { searchRoute }  from './routes/search';
import { browserRoute } from './routes/browser';
import { executeRoute } from './routes/execute';
import { jobsRoute }    from './routes/jobs';
import { usageRoute }   from './routes/usage';
import { billingRoute } from './routes/billing';

Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

const app = Fastify({
  logger:            process.env.NODE_ENV !== 'production',
  connectionTimeout: 0,
  // connectionTimeout: 0 disables Fastify's connection timeout.
  // Needed for sync providers like Firecrawl that may take 30s+.
  // Railway does not impose an aggressive proxy timeout on the upstream side.
});

await app.register(rawBody);
await app.register(cors, { origin: ['https://app.litedaemon.io'] });

app.addHook('preHandler', authHook);
// authHook itself checks each route's { config: { public: true } } flag and
// skips validation for routes marked that way — see Section 12. A route's own
// preHandler option cannot cancel an instance-level addHook, so this is the
// only mechanism used for public routes anywhere in this codebase.

app.register(authRoute);
app.register(scrapeRoute);
app.register(searchRoute);
app.register(browserRoute);
app.register(executeRoute);
app.register(jobsRoute);
app.register(usageRoute);
app.register(billingRoute);

// Public — no API key exists yet for a health check
app.get('/health', { config: { public: true } }, async () => ({ ok: true, ts: Date.now() }));

await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
console.log('LiteDaemon API running on port', process.env.PORT || 3000);

startOrphanJobReconciliation();
```

```typescript
// src/db/client.ts
import { Pool } from 'pg';
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

```typescript
// src/redis/client.ts
import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL!);
```

---

## 19. FRONTEND — DEVELOPER DASHBOARD

| Screen | Route | Build This |
|--------|-------|------------|
| Login / Signup | `/auth` | Email + password. POST to `/v1/auth/signup` → show API key once with copy button + red warning: "Save this key — it will not be shown again." |
| Dashboard | `/dashboard` | Wallet balance (large, green). Calls today. Total spent. Top-up buttons ($10/$25/$50/$100). Recent 10 jobs table: provider, status badge, cost, time ago. |
| Providers | `/providers` | Cards for all 10 providers grouped by endpoint (Scrape / Search / Browser / Execute). Show response_type badge, exact cost per call, copy provider ID. Public page — no login required. Subtitle: "Zero markup — you pay exactly what we pay." |
| Job History | `/jobs` | Table: job_id, provider, endpoint, status badge, cost, duration. Click row → drawer with full result JSON. Async jobs show a Poll Status button. |
| Billing | `/billing` | Balance. Four top-up buttons showing the checkout price and the credited amount side by side (e.g. "$11.05 → $10.00 wallet credit"). Ledger history from `ledger_entries` grouped by day. |
| Settings | `/settings` | Masked API key + Regenerate button (show new key once). |

---

## 20. BUILD ORDER — 3 WEEKS TO LAUNCH

### Week 1 — Core proxy working end-to-end (Days 1–7)

```
Day 1  Supabase: new project → SQL Editor → run entire Section 07 SQL.
       Confirm: 4 tables exist + 10 provider rows with status PLACEHOLDER.
       Upstash: create Redis instance → copy REDIS_URL.
       Generate secrets: run Section 06 node command → paste into .env.

Day 2  Scaffold: mkdir litedaemon/apps/api && cd apps/api && npm init -y
       Install all packages from Section 04.
       tsconfig.json: target ES2020, module commonjs, outDir dist, strict true.
       Create src/db/client.ts and src/redis/client.ts.

Day 3  Create services/encryption.ts (Section 13).
       Compile: npx tsc — must succeed with zero errors.
       Verify encryption:
         node -e "const e=require('./dist/services/encryption');console.log(e.decrypt(e.encrypt('hello'))==='hello')"
         Must print: true
       Get FREE API keys: Jina (jina.ai), Tavily (tavily.com), Serper (serper.dev).
       Encrypt each and UPDATE providers table:
         UPDATE providers SET api_key_encrypted = '<output>' WHERE id = 'jina';

Day 4  Create services/auth.ts, services/rateLimit.ts.
       Create services/ledger.ts (Section 14) — the SELECT FOR UPDATE block.
       Create services/billing.ts (Section 15) — zero-margin calculateCharge.
       Create services/reconciliation.ts (Section 18) — orphaned async job cleanup.

Day 5  Create adapters/index.ts + all 10 adapter files (Section 11).

Day 6  Create all route files (Section 17) + src/index.ts (Section 18).
       Confirm src/index.ts calls startOrphanJobReconciliation() on startup.

Day 7  END-TO-END INTEGRATION TEST — pass condition for Week 1:

       Terminal 1: npx ts-node src/index.ts

       # Step 0: Sign up and get a real API key
       curl -X POST http://localhost:3000/v1/auth/signup \
         -H "Content-Type: application/json" \
         -d '{"email":"you@example.com"}'
       Expected: HTTP 200 + { "api_key": "ld_...", "message": "Save this key..." }
       Copy the returned ld_ key and use it as ld_YOUR_KEY in every call below.

       # Test sync scrape (Jina)
       curl -X POST http://localhost:3000/v1/scrape \
         -H "Authorization: Bearer ld_YOUR_KEY" \
         -H "Content-Type: application/json" \
         -d '{"provider":"jina","params":{"url":"https://example.com"}}'
       Expected: HTTP 200 + { "status":"completed", "result":{"content":"# Example..."}, "cost_usd":0.001 }

       Note: a brand new signup starts at balance_usd = 0. Either top up via
       LemonSqueezy first (Week 2), or manually set a starting balance for this
       test only: UPDATE users SET balance_usd = 5.00 WHERE email = 'you@example.com';

       # Test sync search (Tavily)
       curl -X POST http://localhost:3000/v1/search \
         -H "Authorization: Bearer ld_YOUR_KEY" \
         -H "Content-Type: application/json" \
         -d '{"provider":"tavily","params":{"query":"AI agents 2026"}}'
       Expected: HTTP 200 + { "status":"completed", "result":{"results":[...],"answer":"..."}, "cost_usd":0.001 }

       # Test async scrape (Apify)
       curl -X POST http://localhost:3000/v1/scrape \
         -H "Authorization: Bearer ld_YOUR_KEY" \
         -H "Content-Type: application/json" \
         -d '{"provider":"apify","params":{"actor_id":"apify/web-scraper","run_input":{"startUrls":[{"url":"https://example.com"}]}}}'
       Expected: HTTP 202 + { "status":"running", "job_id":"...", "provider_job_id":"..." }

       # Poll async job
       curl http://localhost:3000/v1/jobs/{job_id} -H "Authorization: Bearer ld_YOUR_KEY"
       Expected: status transitions from running → completed

       Deploy to Railway: connect GitHub → 1 service → set all env vars → verify /health.
```

### Week 2 — Billing + Dashboard (Days 8–14)

```
Day 8  LemonSqueezy: Create Store → 4 products priced per the formula in Section 01
       ($11.05 / $26.84 / $53.16 / $105.79).
       Copy variant UUIDs → paste as LS_VARIANT_10/25/50/100 in .env.
       Add webhook (ngrok for local): enable order_created → copy secret.
       Test: GET /v1/billing/checkout?amount=10 → confirm URL returned.
       Make a test purchase → confirm ledger_entries row credits exactly $10.00.

Day 9  Scaffold dashboard: npm create vite@latest . -- --template react-ts
       Install Tailwind. Create lib/api.ts.

Days 10-12  Build all 6 dashboard screens. Wire to live Railway API.

Day 13  Deploy dashboard to Vercel. Update LemonSqueezy webhook URL to production.

Day 14  End-to-end billing test on production:
        Signup → top up $10 → submit jina scrape → verify balance decrements by exactly $0.001.
        Check ledger_entries in Supabase — confirm deposit row ($10.00 credit) + debit row ($0.001) both exist.
```

### Week 3 — All 10 Providers + Launch (Days 15–21)

```
Day 15  Get remaining 7 provider API keys. Encrypt + UPDATE all 10 rows.
        Verify: SELECT id, CASE WHEN api_key_encrypted = 'PLACEHOLDER' THEN 'MISSING' ELSE 'OK' END FROM providers;

Day 16  Test each provider: one real call each. Screenshot all 10 successful results.

Day 17  Write Mintlify docs: all 4 endpoints with curl examples + per-provider params.
        Build public /providers page (no login required).

Day 18  Sentry: set DSN → trigger test error → confirm in Sentry dashboard.
        Load test: 100 concurrent jina scrapes → confirm all HTTP 200.
        Security: confirm api_key_encrypted never appears in logs.

Day 19  README.md + launch copy. Lead with "zero markup, pay exactly what we pay."

Day 20  Prep: screenshots, HN post, Product Hunt assets.

Day 21  LAUNCH: Show HN + Product Hunt. Reply to every comment within 1 hour.
```

---

## 21. DEPLOYMENT — ONE RAILWAY SERVICE

```json
// railway.json — add to repo root
{
  "build":  { "builder": "NIXPACKS" },
  "deploy": { "startCommand": "cd apps/api && npx tsc && node dist/index.js" }
}
```

```
STEP 1 — One Railway service
  railway.app → New Project → Deploy from GitHub → select repo
  One service. No workers. No queues. One Fastify process.

STEP 2 — Environment variables
  Railway → service → Variables → set all variables from Section 06.
  DATABASE_URL: Supabase Transaction pooler (port 6543, NOT 5432)
  REDIS_URL: Upstash TLS URL starting with rediss://

STEP 3 — Custom domain
  Railway → Settings → Domains → api.litedaemon.io
  DNS: CNAME api.litedaemon.io → Railway-provided domain
  TLS auto-provisioned.

STEP 4 — LemonSqueezy webhook (update from ngrok to production)
  lemonsqueezy.com → Settings → Webhooks → update URL to:
  https://api.litedaemon.io/v1/webhooks/lemonsqueezy

STEP 5 — Production checklist
  [ ] NODE_ENV=production
  [ ] decrypt(encrypt('test')) === 'test'  → run before first real call
  [ ] Supabase: Transaction pooler URL (port 6543)
  [ ] Upstash: maxmemory-policy = noeviction
  [ ] CORS locked to https://app.litedaemon.io
  [ ] Sentry DSN set + tested
  [ ] All 10 providers: no PLACEHOLDER values in api_key_encrypted
  [ ] Ledger sanity check: make one call, verify ledger_entries has a debit row equal to cost_per_call_usd
  [ ] Checkout sanity check: complete one $10 purchase, verify wallet shows exactly $10.00
  [ ] Signup works unauthenticated: POST /v1/auth/signup with no Authorization header
      returns a new ld_ key rather than 401 — confirms the public-route config is wired correctly
  [ ] Reconciliation running: check logs after deploy for "Orphan job reconciliation scheduled"
  [ ] GET /health returns { ok: true }
  [ ] Final smoke test:
      curl -X POST https://api.litedaemon.io/v1/scrape \
        -H "Authorization: Bearer ld_yourkey" \
        -H "Content-Type: application/json" \
        -d '{"provider":"jina","params":{"url":"https://example.com"}}'
      Expected: HTTP 200, status: completed, result.content starts with markdown, cost_usd: 0.001
```

---

## 22. POST-LAUNCH PROVIDER BACKLOG

These providers are categorised and ready to implement after V1 ships. Each requires one new adapter file and one new row in the providers table. No schema or gateway changes needed.

| Category | Providers |
|----------|-----------|
| **Scraping** | Diffbot, Oxylabs, Bright Data, ScrapingBee, PhantomBuster, Octoparse, ParseHub, Scraping Fish, ZenRows, WebScraper.io |
| **SERP / Search** | DataForSEO, SerpAPI, ValueSERP, Bing Search API, SerpStack, SerpWow, Keyword Surfer API |
| **Virtual Chrome / Browser** | Playwright Cloud, BrowserCat, Anchor Browser, Rebrowser, Nstbrowser, Oxylabs Browser API |
| **Code Sandboxes** | Piston API, Judge0, CodeX API, Daytona, Modal, Fly Machines |
| **Hosted Agents** | Skyvern, MultiOn, Lindy, Induced AI, Browse AI, Axiom, Bardeen, Automagic |
| **Vector / Embeddings** | Pinecone, Weaviate Cloud, Qdrant Cloud, Zilliz, Chroma Cloud |
| **Document AI** | Reducto, LlamaParse, Unstructured, Mathpix, Textract |
| **Vision / Multimodal** | Roboflow, Eden AI, AssemblyAI, Deepgram, Whisper API |

---

*LiteDaemon · V1 · June 2026 · CONFIDENTIAL*

*OpenRouter for AI Agents and Tools · 1 service · 4 endpoints · 10 providers · zero markup · 3 weeks to launch*
