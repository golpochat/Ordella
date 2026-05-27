# Developer — Social Posts (3–5)

**Channel:** LinkedIn + X (developer audience)  
**Cross-links:** [Developer onboarding](../../developer-onboarding/OVERVIEW.md) · [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md) · docs.ordella.com

---

## Post 1 — API launch

**Hook:** `https://api.ordella.com/v1` is live.

Ordella is **API-first**:

• Versioned REST  
• Consistent JSON envelopes  
• `X-Tenant-Id` on every call  
• Webhooks aligned with the Event Bus  

If it ships in the product, it ships in the API.

**CTA:** [API overview](../../docs/public/developers/api-overview.md) · docs.ordella.com  
#API #Developers #REST

**Variation:** Your next retail integration shouldn’t start with auth glue code. Start with Ordella.

---

## Post 2 — Sandbox + 10-minute onboarding

**Hook:** Hello Ordella in ~10 minutes.

1. Sandbox tenant  
2. API key (server-side only)  
3. `GET /products`  
4. Webhook + signature verify  

Full path: [developer-onboarding/OVERVIEW.md](../../developer-onboarding/OVERVIEW.md)

**CTA:** Developer Portal `<!-- developers.ordella.com -->` · [SANDBOX_SETUP](../../developer-onboarding/SANDBOX_SETUP.md)  
#DevEx #Quickstart

---

## Post 3 — Webhooks

**Hook:** Stop polling. Start reacting.

Ordella webhooks deliver signed callbacks when inventory, orders, and promotions change.

Verify HMAC **before** you process the body. Idempotent handlers — retries are normal.

**CTA:** [Webhooks doc](../../docs/public/developers/webhooks.md) · [WEBHOOK_SETUP](../../developer-onboarding/WEBHOOK_SETUP.md)  
#Webhooks #EventDriven

**Variation (X):** `order.created` hits your endpoint in seconds—not in tomorrow’s CSV.

---

## Post 4 — Quickstart languages

**Hook:** Pick your stack. Same contracts.

cURL · Node · Python · PHP · Go — examples in our quickstart guides.

One base URL. One tenant header. One truth.

**CTA:** [QUICKSTART_GUIDES](../../developer-onboarding/QUICKSTART_GUIDES.md) · [SDK overview](../../docs/public/developers/sdk-overview.md)

---

## Post 5 — Launch + beta CTA

**Hook:** Ordella launched today. Your sandbox is waiting.

We’re opening the **beta** for integrators shipping POS, storefront, mobile, and IoT connectors.

Preview features labeled. Feedback ships fixes.

**CTA options:**  
- Join beta → [beta program](../../beta-program/PROGRAM_OVERVIEW.md)  
- Read announcement → [ANNOUNCEMENT](../announcement/ANNOUNCEMENT.md)  
- ordella.com · docs.ordella.com  

#BuildOnOrdella #RetailOS

---

## Strong hooks library (mix-in)

| Hook | Use when |
|------|----------|
| “Five vendors. One reconciliation.” | Problem-aware devs |
| “Event Bus > cron job” | Backend engineers |
| “Bearer + X-Tenant-Id. That’s the pattern.” | API crowd |
| “Webhook signature or don’t deploy.” | Security-minded |
| “Sandbox ≠ production key. Ever.” | Best practices |

## CTA matrix

| CTA | Destination |
|-----|-------------|
| Read the docs | docs.ordella.com |
| 10-min onboarding | developer-onboarding/OVERVIEW |
| Join beta | beta-program/PROGRAM_OVERVIEW |
| Full launch story | launch/announcement/ANNOUNCEMENT |
