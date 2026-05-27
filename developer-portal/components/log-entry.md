# Log Entry Component

Single row in the log stream on [Logs](../pages/logs.md) and [Dashboard](../pages/dashboard.md).

---

## Purpose

Dense, scannable record of one API request or webhook delivery with status emphasis on errors.

---

## Layout (placeholder)

<!-- UI placeholder: table row or list item -->

| Zone | Content |
|------|---------|
| Time | `14:32:01` relative or absolute |
| Type badge | `API` · `Webhook` · `OAuth` |
| Summary | `POST /v1/orders` or `order.created → endpoint` |
| Status | `200` green · `401` amber · `500` red |
| Source | Key or app name |
| Chevron | Opens detail drawer |

---

## Props / data (placeholder)

| Field | Type |
|-------|------|
| `id` | string |
| `timestamp` | datetime |
| `type` | `api` \| `webhook` \| `oauth` |
| `summary` | string |
| `statusCode` | number |
| `sourceName` | string |
| `isError` | boolean |

---

## Interaction

- Click row → detail drawer (headers, body redacted)
- Shift+click multi-select (placeholder) for export

**Section reference:** [Logs overview](../sections/logs-overview.md)
