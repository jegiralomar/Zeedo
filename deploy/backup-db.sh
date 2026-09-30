#!/usr/bin/env bash
# ==============================================================================
# ZEEDO BID APP — Automated PostgreSQL Backup Script
# Creates a compressed, timestamped pg_dump of zeedodb
# Automatically purges local backups older than 7 days
# Optionally uploads to Cloudflare R2 ($0 egress storage)
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/zeedo"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="zeedodb_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

echo "📦 [Zeedo Backup] Starting PostgreSQL backup: ${FILENAME}..."

# 1. Execute pg_dump from inside docker container
docker exec zeedo_db pg_dump -U postgres zeedodb | gzip > "${BACKUP_PATH}"

BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
echo "✅ [Zeedo Backup] Database dumped and compressed (${BACKUP_SIZE}): ${BACKUP_PATH}"

# 2. Retain rolling 7-day backups locally
echo "🧹 [Zeedo Backup] Purging local backups older than 7 days..."
find "${BACKUP_DIR}" -name "zeedodb_*.sql.gz" -type f -mtime +7 -delete

# 3. Optional: Sync to Cloudflare R2 if AWS/R2 CLI or credentials available
if [ -n "${R2_BUCKET_NAME}" ] && [ -n "${R2_ACCESS_KEY_ID}" ] && command -v aws &> /dev/null; then
  echo "☁️ [Zeedo Backup] Syncing backup to Cloudflare R2 (${R2_BUCKET_NAME}/backups/)..."
  AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
  AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
  aws s3 cp "${BACKUP_PATH}" "s3://${R2_BUCKET_NAME}/backups/${FILENAME}" \
    --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  echo "✅ [Zeedo Backup] Cloudflare R2 remote backup complete."
fi

echo "🎉 [Zeedo Backup] Backup process successfully completed at $(date)!"
