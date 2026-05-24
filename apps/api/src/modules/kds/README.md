# KDS module

Kitchen Display System backend: order queue, per-line prep state, REST + WebSocket.

## REST (`/api/v1/kds`)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/kds/orders?station=&status=` | `kds:read` |
| GET | `/kds/orders/:orderId` | `kds:read` |
| POST | `/kds/orders/:orderId/preparing` | `kds:update` |
| POST | `/kds/orders/:orderId/ready` | `kds:update` |
| POST | `/kds/orders/:orderId/items/:itemId/start` | `kds:update` |
| POST | `/kds/orders/:orderId/items/:itemId/complete` | `kds:update` |

Default active statuses: `accepted`, `preparing`, `ready`. Pass `status` to include `out_for_delivery` or others.

`station` filters by product `categoryId` (UUID).

## WebSocket

- Namespace: `/kds`
- Tenant room: `tenant:{tenantId}`
- Station room: `tenant:{tenantId}:station:{stationId}`
- Connect with `?tenantId=` or `X-Tenant-Id`, then emit `kds.subscribe` `{ tenantId, station? }`
- Events: `order.created`, `order.updated`, `order.preparing`, `order.ready`, `order.completed`

## Line-item state

Table `kds_order_item_states` (KDS-owned): `pending` → `started` → `completed`.

## Order transitions

Uses `OrderLifecycleService.transition()` (via transactional wrapper) and aligns with `OrdersService` lifecycle rules.

## Validation

- Line: cannot complete before start
- Order ready: all lines completed; order must be `preparing`
- Order status transitions validated against order lifecycle graph

## Integrations

- **ReportsIngestService** (optional) — kitchen milestones
- **Notifications** — placeholder `KdsNotificationsIntegration`

## Migration

`1737650000019-CreateKdsOrderItemStates.ts`
