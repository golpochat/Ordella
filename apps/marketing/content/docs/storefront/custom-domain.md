---
title: Custom domain
description: Map www.yourrestaurant.com to your tenant.
---

1. Add a DNS record pointing to the Ordella ingress.
2. Register the domain in **tenant_domains** with `verified=true` (admin tooling or support).
3. Confirm `GET /api/v1/public/domain/resolve?domain=yourdomain.com` returns your `tenantId`.
4. Storefront middleware sets the tenant cookie for that host.

TLS certificates are issued by your hosting provider (e.g. Vercel, Cloudflare).
