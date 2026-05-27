# Ordella Developer Portal

Content structure for the Ordella Developer Portal—the authenticated workspace where integrators and partners build, test, ship, and operate on the Ordella platform.

**Public reference:** [docs.ordella.com](../docs/public/index.md) · **API:** `https://api.ordella.com/v1`

---

## Overview

The Developer Portal is the control plane for everything outside the core Admin UI that builders need: API keys, webhooks, OAuth apps, sandbox tenants, logs, usage, and billing. It sits alongside the [Partner program](../docs/public/partners/partner-program.md) and connects to the same multi-tenant API and [Event Bus](../docs/public/systems/event-bus.md) that power retail operations.

This folder defines **page copy, section reference material, and component specifications**—not implemented UI. Product and engineering teams use these files to align routes, layouts, and documentation links before frontend implementation.

---

## How developers use it

Typical integrator journey:

1. **Sign in** with an Ordella account tied to a tenant (or sandbox).
2. **Create API keys** with least-privilege scopes for server-side integrations.
3. **Register webhooks** to receive domain events instead of polling.
4. **Build and test** against the **sandbox** environment with sample data.
5. **Monitor** logs, errors, and **usage** during development and production.
6. **Manage billing** when usage-based or plan limits apply.

Entry points: [Dashboard](./pages/dashboard.md), [API keys](./pages/api-keys.md), [Webhooks](./pages/webhooks.md), [Sandbox](./pages/sandbox.md).

Deep dives live under [`sections/`](./sections/) (OAuth, app lifecycle, metrics, etc.).

---

## How partners use it

Partners extend the portal with marketplace-specific flows:

- **Partner onboarding** — application, capabilities, certification ([partner onboarding page](./pages/partner-onboarding.md), [Partner tools section](./sections/partner-tools.md)).
- **Apps** — create, configure, publish listings ([Apps](./pages/apps.md), [App publishing](./pages/app-publishing.md)).
- **Revenue and compliance** — tied to [Partner API](../docs/public/partners/partner-api.md) and [Revenue share](../docs/public/partners/revenue-share.md) (public docs).

Partners use the same API keys, webhooks, and sandbox tools as direct integrators, plus partner-scoped routes documented in public partner guides.

---

## How it integrates with the Ordella ecosystem

| Surface | Role |
|---------|------|
| **Ordella API** | All portal actions call `/api/v1` (keys, apps, webhooks, usage) — see [API overview](../docs/public/developers/api-overview.md) |
| **Event Bus** | Webhook subscriptions deliver canonical events — see [Webhooks](../docs/public/developers/webhooks.md) |
| **Admin UI** | Retail operators configure catalog, stores, and policies; developers consume those domains via API |
| **App Store / Marketplace** | Published partner apps install per tenant — see [Partner integration guide](../docs/public/guides/partner-integration.md) |
| **Public docs** | `docs/public` is the external contract; portal pages link out for authentication, rate limits, and guides |
| **Compliance** | Enterprise tenants enforce SSO, residency, and audit — see [Security architecture](../docs/public/architecture/security-architecture.md) |

---

## Folder layout

| Path | Purpose |
|------|---------|
| [`pages/`](./pages/) | Route-level screens (dashboard, keys, apps, billing, …) |
| [`sections/`](./sections/) | Reusable reference blocks and deep-dive copy for each domain |
| [`components/`](./components/) | UI component specs (sidebar, cards, charts, tables) |

---

## Recommended reading order

1. [Dashboard](./pages/dashboard.md)
2. [API keys](./pages/api-keys.md) + [API key management](./sections/api-key-management.md)
3. [Webhooks](./pages/webhooks.md) + [Webhook management](./sections/webhook-management.md)
4. [Sandbox](./pages/sandbox.md)
5. [Apps](./pages/apps.md) + [App lifecycle](./sections/app-lifecycle.md) (partners)

---

*Structure version 1.0 · Content-only; no frontend implementation in this folder.*
