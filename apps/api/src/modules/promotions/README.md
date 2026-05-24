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

## Domain core

`PromotionsCoreModule` exports **`PromotionsService`**:

| Domain name | Table | Notes |
|-------------|-------|-------|
| Promotion | `promotions` | `metadata`, `type` = coupon \| automatic |
| PromotionRule | `promotion_conditions` | `condition_type` → ruleType, `value` → ruleConfig |
| PromotionAction | `promotion_actions` | `action_type`, `action_config` |
| PromotionApplication | `promotion_applications` | `discount_amount`, `metadata` |

## Promotion types

`coupon`, `automatic` (discount effects live on `promotion_actions`)

## Rule types

`min_order_value`, `product_in_cart`, `category_in_cart`, `customer_segment`, `time_window`

## Action types

`percentage_discount`, `fixed_discount`, `free_item`, `free_delivery`

## Migrations

- `1737650000011-CreatePromotionsSchema.ts`
- `1737650000017-AddPromotionActionsAndMetadata.ts`

## Not in this scaffold (future)

API Spec §9.2–§9.3: `/coupons`, `/loyalty/rewards`.
