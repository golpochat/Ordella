# Webhooks

Register endpoints, choose event types, and monitor delivery health for real-time Ordella events.

Webhooks push [Event Bus](../docs/public/systems/event-bus.md) notifications to your HTTPS endpoints so integrations react without polling.

---

## Page sections

### Endpoint list

<!-- UI placeholder: card grid or table -->

| Column | Description |
|--------|-------------|
| URL | HTTPS endpoint (masked query params) |
| Events | Subscribed topics count |
| Status | Active · Paused · Failing |
| Success rate | Last 24h delivery % |

**Actions:** Add endpoint · Edit · Pause · Delete · Send test event

### Add / edit endpoint

<!-- UI placeholder: form drawer -->

- URL, signing secret, event topic multi-select, retry policy (read-only defaults + link to docs)

### Delivery log (inline)

<!-- UI placeholder: last 5 deliveries for selected endpoint -->

Link to full [Logs](./logs.md) page.

### Empty state

<!-- UI placeholder: “Subscribe to your first event” + link to event catalog docs -->

---

## Related public documentation

- [Webhooks](../docs/public/developers/webhooks.md)
- [Event flow](../docs/public/architecture/event-flow.md)
- [Event Bus](../docs/public/systems/event-bus.md)

---

## Section & component references

- [Webhook management](../sections/webhook-management.md)
- [Webhook card](../components/webhook-card.md)
