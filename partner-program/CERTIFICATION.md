# Ordella Partner Program — Certification

Certification paths, training, exams (placeholder), and renewal rules for partners. Certification **gates tier benefits** ([PARTNER_TIERS.md](./PARTNER_TIERS.md)) and marketplace listing.

**Related:** [Onboarding](./ONBOARDING.md) · [Public partner onboarding](../docs/public/partners/partner-onboarding.md) · [Partner integration guide](../docs/public/guides/partner-integration.md)

---

## Certification paths

Partners pursue one primary path; secondary badges optional.

### Developer (ISV / app builder)

For partners shipping **OAuth apps** or deep API integrations to the marketplace.

**Focus:** API design, webhooks, tenant scoping, app lifecycle, security baselines.  
**Outcome:** Silver **Developer Certified** — required for marketplace app listing.  
**Doc anchor:** [Partner API](../docs/public/partners/partner-api.md) · [app-lifecycle](../developer-portal/sections/app-lifecycle.md)

### Integrator (SI / implementation)

For partners deploying Ordella for retailers—POS, storefront, data migration, multi-location rollout.

**Focus:** [POS](../docs/public/guides/pos-integration.md), [storefront](../docs/public/guides/storefront-integration.md), [mobile](../docs/public/guides/mobile-app-integration.md), operations modules, cutover planning.  
**Outcome:** Silver **Integrator Certified** — required for SI co-sell listing; marketplace optional.  

### Consultant (advisory)

For partners leading process, org change, and module configuration without primary code ownership.

**Focus:** tenant model, pricing/promotions policy, pilot governance, training retailers.  
**Outcome:** Silver **Consultant Certified** — directory listing; no OAuth app required.  

**Gold** certifications add advanced modules (autonomy preview, Genome, enterprise SSO) per path—placeholder module list below.

---

## Exam structure (placeholder)

Exams validate knowledge and **cannot be substituted** by sales interviews alone.

| Element | Detail |
|---------|--------|
| **Format** | Online proctored or honor-system quiz (placeholder)—60–90 minutes |
| **Passing score** | 80% overall; 100% on security/tenancy section |
| **Attempts** | 2 included; retake fee after (placeholder) |
| **Languages** | English initial |

**Silver exam sections (example):**

1. Platform fundamentals — tenant, location, Event Bus ([How Ordella works](../docs/public/getting-started/how-ordella-works.md))  
2. Authentication — JWT, API keys, `X-Tenant-Id` ([Authentication](../docs/public/developers/authentication.md))  
3. Webhooks — signatures, retries, idempotency ([Webhooks](../docs/public/developers/webhooks.md))  
4. Security & compliance — data handling, GDPR overview ([GDPR](../docs/public/compliance/gdpr.md))  
5. Path-specific — OAuth/scopes (developer) OR cutover checklist (integrator) OR governance (consultant)  

**Gold exam (placeholder):** adds orchestration, digital twins overview, deal registration ethics, support SLA obligations.

Exam items bank maintained by Partner Enablement—refresh quarterly.

---

## Training modules (placeholder)

Self-paced modules in **Partner portal** ([PARTNER_PORTAL.md](./PARTNER_PORTAL.md))—completion tracked before exam unlock.

| Module ID | Title | Duration (est.) |
|-----------|-------|-----------------|
| `ORD-101` | Retail OS fundamentals | 2 h |
| `ORD-201` | APIs & Event Bus deep dive | 3 h |
| `ORD-202` | Webhooks in production | 1.5 h |
| `ORD-301` | OAuth apps & marketplace | 2 h |
| `ORD-302` | POS & storefront integration | 2.5 h |
| `ORD-401` | Security questionnaire prep | 1 h |
| `ORD-501` | Gold: co-sell & customer success | 1.5 h |

Labs: sandbox exercises linked in [ONBOARDING.md](./ONBOARDING.md). Live **partner bootcamp** (quarterly webinar) supplements async modules.

---

## Technical certification review (non-exam)

Beyond quizzes, **Silver app certification** requires:

- Security questionnaire and DPA execution  
- Ordella review of sandbox → production promotion checklist  
- Webhook reliability evidence (30 days or accelerated beta review)  
- Listing QA ([app-publishing](../developer-portal/pages/app-publishing.md))  

Failed review → remediation plan; 60-day re-submit window.

---

## Renewal rules

| Rule | Detail |
|------|--------|
| **Cycle** | Annual anniversary of certification date |
| **Renewal** | Pass delta exam (30 min) OR complete refresher modules `ORD-1xx` updates |
| **Grace** | 30 days post-expiry—tier benefits suspended; listing hidden |
| **Downgrade** | Expired > 90 days → Registered until re-certified |
| **Triggers for early re-cert** | Major API version breaking change; material security incident attributable to partner |

Gold/Platinum partners: annual business review + certification renewal both required.

Badges displayed in partner directory per [CO_MARKETING.md](./CO_MARKETING.md); revoked if renewal lapsed.

---

## Cross-links

- [Support SLAs by tier](./SUPPORT_AND_SLAS.md)  
- [Beta partner certification fast-track](../beta-program/ONBOARDING.md#partners)  
- [Brand co-marketing rules](../press-kit/LOGO_ASSETS.md)
