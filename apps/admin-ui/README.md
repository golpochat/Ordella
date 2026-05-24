# @ordella/admin-ui

Next.js 14 App Router admin dashboard for Ordella.

## Run

```bash
# From repo root (API on :3000)
npm run dev --workspace=@ordella/admin-ui
```

Open [http://localhost:3001](http://localhost:3001). Configure `apps/admin-ui/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Routes

| Area | Path |
|------|------|
| Products | `/products`, `/products/new`, `/products/categories`, `/products/modifiers` |
| Inventory | `/inventory`, `/inventory/movements` |
| Orders | `/orders`, `/orders/:id` |
| Promotions | `/promotions`, `/promotions/new` |
| Reports | `/reports/sales`, `/reports/inventory`, `/reports/delivery`, `/reports/promotions` |
| Settings | `/settings` |

Auth: middleware protects all routes except `/login`. JWT and tenant ID are stored in HTTP-only cookies (server) and synced for client API calls.
