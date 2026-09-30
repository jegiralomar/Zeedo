#!/usr/bin/env bash
# ==============================================================================
# ZEEDO Ultra-Lean VPS Auto-Provisioning Script
# Deploys complete stack (Postgres, WebSocket Gateway, Next.js Web/API, Caddy SSL)
# Tested on Ubuntu 22.04 / 24.04 LTS (Hetzner CX22/CPX21)
# ==============================================================================

set -e

echo "🚀 [Zeedo VPS Setup] Starting automated deployment..."

# 1. Update system packages
echo "📦 Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# 2. Install prerequisites
echo "🔧 Installing curl, git, ufw, openssl, jq, ca-certificates, and cron..."
apt-get install -y -qq curl git ufw openssl jq ca-certificates gnupg cron

# 3. Configure 2GB Swap Memory (Prevents OOM during build on 2GB-4GB VPS nodes)
if [ $(swapon --show | wc -l) -le 1 ]; then
  echo "💾 Creating 2GB swap file on NVMe storage..."
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  echo "✅ 2GB swap memory active."
else
  echo "ℹ️ Swap memory already active."
fi

# 4. Configure UFW Firewall
echo "🛡️ Configuring firewall rules..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5. Install Docker & Docker Compose plugin if not present
if ! command -v docker &> /dev/null; then
  echo "🐳 Installing Docker Engine..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "✅ Docker installed successfully."
else
  echo "✅ Docker is already installed."
fi

# 6. Make deployment helper scripts executable
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x "${SCRIPT_DIR}/backup-db.sh" 2>/dev/null || true
chmod +x "${SCRIPT_DIR}/migrate-from-neon.sh" 2>/dev/null || true

# 7. Setup production environment file (.env)
if [ ! -f .env ]; then
  echo "🔑 Generating secure credentials in .env..."
  cp .env.production.example .env
  
  # Generate cryptographically secure secrets
  SECURE_PG_PASS=$(openssl rand -hex 16)
  SECURE_WS_SECRET=$(openssl rand -hex 24)
  SECURE_SESSION_SECRET=$(openssl rand -hex 32)

  sed -i "s/POSTGRES_PASSWORD=generate_a_super_strong_password_here_123!/POSTGRES_PASSWORD=${SECURE_PG_PASS}/g" .env
  sed -i "s/WS_BROADCAST_SECRET=zeedo_internal_live_socket_key_9898/WS_BROADCAST_SECRET=${SECURE_WS_SECRET}/g" .env
  sed -i "s/SESSION_SECRET=generate_a_long_random_jwt_secret_key_minimum_32_characters/SESSION_SECRET=${SECURE_SESSION_SECRET}/g" .env
  
  echo "✅ Created .env with unique cryptographically random secrets."
else
  echo "ℹ️ Existing .env file found. Preserving current secrets."
fi

# 8. Setup Daily Automated Database Backup Cron Job (Every night at 03:00 AM)
CRON_JOB="0 3 * * * ${SCRIPT_DIR}/backup-db.sh >> /var/log/zeedo-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -Fv "${SCRIPT_DIR}/backup-db.sh" ; echo "${CRON_JOB}") | crontab -
echo "✅ Automated daily 3:00 AM database backup cron registered."

# 9. Build and launch containers
echo "🏗️ Building and starting Zeedo Docker services..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 10. Verify deployment health
echo "⏳ Waiting 15 seconds for services to boot..."
sleep 15

docker compose ps

echo "=========================================================="
echo "🎉 [Zeedo VPS Setup] Complete & Running 24/7!"
echo "• Direct IP Test:    http://$(curl -s ifconfig.me)"
echo "• Health Endpoint:   curl http://localhost:8080/health"
echo "• WebSocket Gateway: wss://zeedo.auction/ws (or ws://localhost:8080)"
echo "• To migrate data:   ./deploy/migrate-from-neon.sh 'your_neon_url'"
echo "• Automated backups: Daily at 3:00 AM in /var/backups/zeedo/"
echo "=========================================================="
