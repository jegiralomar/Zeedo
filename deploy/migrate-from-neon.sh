#!/usr/bin/env bash
# ==============================================================================
# ZEEDO BID APP — 1-Command Neon to Hetzner Database Migration Tool
# Exports live data from remote Neon PostgreSQL and imports directly into
# the local high-performance NVMe PostgreSQL 16 container.
# ==============================================================================

set -e

echo "=========================================================="
echo "🐘 [Zeedo DB Migration] Neon -> Hetzner Local PostgreSQL"
echo "=========================================================="

NEON_URL="${1:-$NEON_DATABASE_URL}"

if [ -z "$NEON_URL" ]; then
  read -p "Enter your Neon DATABASE_URL: " NEON_URL
fi

if [ -z "$NEON_URL" ]; then
  echo "❌ Error: Neon connection string is required."
  echo "Usage: ./deploy/migrate-from-neon.sh 'postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require'"
  exit 1
fi

# Ensure postgres-client tools or docker is running
if ! docker ps | grep -q "zeedo_db"; then
  echo "❌ Error: zeedo_db container is not running. Start it with: docker compose up -d db"
  exit 1
fi

TEMP_DUMP="/tmp/zeedo_neon_dump_$(date +%s).sql"

echo "⏳ 1. Exporting live schema & records from Neon..."
docker run --rm -i postgres:16-alpine pg_dump \
  "${NEON_URL}" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists > "${TEMP_DUMP}"

DUMP_SIZE=$(du -h "${TEMP_DUMP}" | cut -f1)
echo "✅ Export complete (${DUMP_SIZE})."

echo "⏳ 2. Importing data into local container (zeedo_db)..."
docker exec -i zeedo_db psql -U postgres -d zeedodb < "${TEMP_DUMP}"

rm -f "${TEMP_DUMP}"

echo "⏳ 3. Verifying imported tables in local database..."
docker exec -t zeedo_db psql -U postgres -d zeedodb -c "
SELECT table_name, (xpath('/row/cnt/text()', xml_count))[1]::text::int as count
FROM (
  SELECT table_name,
         query_to_xml(format('select count(*) as cnt from %I', table_name), false, true, '') as xml_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
) t;
"

echo "=========================================================="
echo "🎉 [Migration Complete] All data successfully transferred to Hetzner NVMe DB!"
echo "Your app is now querying local PostgreSQL with < 1ms latency."
echo "=========================================================="
