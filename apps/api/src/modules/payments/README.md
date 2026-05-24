# Payments module

Payment processing per **SRS §9** and **API Spec §6** (blueprint Payments Service).

## Submodules

| Submodule | Routes | Description |
|-----------|--------|-------------|
| `payments` | CRUD `/payments`, `GET /payments/providers` | Payment records (API Spec §6.1, §6.3) |
| `refunds` | `POST /refunds`, `GET /refunds/:id` | Refunds (API Spec §6.2) |
| `payment-methods` | CRUD `/payment-methods` | Saved / configured methods (SRS §9) |
| `payment-attempts` | `GET /payment-attempts`, `GET /payment-attempts/:id` | Gateway attempt audit log (SRS §9) |

## Entities

- `payments` — ERD §1.5
- `refunds` — ERD §1.5
- `payment_methods` — SRS §9 (tenant / customer methods)
- `payment_attempts` — SRS §9 (provider retry / response log)

## Migration

`1737650000006-CreatePaymentsSchema.ts`

## Not in this scaffold (future)

API Spec §6.4: `POST /webhooks/payments` provider webhook handler.
