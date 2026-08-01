# Vault Key Encryption & BYOK Routing — LiteDaemon

LiteDaemon allows developers to vault their third-party provider API keys (Tavily, Exa, E2B, Firecrawl, etc.) and route requests seamlessly with automatic key rotation and zero persistence.

---

## Key Vault Architecture

- **Encryption**: AES-256-GCM authenticated encryption at rest.
- **In-Memory Decryption**: Provider keys are decrypted in isolated process RAM strictly during HTTP request execution.
- **Zero Disk Storage**: Plaintext keys never touch disk or log storage.
- **Multi-Key Priority & Fallback**: Vault multiple keys per provider with priority ranking for automatic failover.
