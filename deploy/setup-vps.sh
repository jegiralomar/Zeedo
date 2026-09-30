#!/usr/bin/env bash
# ==============================================================================
# ZEEDO Ultra-Lean VPS Auto-Provisioning Script
# Deploys complete stack (Postgres, WebSocket Gateway, Next.js Web/API, Caddy SSL)
# Tested on Ubuntu 22.04 / 24.04 LTS (Hetzner, DigitalOcean, Linode, AWS EC2)
# ==============================================================================

set -e

echo "🚀 [Zeedo VPS Setup] Starting automated deployment..."

# 1. Update system packages
echo "📦 Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# 2. Install prerequisites
echo "🔧 Installing curl, git, ufw, openssl, and jq..."
apt-get install -y -qq curl git ufw openssl jq ca-certificates gnupg

# 3. Configure UFW Firewall
echo "🛡️ Configuring firewall rules..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Install Docker & Docker Compose if not present
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

# 5. Setup production environment file
if [ ! -f .env ]; then
  echo "🔑 Generating secure credentials in .env..."
  cp .env.production.example .env
  
  # Generate cryptographically secure secrets
  SECURE_PG_PASS=$(openssl rand -hex 16)
  SECURE_WS_SECRET=$(openssl rand -hex 24)
  SECURE_SESSION_SECRET=$(openssl rand -hex 32)

  sed -i "s/POSTGRES_PASSWORD=zeedo_db_secure_pass_2026/POSTGRES_PASSWORD=${SECURE_PG_PASS}/g" .env
  sed -i "s/WS_BROADCAST_SECRET=zeedo_internal_live_socket_key_9898/WS_BROADCAST_SECRET=${SECURE_WS_SECRET}/g" .env
  sed -i "s/SESSION_SECRET=zeedo_production_session_jwt_secret_key_2026/SESSION_SECRET=${SECURE_SESSION_SECRET}/g" .env
  
  echo "✅ Created .env with unique secrets."
else
  echo "ℹ️ Existing .env file found. Preserving current secrets."
fi

# 6. Build and launch containers
echo "🏗️ Building and starting Zeedo Docker services..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 7. Verify deployment health
echo "⏳ Waiting 10 seconds for services to boot..."
sleep 10

docker compose ps

echo "=========================================================="
echo "🎉 [Zeedo VPS Setup] Complete!"
echo "• Web App & Admin:  https://zeedo.auction"
echo "• WebSocket Stream: wss://zeedo.auction/ws"
echo "• Health Endpoint:  curl http://localhost:8080/health"
echo "=========================================================="
