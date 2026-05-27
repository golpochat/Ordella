# Ordella Beta — Feedback Loop

How beta participants report issues, request features, and influence platform quality. Ordella treats feedback as **operational input**—triaged, categorized, and linked to metrics in [SUCCESS_METRICS.md](./SUCCESS_METRICS.md).

**Related:** [Communication plan](./COMMUNICATION_PLAN.md) · [Roadmap preview](./ROADMAP_PREVIEW.md) · [Changelog](../docs/public/changelog.md) · [Brand honesty](../brand/VOICE_AND_TONE.md)

---

## How feedback is collected

### Channels (beta)

| Channel | Best for | Response target |
|---------|----------|-----------------|
| **In-portal feedback form** | Quick UI/API friction | 3 business days acknowledgment |
| **Beta support email** | `beta-support@ordella.com` <!-- PLACEHOLDER --> | Blockers: 1 business day |
| **Structured surveys** | Week 2, Week 8, exit | Analyzed per cohort |
| **Office hours** | Design questions, architecture | Weekly slot—calendar in comms plan |
| **Community channel** | Peer discussion, how-to | Moderated; not for P0 incidents |
| **GitHub / tracker** | `<!-- PLACEHOLDER: external issue tracker -->` | Public doc issues only |

**Do not** file security vulnerabilities in public channels—use `security@ordella.com` placeholder per [security architecture](../docs/public/architecture/security-architecture.md).

### Required participant cadence

- **Developers / partners:** At least one feedback submission per month while active; blocker reports within 24 hours of discovery.  
- **Retailers:** Weekly pilot check-in form during first 4 weeks, then biweekly.

Inactive participants (no feedback and no API activity 60 days) may be offboarded per [ELIGIBILITY.md](./ELIGIBILITY.md).

---

## Feedback categories

Tag every ticket with **one primary** and optional secondary category:

| Category | Code | Examples |
|----------|------|----------|
| **API contract** | `api` | Wrong schema, missing field, versioning confusion |
| **Webhook / events** | `events` | Delivery failures, signature, ordering, idempotency |
| **Documentation** | `docs` | Gaps, errors, broken links on docs.ordella.com |
| **Developer Portal** | `portal` | Keys, sandbox, logs, usage UI |
| **Performance / limits** | `perf` | Rate limits, latency, timeouts |
| **Partner / OAuth** | `partner` | Scopes, app install, certification |
| **Retailer operations** | `ops` | Catalog, inventory, pricing, promotions in pilot |
| **AI / autonomy (preview)** | `intel` | Assistant, Genome, Autonomous Engine previews |
| **Security / compliance** | `sec` | Auth, tenancy leak concern, residency |
| **Feature request** | `feat` | New capability—not a defect |
| **Other** | `other` | Process, billing beta, comms |

Categories map to engineering squads via internal routing table (placeholder).

---

## Issue reporting workflow

### Severity definitions

| Level | Definition | Example |
|-------|------------|---------|
| **P0** | Production/pilot down; data cross-tenant risk | Auth bypass, wrong tenant data |
| **P1** | Core beta milestone blocked | Webhooks 100% fail; cannot create orders |
| **P2** | Degraded or workaround exists | Intermittent 429, doc wrong |
| **P3** | Minor | Typo, cosmetic portal issue |

### Workflow

1. **Report** — Email or form with: tenant ID, request ID, timestamp (UTC), steps, expected vs actual.  
2. **Acknowledge** — Auto-reply with ticket ID; human ack per SLA above.  
3. **Triage** — Category + severity within 1 business day (P0 immediate).  
4. **Reproduce** — Engineering uses sandbox/pilot; may request HAR or redacted logs.  
5. **Resolve / mitigate** — Fix, doc update, or known-issue bulletin in beta notes.  
6. **Close** — Reporter confirms; link to [changelog](../docs/public/changelog.md) if customer-visible.

**Portal tools:** [Logs](../developer-portal/pages/logs.md) for webhook/API debugging.

### Known issues list

Published in beta community (pinned) and referenced in weekly updates—preview features labeled per [ROADMAP_PREVIEW.md](./ROADMAP_PREVIEW.md).

---

## Feature request workflow

Feature requests differ from bugs: they describe **desired capability** not broken behavior.

1. Submit with category `feat` and **problem statement** (user outcome, not solution mandate).  
2. Product reviews weekly against [ROADMAP_PREVIEW.md](./ROADMAP_PREVIEW.md) visibility rules.  
3. Outcomes: **Accepted** (roadmap consideration), **Deferred** (post-GA), **Declined** (with reason), **Already planned** (link when shareable).  
4. Accepted items may enter beta roadmap preview for comment—no commitment to ship in beta.

Ordella does not guarantee feature delivery for beta participants; we do guarantee **consideration and transparent status**.

### Voting (optional placeholder)

Community upvotes on feature board (`<!-- PLACEHOLDER tool -->`) inform priority but do not override security, tenancy, or strategic platform work.

---

## Closing the loop

- **Fixed in build {{x}}** — Called out in [COMMUNICATION_PLAN.md](./COMMUNICATION_PLAN.md) weekly note.  
- **Doc fix** — PR to `docs/public` or developer-portal sections; thank reporter in changelog when appropriate.  
- **Won’t fix** — Explain constraint (security, scope, preview-only).  

Aggregate category trends feed [SUCCESS_METRICS.md](./SUCCESS_METRICS.md) and phase gates in [ROLL_OUT_STRATEGY.md](./ROLL_OUT_STRATEGY.md).
