#!/usr/bin/env sh
set -eu

# Backup PostgreSQL before migrations (requires pg_dump on PATH)
# Usage: DATABASE_URL=postgresql://... ./infrastructure/scripts/backup-postgres.sh

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

STAMP=$(date -u +"%Y%m%dT%H%M%SZ")
OUT_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$OUT_DIR"
FILE="$OUT_DIR/ordella-${STAMP}.sql.gz"

echo "Writing backup to $FILE"
pg_dump "$DATABASE_URL" | gzip > "$FILE"
echo "Backup complete: $FILE"
