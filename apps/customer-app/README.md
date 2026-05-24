# @ordella/customer-app

Next.js 14 customer app for order history, tracking, profile, and saved addresses.

## Routes

| Route | Description |
|-------|-------------|
| `/home` | Recommended items, quick reorder, catalog link |
| `/orders` | Order list (active / past filters) |
| `/orders/[orderId]` | Order detail + live tracking timeline |
| `/profile` | Profile and notification preferences |
| `/addresses` | CRUD saved addresses (Zod validated) |
| `/login` | Password or email OTP sign-in |

## Dev

```bash
npm run dev --workspace=@ordella/customer-app
```

http://localhost:3005

## Env

- `NEXT_PUBLIC_API_URL` — API base (`http://localhost:3000/api/v1`)
- `NEXT_PUBLIC_TENANT_ID` — default tenant for login
- `NEXT_PUBLIC_STOREFRONT_URL` — online catalog link (`http://localhost:3003`)

## API (expected public customer routes)

- `POST /public/customer/login` — password or OTP
- `POST /public/customer/otp/request`
- `GET /public/customer/orders?filter=active|past`
- `GET /public/customer/orders/:id`
- `GET/PATCH /public/customer/profile`
- `GET/POST/PATCH/DELETE /public/customer/addresses`
- `GET /public/order-status/:orderId` — tracking fallback

Auth tokens stored via `@ordella/shared-utils` `createBrowserTokenStorage`.

WebSocket: fulfillment display namespace `/kds` (`order.preparing`, `order.ready`, `order.out_for_delivery`, `order.completed`).
