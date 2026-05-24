# Monitoring & observability

## API

| Signal | Implementation |
|--------|----------------|
| Request logs | `LoggingInterceptor` (structured HTTP log) |
| Errors | Sentry (`SENTRY_DSN`) |
| Health | `GET /api/v1/health`, `GET /api/v1/health/live` |
| DB / Redis / Queue | Health service checks |

## Uptime

- External ping: `/api/v1/health/live` (liveness)
- Readiness: `/api/v1/health` (includes DB + Redis)

Configure Better Stack, Pingdom, or UptimeRobot against production URLs.

## Frontends

- Vercel Analytics / Speed Insights
- Sentry Next.js SDK (optional per app)

## Alerts

- Health check failures → PagerDuty / Slack
- Sentry error rate spike
- Redis memory / queue depth (when BullMQ workers are enabled)
