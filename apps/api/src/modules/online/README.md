# Online ordering module

Customer-facing online flow: browse menu, build a session basket, checkout, pay, and track order status.

## Routes (`/api/v1`, tenant via `X-Tenant-Id` header)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/public/menu?locationId=` | Full menu (active, in-stock, online-visible) |
| GET | `/public/menu/:categoryId?locationId=` | Products in category |
| POST | `/public/basket` | Create basket or add line |
| PATCH | `/public/basket/items` | Add / update / remove lines |
| POST | `/public/checkout` | Validate basket, promotions, totals, customer & delivery |
| POST | `/public/payment` | Create order, reserve stock, payment intent & capture |
| GET | `/public/order-status/:orderId` | Order status for customer |

## Services

- **MenuQueryService** — active products, online channel visibility, stock by location
- **BasketService** — in-memory session basket
- **CheckoutService** — validation, `PromotionsService` (coupon + automatic), totals, `PaymentOrderContext`
- **OnlineOrderService** — `OrdersService.create`, `InventoryService.reserve`, `PaymentsService` intent + capture, `DeliveryService.createTask` for delivery orders

## Validation

- Inactive or non-online products rejected at checkout
- Out-of-stock / insufficient quantity rejected when stock rows exist for the location
- Delivery address required for delivery orders
- Coupons validated via `PromotionsService.validateCoupon`

## Integrations

Uses exported core services only (no changes to Orders / Payments / Inventory / Promotions / Deliveries business logic).
