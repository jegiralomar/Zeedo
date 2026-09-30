# ZEEDO Ultra-Lean VPS Deployment Guide (Coolify / Docker)

This guide walks you through deploying the complete Zeedo platform (Next.js web & API, PostgreSQL, and the Real-Time WebSocket Bidding Gateway) on a single **$5/month Hetzner or DigitalOcean Cloud VPS** using **Coolify**.

---

## 1. Get a $5/mo VPS Server

1. Sign up at [Hetzner Cloud](https://www.hetzner.com/cloud) or [DigitalOcean](https://www.digitalocean.com).
2. Create a new server:
   * **Location:** Nuremberg / Falkenstein / Helsinki (or Frankfurt / Ashburn).
   * **Type:** x86 (e.g., Hetzner `CX22` with 2 vCPU, 4GB RAM, 40GB NVMe SSD — **€3.79 / month**).
   * **OS:** Ubuntu 24.04 LTS.
3. Note your server's Public IPv4 address.

---

## 2. Install Coolify (1-Command Setup)

SSH into your server:
```bash
ssh root@<YOUR_SERVER_IP>
```

Run the official Coolify installation script:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
Once installed, open your browser and go to `http://<YOUR_SERVER_IP>:8000`. Create your admin credentials.

---

## 3. Deploy Zeedo Stack with 1-Click

In your Coolify Dashboard:
1. Click **+ Create New Project** &rarr; Select **Docker Compose**.
2. Select your GitHub repository (`jegiralomar/Zeedo`).
3. Point to the root [docker-compose.yml](file:///d:/ZEEDO%20BID%20APP/docker-compose.yml).
4. Paste your environment variables from [.env.production.example](file:///d:/ZEEDO%20BID%20APP/.env.production.example):
   * `DOMAIN=zeedo.auction`
   * `ADMIN_DOMAIN=admin.zeedo.auction`
   * `POSTGRES_PASSWORD=your_secure_password`
   * `WS_BROADCAST_SECRET=your_broadcast_secret`
   * `GEMINI_API_KEY=your_gemini_key`
5. Click **Deploy**.

Coolify will automatically:
* Build the optimized Next.js standalone container.
* Launch the lightweight WebSocket Bidding Gateway.
* Start PostgreSQL on fast NVMe storage.
* Issue free auto-renewing SSL certificates from Let's Encrypt for `zeedo.auction` and `admin.zeedo.auction`.

---

## 4. Real-Time WebSocket Verification

Test that the bidding gateway is running:
```bash
curl https://zeedo.auction/health
```
Expected output:
```json
{
  "status": "healthy",
  "totalConnections": 0,
  "memoryUsageMb": 18
}
```

---

## 5. Summary of Running Costs

* **All-in-One Cloud VPS:** ~$5.00 / month
* **90-Day Mobile Sessions (WhatsApp OTP):** ~$3.50 – $7.00 / month
* **Cloudflare R2 Media Storage:** $0.00 / month
* **Firebase Push Notifications:** $0.00 / month
* **Total:** **~$8.50 – $12.00 / month**
