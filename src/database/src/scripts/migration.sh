#!/bin/bash
set -e

echo "📥 Starting custom SQL migrations..."

for file in $(ls ../migrations/*.sql | sort); do
  echo "📄 Running migration: $file"
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$file"
done

echo "✅ Migrations complete."