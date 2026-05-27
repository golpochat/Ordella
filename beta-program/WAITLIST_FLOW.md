# Ordella Beta — Waitlist Flow

Structure for intake, prioritization, and communication before cohort acceptance. The waitlist balances **demand** with [rollout capacity](./ROLL_OUT_STRATEGY.md) and **cohort diversity** in [PROGRAM_OVERVIEW.md](./PROGRAM_OVERVIEW.md).

**Related:** [ELIGIBILITY.md](./ELIGIBILITY.md) · [COMMUNICATION_PLAN.md](./COMMUNICATION_PLAN.md) · [Website developers copy](../website/copy/developers.md)

---

## Waitlist structure

### Intake form fields (placeholder)

| Field | Required | Used for |
|-------|----------|----------|
| Track | Yes | Developer / Partner / Retailer |
| Organization name | Yes | Dedup, partner verification |
| Work email | Yes | Identity, prioritization |
| Country / region | Yes | Residency, cohort balance |
| Integration or pilot summary | Yes | Readiness scoring |
| Company size / store count | Retailer & partner | Segment tagging |
| Target go-live date | No | Urgency |
| Referral code | No | Partner referrals, events |
| Consent to beta terms | Yes | Legal |

**Submission endpoint:** `<!-- PLACEHOLDER: ordella.com/beta or Typeform URL -->`  
**CRM tag:** `beta-waitlist-{track}-{YYYY-MM}`

### States

```
submitted → screening → accepted | waitlisted | declined
waitlisted → invited (cohort opens) → accepted | expired
accepted → onboarding (see ONBOARDING_FLOW.md)
```

Participants in **waitlisted** state receive periodic updates; no sandbox access until **accepted**.

---

## Prioritization rules

Scoring is **internal**—do not publish numeric weights externally. Reviewers apply judgment within these rules:

### Tier 1 — Invite now (when cohort opens)

- Partner with **signed pilot retailer** ready to onboard within 30 days  
- Developer with **production app** and clear Ordella integration plan  
- Retailer **reference customer** nominated by certified partner  
- Strategic design partners (analyst, flagship retailer—executive approval)

### Tier 2 — Next wave

- Strong technical fit; go-live 30–90 days  
- Geographic or segment fill for underrepresented cohort mix  
- Integration types needed for doc validation (e.g., IoT, mobile)

### Tier 3 — Hold

- Incomplete application or generic interest without use case  
- Regions not yet supported ([FACT_SHEET regions](../press-kit/FACT_SHEET.md#supported-regions))  
- Submissions during capacity freeze between phases

### Deprioritize / decline

- Violates [ELIGIBILITY](./ELIGIBILITY.md) disqualifiers  
- Duplicate org submissions (merge records)  
- Competitor or scraper patterns

**SLA:** Initial screening response within **5 business days**; waitlisted updates monthly minimum.

---

## Communication templates

Tone per [Voice and Tone](../brand/VOICE_AND_TONE.md): direct, honest, no hype.

### Template A — Submission received

**Subject:** We received your Ordella beta application

**Body:**

> Hi {{first_name}},  
>  
> Thanks for applying to the Ordella beta program. We review applications for the **{{track}}** track on a rolling basis as cohorts open.  
>  
> **What happens next:** Our team will respond within five business days with accepted, waitlisted, or follow-up questions. In the meantime, you can explore public documentation at [docs.ordella.com](https://docs.ordella.com) and the [API overview](../docs/public/developers/api-overview.md).  
>  
> Please do not share unreleased feature details if you join under NDA later.  
>  
> — Ordella Beta Team

---

### Template B — Accepted (cohort assignment)

**Subject:** You’re in — Ordella beta cohort {{cohort_id}}

**Body:**

> Hi {{first_name}},  
>  
> You’ve been accepted into the Ordella beta (**{{track}}**, cohort {{cohort_id}}).  
>  
> **Next step:** Complete onboarding within seven days: {{onboarding_url}}  
>  
> You’ll provision a sandbox (or pilot tenant for retailers), create API keys, and register webhooks using the [Developer Portal](../developer-portal/README.md). Start with [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md) in our beta guide.  
>  
> Office hours: {{office_hours_link}}  
>  
> — Ordella Beta Team

---

### Template C — Waitlisted

**Subject:** Ordella beta — you’re on the waitlist

**Body:**

> Hi {{first_name}},  
>  
> We can’t place you in the current cohort due to capacity, but you’re **waitlisted** with priority for the next wave. No action required—we’ll email when a slot opens.  
>  
> Estimated next invitation window: {{window_placeholder}}  
>  
> Public docs remain available at [docs.ordella.com](https://docs.ordella.com).  
>  
> — Ordella Beta Team

---

### Template D — Declined (polite)

**Subject:** Ordella beta application update

**Body:**

> Hi {{first_name}},  
>  
> Thank you for your interest. We’re not able to offer a beta slot at this time (**{{reason_category}}**: capacity / fit / region). You may reapply after {{reapply_date}} or contact us if your integration timeline changes materially.  
>  
> — Ordella Beta Team

---

### Template E — Monthly waitlist newsletter

**Subject:** Ordella beta — waitlist update {{month}}

**Body:**

> Hi {{first_name}},  
>  
> Quick update: we’re in **{{current_phase}}** of the beta ([program overview](./PROGRAM_OVERVIEW.md)). Cohort {{cohort_id}} is {{status}}. You remain waitlisted; we expect the next invitations around {{date_placeholder}}.  
>  
> Highlight from this month: {{changelog_link}}  
>  
> — Ordella Beta Team

---

## Operational notes

- Log all emails in CRM with cohort and track tags.  
- Do not promise GA dates in waitlist emails—use [ROADMAP_PREVIEW.md](./ROADMAP_PREVIEW.md) language.  
- Press inquiries route to [press-kit CONTACT](../press-kit/CONTACT.md), not beta waitlist.
