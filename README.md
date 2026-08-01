# LiteDaemon — Unified AI Tool Gateway & Orchestration Platform

> Unified Bring-Your-Own-Key (BYOK) gateway routing search, browser automation, and code sandboxes across Tavily, Exa, E2B, Firecrawl, Serper, and Browserbase with a single `LITEDAEMON_MASTER_KEY`.

---

## ⚡ Core Business & Billing Architecture

LiteDaemon is **NOT** an LLM wrapper or credit seller. It provides unified, high-performance gateway routing and key vault orchestration for developer AI tool APIs.

### 1. Free Tier Threshold
Every LiteDaemon account receives **100 free API calls per billing month** across all integrated tools (Tavily, Exa, E2B, Firecrawl, etc.).

### 2. Monthly Auto-Reset
Free monthly call counters automatically reset to 0 every 30 days from the start of the user's billing period.

### 3. Paid Tier Calculation (Call 101+)
Starting on call 101, usage is billed on a transparent **Bring-Your-Own-Key / Provider-Pass-Through + 5% markup** model:
$$\text{Final User Charge} = \text{Raw Provider Charge} \times 1.05$$

*Example*: If Tavily search wholesale cost is `$0.010`, the exact charge to the user is `$0.0105` (`$0.010` + 5% markup). Micro-billing calculations use 6 decimal places of precision internally.

### 4. Pre-Call Balance Check
API requests beyond 100 calls require an active balance or attached payment method. Requests with insufficient funds return an **HTTP 402 ("Payment Required / Insufficient Balance")** error prior to invoking the upstream provider API.

---

## 🛠️ Quick Start

### 1. Execute Search via Gateway
```bash
curl -X POST https://gateway.litedaemon.com/v1/search \
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
curl -X POST https://gateway.litedaemon.com/v1/scrape \
  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \
  -H "X-Provider-Key: tvly-vaulted-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "firecrawl",
    "params": { "url": "https://example.com" }
  }'
```

---

## 📚 Documentation & Specs

- [Billing Engine Specification](file:///docs/billing.md)
- [Pricing Model](file:///docs/pricing.md)
- [API Overview & Endpoints](file:///docs/api-overview.md)
- [BYOK Key Encryption & Routing](file:///docs/byok.md)
- [OpenAPI 3.0 Specification](file:///openapi.json)

---

## 🔒 Security

- **AES-256-GCM Key Vault**: Provider keys are stored encrypted at rest.
- **In-Memory Decryption**: Keys are decrypted strictly in isolated RAM for the lifespan of a single HTTP proxy request and immediately zeroed out.
- **Zero Payload Persistence**: Tool payload data never touches disk storage.
