# Launch Day — Overview

Operational playbook for **L-day**: the single calendar day when Ordella goes public across web, docs, developer and partner surfaces, press, email, and social. This folder is the **execution layer** atop [launch timeline](../timeline/TIMELINE.md) strategy.

**Related:** [Launch timeline L-day](../timeline/TIMELINE.md#launch-day-timeline) · [Master checklist](../timeline/CHECKLIST.md) · [Communication plan](../timeline/COMMUNICATION_PLAN.md) · [Announcement](../announcement/ANNOUNCEMENT.md)

---

## Purpose of the launch day plan

Launch day concentrates **coordinated exposure**—not ad-hoc tweets and hope. Every channel has an owner, a sequence, and a rollback path. The plan ensures **developers** can sign up and call the API, **partners** can apply with accurate docs, **retailers** can request demos, **press** receives consistent facts, and **internal teams** share one war-room picture.

Without a playbook, teams over-publish before docs are live, contradict taglines, or miss API degradation until social amplifies the pain. This document set prevents that: [FINAL_CHECKS](./FINAL_CHECKS.md) before 06:00 UTC, [LAUNCH_DAY_TIMELINE](./LAUNCH_DAY_TIMELINE.md) during the day, [MONITORING_AND_RESPONSE](./MONITORING_AND_RESPONSE.md) throughout, [CONTINGENCY_PLANS](./CONTINGENCY_PLANS.md) when things slip, [POST_LAUNCH_ACTIONS](./POST_LAUNCH_ACTIONS.md) after the spotlight moves.

Tone stays **calm and precise** per [brand voice](../../brand/VOICE_AND_TONE.md)—we announce capability we can support today.

---

## Launch objectives

1. **Publish** the public story via [ANNOUNCEMENT.md](../announcement/ANNOUNCEMENT.md) on owned channels without broken links.  
2. **Activate** developer signup → sandbox → first API call funnel ([developer onboarding](../../developer-onboarding/OVERVIEW.md)).  
3. **Open** partner applications with [partner program](../../partner-program/PROGRAM_OVERVIEW.md) docs live.  
4. **Generate** retailer demo pipeline via ordella.com/contact.  
5. **Execute** press and social per [emails](../emails/) and [social](../social/) without embargo violations.  
6. **Maintain** platform stability (API, webhooks, portal) with zero unresolved P0 at EOD.  
7. **Capture** day-1 metrics against [launch success criteria](../timeline/LAUNCH_OVERVIEW.md#launch-success-metrics).

Objectives explicitly **exclude** claiming GA for every preview module or publishing unreleased pricing dollars.

---

## Key audiences

| Audience | L-day primary need | Lead channel | Playbook section |
|----------|-------------------|--------------|------------------|
| **Developers** | Working sandbox + docs | Email, social, docs | [DEVELOPER_LAUNCH_EMAIL](../emails/DEVELOPER_LAUNCH_EMAIL.md) · [DEVELOPER_POSTS](../social/DEVELOPER_POSTS.md) |
| **Partners** | Program + apply path | Email, LinkedIn | [PARTNER_LAUNCH_EMAIL](../emails/PARTNER_LAUNCH_EMAIL.md) · [PARTNER_POSTS](../social/PARTNER_POSTS.md) |
| **Retailers** | Demo CTA + trust | Email, LinkedIn PM | [RETAILER_LAUNCH_EMAIL](../emails/RETAILER_LAUNCH_EMAIL.md) |
| **Press** | Facts + interview | Embargo / release | [PRESS_OUTREACH](../emails/PRESS_OUTREACH_EMAIL.md) · [press-kit](../../press-kit/) |
| **Investors** | Private update | Direct email | [INVESTOR_LAUNCH_EMAIL](../emails/INVESTOR_LAUNCH_EMAIL.md) |
| **Beta waitlist** | Acceptance/onboarding | Triggered sends | [BETA_WAITLIST_EMAIL](../emails/BETA_WAITLIST_EMAIL.md) |
| **Internal** | Roles + escalation | War room | [LAUNCH_DAY_TIMELINE](./LAUNCH_DAY_TIMELINE.md) |

---

## Success criteria

**Go criteria (06:00 UTC):** All items in [FINAL_CHECKS](./FINAL_CHECKS.md) signed; go/no-go per [RISK_MITIGATION](../timeline/RISK_MITIGATION.md); incident commander named.

**Day success (22:00 UTC):**

| Criterion | Target (placeholder) |
|-----------|----------------------|
| Website + docs URLs | 200, no critical 404 on linked paths |
| API availability | ≥ 99.5% during L-day window |
| Developer signups | `<!-- e.g., ≥ 50 -->` with ≥ 70% activation in 7d |
| Press release | Distributed on schedule |
| Social published | Per [social calendar](../social/) without pullbacks |
| P0 incidents | 0 open > 4 hours |
| Executive sign-off | EOD metrics email sent |

**Soft success:** Positive sentiment in monitored social; partner applications received; no material press correction.

Failure triggers: invoke [CONTINGENCY_PLANS](./CONTINGENCY_PLANS.md) and pause scheduled waves per [timeline COMMUNICATION](../timeline/COMMUNICATION_PLAN.md).

---

## Playbook file map

| File | When to use |
|------|-------------|
| [FINAL_CHECKS](./FINAL_CHECKS.md) | L-1 evening + L-day 05:30 |
| [LAUNCH_DAY_TIMELINE](./LAUNCH_DAY_TIMELINE.md) | L-day 06:00–22:00 |
| [MONITORING_AND_RESPONSE](./MONITORING_AND_RESPONSE.md) | Continuous |
| [CONTINGENCY_PLANS](./CONTINGENCY_PLANS.md) | On trigger |
| [POST_LAUNCH_ACTIONS](./POST_LAUNCH_ACTIONS.md) | L+1 onward |

**War room:** `#launch-war-room` (placeholder) · On-call roster in [MONITORING](./MONITORING_AND_RESPONSE.md)
