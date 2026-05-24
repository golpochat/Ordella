#!/usr/bin/env sh
set -eu

# Blocks destructive SQL in migrations when NODE_ENV=production
# Usage: NODE_ENV=production ./infrastructure/scripts/check-migration-safety.sh

ENV_NAME="${NODE_ENV:-development}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-apps/api/src/database/migrations}"

if [ "$ENV_NAME" != "production" ]; then
  echo "Skipping destructive check (NODE_ENV=$ENV_NAME)"
  exit 0
fi

if [ "${ALLOW_DESTRUCTIVE_MIGRATIONS:-false}" = "true" ]; then
  echo "ALLOW_DESTRUCTIVE_MIGRATIONS=true — skipping check"
  exit 0
fi

FOUND=0
for file in "$MIGRATIONS_DIR"/*.ts; do
  [ -f "$file" ] || continue
  UP_SECTION=$(awk '/public async up/,/public async down/' "$file" | head -n -1)
  if echo "$UP_SECTION" | grep -Eiq 'DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM'; then
    echo "Destructive pattern in: $file" >&2
    FOUND=1
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo "Destructive migrations blocked for production. Run backup first." >&2
  exit 1
fi

echo "Migration safety check passed"
