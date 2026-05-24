# Deliveries module

Delivery management per **SRS §28 / §44** and **API Spec §7** (blueprint Deliveries Service).

## Submodules

| Submodule | Routes | DB table |
|-----------|--------|----------|
| `delivery-tasks` | CRUD `/deliveries`, tracking, auto-assign, status-history | `delivery_tasks` |
| `delivery-assignments` | CRUD `/delivery-assignments` | `delivery_assignments` |
| `driver-profiles` | CRUD `/drivers` | `driver_profiles` |

## Nested delivery routes

- `GET /deliveries/:id/tracking` — API Spec §7.2 (lat/lng points; future `delivery_tracking` table)
- `GET /deliveries/:id/status-history` — SRS §28 audit log
- `POST /deliveries/:id/auto-assign` — API Spec §7.3

## Entities

- `delivery_tasks` — ERD §1.6 `deliveries`
- `driver_profiles` — ERD §1.6 `drivers`
- `delivery_assignments` — SRS §28 driver assignment
- `delivery_status_history` — SRS §28 / §44 audit trail

## Lifecycle (SRS §44)

`pending` → `assigned` → `accepted` → `en_route_to_store` → `picked_up` → `en_route_to_customer` → `delivered` → `completed`  
Terminal: `failed`, `cancelled`

## Migration

`1737650000007-CreateDeliverySchema.ts`

## Not in this scaffold (future)

ERD `delivery_tracking` table for live GPS breadcrumbs.
