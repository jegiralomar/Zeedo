/**
 * ZEEDO AUCTION MOBILE DESIGN SYSTEM
 * Matches reference style:
 * - Canvas: Soft tinted lavender-gray (#F5F6FA)
 * - Primary Action / Brand: Royal Indigo Purple (#5B50D6)
 * - Active Accent: Warm Golden Yellow (#FFB800)
 * - Contrast Accent / FAB: Deep Navy (#1E2235)
 * - Categories: Soft neo-pastel rounded tiles (#FDF0F5, #EBF5FF, #E6F8FA, #F3E8FF)
 * - Live Card: White rounded cards, live badge pill ("• يعيش / • LIVE"), seller pill, full-width purple "عطاء الآن" (Bid Now) button
 * - Bottom Bar: Curved dock with center elevated FAB (+) and active yellow pill for Home
 */

import { StyleSheet } from 'react-native';

export const AppTheme = {
  colors: {
    // Canvas & Surfaces
    background: '#F5F6FA',       // Signature soft lavender-tinted background
    canvas: '#F5F6FA',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F0F1F7',
    surfaceSubtle: '#F8F9FA',
    border: '#ECEEF5',
    borderLight: '#F3F4F9',

    // Primary Brand & Actions
    primary: '#5B50D6',          // Royal Indigo / Purple (gavel logo & CTA buttons)
    primaryHover: '#4A40C4',
    primaryLight: '#EEEDFB',     // Filter button background & subtle purple pills
    primaryDark: '#3C33A3',

    // Warm & Lively Accents
    accentYellow: '#FFB800',     // Active bottom navigation pill & hero box
    accentGold: '#D97706',
    fabNavy: '#1E2235',          // Center floating action button (+) & dark text
    liveRed: '#EF4444',          // Pulsing red live broadcast dot
    liveBadgeBg: '#FFFFFF',

    // Category Neo-Pastels
    pastelPink: '#FDF0F5',
    pastelPinkIcon: '#D946EF',
    pastelBlue: '#EBF5FF',
    pastelBlueIcon: '#0EA5E9',
    pastelTeal: '#E6F8FA',
    pastelTealIcon: '#06B6D4',
    pastelPurple: '#F3E8FF',
    pastelPurpleIcon: '#7C3AED',
    pastelAmber: '#FFFBEB',
    pastelAmberIcon: '#F59E0B',

    // Typography
    textPrimary: '#1E2235',      // Deep navy/charcoal
    textSecondary: '#64748B',    // Muted slate gray
    textTertiary: '#94A3B8',
    textWhite: '#FFFFFF',
    textPurple: '#5B50D6',

    // Status
    success: '#10B981',
    successBg: '#ECFDF5',
    starGold: '#F59E0B',

    // Overlays & Backdrop
    backdrop: 'rgba(30, 34, 53, 0.45)',
    shadowColor: '#1E2235',
  },

  radii: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  typography: {
    headline: {
      fontSize: 22,
      fontWeight: '800' as const,
      color: '#1E2235',
    },
    title: {
      fontSize: 18,
      fontWeight: '800' as const,
      color: '#1E2235',
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: '#64748B',
      lineHeight: 18,
    },
    sectionLabel: {
      fontSize: 18,
      fontWeight: '800' as const,
      color: '#1E2235',
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#1E2235',
      lineHeight: 20,
    },
  },
};

// Backwards-compatibility alias so existing components compile seamlessly
export const EviraTheme = AppTheme;

/**
 * Standard Window & Modal Bottom Sheet Styles
 */
export const eviraWindowStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: AppTheme.colors.backdrop,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: AppTheme.radii.xxl,
    borderTopRightRadius: AppTheme.radii.xxl,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 14,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppTheme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: AppTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radii.lg,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: AppTheme.colors.textWhite,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.lg,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: AppTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: AppTheme.radii.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: AppTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    color: AppTheme.colors.textPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
});
