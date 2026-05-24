# Promotions module

Promotions and pricing per **SRS §12 / §47** and **API Spec §9** (blueprint Promotion Service).

## Submodules

| Submodule | Routes | Table |
|-----------|--------|-------|
| `promotions` | CRUD `/promotions` | `promotions` |
| `promotion-rules` | CRUD `/promotion-rules` | `promotion_rules` |
| `promotion-conditions` | CRUD `/promotion-conditions` | `promotion_conditions` |
| `promotion-applications` | `GET/POST /promotion-applications` | `promotion_applications` |

## Lifecycle (SRS §47)

`draft` → `scheduled` → `active` → applied/redeemed → `expired` / `deactivated`

## Promotion types

`percentage`, `fixed`, `buy_x_get_y`

## Migration

`1737650000011-CreatePromotionsSchema.ts`

## Not in this scaffold (future)

API Spec §9.2–§9.3: `/coupons`, `/loyalty/rewards`.
