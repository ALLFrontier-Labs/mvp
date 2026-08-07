# API Gateway Overview — LiteDaemon

The LiteDaemon Gateway routes tool requests through a unified API surface using `LITEDAEMON_MASTER_KEY`.

---

## Core Endpoints

- `POST /v1/search` — Unified Web Search (Tavily, Exa, Serper)
- `POST /v1/scrape` — Web Scraping & Extraction (Firecrawl, Jina, Apify, Spider)
- `POST /v1/browser` — Cloud Browser Sessions (Browserbase, Steel)
- `POST /v1/execute` — Code Sandbox Execution (E2B)
- `POST /v1/document` — Document Processing & Parsing
- `GET /v1/usage` — Usage statistics & call count

---

## Rate Limit Headers

Every successful gateway call returns telemetry headers:
```http
HTTP/1.1 200 OK
X-LiteDaemon-Routed-Via: tavily
X-LiteDaemon-Key-Attempts: 1
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
```

---

## Response Status Codes

| Code | Meaning | Description |
|---|---|---|
| **200 OK** | Success | Tool executed successfully |
| **401 Unauthorized** | Invalid Token | Missing or invalid `LITEDAEMON_MASTER_KEY` |
| **422 Validation Error** | Invalid Parameters | Required parameters missing |
| **429 Too Many Requests** | Rate Limit Exceeded | Exceeded tier rate limit |
| **502 Bad Gateway** | Provider Error | Upstream provider failure |
