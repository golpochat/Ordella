# Ordella Beta — Success Metrics

KPIs and activation definitions for developers, partners, and retailers. Metrics inform cohort graduation, [rollout](./ROLL_OUT_STRATEGY.md) expansion, and GA readiness—not individual participant ranking.

**Related:** [Program overview](./PROGRAM_OVERVIEW.md) · [Onboarding flow](./ONBOARDING_FLOW.md) · [Feedback loop](./FEEDBACK_LOOP.md) · [Usage metrics (portal)](../developer-portal/sections/usage-metrics.md)

---

## Program-level north stars

| Metric | Definition (beta) | Target (placeholder) |
|--------|-------------------|----------------------|
| **Cohort activation rate** | % accepted participants hitting activation (below) within 30 days | ≥ 70% |
| **Integration survival** | % still sending API traffic day 60 | ≥ 60% |
| **P0/P1 density** | Critical tickets per 100 active tenants per month | Decreasing trend |
| **Doc quality** | % API tasks completed without support ticket | Increasing trend |
| **NPS (beta survey)** | Week 8 survey | ≥ 30 (placeholder) |

---

## KPIs for developers

### Activation (developer)

Participant is **activated** when all are true within 30 days of onboarding:

- Sandbox API key created and used  
- ≥ 100 successful API calls (excludes health checks)  
- ≥ 1 webhook subscription with ≥ 10 successful deliveries  
- Completed “first integration” checklist in [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md#step-5--first-integration-tasks)

### Ongoing KPIs

| KPI | Measurement | Healthy signal |
|-----|-------------|----------------|
| **API success rate** | 2xx / total calls | ≥ 98% |
| **Webhook success rate** | 2xx responses / deliveries | ≥ 95% |
| **Time to first 200** | Days from key creation to 200 calls | ≤ 14 days |
| **Doc self-serve** | Integrations without P1 doc tickets | Majority of cohort |
| **Production promotion** | % requesting prod keys (when available) | Track; no hard target in beta |

Data sources: [Usage](../developer-portal/pages/usage.md), [Logs](../developer-portal/pages/logs.md), internal analytics (placeholder).

---

## KPIs for partners

### Activation (partner)

**Activated** when within 45 days:

- OAuth app or certified integration registered  
- Sandbox install completed on test tenant  
- Certification checklist ≥ 80% complete ([Partner onboarding](../docs/public/partners/partner-onboarding.md))  
- Webhook + API health same as developer thresholds  

### Ongoing KPIs

| KPI | Measurement | Healthy signal |
|-----|-------------|----------------|
| **Certification pass rate** | Approved / submitted | ≥ 50% in beta |
| **Joint retailer pilot** | Partners with ≥ 1 retailer in pilot track | Strategic cohort goal |
| **Marketplace-ready assets** | Listing, support URL, security review | Required before GA listing |
| **Partner API adoption** | Calls to partner-scoped endpoints | Growth per partner |

Revenue metrics during beta are **non-binding** previews—see [Revenue share](../docs/public/partners/revenue-share.md).

---

## KPIs for retailers

### Activation (retailer)

**Activated** when within 60 days:

- Pilot tenant live with ≥ 1 location configured  
- Catalog + inventory baseline imported  
- ≥ 1 channel integrated (POS or storefront) per pilot plan  
- First week of transactional activity (orders or stock movements) in pilot  

### Ongoing KPIs

| KPI | Measurement | Healthy signal |
|-----|-------------|----------------|
| **Location active days** | Days with transactions per pilot location | ≥ 80% of calendar days |
| **Pricing consistency** | Conflicts detected cross-channel | Trending down |
| **Stock accuracy proxy** | Adjustments vs sales variance (placeholder) | Within agreed band |
| **Operator satisfaction** | Weekly pilot survey score | ≥ 4/5 avg |
| **Support ticket rate** | P1/P2 per location per month | Below threshold TBD |

Retailers also contribute qualitative outcomes for [press-kit](../press-kit/PRODUCT_OVERVIEW.md) and launch stories (opt-in).

---

## Activation metrics (summary table)

| Track | Activated when | Window |
|-------|----------------|--------|
| Developer | Keys + 100 calls + webhook milestone | 30 days |
| Partner | App + certification 80% + API health | 45 days |
| Retailer | Live location + channel + transactions | 60 days |

---

## Retention metrics

| Metric | Definition |
|--------|------------|
| **D30 retention** | % activated still active at day 30 |
| **D60 retention** | % activated still active at day 60 |
| **Churn reason** | Offboarding survey: completed pilot / blocked / left program |

**Active** = API calls **or** meaningful portal logins **or** retailer transactional activity in last 14 days.

Cohort reviews at Phase boundaries ([PROGRAM_OVERVIEW.md](./PROGRAM_OVERVIEW.md)): if D60 retention &lt; 50% for developers, pause expansion and address top [feedback categories](./FEEDBACK_LOOP.md#feedback-categories).

---

## Reporting cadence

- **Weekly:** Internal dashboard—activation, P0/P1, API error rate.  
- **Per cohort end:** Retrospective doc—metrics vs targets, doc gaps, roadmap input.  
- **GA gate:** All program north stars reviewed with leadership (placeholder).

Participants receive **aggregate** benchmarks in beta newsletters—not individual scorecards unless support intervention needed.
