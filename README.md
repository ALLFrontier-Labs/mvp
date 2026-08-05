# LiteDaemon — Unified AI Tool Gateway & Orchestration Platform

> Unified Bring-Your-Own-Key (BYOK) gateway routing search, browser automation, code sandboxes, and document parsing across 30+ AI tool providers with a single `LITEDAEMON_MASTER_KEY`.

---

## ⚡ Core Business & Billing Architecture

LiteDaemon is **NOT** an LLM wrapper or credit seller. It provides unified, high-performance gateway routing and encrypted key vault orchestration for developer AI tool APIs.

### 1. Free Tier Threshold
Every LiteDaemon account receives **100 free API calls per billing month** across all integrated tools (Tavily, Exa, E2B, Firecrawl, Serper, Browserbase, etc.).

### 2. Monthly Auto-Reset
Free monthly call counters automatically reset to 0 every 30 days from the start of the user's billing period.

### 3. Paid Tier — 5% Gateway Fee (Call 101+)
Starting on call 101, a **5% gateway routing fee** is applied:

$$\text{Gateway Fee} = \text{Provider Base Price} \times 0.05$$

Since users bring their own keys (BYOK), the raw provider cost is billed directly by the provider. **LiteDaemon only charges the 5% gateway fee.**

| Tool Provider | Provider Base Price | LiteDaemon 5% Fee |
|---|---|---|
| Tavily Search | `$0.0010` | `$0.00005` |
| Exa AI | `$0.0020` | `$0.00010` |
| Firecrawl Scrape | `$0.0030` | `$0.00015` |
| E2B Sandbox | `$0.0080` | `$0.00040` |

### 4. Pre-Call Balance Check
API requests beyond 100 calls require an active wallet balance. Requests with insufficient funds return an **HTTP 402 ("Payment Required / Insufficient Balance")** error prior to invoking the upstream provider API.

---

## 🛠️ Quick Start

### 1. Execute Search via Gateway
```bash
curl -X POST https://www.litedaemon.xyz/v1/search \
  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "tavily",
    "params": { "query": "Latest AI agent frameworks 2026" }
  }'
```

### 2. Upstream BYOK Key Override
You can pass your vault key directly or let LiteDaemon rotate your vaulted keys:
```bash
curl -X POST https://www.litedaemon.xyz/v1/scrape \
  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \
  -H "X-Provider-Key: tvly-vaulted-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "firecrawl",
    "params": { "url": "https://example.com" }
  }'
```

---

## 🏗️ Project Structure

```
apps/api/           → Fastify backend (TypeScript) — routes, services, adapters
apps/dashboard/     → React + Vite frontend (TypeScript + Tailwind CSS)
lib/billing/        → Shared billing calculator & usage controller
docs/               → Specifications (billing, pricing, BYOK, API overview)
schema.sql          → PostgreSQL schema definition (Supabase)
```

### Gateway Endpoints
| Endpoint | Purpose | Default Provider |
|---|---|---|
| `POST /v1/search` | AI-optimized web search | Tavily |
| `POST /v1/scrape` | Web scraping & markdown extraction | Firecrawl |
| `POST /v1/browser` | Headless browser automation | Browserbase |
| `POST /v1/execute` | Sandboxed code execution | E2B |
| `POST /v1/document` | Document parsing (PDF, etc.) | LlamaParse |

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL (via Supabase)
- Redis (via Upstash)

### Setup
```bash
# 1. Clone and install
git clone <repo-url> && cd litedaemon
cd apps/api && npm install
cd ../dashboard && npm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp .env.example .env
# Fill in your credentials in both .env files

# 3. Run database migrations
# Apply schema.sql to your Supabase project

# 4. Start development servers
cd apps/api && npm run dev        # API on port 3000
cd apps/dashboard && npm run dev  # Dashboard on port 5173
```

---

## 📚 Documentation & Specs

- [Billing Engine Specification](docs/billing.md)
- [Pricing Model](docs/pricing.md)
- [API Overview & Endpoints](docs/api-overview.md)
- [BYOK Key Encryption & Routing](docs/byok.md)

---

## 🔒 Security

- **AES-256-GCM Key Vault**: Provider keys are stored encrypted at rest.
- **In-Memory Decryption**: Keys are decrypted strictly in isolated RAM for the lifespan of a single HTTP proxy request.
- **Timing-Safe Webhook Verification**: All webhook signature comparisons use `crypto.timingSafeEqual`.
- **Parameterized SQL**: All database queries use parameterized statements — zero SQL injection surface.
- **CORS Enforcement**: Production CORS only allows `*.litedaemon.xyz`, `*.vercel.app`, and `localhost`.
- **No Hardcoded Secrets**: All credentials are loaded from environment variables; `.env` is gitignored.

---

## 💳 Payments

Wallet deposits are processed via **Dodo Payments**. Minimum deposit is `$5.00 USD` with a 5.5% platform fee ($0.80 minimum). Wallet credits never expire.
