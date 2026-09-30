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

### H. Enterprise Polish: Purge of "Made-for-Dummies" Gimmicks & Badges (Completed & Verified ✅)
- **Removed Ubiquitous `100% COD` Pill Badges:**
  - Removed the `100% COD` green pill next to the ZEEDO logo in `MarketplaceLayoutShell.tsx`.
  - Removed the `100% COD` image overlay badge on all `ListingCard.tsx` items.
  - Removed `100% COD` header pills in `Header.tsx`, `TwoGateKycModal.tsx`, `my-bids/page.tsx`, and `profile/page.tsx`.
  - Cleaned logistics thermal slips in `PrintCenter.tsx` from promotional slogans to standard "Express Courier Logistics".
- **Eliminated Fake/Demo Ticker Fluff:**
  - Removed the fake status ticker pill ("Fast2SMS: Live | Low-Data (12-25B) | 3PL COD") from the top admin header bar.
  - Removed the tutorial indicator box ("Start Price: 1,000 IQD | Dialects: 4 Regional") from the bottom of the sidebar.
  - Removed the "Platform Gating & Rules" 5-item lecture card in `DashboardOverview.tsx` and replaced it with real, actionable recent system audit logs.
- **Removed Patronizing Button Subtitles in Active Bids:**
  - Cleaned up control panel action buttons in `ActiveBidsCommandCenter.tsx`, removing toddler-style explanations ("Award to high bidder & gen AWB", "Halt bids for dispute check", "Re-open socket stream", "Spawn fresh 24h auction", "One-click adjustments update live for all buyers").
  - Result: High-end, clean, enterprise admin tool aesthetic on par with Linear and Stripe.

### I. Delivery Location & Interactive Map System (Completed & Deployed ✅)
- **Feature Renaming:** Replaced all colloquial references to "Rooftop Map Pin Dropper" with **"Location"** / **"Delivery Location"** across all 4 Iraqi dialects (`en`, `ar`, `ckb`, `badini`) and data tables.
- **Interactive OpenStreetMap Popup (`LocationPickerModal.tsx` & `LeafletMapInner.tsx`):**
  - Built with client-side dynamic Leaflet to eliminate any Next.js SSR window evaluation issues.
  - **Draggable Custom Pin:** Retina-sharp SVG emerald beacon pin with drop shadow and radar pulse animation.
  - **Click to Drop:** Clicking anywhere immediately moves the pin and smoothly centers the viewport.
  - **Quick City Jump Bar:** 1-tap animated flyTo for all major Iraqi cities (Erbil, Baghdad, Sulaymaniyah, Basra, Duhok, Kirkuk, Najaf, Karbala).
  - **Live GPS Detection:** Floating "Locate Me (GPS)" button querying browser Geolocation API with accuracy indicator (`±Xm`).
  - **Reverse Geocoding:** Auto-queries OpenStreetMap Nominatim reverse geocoder with debouncing to suggest city and district names.
  - **Address Fields:** Confirms Governorate, District/Neighborhood, and Nearest Landmark.
- **Ubiquitous Marketplace Access:**
  - Top Navigation Header: Added compact "Location" pill beside dialect selector (displays detected/pinned city like `📍 Erbil`).
  - Two-Gate KYC Verification (`TwoGateKycModal.tsx`): Gate 2 upgraded to "Delivery Location" with interactive map launch banner.
  - Buyer Profile (`marketplace/profile/page.tsx`): Gate 2 upgraded to "Delivery Location" with one-click "Edit on Map" trigger.

### J. Streamlined Buyer Verification (Gate 1 Civil ID Upload Removed ✅)
- **Eliminated Friction:** Completely removed the Gate 1 requirement (Iraqi Civil ID / Bataqa Wataniya / Passport image upload & OCR scanning).
- **Streamlined 2-Step Requirement:**
  1. **Phone Verification via WhatsApp OTP:** Fast 6-digit verification of active Iraqi mobile number.
  2. **Delivery Location:** Pin exact doorstep on the interactive Leaflet OpenStreetMap modal.
- **Verification Rule:** A user is 100% verified and authorized to bid once their phone is confirmed via WhatsApp OTP and their location coordinates are pinned on the map (`Boolean(buyer.phone && buyer.rooftopPin)`).
- **UI Updates:**
  - `TwoGateKycModal.tsx`: Purged all OCR and file upload inputs; streamlined into Step 1 (WhatsApp Phone Verified ✓) and Step 2 (Interactive Location Map Pin).
  - `MarketplaceLayoutShell.tsx`: Top header pill updated from "Verify ID" to "Verified" or "Set Location" (opens the interactive map directly).
  - `profile/page.tsx`: Replaced Gate 1 Civil ID card with Step 1 (Phone Verified via WhatsApp OTP ✓) and Step 2 (Delivery Location).
  - `useBuyerAuthStore.ts`: Updated `isTwoGateVerified()` to `Boolean(b.phone && b.rooftopPin && b.rooftopPin.isVerified)` and automatically sets `kycStatus: 'verified'` when location is pinned.

### K. First-Launch Intro Walkthrough & Unified 3-Step Phone-First Onboarding (Completed & Deployed ✅)
- **First-Launch Intro Screen (`IntroWalkthroughModal.tsx`):**
  - Displays automatically on first visit across any marketplace page (persisted in `localStorage.getItem('zeedo_intro_seen_v1')`).
  - 4 polished slides highlighting core marketplace guarantees:
    1. **1,000 IQD Strict Starting Price:** Zero hidden reserves on every item.
    2. **Real-Time Anti-Sniping Soft-Close (≤60s):** Automatic timer resets preventing last-second sniping.
    3. **100% Cash-on-Delivery Doorstep Inspection:** Open box inspection before payment.
    4. **Doorstep GPS Precision Dispatch:** OpenStreetMap pinpoint routing across all Iraqi governorates.
  - Interactive controls: progress dots, dialect switch pills (`ckb`, `badini`, `ar`, `en`), Skip Tour button, Next/Get Started button.
  - Replay trigger: "App Tour" button placed in `marketplace/profile/page.tsx` for both guests and authenticated users to revisit anytime.
- **Guest Browsing Boundary:**
  - Guests can freely scroll the home feed, search, filter categories, toggle compact/detailed views, and view listing details in read-only mode.
  - Any interactive action triggers the streamlined sign-up/sign-in wizard:
    - Nav tabs: `My Bids`, `Saved/Watchlist`, `Profile` (intercepted in `MarketplaceLayoutShell.tsx`).
    - Listing actions: 1-tap quick bid (`+1,000 IQD`), slide-to-bid, or bookmark (intercepted in `ListingCard.tsx` and `LiveAuctionRoomModal.tsx`).
    - The intended action is preserved in `useBuyerAuthStore.pendingAction`.
- **Unified 3-Step WhatsApp OTP & Location Wizard (`BuyerAuthModal.tsx`):**
  - **Step 1 (Phone & WhatsApp OTP):** User enters Iraqi phone (+964) and requests 6-digit WhatsApp code. In sandbox/preview mode, the test code is displayed with 1-tap auto-fill. Entering an existing verified phone automatically logs in, resumes the intended action, and closes the modal.
  - **Step 2 (Full Name):** User enters their legal name (printed on courier delivery invoice).
  - **Step 3 (Interactive Delivery Location Map):** Interactive Leaflet OpenStreetMap with quick city selector chips, GPS "Locate Me" button, draggable pin, and district/landmark inputs.
  - **Instant Action Auto-Resume:** Upon clicking "Complete Registration & Start Bidding", `completeFullRegistration` is executed, the user's pending action (placing the bid, saving to watchlist, or navigating) is immediately executed, a success toast displays, and the modal closes seamlessly.
- **Zero Friction Guarantee:** Civil ID image upload remains 100% eliminated.

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
| `POST /api/auth/whatsapp/send-otp` | WhatsApp 6-Digit OTP Dispatch | Meta Cloud API / Sandbox Fallback | **Operational** |
| `POST /api/auth/whatsapp/verify-otp` | OTP Verification & Validation | Session Verifier / Master Key | **Operational** |

---

## 3. Key Credentials & Configurations

- **Admin Login:** `ZAdmin9898` / `ZEEDOA98`
- **Buyer WhatsApp Test Code:** `782910` or displayed sandbox code
- **Merchant ID:** `sel-01` (Zeedo Merchant Hub, Erbil)
- **Vercel Project:** `zeedo1/admin` (`prj_CjmLqSrWrPki65DICvgMeCeUKWNI`)
- **Latest Deployment:** `admin-hbc0xkhul-zeedo1.vercel.app` (Aliased to `https://zeedo.auction`)
- **Git Branches:** `master` and `main` are synchronized at commit `01f52d3`.

---

## 4. Verification Instructions

If verifying on a client browser:
1. Open [zeedo.auction](https://zeedo.auction) in a fresh private/incognito window (or clear `zeedo_intro_seen_v1` from localStorage).
2. The **Intro Walkthrough Screen** immediately welcomes the user with feature highlights and dialect selector.
3. Tap "Start Exploring Live Auctions" or "Skip" to enter the feed in guest read-only mode.
4. Tap "+1,000 IQD" quick bid on any listing or tap "My Bids" / "Profile" in navigation.
5. The unified 3-step modal opens:
   - Enter Iraqi mobile number -> Tap "Send WhatsApp Code" -> Enter OTP `782910`.
   - Enter Full Name -> Tap "Continue to Location Pin".
   - Pick city or tap GPS "Locate Me" on the interactive map -> Tap "Complete Registration & Start Bidding".
6. The account is instantly verified, and the pending action (placing your bid or opening your bids page) executes automatically.
