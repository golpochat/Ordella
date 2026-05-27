# Developer Launch Email

**Audience:** Developers, integrators, retailer IT teams on developer mailing list  
**Send timing:** L-day 08:30 UTC (per [launch timeline](../timeline/TIMELINE.md))  
**Tone:** [Brand voice](../../brand/VOICE_AND_TONE.md) — direct, technical, no hype

**Cross-links:** [Launch announcement](../announcement/ANNOUNCEMENT.md) · [Developer onboarding](../../developer-onboarding/OVERVIEW.md) · [Press kit FAQ](../../press-kit/FAQ.md#developer-focused)

---

## Subject line options

1. **Ordella is live — build on the Retail Operating System**
2. **The Retail OS is open: APIs, sandbox, and webhooks**
3. **Hello Ordella: your first API call in 10 minutes**

## Preview text options

1. **Sandbox, versioned REST, and Event Bus webhooks—start integrating today.**
2. **One tenant, one API, one event stream. Documentation at docs.ordella.com.**
3. **POS, storefront, mobile, IoT—same contracts, real-time truth.**

---

## Email body

Hi {{first_name}},

**Ordella is public.** Today we’re launching the platform we built for integrators who are tired of gluing five vendors together after close: **Ordella, the Retail Operating System**—multi-tenant, API-first, and event-driven from the ground up.

Every module—catalog, inventory, orders, pricing, promotions, and more—exposes resources under `https://api.ordella.com/v1`. Authenticate with API keys or JWT, scope requests with `X-Tenant-Id`, and subscribe to **webhooks** that mirror our [Event Bus](../../docs/public/systems/event-bus.md) so your systems react when state changes, not when yesterday’s export lands.

You can go from signup to a working integration quickly. Our [developer onboarding flow](../../developer-onboarding/OVERVIEW.md) walks through account setup, sandbox tenant, API keys, a first `GET` request, and signature-verified webhooks—about **10–15 minutes** if you already run server-side code. Channel guides cover [POS](../../docs/public/guides/pos-integration.md), [storefront](../../docs/public/guides/storefront-integration.md), [mobile](../../docs/public/guides/mobile-app-integration.md), and [IoT](../../docs/public/guides/iot-device-integration.md).

Preview capabilities are labeled in our [changelog](../../docs/public/changelog.md). We’d rather earn your trust with honest docs than surprise you in production.

**[CTA: Open the Developer Portal]** → `<!-- https://developers.ordella.com -->`  
**[CTA: Read the documentation]** → [docs.ordella.com](https://docs.ordella.com) · [API overview](../../docs/public/developers/api-overview.md)

Questions? Reply to this email or see [authentication](../../docs/public/developers/authentication.md) and [rate limits](../../docs/public/developers/rate-limits.md).

Build on one truth,  
**The Ordella Developer Relations team**

---

## Footer (text)

Ordella — The Retail Operating System · [ordella.com](https://ordella.com)  
[Launch announcement](../announcement/ANNOUNCEMENT.md) · Unsubscribe · Privacy
