# Payments module

Payment processing per **SRS §9** and **API Spec §6** (blueprint Payments Service).

## Submodules

| Submodule | Routes | Description |
|-----------|--------|-------------|
| `payments` | CRUD `/payments`, `GET /payments/providers` | Payment records (API Spec §6.1, §6.3) |
| `refunds` | `POST /refunds`, `GET /refunds/:id` | Refunds (API Spec §6.2) |
| `payment-methods` | CRUD `/payment-methods` | Saved / configured methods (SRS §9) |
| `payment-attempts` | `GET /payment-attempts`, `GET /payment-attempts/:id` | Gateway attempt audit log (SRS §9) |

## Domain core

`PaymentsCoreModule` exports **`PaymentsService`** — order payment orchestration:

| Domain name | Table | Key fields |
|-------------|-------|------------|
| Payment | `payments` | `order_id`, `amount`, `currency`, `method`, `status`, `provider_payment_id` (externalRef), `metadata` |
| PaymentAttempt | `payment_attempts` | `attempt_number`, `status`, `error_code`, `error_message` |
| Refund | `refunds` | `amount`, `reason`, `status`, `provider_refund_id` (externalRef) |

Gateway placeholders: Stripe, PayPal, Square, CashDrawer, TerminalPayments.  
Reconciliation placeholders: `PaymentReconciliationService.reconcileDaily`, `reconcileByExternalRef`.

## Entities

- `payments` — ERD §1.5
- `refunds` — ERD §1.5
- `payment_methods` — SRS §9 (tenant / customer methods)
- `payment_attempts` — SRS §9 (provider retry / response log)

## Migrations

- `1737650000006-CreatePaymentsSchema.ts`
- `1737650000015-AddPaymentMetadataColumns.ts` — `metadata`, `error_code`, unique `(tenant_id, order_id)`

## Not in this scaffold (future)

API Spec §6.4: `POST /webhooks/payments` provider webhook handler.
