# Usage Metrics

Definitions for API volume, quotas, and charts in the Developer Portal.

Usage metrics align billing and fair-use policies with observable traffic from keys and apps.

---

## Metric definitions

<!-- Content section -->

| Metric | Definition |
|--------|------------|
| **API call** | One authenticated HTTP request to `/api/v1/*` |
| **Webhook delivery** | One HTTP POST attempt to a registered endpoint |
| **Error** | `4xx`/`5xx` API response or failed webhook after retries |

---

## Dimensions

- By API key, app, time bucket, route prefix (placeholders)
- Aggregated at organization level for billing

---

## Quotas

<!-- Content section: link to rate limits -->

Portal displays quota consumption vs plan limits. Hard enforcement details: [Rate limits](../docs/public/developers/rate-limits.md).

---

## UI binding

- Page: [Usage](../pages/usage.md)
- Component: [Usage chart](../components/usage-chart.md)
