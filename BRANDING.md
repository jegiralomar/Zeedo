# ZEEDO Brand Identity & Design System

> **Official Brand Manual & Design Guidelines for ZEEDO (زيدو)**  
> *Iraq's Premier Live Auction Mobile Ecosystem*

---

## 1. Brand Philosophy & Etymology

- **Brand Name**: ZEEDO (English) / زيدو (Arabic)
- **Origin**: Derived from the Iraqi Arabic verb root *“Zeedu”* / *“Zeed”* (زيد / زيدوا), meaning **“increase”**, **“bid higher”**, and **“accelerate value”**.
- **Mission**: To bring transparent, thrilling, and 100% Cash-on-Delivery live auctions to every doorstep across Baghdad, Erbil, Basra, and all Iraqi provinces.

---

## 2. Official Brand Slogans & Taglines

| Language | Official Tagline | Subtitle / Descriptor |
| :--- | :--- | :--- |
| **English** | **Bid. Win. Own.** | Iraq's Premier Live Auctions |
| **Arabic (عربي)** | **زايد. اربح. امتلك.** | المزادات الحية الأولى في العراق |
| **Kurdish (کوردی)** | **موزایەدە بکە. بیبە بەرەوە. ببە بە خاوەنی.** | یەکەمین ئەپڵیکەیشنی موزایەدەی ڕاستەوخۆ لە عێراق |

---

## 3. Brand Mark & Geometry

### The Concept: Dynamic 'Z' + Rising Outbid Arrow
The ZEEDO combination mark represents the intersection of two powerful symbols:
1. **The Letter 'Z'**: Sharp, geometric structure anchoring the brand name.
2. **The Rising Arrow**: A 45-degree diagonal surge breaking through the top-right quadrant, symbolizing live auction momentum, competitive outbidding, and upward value growth.

### Clearspace & Sizing
- **Minimum Clearspace**: 25% of mark height ($0.25H$) around all bounding edges.
- **Minimum Digital Size**: 24px height for icon; 32px height for horizontal lockup.
- **Favicon & App Store Ready**: Optimized for 16px, 32px, 48px, 180px, 192px, 512px, and 1024px.

---

## 4. Color Palette & Design Tokens

Derived from modern high-energy commerce and fintech aesthetics:

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│     PRIMARY     │   │    SECONDARY    │   │  DARK OBSIDIAN  │
│  Coral Crimson  │   │ Electric Azure  │   │  Midnight Navy  │
│     #F83758     │   │     #4392F9     │   │     #17223B     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   ACCENT GOLD   │   │  LIGHT CANVAS   │   │   PURE WHITE    │
│    Bid Surge    │   │   Background    │   │  Card Surfaces  │
│     #F8991D     │   │     #F9FAFB     │   │     #FFFFFF     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Detailed Token Specifications

| Token Name | Hex Code | RGB | HSL | Semantic Role |
| :--- | :--- | :--- | :--- | :--- |
| `--color-primary` | `#F83758` | `248, 55, 88` | `350°, 94%, 59%` | Primary buttons, active bid highlights, brand mark |
| `--color-secondary` | `#4392F9` | `67, 146, 249` | `214°, 94%, 62%` | Countdown timers, verified badges, action accents |
| `--color-dark` | `#17223B` | `23, 34, 59` | `222°, 44%, 16%` | Headings, dark cards, footer background, wordmark |
| `--color-accent` | `#F8991D` | `248, 153, 29` | `34°, 94%, 54%` | Winning hammer, rating stars, flash deals |
| `--color-canvas` | `#F9FAFB` | `249, 250, 251` | `210°, 20%, 98%` | Global screen background |
| `--color-border` | `#ECEFF3` | `236, 239, 243` | `214°, 20%, 94%` | Dividers, card strokes |

---

## 5. Typography System

### Latin Typography: Montserrat & Plus Jakarta Sans
- **Headings & Logo**: Montserrat (`font-black`, `font-extrabold`, letter-spacing `-0.02em`)
- **Body & Metrics**: Plus Jakarta Sans (`font-medium`, `font-semibold`)

### Arabic & Kurdish Typography: Tajawal
- **Headings**: Tajawal (`font-bold`, `font-extrabold`)
- **UI Copy & Buttons**: Tajawal (`font-medium`)

---

## 6. Official Deliverables Directory

All production-grade assets are located in `/apps/admin/public/`:

```
apps/admin/public/
├── brand/
│   ├── zeedo-icon.svg                  # Standalone SVG symbol
│   ├── zeedo-app-icon.svg              # Squircle iOS/Android app icon (SVG)
│   ├── zeedo-logo-horizontal.svg       # Horizontal lockup (Icon + Wordmark)
│   ├── zeedo-icon-pure-vector.svg      # 100% path geometric vector
│   ├── zeedo-icon.png                  # High-res 512x512 transparent PNG
│   ├── zeedo-app-icon.png              # 512x512 white tile app store icon
│   ├── zeedo-logo-horizontal.png       # Transparent horizontal lockup
│   └── zeedo-logo-horizontal-white.png # Dark-mode white text lockup
├── favicon.ico                         # Multi-res favicon (16, 32, 48, 64px)
├── favicon.svg                         # Modern SVG favicon
├── apple-touch-icon.png                # 180x180 iOS home screen icon
├── icon-192.png                        # Android PWA 192x192 icon
├── icon-512.png                        # Android PWA 512x512 icon
└── brand-identity.html                 # Interactive in-browser brand showcase
```

---

## 7. Brand Rules & Best Practices

### What TO DO:
- ✅ Always use the official standalone 'Z' arrow mark on high-contrast backgrounds.
- ✅ Maintain the signature coral-to-blue gradient (`#F83758` to `#4392F9`) along the rising arrow.
- ✅ Use obsidian navy (`#17223B`) for the wordmark text on light canvases.
- ✅ Accompany the logo with the official tagline **"Bid. Win. Own."** in promotions.

### What NOT TO DO:
- ❌ Do not rotate or skew the rising arrow angle away from its 45° trajectory.
- ❌ Do not recolor the icon in unapproved arbitrary colors.
- ❌ Do not distort the aspect ratio of the wordmark or glyph.
- ❌ Do not crowd the icon; always respect the 25% clearspace boundary.
