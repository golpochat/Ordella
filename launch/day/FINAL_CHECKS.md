# Launch Day — Final Checks

Pre-flight checklist for **L-1 18:00** (go/no-go) and **L-day 05:30** (final tick). Mirror of [timeline CHECKLIST](../timeline/CHECKLIST.md) with L-day operational detail. Sign each line before 06:00 UTC war room opens.

**Cross-links:** [LAUNCH_DAY_TIMELINE](./LAUNCH_DAY_TIMELINE.md) · [CONTINGENCY_PLANS](./CONTINGENCY_PLANS.md)

---

## Website checklist

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | ordella.com resolves HTTPS; cert valid | Web | ☐ |
| 2 | Homepage copy matches [website/copy](../../website/copy/homepage.md) | Marketing | ☐ |
| 3 | Platform, AI, autonomy, twins, developers, partners, pricing, about routes live | Web | ☐ |
| 4 | Contact/demo form submits to CRM | Ops | ☐ |
| 5 | Launch announcement linked (`/blog` or hero CTA) | Marketing | ☐ |
| 6 | Video embed tested ([VIDEO_SCRIPT](../video/VIDEO_SCRIPT.md)) | Marketing | ☐ |
| 7 | Analytics + cookie banner ([marketing app](../../apps/marketing)) | Web | ☐ |
| 8 | OG/meta for launch post | Marketing | ☐ |
| 9 | No placeholder `<!-- Content coming soon -->` on customer-facing hero | Web | ☐ |

**Rollback:** feature flag off homepage; docs-only launch per [CONTINGENCY](./CONTINGENCY_PLANS.md).

---

## Docs checklist

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | docs.ordella.com index loads | Docs | ☐ |
| 2 | [navigation.json](../../docs/public/_config/navigation.json) paths valid | Docs | ☐ |
| 3 | Getting started + API overview + auth + webhooks reachable | Docs | ☐ |
| 4 | [changelog](../../docs/public/changelog.md) L-day entry drafted | Docs | ☐ |
| 5 | Launch banner copy approved | Marketing | ☐ |
| 6 | API base URL `https://api.ordella.com/v1` correct in [branding](../../docs/public/_config/branding.md) | Docs | ☐ |
| 7 | Preview labels on incomplete pages | Docs | ☐ |
| 8 | MASTER_INDEX links not broken | Docs | ☐ |

---

## Developer portal checklist

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | Signup/login URL live | Eng | ☐ |
| 2 | Sandbox provision works ([sandbox-overview](../../developer-portal/sections/sandbox-overview.md)) | Eng | ☐ |
| 3 | API key create + secret once-display | Eng | ☐ |
| 4 | Webhook register + test event | Eng | ☐ |
| 5 | [onboarding path](../../developer-onboarding/OVERVIEW.md) verified E2E | DevRel | ☐ |
| 6 | Terms/Privacy linked at signup | Legal | ☐ |
| 7 | Rate limits enforced ([rate limits](../../docs/public/developers/rate-limits.md)) | Platform | ☐ |
| 8 | [DEVELOPER_LAUNCH_EMAIL](../emails/DEVELOPER_LAUNCH_EMAIL.md) links valid | DevRel | ☐ |

---

## Partner program checklist

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | ordella.com/partners live | Web | ☐ |
| 2 | [partner-program](../../partner-program/PROGRAM_OVERVIEW.md) URLs in docs | Partner PM | ☐ |
| 3 | [PARTNER_LAUNCH_EMAIL](../emails/PARTNER_LAUNCH_EMAIL.md) scheduled | Partner PM | ☐ |
| 4 | [PARTNER_POSTS](../social/PARTNER_POSTS.md) scheduled | Comms | ☐ |
| 5 | Partner application → CRM | Ops | ☐ |
| 6 | No public commission % without legal OK | Legal | ☐ |
| 7 | [partner-onboarding](../../developer-portal/pages/partner-onboarding.md) accessible | Eng | ☐ |

---

## Beta program checklist

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | Beta apply URL or waitlist form works | Beta PM | ☐ |
| 2 | [BETA_WAITLIST_EMAIL](../emails/BETA_WAITLIST_EMAIL.md) template tested | Beta PM | ☐ |
| 3 | Cohort A acceptance list final | Beta PM | ☐ |
| 4 | Support channel staffed ([beta SUPPORT](../../beta-program/SUPPORT_AND_SLAS.md)) | Beta PM | ☐ |
| 5 | [TWITTER_THREAD](../social/TWITTER_THREAD.md) beta CTA URL correct | Comms | ☐ |
| 6 | Pause rules documented if signup flood | Platform | ☐ |

---

## Press kit checklist

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | [COMPANY_BOILERPLATE](../../press-kit/COMPANY_BOILERPLATE.md) final | Comms | ☐ |
| 2 | [FACT_SHEET](../../press-kit/FACT_SHEET.md) numbers verified | Product | ☐ |
| 3 | [FOUNDER_BIO](../../press-kit/FOUNDER_BIO.md) placeholders replaced or removed | Comms | ☐ |
| 4 | Logo ZIP available ([LOGO_ASSETS](../../press-kit/LOGO_ASSETS.md)) | Brand | ☐ |
| 5 | Screenshots or placeholder acknowledged | Design | ☐ |
| 6 | [PRESS_OUTREACH](../emails/PRESS_OUTREACH_EMAIL.md) embargo list sent | PR | ☐ |
| 7 | Spokesperson briefing complete | Exec | ☐ |
| 8 | [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md) = press source of truth | Comms | ☐ |

---

## Social + email readiness

| # | Check | Owner | ✓ |
|---|-------|-------|---|
| 1 | [LINKEDIN_ANNOUNCEMENT](../social/LINKEDIN_ANNOUNCEMENT.md) scheduled | Comms | ☐ |
| 2 | [LINKEDIN_THREAD_VISION](../social/LINKEDIN_THREAD_VISION.md) threaded | Comms | ☐ |
| 3 | [TWITTER_THREAD](../social/TWITTER_THREAD.md) scheduled | Comms | ☐ |
| 4 | Product highlight posts queued ([LINKEDIN_PRODUCT](../social/LINKEDIN_PRODUCT_HIGHLIGHTS.md)) | Comms | ☐ |
| 5 | All 6 [emails](../emails/) tested (links, render) | Comms | ☐ |
| 6 | Pause social script if P0 ([CONTINGENCY](./CONTINGENCY_PLANS.md)) | Comms | ☐ |
| 7 | Pin comment URLs on video post | Comms | ☐ |
| 8 | Unsubscribe/legal footers on bulk sends | Legal | ☐ |

---

## Sign-off block

| Role | Name | L-1 Go | L-day 05:30 Final |
|------|------|--------|-------------------|
| Launch commander | | ☐ | ☐ |
| Engineering | | ☐ | ☐ |
| Product | | ☐ | ☐ |
| Marketing/Comms | | ☐ | ☐ |
| Legal | | ☐ | ☐ |

**No sign-off → delay L-day** per [timeline RISK](../timeline/RISK_MITIGATION.md).
