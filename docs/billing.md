# Billing Engine Specification — LiteDaemon

This document specifies the exact micro-billing mathematics, monthly period reset rules, auto-charge triggers, and HTTP status codes for the LiteDaemon AI Tool Gateway.

---

## 1. Free Tier Rule
Every LiteDaemon account receives **100 free API calls per billing month** across all integrated tools (Tavily, Exa, E2B, Firecrawl, Serper, Browserbase, etc.).

- Tracked by: `monthly_call_count` (integer) and `billing_period_start` (timestamp).
- Calls 1 through 100 incur `$0.000000` final user charge (`isFree = true`).

---

## 2. Monthly Auto-Reset
Free monthly call counters automatically reset to 0 every 30 days from the start of the user's billing period.

- Reset evaluation occurs atomically on every API request.
- When `now >= billing_period_start + 30 days`, the system sets `monthly_call_count = 0` and updates `billing_period_start = now`.

---

## 3. Paid Tier Calculation (Call 101+)
Starting on call 101, usage is billed on a transparent **Bring-Your-Own-Key / Provider-Pass-Through + 5% markup** model:

$$\text{Final Charge} = \text{Raw Provider Charge} \times 1.05$$

### Precision Rules
- Internal precision: 6 decimal places (`0.000000`).
- Ledger display precision: 4 decimal places (`0.0000`).

### Price Examples
| Tool Provider | Wholesale Raw Cost | 5% Gateway Markup | Final Billed Charge |
|---|---|---|---|
| Tavily Search | `$0.010000` | `$0.000500` | **`$0.010500`** |
| Exa AI | `$0.002000` | `$0.000100` | **`$0.002100`** |
| Firecrawl Scrape | `$0.003000` | `$0.000150` | **`$0.003150`** |
| E2B Sandbox | `$0.003000` | `$0.000150` | **`$0.003150`** |

---

## 4. Pre-Call Balance Check & HTTP 402 Rejection
API requests beyond 100 calls require an active balance or attached payment method. Requests with insufficient funds return an **HTTP 402 ("Payment Required / Insufficient Balance")** error prior to provider invocation.

### Error Payload Format (HTTP 402)
```json
{
  "error": "Insufficient Balance",
  "message": "Every LiteDaemon account receives 100 free API calls per billing month across all integrated tools. Requests beyond 100 calls require an active balance. Requests with insufficient funds return HTTP 402 prior to provider invocation.",
  "byok_requests_this_month": 101,
  "required_balance": 0.0105,
  "current_balance": 0.0000
}
```
