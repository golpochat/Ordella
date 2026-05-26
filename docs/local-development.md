# Local development — running Ordella services

This guide describes how to run the **Ordella** monorepo on your machine using the official app names and ports from the repository.

## App names (npm workspaces)

| Workspace | Folder | Local URL | Role |
|-----------|--------|-----------|------|
| `@ordella/api` | `apps/api` | http://localhost:3000 | NestJS API (`/api/v1`) |
| `@ordella/admin-ui` | `apps/admin-ui` | http://localhost:3001 | Admin dashboard & analytics |
| `@ordella/pos-ui` | `apps/pos-ui` | http://localhost:3002 | Point of sale UI |
| `@ordella/storefront` | `apps/storefront` | http://localhost:3003 | Online ordering storefront |
| `@ordella/driver-app` | `apps/driver-app` | http://localhost:3004 | Driver delivery app |
| `@ordella/customer-app` | `apps/customer-app` | http://localhost:3005 | Customer account & tracking |
| `@ordella/marketing` | `apps/marketing` | http://localhost:3006 | Marketing site |
| `@ordella/kds-ui` | `apps/kds-ui` | http://localhost:3007 | Fulfillment Display System (KDS / FDS) |

**Shared packages** (no dev server): `@ordella/shared-ui`, `@ordella/shared-utils`

**Placeholder packages** (TypeScript only, no `dev` script): `@ordella/admin`, `@ordella/pos` — use `admin-ui` and `pos-ui` instead.

---

## Prerequisites

- **Node.js** ≥ 20 (see root `package.json` `engines`)
- **npm** 10.x (repo uses `packageManager: npm@10.8.2`)
- **Docker Desktop** (recommended) for PostgreSQL, Redis, RabbitMQ, MinIO, and Mailhog

---

## 1. One-time setup

From the **repository root**:

```bash
cd path/to/ordella
npm install
```

Copy environment files:

```bash
# Root — API, database, Redis, JWT, CORS, etc.
copy .env.example .env

# Per-app (Next.js) — copy each file you plan to run
copy apps\admin-ui\.env.example apps\admin-ui\.env.local
copy apps\pos-ui\.env.example apps\pos-ui\.env.local
copy apps\storefront\.env.example apps\storefront\.env.local
copy apps\customer-app\.env.example apps\customer-app\.env.local
copy apps\driver-app\.env.example apps\driver-app\.env.local
copy apps\kds-ui\.env.example apps\kds-ui\.env.local
copy apps\marketing\.env.example apps\marketing\.env.local
```

On macOS/Linux, use `cp` instead of `copy`.

Set at minimum in **root** `.env`:

- `DATABASE_URL=postgresql://ordella:ordella@localhost:5433/ordella`
- `JWT_SECRET` — any non-empty value for local dev

Set in each **frontend** `.env.local`:

- `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`
- `NEXT_PUBLIC_TENANT_ID=<your-tenant-uuid>` (after seeding or onboarding)

Storefront and KDS also need `NEXT_PUBLIC_LOCATION_ID` where applicable.

---

## 2. Start infrastructure (Docker)

From the **repository root**:

```bash
docker compose up -d postgres redis rabbitmq minio mailhog
```

Wait for services to be healthy, then create the MinIO bucket once:

```bash
docker compose up minio-init
```

| Service | Host port | Purpose |
|---------|-----------|---------|
| PostgreSQL | **5433** | Primary DB (`ordella` / `ordella`) |
| Redis | 6379 | Cache / rate limiting |
| RabbitMQ | 5672, **15672** | Queue (+ [management UI](http://localhost:15672)) |
| MinIO | 9000, **9001** | S3-compatible storage (+ [console](http://localhost:9001)) |
| Mailhog | 1025, **8025** | Local SMTP (+ [inbox UI](http://localhost:8025)) |

Infra-only details: `infrastructure/docker/README.md`.

To stop:

```bash
docker compose down
```

---

## 3. Database migrations

With PostgreSQL running and `DATABASE_URL` set in root `.env`:

```bash
npm run migration:run --workspace=@ordella/api
```

Revert last migration (if needed):

```bash
npm run migration:revert --workspace=@ordella/api
```

---

## 4. Start the API (`@ordella/api`)

The API does **not** use the `dev` script; use `start:dev`:

```bash
npm run start:dev --workspace=@ordella/api
```

Or from `apps/api`:

```bash
cd apps/api
npm run start:dev
```

- **Base URL:** http://localhost:3000  
- **REST prefix:** http://localhost:3000/api/v1  
- **WebSocket namespaces:** `/kds`, `/deliveries` (host: `http://localhost:3000`)

Health check (example):

```bash
curl http://localhost:3000/api/v1/health
```

Keep this terminal open while developing frontends.

---

## 5. Start frontend apps

Run each app in its **own terminal** (from repo root):

### Admin dashboard — `@ordella/admin-ui`

```bash
npm run dev --workspace=@ordella/admin-ui
```

→ http://localhost:3001

### POS — `@ordella/pos-ui`

```bash
npm run dev --workspace=@ordella/pos-ui
```

→ http://localhost:3002

### Storefront (online ordering) — `@ordella/storefront`

```bash
npm run dev --workspace=@ordella/storefront
```

→ http://localhost:3003

### Driver app — `@ordella/driver-app`

```bash
npm run dev --workspace=@ordella/driver-app
```

→ http://localhost:3004

Sign in with tenant ID, email/password, and **driver profile ID** (from `driver_profiles` in the DB).

### Customer app — `@ordella/customer-app`

```bash
npm run dev --workspace=@ordella/customer-app
```

→ http://localhost:3005

### Marketing site — `@ordella/marketing`

```bash
npm run dev --workspace=@ordella/marketing
```

→ http://localhost:3006

### Fulfillment Display (KDS) — `@ordella/kds-ui`

```bash
npm run dev --workspace=@ordella/kds-ui
```

→ http://localhost:3007

Requires tenant/location context in `apps/kds-ui/.env.local` or URL query params:

```text
http://localhost:3007/board?tenantId=<tenant-id>&locationId=<location-id>&accessToken=<staff-jwt>
```

The fulfillment feed is protected. In local demo mode the KDS app can sign in with the seeded Bella staff user automatically. For custom tenants, set `NEXT_PUBLIC_KDS_EMAIL` and `NEXT_PUBLIC_KDS_PASSWORD`, use `kdsEmail`/`kdsPassword` query params, or enter staff credentials in KDS Settings.
If the board shows `Invalid or expired token`, open KDS Settings and enter fresh staff credentials or a fresh KDS access token.

---

## 6. Run many frontends at once (optional)

Turbo can start every workspace that defines a `dev` script (API is excluded):

```bash
npm run dev
```

You still need **`@ordella/api`** in a separate terminal:

```bash
npm run start:dev --workspace=@ordella/api
```

---

## 7. Recommended startup order

1. `docker compose up -d` (infra)  
2. `npm run migration:run --workspace=@ordella/api`  
3. `npm run start:dev --workspace=@ordella/api`  
4. Any combination of frontends you need (admin, POS, storefront, driver, customer, KDS, marketing)

---

## 8. CORS and API headers

Root `.env` `CORS_ORIGINS` should include the origins you use locally, for example:

```env
CORS_ORIGINS=http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007
```

Authenticated requests from apps typically send:

- `Authorization: Bearer <access_token>`
- `X-Tenant-Id: <tenant_uuid>`

---

## 9. Quick reference — all local URLs

| Service | URL |
|---------|-----|
| API | http://localhost:3000/api/v1 |
| Admin UI | http://localhost:3001 |
| POS UI | http://localhost:3002 |
| Storefront | http://localhost:3003 |
| Driver app | http://localhost:3004 |
| Customer app | http://localhost:3005 |
| Marketing | http://localhost:3006 |
| KDS UI (FDS) | http://localhost:3007 |
| RabbitMQ management | http://localhost:15672 |
| MinIO console | http://localhost:9001 |
| Mailhog | http://localhost:8025 |

---

## 10. Troubleshooting

| Issue | What to check |
|-------|----------------|
| API cannot connect to DB | Postgres on port **5433**, `DATABASE_URL` in root `.env`, `docker compose ps` |
| Frontend 401 / CORS | API running, `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`, valid JWT + `X-Tenant-Id` |
| Driver app empty orders | Driver user role, `driver_profiles` row, delivery tasks for tenant |
| KDS board empty | `NEXT_PUBLIC_LOCATION_ID`, orders in fulfillment statuses for that location |
| WebSockets not updating | API running, same tenant ID in client env/query, `WS_REQUIRE_AUTH=false` locally |

For module-level API notes, see `apps/api/README.md` and per-module READMEs under `apps/api/src/modules/`.
