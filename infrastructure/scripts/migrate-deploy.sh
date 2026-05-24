#!/usr/bin/env sh
set -eu

# Deploy-time migration: backup → safety check → migrate
# Usage: DATABASE_URL=... ./infrastructure/scripts/migrate-deploy.sh

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ -n "${DATABASE_URL:-}" ]; then
  sh ./infrastructure/scripts/backup-postgres.sh
fi

sh ./infrastructure/scripts/check-migration-safety.sh
npm run migration:run --workspace=@ordella/api
echo "Migrations applied"
