# Sandbox Overview

Isolated tenant environment for safe integration testing.

The sandbox provides production-parity API behavior without affecting live customers, payments, or inventory.

---

## What is isolated

<!-- Content section -->

- Tenant ID and credentials separate from production
- Sample catalog and orders (seed / reset placeholders)
- Webhook deliveries tagged as sandbox (placeholder)

---

## Limitations (placeholder)

| Item | Sandbox behavior |
|------|------------------|
| Payments | Test mode / no capture |
| Rate limits | Lower thresholds may apply |
| Data retention | Shorter TTL (placeholder) |

---

## Recommended workflow

1. Create sandbox API key
2. Run integration tests and webhook handlers
3. Promote to production keys after checklist
4. Submit partner app for review if applicable

**Public docs:** [API overview](../docs/public/developers/api-overview.md) · [POS guide](../docs/public/guides/pos-integration.md)

---

## UI binding

- Page: [Sandbox](../pages/sandbox.md)
