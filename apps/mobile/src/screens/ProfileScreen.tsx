import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MobileBuyerSession, clearMobileSession } from '../lib/session';
import { EviraTheme } from '../lib/theme';

interface ProfileScreenProps {
  session: MobileBuyerSession | null;
  onOpenAuth: () => void;
  onOpenLocation: () => void;
  language: 'ckb' | 'badini' | 'ar' | 'en';
  onSelectLanguage: (lang: 'ckb' | 'badini' | 'ar' | 'en') => void;
  onSessionCleared: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  session,
  onOpenAuth,
  onOpenLocation,
  language,
  onSelectLanguage,
  onSessionCleared,
}) => {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your active session on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearMobileSession();
          onSessionCleared();
        },
      },
    ]);
  };

  const languages: { code: 'ckb' | 'badini' | 'ar' | 'en'; label: string }[] = [
    { code: 'ckb', label: 'کوردی (سۆرانی)' },
    { code: 'badini', label: 'بادینی' },
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Evira Profile Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Card */}
      {session ? (
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(session.user.name || session.user.phone || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{session.user.name || 'Verified Buyer'}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
              </View>
            </View>
            <Text style={styles.userPhone}>{session.user.phone}</Text>
            <Text style={styles.userCity}>📍 {session.user.city || 'Erbil, Kurdistan Region'}</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onOpenAuth}
          style={styles.signInCard}
        >
          <View style={styles.signInIconBox}>
            <Text style={styles.signInIcon}>📱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.signInTitle}>Sign In with WhatsApp</Text>
            <Text style={styles.signInSub}>
              90-day hardware active session with 1-tap OTP.
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}

      {/* Section: Delivery & Settings */}
      <Text style={styles.sectionHeader}>Preferences & Delivery</Text>

      {/* Doorstep Location Item */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenLocation}
        style={styles.menuItem}
      >
        <View style={styles.menuIconContainer}>
          <Text style={styles.menuIcon}>📍</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Doorstep Delivery Pin</Text>
          <Text style={styles.menuSubtitle}>
            {session?.user.city ? `Saved: ${session.user.city}` : 'Pin rooftop location on map'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Language Selector Item */}
      <View style={styles.languageContainer}>
        <View style={styles.languageHeader}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🌐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Language / زمان</Text>
            <Text style={styles.menuSubtitle}>Kurdish, Arabic, English</Text>
          </View>
        </View>

        <View style={styles.langPillsRow}>
          {languages.map((l) => (
            <TouchableOpacity
              key={l.code}
              onPress={() => onSelectLanguage(l.code)}
              style={[
                styles.langPill,
                language === l.code && styles.langPillActive,
              ]}
            >
              <Text
                style={[
                  styles.langPillText,
                  language === l.code && styles.langPillTextActive,
                ]}
              >
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trust & Guarantee */}
      <Text style={styles.sectionHeader}>Trust & Inspection</Text>

      <View style={styles.menuItemStatic}>
        <View style={styles.menuIconContainer}>
          <Text style={styles.menuIcon}>🛡️</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>100% Cash-on-Delivery Guarantee</Text>
          <Text style={styles.menuSubtitle}>
            Inspect item with courier before handing over payment.
          </Text>
        </View>
      </View>

      <View style={styles.menuItemStatic}>
        <View style={styles.menuIconContainer}>
          <Text style={styles.menuIcon}>⚡</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Strict 1,000 IQD Bidding Rule</Text>
          <Text style={styles.menuSubtitle}>
            All auctions start at 1,000 IQD with no seller hidden reserves.
          </Text>
        </View>
      </View>

      {/* Sign Out Button */}
      {session && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutButtonText}>Sign Out of Device</Text>
        </TouchableOpacity>
      )}

      {/* Version Tag */}
      <Text style={styles.versionText}>Zeedo Auction Mobile v1.0.0 • Evira Design System</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EviraTheme.colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xxl,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: EviraTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: EviraTheme.colors.textWhite,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  userPhone: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    fontWeight: '500',
  },
  userCity: {
    fontSize: 11,
    color: EviraTheme.colors.textTertiary,
    marginTop: 2,
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xxl,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  signInIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: EviraTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInIcon: {
    fontSize: 20,
  },
  signInTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 2,
  },
  signInSub: {
    fontSize: 11,
    color: EviraTheme.colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  menuItemStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: EviraTheme.colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: EviraTheme.colors.textTertiary,
    fontWeight: '600',
  },
  languageContainer: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    padding: 14,
    marginBottom: 10,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  langPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: EviraTheme.radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
  },
  langPillActive: {
    backgroundColor: EviraTheme.colors.primary,
    borderColor: EviraTheme.colors.primary,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: EviraTheme.colors.textPrimary,
  },
  langPillTextActive: {
    color: EviraTheme.colors.textWhite,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: EviraTheme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: EviraTheme.colors.textTertiary,
    marginTop: 24,
  },
});
