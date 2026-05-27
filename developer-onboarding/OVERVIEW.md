# Ordella Developer Onboarding — Overview

A guided path for integrators to go from **zero** to a **working sandbox integration**—API key, first request, webhook delivery, and optional app registration—in about **10–15 minutes** of focused setup (excluding optional partner or marketplace steps).

**Related:** [Developer Portal README](../developer-portal/README.md) · [Public API overview](../docs/public/developers/api-overview.md) · [Brand voice](../brand/VOICE_AND_TONE.md) · [Beta onboarding](../beta-program/ONBOARDING_FLOW.md#developers)

---

## Purpose of the onboarding flow

Retail integrations fail when credentials, tenancy, and events are unclear. This onboarding flow standardizes how developers **enter Ordella correctly**: verified account, sandbox isolation, least-privilege keys, and verified webhooks before production promotion.

The flow mirrors what the [Developer Portal](../developer-portal/pages/dashboard.md) implements—documentation here is the **canonical checklist** for humans and for support. It complements long-form guides on [docs.ordella.com](https://docs.ordella.com) without replacing [API reference](../docs/public/api-reference.md) or channel guides ([POS](../docs/public/guides/pos-integration.md), [storefront](../docs/public/guides/storefront-integration.md)).

Honesty matters: preview endpoints and modules are labeled in [changelog](../docs/public/changelog.md); do not build on undocumented URLs.

---

## Who it is for

| Audience | Use this flow when |
|----------|-------------------|
| **Independent developers** | Building a custom connector or internal tool |
| **Retailer IT teams** | Connecting POS, ecommerce, or data warehouse |
| **Partner ISVs** | Starting marketplace app work—also see [partner onboarding](../partner-program/ONBOARDING.md) |
| **Agencies / SIs** | Implementing Ordella for a client tenant |

You need a **work email**, server or cloud environment for secrets, and HTTPS endpoint for webhooks (local tunnel acceptable for development). Client-side-only apps must use **OAuth** ([APP_CREATION.md](./APP_CREATION.md)), not embedded API keys.

---

## What developers will accomplish

By completing the core path (files 1–7), you will:

1. Create and secure an Ordella developer account ([ACCOUNT_CREATION.md](./ACCOUNT_CREATION.md))  
2. Provision a **sandbox tenant** and **API keys** ([SANDBOX_SETUP.md](./SANDBOX_SETUP.md), [API_KEYS.md](./API_KEYS.md))  
3. Execute a **first successful API call** ([FIRST_API_CALL.md](./FIRST_API_CALL.md))  
4. Register and verify a **webhook** with signature validation ([WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md))  
5. Optionally create an **OAuth app** for multi-tenant installs ([APP_CREATION.md](./APP_CREATION.md))  
6. Monitor **logs and usage** ([LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md))  

Optional extensions:

- **App publishing** for partners ([APP_PUBLISHING.md](./APP_PUBLISHING.md))  
- **Language quickstarts** ([QUICKSTART_GUIDES.md](./QUICKSTART_GUIDES.md))  

---

## Expected time to complete

| Track | Steps | Time (estimate) |
|-------|-------|-----------------|
| **Core** | Account → sandbox → key → first call → webhook | **10–15 minutes** |
| **+ OAuth app** | App creation + test install | +15–30 minutes |
| **+ Partner publish** | Certification + listing | Days–weeks (outside quickstart) |

Times assume docs and portal are reachable; webhook tunnel setup may add a few minutes on first attempt.

---

## Document map

| Step | File |
|------|------|
| 1 | [ACCOUNT_CREATION.md](./ACCOUNT_CREATION.md) |
| 2 | [SANDBOX_SETUP.md](./SANDBOX_SETUP.md) |
| 3 | [API_KEYS.md](./API_KEYS.md) |
| 4 | [FIRST_API_CALL.md](./FIRST_API_CALL.md) |
| 5 | [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) |
| 6 | [APP_CREATION.md](./APP_CREATION.md) (optional) |
| 7 | [APP_PUBLISHING.md](./APP_PUBLISHING.md) (partners) |
| 8 | [LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md) |
| — | [QUICKSTART_GUIDES.md](./QUICKSTART_GUIDES.md) |

**Support:** [Rate limits](../docs/public/developers/rate-limits.md) · [Authentication](../docs/public/developers/authentication.md) · [SDK overview](../docs/public/developers/sdk-overview.md)
