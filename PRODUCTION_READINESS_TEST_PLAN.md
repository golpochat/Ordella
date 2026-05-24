# Ordella — Production Readiness Test Plan

**Version:** 1.0  
**Last updated:** 2026-05-24  
**Audience:** Engineering, QA, DevOps, Release managers  

This document is the canonical checklist to determine whether the Ordella multi-tenant restaurant SaaS platform is safe to operate in **production**. Each test case includes preconditions, steps, expected results, and a suggested automation level.

---

## How to use this plan

| Symbol | Meaning |
|--------|---------|
| **P0** | Blocker — must pass before any production traffic |
| **P1** | Required for GA — pass or have approved waiver |
| **P2** | Recommended — improves confidence and operability |

| Automation | When to use |
|------------|-------------|
| **Manual** | Exploratory, one-off drills, UI flows, third-party dashboards |
| **Integration** | API/DB assertions in CI (Jest/Supertest, Playwright API) |
| **Load** | k6, Artillery, Locust against staging |
| **Synthetic** | UptimeRobot, Better Stack, Datadog Synthetics in prod |

**Environments:** Run P0/P1 integration tests on **staging** (production-like config). Run destructive drills only on staging. Production validation uses read-only checks and synthetic monitors unless during a controlled release window.

**Sign-off:** Each section ends with a sign-off line. Release is approved only when all P0 cases pass and P1 waivers are documented.

> **Implementation note (current codebase):** Many domain CRUD services under `apps/api/src/modules/*` still throw `NotImplementedException`. Admin, onboarding, billing, platform, KDS, and some order paths are further along. Mark affected cases **BLOCKED** until the API returns success; do not treat green UI alone as production-ready.

---

## Table of contents

1. [Infrastructure & Environments](#1-infrastructure--environments)
2. [Multi-tenant & Routing](#2-multi-tenant--routing)
3. [Authentication, Authorization & RBAC](#3-authentication-authorization--rbac)
4. [Core Business Flows (End-to-End)](#4-core-business-flows-end-to-end)
5. [Payments & Billing (Stripe)](#5-payments--billing-stripe)
6. [Branding, Theming & Domains](#6-branding-theming--domains)
7. [Performance & Load](#7-performance--load)
8. [Security & Compliance](#8-security--compliance)
9. [Observability & Operations](#9-observability--operations)
10. [Disaster Recovery & Failure Modes](#10-disaster-recovery--failure-modes)
11. [Appendix](#appendix)

---

## 1) Infrastructure & Environments

**Goal:** Confirm runtime topology, environment isolation, and deploy mechanics match `infrastructure/deployment/`.

### 1.1 API container health

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | API liveness probe |
| **Preconditions** | API deployed (Docker or host); `API_PORT` exposed |
| **Steps** | `GET {API_URL}/api/v1/health/live` |
| **Expected** | HTTP 200; `{ success: true, data: { status: "ok" } }` |
| **Automation** | Synthetic (30s interval) |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | API readiness (DB + Redis) |
| **Preconditions** | Postgres and Redis reachable; migrations applied |
| **Steps** | `GET {API_URL}/api/v1/health` |
| **Expected** | HTTP 200; `data.status` is `ok` or `degraded`; `checks.database.status` = `ok`; Redis `ok` or documented `not configured` |
| **Automation** | Synthetic + Integration |

### 1.2 Data stores

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | PostgreSQL connectivity |
| **Preconditions** | `DATABASE_URL` set per environment |
| **Steps** | Connect with `psql` or health endpoint; run `SELECT 1` |
| **Expected** | Connection succeeds; no SSL errors in prod |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Redis connectivity |
| **Preconditions** | `REDIS_URL` set (staging/prod) |
| **Steps** | `redis-cli -u $REDIS_URL PING` |
| **Expected** | `PONG`; used for rate limiting when configured |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | S3-compatible storage |
| **Preconditions** | `S3_*` env vars; bucket exists |
| **Steps** | Upload test asset (logo) via branding API; fetch public URL |
| **Expected** | Object persisted; URL returns 200 |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Name** | Queue / BullMQ readiness |
| **Preconditions** | Redis available; workers deployed (when implemented) |
| **Steps** | Enqueue test job; verify consumer processes it |
| **Expected** | Job completes; health reports queue `ok` (currently placeholder in API) |
| **Automation** | Integration |

### 1.3 Environment separation

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Dev / staging / prod isolation |
| **Preconditions** | Three env configs from `infrastructure/env/*.example` |
| **Steps** | Compare `DATABASE_URL`, `REDIS_URL`, `STRIPE_*`, `JWT_SECRET`, `S3_BUCKET` across envs |
| **Expected** | No shared secrets or databases between staging and production |
| **Automation** | Manual (checklist) |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Stripe mode separation |
| **Preconditions** | Stripe dashboard access |
| **Steps** | Verify staging uses test keys (`sk_test_`); production uses live keys (`sk_live_`) |
| **Expected** | No test keys in production env store |
| **Automation** | Manual |

### 1.4 Migrations, backups, rollbacks

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Migration apply on staging |
| **Preconditions** | Clean staging DB or latest snapshot |
| **Steps** | `sh infrastructure/scripts/migrate-deploy.sh` (or CI deploy-api workflow) |
| **Expected** | All migrations in `apps/api/src/database/migrations/` apply without error |
| **Automation** | Integration (CI) |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Production destructive migration guard |
| **Preconditions** | `NODE_ENV=production` |
| **Steps** | Run `infrastructure/scripts/check-migration-safety.sh` |
| **Expected** | Fails if any migration `up()` contains `DROP TABLE`, `TRUNCATE`, etc., unless `ALLOW_DESTRUCTIVE_MIGRATIONS=true` |
| **Automation** | Integration (CI) |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Pre-migration backup drill |
| **Preconditions** | `pg_dump` available; staging `DATABASE_URL` |
| **Steps** | `DATABASE_URL=... sh infrastructure/scripts/backup-postgres.sh` |
| **Expected** | `.sql.gz` artifact created; restore to empty DB succeeds |
| **Automation** | Manual (quarterly drill) |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | API rollback procedure |
| **Preconditions** | Previous Docker image tag documented |
| **Steps** | Deploy prior image; verify health; no new migrations required on rollback |
| **Expected** | Service healthy; no schema mismatch errors |
| **Automation** | Manual (runbook) |

### 1.5 Frontends deployment

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Admin UI build + deploy |
| **Preconditions** | Vercel/Docker pipeline configured |
| **Steps** | `npx turbo run build --filter=@ordella/admin-ui`; deploy artifact |
| **Expected** | App loads; `NEXT_PUBLIC_API_URL` points to correct API |
| **Automation** | Integration (CI) |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Storefront / POS / Driver / Customer apps |
| **Preconditions** | Same as above per app |
| **Steps** | Build each workspace; smoke load `/` |
| **Expected** | No build errors; env-specific API URL |
| **Automation** | Integration (CI matrix) |

**Section sign-off:** _______________ Date: ___________

---

## 2) Multi-tenant & Routing

**Goal:** Validate `TenantRoutingService`, `tenant_domains`, storefront middleware, and isolation.

**Reference endpoints:**
- `GET /api/v1/public/domain/resolve?domain={host}`
- Header: `X-Tenant-Id` (UUID or slug)

### 2.1 Subdomain routing

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Subdomain → tenant A |
| **Preconditions** | Tenant A with `subdomain=tenant-a`; `PLATFORM_BASE_DOMAIN=ordella.com` (staging) |
| **Steps** | Call domain resolve with `tenant-a.staging.ordella.com`; API request with `Host` header |
| **Expected** | `tenantId` = Tenant A UUID; `routingSource` = `subdomain` |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Subdomain → tenant B (isolation) |
| **Preconditions** | Tenant B with different subdomain |
| **Steps** | Same as above for Tenant B |
| **Expected** | Different `tenantId`; no cross-leak |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Storefront middleware sets tenant cookie |
| **Preconditions** | Storefront deployed; DNS/host mapping to tenant subdomain |
| **Steps** | Open storefront on `tenant-a.*`; inspect `ordella_tenant_id` cookie and `x-tenant-id` header on API calls |
| **Expected** | Cookie matches Tenant A UUID |
| **Automation** | Manual / Playwright |

### 2.2 Custom domains

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Custom domain mapping |
| **Preconditions** | Row in `tenant_domains` for `www.restaurant.com`, `verified=true`, linked to Tenant A |
| **Steps** | `GET /api/v1/public/domain/resolve?domain=www.restaurant.com` |
| **Expected** | Tenant A metadata; `routingSource` = `custom` |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Unverified domain rejected |
| **Preconditions** | Domain row with `verified=false` |
| **Steps** | Resolve domain |
| **Expected** | 404 `DOMAIN_NOT_MAPPED` or no tenant match |
| **Automation** | Integration |

### 2.3 Onboarding / platform fallback

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Onboarding host has no tenant context |
| **Preconditions** | `ONBOARDING_HOST=app.ordella.com` |
| **Steps** | Hit API from onboarding host without `X-Tenant-Id` |
| **Expected** | No tenant middleware context; signup routes work |
| **Automation** | Integration |

### 2.4 Cross-tenant isolation

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Tenant A token cannot read Tenant B orders |
| **Preconditions** | Users in both tenants; order exists in Tenant B |
| **Steps** | Authenticate as Tenant A admin; `GET /api/v1/admin/orders/{tenantB_orderId}` with Tenant A header |
| **Expected** | 404 or 403; never returns Tenant B data |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Wrong `X-Tenant-Id` vs JWT tenant |
| **Preconditions** | JWT issued for Tenant A |
| **Steps** | Send Tenant B in `X-Tenant-Id` |
| **Expected** | Request rejected or scoped to JWT tenant (document actual behavior) |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Branding/theme isolation |
| **Preconditions** | Distinct themes per tenant |
| **Steps** | `GET /api/v1/public/theme/{tenantA_id}` vs tenant B |
| **Expected** | Different theme payloads |
| **Automation** | Integration |

**Section sign-off:** _______________ Date: ___________

---

## 3) Authentication, Authorization & RBAC

**Goal:** Validate JWT auth, role matrix in `role-permissions.ts`, and per-app access.

**Roles:** `admin`, `manager`, `staff`, `driver`, `customer`

### 3.1 Authentication

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Tenant signup + JWT |
| **Preconditions** | `POST /api/v1/onboarding/signup` enabled |
| **Steps** | Sign up new tenant; capture access token |
| **Expected** | 201/200; JWT contains `permissions` (admin gets `*`); tenant created |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Invalid credentials rejected |
| **Preconditions** | Existing user |
| **Steps** | Login with wrong password |
| **Expected** | 401; no token |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Token expiry |
| **Preconditions** | Short `JWT_EXPIRES_IN` on staging |
| **Steps** | Wait for expiry; call protected route |
| **Expected** | 401 Unauthorized |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Refresh / logout |
| **Preconditions** | Refresh flow implemented |
| **Steps** | Refresh token; logout; retry with old token |
| **Expected** | New token works; old token invalid after logout |
| **Automation** | Integration / Manual |

### 3.2 RBAC by role

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Admin full access |
| **Preconditions** | User with `admin` role |
| **Steps** | Access billing, branding, staff, admin products/orders |
| **Expected** | 200 on permitted routes |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Manager limited write |
| **Preconditions** | `manager` user |
| **Steps** | Update product (allowed); invite staff / change billing (denied) |
| **Expected** | Products 200; billing/staff 403 |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Staff POS/KDS only |
| **Preconditions** | `staff` user |
| **Steps** | Access POS routes; access admin settings |
| **Expected** | POS/KDS allowed; admin settings 403 |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Driver deliveries only |
| **Preconditions** | `driver` user |
| **Steps** | List/update assigned delivery; access admin products |
| **Expected** | Deliveries allowed; catalog admin 403 |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Customer scoped data |
| **Preconditions** | Customer auth (when wired) |
| **Steps** | View own orders only |
| **Expected** | Cannot read other customers' orders |
| **Automation** | Integration |

### 3.3 Per-application access

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Admin UI gate |
| **Preconditions** | Admin UI deployed |
| **Steps** | Login as each role; navigate settings, orders, billing |
| **Expected** | UI hides or API blocks unauthorized sections |
| **Automation** | Manual / Playwright |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | POS UI staff session |
| **Preconditions** | POS session modal / staff login |
| **Steps** | Open POS without auth → blocked; staff login → cart available |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | KDS WebSocket subscription |
| **Preconditions** | KDS screen; valid tenant |
| **Steps** | Connect to `/kds` namespace; emit `kds.subscribe` with `tenantId` |
| **Expected** | Receives order events for that tenant only |
| **Automation** | Manual / Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Driver app task list |
| **Preconditions** | Driver logged in |
| **Steps** | View assigned tasks; update status |
| **Expected** | Only assigned tenant deliveries visible |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Storefront guest checkout |
| **Preconditions** | Public menu |
| **Steps** | Browse menu without login; checkout |
| **Expected** | Public catalog works; payment may require customer identity per config |
| **Automation** | Manual |

**Section sign-off:** _______________ Date: ___________

---

## 4) Core Business Flows (End-to-End)

**Goal:** Validate full journeys across apps. **Blocked** items require backend implementation beyond UI shells.

### 4.1 Tenant onboarding

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Signup → wizard → branding |
| **Preconditions** | Fresh email |
| **Steps** | `POST /onboarding/signup` → complete wizard steps → set branding |
| **Expected** | `tenant_onboarding.is_complete` progresses; branding saved |
| **Automation** | Integration + Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Staff invite flow |
| **Preconditions** | Admin user |
| **Steps** | Invite staff; accept invite (email placeholder logs token) |
| **Expected** | Membership created with correct role |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | First location + menu |
| **Preconditions** | Admin catalog APIs functional |
| **Steps** | Create location; add category + product |
| **Expected** | Menu visible on storefront |
| **Automation** | Manual |

### 4.2 In-store POS flow

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | POS cart → order → payment |
| **Preconditions** | Products exist; POS API implemented |
| **Steps** | Add items; checkout; pay (cash/card) |
| **Expected** | Order `paid`; payment record created |
| **Automation** | Manual (BLOCKED if POS/order APIs 501) |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Receipt + KDS ticket |
| **Preconditions** | Order placed |
| **Steps** | View receipt screen; observe KDS |
| **Expected** | KDS shows new ticket; line items update on prep |
| **Automation** | Manual |

### 4.3 Online ordering (storefront)

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Menu → basket → checkout |
| **Preconditions** | Storefront configured; catalog API returns items |
| **Steps** | Browse `/menu`; add to basket; `/checkout` |
| **Expected** | Totals correct; order draft created |
| **Automation** | Playwright |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Payment + order tracking |
| **Preconditions** | Payment gateway configured |
| **Steps** | Complete payment; open `/order/{id}` |
| **Expected** | Status updates via polling/WebSocket |
| **Automation** | Manual |

### 4.4 Delivery flow

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Assign driver → in transit → delivered |
| **Preconditions** | Delivery order; driver user |
| **Steps** | Assign in admin; driver app accepts; mark delivered + proof |
| **Expected** | Status transitions; proof stored |
| **Automation** | Manual (BLOCKED if deliveries CRUD 501) |

### 4.5 Customer app

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Order history + reorder |
| **Preconditions** | Customer account with past orders |
| **Steps** | Login; view history; reorder |
| **Expected** | Correct orders; new order created from template |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Live tracking |
| **Preconditions** | Active order |
| **Steps** | Open tracking view |
| **Expected** | Status matches KDS/order API |
| **Automation** | Manual |

### 4.6 Admin operations

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Products CRUD |
| **Preconditions** | Admin `products:*` permission |
| **Steps** | Create, edit, archive product via Admin UI |
| **Expected** | Reflects in POS/storefront menu |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Inventory adjust |
| **Preconditions** | Stock item exists |
| **Steps** | POST admin inventory adjust |
| **Expected** | Stock level updated; movement logged |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Order admin override |
| **Preconditions** | Open order |
| **Steps** | PATCH status with `adminOverride` |
| **Expected** | Non-standard transition allowed except from terminal state |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Promotions create + apply |
| **Preconditions** | Promotions API implemented |
| **Steps** | Create promo; place order with code |
| **Expected** | Discount applied once |
| **Automation** | Manual (BLOCKED if promotions 501) |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Reports dashboards |
| **Preconditions** | Orders exist in date range |
| **Steps** | Open reports sales/inventory/delivery |
| **Expected** | Non-empty aggregates match DB spot-check |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Settings (business, hours, billing tab) |
| **Preconditions** | Admin settings access |
| **Steps** | Update business info, branding, billing plan |
| **Expected** | Persists per tenant |
| **Automation** | Manual |

**Section sign-off:** _______________ Date: ___________

---

## 5) Payments & Billing (Stripe)

**Goal:** Separate **order payments** (checkout) from **SaaS billing** (subscriptions).

### 5.1 Order payments (checkout)

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Card authorize + capture |
| **Preconditions** | Stripe **order** integration live (not placeholder gateway) |
| **Steps** | Place order; pay with test card `4242...` |
| **Expected** | PaymentIntent succeeded; order `paid` |
| **Automation** | Integration (Stripe test mode) |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Partial/full refund |
| **Preconditions** | Captured payment |
| **Steps** | Issue refund from admin |
| **Expected** | Refund record; order/payment status updated |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Payment failure handling |
| **Preconditions** | Decline test card `4000...0002` |
| **Steps** | Attempt checkout |
| **Expected** | User sees error; order not marked paid |
| **Automation** | Manual |

> **Current state:** `StripeGateway` for orders may still log `[placeholder]` — treat P0 order payment cases as **BLOCKED** until real Stripe PI integration ships.

### 5.2 SaaS subscriptions (billing module)

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Subscribe to Starter |
| **Preconditions** | `STRIPE_SECRET_KEY` + `STRIPE_PRICE_STARTER`; admin JWT |
| **Steps** | `POST /api/v1/billing/subscribe` `{ planId: "starter", paymentMethodId }` |
| **Expected** | `tenant_billing.plan=starter`; `subscription_status=active` or `trialing` |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Plan change upgrade |
| **Preconditions** | Active Starter |
| **Steps** | `POST /api/v1/billing/change-plan` `{ planId: "pro" }` |
| **Expected** | Plan updated; Stripe subscription updated |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Downgrade blocked by usage |
| **Preconditions** | Usage exceeds Free limits |
| **Steps** | Attempt downgrade to `free` |
| **Expected** | 400 `PLAN_DOWNGRADE_NOT_ALLOWED` |
| **Automation** | Integration |

### 5.3 Plan limits

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Order monthly limit (Free: 100) |
| **Preconditions** | Tenant on Free; usage near limit |
| **Steps** | `recordOrderUsage` until limit; place order |
| **Expected** | Soft warn at 90%; hard block at 100 with `PLAN_LIMIT_EXCEEDED` |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Location limit (Free: 1) |
| **Preconditions** | Free plan; 1 location exists |
| **Steps** | Create second location |
| **Expected** | Blocked when enforcement wired |
| **Automation** | Integration |

**Plan reference:** `BillingPlanRegistry` — Free 1 loc / 100 orders; Starter 3 / 1k; Pro unlimited loc / 10k orders.

### 5.4 Stripe webhooks (billing)

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Webhook signature validation |
| **Preconditions** | `STRIPE_WEBHOOK_SECRET` |
| **Steps** | POST `/api/v1/billing/webhook` without signature |
| **Expected** | 400 Bad Request |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | `customer.subscription.updated` |
| **Preconditions** | Stripe CLI `stripe listen --forward-to` |
| **Steps** | Trigger subscription update in Dashboard |
| **Expected** | `tenant_billing.subscription_status` synced |
| **Automation** | Manual + Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | `invoice.payment_failed` |
| **Preconditions** | Failing payment method on subscription |
| **Steps** | Trigger failed invoice |
| **Expected** | `subscription_status=past_due` |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | `customer.subscription.deleted` |
| **Preconditions** | Cancel subscription |
| **Steps** | Cancel in Stripe |
| **Expected** | Local status `canceled`; access policy defined |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Idempotent webhook replay |
| **Preconditions** | Same event ID sent twice |
| **Steps** | Replay Stripe event |
| **Expected** | No duplicate side effects |
| **Automation** | Integration |

### 5.5 Billing UI

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Admin Billing settings tab |
| **Preconditions** | Admin logged in |
| **Steps** | Open Settings → Billing; view usage, invoices, change plan |
| **Expected** | Matches API data; trial badge when `trialing` |
| **Automation** | Manual |

**Section sign-off:** _______________ Date: ___________

---

## 6) Branding, Theming & Domains

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Theme API per tenant |
| **Preconditions** | Branding configured for Tenant A |
| **Steps** | `GET /api/v1/public/theme/{tenantA_id}` |
| **Expected** | Colors, typography, preset, logo URLs |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Theme on storefront |
| **Preconditions** | `ThemeProvider` + `ThemeRoot` |
| **Steps** | Load storefront for Tenant A |
| **Expected** | CSS variables match API theme |
| **Automation** | Manual / Playwright screenshot diff |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Theme on Admin + POS |
| **Preconditions** | Same tenant session |
| **Steps** | Compare primary color / logo |
| **Expected** | Consistent with branding settings |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Presets (light / dark / custom) |
| **Preconditions** | Admin branding panel |
| **Steps** | Switch preset; save |
| **Expected** | Live preview updates; persisted |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Domain resolve includes theme |
| **Preconditions** | Custom or subdomain host |
| **Steps** | `GET /api/v1/public/domain/resolve?domain=...` |
| **Expected** | `theme` object populated (not null for mapped tenants) |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Name** | Logo CDN caching |
| **Preconditions** | Logo on S3/CDN |
| **Steps** | Check `Cache-Control` on asset URL |
| **Expected** | Immutable or long TTL for versioned URLs |
| **Automation** | Manual |

**Section sign-off:** _______________ Date: ___________

---

## 7) Performance & Load

**Suggested staging targets (adjust per SLA):**

| Endpoint | p95 target |
|----------|------------|
| `GET /api/v1/public/domain/resolve` | < 150 ms |
| `GET /api/v1/public/theme/:id` | < 200 ms |
| `GET /api/v1/admin/products` | < 400 ms |
| `POST /api/v1/orders` (create) | < 800 ms |
| KDS WebSocket event delivery | < 2 s |

### 7.1 Baseline latency

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Health + public endpoints baseline |
| **Preconditions** | Staging under normal load |
| **Steps** | Run k6 smoke (10 VUs, 2 min) on health, domain resolve, menu list |
| **Expected** | p95 within targets; error rate < 0.1% |
| **Automation** | Load |

### 7.2 Peak ordering window

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Lunch rush simulation |
| **Preconditions** | Representative catalog size (500 SKUs) |
| **Steps** | k6: 200 concurrent storefront checkouts over 15 min |
| **Expected** | API auto-scales or stays < 2% errors; DB CPU < 80% |
| **Automation** | Load |

### 7.3 KDS & real-time

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | KDS broadcast under load |
| **Preconditions** | 20 KDS clients subscribed |
| **Steps** | Create 100 orders in 5 min |
| **Expected** | All clients receive events; no socket memory leak |
| **Automation** | Load + Manual |

### 7.4 Queue throughput

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Name** | Notification queue backlog |
| **Preconditions** | Workers running |
| **Steps** | Spike 1k notification jobs |
| **Expected** | Queue drains within 10 min; no DLQ growth |
| **Automation** | Load |

**Section sign-off:** _______________ Date: ___________

---

## 8) Security & Compliance

### 8.1 Rate limiting

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Per-IP rate limit |
| **Preconditions** | `RATE_LIMIT_IP_PER_MIN` set (e.g. 120) |
| **Steps** | Send > limit requests/min from one IP to `/api/v1/health` |
| **Expected** | HTTP 429; `Retry-After: 60` |
| **Automation** | Integration / Load |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Per-tenant rate limit |
| **Preconditions** | Valid `X-Tenant-Id`; `RATE_LIMIT_TENANT_PER_MIN` |
| **Steps** | Exceed tenant quota |
| **Expected** | HTTP 429 `Tenant rate limit exceeded` |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Webhook exempt from rate limit |
| **Preconditions** | Stripe webhook path |
| **Steps** | Burst POSTs to `/api/v1/billing/webhook` |
| **Expected** | Not throttled by IP middleware (signature still required) |
| **Automation** | Integration |

### 8.2 CORS & headers

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | CORS allowlist |
| **Preconditions** | `CORS_ORIGINS` set in prod |
| **Steps** | Browser preflight from allowed vs evil origin |
| **Expected** | Allowed origin succeeds; unknown blocked |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Security headers |
| **Preconditions** | API running |
| **Steps** | `curl -I {API_URL}/api/v1/health/live` |
| **Expected** | `X-Content-Type-Options: nosniff`; Helmet headers present |
| **Automation** | Synthetic |

### 8.3 WebSocket auth

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | WS auth when enabled |
| **Preconditions** | `WS_REQUIRE_AUTH=true` |
| **Steps** | Connect to `/kds` without token |
| **Expected** | Connection rejected |
| **Automation** | Integration |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | WS auth with valid JWT |
| **Preconditions** | `WS_REQUIRE_AUTH=true` |
| **Steps** | Connect with `auth.token` or query `token` |
| **Expected** | Connection accepted |
| **Automation** | Integration |

### 8.4 Data protection basics

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Secrets not in logs |
| **Preconditions** | Log aggregation enabled |
| **Steps** | Trigger auth + payment flows; search logs for `sk_live`, `JWT`, passwords |
| **Expected** | No secret material logged |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | PII in API responses |
| **Preconditions** | Customer with phone/email |
| **Steps** | Driver/staff roles fetch order |
| **Expected** | Only necessary PII exposed per role |
| **Automation** | Manual review |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | SQL injection spot check |
| **Preconditions** | Search/filter endpoints |
| **Steps** | Pass `'; DROP TABLE--` in search query |
| **Expected** | Parameterized queries; no DB error leak |
| **Automation** | Integration |

**Section sign-off:** _______________ Date: ___________

---

## 9) Observability & Operations

### 9.1 Logging & errors

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | HTTP request logging |
| **Preconditions** | API under load |
| **Steps** | Generate 50 requests; inspect logs |
| **Expected** | Method, URL, duration logged (`LoggingInterceptor`) |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Sentry error capture |
| **Preconditions** | `SENTRY_DSN` set (staging) |
| **Steps** | Trigger handled 500 (staging only) |
| **Expected** | Event in Sentry with environment tag |
| **Automation** | Manual |

### 9.2 Uptime & alerting

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | External uptime monitor |
| **Preconditions** | Monitor configured |
| **Steps** | Point monitor at `/api/v1/health/live` every 60s |
| **Expected** | Alert on 2 consecutive failures |
| **Automation** | Synthetic |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Readiness alert |
| **Preconditions** | Monitor on `/api/v1/health` |
| **Steps** | Stop Postgres container |
| **Expected** | `status=down`; page on-call |
| **Automation** | Manual drill |

### 9.3 Dashboards & thresholds

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | API error rate alert |
| **Preconditions** | APM or log metrics |
| **Steps** | Define alert: 5xx > 1% over 5 min |
| **Expected** | Notification fires on synthetic spike |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | DB connection pool saturation |
| **Preconditions** | DB metrics |
| **Steps** | Load test until pool exhausted |
| **Expected** | Alert before user-visible failures |
| **Automation** | Load |

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Name** | Redis memory alert |
| **Preconditions** | Redis monitoring |
| **Steps** | Set threshold 80% memory |
| **Expected** | Alert documented in runbook |
| **Automation** | Synthetic |

**Reference:** `infrastructure/deployment/MONITORING.md`

**Section sign-off:** _______________ Date: ___________

---

## 10) Disaster Recovery & Failure Modes

### 10.1 Backup & restore

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Full DB restore drill |
| **Preconditions** | Recent backup artifact |
| **Steps** | Restore to new staging DB; point API; smoke test login + one order |
| **Expected** | RTO < 4h (document actual); data consistent |
| **Automation** | Manual (quarterly) |

### 10.2 Dependency degradation

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Redis unavailable |
| **Preconditions** | Stop Redis |
| **Steps** | Hit API health + authenticated routes |
| **Expected** | Health `degraded`; API serves requests (in-memory rate limit fallback) |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P0 |
| **Name** | Stripe unavailable (order payments) |
| **Preconditions** | Block Stripe egress or use outage simulation |
| **Steps** | Attempt checkout |
| **Expected** | Clear user error; order stays unpaid; no double charge |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Stripe unavailable (SaaS billing) |
| **Preconditions** | Billing API calls |
| **Steps** | Subscribe with Stripe down |
| **Expected** | Graceful error; tenant not left inconsistent |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | Email (SMTP) down |
| **Preconditions** | Staff invite / notifications |
| **Steps** | Invite staff |
| **Expected** | Invite record created; retry queue or admin notified |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Name** | S3 down |
| **Preconditions** | Branding upload |
| **Steps** | Upload logo |
| **Expected** | Error surfaced; app remains usable |
| **Automation** | Manual |

### 10.3 Graceful degradation

| Field | Detail |
|-------|--------|
| **Priority** | P1 |
| **Name** | KDS offline — kitchen fallback |
| **Preconditions** | WebSocket failure |
| **Steps** | Disconnect KDS; use order poll/print |
| **Expected** | Documented fallback; orders still creatable |
| **Automation** | Manual |

| Field | Detail |
|-------|--------|
| **Priority** | P2 |
| **Name** | Reports unavailable |
| **Preconditions** | Reports DB slow/down |
| **Steps** | Open reports |
| **Expected** | Admin core ops (orders, POS) still work |
| **Automation** | Manual |

**Section sign-off:** _______________ Date: ___________

---

## Appendix

### A. Test data matrix (minimum)

| Entity | Tenant A | Tenant B |
|--------|----------|----------|
| Admin user | admin-a@test.com | admin-b@test.com |
| Staff / Driver | 1 each | 1 each |
| Locations | 2 (Starter+) | 1 |
| Products | 10+ | 10+ |
| Custom domain | `www.tenant-a.test` | — |
| Subdomain | `tenant-a.staging.ordella.com` | `tenant-b.staging.ordella.com` |

### B. Stripe test cards

| Card | Scenario |
|------|----------|
| `4242424242424242` | Success |
| `4000000000000002` | Decline |
| `4000000000003220` | 3DS required |

### C. CI commands (staging gate)

```bash
npm ci
npx turbo run build --filter=@ordella/api --filter=@ordella/admin-ui --filter=@ordella/storefront
NODE_ENV=production sh infrastructure/scripts/check-migration-safety.sh
npm run migration:run --workspace=@ordella/api   # against staging DB
# Optional: k6 run infrastructure/load/smoke.js
```

### D. Production go / no-go checklist

| # | Criterion | Pass |
|---|-----------|------|
| 1 | All P0 tests pass or waivers approved | ☐ |
| 2 | No `sk_test` / dev secrets in production | ☐ |
| 3 | Migrations applied; backup < 24h old | ☐ |
| 4 | Uptime + error alerts configured | ☐ |
| 5 | Cross-tenant isolation verified | ☐ |
| 6 | Stripe webhooks receiving events (billing) | ☐ |
| 7 | Order payment integration **not placeholder** | ☐ |
| 8 | Critical E2E flows demonstrated on staging | ☐ |
| 9 | Rollback image tag documented | ☐ |
| 10 | On-call runbook shared | ☐ |

### E. Known gaps tracker (update per release)

| Area | Status | Owner |
|------|--------|-------|
| Domain CRUD services (`NotImplementedException`) | Open | Backend |
| Order Stripe gateway (placeholder) | Open | Payments |
| BullMQ workers | Open | Platform |
| Customer auth E2E | Partial | Auth |
| Deliveries CRUD | Open | Deliveries |

### F. Document history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-24 | Engineering | Initial production readiness plan |

---

**Final release approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Engineering Lead | | | |
| QA Lead | | | |
| DevOps / SRE | | | |
| Product Owner | | | |
