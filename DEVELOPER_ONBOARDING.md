# DEVELOPER_ONBOARDING.md — LiteDaemon Developer Onboarding Guide

> **Version:** 1.0 | **Last Updated:** 2026-08-06 | **For:** New engineers joining the LiteDaemon team

---

## 1. What You're Building

LiteDaemon is an API gateway for AI agent tools. Engineers work across two apps:

- **`apps/api`** — Fastify (Node.js/TypeScript) HTTP server. The core product.
- **`apps/dashboard`** — React + Vite SPA. The developer-facing UI at litedaemon.xyz.

Both apps share a PostgreSQL database (Supabase) and a Redis cache (Upstash).

Read `ARCHITECTURE.md` for a full system deep-dive before starting.

---

## 2. Prerequisites

Install the following before starting:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ (LTS) | https://nodejs.org or `nvm install --lts` |
| npm | 10+ (included with Node) | `npm install -g npm@latest` |
| Git | Any recent | Pre-installed on most systems |

You will also need **accounts** with:
- [Supabase](https://supabase.com) — free tier is sufficient for development
- [Upstash](https://upstash.com) — free Redis instance
- [Google Cloud Console](https://console.cloud.google.com) — for OAuth credentials

---

## 3. Clone & Install

```bash
# 1. Clone the repository
git clone <repo-url> litedaemon
cd litedaemon

# 2. Install all dependencies (runs npm install in both apps via workspaces)
npm install

# 3. Install API app dependencies explicitly if needed
cd apps/api && npm install && cd ../..

# 4. Install dashboard app dependencies explicitly if needed
cd apps/dashboard && npm install && cd ../..
```

---

## 4. Database Setup (Supabase)

### 4.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Choose a region close to your users/deployment.
3. Note the project **Reference ID** (e.g., `abcdefghijklmnop`).

### 4.2 Apply the Schema

1. In the Supabase dashboard → **SQL Editor** → **New Query**.
2. Open `schema.sql` from the repo root.
3. Paste the **entire contents** and click **Run**.
4. Verify output: you should see all providers listed with their status.

### 4.3 Apply Migrations

After the base schema, apply incremental migrations in order:

```bash
# Apply RLS (Row Level Security) migration
# Paste contents of supabase/migrations/20260805_enable_rls.sql in Supabase SQL Editor
```

### 4.4 Get the Connection String

In Supabase dashboard → **Settings** → **Database** → **Connection string**:
- Select **Transaction pooler** (port 6543) mode
- Copy the `postgresql://` URI
- Replace `[YOUR-PASSWORD]` with your database password

**Format:**
```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

---

## 5. Redis Setup (Upstash)

1. Go to [upstash.com](https://upstash.com) → Create Database.
2. Choose **Redis**, name it `litedaemon-dev`, select a region.
3. On the database detail page, copy the **Redis URL** under "REST API" or "ioredis" section.
4. Format: `rediss://default:<password>@<host>.upstash.io:6379`

---

## 6. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create a new **OAuth 2.0 Client ID** (Web application type).
3. Add **Authorized redirect URIs:**
   - `http://localhost:5173/auth/callback` (dashboard dev)
   - `http://localhost:3001/auth/callback`
   - `https://www.litedaemon.xyz/auth/callback` (production)
4. Note the **Client ID** and **Client Secret**.



## 8. Environment Variable Configuration

### 8.1 API Server (`apps/api/.env`)

Copy the example file and fill in values:

```bash
cp apps/api/.env.example apps/api/.env
```

Then edit `apps/api/.env`:

```dotenv
# ── Database (Supabase Transaction Pooler) ─────────────────────────────────────
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"

# ── Cache (Upstash Redis) ──────────────────────────────────────────────────────
REDIS_URL="rediss://default:<password>@<host>.upstash.io:6379"

# ── Security Secrets ───────────────────────────────────────────────────────────
# Generate each with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
API_KEY_SALT=<64-char-hex-string>
PROVIDER_ENCRYPTION_KEY=<64-char-hex-string>

# ── Google OAuth ───────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>

# ── Application ────────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development

# ── Sentry (Optional) ─────────────────────────────────────────────────────────
SENTRY_DSN=   # Leave empty for local dev
```

### 8.2 Dashboard (`apps/dashboard/.env.local`)

Create this file (not tracked by git):

```dotenv
VITE_API_URL=http://localhost:3000/v1
VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

### 8.3 Root `.env` (optional, for shared scripts)

```dotenv
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
APP_URL=http://localhost:5173
GATEWAY_URL=http://localhost:3000/v1
```

---

## 9. Seed Provider Keys

After the database schema is applied, seed the provider API keys. This encrypts the keys using `PROVIDER_ENCRYPTION_KEY` and stores them in the `providers` table:

```bash
cd apps/api
# Edit src/scripts/seed-provider-keys.ts — add your actual provider API keys
# Then run:
npx ts-node -r dotenv/config src/scripts/seed-provider-keys.ts
```

**Alternatively**, update keys directly in the Supabase SQL Editor:
```sql
UPDATE providers
SET api_key_encrypted = 'PLACEHOLDER_VALUE'  -- replace with encrypted value from script output
WHERE id = 'firecrawl';
```

To check which providers are seeded vs placeholder:
```sql
SELECT id, name,
  CASE WHEN api_key_encrypted = 'PLACEHOLDER' THEN '⚠ NOT SEEDED' ELSE '✓ OK' END AS status
FROM providers ORDER BY endpoint, id;
```

---

## 10. Running Locally

### Start the API Server

```bash
# From the repo root:
npm run dev:api

# Or directly:
cd apps/api && npm run dev
```

Expected output:
```
[Redis] Connected successfully
[INFO] server_started {"port":3000,"env":"development"}
[INFO] reconciliation_scheduled {"intervalMs":3600000}
```

The API is now available at `http://localhost:3000`.

### Start the Dashboard

```bash
# From the repo root:
npm run dev:dashboard

# Or directly:
cd apps/dashboard && npm run dev
```

Dashboard runs at `http://localhost:5173`.

### Health Check

```bash
curl http://localhost:3000/health
# {"ok":true,"ts":1723000860123}
```

### Test API Authentication

```bash
# 1. Sign up
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"testpass123"}'

# Response: {"api_key":"ld_...","user":{...}}

# 2. Use the returned api_key for subsequent calls
export API_KEY="ld_..."

curl http://localhost:3000/v1/me \
  -H "Authorization: Bearer $API_KEY"
```

---

## 11. Environment Variable Audit

Complete reference of every environment variable used in the system.

### API Server (`apps/api`)

| Variable | Required | Where to Get | Notes |
|---|---|---|---|
| `DATABASE_URL` | **YES — FATAL** | Supabase → Settings → Database → Transaction Pooler URI | Server won't start without this |
| `API_KEY_SALT` | **YES — FATAL** | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Server won't start without this. Must never change after first user signs up |
| `PROVIDER_ENCRYPTION_KEY` | **YES — FATAL at runtime** | Generate same as above (different value!) | Used to encrypt/decrypt BYOK keys in DB. Must be exactly 64 hex chars (32 bytes). Changing this makes all stored keys unreadable |
| `REDIS_URL` | Recommended | Upstash → Database → ioredis URL | Optional — auth works without Redis (falls back to DB), but performance degrades significantly |
| `GOOGLE_CLIENT_ID` | For Google OAuth | Google Cloud Console → OAuth Credentials | Without this, /v1/auth/google/exchange returns 503 |
| `GOOGLE_CLIENT_SECRET` | For Google OAuth | Google Cloud Console → OAuth Credentials | Must match GOOGLE_CLIENT_ID |
| `FRONTEND_URL` | Recommended | Set to your dashboard URL | Used for redirects |
| `PORT` | No | n/a | Default: 3000 |
| `NODE_ENV` | No | n/a | 'development' or 'production'. Debug logs disabled in production |
| `SENTRY_DSN` | Optional | Sentry → Project → DSN | Leave empty for local dev |

### Dashboard (`apps/dashboard`)

| Variable | Required | Where to Get | Notes |
|---|---|---|---|
| `VITE_API_URL` | No | Your deployed API URL | Default: reads from VITE_GATEWAY_URL or hardcoded litedaemon.xyz constant |
| `VITE_GATEWAY_URL` | No | Your deployed API URL | Alternative to VITE_API_URL |
| `VITE_GOOGLE_CLIENT_ID` | For Google OAuth | Same as GOOGLE_CLIENT_ID | Used in the client-side OAuth redirect initiation |

### Root-Level (shared scripts)

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | For scripts | Shared constant |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For scripts | Next.js-style prefix variant |
| `APP_URL` | For scripts | Application base URL |
| `GATEWAY_URL` | For scripts | API gateway base URL |

---

## 12. Development Workflow

### Building for Production

```bash
# Build both apps
npm run build

# Build only API (outputs to apps/api/dist/)
npm run build:api

# Build only dashboard (outputs to apps/dashboard/dist/)
npm run build:dashboard
```

### TypeScript Type Checking

```bash
cd apps/api && npm run typecheck
```

### Running Tests

```bash
# API tests (no test runner configured — use ts-node directly)
cd apps/api
npx ts-node -r dotenv/config src/tests/provider_failover.test.ts
```

### Code Structure Conventions

- **Routes** (`src/routes/`) are thin handlers. Validate input, call services, return responses. No business logic in routes.
- **Services** (`src/services/`) contain all business logic. Keep pure and testable.
- **Adapters** (`src/adapters/`) are thin wrappers around external APIs. Must implement `ProviderAdapter` interface. Throw `ProviderError(message, isQuotaOrAuth)` — never let raw axios errors escape.
- **Never** interpolate user input into SQL strings. Always use parameterized queries (`$1`, `$2`, etc.).
- **Never** log raw API keys, passwords, or tokens. Use `logger.ts` for all logging.

### Adding a New Provider Adapter

1. Create `src/adapters/<provider_id>.ts`. Implement the `ProviderAdapter` interface.
2. Add to the `REGISTRY` in `src/adapters/index.ts`.
3. Add pricing to `src/config/provider-prices.ts`.
4. Run `seed-provider-keys.ts` to add the provider row to the database.
5. Add a row to the `providers` table with the correct `endpoint` and `adapter_type`.

### Making Database Schema Changes

1. Write SQL in a new file: `supabase/migrations/<timestamp>_<description>.sql`
2. Apply via Supabase SQL Editor.
3. Update `schema.sql` to reflect the final desired schema state.
4. If the change affects TypeScript types (`LDUser`, `LDProvider`, etc.), update `src/types.ts`.

---

## 13. Deployment

### API (Railway)

The `railway.json` at the repo root configures automatic Railway deployments:
- **Build:** NIXPACKS (auto-detects Node.js, runs `npm run build` in `apps/api`)
- **Start:** `node dist/index.js`
- Ensure all environment variables from Section 11 are set in Railway's **Variables** panel.

### Dashboard (Vercel)

The `apps/dashboard/vercel.json` configures Vercel:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```
This ensures the SPA's client-side router handles all routes. Set `VITE_API_URL` in Vercel's Environment Variables to point to the deployed Railway API URL.

---

## 14. Troubleshooting

### "FATAL: API_KEY_SALT environment variable is required"
Add `API_KEY_SALT` to `apps/api/.env`. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### "DATABASE_URL environment variable is required"
Add `DATABASE_URL` to `apps/api/.env`. Use Supabase's **Transaction Pooler** URL (port 6543).

### "[Redis] REDIS_URL not set — caching disabled"
This is a warning, not an error. Auth will work but be slower (DB lookup on every request). Add `REDIS_URL` to fix.

### "No adapter registered for provider: <slug>"
The provider's `adapter_type` in the `providers` table doesn't match any key in `src/adapters/index.ts`. Either add the adapter to the registry or fix the `adapter_type` in the DB.

### HTTP 401 BYOK_KEY_REQUIRED
The user has no active BYOK keys for the requested provider. They need to add keys in the dashboard at `/keys`.

### "No Browserbase projects found"
The user's Browserbase API key is valid but has no projects. The user needs to create a project in their Browserbase account first. Or pass `project_id` explicitly in the request params.

---

## 15. Key Files Quick Reference

| File | Purpose |
|---|---|
| apps/api/src/index.ts | Server entry point — all middleware and route registration |
| apps/api/src/types.ts | All TypeScript interfaces for the system |
| schema.sql | Complete database schema — run once to set up |
| apps/api/src/services/auth.ts | API key validation, hashing, cache management |
| apps/api/src/services/autoRoute.ts | BYOK routing engine — the core of the gateway |
| apps/api/src/adapters/index.ts | Adapter registry — add new providers here |
| apps/dashboard/src/lib/api.ts | Dashboard API client — all HTTP calls to the gateway |
| apps/api/.env.example | Complete list of all required environment variables |
