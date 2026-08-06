# SYSTEM_MAP.md — LiteDaemon Complete System Map

> **Version:** 1.0 | **Last Updated:** 2026-08-06

---

## 1. Directory Structure

```
litedaemon/                          # Monorepo root
├── package.json                     # npm workspace config, root build scripts
├── railway.json                     # Railway deployment: NIXPACKS build, node dist/index.js start
├── schema.sql                       # FULL PostgreSQL schema — run once in Supabase SQL Editor
├── openapi.json                     # OpenAPI 3.0 spec (partial documentation reference)
├── .env                             # Root-level shared env vars (Google OAuth, URLs)
├── .env.example                     # Template for root .env (never commit real values)
├── .gitignore                       # Ignores node_modules, dist, .env files
├── README.md                        # Public-facing readme
│
├── apps/
│   ├── api/                         # Fastify API server (TypeScript/Node.js)
│   │   ├── package.json             # API dependencies: fastify, ioredis, pg, dodopayments, sentry
│   │   ├── tsconfig.json            # TypeScript: commonjs, strict, outDir=dist
│   │   ├── .env                     # API environment variables (copy of .env.example filled in)
│   │   ├── .env.example             # Full template of all required API env vars
│   │   ├── migrate-multi-byok.js    # One-off migration: add key_type, priority_order columns
│   │   ├── migrate-strict-byok.js   # One-off migration: strict BYOK enforcement
│   │   ├── seed-all-providers.js    # Seed script for all provider rows (JS, runs against DB)
│   │   ├── test_dodo.js             # Dodo Payments API connectivity test script
│   │   │
│   │   └── src/
│   │       ├── index.ts             # ENTRY POINT: registers all plugins, hooks, routes, starts server
│   │       ├── types.ts             # Shared TypeScript interfaces: ScrapeResult, SearchResult,
│   │       │                        #   BrowserResult, ExecuteResult, DocumentResult, LDUser,
│   │       │                        #   LDProvider, ProviderAdapter, ProviderError
│   │       │
│   │       ├── adapters/            # One file per third-party provider
│   │       │   ├── index.ts         # REGISTRY: maps slug -> ProviderAdapter instance; getAdapter()
│   │       │   ├── firecrawl.ts     # Firecrawl v1 scrape API (45s timeout)
│   │       │   ├── firecrawl_parse.ts # Firecrawl document parsing endpoint
│   │       │   ├── llamaparse.ts    # LlamaIndex document parser
│   │       │   ├── jina.ts          # Jina AI Reader
│   │       │   ├── apify.ts         # Apify Actors (async: returns run_id, has status() method)
│   │       │   ├── spider.ts        # Spider Cloud
│   │       │   ├── tavily.ts        # Tavily Search (returns results + AI answer field)
│   │       │   ├── exa.ts           # Exa AI semantic search
│   │       │   ├── serper.ts        # Serper.dev Google Search API
│   │       │   ├── browserbase.ts   # Browserbase (auto-discovers project ID, caches in memory)
│   │       │   ├── steel.ts         # Steel Browser cloud sessions
│   │       │   ├── e2b.ts           # E2B Sandbox (create -> execute -> ALWAYS destroy)
│   │       │   ├── daytona.ts       # Daytona remote workspace (has mock fallback mode)
│   │       │   │
│   │       │   # ── Registered but not yet active (available for future activation) ──
│   │       │   ├── anchor.ts        # Anchor scraper
│   │       │   ├── bing.ts          # Bing Search API
│   │       │   ├── brave.ts         # Brave Search API
│   │       │   ├── brightdata.ts    # BrightData web scraping
│   │       │   ├── browserless.ts   # Browserless cloud browser
│   │       │   ├── crawl4ai.ts      # Crawl4AI
│   │       │   ├── diffbot.ts       # Diffbot web scraping
│   │       │   ├── fly.ts           # Fly.io compute
│   │       │   ├── google_cse.ts    # Google Custom Search Engine
│   │       │   ├── modal.ts         # Modal compute execution
│   │       │   ├── oxylabs.ts       # Oxylabs web scraping
│   │       │   ├── perplexity.ts    # Perplexity Search
│   │       │   ├── runpod.ts        # RunPod GPU execution
│   │       │   ├── scrape_do.ts     # Scrape.do
│   │       │   ├── scraperapi.ts    # ScraperAPI
│   │       │   ├── scrapfly.ts      # Scrapfly
│   │       │   ├── scrapingbee.ts   # ScrapingBee
│   │       │   ├── searxng.ts       # SearXNG self-hosted search
│   │       │   ├── serpapi.ts       # SerpAPI
│   │       │   ├── unstructured.ts  # Unstructured.io document parsing
│   │       │   ├── you.ts           # You.com Search
│   │       │   ├── zenrows.ts       # ZenRows web scraping
│   │       │   └── zenserp.ts       # ZenSERP Google Search
│   │       │
│   │       ├── config/
│   │       │   └── provider-prices.ts # PROVIDER_PRICES registry (35+ providers),
│   │       │                           # getProviderBasePrice(), calc5PercentFee()
│   │       │
│   │       ├── db/
│   │       │   └── client.ts        # PostgreSQL pool (max=20, SSL for Supabase, timeouts)
│   │       │
│   │       ├── redis/
│   │       │   └── client.ts        # ioredis wrapper with graceful no-op fallback
│   │       │                        # get/set/del/incr/expire all degrade silently
│   │       │
│   │       ├── lib/
│   │       │   ├── dodo.ts          # Dodo Payments SDK client instance
│   │       │   ├── logger.ts        # Structured logger with automatic sensitive data redaction
│   │       │   ├── validation.ts    # Input validators: email, password, URL, amount, OAuth code,
│   │       │   │                    #   redirectUri, providerID, apiKey, searchParams, keyType
│   │       │   └── billing/
│   │       │       ├── calculator.ts # calculateCallCost(): free vs paid, markup math
│   │       │       └── usage.ts      # processCallUsage(): full billing transaction with DB lock,
│   │       │                         # reset logic, ledger entry creation; shouldResetBillingPeriod()
│   │       │
│   │       ├── routes/              # Fastify route handlers (one file per domain)
│   │       │   ├── auth.ts          # POST /v1/auth/signup, /login, /google/exchange, /regenerate
│   │       │   │                    # GET  /v1/me
│   │       │   │                    # POST /v1/auth/social (disabled, returns 410)
│   │       │   ├── scrape.ts        # POST /v1/scrape
│   │       │   ├── search.ts        # POST /v1/search
│   │       │   ├── browser.ts       # POST /v1/browser
│   │       │   ├── execute.ts       # POST /v1/execute
│   │       │   ├── document.ts      # POST /v1/document (JSON + multipart/form-data)
│   │       │   ├── jobs.ts          # GET  /v1/jobs, GET /v1/jobs/:id
│   │       │   ├── usage.ts         # GET  /v1/usage (returns total_calls, billed_calls=max(0, count-100), total_spent_usd, balance_usd)
│   │       │   ├── billing.ts       # GET  /v1/billing/checkout, POST /v1/webhooks/dodo
│   │       │   ├── providers.ts     # GET  /v1/providers (public, no auth)
│   │       │   └── keys.ts          # GET/POST /v1/keys, PUT /v1/keys/reorder,
│   │       │                        # DELETE /v1/keys/:id, POST /v1/keys/verify
│   │       │
│   │       ├── services/            # Business logic layer
│   │       │   ├── auth.ts          # generateApiKey, hashPassword, verifyPassword,
│   │       │   │                    # createUser, loginWithPassword, socialLoginOrSignup,
│   │       │   │                    # validateApiKey, bustAuthCache, authHook (preHandler)
│   │       │   ├── autoRoute.ts     # getLiveProviders(), autoRun() — core BYOK routing engine
│   │       │   ├── billing.ts       # calculateCharge(), calcDepositFee(), calcCheckoutPrice(),
│   │       │   │                    # getCheckoutUrl(), handleDodoPaymentSucceeded()
│   │       │   ├── byok.ts          # getProviderKeysForUser(), markKeyUsed(), addByokKey(),
│   │       │   │                    # deleteByokKey(), reorderByokKeys(), listByokKeys()
│   │       │   ├── byokPricing.ts   # preCheckAndEvaluateByok() — free vs paid call decision
│   │       │   ├── encryption.ts    # AES-256-GCM encrypt() / decrypt() for provider keys
│   │       │   ├── ledger.ts        # debitLedger() / creditLedger() — atomic PostgreSQL transactions
│   │       │   ├── rateLimit.ts     # checkRateLimit() — Redis INCR with in-memory fallback
│   │       │   └── reconciliation.ts # startOrphanJobReconciliation() — hourly async job cleanup
│   │       │
│   │       ├── scripts/             # One-time operational scripts
│   │       │   ├── seed-provider-keys.ts  # Encrypt & store provider API keys in DB
│   │       │   ├── migrate-auth.js        # Add password fields migration
│   │       │   ├── migrate-billing-engine.js # Add billing columns migration
│   │       │   ├── migrate-byok-allowance.js # Add BYOK allowance columns
│   │       │   ├── migrate-byok.js        # Add user_provider_keys table
│   │       │   ├── migrate-document-providers.js # Add document provider rows
│   │       │   ├── seed-daytona-key.js    # Seed Daytona provider key
│   │       │   └── seed-llama-key.js      # Seed LlamaParse provider key
│   │       │
│   │       └── tests/               # Unit & integration tests
│   │           ├── billing.test.ts  # Full billing engine unit tests (TypeScript)
│   │           ├── billing_5percent.js # 5% fee calculation tests
│   │           ├── byok_billing.test.js # BYOK billing flow tests
│   │           ├── byok_billing.test.ts # TypeScript BYOK billing tests
│   │           ├── provider_failover.test.ts # Provider failover & error handling unit tests
│   │           └── test_byok_allowance.js # Monthly allowance reset tests
│   │
│   └── dashboard/                   # React SPA (Vite + TypeScript + TailwindCSS)
│       ├── package.json             # React 18, react-router-dom, framer-motion, lucide-react
│       ├── vite.config.ts           # Vite build config
│       ├── tailwind.config.js       # Tailwind configuration
│       ├── vercel.json              # Vercel deployment: SPA rewrites all routes to index.html
│       ├── index.html               # Root HTML template with OG meta, favicon
│       │
│       └── src/
│           ├── main.tsx             # React entry point
│           ├── App.tsx              # Router, route definitions, ProtectedRoute guard
│           ├── index.css            # Global CSS, custom properties, animations
│           │
│           ├── pages/               # One component per top-level route
│           │   ├── Landing.tsx      # Public homepage
│           │   ├── Login.tsx        # Auth: email/password + Google OAuth
│           │   ├── AuthCallback.tsx # OAuth callback handler (exchanges code)
│           │   ├── Dashboard.tsx    # Main app dashboard (usage, recent jobs)
│           │   ├── Keys.tsx         # BYOK key management UI (full multi-key UX)
│           │   ├── Jobs.tsx         # Job history and log inspector
│           │   ├── Billing.tsx      # Wallet top-up, transaction history
│           │   ├── Settings.tsx     # Profile, API key regeneration
│           │   ├── Providers.tsx    # Provider catalog browser
│           │   ├── Playground.tsx   # Live API playground
│           │   ├── Docs.tsx         # Full embedded documentation
│           │   ├── Pricing.tsx      # Pricing page
│           │   ├── Rankings.tsx     # Provider performance rankings
│           │   ├── ComparePage.tsx  # Provider comparison
│           │   ├── ToolDetailPage.tsx # Individual tool detail page
│           │   ├── ContactSales.tsx # Enterprise contact form
│           │   ├── Privacy.tsx      # Privacy policy
│           │   ├── Terms.tsx        # Terms of service
│           │   └── Security.tsx     # Security disclosure page
│           │
│           ├── components/          # Reusable UI components
│           │   ├── Header.tsx / Footer.tsx / Navbar.tsx / Logo.tsx / DaemonLogo.tsx
│           │   ├── BackgroundCanvas.tsx    # Ambient WebGL/SVG mesh grid & interactive cursor glow canvas
│           │   ├── CodeSnippetDrawer.tsx   # Code snippet display for API calls
│           │   ├── CommandPalette.tsx      # Global keyboard-driven command palette
│           │   ├── EndpointDrawer.tsx      # Provider endpoint detail drawer
│           │   ├── EnterpriseQuoteModal.tsx # Enterprise quote request modal
│           │   ├── KeyConfigModal.tsx      # BYOK key add/edit modal
│           │   ├── LogInspectorDrawer.tsx  # Job log detail drawer
│           │   ├── PlaygroundPresets.tsx   # Pre-built playground examples
│           │   ├── PricingCalculator.tsx   # Interactive pricing calculator
│           │   ├── PricingFAQ.tsx          # Pricing FAQ accordion
│           │   ├── PricingFeatureMatrix.tsx # Plan comparison matrix
│           │   ├── ProfileDropdown.tsx     # User avatar + account menu
│           │   ├── ProviderPerformanceDrawer.tsx # Provider stats drawer
│           │   ├── RegenerateKeyModal.tsx  # API key regeneration confirmation
│           │   ├── RequestAdapterModal.tsx # Request new provider adapter
│           │   ├── ResponseInspector.tsx   # API response tree inspector
│           │   ├── TopUpModal.tsx          # Wallet top-up modal
│           │   ├── UsageBanner.tsx         # Free tier usage progress banner
│           │   ├── WorkspaceModal.tsx      # Workspace/team management modal
│           │   ├── DocsFooter.tsx          # Documentation page footer
│           │   ├── compare/                # Provider comparison components
│           │   └── tools/                  # Tool-specific component variants
│           │
│           ├── context/
│           │   └── ThemeContext.tsx        # Light/dark theme provider
│           │
│           ├── lib/
│           │   ├── api.ts           # API client: all fetch calls, Bearer token injection,
│           │   │                    # localStorage key management (getStoredApiKey, setStoredApiKey)
│           │   ├── constants.ts     # GATEWAY_URL, GOOGLE_CLIENT_ID from VITE_ env vars
│           │   └── services/        # Dashboard-side service utilities
│           │
│           ├── types/               # Dashboard TypeScript type definitions
│           └── data/                # Static data files (provider metadata, pricing tables)
│
├── lib/                             # Shared utilities (used by both apps and scripts)
│   ├── constants.ts                 # GOOGLE_CLIENT_ID, APP_URL, GATEWAY_URL
│   ├── auth-config.ts               # Auth configuration constants
│   └── billing/
│       ├── calculator.ts            # calculateCallCost() — stub (thin wrapper)
│       └── usage.ts                 # shouldResetBillingPeriod() — thin wrapper
│
├── supabase/
│   └── migrations/
│       └── 20260805_enable_rls.sql  # Enable Row-Level Security on all tables
│
├── docs/                            # Internal documentation
│   ├── api-overview.md              # API quick-reference
│   ├── billing.md                   # Billing model documentation
│   ├── byok.md                      # BYOK guide
│   └── pricing.md                   # Pricing details
│
└── tests/
    └── billing.test.ts              # Root-level billing test (minimal stub)
```

---

## 2. API Route Catalog

All routes are prefixed with `/v1`. The API server runs on `PORT` (default 3000).

**Base URL:** `https://api.litedaemon.xyz/v1` (production) or `http://localhost:3000/v1` (local)

**Auth:** All routes require `Authorization: Bearer <ld_key>` unless marked **[PUBLIC]**.

---

### Health Check

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /health | PUBLIC | Returns `{ ok: true, ts: <timestamp> }` |

---

### Authentication (`routes/auth.ts`)

#### `POST /v1/auth/signup` [PUBLIC]

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "mypassword123",      // optional; min 8 chars
  "firstName": "Alice",              // optional
  "lastName": "Smith"               // optional
}
```

**Response 200:**
```json
{
  "api_key": "ld_<96hex>",          // show once and store — never shown again
  "user": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "..." },
  "message": "Account created successfully."
}
```

**Errors:** 409 email_already_registered | 422 validation_error

---

#### `POST /v1/auth/login` [PUBLIC]

Authenticate with email/password. Returns a new session API key.

**Request Body:**
```json
{ "email": "user@example.com", "password": "mypassword123" }
```

**Response 200:**
```json
{
  "api_key": "ld_<96hex>",
  "user": { "id": "...", "email": "...", "balanceUsd": 12.50, "plan": "free" },
  "message": "Signed in successfully."
}
```

**Errors:** 404 user_not_found | 401 invalid_credentials | 401 password_required

---

#### `POST /v1/auth/google/exchange` [PUBLIC]

Server-side Google OAuth code exchange.

**Request Body:**
```json
{ "code": "<google_auth_code>", "redirectUri": "https://litedaemon.xyz/auth/callback" }
```

**Response 200:**
```json
{
  "api_key": "ld_<96hex>",
  "user": { "id": "...", "email": "..." },
  "message": "Authenticated via Google successfully."
}
```

**Errors:** 400 validation_error | 400 invalid_grant | 400 redirect_uri_mismatch | 500 auth_failed | 503 oauth_not_configured

> **Edge Case Handling:** The frontend (`AuthCallback.tsx`) implements strict URL state hygiene by immediately stripping the single-use `code` from the URL to prevent stale code replays via page refresh/bookmarks. If a stale code is submitted, the backend parses Google's error and gracefully returns a `400 invalid_grant` instead of a 500.
> **Enterprise Resiliency:** The `/v1/auth/google/exchange` endpoint implements automatic retry logic for dropped idle database connections, catches `unique_violation` race conditions gracefully, enforces strict 10s timeouts for Google APIs, and surfaces exact internal error strings to the client for immediate transparency if a crash occurs.

---

#### `POST /v1/auth/social` [PUBLIC] — **DISABLED**

Returns HTTP 410. Use `/v1/auth/google/exchange` instead.

---

#### `GET /v1/me`

Get authenticated user's profile + usage stats.

**Response 200:**
```json
{
  "email": "user@example.com",
  "first_name": "Alice",
  "last_name": "Smith",
  "plan": "free",
  "created_at": "2026-01-15T10:00:00Z",
  "balance_usd": 12.50,
  "total_calls": 250,
  "billed_calls": 150,
  "total_spent_usd": 0.0075
}
```

---

#### `POST /v1/auth/regenerate`

Deactivate all active API keys and generate a new one. Client must store and use the returned key immediately.

**Response 200:**
```json
{
  "api_key": "ld_<96hex>",
  "message": "Master API key regenerated successfully. All previous keys have been deactivated.",
  "deactivated_keys": 3
}
```

---

### Gateway Endpoints (`routes/scrape.ts`, `search.ts`, `browser.ts`, `execute.ts`, `document.ts`)

All gateway endpoints follow the same request/response pattern:

**Request (JSON):**
```json
{
  "provider": "firecrawl",   // or "auto" to use cheapest configured key
  "params": { ... }          // provider-specific parameters
}
```

**Optional Header:** `X-Provider-Key: <raw_api_key>` — override with a one-off key (not stored).

**Response 200:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "firecrawl",
  "result": { ... },          // unified result schema (see below)
  "cost_usd": 0.000150,
  "duration_ms": 1823,
  "routed_via": "BYOK-Prioritized"
}
```

**Errors:** 401 invalid_api_key | 401 BYOK_KEY_REQUIRED | 402 insufficient_balance | 422 validation_error | 429 rate_limit_exceeded | 502 provider_error

---

#### `POST /v1/scrape`

Scrape a URL to extract its content.

**params fields:**
```json
{
  "url": "https://example.com",       // required
  "formats": ["markdown"],            // optional; default: ["markdown"]
  "onlyMainContent": true             // optional; default: true
}
```

**result schema (ScrapeResult):**
```json
{
  "content": "# Page Title\n\nContent...",
  "metadata": {
    "title": "Page Title",
    "url": "https://example.com",
    "word_count": 450
  }
}
```

**Default provider (auto):** firecrawl

---

#### `POST /v1/search`

Search the web and return structured results.

**params fields:**
```json
{
  "query": "latest AI news",           // required
  "search_depth": "basic",            // optional: "basic" | "advanced"
  "max_results": 5                    // optional; default: 5
}
```

**result schema (SearchResult):**
```json
{
  "results": [
    { "title": "...", "url": "...", "snippet": "...", "score": 0.95 }
  ],
  "answer": "AI-generated answer if provider supports it"
}
```

**Default provider (auto):** tavily

---

#### `POST /v1/browser`

Provision a cloud browser session for automation.

**params fields:**
```json
{
  "project_id": "bb_proj_xxx"   // optional; auto-discovered if omitted (Browserbase only)
}
```

**result schema (BrowserResult):**
```json
{
  "session_id": "sess_xxx",
  "connect_url": "wss://connect.browserbase.com/...",
  "debug_url": "https://www.browserbase.com/sessions/..."
}
```

**Default provider (auto):** browserbase

---

#### `POST /v1/execute`

Run code in an isolated sandbox.

**params fields:**
```json
{
  "code": "print('hello world')",   // required
  "language": "python",             // optional: "python" | "javascript" | "node"
  "timeout_ms": 30000,              // optional; default: 30000
  "env": { "MY_VAR": "value" }     // optional environment variables
}
```

**result schema (ExecuteResult):**
```json
{
  "stdout": "hello world\n",
  "stderr": "",
  "exit_code": 0
}
```

**Default provider (auto):** e2b

---

#### `POST /v1/document`

Parse a document (PDF, DOCX, etc.) into structured content. Supports both JSON body and `multipart/form-data`.

**JSON Body:**
```json
{
  "provider": "llamaparse",
  "params": {
    "file_url": "https://example.com/doc.pdf",   // OR
    "file_base64": "<base64>",                    // from multipart upload
    "file_name": "document.pdf",
    "format": "markdown"                           // optional
  }
}
```

**Multipart Form:** Upload file as `file` field; other fields as form fields.

**result schema (DocumentResult):**
```json
{
  "content": "# Document Title\n\n...",
  "format": "markdown",
  "metadata": {
    "file_name": "document.pdf",
    "page_count": 12
  }
}
```

**Default provider (auto):** llamaparse

---

### Jobs (`routes/jobs.ts`)

#### `GET /v1/jobs`

List recent jobs for the authenticated user.

**Query params:** `limit` (max 50, default 20), `offset` (default 0), `endpoint` (filter by: scrape/search/browser/execute/document)

**Response 200:**
```json
{
  "jobs": [
    {
      "job_id": "uuid",
      "provider": "firecrawl",
      "endpoint": "scrape",
      "status": "completed",
      "cost_usd": 0.000150,
      "duration_ms": 1823,
      "created_at": "2026-08-06T10:00:00Z",
      "completed_at": "2026-08-06T10:00:01.823Z"
    }
  ],
  "total": 47
}
```

---

#### `GET /v1/jobs/:id`

Get a specific job's status and result. For async providers (Apify), also polls the provider for current status.

**Response 200 (completed):**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "provider": "apify",
  "result": { ... },
  "cost_usd": 0.000500
}
```

**Response 200 (running/pending):**
```json
{ "job_id": "uuid", "status": "running", "provider": "apify" }
```

---

### Usage (`routes/usage.ts`)

#### `GET /v1/usage`

Get usage statistics for the authenticated user.

**Response 200:**
```json
{
  "total_calls": 250,
  "billed_calls": 150,
  "total_spent_usd": 0.0075,
  "balance_usd": 12.50
}
```

---

### Billing (`routes/billing.ts`)

#### `GET /v1/billing/checkout?amount=<n>`

Create a Dodo Payments checkout session.

**Query params:** `amount` — dollar amount to credit (min $5, max $999)

**Response 200:**
```json
{
  "checkout_url": "https://pay.dodopayments.com/...",
  "checkout_price": 10.55,    // amount + fee
  "credit_amount": 10.00      // amount that will be credited to wallet
}
```

---

#### `POST /v1/webhooks/dodo` [PUBLIC]

Dodo Payments webhook endpoint. Signature verified via HMAC.

**Handled event:** `payment.succeeded` — credits wallet and creates ledger entry.

**Response 200:** `{ "received": true }` (always, to prevent Dodo retries)

---

### Providers (`routes/providers.ts`)

#### `GET /v1/providers` [PUBLIC]

List all providers and their status.

**Response 200:**
```json
{
  "providers": [
    {
      "id": "firecrawl",
      "name": "Firecrawl",
      "endpoint": "scrape",
      "adapter_type": "firecrawl",
      "response_type": "sync",
      "cost_per_call_usd": 0.003,
      "is_live": true
    }
  ]
}
```

`is_live = true` means: `is_active = true AND api_key_encrypted != 'PLACEHOLDER'`

---

### BYOK Keys (`routes/keys.ts`)

#### `GET /v1/keys`

List all BYOK keys for the authenticated user.

**Response 200:**
```json
{
  "keys": [
    {
      "id": "uuid",
      "provider_id": "firecrawl",
      "provider_name": "Firecrawl",
      "endpoint": "scrape",
      "adapter_type": "firecrawl",
      "key_type": "prioritized",
      "priority_order": 0,
      "label": "My Firecrawl Key",
      "is_active": true,
      "last_used_at": "2026-08-06T10:00:00Z",
      "created_at": "2026-08-01T09:00:00Z",
      "platform_cost_usd": 0.003,
      "key_hint": "sk-••••••••••••••••••••"
    }
  ]
}
```

---

#### `POST /v1/keys`

Add a new BYOK key for a provider.

**Request Body:**
```json
{
  "provider_id": "firecrawl",        // required
  "api_key": "fc-xxxxxxxxxxxx",      // required, min 4 chars
  "key_type": "prioritized",          // optional: "prioritized" | "fallback"
  "label": "My Production Key"       // optional
}
```

**Response 201:**
```json
{
  "message": "BYOK key saved for Firecrawl",
  "key": { ... }    // same shape as GET /v1/keys item
}
```

---

#### `PUT /v1/keys/reorder`

Update priority order within a key_type group for a provider.

**Request Body:**
```json
{
  "provider_id": "firecrawl",
  "key_type": "prioritized",
  "ordered_ids": ["uuid-1", "uuid-2", "uuid-3"]   // new order, index 0 = highest priority
}
```

**Response 200:** `{ "message": "Key priority order updated", "provider_id": "...", "key_type": "..." }`

---

#### `DELETE /v1/keys/:key_id`

Delete a BYOK key by its ID or provider_id.

**Response 200:** `{ "message": "BYOK key deleted successfully", "key_id": "..." }`
**Response 404:** `key_not_found`

---

#### `POST /v1/keys/verify`

Validate key format for a provider (format-only, does not test live connectivity).

**Request Body:**
```json
{ "provider_id": "firecrawl", "api_key": "fc-xxxx" }
```

**Response 200:**
```json
{ "valid": true, "message": "Key format accepted for Firecrawl. Key will be tested on first use.", "latency_ms": 2 }
```

---

---

## 2.5 Provider Catalog — All 36 Adapters

> **Clarification:** LiteDaemon has **20 API routes** (HTTP endpoints) but **36 provider adapters**.
> Providers are NOT separate endpoints — they are selectable backends accessed through the 5 gateway
> endpoints (`/v1/scrape`, `/v1/search`, `/v1/browser`, `/v1/execute`, `/v1/document`) by passing
> `"provider": "<id>"` in the request body, or `"provider": "auto"` to use the cheapest available key.

### How to Select a Provider

```json
POST /v1/scrape
{
  "provider": "firecrawl",        // use a specific provider
  "params": { "url": "https://example.com" }
}

POST /v1/search
{
  "provider": "auto",             // use cheapest provider with a configured BYOK key
  "params": { "query": "latest AI news" }
}
```

---

### Gateway: `/v1/scrape` — Web Scraping (11 providers)

| Provider ID | Display Name | Type | Cost/call | Status | Notes |
|---|---|---|---|---|---|
| `firecrawl` | Firecrawl | sync | $0.0030 | **Active** | Default for `auto`. Scrapes + converts to Markdown. 45s timeout. |
| `jina` | Jina AI Reader | sync | $0.0010 | **Active** | Lightweight reader mode scraping via Jina API. |
| `apify` | Apify Actors | **async** | $0.0100 | **Active** | Returns `provider_job_id` immediately. Poll via `GET /v1/jobs/:id`. Default actor: `apify/website-content-crawler`. |
| `spider` | Spider Cloud | sync | $0.0020 | **Active** | Spider.cloud high-speed scraping API. |
| `scrape_do` | Scrape.do | sync | $0.0020 | Inactive | Adapter file exists; not in active registry. Add to `adapters/index.ts` to enable. |
| `scrapingbee` | ScrapingBee | sync | $0.0030 | Inactive | Adapter file exists; not in active registry. |
| `zenrows` | ZenRows | sync | $0.0030 | Inactive | Adapter file exists; not in active registry. |
| `scraperapi` | ScraperAPI | sync | $0.0030 | Inactive | Adapter file exists; not in active registry. |
| `scrapfly` | Scrapfly | sync | $0.0030 | Inactive | Adapter file exists; not in active registry. |
| `crawl4ai` | Crawl4AI | sync | $0.0010 | Inactive | Adapter file exists; not in active registry. |
| `brightdata` | BrightData | sync | $0.0040 | Inactive | Adapter file exists; not in active registry. |

**Also present in adapters/ but no active DB row or registry entry:**
`anchor`, `browserless`, `diffbot`, `oxylabs`, `you`, `zenserp`

---

### Gateway: `/v1/search` — Real-Time Web Search (6 providers)

| Provider ID | Display Name | Type | Cost/call | Status | Notes |
|---|---|---|---|---|---|
| `tavily` | Tavily Search | sync | $0.0010 | **Active** | Default for `auto`. Returns results + optional AI answer field. |
| `exa` | Exa AI | sync | $0.0020 | **Active** | Semantic / neural web search. |
| `serper` | Serper.dev | sync | $0.0010 | **Active** | Google SERP results via Serper API. |
| `perplexity` | Perplexity Search | sync | $0.0050 | Inactive | Adapter file exists; not in active registry. |
| `google_search` | Google Custom Search | sync | $0.0010 | Inactive | Via Google CSE API (`google_cse.ts`). Not in active registry. |
| `bing_search` | Bing Search | sync | $0.0010 | Inactive | Via Bing Search API (`bing.ts`). Not in active registry. |

**Also present in adapters/ but no active DB row or registry entry:**
`brave`, `searxng`, `serpapi`, `you`

---

### Gateway: `/v1/browser` — Cloud Browser Sessions (3 providers)

| Provider ID | Display Name | Type | Cost/call | Status | Notes |
|---|---|---|---|---|---|
| `browserbase` | Browserbase | sync | $0.0150 | **Active** | Default for `auto`. Returns Playwright-compatible `connect_url` + `debug_url`. Auto-discovers project ID from account. |
| `steel` | Steel Browser | sync | $0.0150 | **Active** | Steel cloud browser sessions. |
| `hyperbeam` | Hyperbeam | sync | $0.0150 | Inactive | Price registered; no adapter file yet. |

**Result shape:** `{ session_id, connect_url, debug_url? }`
Connect to the session using any Playwright/Puppeteer CDP-compatible client.

---

### Gateway: `/v1/execute` — Code Execution Sandboxes (3 providers)

| Provider ID | Display Name | Type | Cost/call | Status | Notes |
|---|---|---|---|---|---|
| `e2b` | E2B Sandbox | sync | $0.0080 | **Active** | Default for `auto`. Creates sandbox → runs code → **always destroys sandbox** in `finally`. Supports Python, JS. |
| `daytona` | Daytona | sync | $0.0080 | **Active** | Remote workspace execution. Has mock fallback mode if key is PLACEHOLDER/test. Cleanup on completion. |
| `modal` | Modal Compute | sync | $0.0100 | Inactive | Price registered; adapter file exists (`modal.ts`); not in active registry. |

**Also present in adapters/ but no active DB row or registry entry:**
`fly`, `runpod`

**params fields used by execute adapters:**
```json
{
  "code": "print('hello')",      // required — code to run
  "language": "python",          // optional: "python" | "javascript" | "node"
  "timeout_ms": 30000,           // optional — default: 30000 (30s)
  "env": { "KEY": "val" },       // optional — environment variables
  "template": "base"             // E2B only — sandbox template name
}
```

---

### Gateway: `/v1/document` — Document Parsing (3 providers)

| Provider ID | Display Name | Type | Cost/call | Status | Notes |
|---|---|---|---|---|---|
| `llamaparse` | LlamaParse | sync | $0.0050 | **Active** | Default for `auto`. LlamaIndex document parser. Supports PDF, DOCX, etc. |
| `unstructured` | Unstructured.io | sync | $0.0040 | Inactive | Adapter file exists; not in active registry. |
| `deepdata` | DeepData | sync | $0.0040 | Inactive | Price registered; no adapter file yet. |

**Also present in adapters/ but no active DB row:**
`firecrawl_parse` (active in registry — alternate Firecrawl document parsing mode)

**Accepted input methods:**
1. JSON body with `file_url` — public URL to the document
2. JSON body with `file_base64` + `file_name` — base64-encoded file content
3. `multipart/form-data` — upload `file` field directly (auto-converted to base64 internally)

---

### Active vs Inactive Summary

| Category | Active | Inactive (Adapter Ready) | Inactive (Price Only) | Total |
|---|---|---|---|---|
| Scrape | 4 (firecrawl, jina, apify, spider) | 7 (scrape_do, scrapingbee, zenrows, scraperapi, scrapfly, crawl4ai, brightdata) + 6 more files | — | 17+ |
| Search | 3 (tavily, exa, serper) | 2 (perplexity, google_cse) + 4 more files | — | 9+ |
| Browser | 2 (browserbase, steel) | — | 1 (hyperbeam) | 3 |
| Execute | 2 (e2b, daytona) | 1 (modal) + 2 more files | — | 5+ |
| Document | 1 (llamaparse) | 1 (unstructured) + 1 (firecrawl_parse) | 1 (deepdata) | 4 |
| **Total** | **12** | **~18** | **~2** | **~36** |

> **"Active"** = registered in `adapters/index.ts` AND has a live row in the `providers` table with a seeded key.
>
> **"Adapter Ready"** = adapter `.ts` file exists in `src/adapters/`; can be activated by adding to `adapters/index.ts` and inserting a `providers` row.
>
> **"Price Only"** = entry in `src/config/provider-prices.ts` but no adapter file yet.

---

### 5% Gateway Fee by Provider

Every BYOK call beyond the 100-call free tier is charged: `fee = base_price_usd * 0.05`

| Provider | Base Price | Gateway Fee (5%) |
|---|---|---|
| jina | $0.0010 | $0.000050 |
| tavily | $0.0010 | $0.000050 |
| serper | $0.0010 | $0.000050 |
| crawl4ai | $0.0010 | $0.000050 |
| firecrawl | $0.0030 | $0.000150 |
| e2b | $0.0030 (list) | $0.000150 |
| spider | $0.0020 | $0.000100 |
| exa | $0.0020 | $0.000100 |
| scrape_do | $0.0020 | $0.000100 |
| scrapingbee | $0.0030 | $0.000150 |
| zenrows | $0.0030 | $0.000150 |
| scraperapi | $0.0030 | $0.000150 |
| scrapfly | $0.0030 | $0.000150 |
| brightdata | $0.0040 | $0.000200 |
| unstructured | $0.0040 | $0.000200 |
| apify | $0.0100 (list: $0.005) | $0.000250 |
| perplexity | $0.0050 | $0.000250 |
| llamaparse | $0.0050 | $0.000250 |
| e2b | $0.0080 (actual) | $0.000400 |
| daytona | $0.0080 | $0.000400 |
| modal | $0.0100 | $0.000500 |
| browserbase | $0.0150 | $0.000750 |
| steel | $0.0150 | $0.000750 |
| hyperbeam | $0.0150 | $0.000750 |

> Unknown provider IDs fall back to a default base of **$0.002** → fee of **$0.0001**.

---

## 3. Critical Logic & Edge Cases

### 3.1 BYOK Routing Failover Logic (services/autoRoute.ts)

**Failover triggers ONLY on quota/auth errors (HTTP 401/402/403/429).** All other errors (5xx, runtime, scraping blocks) surface immediately and do NOT try the next key. This is a deliberate design decision: if a provider returns a 503, failing over to another key will likely produce the same result and waste quota.

**Edge case — no BYOK keys configured:**
- The `BYOK_KEY_REQUIRED` error (HTTP 401) is thrown with a message pointing users to `/app/keys`.
- The dashboard should detect this error code and surface a direct link to the key management page.

**Edge case — X-Provider-Key header + provider='auto':**
- The header key is used with `providers[0]` (cheapest active provider for that endpoint). This means the key must be valid for that specific provider, not necessarily the one the caller intended.

### 3.2 Billing Period Reset Race Condition (services/byokPricing.ts)

`preCheckAndEvaluateByok()` reads `billing_period_start`, checks if reset is needed, and issues a non-atomic UPDATE before acquiring any lock. Under very high concurrency (thousands of simultaneous calls at the moment of month rollover), the count reset could be applied multiple times or missed.

**Mitigation:** This is a low-risk window (milliseconds, very unlikely in practice). A future improvement would use `UPDATE users SET monthly_call_count = 0 WHERE id=$1 AND billing_period_start < NOW() - INTERVAL '30 days' RETURNING *` as a single atomic operation.

### 3.3 Browserbase Project ID Cache

`browserbaseAdapter` caches the user's first project ID in a module-level variable (`_cachedProjectId`). This is an in-process cache — if multiple users with different Browserbase accounts use the gateway simultaneously, the first user's project ID will be returned for all subsequent users in the same Node.js process lifetime.

**Impact:** Browserbase sessions may be created under the wrong project. **Mitigation:** Pass `project_id` explicitly in params, or implement a per-`apiKey` cache (Map keyed on apiKey hash).

### 3.4 Daytona Adapter Mock Mode

The Daytona adapter has a fallback that returns a mock response if `apiKey` is `'PLACEHOLDER'` or starts with `'sk-test'`. This can produce false positives during development. Do not use test keys in a production environment pointing to real user jobs.

### 3.5 Apify Async Job Billing

For async providers (Apify), the job cost is set at request time (from `byokPricing`) but the provider actually starts work asynchronously. If an Apify run fails after the wallet has already been debited, there is no automatic refund (per billing policy comment in `jobs.ts`).

### 3.6 Ledger Entry: Double InsufficientFundsError Class

There are two separate `InsufficientFundsError` classes in the codebase:
- `services/ledger.ts` — thrown during the atomic debit operation
- `lib/billing/usage.ts` — thrown during the `processCallUsage` transaction

Both extend `Error` but have different fields. The route handlers only catch the `ledger.ts` version (imported directly). The `usage.ts` version is used by the older billing engine. **Ensure you import from `services/ledger.ts`** in route handlers.

### 3.7 jobs.ts Proxy Key Decryption

`GET /v1/jobs/:id` decrypts the provider's `api_key_encrypted` from the `providers` table (the platform master key, not the user's BYOK key) to poll async job status. This means the platform-level key is used for status polling even if the original job was run with a user BYOK key. The user's BYOK key is not stored on the job record.

### 3.8 Rate Limit Redis Incr Returns 0

In `services/rateLimit.ts`, the Redis `incr()` wrapper returns `0` when Redis is down. The code explicitly checks `if (n > 0)` to distinguish "Redis working" from "Redis down" — a `0` triggers the in-memory fallback. This means an `incr` returning `0` could theoretically happen on the very first call (where Redis correctly returns `1`), but the wrapper returns `0` only on error, so a real `incr` returning `0` from Redis is not possible (keys start at `1` after first increment).

### 3.9 Connection Timeout Disabled

Fastify is initialized with `connectionTimeout: 0` (disabled). This is required because some scraping providers (Firecrawl) can take 30+ seconds. However, it means misbehaving clients can hold connections indefinitely. Ensure Railway/load balancer level timeouts are set.

### 3.10 Auth Cache Staleness Window

The Redis auth cache has a 5-minute TTL. After a wallet debit, `bustAuthCache` is called — but there is a brief window (up to 5 minutes) where a cached user object may have a stale `balance_usd`. The actual wallet debit uses a database lock and is always correct; the staleness only affects what `req.user.balance_usd` reports. Routes that need accurate balance should query the DB directly.
