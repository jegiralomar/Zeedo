# Zeedo Bid App — Session Handoff & Status

**Last Updated:** September 30, 2026  
**Repository:** `d:\ZEEDO BID APP`  
**Production URL:** [https://zeedo.auction](https://zeedo.auction)  
**Admin URL:** [https://admin.zeedo.auction](https://admin.zeedo.auction) (and fallback [https://zeedo.auction/admin](https://zeedo.auction/admin))

---

## 1. Summary of Recent Progress

### A. Dual-Domain Subdomain Architecture (Completed ✅)
- **`zeedo.auction`:** Dedicated to the **Buyer Marketplace Web Application**.
  - Replicates the exact visual layout and components of the Expo React Native mobile app in responsive Tailwind web components.
  - **Live Auction Browsing:** Category pills (Phones, Watches, Gaming, Laptops), real-time search, 2-column grid vs. list view toggle.
  - **Anti-Sniping Zone Banner:** Live countdown ticking ticker (<60s soft close alert, reset count, leading bidder).
  - **Live Auction War Room (`LiveAuctionRoomModal.tsx`):** Dynamic tier increments (`+1,000`, `+2,000`, `+3,000 IQD`), proxy auto-bid ceiling with safety brake check, live bids ledger.
  - **Two-Gate KYC Verification (`TwoGateKycModal.tsx`):**
    - **Gate 1:** Civil ID verification powered by our self-contained Tesseract.js OCR engine (`/api/ai/ocr-id`).
    - **Gate 2:** Rooftop GPS Map Pin Dropper with landmark and Iraqi district inputs.
  - **My Bids & COD Tracking (`/my-bids`):** Active bids (leader vs outbid) and won items with thermal AWB tracking numbers.
  - **Saved Watchlist (`/watchlist`):** Live bookmarked items.
  - **Buyer Profile (`/profile`):** Verified identity, phone, address, and bid records.
  - **Multilingual RTL/LTR:** Instant switching between Kurdish Sorani (`ckb`), Kurdish Badini (`badini`), Arabic (`ar`), and English (`en`).

- **`admin.zeedo.auction`:** Dedicated to the **Operations & Admin Panel**.
  - All admin operations moved under `src/app/admin/`:
    - Overview Dashboard (`/` -> `/admin`)
    - Live Auction War Room (`/auctions` -> `/admin/auctions`)
    - Split-Screen KYC Review (`/kyc` -> `/admin/kyc`)
    - Listing Moderation (`/moderation` -> `/admin/moderation`)
    - Logistics & Thermal Label Print Center (`/logistics` -> `/admin/logistics`)
    - Merchants & Sellers (`/sellers` -> `/admin/sellers`)
    - Marketing & CMS (`/cms` -> `/admin/cms`)
    - Support & Help Desk (`/support` -> `/admin/support`)
    - Team & RBAC Roles (`/team` -> `/admin/team`)
    - Audit Trail (`/audit` -> `/admin/audit`)
  - Direct path fallback: `zeedo.auction/admin` remains fully functional during DNS setup.

- **Next.js Subdomain Routing (`src/middleware.ts`):**
  - Host header inspection routes `admin.zeedo.auction` -> `/admin/*` and `zeedo.auction` -> `/marketplace/*`.
  - All `/api/*` routes are shared seamlessly without cross-origin CORS barriers.

### B. Self-Contained Tesseract.js OCR (Completed ✅)
- Dual-language Arabic (`ara`) and English (`eng`) model pipeline.
- Extracts Iraqi Unified National ID cards (*Bataqa Wataniya*).
- Zero API keys, zero rate limits, zero external quotas.

### C. Build & Verification (Completed ✅)
- Tested with Next.js 16.3.6 (Turbopack) — all 30 routes and the Middleware Proxy compiled cleanly with 0 TypeScript/compilation errors.

---

## 2. Vercel Domain Configuration Instructions

To activate the dual-domain routing in production on Vercel:
1. Open the **Vercel Dashboard** → Select the **Zeedo** project.
2. Navigate to **Settings** → **Domains**.
3. Ensure both domains are added to the same project:
   - `zeedo.auction` (Primary domain → serves Buyer Marketplace)
   - `www.zeedo.auction` (Redirects to `zeedo.auction`)
   - `admin.zeedo.auction` (Subdomain → serves Admin Console)
4. In your DNS provider (e.g., Cloudflare, Namecheap, GoDaddy):
   - Add a CNAME record: `admin` pointing to `cname.vercel-dns.com` (or Vercel CNAME).

---

## 3. Active Architecture

| Domain | Experience | Target | Status |
|---|---|---|---|
| `zeedo.auction` | Buyer Marketplace | `/marketplace/*` | Production Ready |
| `admin.zeedo.auction` | Spark Admin Console | `/admin/*` | Production Ready |
| `zeedo.auction/admin` | Admin Fallback | `/admin/*` | Active Fallback |
| Shared API (`/api/*`) | Backend Services | Neon Postgres DB + Tesseract OCR | Live |
