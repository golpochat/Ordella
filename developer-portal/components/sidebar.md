# Sidebar Component

Primary navigation for the Developer Portal layout.

---

## Purpose

Persistent left navigation across all portal pages. Highlights active route and collapses on narrow viewports.

---

## Structure (placeholder)

<!-- UI placeholder: nav tree -->

| Item | Route | Icon placeholder |
|------|-------|------------------|
| Dashboard | `/developer` | home |
| API keys | `/developer/api-keys` | key |
| Webhooks | `/developer/webhooks` | webhook |
| Apps | `/developer/apps` | grid |
| Sandbox | `/developer/sandbox` | flask |
| Logs | `/developer/logs` | list |
| Usage | `/developer/usage` | chart |
| Billing | `/developer/billing` | credit-card |
| Partner onboarding | `/developer/partner` | handshake (conditional) |
| Account | `/developer/settings` | user |

**Footer slot:** link to [Public docs](../docs/public/index.md) (external)

---

## Behavior

- Active state from current route
- Partner-only items hidden unless `organization.type === partner` (placeholder)
- Collapse to icons below `md` breakpoint (placeholder)

---

## Content dependencies

- [README](../README.md) · [Overview section](../sections/overview.md)
