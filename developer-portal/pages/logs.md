# Logs

Search and inspect API requests, webhook deliveries, and integration errors.

Logs help debug auth failures, validation errors, and webhook retries across keys, apps, and endpoints.

---

## Page sections

### Filters

<!-- UI placeholder: filter bar -->

| Filter | Options |
|--------|---------|
| Time range | Last 1h · 24h · 7d · Custom |
| Type | API · Webhook · OAuth |
| Status | All · Success · Error |
| Source | API key, app, webhook (dropdowns) |

### Log stream

<!-- UI placeholder: virtualized table or infinite scroll -->

Uses [Log entry](../components/log-entry.md) row pattern.

### Log detail drawer

<!-- UI placeholder: request/response headers and body (redacted secrets) -->

- Request ID, latency, tenant ID (if permitted)

### Export

<!-- UI placeholder: “Export CSV” button (placeholder, disabled until implemented) -->

---

## Related public documentation

- [Webhooks](../docs/public/developers/webhooks.md)
- [Rate limits](../docs/public/developers/rate-limits.md)

---

## Section reference

- [Logs overview](../sections/logs-overview.md)
