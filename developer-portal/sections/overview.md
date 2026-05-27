# Developer Portal Overview

Reference copy for the portal landing experience and onboarding tooltips.

The Ordella Developer Portal is the authenticated workspace for API keys, webhooks, OAuth apps, sandbox testing, observability, and partner marketplace operations. It complements [public developer documentation](../docs/public/developers/api-overview.md) with tenant-specific configuration and live telemetry.

---

## Who uses the portal

| Persona | Primary tasks |
|---------|-----------------|
| **Integrator** | Keys, webhooks, sandbox, logs |
| **Partner** | Apps, publishing, onboarding, payouts |
| **Org admin** | Members, billing, account security |

---

## Core concepts

<!-- Content section: expandable help panels -->

- **Tenant context** — All resources scoped via `X-Tenant-Id` (see [Authentication](../docs/public/developers/authentication.md))
- **Environments** — Sandbox vs production credentials and data isolation
- **Apps vs API keys** — User-delegated OAuth vs machine-to-machine access

---

## Portal ↔ platform map

| Portal area | Platform module |
|-------------|-----------------|
| Webhooks | [Event Bus](../docs/public/systems/event-bus.md) |
| Usage | API gateway metrics (placeholder) |
| Apps | Partner Network / App Store (placeholder) |
| Sandbox | Tenant provisioning (placeholder) |

---

## Related pages

- [Dashboard](../pages/dashboard.md) · [README](../README.md)
