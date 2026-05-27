# Ordella Launch — Master Checklist

Gate checklist for public launch. Mark items in [ASSET_STATUS.md](./ASSET_STATUS.md); do not announce until **Launch blockers** are Ready.

**Related:** [Timeline](./TIMELINE.md) · [Launch overview](./LAUNCH_OVERVIEW.md) · [Risk mitigation](./RISK_MITIGATION.md)

---

## Launch blockers (must be Ready)

- [ ] **ordella.com** homepage live with [homepage copy](../../website/copy/homepage.md)  
- [ ] **docs.ordella.com** index + getting started navigable ([docs index](../../docs/public/index.md))  
- [ ] Sandbox + `https://api.ordella.com/v1` operational for developers  
- [ ] [Developer onboarding](../../developer-onboarding/OVERVIEW.md) path verified end-to-end  
- [ ] Legal: Terms, Privacy, Developer Agreement linked from signup  
- [ ] Status page + incident runbook ([RISK_MITIGATION](./RISK_MITIGATION.md))  
- [ ] Press [boilerplate](../../press-kit/COMPANY_BOILERPLATE.md) + [CONTACT](../../press-kit/CONTACT.md) placeholders replaced where possible  

---

## Website readiness

Structure: [website/pages](../../website/pages/index.md) · Copy: [website/copy](../../website/copy/homepage.md)

| Item | Reference | Ready? |
|------|-----------|--------|
| Homepage hero + problem/solution/CTA | [homepage.md](../../website/copy/homepage.md) | ☐ |
| Platform page | [platform.md](../../website/copy/platform.md) | ☐ |
| AI / Autonomy / Digital twins pages | [ai](../../website/copy/ai.md), [autonomy](../../website/copy/autonomy.md), [digital-twins](../../website/copy/digital-twins.md) | ☐ |
| Developers page | [developers.md](../../website/copy/developers.md) | ☐ |
| Partners page | [partners.md](../../website/copy/partners.md) | ☐ |
| Pricing page (placeholder tiers OK) | [pricing.md](../../website/copy/pricing.md) | ☐ |
| About page | [about.md](../../website/copy/about.md) | ☐ |
| Contact / demo funnel | [contact.md](../../website/pages/contact.md) | ☐ |
| Navbar, footer, CTA components | [website/components](../../website/components/navbar.md) | ☐ |
| Analytics + cookie banner | [marketing app](../../apps/marketing) | ☐ |
| SEO / OG tags | placeholder meta | ☐ |
| Logo/assets per [brand LOGO](../../brand/LOGO_GUIDELINES.md) | ☐ |

**Marketing implementation** (`apps/marketing`) may lag copy docs—track separately in [ASSET_STATUS](./ASSET_STATUS.md).

---

## Docs readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Public docs index | [index.md](../../docs/public/index.md) | ☐ |
| Navigation + sidebar config | [_config](../../docs/public/_config/navigation.json) | ☐ |
| Introduction + how it works | [introduction](../../docs/public/getting-started/introduction.md) | ☐ |
| API overview + auth + webhooks + rate limits | [developers/](../../docs/public/developers/api-overview.md) | ☐ |
| API reference hub | [api-reference.md](../../docs/public/api-reference.md) | ☐ |
| Systems overview + key modules | [systems/](../../docs/public/systems/overview.md) | ☐ |
| Architecture (high-level minimum) | [architecture/](../../docs/public/architecture/high-level-architecture.md) | ☐ |
| Integration guides (POS, storefront, partner) | [guides/](../../docs/public/guides/pos-integration.md) | ☐ |
| Partner + compliance pages | [partners/](../../docs/public/partners/partner-program.md), [compliance/](../../docs/public/compliance/gdpr.md) | ☐ |
| Changelog entry for launch | [changelog.md](../../docs/public/changelog.md) | ☐ |
| MASTER_INDEX + ARCHITECTURE_BLUEPRINT | [MASTER_INDEX](../../docs/MASTER_INDEX.md) | ☐ |
| Preview labels on incomplete pages | brand honesty | ☐ |

---

## Developer portal readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Portal structure + README | [developer-portal/README.md](../../developer-portal/README.md) | ☐ |
| Dashboard, API keys, webhooks, sandbox pages | [pages/](../../developer-portal/pages/dashboard.md) | ☐ |
| Sections: oauth, app lifecycle, usage, logs | [sections/](../../developer-portal/sections/overview.md) | ☐ |
| Signup / auth flow | placeholder URL | ☐ |
| Sandbox provision + seed | [sandbox-overview](../../developer-portal/sections/sandbox-overview.md) | ☐ |
| Billing/usage placeholders | [billing-overview](../../developer-portal/sections/billing-overview.md) | ☐ |
| UI implementation vs spec | engineering | ☐ |

**Doc path:** [developer-onboarding](../../developer-onboarding/OVERVIEW.md) must match live portal behavior.

---

## Partner program readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Program overview + tiers | [partner-program/](../../partner-program/PROGRAM_OVERVIEW.md) | ☐ |
| Revenue share + certification | [REVENUE_SHARE](../../partner-program/REVENUE_SHARE.md), [CERTIFICATION](../../partner-program/CERTIFICATION.md) | ☐ |
| Onboarding + support SLAs | [ONBOARDING](../../partner-program/ONBOARDING.md), [SUPPORT_AND_SLAS](../../partner-program/SUPPORT_AND_SLAS.md) | ☐ |
| Co-marketing + leads + portal | [CO_MARKETING](../../partner-program/CO_MARKETING.md), [PARTNER_PORTAL](../../partner-program/PARTNER_PORTAL.md) | ☐ |
| Public docs mirror | [partner-program.md](../../docs/public/partners/partner-program.md) | ☐ |
| Partner application + CRM routing | [CONTACT](../../press-kit/CONTACT.md) | ☐ |
| Portal partner onboarding page | [partner-onboarding](../../developer-portal/pages/partner-onboarding.md) | ☐ |

---

## Beta program readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Beta program docs complete | [beta-program/](../../beta-program/PROGRAM_OVERVIEW.md) | ☐ |
| Waitlist + eligibility live | [WAITLIST_FLOW](../../beta-program/WAITLIST_FLOW.md) | ☐ |
| Cohort A onboarded + metrics | [SUCCESS_METRICS](../../beta-program/SUCCESS_METRICS.md) | ☐ |
| Feedback + comms cadence | [FEEDBACK_LOOP](../../beta-program/FEEDBACK_LOOP.md), [COMMUNICATION_PLAN](../../beta-program/COMMUNICATION_PLAN.md) | ☐ |
| Phase gate for GA announcement | [ROLL_OUT_STRATEGY](../../beta-program/ROLL_OUT_STRATEGY.md) | ☐ |

Launch may proceed with beta **open** or **invite-only**—decision recorded in [COMMUNICATION_PLAN](./COMMUNICATION_PLAN.md).

---

## Press kit readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Boilerplate + fact sheet | [press-kit/](../../press-kit/COMPANY_BOILERPLATE.md) | ☐ |
| Founder bio (placeholders replaced) | [FOUNDER_BIO](../../press-kit/FOUNDER_BIO.md) | ☐ |
| Product overview + FAQ | [PRODUCT_OVERVIEW](../../press-kit/PRODUCT_OVERVIEW.md), [FAQ](../../press-kit/FAQ.md) | ☐ |
| Logo + screenshot guidelines | [LOGO_ASSETS](../../press-kit/LOGO_ASSETS.md), [SCREENSHOTS](../../press-kit/SCREENSHOTS.md) | ☐ |
| Press contact emails live | [CONTACT](../../press-kit/CONTACT.md) | ☐ |
| Embargo brief + release draft | comms | ☐ |
| Actual logo ZIP + screenshots | assets folder TBD | ☐ |

---

## Launch video readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Script approved | [VIDEO_SCRIPT.md](../video/VIDEO_SCRIPT.md) | ☐ |
| VO recorded | production | ☐ |
| Visual / UI montage | [SCREENSHOTS](../../press-kit/SCREENSHOTS.md) | ☐ |
| Music licensed | production | ☐ |
| Captions + L-day embed on site | marketing | ☐ |
| Tagline aligned with brand | [branding.md](../../docs/public/_config/branding.md) | ☐ |

---

## Pitch deck readiness

| Item | Reference | Ready? |
|------|-----------|--------|
| Deck structure | [DECK_STRUCTURE.md](../../pitch-deck/DECK_STRUCTURE.md) | ☐ |
| Slides designed (PDF) | design | ☐ |
| Metrics slide uses approved numbers | [FACT_SHEET](../../press-kit/FACT_SHEET.md) | ☐ |
| Investor-only distribution list | comms | ☐ |
| Not confused with public launch URL | governance | ☐ |

---

## Sign-off

| Role | Name (placeholder) | Date | Signature |
|------|-------------------|------|-----------|
| Product | | | |
| Engineering | | | |
| Marketing / Comms | | | |
| Legal | | | |
| Executive sponsor | | | |

Update [ASSET_STATUS.md](./ASSET_STATUS.md) when each section reaches **Ready**.
