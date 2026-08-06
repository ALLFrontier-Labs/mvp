# ARCHITECTURE.md — LiteDaemon System Architecture

> **Version:** 1.0 | **Last Updated:** 2026-08-06 | **Audience:** Onboarding software engineers

---

## 1. System Overview

LiteDaemon is an **API gateway and intelligent routing layer for AI agent tools** — the "OpenRouter for AI Infrastructure." It provides developers and AI agents a single unified API to access web scraping, real-time search, cloud browsers, code execution sandboxes, and document parsing across 35+ third-party providers, without managing per-provider credentials, billing, or glue code.

### Core Value Proposition

- **Bring Your Own Keys (BYOK):** Developers register their own provider API keys (Firecrawl, Tavily, E2B, etc.). LiteDaemon routes requests through the best available key with automatic failover, charging only a **5% gateway fee** on the provider's published list price.
- **Free Tier:** Every account receives **100 free API calls per billing month** across all tools. The 5% fee applies to calls 101+.
- **Unified Schema:** All providers return a standardized JSON response — eliminating per-integration glue code for developers.

### Tech Stack

| Layer | Technology | Role |
|---|---|---|
| API Server | Fastify 5 (Node.js, TypeScript) | HTTP API gateway, routing, middleware |
| Dashboard | Vite + React 18 + TailwindCSS | Developer SPA |
| Database | Supabase (PostgreSQL 15) | Primary data store |
| Cache | Upstash Redis (ioredis) | Auth token cache, rate-limit counters |
| Payments | Dodo Payments (dodopayments SDK) | Checkout, webhook-driven wallet credits |
| Error Tracking | Sentry (@sentry/node) | Production error monitoring |
| API Hosting | Railway (NIXPACKS) | Container-based Node.js |
| Dashboard Hosting | Vercel | Static SPA with CDN |
| Monorepo | npm Workspaces | Shared tooling across apps/ |

---

## 2. Core Data Flow

```
CLIENT
  |  POST /v1/scrape  Authorization: Bearer ld_<96hex>  Body: { provider, params }
  v
FASTIFY SERVER (src/index.ts)
  1. onRequest: Global IP rate limit (200 req/min per IP, in-memory Map)
  2. onRequest: Auth endpoint rate limit (10 req/min per IP, only /v1/auth/* paths)
  3. onSend:    Security headers (HSTS, X-Frame-Options, CSP, etc.)

AUTH HOOK — preHandler (services/auth.ts)
  4. Read Bearer token from Authorization header
  5. hash = SHA-256(API_KEY_SALT + raw_key)
  6. Redis GET auth:<hash>
       HIT  -> deserialize cached user, attach to req.user
       MISS -> SELECT api_keys JOIN users WHERE key_hash=hash AND is_active=true
             -> cache: SET auth:<hash> EX 300 (5-min TTL)
             -> attach to req.user
     Routes with { config: { public: true } } skip auth entirely

ROUTE HANDLER (e.g., routes/scrape.ts)
  7.  Per-user rate limit (services/rateLimit.ts)
        free=100, pro=1000, enterprise=10000 req/min via Redis INCR
        Falls back to in-memory Map when Redis unavailable
  8.  BYOK allowance pre-check (services/byokPricing.ts)
        monthly_call_count <= 100 -> isFreeCall=true, no charge
        monthly_call_count  > 100 -> check wallet >= 5% gateway fee
        Insufficient balance -> HTTP 402 (before provider is called)
        Resets monthly_call_count if 30 days elapsed

autoRun() ROUTING ENGINE (services/autoRoute.ts)
  9.  If X-Provider-Key header present -> use it directly (BYOK-Header-Override)
  10. Else: load user's BYOK keys for provider (sorted: prioritized then fallback, by priority_order)
        For each key:
          adapter.run(params, rawKey)
          HTTP 401/402/403/429 -> ProviderError(isQuotaOrAuth=true) -> try next key
          5xx / runtime error  -> ProviderError(isQuotaOrAuth=false) -> surface immediately as HTTP 502
          Success              -> return result
        All keys exhausted -> HTTP 401 BYOK_KEY_REQUIRED

POST-EXECUTION (back in route handler)
  11. INSERT INTO jobs (...) RETURNING id
  12. debitLedger() if finalCharge > 0
        SELECT FOR UPDATE (row-level lock on users row)
        Check balance >= charge
        UPDATE users SET balance_usd = balance_usd - charge WHERE balance_usd >= charge
        INSERT immutable ledger_entry (append-only, never modified)
        bustAuthCache(userId) -> DEL Redis keys for user
  13. UPDATE jobs SET result, completed_at
  14. Return HTTP 200: { job_id, status, provider, result, cost_usd, duration_ms, routed_via }
```

### Diagnostic Response Headers

| Header | Example | Meaning |
|---|---|---|
| X-LiteDaemon-Routed-Via | BYOK-Prioritized | Key tier used |
| X-LiteDaemon-Key-Attempts | 2 | Number of BYOK keys tried |
| X-LiteDaemon-Wallet-Deducted | $0.000150 | Exact gateway fee debited |
| X-RateLimit-Limit | 100 | Plan rate limit |
| X-RateLimit-Remaining | 87 | Calls left in current 1-min window |
| X-RateLimit-Reset | 1723000860 | Unix timestamp when window resets |

---

## 3. Database & Schema

**Platform:** Supabase (PostgreSQL 15)
**Connection:** Transaction pooler port 6543 via pg Pool (max=2 production / 10 dev, idle=10s, statement_timeout=10s)
**Schema:** schema.sql — apply once in Supabase SQL Editor
**Migrations:** supabase/migrations/ — incremental changes post-initial-deploy

### Table: `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Stable user identifier |
| email | TEXT | NOT NULL, UNIQUE | Lowercased + trimmed on insert |
| password_hash | TEXT | NULLABLE | PBKDF2-SHA512 (100k iterations), format: salt:hash. NULL for OAuth-only accounts |
| first_name | TEXT | NULLABLE | Optional |
| last_name | TEXT | NULLABLE | Optional |
| balance_usd | NUMERIC(18,8) | NOT NULL, DEFAULT 0 | Prepaid wallet; 8dp for sub-cent precision |
| credit_balance | NUMERIC(18,8) | NOT NULL, DEFAULT 0 | Mirror of balance_usd; kept in sync on every transaction |
| monthly_call_count | INTEGER | NOT NULL, DEFAULT 0 | Resets every 30 days |
| billing_period_start | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp of last billing reset |
| stripe_customer_id | TEXT | NULLABLE | Legacy; unused |
| stripe_payment_method_id | TEXT | NULLABLE | Legacy; unused |
| plan | TEXT | NOT NULL, DEFAULT 'free' | Values: free, pro, enterprise |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft-delete flag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### Table: `api_keys`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | NOT NULL, FK -> users(id) ON DELETE CASCADE | |
| key_hash | TEXT | NOT NULL, UNIQUE | SHA-256(SALT + raw_key). Raw key never stored |
| name | TEXT | NOT NULL, DEFAULT 'Default' | 'Default Key', 'Session Key', 'Google Login Key', 'Regenerated Key' |
| last_used_at | TIMESTAMPTZ | NULLABLE | Updated async on each request |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** idx_api_keys_hash(key_hash), idx_api_keys_user(user_id), idx_api_keys_active(is_active)
**Limit:** 10 active keys per user; oldest auto-deactivated via enforceKeyLimit()

### Table: `providers`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | Slug: firecrawl, tavily, e2b, etc. |
| name | TEXT | NOT NULL | Display name |
| endpoint | TEXT | NOT NULL | scrape, search, browser, execute, document |
| adapter_type | TEXT | NOT NULL | Maps to src/adapters/<slug>.ts |
| response_type | TEXT | NOT NULL, DEFAULT 'sync' | sync or async |
| api_key_encrypted | TEXT | NOT NULL | AES-256-GCM encrypted key. 'PLACEHOLDER' = not yet seeded |
| cost_per_call_usd | NUMERIC(18,8) | NOT NULL | Wholesale list price; basis for 5% fee |
| config | JSONB | NOT NULL, DEFAULT '{}' | Reserved |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**V1 Seeded Providers:**

| ID | Name | Endpoint | Type | Cost/call |
|---|---|---|---|---|
| firecrawl | Firecrawl | scrape | sync | $0.003000 |
| jina | Jina AI Reader | scrape | sync | $0.001000 |
| apify | Apify Actors | scrape | async | $0.010000 |
| spider | Spider Cloud | scrape | sync | $0.002000 |
| tavily | Tavily Search | search | sync | $0.001000 |
| exa | Exa AI | search | sync | $0.002000 |
| serper | Serper.dev | search | sync | $0.001000 |
| browserbase | Browserbase | browser | sync | $0.015000 |
| steel | Steel Browser | browser | sync | $0.015000 |
| e2b | E2B Sandbox | execute | sync | $0.003000 |

### Table: `ledger_entries`

**Append-only.** Rows are NEVER updated or deleted.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | NOT NULL, FK -> users(id) | |
| type | TEXT | NOT NULL | debit, deposit, free_call |
| direction | TEXT | NOT NULL | debit, credit, none |
| amount_usd | NUMERIC(18,8) | NOT NULL | |
| raw_provider_cost | NUMERIC(18,8) | NULLABLE | Provider's wholesale cost before markup |
| markup_amount | NUMERIC(18,8) | NULLABLE | 5% markup = final - raw |
| total_deducted | NUMERIC(18,8) | NULLABLE | Equals amount_usd |
| provider_id | TEXT | NULLABLE, FK -> providers(id) | |
| job_id | UUID | NULLABLE | FK to jobs(id) |
| description | TEXT | NOT NULL | e.g., "Tavily Search search gateway fee" |
| balance_after | NUMERIC(18,8) | NOT NULL | Wallet balance after this entry |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** idx_ledger_user(user_id), idx_ledger_created(created_at DESC), idx_ledger_job(job_id)

### Table: `jobs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Returned to caller as job_id |
| user_id | UUID | NOT NULL, FK -> users(id) | |
| provider_id | TEXT | NOT NULL, FK -> providers(id) | |
| endpoint | TEXT | NOT NULL | scrape, search, browser, execute, document |
| provider_job_id | TEXT | NULLABLE | Provider run ID (async providers only) |
| params | JSONB | NOT NULL, DEFAULT '{}' | Request params |
| status | TEXT | NOT NULL, DEFAULT 'pending' | pending, running, completed, failed |
| result | JSONB | NULLABLE | Set when status=completed |
| cost_usd | NUMERIC(18,8) | NOT NULL | Final gateway fee |
| is_byok | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| completed_at | TIMESTAMPTZ | NULLABLE | Used to compute duration_ms |

**Indexes:** idx_jobs_user(user_id), idx_jobs_status(status), idx_jobs_created(created_at DESC)

### Table: `user_provider_keys`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | NOT NULL, FK -> users(id) ON DELETE CASCADE | |
| provider_id | TEXT | NOT NULL, FK -> providers(id) | |
| api_key_encrypted | TEXT | NOT NULL | AES-256-GCM encrypted |
| key_type | TEXT | NOT NULL, DEFAULT 'prioritized' | CHECK: 'prioritized' or 'fallback' |
| priority_order | INTEGER | NOT NULL, DEFAULT 0 | Lower = higher priority within key_type |
| label | TEXT | NULLABLE | User-defined label |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| last_used_at | TIMESTAMPTZ | NULLABLE | Updated async after use |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** idx_upk_user_provider(user_id, provider_id), idx_upk_active(is_active)

### View: `user_usage`

```sql
SELECT user_id,
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE type = 'debit') AS billed_calls,
  COALESCE(SUM(amount_usd) FILTER (WHERE type = 'debit'), 0) AS total_spent_usd
FROM ledger_entries
GROUP BY user_id;
```

---

### Authentication & Security
LiteDaemon utilizes a secure, stateless BYOK (Bring Your Own Key) model combined with managed API access keys.
- **Social Login:** Google OAuth 2.0 flow. Frontend receives the code, backend exchanges it directly with Google.
  - *Enterprise Resiliency:* The social login database transactions are heavily fault-tolerant, featuring automatic retries for dropped idle connections, and explicit catch blocks to gracefully handle `unique_violation` race conditions without crashing.
- **API Keys:** Hash-based validation. Raw keys are 99-character hex strings prefixed with `ld_`.
- **Storage:** Only the SHA-256 hash of the key is stored in the database (with a globally configured pepper/salt). The raw key is only shown to the user once.

**Per-request validation (target ≤10ms):**
1. Read `Authorization: Bearer <raw_key>`
2. Compute `hash = SHA-256(API_KEY_SALT + raw_key)`
3. Redis `GET auth:<hash>` → hit: deserialize user. Miss: DB query, cache result EX 300
4. `last_used_at` updated async (non-blocking)
5. Cache invalidated on: key regeneration, new login, balance change (`bustAuthCache`)

### Password Auth
PBKDF2-SHA512, 100k iterations, random 16-byte salt. Stored: `salt:hash`. Constant-time comparison via `crypto.timingSafeEqual`.

### Google OAuth (Server-Side Code Exchange)
Client sends auth code → API exchanges with Google token endpoint server-side → fetches user profile → upserts user → returns LiteDaemon API key.

**CRITICAL:** `POST /v1/auth/social` is permanently HTTP 410. Only `/v1/auth/google/exchange` is valid.

### Provider Key Encryption
AES-256-GCM. Stored format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
Key: `PROVIDER_ENCRYPTION_KEY` (64 hex chars = 32 bytes). 12-byte random IV per encryption.

### Rate Limiting (3 Layers)

| Layer | Scope | Limit | Store |
|---|---|---|---|
| Global IP | Per IP | 200 req/min | In-memory Map |
| Auth IP | Per IP on /v1/auth/* | 10 req/min | In-memory Map |
| Per-user | Per userId | 100/1000/10000 req/min | Redis (in-memory fallback) |

### Security Headers (every response)
HSTS (1yr), X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 0, strict Referrer-Policy, Permissions-Policy, CSP (default-src 'self'; frame-ancestors 'none')

### CORS Whitelist
`https://www.litedaemon.xyz`, `https://litedaemon.xyz`, localhost:3000/3001/5173, `https://*.vercel.app`. No-origin requests (curl) allowed.

### Logger Redaction
Fields auto-redacted: API keys, Bearer tokens, x-provider-key header, password, secret, token, api_key, key_hash, rawKey, request/response bodies.

---

## 5. Integrations

### Dodo Payments
Checkout fee: `fee = max($0.80, credit * 0.055)` | `total = credit + fee`
Min top-up: $5. Max: $999.
Metadata flow: `{ userId, creditAmountUSD }` embedded in payment creation, read back in webhook.
Webhook: HMAC verified via `dodo.webhooks.unwrap()`. On `payment.succeeded` → `creditLedger()`.

### Provider Adapters
Interface: `{ run(params, apiKey): Promise<RunResult>; status?(job_id, apiKey): Promise<StatusResult> }`
Error classification: `ProviderError(message, isQuotaOrAuth)` — quota errors trigger failover; runtime errors surface immediately.
E2B: always destroys sandbox in `finally` block to prevent runaway charges.
Apify: returns async `provider_job_id`; polled via `GET /v1/jobs/:id`.

### Upstash Redis
Graceful degradation: if down, `get()` returns null, `incr()` returns 0. Auth falls back to DB. Rate limiting falls back to in-memory Map.

### Sentry
Initialized with `SENTRY_DSN` at startup. Optional — server starts without it.

### Background Reconciliation
Runs every 60 minutes. Finds jobs with `status='running'` AND `created_at < NOW() - 4 hours` AND `provider_job_id IS NOT NULL`. Calls `adapter.status()` and updates to `completed` or `failed`.

---

## 6. Billing Engine

### 5% Gateway Fee
```
gateway_fee = provider_base_price_usd * 0.05
```
Price registry: `src/config/provider-prices.ts`. Unknown providers: $0.002 base price.

| Provider | Base | Fee |
|---|---|---|
| Firecrawl | $0.003 | $0.00015 |
| Tavily | $0.001 | $0.00005 |
| Browserbase | $0.015 | $0.00075 |

### Free Tier
100 calls/month free. Tracked in `users.monthly_call_count`. Resets every 30 days.

### Atomic Debit
`SELECT FOR UPDATE` + conditional `UPDATE WHERE balance_usd >= charge` = double overdraft protection. On failure: `InsufficientFundsError` → HTTP 402.
