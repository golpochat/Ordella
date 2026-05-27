# Launch Day — Contingency Plans

Fallback playbooks when L-day deviates from [LAUNCH_DAY_TIMELINE](./LAUNCH_DAY_TIMELINE.md). Extends [timeline RISK_MITIGATION](../timeline/RISK_MITIGATION.md) with launch-day triggers.

**Cross-links:** [FINAL_CHECKS](./FINAL_CHECKS.md) · [MONITORING](./MONITORING_AND_RESPONSE.md) · [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md)

---

## Technical fallback plans

| Trigger | Immediate action | Fallback |
|---------|------------------|----------|
| API 5xx > 1% sustained | Incident commander; status page | Pause [DEVELOPER_EMAIL](../emails/DEVELOPER_LAUNCH_EMAIL.md) + dev social; keep docs up with banner |
| Sandbox cannot provision | Eng hotfix | Waitlist mode on signup; [BETA_WAITLIST](../emails/BETA_WAITLIST_EMAIL.md) “delayed 24h” |
| Website down | Web rollback / flag | Docs + portal only launch; hero post L+1 |
| Docs down | CDN/host fix | Website with PDF announcement link temp |
| Webhook storm failures | Scale workers; disable test floods | Comms: known issue + ETA |
| DDoS / rate abuse | WAF; tighten limits | Post [rate limits](../../docs/public/developers/rate-limits.md) |

**Go/no-go delay:** If trigger at 07:00, slip L-day 24–48h; send internal + waitlist notice—no public press.

**Deploy policy:** Only P0/P1 hotfixes with two-person approval during freeze.

---

## Communication fallback plans

| Scenario | Action |
|----------|--------|
| **Full delay** | CEO/internal email; waitlist “launch moved to {{date}}”; no press |
| **Partial delay (press only)** | Owned channels live; press held 24h |
| **API degraded** | [RISK template](../timeline/RISK_MITIGATION.md): status + developer apology email |
| **Wrong claim published** | Correction post + press correction; link [changelog](../../docs/public/changelog.md) |
| **Email misfire (broken links)** | Follow-up “corrected links” within 2 h |

**Pause rules:** All scheduled [social](../social/) stops on P0; Comms lead authorizes resume.

**Spokesperson unavailable:** Deputy trained on [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md) bullets only.

---

## Press fallback plans

| Scenario | Action |
|----------|--------|
| Embargo break early | Publish [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md) + release immediately |
| Release delayed | Personal note to embargo list with new time |
| Major factual error in outlet | Request correction; post accurate link on owned blog |
| No pickup | Owned channels still execute; analyst briefing D+3 |
| Hostile / inaccurate piece | Factual comment or no comment—legal approves |

**Assets always ready:** [press-kit](../../press-kit/COMPANY_BOILERPLATE.md) offline ZIP on PR laptop.

---

## Social fallback plans

| Scenario | Action |
|----------|--------|
| P0 incident | Unschedule remaining posts; pin status link |
| Viral negative thread | Factual reply + doc link; no dogpiles |
| Low engagement | Do not spam; execute D+1 [POST_LAUNCH](./POST_LAUNCH_ACTIONS.md) threads |
| Wrong link in post | Reply correction + edited repost if platform allows |
| Executive typo | Light correction reply; move on |

**Pre-drafted pause tweet (placeholder):**

> We’re investigating a platform issue affecting some API requests. Status: {{status_url}}. Docs and updates remain available. We’ll post when resolved.

**Resume checklist:** API green 1 h · Comms + Eng sign-off · resume from next scheduled item (don’t dump all at once).

---

## Decision authority

| Decision | Who |
|----------|-----|
| Delay L-day | CEO + Launch commander |
| Pause social/email | Comms lead + Launch commander |
| Public status post | Incident commander |
| Press correction | PR + Legal |
| Customer refund/credit | Not L-day scope—defer |

Log all contingency activations in war room thread for retro.
