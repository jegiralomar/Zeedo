# ZEEDO Ultra-Lean VPS Deployment Guide (Hetzner + Docker + Caddy)

This guide walks you through deploying the complete Zeedo platform (Next.js web & API, local NVMe PostgreSQL, 24/7 background auction worker, and the Real-Time WebSocket Bidding Gateway with automated Let's Encrypt SSL) on a single **€3.79/month Hetzner Cloud VPS (CX22)**.

---

## 1. Rent a Hetzner Cloud Server (€3.79 / month)

1. Sign up at [Hetzner Cloud Console](https://console.hetzner.cloud).
2. Click **+ Add Server**:
   * **Location:** Falkenstein or Nuremberg (Germany) — closest European latency to Iraq (~60-75ms).
   * **Image:** **Ubuntu 24.04 LTS**.
   * **Type:** Standard &rarr; **CX22** (2 vCPU, 4GB RAM, 40GB NVMe SSD — **€3.79 / month**).
   * **SSH Key:** Add your public SSH key (or receive the root password via email).
3. Copy your server's **Public IPv4 address** (e.g., `159.69.x.x`).

---

## 2. Deploy with 1-Command (90-Second Setup)

SSH into your Hetzner server:
```bash
ssh root@<YOUR_SERVER_IP>
```

Clone the repository and run the automated provisioning script:
```bash
git clone https://github.com/jegiralomar/Zeedo.git /root/zeedo
cd /root/zeedo
bash deploy/setup-vps.sh
```

What `setup-vps.sh` does automatically:
1. Updates Ubuntu packages & enables UFW firewall (ports 22, 80, 443).
2. Provisions a 2GB NVMe swap file (prevents out-of-memory during builds).
3. Installs official Docker Engine & Docker Compose plugin.
4. Generates `.env` with cryptographically secure PostgreSQL, WebSocket, and Session secrets.
5. Registers an automated daily database backup cron (`/var/backups/zeedo/`) running every night at 3:00 AM.
6. Builds and launches all 4 containers (`db`, `websocket`, `web`, `caddy`).

---

## 3. Pre-DNS Testing (Direct IP)

Before touching your domain's DNS in Cloudflare, test the server directly:
```bash
curl http://<YOUR_SERVER_IP>/health
```
Expected output:
```json
{"status":"healthy","totalConnections":0,"memoryUsageMb":18}
```
You can also open `http://<YOUR_SERVER_IP>` in your browser to verify the web interface loads.

---

## 4. Cloudflare DNS Cutover (Point to Hetzner)

Log in to your **Cloudflare Dashboard** &rarr; Select `zeedo.auction` &rarr; **DNS** &rarr; **Records**:

1. **Main Domain (`zeedo.auction`):**
   * Change `A` record `zeedo.auction` to point to `<YOUR_HETZNER_VPS_IP>`.
   * Proxy status: **DNS Only** (Gray Cloud) initially so Caddy can obtain the Let's Encrypt TLS certificate.
2. **Admin Domain (`admin.zeedo.auction`):**
   * Change `A` record `admin.zeedo.auction` to point to `<YOUR_HETZNER_VPS_IP>`.
   * Proxy status: **DNS Only** (Gray Cloud).
3. Once `https://zeedo.auction` loads with a valid padlock, you can optionally switch Cloudflare proxy to **Proxied** (Orange Cloud). Under **SSL/TLS**, set mode to **Full (Strict)** and enable **WebSockets** under Network settings.

---

## 5. Migrate Database from Neon (Optional / 1-Command)

If you have existing live data in Neon that you want transferred to your local NVMe Postgres container:
```bash
cd /root/zeedo
./deploy/migrate-from-neon.sh "postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require"
```
This automatically dumps all tables, schemas, and records from Neon and pipes them directly into `zeedo_db` on Hetzner with zero downtime.

---

## 6. Real-Time Background Worker (24/7 Auto-Conclude)

Unlike Vercel's ephemeral serverless lambdas, the Hetzner Docker stack includes an active 24/7 background worker running inside `services/websocket/server.js`:
* Monitors live auctions every 10 seconds.
* Automatically marks expired lots (`end_time <= NOW()`) as `completed`.
* Generates an Iraqi courier dispatch tracking code (`AWB-IQ-YYYYMMDD-XXXX`).
* Sets COD status to `ready_for_dispatch`.
* Broadcasts `AUCTION_ENDED` to all clients and sends winning alerts.

---

## 7. Monthly Running Cost Breakdown

| Component | Provider | Cost |
| :--- | :--- | :--- |
| **All-in-One Cloud VPS (2 vCPU, 4GB RAM, 40GB NVMe)** | Hetzner Cloud (CX22) | **€3.79 / mo (~$4.10)** |
| **Media & Image Storage (Zero Egress)** | Cloudflare R2 | **$0.00 / mo** (Free Tier: 10GB + 1M writes) |
| **Database (PostgreSQL 16 NVMe)** | Self-Hosted in Docker | **$0.00 / mo** (No Neon serverless bill) |
| **Real-Time WebSockets** | Self-Hosted Node.js Gateway | **$0.00 / mo** (No Pusher/Ably bill) |
| **SSL Certificates & Reverse Proxy** | Caddy Auto Let's Encrypt | **$0.00 / mo** |
| **Mobile Auth WhatsApp OTP** | Meta Cloud API | **~$3.50 – $7.00 / mo** |
| **TOTAL ESTIMATED MONTHLY COST** | | **~$7.60 – $11.10 / mo** |
