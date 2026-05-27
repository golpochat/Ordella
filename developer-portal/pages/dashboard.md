# Dashboard

Your home base in the Ordella Developer Portal—activity, health, and shortcuts to the tools you use every day.

The dashboard summarizes API usage, integration health, and registered apps for the active tenant or sandbox. Use it to spot errors early and jump to keys, webhooks, or the sandbox without hunting through menus.

---

## Quick stats

<!-- UI placeholder: three stat cards in a row, refresh every 60s or on manual refresh -->

| Stat | Description | Placeholder value |
|------|-------------|-------------------|
| **API calls (24h)** | Total authenticated requests across all keys and apps | `—` |
| **Errors (24h)** | `4xx` + `5xx` responses and failed webhook deliveries | `—` |
| **Active apps** | OAuth / partner apps in `active` or `published` state | `—` |

**UI elements:**

- Stat card: label, large number, sparkline (optional), link to detail page
- Trend indicator: up/down vs. prior 24h (placeholder)
- Empty state: “No activity yet—create an API key or open the sandbox”

**Links:** [Usage](./usage.md) · [Logs](./logs.md) · [Public: Rate limits](../docs/public/developers/rate-limits.md)

---

## Recent logs

<!-- UI placeholder: table or list, max 10 rows, “View all” → logs page -->

| Column | Description |
|--------|-------------|
| Time | Request or event timestamp (tenant timezone) |
| Method / Event | `GET /orders` or `order.created` (webhook) |
| Status | HTTP status or delivery status |
| Source | API key name, app name, or webhook endpoint |
| Action | Link to log detail (placeholder) |

**UI elements:**

- Severity filter chips: All · Errors · Warnings
- “View all logs” button → [Logs](./logs.md)
- Empty state: “No logs in the last 24 hours”

**Section reference:** [Logs overview](../sections/logs-overview.md)

---

## Quick links

<!-- UI placeholder: four link tiles or button group -->

| Link | Route | Description |
|------|-------|-------------|
| **API keys** | `/developer/api-keys` | Create and rotate credentials |
| **Apps** | `/developer/apps` | Manage OAuth and marketplace apps |
| **Webhooks** | `/developer/webhooks` | Subscribe to domain events |
| **Sandbox** | `/developer/sandbox` | Test against isolated tenant data |

**UI elements:**

- Icon + label per tile
- Optional badge on Webhooks if failed deliveries > 0

---

## Additional sections (placeholder)

### Getting started checklist

<!-- UI placeholder: collapsible checklist, dismissible -->

- [ ] Create first API key
- [ ] Send test request to sandbox
- [ ] Register a webhook endpoint
- [ ] Review [Authentication](../docs/public/developers/authentication.md)

### Announcements

<!-- UI placeholder: banner slot for changelog / maintenance -->

Link: [Changelog](../docs/public/changelog.md)

---

## Related public documentation

- [API overview](../docs/public/developers/api-overview.md)
- [Authentication](../docs/public/developers/authentication.md)
- [Introduction for developers](../docs/public/getting-started/introduction.md)

---

## Component references

- [Sidebar](../components/sidebar.md) · [Topbar](../components/topbar.md) · [Usage chart](../components/usage-chart.md) · [Log entry](../components/log-entry.md)
