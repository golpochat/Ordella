# Beta Waitlist — Acceptance Email

**Audience:** Applicants accepted from beta waitlist ([waitlist flow](../../beta-program/WAITLIST_FLOW.md))  
**Send timing:** On acceptance (cohort invite), not L-day blast  
**Tone:** [Brand voice](../../brand/VOICE_AND_TONE.md) — welcoming, precise, honest about beta limits

**Cross-links:** [Launch announcement](../announcement/ANNOUNCEMENT.md) · [Beta program](../../beta-program/PROGRAM_OVERVIEW.md) · [Developer onboarding](../../developer-onboarding/OVERVIEW.md)

---

## Subject line options

1. **You’re in — Ordella beta cohort {{cohort_id}}**
2. **Welcome to the Ordella beta program**
3. **Your sandbox is ready — start building on Ordella**

## Preview text options

1. **Complete onboarding within 7 days: keys, sandbox, first API call.**
2. **Beta terms apply; preview features labeled in docs.**
3. **Developer Portal + docs.ordella.com — your starting points.**

---

## Email body

Hi {{first_name}},

**You’ve been accepted into the Ordella beta program** ({{track}} track, cohort **{{cohort_id}}**). Thank you for your patience on the waitlist—and for helping us harden the Retail Operating System before broad GA.

Ordella is **the Retail Operating System**: one platform for operations, commerce, and intelligence, built **real-time**, **API-first**, and **autonomous where it counts**. Public launch context: [launch announcement](../announcement/ANNOUNCEMENT.md). As a beta participant, you get sandbox access, documentation, beta support channels, and a direct line for feedback ([feedback loop](../../beta-program/FEEDBACK_LOOP.md)).

**Onboarding steps (complete within 7 days)**

1. **Accept beta terms** — link in portal: `{{beta_terms_url}}`  
2. **Verify account + enable MFA** — [Account creation](../../developer-onboarding/ACCOUNT_CREATION.md)  
3. **Create sandbox tenant** — [Sandbox setup](../../developer-onboarding/SANDBOX_SETUP.md)  
4. **Issue API keys** (sandbox only) — [API keys](../../developer-onboarding/API_KEYS.md)  
5. **First API call** — [Hello Ordella](../../developer-onboarding/FIRST_API_CALL.md)  
6. **Register webhooks** — [Webhook setup](../../developer-onboarding/WEBHOOK_SETUP.md)  
7. **Join beta community** — `{{community_invite_url}}` · cadence in [beta communication plan](../../beta-program/COMMUNICATION_PLAN.md)

Partners: continue with [partner onboarding](../../partner-program/ONBOARDING.md) after core steps. Retailers: your pilot tenant provisioned separately—watch for CS outreach.

**Sandbox link:** open the Developer Portal → **Sandbox** ([sandbox page](../../developer-portal/pages/sandbox.md)). Tenant ID displays on that screen; use it as `X-Tenant-Id` on every request.

Beta does **not** guarantee production SLA or unlimited usage—see [program overview](../../beta-program/PROGRAM_OVERVIEW.md). Preview modules are labeled in [changelog](../../docs/public/changelog.md).

**[CTA: Start onboarding]** → `{{onboarding_url}}` · [Developer Portal](../../developer-portal/README.md)  
**[CTA: Open documentation]** → [docs.ordella.com](https://docs.ordella.com)

We’re glad you’re building with us,  
**Ordella Beta Team**

---

## Footer (text)

Questions: `beta-support@ordella.com` <!-- PLACEHOLDER --> · [Beta eligibility](../../beta-program/ELIGIBILITY.md)
