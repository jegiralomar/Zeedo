# Mobile Design System Guidelines: Zeedo Live Arabic Auction Theme

All current and future mobile app screens, modals, sub-windows, bottom sheets, dialogs, and components in `apps/mobile` MUST strictly follow the **Zeedo Live Arabic Auction Design System** (Reference: Arabic auction & shopping app with Royal Indigo & Pastel UI).

---

## 1. Core Color Tokens (Import from `apps/mobile/src/lib/theme.ts`)

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `AppTheme.colors.background` | `#F5F6FA` | Soft lavender-tinted periwinkle canvas |
| `AppTheme.colors.card` | `#FFFFFF` | Pure white cards, bottom nav dock, inputs |
| `AppTheme.colors.primary` | `#5B50D6` | Signature Royal Indigo/Purple (gavel logo, "عطاء الآن" buttons, headlines) |
| `AppTheme.colors.primaryLight` | `#EEEDFB` | Filter button background, subtle active highlights |
| `AppTheme.colors.accentYellow` | `#FFB800` | Active bottom navigation pill (Home) & hero box accents |
| `AppTheme.colors.fabNavy` | `#1E2235` | Center circular Floating Action Button (`+`) and primary dark text |
| `AppTheme.colors.liveRed` | `#EF4444` | Pulsing red live broadcast dot and live header badge |
| `AppTheme.colors.liveBadgeBg` | `#FFFFFF` | White pill with red dot floating on auction photos (`• يعيش / • LIVE`) |
| `AppTheme.colors.pastelPink` | `#FDF0F5` | Category tile: "بيت" (Home / Electronics) with `#D946EF` |
| `AppTheme.colors.pastelBlue` | `#EBF5FF` | Category tile: "بناء" (Building / Real Estate) with `#0EA5E9` |
| `AppTheme.colors.pastelTeal` | `#E6F8FA` | Category tile: "لعب" (Gaming / Toys) with `#06B6D4` |
| `AppTheme.colors.pastelPurple` | `#F3E8FF` | Category tile: "ساعات" (Watches) with `#7C3AED` |
| `AppTheme.colors.pastelAmber` | `#FFFBEB` | Category tile: "سيارات" (Autos) with `#F59E0B` |
| `AppTheme.colors.textPrimary` | `#1E2235` | Deep navy/charcoal typography |
| `AppTheme.colors.textSecondary` | `#64748B` | Muted slate secondary text |

---

## 2. Key Screen Components

### A. Top Header
- **Left**: Hamburger menu icon (`☰`, `#64748B`).
- **Center**: Royal indigo square badge (`#5B50D6`, 44x44px, radius 14px) with golden auction gavel icon (`⚖️`).
- **Right**: User profile avatar in circular frame (`40x40px`).

### B. Promotional Hero Card
- **Card**: Pure white `#FFFFFF`, rounded 24px, subtle elevation.
- **Headline**: Bold royal purple Arabic slogan ("کن المالك من هذه السيارة").
- **Visual**: 3D vector open yellow parcel box with purple apparel and star popping out.

### C. Search & Filter Bar
- **Left**: Square filter button (`#EEEDFB`, 48x48px, radius 14px, filter sliders icon `🎚️`).
- **Right**: White search input container with magnifying glass (`🔍`) and Arabic placeholder ("عناصر البحث").

### D. Categories ("التصنيفات")
- **Tiles**: Soft squircle cards (92x96px, radius 20px) in neo-pastel tones with large colored iconography and bold labels.

### E. Live Auction Cards ("البث المباشر")
- **Layout**: 2 columns, white rounded cards (radius 20px) with 1px border.
- **Photo**: 155px height with:
  - Top-right: Floating white pill with red dot `• يعيش` (or `• LIVE`).
  - Top-left: Floating heart wishlist button.
  - Bottom-left: Verified seller badge with avatar + name (e.g. `عادل عدنان`).
- **CTA**: Full-width Royal Indigo button (`#5B50D6`, radius 12px) with bold white text `عطاء الآن` (Bid Now).

### F. Signature Bottom Navigation Dock
- **Shape**: White elevated floating dock (`#FFFFFF`, height 68px, top radius 28px).
- **Active Home Tab**: Warm golden yellow circle pill (`#FFB800`, 44x44px) with dark home icon (`🏠`).
- **Center FAB**: Deep navy elevated circle button (`#1E2235`, 58x58px, 3px white border) with `＋` symbol.
- **Tabs**: Home, Bids/Cart, Center FAB, Wishlist, Profile.
