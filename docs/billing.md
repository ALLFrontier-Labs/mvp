# Billing Engine Specification — LiteDaemon

This document specifies the exact micro-billing mathematics, monthly period reset rules, and HTTP status codes for the LiteDaemon AI Tool Gateway.

---

## 1. Free Tier Rule
Every LiteDaemon account receives **100 free API calls per billing month** across all integrated tools (Tavily, Exa, E2B, Firecrawl, Serper, Browserbase, etc.).

- Tracked by: `monthly_call_count` (integer) and `billing_period_start` (timestamp).
- Calls 1 through 100 incur `$0.000000` LiteDaemon gateway charge (`isFree = true`).
- The raw provider cost is still billed directly by the provider to the user's own BYOK key.

---

## 2. Monthly Auto-Reset
Free monthly call counters automatically reset to 0 every 30 days from the start of the user's billing period.

- Reset evaluation occurs atomically on every API request.
- When `now >= billing_period_start + 30 days`, the system sets `monthly_call_count = 0` and updates `billing_period_start = now`.

---

## 3. Paid Tier Calculation (Call 101+)
Starting on call 101, a **5% gateway fee** is applied on top of the provider's standard base list price:

$$\text{Gateway Fee} = \text{Provider Base Price} \times 0.05$$

This is **only** the LiteDaemon gateway routing fee. Since users bring their own keys (BYOK), the raw provider cost is billed directly by the provider.

### Precision Rules
- Internal precision: 8 decimal places (`NUMERIC(18,8)` in PostgreSQL).
- Ledger display precision: 4 decimal places (`0.0000`).

### Fee Examples
| Tool Provider | Provider Base Price | 5% Gateway Fee | LiteDaemon Charge |
|---|---|---|---|
| Tavily Search | `$0.0010` | `$0.00005` | **`$0.00005`** |
| Exa AI | `$0.0020` | `$0.00010` | **`$0.00010`** |
| Firecrawl Scrape | `$0.0030` | `$0.00015` | **`$0.00015`** |
| E2B Sandbox | `$0.0080` | `$0.00040` | **`$0.00040`** |

---

## 4. Pre-Call Balance Check & HTTP 402 Rejection
API requests beyond 100 calls require an active wallet balance. Requests with insufficient funds return an **HTTP 402 ("Payment Required / Insufficient Balance")** error prior to provider invocation.

### Error Payload Format (HTTP 402)
```json
{
  "error": "Insufficient Balance",
  "message": "Every LiteDaemon account receives 100 free API calls per billing month across all integrated tools. Requests beyond 100 calls require an active balance. Requests with insufficient funds return HTTP 402 prior to provider invocation.",
  "monthly_call_count": 101,
  "required_balance": 0.00005,
  "current_balance": 0.0000
}
```

---

## 5. Wallet Deposits
Deposits are processed via **Dodo Payments** with the following fee structure:

- **Deposit Fee**: `max($0.80, depositAmount × 0.055)` — 5.5% with $0.80 minimum.
- **Minimum Deposit**: `$5.00 USD`
- **Maximum Deposit**: `$999.00 USD` per session.
- **Total Checkout**: `depositAmount + depositFee`

### Deposit Fee Examples
| Credit Amount | Deposit Fee | Total Checkout |
|---|---|---|
| `$5.00` | `$0.80` (minimum) | **`$5.80`** |
| `$10.00` | `$0.80` (minimum) | **`$10.80`** |
| `$25.00` | `$1.38` (5.5%) | **`$26.38`** |
| `$100.00` | `$5.50` (5.5%) | **`$105.50`** |
