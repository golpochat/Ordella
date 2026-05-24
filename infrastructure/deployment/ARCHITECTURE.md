# Ordella deployment architecture

Multi-tenant SaaS hosting layout (modular monolith + Next.js frontends).

## Hosting choices

| Layer | Technology | Deployment target |
|-------|------------|-------------------|
| API | Node.js 20 + NestJS | Docker (ECS, Fly.io, Railway, K8s) |
| Frontends | Next.js 14 | Vercel (recommended) or Docker |
| Database | PostgreSQL 16 | Supabase, Neon, or AWS RDS |
| Cache / queues | Redis 7 | Upstash, ElastiCache, or managed Redis |
| Jobs | BullMQ + Redis | Same Redis as cache (separate DB index) |
| Assets | S3-compatible | AWS S3, Cloudflare R2, MinIO (local) |
| CDN | Cloudflare / Vercel Edge | Static assets + storefront ISR |

## Environments

| Env | Purpose | Data |
|-----|---------|------|
| `development` | Local docker-compose + hot reload | Local Postgres/Redis/MinIO |
| `staging` | Pre-production integration | Isolated DB, Redis, S3 bucket |
| `production` | Live tenants | Isolated DB, Redis, S3, secrets store |

Use separate `DATABASE_URL`, `REDIS_URL`, `S3_*`, and Stripe keys per environment.

## Multi-tenant routing

1. **Subdomain** — `{tenant}.ordella.com` → `tenants.subdomain` / slug lookup
2. **Custom domain** — `www.restaurant.com` → `tenant_domains` (verified)
3. **Header** — `X-Tenant-Id` (UUID or slug) for admin/POS/API clients
4. **Onboarding fallback** — `app.ordella.com` / `admin.ordella.com` → no tenant context

API: `TenantRoutingMiddleware` + `GET /api/v1/public/domain/resolve?domain=`

Frontends: Next.js `middleware.ts` resolves host → sets `x-tenant-id` cookie/header.

## Request flow

```
Client → CDN (assets) / Vercel (Next) / Load balancer (API)
       → Rate limit → Security headers → Tenant routing
       → NestJS modules (domain logic unchanged)
```

See [SECRETS.md](./SECRETS.md), [MIGRATIONS.md](./MIGRATIONS.md), [MONITORING.md](./MONITORING.md).
