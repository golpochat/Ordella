# Orders module

Order lifecycle per **SRS** and **API Spec §5** (blueprint Orders Service).

## Submodules

| Submodule | Routes | Description |
|-----------|--------|-------------|
| `orders` | CRUD `/orders`, cancel `DELETE /orders/:id` | Order header + nested reads |
| `order-items` | POST/PATCH/DELETE `/order-items` | Line items (API Spec §5.2) |

## Nested order routes

- `GET /orders/:id/status-history` — status transition audit trail
- `GET /orders/:id/events` — API Spec §5.6 system/domain events

## Entities

- `orders` — ERD §1.4
- `order_items` — ERD §1.4
- `order_status_history` — SRS lifecycle audit
- `order_events` — ERD §1.4 + event bus (`order.created`, `order.accepted`, …)

## Status flow (API Spec §5.7)

`pending` → `accepted` → `preparing` → `ready` → `out_for_delivery` → `completed` → `refunded`  
`accepted` is the confirmed step (inventory deduct + payment). `ready` may skip to `completed` (pickup / dine-in).  
Terminal: `completed`, `refunded`, `cancelled`, `failed`

Inventory placeholders (`integrations/inventory.service.ts`): soft `reserve` on create, `deduct` on `accepted`, `releaseOrRestore` on `cancelled`/`failed`, `restoreForRefund` on `refunded`.

Payment placeholders: `authorizeOrCapture` on `accepted` (CONFIRMED), `refund` on `refunded`. Order `paymentStatus`: `unpaid` → `paid` → `refunded`. CASH/POS on create auto-transitions to `accepted`.

Delivery placeholders: on `ready` (delivery orders) → `createTask` + `assignDriver`; `out_for_delivery` → `markOutForDelivery`; `completed` → `markDelivered`. Create delivery orders with `deliveryDetails` (fee via `OrderFeeCalculatorService`).

Notifications fire last (after inventory, payment, delivery): `ORDER_CREATED`, `ORDER_CONFIRMED`, `ORDER_PREPARING`, `ORDER_READY`, `ORDER_OUT_FOR_DELIVERY`, `ORDER_COMPLETED`, `ORDER_CANCELLED`, `ORDER_REFUNDED`.

Lifecycle rules live in `domain/order-lifecycle.transitions.ts`.  
`OrderCreationService.createOrder()` handles line pricing, draft totals, promotions, and persistence.  
`OrderPricingService` + `OrderFeeCalculatorService` compute subtotal, discounts, tax, service charge, delivery fee, and grand total.  
`OrderLifecycleService.transition()` records status history and runs step integrations.  
Placeholder integrations (no external APIs) live under `integrations/`.

## Migration

`1737650000005-CreateOrdersSchema.ts`

## Not in this scaffold (future)

API Spec §5.3–§5.5: order-item modifiers, addons, notes.
