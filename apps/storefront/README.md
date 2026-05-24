# @ordella/storefront

Next.js 14 customer-facing online ordering storefront.

## Run

```bash
npm run dev --workspace=@ordella/storefront
```

Open http://localhost:3003

## Environment

Create `apps/storefront/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_TENANT_ID=<tenant-uuid>
NEXT_PUBLIC_LOCATION_ID=<location-uuid>
NEXT_PUBLIC_BRAND_NAME=My Restaurant
NEXT_PUBLIC_OPENING_HOURS=Mon–Sun 11:00–22:00
NEXT_PUBLIC_BUSINESS_ADDRESS=123 Main Street
```

## Routes

| Path | Description |
|------|-------------|
| `/menu` | Category tabs + product cards |
| `/product/[id]` | Product detail + modifiers |
| `/basket` | Basket management |
| `/checkout` | Customer + delivery + coupon |
| `/checkout?step=payment` | Payment capture |
| `/order/[orderId]` | Live order tracking |

Uses public API (`/api/v1/public/*`) with `X-Tenant-Id` header.
