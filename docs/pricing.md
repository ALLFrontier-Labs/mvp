# Transparent Pricing Model — LiteDaemon

LiteDaemon operates on a 100% transparent BYOK + 5% gateway fee model with zero hidden monthly subscription fees.

---

## Key Principles

1. **Every LiteDaemon account receives 100 free API calls per billing month across all integrated tools.**
2. **Free monthly call counters automatically reset to 0 every 30 days from the start of the user's billing period.**
3. **Starting on call 101, a 5% gateway fee is applied to each tool call: `Gateway Fee = Provider Base Price × 0.05`.**
4. **API requests beyond 100 calls require an active wallet balance. Requests with insufficient funds return an HTTP 402 error prior to provider invocation.**

---

## How Billing Works (BYOK Model)

Since LiteDaemon is a **Bring-Your-Own-Key (BYOK)** gateway, users authenticate directly with upstream providers using their own API keys. The raw provider cost is billed directly by the provider to the user's own account.

**LiteDaemon's fee is only the 5% gateway routing markup**, not the full provider cost.

### Gateway Fee Examples
| Tool Provider | Provider Base Price | LiteDaemon 5% Fee | You Pay LiteDaemon |
|---|---|---|---|
| Tavily Search | `$0.0010` | `$0.00005` | **`$0.00005`** |
| Exa AI | `$0.0020` | `$0.00010` | **`$0.00010`** |
| Firecrawl Scrape | `$0.0030` | `$0.00015` | **`$0.00015`** |
| E2B Sandbox | `$0.0080` | `$0.00040` | **`$0.00040`** |
| Browserbase | `$0.0150` | `$0.00075` | **`$0.00075`** |

---

## Minimum Top-Up & Wallet Deposits
- **Minimum Deposit**: `$5.00 USD` via Dodo Payments.
- **Deposit Fee**: 5.5% platform fee (minimum $0.80) per deposit.
- **Expiry**: Wallet credits never expire.
- **Refund Policy**: Balances are available for all provider tool executions.
