# Ordella Partner Portal — Overview

The **Partner Portal** is the operational workspace for Ordella partners—implemented as extensions to the [Developer Portal](../developer-portal/README.md) plus partner-specific routes documented in `developer-portal/pages/` and `developer-portal/sections/partner-tools.md`. This document describes features and workflows; **no UI code** lives in `/partner-program`.

**Related:** [Onboarding](./ONBOARDING.md) · [Partner tools map](../developer-portal/sections/partner-tools.md) · [Public Partner API](../docs/public/partners/partner-api.md)

---

## Portal purpose

Partners need one place to **build, certify, publish, sell, and measure** on Ordella. The portal unifies developer primitives (keys, webhooks, sandbox) with commercial motions (deal registration, revenue statements, training). Access is **role-based** by tier ([PARTNER_TIERS.md](./PARTNER_TIERS.md)).

**Entry URL (placeholder):** `https://developers.ordella.com` or dedicated `https://partners.ordella.com` — confirm at launch.

Public how-to remains on [docs.ordella.com](https://docs.ordella.com); the portal is for authenticated partner orgs.

---

## Feature overview

| Area | Capability | Primary doc / page |
|------|------------|-------------------|
| **Dashboard** | Onboarding progress, cert status, open tasks | [dashboard](../developer-portal/pages/dashboard.md) |
| **API keys** | Sandbox + production keys, rotation | [api-keys](../developer-portal/pages/api-keys.md) |
| **Webhooks** | Endpoints, secrets, delivery logs | [webhooks](../developer-portal/pages/webhooks.md) |
| **Sandbox** | Tenant isolation, reset, limits | [sandbox](../developer-portal/pages/sandbox.md) |
| **Apps** | OAuth apps, installs | [apps](../developer-portal/pages/apps.md) |
| **Partner onboarding** | Stepper, legal, questionnaire | [partner-onboarding](../developer-portal/pages/partner-onboarding.md) |
| **App publishing** | Marketplace listing workflow | [app-publishing](../developer-portal/pages/app-publishing.md) |
| **Deal registration** | Lead attribution, protection window | [LEAD_DISTRIBUTION.md](./LEAD_DISTRIBUTION.md) |
| **Billing / payouts** | Statements, revenue share | [billing](../developer-portal/pages/billing.md) · [billing-overview](../developer-portal/sections/billing-overview.md) |
| **Usage & logs** | API metrics, debugging | [usage](../developer-portal/pages/usage.md) · [logs](../developer-portal/pages/logs.md) |
| **Training** | Modules, exam enrollment | [CERTIFICATION.md](./CERTIFICATION.md) |
| **Co-marketing** | Requests, asset downloads | [CO_MARKETING.md](./CO_MARKETING.md) |
| **Analytics** | Installs, active tenants, lead funnel | Gold+ (placeholder widgets) |

---

## App publishing

ISV partners publish through:

1. [App create](../developer-portal/pages/app-create.md) — register app, scopes, redirect URIs.  
2. [App settings](../developer-portal/pages/app-settings.md) — branding, support links, capabilities.  
3. Sandbox certification tests (webhook + OAuth checklist).  
4. [App publishing](../developer-portal/pages/app-publishing.md) — submit listing copy, screenshots ([SCREENSHOTS](../press-kit/SCREENSHOTS.md) guidelines).  
5. Ordella review → approved → marketplace live.

Listing updates require re-approval for security-impacting scope changes. Version notes visible to retailers via [changelog](../docs/public/changelog.md) integration (placeholder).

**Docs:** [Partner integration guide](../docs/public/guides/partner-integration.md) · [app-lifecycle](../developer-portal/sections/app-lifecycle.md)

---

## Deal registration

**Gold+** partners register opportunities for co-sell attach and lead protection ([LEAD_DISTRIBUTION.md](./LEAD_DISTRIBUTION.md)).

**Fields (placeholder):** retailer name, region, estimated ARR, modules, partner role, competing SI (if known), expected close date.

**Workflow:** submit → deal desk validation (2 business days) → approved / needs info / declined → protection timer starts.

Partners update stage through **Closed won/lost** for commission eligibility and scorecard.

---

## Training access

Training home links to modules in [CERTIFICATION.md](./CERTIFICATION.md):

- Progress tracking per user  
- Exam scheduling (placeholder integration)  
- Certificate download on pass  
- Renewal reminders 30 days before expiry  

Consultants may skip OAuth labs; developers must complete `ORD-301` before publishing.

---

## Analytics (placeholder)

Partner analytics dashboards (tier-gated):

| Widget | Silver | Gold | Platinum |
|--------|--------|------|----------|
| Marketplace installs (30d) | ✓ | ✓ | ✓ |
| Active tenants | ✓ | ✓ | ✓ |
| API error rate (app) | ✓ | ✓ | ✓ |
| Revenue share MTD | ✓ | ✓ | ✓ |
| Lead funnel | — | ✓ | ✓ |
| Benchmark vs program avg | — | — | ✓ |

Data sourced from usage metering ([usage-metrics](../developer-portal/sections/usage-metrics.md)) and billing systems—24h delay acceptable for beta.

---

## Support from the portal

Open tickets linked to [SUPPORT_AND_SLAS.md](./SUPPORT_AND_SLAS.md); P0 button escalates per tier. Status page link in footer (placeholder).

---

## Relationship to beta program

Beta partners may have **early portal features** flagged Preview—see [beta ONBOARDING](../beta-program/ONBOARDING.md#partners). Features graduate to GA in partner program changelog (align with [public changelog](../docs/public/changelog.md)).

---

## Cross-links

- [Revenue share](./REVENUE_SHARE.md)  
- [Support SLAs](./SUPPORT_AND_SLAS.md)  
- [Website developers](../website/copy/developers.md) — retailer-facing developer story  
- [MASTER_INDEX](../docs/MASTER_INDEX.md)
