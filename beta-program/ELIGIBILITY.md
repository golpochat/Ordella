# Ordella Beta — Eligibility & Acceptance

Criteria for admitting developers, partners, and retailers to the beta program. Acceptance is **selective** to maintain support quality and meaningful feedback density—see [ROLL_OUT_STRATEGY.md](./ROLL_OUT_STRATEGY.md).

**Related:** [Program overview](./PROGRAM_OVERVIEW.md) · [Waitlist flow](./WAITLIST_FLOW.md) · [Brand tone](../brand/VOICE_AND_TONE.md)

---

## Developer eligibility criteria

Developers are eligible when they demonstrate ability to complete a **technical milestone** within the beta period and agree to program terms (feedback, confidentiality on unreleased features).

**Required:**

- Valid Ordella account (or approved waitlist invitation)  
- Stated integration target: POS, storefront, mobile, IoT, internal ops, or analytics  
- Server-side environment capable of storing API keys securely (no client-side secrets)  
- Agreement to use **sandbox** for development until production promotion checklist is complete  

**Preferred:**

- Prior experience with REST APIs, webhooks, and idempotent event handlers  
- Published or internal app with identifiable users (retail or adjacent vertical)  
- Willingness to join one beta office hours session and submit structured feedback monthly  

**Disqualifiers:**

- Scraping or load testing beyond published [rate limits](../docs/public/developers/rate-limits.md) without written approval  
- Attempts to access other tenants’ data or bypass `X-Tenant-Id` scoping  
- Reselling sandbox access or sharing API keys in public repositories  

*Onboarding:* [ONBOARDING_FLOW.md — Developers](./ONBOARDING_FLOW.md#developers)*

---

## Partner eligibility criteria

Partners must align with the public [Partner program](../docs/public/partners/partner-program.md) and commit to a **certification path** during beta.

**Required:**

- Registered business entity with integratable product or service  
- Technical owner and executive sponsor contacts  
- Intent to list on Ordella marketplace or deliver certified integration for mutual customers  
- Security questionnaire completion (placeholder template—provided on acceptance)  
- Agreement to partner beta terms including trademark and co-brand rules ([LOGO_ASSETS](../press-kit/LOGO_ASSETS.md))  

**Preferred:**

- Existing retail customer base or SI relationships  
- OAuth app or webhook-based architecture ready for partner API scopes  
- Reference customer willing to join retailer pilot cohort (with consent)  

**Disqualifiers:**

- Direct competitors to Ordella core OS positioning (evaluated case-by-case)  
- Prior breach of partner API terms or fraudulent marketplace behavior  
- Inability to meet minimum support SLA for joint customers (placeholder: 2 business day response)  

*Onboarding:* [ONBOARDING_FLOW.md — Partners](./ONBOARDING_FLOW.md#partners)* · [Partner onboarding](../docs/public/partners/partner-onboarding.md)

---

## Retailer eligibility criteria

Retailers run **pilot tenants** with limited location count and defined success criteria. Enterprise security reviews are supported but may extend timeline.

**Required:**

- Active retail operations (physical, ecommerce, or omnichannel)  
- Executive sponsor (Operations or CTO) and day-to-day platform owner  
- Pilot scope document: locations, channels, modules, timeline (template provided on acceptance)  
- Agreement to beta limitations: preview modules labeled, no production SLA unless separately contracted  

**Preferred:**

- 1–20 pilot locations (beta cap per cohort—see rollout strategy)  
- Willingness to use Ordella for catalog/inventory/pricing source of truth during pilot  
- IT capacity for SSO/MFA evaluation if required ([Authentication](../docs/public/developers/authentication.md))  

**Disqualifiers:**

- Pilot scope exceeding cohort capacity without phased plan  
- Requirement for unsupported regions without [data residency](../docs/public/compliance/data-residency.md) confirmation  
- Refusal to participate in feedback cadence ([FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md))  

*Onboarding:* [ONBOARDING_FLOW.md — Retailers](./ONBOARDING_FLOW.md#retailers)*

---

## Acceptance rules

### General process

1. Application or waitlist submission ([WAITLIST_FLOW.md](./WAITLIST_FLOW.md))  
2. Automated checks (domain, duplicate accounts, basic fraud signals—placeholder)  
3. Human review against eligibility criteria (3–5 business day SLA target)  
4. Acceptance email with cohort assignment and onboarding link  
5. Account provisioning and sandbox/pilot tenant creation  

### Prioritization (summary)

Waitlist prioritization favors **diverse cohort composition** (geography, segment, integration type), **readiness to integrate within 30 days**, and **strategic partners** with mutual retailer pilots. Full rules: [WAITLIST_FLOW.md — Prioritization](./WAITLIST_FLOW.md#prioritization-rules).

### Appeals and reapplication

Declined applicants receive a brief reason category (capacity, fit, security). Reapplication allowed after **90 days** or next phase opening unless permanently disqualified (abuse, terms violation).

### Removal from beta

Ordella may pause or revoke access for terms violations, sustained inactivity (no login or API calls for **60 days** without extension), or behavior that risks other tenants. Offboarding checklist in [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md) (reverse steps).

---

## Legal and compliance (placeholder)

- Beta Agreement (MSA + beta addendum)—`<!-- LEGAL PLACEHOLDER -->`  
- DPA for retailers processing customer data—reference [GDPR overview](../docs/public/compliance/gdpr.md)  
- NDA for roadmap previews—[ROADMAP_PREVIEW.md](./ROADMAP_PREVIEW.md)

Contact routing: [press-kit CONTACT](../press-kit/CONTACT.md) placeholders until `beta@ordella.com` is live.
