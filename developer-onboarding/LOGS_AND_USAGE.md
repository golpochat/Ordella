# Developer Onboarding — Logs & Usage

Monitor API traffic, webhook deliveries, usage meters, and rate limits after your integration is running. Ongoing operations companion to the [10–15 minute setup](./OVERVIEW.md).

**Related:** [Logs page](../developer-portal/pages/logs.md) · [Usage page](../developer-portal/pages/usage.md) · [usage-metrics](../developer-portal/sections/usage-metrics.md) · [logs-overview](../developer-portal/sections/logs-overview.md)

---

## Viewing API logs

The [Logs](../developer-portal/pages/logs.md) view records recent API requests associated with your organization’s keys:

| Field (typical) | Use |
|-----------------|-----|
| **Timestamp** | UTC correlation |
| **Method / path** | Which endpoint |
| **Status** | HTTP result |
| **Latency** | Performance debugging |
| **Request ID** | Support and cross-system trace |
| **Tenant ID** | Confirm correct sandbox/production |

Filter by environment, key prefix, status code, or time range (retention placeholder: **7–30 days** in portal).

**Practice:** when [FIRST_API_CALL](./FIRST_API_CALL.md) fails, find the matching row before opening a ticket—include `requestId` in [feedback](../beta-program/FEEDBACK_LOOP.md).

Do not log full API keys or customer PII in your own systems; portal masks secrets.

---

## Viewing webhook logs

Switch log type to **Webhooks** (or dedicated webhook delivery tab on [Webhooks](../developer-portal/pages/webhooks.md)):

- Delivery ID and event type  
- HTTP status returned by your server  
- Attempt number (retries)  
- Response time  
- Error snippet (truncated)

Use **Send test event** then confirm a **200** row appears. For failures, fix signature or timeout issues per [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md), then **retry** delivery if portal offers it.

Align payloads with [Event Bus](../docs/public/systems/event-bus.md) documentation.

---

## Usage metrics

[Usage](../developer-portal/pages/usage.md) and [usage-metrics](../developer-portal/sections/usage-metrics.md) show:

| Metric | Description |
|--------|-------------|
| **API calls** | Count per period per key/environment |
| **Webhook deliveries** | Successful vs failed |
| **Error rate** | 4xx/5xx share |
| **Top endpoints** | Heatmap for optimization |

Partners may see marketplace install counts (Gold+—[PARTNER_PORTAL](../partner-program/PARTNER_PORTAL.md)).

Billing-related usage ties to [billing-overview](../developer-portal/sections/billing-overview.md) and [rate limits](../docs/public/developers/rate-limits.md)—beta may use placeholder plans.

Export CSV/API for finance reconciliation (placeholder).

---

## Rate limit monitoring

Ordella enforces rate limits to protect platform stability ([rate limits doc](../docs/public/developers/rate-limits.md)).

| Signal | Meaning |
|--------|---------|
| HTTP `429` | Limit exceeded—back off |
| `Retry-After` header | Seconds to wait (when present) |
| Usage dashboard yellow state | Approaching threshold (placeholder UI) |

**Mitigations:**

- Cache read-heavy catalog data with TTL  
- Subscribe to webhooks instead of polling  
- Request limit increase for production with justification (support ticket)  
- Use separate keys per service to isolate blast radius  

Sandbox limits may be **lower** than production—do not benchmark capacity only in sandbox.

---

## Operational checklist

- [ ] Daily: scan webhook failure rate  
- [ ] Weekly: review 4xx errors for integration bugs  
- [ ] Monthly: rotate production keys per [API_KEYS.md](./API_KEYS.md)  
- [ ] Before releases: run smoke [FIRST_API_CALL](./FIRST_API_CALL.md) + test webhook  

---

## Cross-links

- [SDK overview](../docs/public/developers/sdk-overview.md)  
- [Changelog](../docs/public/changelog.md) for breaking changes  
- [Developer Portal dashboard](../developer-portal/pages/dashboard.md)
