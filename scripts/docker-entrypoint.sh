#!/bin/sh
set -e

DATA_DIR="/app/data"
DB_FILE="${DATA_DIR}/prod.db"
SEED_DB="/app/prisma/seed.db"

mkdir -p "$DATA_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "Initializing SQLite database from seed..."
  cp "$SEED_DB" "$DB_FILE"
fi

echo "CAVADOV BARBER ready on :${PORT:-3000}"
exec "$@"
