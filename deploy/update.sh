#!/usr/bin/env bash
# ==============================================================================
# ZEEDO Live Container Update Script
# Updates the WhatsApp Baileys gateway and Next.js web application
# ==============================================================================

set -e

echo "🚀 [Zeedo Update] Pulling latest commits from GitHub..."
cd /root/zeedo

git fetch origin master
git reset --hard origin/master

echo "🏗️ [Zeedo Update] Rebuilding and restarting WhatsApp Gateway and Web containers..."
docker compose up -d --build whatsapp-gateway web

echo "⏳ [Zeedo Update] Waiting 5 seconds for services to settle..."
sleep 5

echo "🩺 [Zeedo Update] Checking container statuses:"
docker compose ps

echo "✅ [Zeedo Update] Update completed successfully!"
