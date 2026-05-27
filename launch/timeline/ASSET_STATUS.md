# Ordella Launch — Asset Status Tracker

Live tracker for launch assets. Update status weekly from T-6 through D+30. Status values: **Not started** · **In progress** · **Ready**.

**Related:** [CHECKLIST](./CHECKLIST.md) · [TIMELINE](./TIMELINE.md) · [COMMUNICATION_PLAN](./COMMUNICATION_PLAN.md)

**Last updated:** `<!-- YYYY-MM-DD -->` · **Launch date (L-day):** `<!-- YYYY-MM-DD -->`

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Not started** | No substantive work |
| **In progress** | Draft or partial; not launch-safe |
| **Ready** | Reviewed; approved for L-day (or post-launch date in Notes) |

---

## Master asset table

| Asset | Location / link | Status | Owner | Due (rel.) | Notes |
|-------|-----------------|--------|-------|------------|-------|
| **Launch narrative** | [LAUNCH_NARRATIVE.md](../LAUNCH_NARRATIVE.md) | Ready | Product | T-6 | Story doc complete |
| **Launch overview** | [LAUNCH_OVERVIEW.md](./LAUNCH_OVERVIEW.md) | Ready | Product | T-6 | This folder |
| **Launch timeline** | [TIMELINE.md](./TIMELINE.md) | Ready | PM | T-6 | Anchor L-day |
| **Master checklist** | [CHECKLIST.md](./CHECKLIST.md) | Ready | PM | T-3 | Sign-off pending |
| **Launch comms plan** | [COMMUNICATION_PLAN.md](./COMMUNICATION_PLAN.md) | Ready | Marketing | T-2 | Templates TBD |
| **Risk mitigation** | [RISK_MITIGATION.md](./RISK_MITIGATION.md) | Ready | Eng lead | T-2 | |
| **Brand package** | [brand/](../../brand/BRAND_OVERVIEW.md) | Ready | Brand | T-6 | |
| **Website copy (9 pages)** | [website/copy/](../../website/copy/homepage.md) | Ready | Marketing | T-5 | Implementation separate |
| **Website structure** | [website/pages](../../website/pages/index.md) | In progress | Web | T-3 | Placeholders in pages |
| **Marketing site (app)** | [apps/marketing](../../apps/marketing) | In progress | Eng | L-2 | Bind copy to UI |
| **Public docs** | [docs/public/](../../docs/public/index.md) | In progress | Docs | T-3 | Many sections planned |
| **Docs config** | [docs/public/_config/](../../docs/public/_config/branding.md) | Ready | Docs | T-4 | |
| **MASTER_INDEX** | [docs/MASTER_INDEX.md](../../docs/MASTER_INDEX.md) | Ready | Docs | T-4 | |
| **Developer portal spec** | [developer-portal/](../../developer-portal/README.md) | Ready | Product | T-4 | UI impl in progress |
| **Developer onboarding** | [developer-onboarding/](../../developer-onboarding/OVERVIEW.md) | Ready | DevRel | T-4 | |
| **Partner program docs** | [partner-program/](../../partner-program/PROGRAM_OVERVIEW.md) | Ready | Partner PM | T-3 | |
| **Beta program docs** | [beta-program/](../../beta-program/PROGRAM_OVERVIEW.md) | Ready | Beta PM | T-3 | Live ops TBD |
| **Press kit** | [press-kit/](../../press-kit/COMPANY_BOILERPLATE.md) | In progress | Comms | T-2 | Founder/assets placeholders |
| **Launch video script** | [video/VIDEO_SCRIPT.md](../video/VIDEO_SCRIPT.md) | Ready | Marketing | T-4 | Production not started |
| **Launch video (final)** | `<!-- production URL -->` | Not started | Marketing | L-1 | |
| **Pitch deck structure** | [pitch-deck/DECK_STRUCTURE.md](../../pitch-deck/DECK_STRUCTURE.md) | Ready | CEO office | T-4 | Designed deck TBD |
| **Pitch deck (PDF)** | `<!-- path TBD -->` | Not started | Design | L-5 | Investor only |
| **API / sandbox (prod)** | `api.ordella.com` | In progress | Platform | L-2 | Blocker |
| **Legal terms** | `<!-- URLs -->` | Not started | Legal | L-3 | Blocker |
| **Status page** | `<!-- status.ordella.com -->` | Not started | Eng | L-3 | |
| **Press release draft** | comms repo | Not started | PR | L-3 | |
| **Logo ZIP (press)** | [LOGO_ASSETS](../../press-kit/LOGO_ASSETS.md) | Not started | Brand | T-2 | |
| **UI screenshots (press)** | [SCREENSHOTS](../../press-kit/SCREENSHOTS.md) | Not started | Design | T-2 | |
| **Embargo media list** | CRM | Not started | PR | L-4 | |
| **Beta cohort A** | [beta ROLL_OUT](../../beta-program/ROLL_OUT_STRATEGY.md) | In progress | Beta PM | T-3 | |
| **Partner applications CRM** | CRM | Not started | Partner PM | L-day | |
| **Analytics / tagging** | marketing | Not started | Marketing | L-2 | |

---

## Readiness by workstream

| Workstream | Ready | In progress | Not started | % Ready (approx.) |
|------------|-------|-------------|-------------|-----------------|
| **Narrative & launch ops** | 6 | 0 | 0 | 100% |
| **Brand & website copy** | 2 | 2 | 0 | 50% |
| **Docs** | 2 | 1 | 0 | 67% |
| **Developer** | 2 | 2 | 0 | 50% |
| **Partner & beta** | 2 | 1 | 1 | 50% |
| **Press & video** | 1 | 1 | 4 | 17% |
| **Platform & legal** | 0 | 1 | 3 | 0% |

*Approximate from table above—recalculate when owners update rows.*

---

## Blockers (open)

| # | Blocker | Owner | Target resolve |
|---|---------|-------|----------------|
| 1 | Marketing site UI not bound to launch copy | Web | T-2 |
| 2 | Legal terms URLs on signup | Legal | L-3 |
| 3 | API/sandbox production hardening | Platform | L-2 |
| 4 | Press assets (logo ZIP, screenshots) | Brand/Design | T-2 |
| 5 | Video production | Marketing | L-1 |

---

## Update process

1. Owners update **Status** column every **Monday** (and L-day hourly).  
2. PM rolls up to exec in launch standup.  
3. Any **Not started** blocker past due → escalate in [RISK_MITIGATION](./RISK_MITIGATION.md).  
4. **Ready** requires checklist section sign-off in [CHECKLIST](./CHECKLIST.md).

---

## Cross-links

- [Launch goals & metrics](./LAUNCH_OVERVIEW.md#launch-success-metrics)  
- [6-week timeline](./TIMELINE.md#6-week-pre-launch-timeline)  
- [Website checklist section](./CHECKLIST.md#website-readiness)
