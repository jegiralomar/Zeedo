# Mobile Design System Guidelines: Evira Theme (Mandatory)

All current and future mobile app screens, modals, sub-windows, bottom sheets, dialogs, and components in `apps/mobile` MUST strictly follow the **Evira Luxury E-Commerce Design System** (`https://www.figma.com/design/V8JZxq0kFvfbOEVRmIWpaU/Evira---E-Commerce---Online-Shop-App-UI-Kit--Community-`).

---

## 1. Core Color Tokens (Import from `apps/mobile/src/lib/theme.ts`)

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `EviraTheme.colors.background` | `#FFFFFF` | Canvas, modal sheets, cards |
| `EviraTheme.colors.surface` | `#F4F4F6` | Image boxes, input backgrounds, inactive category circles/chips |
| `EviraTheme.colors.surfaceSubtle` | `#F8F9FA` | Very subtle card highlights |
| `EviraTheme.colors.primary` | `#111111` | Primary CTA buttons, active pills, deep black headers |
| `EviraTheme.colors.textPrimary` | `#111111` | Primary headings and values |
| `EviraTheme.colors.textSecondary` | `#6B7280` | Subtitles, helper text, timestamps |
| `EviraTheme.colors.textTertiary` | `#9CA3AF` | Placeholders, inactive icons |
| `EviraTheme.colors.border` | `#EEEEEE` | Card & input borders |
| `EviraTheme.colors.borderLight` | `#F3F4F6` | Dividers and separators |
| `EviraTheme.colors.backdrop` | `rgba(0, 0, 0, 0.45)` | Dim overlay for all bottom sheets & modals |
| `EviraTheme.colors.accentGold` | `#D97706` | Iraqi dinar highlights and badges |
| `EviraTheme.colors.liveRed` | `#EF4444` | Live auction pulse and urgent timers (< 2 min) |
| `EviraTheme.colors.success` | `#10B981` | Bid confirmations & verified checks |

> **Prohibited:** Never introduce dark green (`#072F1F`, `#0F3826`), neon lime (`#B4F105`), or greenish slate (`#A7C1B5`) into the mobile app.

---

## 2. Windows & Modal Bottom Sheets Architecture

For all modal dialogs, drawers, and popups:
1. **Always use `<EviraModal>`** (`apps/mobile/src/components/EviraModal.tsx`) or apply `eviraWindowStyles` from `apps/mobile/src/lib/theme.ts`.
2. **Sheet Card**: Pure white `#FFFFFF`, top radii `28px` (`EviraTheme.radii.xxl`).
3. **Pull Handle**: 40x4px gray pill `#E5E7EB` centered at the top.
4. **Header Row**: Title in `#111111` (800 bold, 20px) with circular close button (`32x32px`, surface `#F4F4F6`).
5. **Backdrop**: Translucent black `rgba(0, 0, 0, 0.45)` with touch-to-dismiss.
6. **Primary Button**: Solid deep black `#111111` with white text, pill radius (`radii.full`), 16px vertical padding.

---

## 3. Product Cards & Grids
- **Grid Layout**: 2 columns with `columnGap: 12`, `rowGap: 16`.
- **Image Container**: Aspect ratio 1:1, soft neutral gray `#F4F4F6`, radius `18px`, with a floating circular heart watchlist button at the top right.
- **Rating**: Star icon with gold rating (`#F59E0B`) and review count in `#6B7280`.
- **Price Tag**: Bold black `#111111`, format `IQD X,XXX,XXX`.

---

## 4. Inputs & Controls
- **Inputs**: Background `#F4F4F6`, border `#EEEEEE` (1px), radius `14-16px`, padding 14px, text `#111111`.
- **Filter Chips**: Inactive `#FFFFFF` with `#EEEEEE` border; Active `#111111` with white text.
- **Sliders / Controls**: Black track `#111111`, white circular draggable thumb, success feedback in `#10B981`.
