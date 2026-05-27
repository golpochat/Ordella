# Ordella Beta — Rollout Strategy

Phased rollout, cohort-based onboarding, scaling rules, and risk mitigation for the beta program. Execution ties to [PROGRAM_OVERVIEW.md](./PROGRAM_OVERVIEW.md) phases and [SUCCESS_METRICS.md](./SUCCESS_METRICS.md) gates.

**Related:** [Waitlist prioritization](./WAITLIST_FLOW.md#prioritization-rules) · [Eligibility](./ELIGIBILITY.md) · [Onboarding](./ONBOARDING_FLOW.md) · [Cloud Platform](../docs/public/systems/cloud-platform.md)

---

## Phased rollout plan

### Phase 0 — Infrastructure readiness (internal)

Validate sandbox isolation, API rate limits, webhook delivery SLO (internal targets), and portal flows ([sandbox](../developer-portal/sections/sandbox-overview.md), [api-keys](../developer-portal/pages/api-keys.md)). Dogfood with internal tenants before external Cohort A.

**Exit gate:** Zero open P0; webhook success ≥ 99% internal; runbooks drafted.

### Phase 1 — Closed alpha (Cohort A)

- **Size:** ~15 developers, ~5 partners, ~3 retailers (placeholder caps)  
- **Scope:** Core REST, Event Bus, catalog/inventory/orders, webhooks  
- **Duration:** 8 weeks  
- **Support:** High-touch; daily standup for blockers  

**Exit gate:** Developer activation ≥ 70%; P1 resolution median &lt; 5 days; top doc gaps patched.

### Phase 2 — Expanded beta (Cohorts B–D)

- **Size:** +40 developers, +15 partners, +10 retailers per wave (staggered 3 weeks)  
- **Scope:** Add promotions, pricing, loyalty preview; partner certification; AI/autonomy **preview** modules for opt-in sub-cohort  
- **Duration:** 12 weeks cumulative  

**Exit gate:** D60 retention ≥ 50% developers; retailer pilot success criteria met for ≥ 60% locations; partner certification pipeline stable.

### Phase 3 — Hardening

- **Focus:** Production promotion, performance testing, security review, compliance pack updates  
- **Freeze:** Non-critical feature freeze except docs and P0/P1 fixes  
- **Duration:** 6 weeks  

**Exit gate:** Production keys promoted for ≥ 30 integrators without P0; enterprise security review template complete.

### Phase 4 — GA transition

- Graduate cohorts to GA terms, pricing ([website pricing copy](../website/copy/pricing.md)), public launch alignment.  
- Waitlist remainder invited or redirected to self-serve signup per capacity.

---

## Cohort-based onboarding

### Cohort sizing

| Track | Max per cohort | Rationale |
|-------|----------------|-----------|
| Developers | 25 | Support + review bandwidth |
| Partners | 10 | Certification depth |
| Retailers | 5 | CS + pilot intensity |

### Cohort composition rules

Each cohort should include:

- Mix of **integration types** (POS, storefront, mobile, IoT, partner app)  
- At least **two regions** where supported ([data residency](../docs/public/compliance/data-residency.md))  
- **One** enterprise-scale retailer only if dedicated CS assigned  

Avoid single-vendor cohorts that do not stress-test breadth.

### Onboarding wave schedule (placeholder)

| Cohort | Invite week | Tracks |
|--------|-------------|--------|
| A | W0 | Dev-heavy + 2 partners |
| B | W3 | + retailers |
| C | W6 | + partners |
| D | W9 | Fill gaps from waitlist |

Invitation uses [WAITLIST_FLOW.md](./WAITLIST_FLOW.md) Template B; onboarding deadline **7 days** to start or slot forfeited.

---

## Scaling rules

### When to open the next cohort

Open next wave only if:

- Previous cohort **activation rate** ≥ target ([SUCCESS_METRICS.md](./SUCCESS_METRICS.md))  
- **P0 count** = 0 for 7 consecutive days  
- Support queue **median first response** within SLA ([COMMUNICATION_PLAN.md](./COMMUNICATION_PLAN.md))  
- Engineering agrees capacity in sprint planning (placeholder)

### When to pause intake

Pause waitlist invitations if:

- Any **P0** security or tenancy incident  
- Webhook delivery success &lt; 93% platform-wide for 24h  
- Support backlog &gt; 48h median for P1  
- Cloud region capacity alert ([Deployment architecture](../docs/public/architecture/deployment-architecture.md))

Communicate pause via waitlist Template E and beta newsletter—honest status per brand guidelines.

### Horizontal scale (platform)

- Scale API and webhook workers ahead of cohort invites (+20% headroom placeholder)  
- Per-tenant rate limits tiered for beta ([rate limits](../docs/public/developers/rate-limits.md))  
- Monitor [usage](../developer-portal/sections/usage-metrics.md) dashboards per cohort

---

## Risk mitigation

| Risk | Mitigation |
|------|------------|
| **Cross-tenant data leak** | Tenant isolation tests; mandatory `X-Tenant-Id`; security review before Phase 2; incident runbook |
| **Webhook storms** | Rate limits, retry caps, participant handler guidelines in [ONBOARDING](./ONBOARDING_FLOW.md) |
| **Preview module misuse** | Opt-in sub-cohort; preview labels; policy guardrails for autonomy |
| **Support overload** | Cohort caps; office hours; self-serve docs; pause rules |
| **Partner quality risk** | Certification gate before marketplace; security questionnaire |
| **Retailer pilot failure** | Scoped locations; weekly CS; exit criteria in pilot charter |
| **Communication drift** | Single beta PM owns [COMMUNICATION_PLAN.md](./COMMUNICATION_PLAN.md); changelog discipline |
| **Legal / data** | Beta agreement + DPA placeholders; GDPR doc links for EU pilots |

### Rollback plan

- **Feature flag off** for preview modules without affecting core API  
- **Cohort freeze** — no new invites; existing participants continue  
- **Full pause** — read-only API mode only as last resort (executive approval); communicated within 4 hours

---

## Post-beta continuity

Participants graduating to GA retain portal access; sandbox may be deprecated or limited per notice. Feedback history informs public docs and [press-kit](../press-kit/FAQ.md) updates.

**Launch alignment:** [Launch narrative §9](../launch/LAUNCH_NARRATIVE.md) · [Developers website copy](../website/copy/developers.md)

---

## Document index

| File | Role in rollout |
|------|-----------------|
| [PROGRAM_OVERVIEW.md](./PROGRAM_OVERVIEW.md) | Phases and purpose |
| [ELIGIBILITY.md](./ELIGIBILITY.md) | Who enters each wave |
| [WAITLIST_FLOW.md](./WAITLIST_FLOW.md) | Intake when paused/resumed |
| [SUCCESS_METRICS.md](./SUCCESS_METRICS.md) | Gates between phases |
| [FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md) | Incident and quality signals |
