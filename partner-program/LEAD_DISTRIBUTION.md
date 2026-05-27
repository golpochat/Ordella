# Ordella Partner Program — Lead Distribution

How Ordella assigns inbound and marketing-qualified leads to partners, how partners are scored, performance metrics, and exclusivity rules. Program fairness and transparency align with [brand voice](../brand/VOICE_AND_TONE.md)—no vague promises of unlimited leads.

**Related:** [Partner tiers](./PARTNER_TIERS.md) · [Co-marketing](./CO_MARKETING.md) · [Revenue share — attach](./REVENUE_SHARE.md) · [Partner portal](./PARTNER_PORTAL.md)

---

## How leads are assigned

### Lead sources

| Source | Description | Typical routing |
|--------|-------------|-----------------|
| **Inbound marketing** | Demo requests, content downloads, webinar attendees | Scored pool |
| **Marketplace** | Retailer installs partner app | Attribution to app publisher |
| **Sales qualified (SQL)** | Ordella sales discovery | Deal registration + partner match |
| **Co-marketing** | Campaign UTMs | Campaign-specific partner |
| **Customer referral** | Existing retailer requests integrator | Preferred partner list |

### Assignment flow

1. **Capture** — CRM record with segment, geo, modules, partner preference.  
2. **Score** — model below (placeholder weights).  
3. **Match** — best-fit certified partner by category + capacity.  
4. **Offer** — partner receives lead in portal; **48h** accept/decline (placeholder).  
5. **Register** — Gold+ **deal registration** locks attribution window ([PARTNER_PORTAL.md](./PARTNER_PORTAL.md)).  
6. **Track** — pipeline stages until won/lost; feeds partner score.

Unassigned leads stay with Ordella direct sales or self-serve until partner capacity opens.

---

## Partner scoring

Internal **Partner Score (0–100)** updated monthly—visible to Gold+ in portal analytics (placeholder).

| Factor | Weight (placeholder) | Notes |
|--------|----------------------|-------|
| Certification level | 20% | Silver minimum for pool |
| Customer satisfaction (CSAT) | 25% | Post-implementation surveys |
| Win rate on offered leads | 20% | Declines without penalty if fast |
| Technical health | 15% | Webhook/API metrics for listed apps |
| Training completion | 10% | Current certs + refresher |
| Co-marketing participation | 10% | Optional boost |

Higher scores receive **first right** on leads in their category/geo. Scores below threshold pause new assignments until remediation plan.

---

## Performance metrics

Partners tracked on:

| Metric | Definition | Target (Silver+, placeholder) |
|--------|------------|-------------------------------|
| **Lead accept rate** | Accepted / offered | ≥ 70% |
| **Lead response time** | Hours to first retailer contact | ≤ 24h |
| **Win rate** | Won deals / registered deals | Tracked; no public minimum |
| **Time to implement** | Registration → go-live | Per segment benchmark |
| **Churn / logo retention** | Renewals on partner-sourced tenants | Improving trend |
| **Support escalations** | P1 to Ordella caused by partner | Low incidence |

Underperformance → coaching → lead pause → tier review ([PARTNER_TIERS.md](./PARTNER_TIERS.md)).

Ordella shares **aggregate** benchmarks in partner newsletters—not competitor names.

---

## Exclusivity rules (if any)

Default: **no exclusivity**—retailers choose partners freely; multiple partners may serve different modules.

**Exceptions (contractual, typically Platinum):**

| Exclusivity type | Description | Approval |
|------------------|-------------|----------|
| **Vertical** | Named industry (e.g., grocery) in a region | VP Sales + Legal |
| **Geo** | Country/region for SI services | Platinum addendum |
| **Co-sell attach** | Ordella field defers platform deal to single SI for 12 months | Deal desk |

Exclusivity does **not** block retailers from self-implementing or using other ISV apps on marketplace—unless rare enterprise agreement states otherwise (legal review).

**Deal registration protection (Gold+):**

- Register opportunity in portal within **14 days** of first qualified meeting (placeholder).  
- **90-day** protection window from registration for co-sell attach commission ([REVENUE_SHARE.md](./REVENUE_SHARE.md)).  
- Conflicts resolved by deal desk with timestamp evidence—not relationship claims alone.

---

## Partner responsibilities on leads

- Accurate capability representation—no overselling preview modules  
- GDPR-compliant outreach where EU retailers involved ([GDPR](../docs/public/compliance/gdpr.md))  
- Update CRM stages in portal weekly while active  
- Pass platform opportunities back to Ordella when out of scope (goodwill + score impact)

---

## Cross-links

- [Support SLAs](./SUPPORT_AND_SLAS.md) — joint escalations  
- [Onboarding](./ONBOARDING.md) — first customer success  
- [Press FAQ — partners](../press-kit/FAQ.md#partner-focused)
