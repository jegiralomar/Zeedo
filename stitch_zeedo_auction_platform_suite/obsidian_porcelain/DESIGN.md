---
name: Obsidian & Porcelain
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444653'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#6f001c'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a002b'
  on-tertiary-container: '#ffa2a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter, Noto Sans Arabic, sans-serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter, Noto Sans Arabic, sans-serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter, Noto Sans Arabic, sans-serif
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans Arabic, Inter, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans Arabic, Inter, sans-serif
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Noto Sans Arabic, Inter, sans-serif
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Vazirmatn, Inter, sans-serif
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Vazirmatn, Inter, sans-serif
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Vazirmatn, Inter, sans-serif
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an ultra-crisp, light porcelain aesthetic tailored for high-performance financial, enterprise, and productivity platforms. The visual narrative balances clinical precision with elevated editorial refinement, evoking absolute reliability, analytical clarity, and effortless sophistication. 

The aesthetic style merges refined minimalism with low-contrast structural outlines ("ghost borders") and immaculate white surfaces. It prioritizes data density without visual fatigue, establishing clear hierarchical signposts through calibrated contrast rather than heavy decorative elements.

## Colors

The palette is anchored by the soft off-white canvas (`#F8FAFC`) and pure white structural layers (`#FFFFFF`). Typography utilizes deep obsidian blue-black (`#090D1A`) for commanding headings and slate gray (`#334155`) for readable, high-contrast body copy. 

Functional accents are deployed with strict intention:
- **Primary Brand:** Deep royal cobalt (`#1E40AF`) drives primary interactive states and focal points.
- **Success:** Winning green (`#059669`) highlights positive financial yields and completion states.
- **Feedback / Destructive:** Soft rose crimson (`#E11D48`) signals critical alerts and powers smooth 60ms soft-close micro-interactions.

Subtle micro-borders (`#E2E8F0`) provide low-contrast boundary definitions, maintaining separation across flat card layouts without casting heavy shadows.

## Typography

Typography establishes an authoritative yet accessible voice. Inter provides crisp, geometric precision for primary Latin headlines, paired seamlessly with Noto Sans Arabic for primary body text and Vazirmatn for structured UI labels. 

Ensure line heights remain tight on headlines to emphasize structural stability, while body scales maintain generous whitespace to support high-density analytical scanning.

## Layout & Spacing

The layout relies on a strict 12-column fluid grid system designed for desktop dashboards and responsive data views. Content containers adapt fluidly within a fixed-maximum canvas width, utilizing consistent 24px outer margins and 24px column gutters.

Spacing follows an 8px baseline rhythm. Components leverage predictable internal padding scales (`space-sm` to `space-xl`) to maintain airy separation across porcelain-white surfaces. On mobile viewports, outer margins collapse to 16px and multi-column data grids reflow into single-column stacked sequences.

## Elevation & Depth

Depth is conveyed primarily through low-contrast outlines ("ghost borders") and crisp surface-container tiers rather than heavy drop shadows. 

- **Base Layer:** The canvas sits at `#F8FAFC`.
- **Surface Layer:** Pure white cards (`#FFFFFF`) rest on the canvas, separated by ultra-thin 1px micro-borders (`#E2E8F0`).
- **Floating Modals & Popovers:** Utilize feather-light, highly diffused ambient shadows (`0 10px 25px -5px rgba(9, 13, 26, 0.05), 0 8px 10px -6px rgba(9, 13, 26, 0.05)`) paired with semi-transparent backdrops to ensure interactive elements feel weightless yet distinct.

## Shapes

The shape language balances architectural rigor with tactile approachability. Major layout containers, data panels, and cards use generous `rounded-2xl` geometry (1rem to 1.5rem radius) to soften the analytical density of the interface. Interactive badges, status indicators, and primary call-to-action pills strictly employ `rounded-full` styling. Smaller utility elements such as input fields and dropdown menus adopt standard `rounded-lg` corners (0.5rem).

## Components

### Buttons
Primary buttons utilize the deep royal cobalt fill (`#1E40AF`) with pure white label text, featuring `rounded-full` geometry and rapid 60ms micro-transitions on active states. Secondary actions use ghost borders with slate text, shifting to porcelain-white fills on hover.

### Chips & Badges
Rendered as `rounded-full` pills with soft background tints. Success states use winning green (`#059669`) at 10% opacity with matching text; critical alerts use soft rose crimson (`#E11D48`).

### Input Fields
Built with clean white backgrounds, 1px micro-borders (`#E2E8F0`), and `rounded-lg` corners. Focus states immediately transition the border to deep royal cobalt with a zero-offset focus ring.

### Cards
Pure white (`#FFFFFF`) surfaces enclosed by micro-borders and styled with `rounded-2xl` corners. Internal padding should uniformly apply `space-lg`.

### Lists & Tables
Data tables feature alternating row subtly shaded with the base neutral tone, separated by 1px horizontal dividers. Hover states trigger an instant porcelain-tint shift for scanability.