# Tenants module

Multi-tenant organization structure per **SRS §2** and **API Spec §2**.

## Submodules

| Submodule | Routes | Scope |
|-----------|--------|--------|
| `tenants` | `/api/v1/tenants` | Platform (list/create tenants) |
| `stores` | `/api/v1/stores` | Tenant-scoped (SRS hierarchy) |
| `locations` | `/api/v1/locations` | Tenant-scoped |

## Location nested routes (API Spec §2.3–§2.5)

- `GET/PATCH /locations/:id/settings`
- `GET/PATCH /locations/:id/hours`
- `PATCH /locations/:id/status` — `open` \| `closed` \| `busy`

## Entities

- `tenants` — ERD §1.1 (+ `slug`, `subdomain`)
- `stores` — SRS Tenant → Store → Location
- `locations` — ERD §1.1 (+ optional `store_id`)
- `location_settings` — API §2.3
- `location_opening_hours` — API §2.4

## Migration

`1737650000002-CreateTenantsStoresLocationsSchema.ts` (extends auth stub `tenants` table)
