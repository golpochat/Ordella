# Ordella Beta — Communication Plan

Email templates, update cadence, announcement schedule, and community guidelines for beta participants. Tone: [Voice and Tone](../brand/VOICE_AND_TONE.md)—clear, honest, no overpromising.

**Related:** [Waitlist templates](./WAITLIST_FLOW.md#communication-templates) · [Feedback loop](./FEEDBACK_LOOP.md) · [Program phases](./PROGRAM_OVERVIEW.md#timeline-and-phases)

---

## Update cadence

| Audience | Channel | Cadence | Owner (placeholder) |
|----------|---------|---------|---------------------|
| All beta | Beta newsletter email | Weekly (Phases 1–2), biweekly (Phase 3) | Beta PM |
| All beta | Community channel | Daily async; moderated | Community lead |
| Developers | Office hours | Weekly 45 min | DevRel |
| Partners | Partner office hours | Biweekly | Partner PM |
| Retailers | Pilot check-in | Weekly × 4, then biweekly | CS beta |
| Waitlist | Waitlist update | Monthly | Beta PM |
| Internal | Metrics review | Weekly | Eng + product |

**Rule:** Any **P0** or security issue gets targeted email within 4 hours of confirmation—not wait for newsletter.

---

## Email templates

### Weekly beta newsletter (template)

**Subject:** Ordella beta update — Week {{n}} ({{phase}})

**Body:**

> Hi {{first_name}},  
>  
> **Shipped / fixed**  
> - {{bullet_1}} — see [changelog](../docs/public/changelog.md)  
> - {{bullet_2}}  
>  
> **Known issues**  
> - {{issue}} — workaround: {{workaround}}  
>  
> **This week**  
> - Office hours: {{datetime}} · {{link}}  
> - Doc highlight: [{{doc_title}}]({{doc_url}})  
>  
> **We need from you**  
> - {{action}} (e.g., Week 2 survey, webhook test)  
>  
> Feedback: [FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md) · Portal logs: [Logs](../developer-portal/pages/logs.md)  
>  
> — Ordella Beta Team

---

### Phase transition announcement

**Subject:** Ordella beta enters {{phase_name}}

**Body:**

> Hi {{first_name}},  
>  
> We’re moving from **{{old_phase}}** to **{{new_phase}}** ([timeline](./PROGRAM_OVERVIEW.md#timeline-and-phases)).  
>  
> **What changes for you**  
> - {{change_1}}  
> - {{change_2}}  
>  
> **What stays the same**  
> - Sandbox/pilot terms until GA notice  
> - Support channels and feedback expectations  
>  
> **Roadmap visibility:** [ROADMAP_PREVIEW.md](./ROADMAP_PREVIEW.md)  
>  
> — Ordella Beta Team

---

### Production key promotion (developers/partners)

**Subject:** Ordella beta — production access checklist

**Body:**

> Hi {{first_name}},  
>  
> Your integration met beta promotion criteria. Complete the production checklist in the [Developer Portal](../developer-portal/pages/api-keys.md) before we enable production keys.  
>  
> Review [Authentication](../docs/public/developers/authentication.md) and [Rate limits](../docs/public/developers/rate-limits.md). Production remains subject to beta terms until GA.  
>  
> — Ordella Beta Team

---

### Incident / known issue bulletin

**Subject:** [Ordella Beta] {{severity}} — {{short_title}}

**Body:**

> **Status:** Investigating | Mitigated | Resolved  
> **Impact:** {{who}} — {{what}}  
> **Workaround:** {{steps}}  
> **Next update:** {{time}} UTC  
>  
> Details: {{status_page_placeholder}}

---

## Announcement schedule (placeholder)

| Week | Announcement | Channels |
|------|--------------|----------|
| -4 | Waitlist opens | Web, social, docs banner |
| 0 | Cohort A onboarding | Email, community |
| 4 | Cohort B invite | Waitlist template B |
| 8 | Mid-beta metrics blog (opt-in quotes) | Web, press if cleared |
| 12 | Preview module expansion (AI/autonomy) | Newsletter + docs |
| 18 | GA timeline communication (non-binding window) | All beta |
| 20 | GA / graduation | All + public launch alignment |

Coordinate with [launch narrative](../launch/LAUNCH_NARRATIVE.md) and [website copy](../website/copy/homepage.md)—no conflicting dates across channels.

---

## Community guidelines

### Purpose

Beta community is for **integration help, feedback, and ordinality**—not sales prospecting or unauthorized data sharing.

### Do

- Share tenant-scoped questions without secrets (redact API keys, JWTs, PII).  
- Use `code blocks` for request IDs and error snippets.  
- Search docs and [FAQ](../press-kit/FAQ.md) before posting.  
- Respect embargoes on unreleased features ([ROADMAP_PREVIEW.md](./ROADMAP_PREVIEW.md)).  
- Flag blockers via proper [feedback workflow](./FEEDBACK_LOOP.md#issue-reporting-workflow).

### Do not

- Post live API keys, webhook secrets, or customer data.  
- Harass staff or other participants; no spam.  
- Claim GA or certifications Ordella has not granted.  
- Share forward-looking roadmap slides outside NDA.  

### Moderation

Warnings → temporary mute → removal from beta for violations. Ordella staff identified with `Ordella` badge (placeholder).

### Channels (placeholder)

- Slack / Discord: `<!-- invite URL -->`  
- Office hours: video link in calendar invite  
- Escalation: `beta-support@ordella.com`

---

## Brand and legal reminders

- Product name: **Ordella** — [branding](../docs/public/_config/branding.md)  
- Label **preview** features in public posts if discussing outside NDA group  
- Co-marketing requires written approval ([press-kit LOGO](../press-kit/LOGO_ASSETS.md))

---

## Cross-links for participants

| Need | Link |
|------|------|
| API docs | [docs.ordella.com](https://docs.ordella.com) |
| Developer Portal | [developer-portal/README.md](../developer-portal/README.md) |
| Onboarding | [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md) |
| Metrics | [SUCCESS_METRICS.md](./SUCCESS_METRICS.md) |
