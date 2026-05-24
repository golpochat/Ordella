# Platform layer

Cross-cutting deployment concerns — **not** core business domains (orders, payments, catalog).

## Features

- **Tenant routing** — subdomain, custom domain (`tenant_domains`), header, onboarding fallback
- **Rate limiting** — per-IP and per-tenant (Redis-backed when `REDIS_URL` set)
- **Security headers** — Helmet + hardened defaults
- **Health** — `/api/v1/health`, `/api/v1/health/live`
- **Monitoring** — HTTP logging interceptor, Sentry (`SENTRY_DSN`)
- **WebSocket auth** — `AuthenticatedIoAdapter` (enable with `WS_REQUIRE_AUTH=true`)
- **Migrations** — production destructive guard + optional `RUN_MIGRATIONS_ON_BOOT`
