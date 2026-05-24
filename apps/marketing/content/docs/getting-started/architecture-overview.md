---
title: Architecture overview
description: How Admin, API, POS, and Storefront connect.
---

```
Guest / Staff → Frontends (Admin, POS, Storefront, Apps)
                    ↓
              Ordella API (NestJS)
                    ↓
         PostgreSQL · Redis · S3
```

- **Tenant routing** resolves `tenantId` from subdomain, custom domain, or `X-Tenant-Id` header.
- **WebSockets** power KDS and live order tracking on namespace `/kds`.
- **Stripe** handles SaaS subscriptions (Billing module) and order payments (when enabled).
