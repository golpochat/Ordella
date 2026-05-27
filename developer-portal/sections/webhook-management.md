# Webhook Management

Configure endpoints, verify signatures, handle retries, and monitor deliveries.

Ordella webhooks deliver [Event Bus](../docs/public/systems/event-bus.md) messages to your HTTPS endpoints with signed payloads and retry semantics.

---

## Subscription model

<!-- Content section -->

- **Endpoint** — Single HTTPS URL per configuration
- **Topics** — One or more event types (e.g. `order.created`)
- **Secret** — Used to verify `X-Ordella-Signature` (placeholder header name)

---

## Delivery behavior (placeholder)

| Behavior | Description |
|----------|-------------|
| Retries | Exponential backoff on `5xx` / timeout |
| Timeout | 30s default (placeholder) |
| Idempotency | Event ID deduplication on consumer side |

---

## Testing

<!-- Content section -->

- **Send test event** from portal UI
- Validate signature in your handler before processing

**Public docs:** [Webhooks](../docs/public/developers/webhooks.md) · [Event flow](../docs/public/architecture/event-flow.md)

---

## UI binding

- Page: [Webhooks](../pages/webhooks.md)
- Component: [Webhook card](../components/webhook-card.md)
