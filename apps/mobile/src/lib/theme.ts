/**
 * EVIRA E-COMMERCE DESIGN SYSTEM TOKENS & STANDARD WINDOW/MODAL PRESETS
 * Extracted from Evira UI Kit (Figma Community / Sobakhul Munir Siroj)
 * Clean, high-contrast, modern luxury aesthetic
 * Applied across all existing and future windows, modals, sheets, and components
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const EviraTheme = {
  colors: {
    // Canvas & Surfaces
    background: '#FFFFFF',
    surface: '#F4F4F6',          // Evira signature soft image & input gray
    surfaceSubtle: '#F8F9FA',
    card: '#FFFFFF',
    border: '#EEEEEE',
    borderLight: '#F3F4F6',
    borderDark: '#111111',

    // Typography
    textPrimary: '#111111',      // Solid deep black
    textSecondary: '#6B7280',    // Muted slate gray
    textTertiary: '#9CA3AF',
    textWhite: '#FFFFFF',

    // Accents & Actions
    primary: '#111111',          // Evira signature deep black
    primaryHover: '#27272A',
    accentGold: '#D97706',       // Luxury Iraqi dinar highlight
    liveRed: '#EF4444',          // Live auction timer & pulse
    liveRedBg: '#FEF2F2',
    success: '#10B981',
    successBg: '#ECFDF5',
    starGold: '#F59E0B',

    // Overlays & Backdrop
    backdrop: 'rgba(0, 0, 0, 0.45)',

    // Shadows
    shadowColor: '#000000',
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
      color: '#111111',
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 18,
      fontWeight: '800' as const,
      color: '#111111',
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: '#6B7280',
      lineHeight: 18,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: '#111111',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.6,
    },
    body: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#111111',
      lineHeight: 20,
    },
  },
};

/**
 * Standard Evira Window & Bottom-Sheet Styles
 * Use these across all modals/sub-windows to guarantee 100% theme uniformity now and later on.
 */
export const eviraWindowStyles = StyleSheet.create({
  // Dimmed overlay backdrop
  backdrop: {
    flex: 1,
    backgroundColor: EviraTheme.colors.backdrop,
    justifyContent: 'flex-end',
  },

  // Pure white bottom sheet with signature 28px top curves
  sheetContainer: {
    backgroundColor: EviraTheme.colors.background,
    borderTopLeftRadius: EviraTheme.radii.xxl,
    borderTopRightRadius: EviraTheme.radii.xxl,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: EviraTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },

  // Sheet pull handle bar
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Window header with title and circular close button
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: EviraTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: EviraTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Primary action button (Evira solid black, pill radius)
  primaryButton: {
    backgroundColor: EviraTheme.colors.primary,
    borderRadius: EviraTheme.radii.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: EviraTheme.colors.textWhite,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // Secondary / Cancel button
  secondaryButton: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: EviraTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Standard input container
  inputContainer: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.lg,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: EviraTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  // Standard input section label
  inputLabel: {
    fontSize: 11,
    color: EviraTheme.colors.textPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
});
