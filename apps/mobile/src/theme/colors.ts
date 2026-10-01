export const AppTheme = {
  colors: {
    // Signature Zeedo / Stylish Coral Brand Colors
    primary: '#F83758',
    primaryLight: '#FFF1F3',
    primaryDark: '#D81B43',

    // Secondary Accent (Deal of the Day Blue)
    secondary: '#4392F9',
    secondaryLight: '#EBF4FE',

    // Success & Fast Bidding CTA Green
    green: '#10B981',
    greenLight: '#ECFDF5',

    // Warning & Gold Star Yellow
    amber: '#F59E0B',
    star: '#EDB310',

    // Backgrounds & Canvas
    canvas: '#FDFDFD',
    card: '#FFFFFF',
    surface: '#F4F5F7',
    border: '#ECEFF3',
    borderLight: '#F3F4F6',

    // Typography
    textPrimary: '#17223B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textWhite: '#FFFFFF',

    // Category Pastels
    catBeauty: '#FCE7F3',
    catFashion: '#FEF3C7',
    catKids: '#E0E7FF',
    catMens: '#E0F2FE',
    catWomens: '#F3E8FF',
    catTech: '#DCFCE7',
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    titleLarge: { fontSize: 22, fontWeight: '800' as const },
    titleMedium: { fontSize: 18, fontWeight: '700' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    bodyBold: { fontSize: 14, fontWeight: '600' as const },
    caption: { fontSize: 12, fontWeight: '500' as const },
    mono: { fontSize: 12, fontFamily: 'monospace' },
  },
};
