// Modern Lively & Minimalist Design System Tokens for ZEEDO
// Refined with vibrant energetic accents, soft atmospheric shadows, and generous rounded corners.

export const TOKENS = {
  colors: {
    // Vibrant Tech Blue (Electric Royal Cobalt)
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryLight: '#EFF6FF',
    primaryMuted: '#DBEAFE',
    onPrimary: '#FFFFFF',

    // Winning Emerald Jade
    secondary: '#10B981',
    secondaryLight: '#ECFDF5',
    secondaryMuted: '#D1FAE5',
    onSecondary: '#FFFFFF',

    // Energetic Sunset Coral (For Live Auctions, Urgency & Sniping)
    accent: '#F43F5E',
    accentLight: '#FFF1F2',
    accentMuted: '#FFE4E6',
    onAccent: '#FFFFFF',

    // Premium Royal Violet (For AI & Special Badges)
    violet: '#7C3AED',
    violetLight: '#F5F3FF',

    // Amber / Gold (For high value & alerts)
    amber: '#F59E0B',
    amberLight: '#FEF3C7',

    // Feedback
    error: '#EF4444',
    errorLight: '#FEF2F2',
    success: '#10B981',

    // Crisp Modern Backgrounds & Surfaces
    background: '#F8FAFC', // Ultra-clean subtle porcelain
    surface: '#F8FAFC',
    card: '#FFFFFF', // Pure crisp white cards
    cardMuted: '#F1F5F9',
    cardBorder: 'rgba(226, 232, 240, 0.8)',
    cardBorderHover: '#CBD5E1',

    // Modern Midnight & Slate Typography
    textPrimary: '#0F172A', // Deep obsidian midnight
    textSecondary: '#475569', // Sophisticated slate gray
    textMuted: '#94A3B8', // Soft neutral gray
    textInverse: '#FFFFFF',

    // Compatibility aliases with previous code
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F8FAFC',
    surfaceContainer: '#F1F5F9',
    surfaceContainerHigh: '#E2E8F0',
    primaryFixed: '#EFF6FF',
    onPrimaryFixed: '#1E40AF',
    secondaryFixed: '#ECFDF5',
    onSecondaryFixed: '#065F46',
    errorContainer: '#FFF1F2',
    onErrorContainer: '#9F1239',
    outline: '#94A3B8',
    outlineVariant: '#E2E8F0',
    tertiary: '#F43F5E',
  },

  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28, // Squircles & rich cards
    full: 9999, // Pills & rounded buttons
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
  },

  shadows: {
    // Soft atmospheric shadows for a weightless, lively feel
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 14,
      elevation: 2,
    },
    hover: {
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 4,
    },
    floatingBar: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
    modal: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 10,
    },
    glowPrimary: {
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 4,
    },
    glowSecondary: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};
