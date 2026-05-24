# Onboarding module

Tenant signup, SaaS billing placeholders, branding, staff invites, onboarding wizard, and multi-tenant switching.

## Routes (`/api/v1/onboarding`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | Public | Create tenant + admin user |
| GET | `/tenants` | JWT | List tenants for user email |
| POST | `/tenants/switch` | JWT | Issue JWT for selected tenant |
| POST | `/start` | JWT + tenant | Begin onboarding wizard |
| POST | `/step/menu` | JWT + tenant | Complete catalog step |
| POST | `/step/pos` | JWT + tenant | Complete POS step |
| POST | `/step/delivery` | JWT + tenant | Complete delivery step |
| POST | `/step/payments` | JWT + tenant | Complete payments step |
| POST | `/complete` | JWT + tenant | Finalize onboarding |
| GET/PATCH | `/branding` | Admin | Theme + business info |
| PATCH | `/branding/logo` | Admin | Logo URL placeholder |
| GET/PATCH | `/billing` | Admin | Subscription plan placeholder |
| GET/POST/PATCH | `/staff/*` | Admin | Staff list, invite, roles |

## RBAC roles (seeded per tenant)

- `admin` — full access (`*`)
- `manager` — products, orders, inventory
- `staff` — POS + fulfillment display (FDS)
- `driver` — deliveries
- `customer` — customer app (no admin API permissions)

## Migration

`1737650000020-CreateTenantOnboardingSchema.ts`
