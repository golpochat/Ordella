# Ordella — Production Readiness Checklist

**Version:** 1.0  
**Last updated:** 2026-05-24  
**Companion doc:** [PRODUCTION_READINESS_TEST_PLAN.md](./PRODUCTION_READINESS_TEST_PLAN.md) (detailed test cases)

Use this checklist for **GO / NO-GO** decisions at three release gates:

| Gate | Requirement |
|------|-------------|
| **Private beta** | All **P0** items checked |
| **Public beta** | All **P0** + **P1** items checked (or documented waiver) |
| **Full launch** | All **P0** + **P1** + **P2** items checked (or documented waiver) |

**How to verify:** Each item must have evidence (CI run link, staging screenshot, API response log, monitor URL). Mark **N/A** only with written approval.

---

## P0 — Private beta gate (first real tenants)

*Nothing below can be skipped before onboarding a paying or pilot restaurant.*

### Infrastructure & Stability

- [ ] Staging environment mirrors production topology (API, Postgres, Redis, S3 bucket, separate secrets)
- [ ] Production `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET` are unique and not committed to git
- [ ] `GET /api/v1/health/live` returns 200 on staging and production URLs
- [ ] `GET /api/v1/health` reports `database: ok` on staging with migrations applied
- [ ] All migrations in `apps/api/src/database/migrations/` run successfully on staging (`npm run migration:run --workspace=@ordella/api`)
- [ ] `infrastructure/scripts/check-migration-safety.sh` passes with `NODE_ENV=production` (no destructive `up()` without approval)
- [ ] Pre-deploy backup script tested: `backup-postgres.sh` produces a restorable `.sql.gz`
- [ ] API Docker image builds from `infrastructure/docker/api/Dockerfile` and starts with health check passing
- [ ] CI workflow (`.github/workflows/ci.yml`) passes on `main` (build + migration safety)

### Multi-tenant Isolation & Routing

- [ ] Two test tenants (A and B) exist with distinct `subdomain` / `slug` values
- [ ] `GET /api/v1/public/domain/resolve?domain={tenant-a-subdomain}.{PLATFORM_BASE_DOMAIN}` returns Tenant A `tenantId` only
- [ ] API request with Tenant A JWT + `X-Tenant-Id` for Tenant B returns 403/404 on tenant-scoped data (orders, branding, billing)
- [ ] `tenant_domains` migration (`1737650000022`) applied; at least one verified custom domain mapped in staging (or subdomain-only documented as beta scope)
- [ ] Storefront `middleware.ts` sets `ordella_tenant_id` cookie matching resolved tenant on tenant host

### Authentication & RBAC

- [ ] `POST /api/v1/onboarding/signup` creates tenant + admin user and returns valid JWT
- [ ] Admin role can access `PATCH /api/v1/onboarding/branding` and `GET /api/v1/billing/usage`
- [ ] Manager role receives 403 on `POST /api/v1/billing/subscribe` (or billing update routes)
- [ ] Staff role receives 403 on admin settings routes (`tenant:settings:update` without permission)
- [ ] Unauthenticated request to protected admin route returns 401
- [ ] `JWT_SECRET` in production is not the default `change-me-local-dev-only`

### Core Business Flows

- [ ] Admin can create at least one product and category via Admin UI (API returns 200, not `NotImplementedException`)
- [ ] Admin can list and view orders for the tenant via Admin UI / `GET /api/v1/admin/orders`
- [ ] POS flow completes on staging: add item → place order → order appears in admin order list (or documented cash-only MVP)
- [ ] Storefront flow completes on staging: menu load → basket → checkout → order ID returned (even if payment stubbed)
- [ ] KDS WebSocket receives new order event for correct `tenantId` within 5 seconds of order creation
- [ ] Tenant onboarding wizard can be completed through billing/branding steps without 500 errors
- [ ] Critical paths documented as **BLOCKED** in waiver register if still returning `NotImplementedException` (deliveries CRUD, promotions CRUD, etc.)

### Payments & Billing (Stripe)

- [ ] SaaS billing: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set in staging (test mode)
- [ ] `POST /api/v1/billing/webhook` rejects requests without valid `stripe-signature` (400)
- [ ] Admin can subscribe tenant to Starter on staging; `tenant_billing.plan` and `subscription_status` update in DB
- [ ] Stripe webhook `customer.subscription.updated` syncs status to `tenant_billing` (verified via Stripe CLI or Dashboard)
- [ ] Plan downgrade blocked when usage exceeds target plan (`PLAN_DOWNGRADE_NOT_ALLOWED`)
- [ ] Order checkout payment path status documented: **live Stripe PI** vs **placeholder** (P0 requires live OR explicit beta scope = cash/offline only)

### Branding & Theming

- [ ] `GET /api/v1/public/theme/{tenantId}` returns saved colors/logo for configured tenant
- [ ] Admin Settings → Branding saves theme; storefront shows updated primary color after refresh
- [ ] Two tenants display different logos/themes when viewed on respective hosts

### Performance & Load

- [ ] Staging API p95 &lt; 2s for `GET /api/v1/health` and `GET /api/v1/public/domain/resolve` under 10 concurrent users (smoke test)
- [ ] No unbounded error loop or memory growth after 1 hour API uptime on staging

### Security & Compliance

- [ ] `CORS_ORIGINS` in production lists only known frontend origins (no `*` in prod)
- [ ] Per-IP rate limit returns 429 after exceeding `RATE_LIMIT_IP_PER_MIN` on staging
- [ ] Response includes `X-Content-Type-Options: nosniff` on API health endpoint
- [ ] No `sk_live_`, `JWT_SECRET`, or passwords appear in application logs (spot-check 100 lines)
- [ ] Billing webhook route exempt from breaking rate limits but not from signature validation

### Observability & Monitoring

- [ ] External synthetic monitor pings `/api/v1/health/live` every ≤ 60s with alert on 2 failures
- [ ] `SENTRY_DSN` configured on staging; test error appears in Sentry project
- [ ] HTTP requests logged with method, path, and duration (`LoggingInterceptor`)

### Disaster Recovery

- [ ] Database backup restored to a clean DB at least once; API smoke test (health + login) passes post-restore
- [ ] Documented rollback: previous API Docker image tag + migration compatibility verified
- [ ] Redis outage tested: API remains up; health shows `degraded` not total outage

### Docs & Operations

- [ ] `infrastructure/deployment/SECRETS.md` followed for secret storage (no secrets in repo)
- [ ] On-call contact and escalation path documented (who gets paged on health failure)
- [ ] Private beta tenant onboarding steps written (signup → menu → first order) for support team
- [ ] Known gaps table in test plan appendix reviewed; waivers signed for any open P0 **BLOCKED** items

---

## P1 — Public beta gate

*Required before marketing signup or self-serve tenant creation at scale.*

### Infrastructure & Stability

- [ ] Production environment deployed with separate Postgres, Redis, and S3 from staging
- [ ] Production Stripe uses **live** keys (`sk_live_`); staging remains test mode only
- [ ] All five frontends deployed (Admin, POS, Storefront, Driver, Customer) with correct `NEXT_PUBLIC_API_URL`
- [ ] `RUN_MIGRATIONS_ON_BOOT=false` in production; migrations run via CI/`migrate-deploy.sh` only
- [ ] Turbo CI builds all shipped apps on every `main` merge
- [ ] Frontend Docker or Vercel deploy pipeline documented and repeatable

### Multi-tenant Isolation & Routing

- [ ] Production DNS: wildcard `*.ordella.com` (or chosen base domain) points to storefront/API ingress
- [ ] Custom domain onboarding runbook: add `tenant_domains` row, `verified=true`, TLS cert issued
- [ ] Penetration spot-check: 10 random tenant UUIDs cannot be enumerated via public APIs

### Authentication & RBAC

- [ ] Staff invite → accept → login with assigned role works end-to-end (email delivery or approved manual token flow)
- [ ] Driver role can update only assigned deliveries, not admin catalog
- [ ] Customer app login isolates order history to authenticated customer
- [ ] JWT expiry enforced; expired token returns 401 on protected routes
- [ ] `WS_REQUIRE_AUTH=true` on production if KDS exposed to public internet

### Core Business Flows

- [ ] **POS:** cart → payment → receipt → KDS ticket verified on staging with real payment method
- [ ] **Storefront:** menu → basket → Stripe test/live payment → order tracking page updates status
- [ ] **Delivery:** assign driver → driver app status transitions → delivered (or waived with “pickup only” beta label)
- [ ] **Customer app:** order history, reorder, and live tracking verified against API
- [ ] **Admin:** inventory adjustment reflects in stock level; promotion apply at checkout (if promotions API live)
- [ ] **Admin reports:** sales report returns non-zero totals matching DB for known test day
- [ ] Order admin status override with `adminOverride` tested without breaking terminal-state rules

### Payments & Billing (Stripe)

- [ ] Order payments use real Stripe PaymentIntent flow (not `[placeholder]` gateway logs)
- [ ] Refund from admin creates Stripe refund and updates local payment record
- [ ] SaaS trial → active → `past_due` (simulated failed invoice) → recovery tested on staging
- [ ] `invoice.payment_failed` webhook sets `subscription_status=past_due`
- [ ] Admin Billing tab shows usage, invoices, and plan change matching API
- [ ] Free-plan order/location limits enforced (`PLAN_LIMIT_EXCEEDED` when over limit)

### Branding & Theming

- [ ] Logo upload stored in S3 and served over HTTPS from production CDN/public URL
- [ ] Theme preset (light/dark/custom) persists across Admin, POS, and Storefront for same tenant
- [ ] `GET /api/v1/public/domain/resolve` includes `theme` payload for mapped hosts

### Performance & Load

- [ ] k6 (or equivalent) lunch-rush scenario: 100 orders / 15 min on staging with &lt; 2% 5xx errors
- [ ] p95 latency documented for: domain resolve, menu list, order create (within team SLA)
- [ ] 20 concurrent KDS WebSocket clients stable for 30 minutes under order burst

### Security & Compliance

- [ ] Per-tenant rate limit returns 429 when exceeding `RATE_LIMIT_TENANT_PER_MIN`
- [ ] Security headers verified on production API (`curl -I`)
- [ ] Dependency audit: no critical npm vulnerabilities unmitigated in API and frontends
- [ ] PII exposure review: driver cannot see full card numbers; customer phone masked where applicable

### Observability & Monitoring

- [ ] Readiness monitor on `/api/v1/health` alerts when database check fails
- [ ] Sentry production project with environment tag; alert on new issue spike
- [ ] 5xx error rate alert (&gt; 1% over 5 minutes) configured
- [ ] Runbook link attached to each monitor (what to check first)

### Disaster Recovery

- [ ] Quarterly backup/restore drill scheduled and last run date recorded
- [ ] Stripe outage runbook: checkout error messaging + no double-charge verified
- [ ] SMTP outage: staff invite queues or surfaces admin-visible failure

### Docs & Operations

- [ ] Public beta terms + data processing note published (even if minimal)
- [ ] Support playbook: tenant locked out, billing failed, wrong domain mapping
- [ ] Incident template (severity, comms, rollback) in `infrastructure/deployment/` or wiki
- [ ] Status page or comms channel defined for outages

---

## P2 — Full launch gate

*Polish, scale, and operational maturity before general availability.*

### Infrastructure & Stability

- [ ] BullMQ workers deployed; queue health check no longer placeholder
- [ ] Auto-scaling policy for API containers based on CPU/latency
- [ ] Redis persistence and memory alerts configured
- [ ] Multi-region or HA Postgres failover documented (or single-region risk accepted in writing)
- [ ] CDN cache hit ratio monitored for storefront static assets and menu routes

### Multi-tenant Isolation & Routing

- [ ] Automated custom-domain verification (DNS TXT) replaces manual `verified=true`
- [ ] Tenant offboarding: data export + domain release procedure tested

### Authentication & RBAC

- [ ] Session list/terminate API implemented and tested
- [ ] API keys for integrations scoped per tenant with rotation procedure
- [ ] MFA for admin accounts (if in scope) tested

### Core Business Flows

- [ ] Promotions engine: create, activate, usage report, stack rules validated
- [ ] Full delivery lifecycle including proof-of-delivery capture in driver app
- [ ] Wastage, stock transfer, and low-stock alerts operational
- [ ] POS offline/degraded mode documented (or scope excluded)
- [ ] KDS station-level filtering (`station` room) verified for multi-station kitchens

### Payments & Billing (Stripe)

- [ ] Stripe metered usage sync implemented (beyond placeholder log)
- [ ] Enterprise plan manual provisioning workflow documented
- [ ] Payment reconciliation job runs daily without unresolved mismatches
- [ ] 3DS and international cards tested for target markets

### Branding & Theming

- [ ] Image optimization pipeline (WebP/AVIF) for logos and menu images
- [ ] Custom font upload or Google Fonts allowlist per tenant
- [ ] Email templates use tenant branding

### Performance & Load

- [ ] Peak load test at 3× expected public-beta traffic with &lt; 1% errors
- [ ] Database slow-query log reviewed; no query &gt; 500ms p95 without index plan
- [ ] Notification queue drains 1k jobs within SLA

### Security & Compliance

- [ ] Annual penetration test or third-party security review completed
- [ ] GDPR/CCPA data export and delete request procedure tested
- [ ] Audit log for admin actions (who changed prices, refunded orders)
- [ ] `WS_REQUIRE_AUTH` + tenant room join validated against cross-tenant socket sniffing

### Observability & Monitoring

- [ ] Distributed tracing (OpenTelemetry) across API and critical paths
- [ ] Business dashboards: orders/min, failed payments, signup funnel
- [ ] Log retention policy meets compliance (e.g. 30–90 days)

### Disaster Recovery

- [ ] RTO/RPO targets documented and last drill met them
- [ ] Multi-AZ failure simulation completed
- [ ] Chaos test: kill API pod during checkout; user sees safe retry, no duplicate order

### Docs & Operations

- [ ] Public API documentation published (OpenAPI or `docs/api-spec-v1.0.md` maintained)
- [ ] Tenant-facing help center / FAQ linked from onboarding
- [ ] SLA and support tiers defined for paying customers
- [ ] Post-launch hypercare schedule (first 2 weeks on-call staffing)

---

## Release gate summary

### Private beta (first real tenant) — **P0 all green**

You may onboard the first pilot restaurant when:

1. **Staging and production are isolated** with working health checks, migrations, and backups.
2. **Tenants cannot see each other’s data** (routing + API isolation proven).
3. **Admin can sign up, brand the store, build a menu, and complete at least one order path** (POS and/or storefront) without server errors.
4. **SaaS billing webhooks and subscription state** are wired, or billing is waived in writing for pilot.
5. **Order payments are either live Stripe or explicitly scoped** to cash/offline for pilot only.
6. **Monitoring and on-call** exist; secrets are not in git; rollback is documented.

*If any P0 item is unchecked, status is **NO-GO** unless a signed waiver names the risk and expiry date.*

---

### Public beta — **P0 + P1 all green**

You may open self-serve or marketed signup when:

1. Everything required for private beta remains true **in production**.
2. **All five apps** are deployed with production Stripe (orders + subscriptions as scoped).
3. **End-to-end flows work** for POS, storefront payment, admin operations, and (if offered) delivery and customer app.
4. **Load and security baselines** met; alerts fire correctly; runbooks exist for billing, auth, and domain issues.
5. **No open P1 waiver** for payments, isolation, or observability without executive approval.

---

### Full launch — **P0 + P1 + P2 all green**

You may announce general availability when:

1. Public beta criteria remain satisfied at higher scale.
2. **Operational maturity** is in place: HA/scale plan, queue workers, reconciliation, compliance procedures, and incident/SLA docs.
3. **Performance at 3× peak** and **security review** completed.
4. **Disaster recovery drills** meet documented RTO/RPO.
5. Product gaps explicitly deferred (e.g. enterprise sales-led billing) are removed from marketing claims.

---

## Sign-off log

| Gate | Date | Decision (GO / NO-GO) | Approver | Open waivers |
|------|------|------------------------|----------|--------------|
| Private beta | | | | |
| Public beta | | | | |
| Full launch | | | | |

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-24 | Initial checklist aligned with platform implementation and test plan |
