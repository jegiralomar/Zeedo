# Zeedo Bid App — Session Handoff & Status

**Last Updated:** September 30, 2026  
**Repository:** `d:\ZEEDO BID APP`  
**Production URL:** [https://zeedo.auction](https://zeedo.auction)  
**Admin URL:** [https://admin.zeedo.auction](https://admin.zeedo.auction) (and fallback [https://zeedo.auction/admin](https://zeedo.auction/admin))  
**Master Admin Credentials:** `ZAdmin9898` / `ZEEDOA98`

---

## 1. Summary of Recent Progress & Critical Fixes

### A. Resolution of `multilingual.ckb` Crash (Completed & Deployed ✅)
- **Root Cause:**
  - Marketplace buyer app defaults to Kurdish Sorani (`language: 'ckb'`).
  - Legacy listings in the PostgreSQL database or cached in browser `localStorage` under `zeedo_buyer_auction_prod_v1` lacked the `multilingual` JSON object.
  - In `marketplace/page.tsx` and `marketplace/my-bids/page.tsx`, `item.multilingual[language]` evaluated to `item.multilingual['ckb']`, throwing `Uncaught TypeError: can't access property "ckb", e.multilingual is undefined` and crashing the React tree.
  - In `useBuyerAuctionStore.ts`, `syncLiveAuctionsFromDb` was previously omitting the `multilingual` dictionary mapping from API rows, saving unmapped items into store state.
- **Comprehensive Solution:**
  - Added safe optional chaining (`item.multilingual?.[language] || item.multilingual?.en || ...`) with comprehensive Iraqi dialect fallbacks (`ckb`, `badini`, `ar`, `en`) across all 11 affected files:
    - `marketplace/page.tsx`
    - `marketplace/my-bids/page.tsx`
    - `useBuyerAuctionStore.ts`
    - `useAdminStore.ts`
    - `MultiDialectReviewStudio.tsx`
    - `LiveWarRoom.tsx`
    - `SellerProfileDetail.tsx`
    - `SupportTicketsHelpdesk.tsx`
    - `ParcelLifecycleBoard.tsx`
    - `PrintCenter.tsx`
    - `MerchantPortalView.tsx`
  - Upgraded buyer Zustand store persistence key from `zeedo_buyer_auction_prod_v1` to `zeedo_buyer_auction_prod_v2` to immediately invalidate and purge any corrupted legacy state cached in client browsers.
  - Fixed listing sync mapper to populate all 4 dialects, image URLs, and specifications.

### B. Branch Sync & Production Deployment Pipeline (Completed & Deployed ✅)
- **Root Cause for Delayed Edge Updates:**
  - `origin/main` was 18 commits behind `origin/master`.
  - Vercel Git-triggered builds were failing in 4 seconds due to root directory configuration when pulling the full monorepo root.
- **Resolution:**
  - Fast-forward merged `master` into `main` and pushed both branches to GitHub (`commit 4a0ba49`).
  - Executed direct CLI production build and deployment (`vercel --prod --yes`) from `apps/admin/`.
  - Deployment `admin-o48acw5mm-zeedo1.vercel.app` completed successfully in 15s and aliased directly to `https://zeedo.auction`.
  - Verified live bundle: old crashing chunk `1i5thibl0xj3n.js` is gone; verified live chunk `3-k0fzwti2iav.js` contains the new fallback logic and `09p-0il68u_zq.js` serves the `v2` store.

### C. Merchant Portal & Scraper Architecture (Completed ✅)
- **Gemini Official `url_context` Scraper:** Upgraded `/api/scraper/product` to use Gemini API with URL context and Headless Jina Reader fallback (`https://r.jina.ai/`).
- **Catalog Intelligence:** Automatically parses product images, retail price baseline in USD/IQD, specifications, and auto-generates translations across all Iraqi dialects:
  - `ckb` (Kurdish Sorani - Erbil & Sulaymaniyah)
  - `badini` (Kurdish Badini - Duhok & Zakho)
  - `ar` (Iraqi Arabic - Baghdad & Basra)
  - `en` (English Reference)
- **ID Collision Fix:** Replaced random Math IDs with millisecond-timestamped keys (`auc-${Date.now().toString().slice(-6)}`) preventing merchant listings from overwriting one another.
- **Postgres Real-Time Sync:** Merchant-submitted items persist to Neon PostgreSQL (`auctions` table) and appear in the Admin Moderation queue.

### D. Pure IQD Bidding & Iraqi Localized Economics (Completed ✅)
- Starting price strictly **1,000 IQD** nationwide.
- Dynamic bidding tiers:
  - `< 100,000 IQD`: `+1,000 IQD` increments
  - `100,000 - 200,000 IQD`: `+2,000 IQD` increments
  - `> 200,000 IQD`: `+3,000 IQD` increments
- 60-second Anti-Sniping soft close timer extensions with visual alerts.
- Live exchange rate sync via Central Bank of Iraq market rate (`/api/exchange-rate`).

### E. Dual-Domain Architecture & Tesseract.js OCR (Completed ✅)
- **`zeedo.auction`:** Buyer Marketplace Web App.
- **`admin.zeedo.auction`:** Operations & Admin Panel (`/admin/*`).
- **Next.js Subdomain Middleware (`src/middleware.ts`):** Host header inspection dynamically routes buyer vs admin requests while sharing `/api/*`.
- **Self-Contained Tesseract.js OCR:** Iraqi Unified National ID cards (*Bataqa Wataniya*) parsed locally in `/api/ai/ocr-id` without external API quotas.

### F. Marketplace Feed & Adaptive Card System (Completed & Verified ✅)
- **Adaptive Layout Toggle:** Quick toggle on marketplace feed allowing buyers to switch between:
  - **2-Column Compact Grid (`compact`):** High-speed mobile scanning with clean equal-height cards (product image, condition tag, live countdown timer pill, 2-line title clamp, responsive PriceOdometer, and 1-tap quick bid button).
  - **1-Column Detailed Feed (`detailed`):** High-impact card presentation with 4:3 photo, 100% COD badge, price sparkline trajectory, retail baseline comparison, and dual actions (Quick Bid + Details/War Room).
- **View Mode Persistence:** Buyer's chosen view preference is saved in `localStorage.getItem('zeedo_view_mode')`.
- **Visual-Only Live Bid Highlight:** When bids increment or quick bid is clicked, the card triggers a subtle emerald border pulse (`ring-2 ring-emerald-500/80 shadow-md shadow-emerald-500/10`) and animated price spark badge (`+1,000 IQD`) without disruptive vibration or audio.
- **Clean Clutter-Free Feed:** Avoided redundant floating ticker overlay since card prices are already live.

### G. Phase 1: Admin Panel Redesign & Active Bids Command Center (Completed & Verified ✅)
- **Unified Clean Design System:** Replaced the legacy dark green/lime aesthetic with the buyer app's modern light theme:
  - Background canvas: Tailwind Slate-50 (`bg-[#F8FAFC]`)
  - Elevated window cards: `bg-white rounded-2xl border border-slate-200/80 shadow-xs`
  - Primary accents: Royal Blue (`#2563EB`), Emerald COD/money pills, and clean high-contrast typography.
- **Compact Icon Rail & Slide-out Drawer:**
  - Modern vertical rail supporting 2 states: compact icon rail (`w-[76px]`) with hover tooltips and expanded drawer (`w-[260px]`).
  - Expand/collapse toggle button with user preference persisted in `localStorage.getItem('zeedo_admin_sidebar_collapsed')`.
  - Live indicator badges for Active Bids, pending KYC, pending moderation, and open tickets.
- **Active Bids Command Center (`/admin/auctions`):**
  - Completely replaced the cluttered "War Room" with a dedicated, high-clarity **Active Bids** management dashboard.
  - **Top KPI Windows:** Live Auctions (with green pulse), Bids Placed Today, Active GMV Volume in IQD, and Soft-Close Watch (<60s).
  - **Search & Filters:** Search by title, auction ID, seller, or category with category pills and quick filters (`All Active`, `Soft-Close <60s`, `Ending Soon <5m`, `Paused`).
  - **Dual Layout Modes:** Visual Card Grid (for rapid visual assessment) and Operations Table (for bulk inspection).
  - **Direct Card Actions:** Fast 1-click `+1 Min` timer extend, Pause/Resume toggle, and Controls modal trigger.
  - **Comprehensive Auction Control Modal:**
    - Real-time countdown clock and instant timer extension buttons (`+1m`, `+5m`, `+15m`, custom minutes, and 60s soft-close reset).
    - Lifecycle operations: Force Conclude & Dispatch to COD courier (automatically triggers AWB generation and assigns winner), Pause/Resume auction, and One-Tap Relist at 1,000 IQD.
    - Full chronological bidder history table with phone numbers, timestamps, and one-click **Void Bid** feature with moderator reason selection and automatic winning price recalculation.
    - Test bid simulation button for verifying anti-sniping and low-data socket payloads.
- **Global Toast & Shell Integration:** Integrated `<ToastContainer />` into `AppLayoutShell.tsx` and added `extendAuctionTimer` and `togglePauseAuction` into `useAdminStore.ts` with audit logging.
- **Dashboard & Header Polish:** Modernized `DashboardOverview.tsx` and `Header.tsx` to match the new white/blue/emerald window card system.

---

## 2. Active System Architecture

| Endpoint / Domain | Purpose | Backing Source | Status |
|---|---|---|---|
| `https://zeedo.auction` | Buyer Marketplace Web App | Next.js Turbopack (`/marketplace/*`) | **Live & Verified** |
| `https://admin.zeedo.auction` | Operations Management Panel | Next.js Turbopack (`/admin/*`) | **Live** |
| `https://zeedo.auction/admin` | Direct Admin Fallback | Next.js Turbopack (`/admin/*`) | **Live Fallback** |
| `GET /api/listings?status=live` | Live Marketplace Listings | Neon PostgreSQL (`auctions` table) | **Operational** |
| `POST /api/listings` | Merchant Listing Creation | Neon PostgreSQL | **Operational** |
| `POST /api/scraper/product` | Product Catalog Scraper | Jina Reader + Gemini `url_context` | **Operational** |
| `POST /api/ai/ocr-id` | Bataqa Wataniya Civil ID OCR | Self-contained Tesseract.js (`ara` + `eng`) | **Operational** |

---

## 3. Key Credentials & Configurations

- **Admin Login:** `ZAdmin9898` / `ZEEDOA98`
- **Buyer Test Account:** Phone auth / OTP simulation (auto-verifies in development/preview)
- **Merchant ID:** `sel-01` (Zeedo Merchant Hub, Erbil)
- **Vercel Project:** `zeedo1/admin` (`prj_CjmLqSrWrPki65DICvgMeCeUKWNI`)
- **Git Branches:** `master` and `main` are synchronized at commit `f8e29ba`.

---

## 4. Verification Instructions

If verifying on a client browser:
1. Open [zeedo.auction](https://zeedo.auction).
2. Perform a hard refresh (`Ctrl + Shift + R` on Windows/Linux or `Cmd + Shift + R` on Mac).
3. The marketplace renders with Kurdish Sorani (`ckb`) by default, category pills, live auction cards, and zero console TypeErrors.
