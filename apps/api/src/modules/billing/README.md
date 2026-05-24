# Billing (Stripe SaaS)

Multi-tenant subscription billing. Does not modify order/payment domain services.

## Endpoints (`/api/v1/billing`)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/usage` | `tenant:billing:read` |
| GET | `/invoices` | `tenant:billing:read` |
| POST | `/subscribe` | `tenant:billing:update` |
| POST | `/change-plan` | `tenant:billing:update` |
| POST | `/payment-method` | `tenant:billing:update` |
| POST | `/webhook` | Public (Stripe signature) |

## Plans (`BillingPlanRegistry`)

| Plan | Locations | Orders/month |
|------|-----------|--------------|
| free | 1 | 100 |
| starter | 3 | 1,000 |
| pro | unlimited | 10,000 |
| enterprise | custom | custom |

## Env

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`

Without Stripe keys, the API runs in placeholder mode for local development.

## Usage tracking

Call `UsageTrackingService.recordOrderUsage(tenantId)` / `recordLocationUsage(tenantId)` from integration hooks — not from core order modules.
