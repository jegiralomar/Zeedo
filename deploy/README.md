# ZEEDO Ultra-Lean VPS Deployment Guide (Hostinger KVM / Docker + Caddy)

This guide walks you through deploying the complete Zeedo platform (Next.js web & API, local NVMe PostgreSQL, 24/7 background auction worker, and the Real-Time WebSocket Bidding Gateway with automated Let's Encrypt SSL) on a **Hostinger KVM 2 VPS** (~$6.99/mo for 2 vCPU, 8GB RAM, 100GB NVMe SSD).

> [!TIP]
> **Why Hostinger KVM VPS over Hetzner?**
> * **Zero ID Verification (No KYC):** Hetzner frequently rejects accounts or demands passport selfies. Hostinger uses standard e-commerce checkout with instant Visa/Mastercard 3D-Secure activation.
> * **Double the RAM:** 8GB RAM on KVM 2 prevents any out-of-memory bottlenecks during Next.js Docker builds while running PostgreSQL and WebSocket connections concurrently.
> * **Ultra-Low Latency:** Selecting the **Germany (Frankfurt)** or **France (Paris)** datacenter delivers optimal ~65–75ms ping to users in Iraq and the Middle East.

---

## 1. Rent a Hostinger KVM VPS (~$6.99 / month)

1. Go to [Hostinger VPS Hosting](https://www.hostinger.com/vps-hosting).
2. Choose **KVM 2** (2 vCPU, 8GB RAM, 100GB NVMe disk, 8TB bandwidth) — or **KVM 1** (4GB RAM) if on a strict budget.
3. Complete checkout using your standard Credit/Debit Card (Visa / Mastercard).
4. In the Hostinger hPanel onboarding wizard:
   * **Server Location:** Choose **Germany (Frankfurt)** or **France (Paris)** (lowest latency to Iraq/Middle East).
   * **Operating System:** Select **Plain OS &rarr; Ubuntu 24.04 LTS (64-bit)**.
   * **Root Password / SSH Key:** Set a strong root password or upload your public SSH key (`id_ed25519.pub` or `id_rsa.pub`).
5. Wait ~60 seconds for provisioning to finish, then copy your server's **Public IPv4 address** (e.g., `185.x.x.x`).

---

## 2. Deploy with 1-Command (90-Second Setup)

SSH into your Hostinger server:
```bash
ssh root@<YOUR_SERVER_IP>
```

Clone the repository and run the automated provisioning script:
```bash
git clone https://github.com/jegiralomar/Zeedo.git /root/zeedo
cd /root/zeedo
bash deploy/setup-vps.sh
```

### What `setup-vps.sh` does automatically:
1. Updates Ubuntu packages & enables UFW firewall (ports 22, 80, 443).
2. Provisions a 2GB NVMe swap file (extra safety buffer for heavy parallel compilation).
3. Installs official Docker Engine & Docker Compose plugin.
4. Generates `.env` with cryptographically secure PostgreSQL, WebSocket, and Session secrets.
5. Registers an automated daily database backup cron (`/var/backups/zeedo/`) running every night at 3:00 AM.
6. Builds and launches all 4 containers (`db`, `websocket`, `web`, `caddy`).

---

## 3. Pre-DNS Testing (Direct IP)

Before pointing your domain's DNS in Cloudflare, test the server directly:
```bash
curl http://<YOUR_SERVER_IP>/health
```
Expected output:
```json
{"status":"healthy","totalConnections":0,"memoryUsageMb":18}
```
You can also open `http://<YOUR_SERVER_IP>` in your browser to verify the web interface loads.

---

## 4. Cloudflare DNS Cutover (Point to Hostinger)

Log in to your **Cloudflare Dashboard** &rarr; Select `zeedo.auction` &rarr; **DNS** &rarr; **Records**:

1. **Main Domain (`zeedo.auction`):**
   * Change `A` record `zeedo.auction` to point to `<YOUR_HOSTINGER_VPS_IP>`.
   * Proxy status: **DNS Only** (Gray Cloud) initially so Caddy can obtain the Let's Encrypt TLS certificate.
2. **Admin Domain (`admin.zeedo.auction`):**
   * Change `A` record `admin.zeedo.auction` to point to `<YOUR_HOSTINGER_VPS_IP>`.
   * Proxy status: **DNS Only** (Gray Cloud).
3. Once `https://zeedo.auction` loads with a valid padlock, you can switch Cloudflare proxy to **Proxied** (Orange Cloud). Under **SSL/TLS**, set mode to **Full (Strict)** and enable **WebSockets** under Network settings.

---

## 5. Migrate Database from Neon (Optional / 1-Command)

If you have existing live data in Neon that you want transferred to your local NVMe Postgres container:
```bash
cd /root/zeedo
./deploy/migrate-from-neon.sh "postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require"
```
This automatically dumps all tables, schemas, and records from Neon and pipes them directly into `zeedo_db` on Hostinger with zero downtime.

---

## 6. Real-Time Background Worker (24/7 Auto-Conclude)

Unlike Vercel's ephemeral serverless lambdas, the Docker stack includes an active 24/7 background worker running inside `services/websocket/server.js`:
* Monitors live auctions every 10 seconds.
* Automatically marks expired lots (`end_time <= NOW()`) as `completed`.
* Generates an Iraqi courier dispatch tracking code (`AWB-IQ-YYYYMMDD-XXXX`).
* Sets COD status to `ready_for_dispatch`.
* Broadcasts `AUCTION_ENDED` to all clients and sends winning alerts.

---

## 7. Monthly Running Cost Breakdown

| Component | Provider | Cost |
| :--- | :--- | :--- |
| **All-in-One Cloud VPS (2 vCPU, 8GB RAM, 100GB NVMe)** | Hostinger KVM 2 | **~$6.99 / mo** |
| **Media & Image Storage (Zero Egress)** | Cloudflare R2 | **$0.00 / mo** (Free Tier: 10GB + 1M writes) |
| **Database (PostgreSQL 16 NVMe)** | Self-Hosted in Docker | **$0.00 / mo** (No Neon serverless bill) |
| **Real-Time WebSockets** | Self-Hosted Node.js Gateway | **$0.00 / mo** (No Pusher/Ably bill) |
| **SSL Certificates & Reverse Proxy** | Caddy Auto Let's Encrypt | **$0.00 / mo** |
| **Mobile Auth WhatsApp OTP** | Meta Cloud API | **~$3.50 – $7.00 / mo** |
| **TOTAL ESTIMATED MONTHLY COST** | | **~$10.50 – $14.00 / mo** |
