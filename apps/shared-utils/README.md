# @ordella/shared-utils

Shared utilities for Ordella frontends.

## Exports

- `createApiClient` — fetch wrapper with JWT + `X-Tenant-Id`
- `createBrowserTokenStorage` / `getAuthHeaders` — auth helpers
- Zod schemas — Product, Category, Order, InventoryItem, Promotion, report summaries
- `createWebSocketClient` — event-based WebSocket wrapper

## Usage

```ts
import { createApiClient, createBrowserTokenStorage, productSchema } from '@shared-utils';
import { orderSchema } from '@shared-utils/schemas/order.schema';
// npm workspace: @ordella/shared-utils — @shared-utils/* via tsconfig paths in apps
```
