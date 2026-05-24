# Inventory module

Stock and inventory per **SRS §4** and **API Spec §4**.

## Submodules

| Submodule | Routes | Source |
|-----------|--------|--------|
| `stock-items` | CRUD `/stock-items` | API Spec §4.1 |
| `stock-movements` | GET/POST `/stock-movements` | API Spec §4.2 |
| `stock-transfers` | CRUD-ish `/stock-transfers` | API Spec §4.3 |
| `stock-adjustments` | GET/POST `/stock-adjustments` | SRS §4.2 |
| `stock-reservations` | GET/POST `/stock-reservations`, POST `/:id/release` | SRS §4.3 |
| `wastage-records` | GET/POST `/wastage-records` | SRS §4.3 |

All routes are tenant-scoped.

## Domain core

`InventoryCoreModule` exports **`InventoryService`** — order-driven stock operations:

| Domain name | Table | Key fields |
|-------------|-------|------------|
| InventoryItem | `stock_items` | `product_id`, `sku`, `quantity_on_hand`, `quantity_reserved` |
| InventoryAdjustment | `stock_adjustments` | `type`, `quantity_delta`, `reason`, `adjusted_by` |
| InventoryMovement | `stock_movements` | `type`, `quantity`, `source`, `reference_id` (order) |

Placeholder integrations: `LowStockAlertsService`, `AutoReplenishmentService`, `SupplierOrderingService`.

## Entities

- `stock_items` — ERD §1.3 + multi-location (`location_id`, `quantity_on_hand`, `quantity_reserved`)
- `stock_movements` — append-only ledger
- `stock_adjustments` — manual corrections
- `stock_transfers` + `stock_transfer_lines`
- `stock_reservations` — checkout holds
- `wastage_records` — wastage logging

## Migrations

- `1737650000004-CreateInventorySchema.ts`
- `1737650000014-AddInventoryStockColumns.ts` — `quantity_reserved`, adjustment `type`, movement `source`
