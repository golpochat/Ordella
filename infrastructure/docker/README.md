# Ordella — Docker Compose (local)

Fully self-contained local stack: no cloud or external SaaS required.

## Quick start

From the **repository root**:

```bash
docker compose up -d
docker compose ps
```

From this directory:

```bash
docker compose -f docker-compose.yml up -d
```

Copy `infrastructure/docker/.env.example` to `.env` at the repo root (optional — defaults work for local dev).

## Infrastructure services

| Service | Host port | Purpose |
|---------|-----------|---------|
| PostgreSQL | **5433** | Primary database (host port; avoids local Postgres on 5432) |
| Redis | 6379 | Cache, rate limiting |
| RabbitMQ | 5672, 15672 | Event bus (+ management UI) |
| MinIO | 9000, 9001 | S3-compatible object storage |
| Mailhog | 1025, 8025 | SMTP capture + web UI |

**Credentials (defaults):**

- Postgres: `ordella` / `ordella` — database `ordella`
- RabbitMQ: `ordella` / `ordella` — vhost `ordella` — [Management UI](http://localhost:15672)
- MinIO: `minioadmin` / `minioadmin` — bucket `ordella-assets` — [Console](http://localhost:9001)
- Mailhog UI: [http://localhost:8025](http://localhost:8025)

## Placeholder services

Replace `traefik/whoami` images with real `build:` targets when apps are implemented.

| Service | Port | Role |
|---------|------|------|
| api-gateway | 3000 | Public API entry |
| auth-service | 3010 | Authentication |
| catalog-service | 3011 | Catalog |
| orders-service | 3012 | Orders |
| payments-service | 3013 | Payments |
| delivery-service | 3014 | Delivery |
| customers-service | 3015 | Customers |
| notifications-service | 3016 | Notifications |
| reports-service | 3017 | Reporting |
| integrations-service | 3018 | Integrations |
| tenants-service | 3019 | Multi-tenant |
| locations-service | 3020 | Locations |
| promotions-service | 3021 | Promotions |
| audit-service | 3022 | Audit |
| admin-app | 3001 | Admin UI |
| pos-app | 3002 | POS UI |
| customer-app | 3003 | Customer ordering UI |
| driver-app | 3004 | Driver UI |

Verify a placeholder: `curl http://localhost:3010/`

## Infra-only startup

```bash
docker compose up -d postgres redis rabbitmq minio mailhog
```

Wait for `minio-init` to finish once (creates the assets bucket):

```bash
docker compose up minio-init
```

## Teardown

```bash
docker compose down
docker compose down -v   # also remove named volumes
```
