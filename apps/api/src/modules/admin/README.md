# Admin module

Tenant-scoped dashboard API layer. Delegates to core services (`OrdersService`, `InventoryService`, `ReportsQueryService`) without modifying domain logic.

## Permissions

All routes require `admin:access` plus area permission:

| Permission | Area |
|------------|------|
| `admin:products` | Catalog and inventory management |
| `admin:inventory` | Stock levels, movements, adjustments |
| `admin:orders` | Order list, status override, notifications |
| `admin:promotions` | Promotions CRUD and usage |
| `admin:reports` | Summary reports |
| `admin:settings` | Tenant / location configuration |

## Routes (`/api/v1`)

### Products — `/admin/products`
- `GET /` — list (filters: status, categoryId, search)
- `POST /` — create
- `PATCH /:productId` — update
- `POST /:productId/archive` — set inactive
- `GET /categories/list`, `POST /categories`
- `GET /modifiers/list`, `POST /modifiers`, `POST /modifiers/:id/options`

### Inventory — `/admin/inventory`
- `GET /stock`, `GET /movements`
- `POST /adjust` — `InventoryService.adjustStock`
- `POST /adjustments` — manual / correction / wastage

### Orders — `/admin/orders`
- `GET /` — filters: date range, status, channel (orderType)
- `GET /:orderId`
- `PATCH /:orderId/status` — `adminOverride` flag for flexible transitions
- `POST /:orderId/resend-notifications`

### Promotions — `/admin/promotions`
- CRUD + activate/deactivate + `GET /:id/usage`

### Reports — `/admin/reports`
- `GET /sales`, `/inventory`, `/delivery`, `/promotions` — via `ReportsQueryService`

### Settings — `/admin/settings`
- `PATCH /business` — tenant name/slug
- `POST /opening-hours`, `PATCH /delivery-zones`, `/payment`, `/pos`
- `GET /locations/:locationId`

## Safety

- Product update/archive blocked when product is on open orders
- Order status changes respect lifecycle rules; terminal orders cannot change
- `adminOverride` allows non-standard transitions except from terminal states
