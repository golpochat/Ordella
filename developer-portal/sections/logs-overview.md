# Logs Overview

What the Developer Portal logs capture and how to use them for debugging.

Logs aggregate API gateway traffic, OAuth errors, and webhook delivery attempts for the active organization.

---

## Log types

<!-- Content section -->

| Type | Contains |
|------|----------|
| **API** | Method, path, status, latency, key ID |
| **Webhook** | Event type, endpoint, delivery status, attempts |
| **OAuth** | Authorize, token exchange, consent errors |

---

## Retention (placeholder)

- Default retention: 7–30 days by plan (placeholder)
- Export: CSV download (placeholder feature flag)

---

## Privacy & redaction

<!-- Content section -->

- Secrets and full card data never stored in logs
- PII may be masked per tenant policy — see [GDPR](../docs/public/compliance/gdpr.md)

---

## UI binding

- Page: [Logs](../pages/logs.md)
- Component: [Log entry](../components/log-entry.md)
