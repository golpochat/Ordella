# @ordella/driver-app

Next.js 14 driver app for delivery assignment, navigation, and proof of delivery.

## Routes

| Route | Description |
|-------|-------------|
| `/tasks` | Assigned delivery tasks with status filters |
| `/task/[taskId]` | Task detail, status actions, proof of delivery |
| `/navigation` | Google / Apple Maps deep links (pickup → dropoff) |
| `/profile` | Driver profile and availability |
| `/login` | JWT sign-in + driver profile binding |

## Dev

```bash
npm run dev --workspace=@ordella/driver-app
```

http://localhost:3004

## Env

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_API_URL` — API base (e.g. `http://localhost:3000/api/v1`)
- `NEXT_PUBLIC_TENANT_ID` — optional dev default
- `NEXT_PUBLIC_DRIVER_ID` — optional dev default
- `NEXT_PUBLIC_ACCESS_TOKEN` — optional dev token
- `NEXT_PUBLIC_PICKUP_NAME` / `NEXT_PUBLIC_PICKUP_ADDRESS` — default pickup for maps

## API

Uses authenticated `/deliveries` and `/drivers` endpoints with `X-Tenant-Id` and Bearer token.

WebSocket namespace `/deliveries` — events `task.assigned`, `task.updated`, `task.cancelled`.
