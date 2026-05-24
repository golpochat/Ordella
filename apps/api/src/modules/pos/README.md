# POS module

In-store point-of-sale flow: session cart → order → payment → receipt.

## Routes (`/api/v1`, tenant-scoped)

| Method | Path | Permission |
|--------|------|------------|
| POST | `/pos/cart` | `pos:cart` |
| PATCH | `/pos/cart/items` | `pos:cart` |
| POST | `/pos/checkout` | `pos:checkout` |
| POST | `/pos/payment` | `pos:payment` |
| GET | `/pos/receipt/:orderId` | `pos:receipt` |

## Session validation

All requests require `terminalId`, `cashierId`, and `shiftId` (UUIDs). Values must match the cart session for cart mutations, checkout, and payment.

## Flow

1. **Cart** — in-memory cart per terminal session (`CartService`).
2. **Checkout** — `OrdersService.create()` (`orderType: pos`), then `InventoryService.reserve()`.
3. **Payment** — `PaymentsService.authorizeOrCapture()`, `InventoryService.deduct()`, order transition to `accepted`.
4. **Receipt** — order snapshot with POS session metadata.

## Integrations

Uses exported domain services (no changes to Orders / Payments / Inventory business logic):

- `OrdersService` — order creation and status update
- `PaymentsService` — capture
- `InventoryService` — reserve on checkout, deduct on payment
