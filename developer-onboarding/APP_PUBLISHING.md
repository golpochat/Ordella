# Developer Onboarding — App Publishing

Publish a certified app to the Ordella marketplace. For **partners** after [APP_CREATION.md](./APP_CREATION.md); adds days–weeks beyond the 10–15 minute quickstart.

**Related:** [App publishing page](../developer-portal/pages/app-publishing.md) · [Partner program publishing](../partner-program/ONBOARDING.md) · [Partner certification](../partner-program/CERTIFICATION.md)

---

## Publishing workflow

1. **Complete technical checklist** — OAuth, webhooks ≥95% success, sandbox + production promotion ([API_KEYS.md](./API_KEYS.md)).  
2. **Silver certification** (developer path) — [CERTIFICATION.md](../partner-program/CERTIFICATION.md).  
3. **Draft listing** on [App publishing](../developer-portal/pages/app-publishing.md): copy, screenshots, categories.  
4. **Submit for review** — enters partner PM queue.  
5. **Remediation** — fix security or UX feedback (typically 1–2 rounds).  
6. **Approved** — listing live on marketplace (URL placeholder: `ordella.com/marketplace`).  
7. **Post-launch** — monitor [usage/logs](./LOGS_AND_USAGE.md); respond to retailer reviews (placeholder).

Non-partner private apps may skip public listing—install via direct OAuth on agreed tenants only.

---

## Review process (placeholder)

| Stage | Reviewer | Criteria |
|-------|----------|----------|
| **Automated** | Platform | TLS, redirect URI match, scope validity |
| **Security** | Ordella security | Questionnaire, data handling, secret storage |
| **Product** | Partner PM | Metadata quality, support URL live |
| **Legal** | Ordella legal | Privacy/terms for billing apps (if applicable) |

**SLA:** initial review within **5 business days** (placeholder). Urgent fixes for P0 security within **24 hours**.

Rejected listings receive categorized feedback; resubmit within **60 days** without full re-cert unless security failure.

---

## Listing requirements

| Asset | Requirement |
|-------|-------------|
| **Name & description** | Accurate; no “only/best” claims without legal approval |
| **Logo** | Clear space per [LOGO_ASSETS](../press-kit/LOGO_ASSETS.md) |
| **Screenshots** | 16:9, demo data only ([SCREENSHOTS](../press-kit/SCREENSHOTS.md)) |
| **Preview label** | If using preview APIs, say so in description |
| **Support** | 2 business day response commitment (Silver+) |
| **Pricing** | Documented in listing or external page linked |

Ordella may feature Gold+ apps in [co-marketing](../partner-program/CO_MARKETING.md).

---

## Partner program tie-in

Marketplace publishing requires **Registered → Silver** path minimum:

| Benefit | Tie-in |
|---------|--------|
| **Revenue share** | [REVENUE_SHARE.md](../partner-program/REVENUE_SHARE.md) on qualifying subscriptions |
| **Directory** | [CO_MARKETING.md](../partner-program/CO_MARKETING.md) partner profile |
| **Leads** | [LEAD_DISTRIBUTION.md](../partner-program/LEAD_DISTRIBUTION.md) for Silver+ |
| **Support SLAs** | [SUPPORT_AND_SLAS.md](../partner-program/SUPPORT_AND_SLAS.md) |

Apply to [partner program](../partner-program/PROGRAM_OVERVIEW.md) early if not already linked ([ACCOUNT_CREATION.md](./ACCOUNT_CREATION.md#linking-to-partner-portal-optional)).

Beta partners: fast-track noted in [beta ONBOARDING](../beta-program/ONBOARDING_FLOW.md#partners).

---

## Next steps

- [LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md) for production monitoring  
- [Public partner onboarding](../docs/public/partners/partner-onboarding.md)  
- [Website partners copy](../website/copy/partners.md)
