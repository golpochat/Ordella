# Launch Day — Hour-by-Hour Timeline

**L-day schedule (UTC placeholder)** — align to primary market in war room. Publishing order prevents 404s and message drift.

**Cross-links:** [timeline TIMELINE](../timeline/TIMELINE.md#launch-day-timeline) · [COMMUNICATION_PLAN](../timeline/COMMUNICATION_PLAN.md) · [emails](../emails/) · [social](../social/) · [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md)

---

## Pre-open (05:00–06:00)

| Time | Action | Owner |
|------|--------|-------|
| **05:00** | War room channel live; dial-in open | Launch commander |
| **05:30** | [FINAL_CHECKS](./FINAL_CHECKS.md) verbal roll call | All leads |
| **05:45** | Platform dashboard green; status page green | Eng |
| **05:55** | Comms holds scheduled posts pending “GO” | Comms |

**Internal:** Exec “GO” message template in [#launch-war-room].

---

## Hour-by-hour schedule

| Time (UTC) | Stream | Action | Assets |
|------------|--------|--------|--------|
| **06:00** | Internal | War room official start; roles confirmed ([MONITORING](./MONITORING_AND_RESPONSE.md)) | — |
| **07:00** | Platform | Final health check; **deploy freeze** non-critical until 22:00 | Status page |
| **08:00** | Web | **ordella.com** public (feature flag on) | [homepage copy](../../website/copy/homepage.md) |
| **08:15** | Docs | Banner + [changelog](../../docs/public/changelog.md) publish | docs.ordella.com |
| **08:30** | Developers | Send [DEVELOPER_LAUNCH_EMAIL](../emails/DEVELOPER_LAUNCH_EMAIL.md); post [DEVELOPER_POSTS](../social/DEVELOPER_POSTS.md) #1 | Portal open |
| **09:00** | Video | Publish [VIDEO_SCRIPT](../video/VIDEO_SCRIPT.md) film; embed on site; YouTube public | [SHORT_VIDEO_SCRIPTS](../social/SHORT_VIDEO_SCRIPTS.md) optional |
| **09:00** | Social | [LINKEDIN_ANNOUNCEMENT](../social/LINKEDIN_ANNOUNCEMENT.md) Version A | — |
| **09:30** | Partners | [PARTNER_LAUNCH_EMAIL](../emails/PARTNER_LAUNCH_EMAIL.md); [PARTNER_POSTS](../social/PARTNER_POSTS.md) #1 | ordella.com/partners |
| **10:00** | Press | Release wire + [PRESS_OUTREACH](../emails/PRESS_OUTREACH_EMAIL.md) L-day variant | [press-kit](../../press-kit/) |
| **10:15** | Social | [TWITTER_THREAD](../social/TWITTER_THREAD.md) live | — |
| **11:00** | Social | [LINKEDIN_THREAD_VISION](../social/LINKEDIN_THREAD_VISION.md) post 1 + thread | — |
| **12:00** | Product | [LINKEDIN_PRODUCT](../social/LINKEDIN_PRODUCT_HIGHLIGHTS.md) post 1–2 | — |
| **14:00** | Retail | [RETAILER_LAUNCH_EMAIL](../emails/RETAILER_LAUNCH_EMAIL.md); demo funnel verified | contact form |
| **14:30** | Social | Product posts 3–4 (AI, autonomy) | — |
| **16:00** | Investors | [INVESTOR_LAUNCH_EMAIL](../emails/INVESTOR_LAUNCH_EMAIL.md) (private list only) | [pitch deck](../../pitch-deck/DECK_STRUCTURE.md) |
| **16:30** | Beta | Send cohort acceptances [BETA_WAITLIST](../emails/BETA_WAITLIST_EMAIL.md) (batched, not blast) | [beta program](../../beta-program/PROGRAM_OVERVIEW.md) |
| **18:00** | Internal | Day-1 metrics vs [LAUNCH_OVERVIEW](../timeline/LAUNCH_OVERVIEW.md) | Dashboard |
| **19:00** | Social | Thread close / thank-you RT partners | — |
| **22:00** | Platform | On-call handoff; deploy freeze lift (optional) | Incident log |

---

## Sequence of announcements (publishing order)

**Rule:** Infrastructure → owned content → amplification.

1. Platform health **GO**  
2. **Website** + **docs** (08:00 / 08:15)  
3. **Developer** email + social (08:30)  
4. **Video** + LinkedIn announce (09:00)  
5. **Partner** email + social (09:30)  
6. **Press** (10:00) — only after 1–3 URLs verified  
7. **X thread** + vision thread (10:15–11:00)  
8. **Retail** email (14:00)  
9. **Investor** (16:00, private)  
10. **Beta acceptances** (16:30, batched)  

**Do not** publish press before website/docs. **Do not** publish beta blast before support staffing confirmed.

---

## Internal coordination steps

| Cadence | Activity |
|---------|----------|
| **Hourly 06:00–14:00** | War room standup: API, signups, social sentiment, open tickets |
| **On event** | Incident commander triages per [MONITORING](./MONITORING_AND_RESPONSE.md) |
| **Before each wave** | Comms posts “Publishing X in 5” in war room; Eng confirms green |
| **10:00** | PR confirms release live; screenshot for archive |
| **18:00** | Product sends EOD metrics doc to exec |
| **22:00** | Launch commander “L-day complete” message + hot wash scheduled L+1 |

**Roles:** Launch commander · Incident commander · Comms lead · DevRel · Partner PM · PR · Executive spokesperson (on call).

---

## Dependency reminder

Press and paid social depend on **API + signup** stability. If 07:00 check fails → halt 08:30+ external waves; execute [CONTINGENCY_PLANS](./CONTINGENCY_PLANS.md).
