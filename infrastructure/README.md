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

- `docker/` — Docker Compose full local stack ([README](docker/README.md))
- `k8s/` — Kubernetes manifests (optional v2)
- `scripts/` — Deployment and ops scripts
