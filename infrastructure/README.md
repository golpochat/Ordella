# Infrastructure

Local and production infrastructure for Ordella.

## Stack (architecture blueprint)

| Component | Purpose |
|-----------|---------|
| PostgreSQL | Primary database |
| Redis | Cache, rate limiting, sessions |
| RabbitMQ | Event bus (order, payment, delivery events) |
| S3 | Object storage |
| CDN | Static assets |
| Docker | Containerization |
| Kubernetes | Optional — v2 |

## Layout

- `deployment/` — Architecture, secrets, migrations, monitoring guides
- `docker/` — Docker Compose full local stack ([README](docker/README.md))
- `env/` — Per-environment variable templates (dev, staging, production)
- `k8s/` — Kubernetes manifests (optional v2)
- `scripts/` — Backup, migration safety, deploy helpers

## Quick start (production-like API)

```bash
cp infrastructure/env/.env.staging.example .env
docker compose -f infrastructure/docker/docker-compose.deploy.yml up -d api
```
