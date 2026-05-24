# Secrets management

Never commit secrets. Use environment-specific stores:

| Environment | Recommended store |
|-------------|-------------------|
| development | `.env` (gitignored), docker-compose defaults |
| staging | GitHub Actions secrets, Doppler, 1Password |
| production | AWS Secrets Manager, GCP Secret Manager, Vault |

## Required secrets

| Variable | Used by |
|----------|---------|
| `DATABASE_URL` | API |
| `REDIS_URL` | API rate limit, cache, BullMQ |
| `JWT_SECRET` | API auth + WebSocket (when `WS_REQUIRE_AUTH=true`) |
| `STRIPE_SECRET_KEY` | Billing |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Logo/asset uploads |
| `SENTRY_DSN` | Error tracking |

## Rotation

- Rotate `JWT_SECRET` with overlapping token TTL (`JWT_EXPIRES_IN`)
- Stripe keys: use restricted API keys per environment
- Database: managed provider automatic rotation + update `DATABASE_URL` in deploy

## CI/CD injection

GitHub Actions maps environment secrets to `staging` / `production` environments. See `.github/workflows/deploy-api.yml`.
