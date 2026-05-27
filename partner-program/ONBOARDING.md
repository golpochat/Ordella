# Ordella Partner Program — Onboarding

End-to-end onboarding for new partners: legal, technical setup, portal access, sandbox, and first integration milestones. Typical **Registered → Silver** timeline: **30–60 days** with dedicated partner manager (Gold+ faster track available).

**Related:** [Public partner onboarding](../docs/public/partners/partner-onboarding.md) · [Beta partner track](../beta-program/ONBOARDING.md#partners) · [Certification](./CERTIFICATION.md) · [Program overview](./PROGRAM_OVERVIEW.md)

---

## Onboarding steps (overview)

| Step | Owner | Output |
|------|-------|--------|
| 1. Application & acceptance | Partner + Ordella | Signed agreement, tier assignment (Registered) |
| 2. Portal provisioning | Ordella | Org + partner portal roles |
| 3. Training & certification plan | Partner | Path selected (developer / integrator / consultant) |
| 4. Sandbox & technical setup | Partner | API keys, webhooks, OAuth app (if applicable) |
| 5. Security & compliance | Partner + Ordella | Questionnaire, DPA, review |
| 6. First integration milestone | Partner | Checklist complete |
| 7. Certification exam & review | Partner + Ordella | Silver certified |
| 8. Go-live | Partner | Marketplace listing / directory / first customer |

Detailed tasks below.

---

## Step 1 — Application and legal

Submit application via `<!-- partners@ordella.com -->` or website `/partners` ([website copy](../website/copy/partners.md)). Provide company profile, integration description, and customer references (if any).

Execute:

- Partner Agreement (baseline)  
- NDA (if roadmap or preview access requested)  
- DPA for processing retailer personal data ([GDPR overview](../docs/public/compliance/gdpr.md))  

Ordella assigns **partner manager** (Silver+) or onboarding queue (Registered).

---

## Step 2 — Developer portal access

Partners use the **Ordella Developer Portal** ([README](../developer-portal/README.md)) with partner-scoped roles:

| Role | Access |
|------|--------|
| **Partner admin** | Users, billing, deal registration (Gold+) |
| **Partner developer** | Keys, webhooks, apps, sandbox |
| **Partner marketing** | Listing assets, co-marketing requests |

Entry: [Dashboard](../developer-portal/pages/dashboard.md) · Partner-specific flows on [Partner onboarding page](../developer-portal/pages/partner-onboarding.md) · [Partner tools](../developer-portal/sections/partner-tools.md).

---

## Technical requirements

Before production or listing, partners must meet:

- **HTTPS** webhook endpoints with valid TLS  
- **Server-side** storage of secrets—no API keys in client apps ([Authentication](../docs/public/developers/authentication.md))  
- **Tenant scoping** on every API call (`X-Tenant-Id`)  
- **Webhook signature verification** before processing payloads ([Webhooks](../docs/public/developers/webhooks.md))  
- **Idempotent** event handlers  
- **OAuth** redirect URI allowlist and least-privilege scopes ([oauth-overview](../developer-portal/sections/oauth-overview.md))  
- Documented **support URL** and **privacy policy** for marketplace listings  
- Compliance with Ordella security questionnaire ([Security architecture](../docs/public/architecture/security-architecture.md))

---

## Sandbox setup

Follow [sandbox-overview](../developer-portal/sections/sandbox-overview.md):

1. Open [Sandbox](../developer-portal/pages/sandbox.md) — provision isolated tenant.  
2. Create sandbox API keys on [API keys](../developer-portal/pages/api-keys.md) ([api-key-management](../developer-portal/sections/api-key-management.md)).  
3. Register webhooks on [Webhooks](../developer-portal/pages/webhooks.md); verify in [Logs](../developer-portal/pages/logs.md).  
4. For ISVs: [Create app](../developer-portal/pages/app-create.md) → [App settings](../developer-portal/pages/app-settings.md) → test install on sandbox tenant.  

Limitations: test payments, possibly lower [rate limits](../docs/public/developers/rate-limits.md), shorter data retention—documented in portal.

---

## First integration tasks

Complete per certification path ([CERTIFICATION.md](./CERTIFICATION.md)):

### Developer path

| # | Task | Verification |
|---|------|--------------|
| 1 | `GET` catalog or inventory successfully | Log in portal usage |
| 2 | Create sandbox order or equivalent write | Event in logs |
| 3 | Receive webhook with valid signature | Handler returns 2xx |
| 4 | OAuth install/uninstall flow on test tenant | Screen recording or checklist |
| 5 | Submit [app publishing](../developer-portal/pages/app-publishing.md) draft | PM review queue |

### Integrator path

| # | Task | Verification |
|---|------|--------------|
| 1 | Map retailer channels (POS/storefront) per guides | Architecture doc |
| 2 | Sync catalog + inventory baseline | Customer sign-off |
| 3 | Validate pricing/promotion rules in pilot | Test cases |
| 4 | Event Bus subscription for downstream system | Webhook or poll alternative documented |

### Consultant path

| # | Task | Verification |
|---|------|--------------|
| 1 | Complete pilot charter template | Ordella CS review |
| 2 | Train retailer admin on tenant/location model | Session attendance |
| 3 | Document governance for preview modules (if used) | Signed customer ack |

---

## Go-live checklist

- [ ] Silver certification exam passed  
- [ ] Security review approved  
- [ ] Production keys promoted (when eligible)  
- [ ] Marketplace listing approved OR directory profile live  
- [ ] Support runbook and SLA acknowledged ([SUPPORT_AND_SLAS.md](./SUPPORT_AND_SLAS.md))  
- [ ] Revenue share banking/tax profile in portal ([REVENUE_SHARE.md](./REVENUE_SHARE.md))  

**Public checklist mirror:** [Partner onboarding doc](../docs/public/partners/partner-onboarding.md) (expand over time).

---

## Cross-links

- [Partner API](../docs/public/partners/partner-api.md)  
- [Partner integration guide](../docs/public/guides/partner-integration.md)  
- [Partner portal features](./PARTNER_PORTAL.md)
