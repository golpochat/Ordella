# Database migrations

TypeORM migrations in `apps/api/src/database/migrations/`.

## Deploy pipeline

1. **Backup** — `infrastructure/scripts/backup-postgres.sh`
2. **Safety check** — `infrastructure/scripts/check-migration-safety.sh`
3. **Migrate** — `npm run migration:run --workspace=@ordella/api`

Optional: set `RUN_MIGRATIONS_ON_BOOT=true` on API container start (use with backup in production).

## Production safeguards

- `MigrationRunnerService` blocks migrations containing `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM` when `NODE_ENV=production`
- Override only after backup: `ALLOW_DESTRUCTIVE_MIGRATIONS=true`
- Never use `synchronize: true` in production

## Per-environment databases

| Env | Database |
|-----|----------|
| dev | `ordella` @ localhost:5433 |
| staging | `ordella_staging` on staging host |
| production | `ordella_production` on RDS/Neon |
