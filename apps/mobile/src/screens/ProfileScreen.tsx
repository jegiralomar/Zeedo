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
import { AppTheme } from '../lib/theme';

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
  language = 'ar',
  onSelectLanguage,
  onSessionCleared,
}) => {
  const handleLogout = () => {
    Alert.alert(
      language === 'ar' ? 'تسجيل الخروج' : 'Sign Out',
      language === 'ar' ? 'هل أنت متأكد من إنهاء جلستك على هذا الجهاز؟' : 'Are you sure you want to end your active session on this device?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'خروج' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearMobileSession();
            onSessionCleared();
          },
        },
      ]
    );
  };

  const languages: { code: 'ckb' | 'badini' | 'ar' | 'en'; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'ckb', label: 'کوردی (سۆرانی)' },
    { code: 'badini', label: 'بادینی' },
    { code: 'en', label: 'English' },
  ];

  const t = {
    title: language === 'ar' ? 'الملف الشخصي' : language === 'ckb' ? 'پڕۆفایل' : 'Profile',
    verifiedBuyer: language === 'ar' ? 'مشتري موثّق' : 'Verified Buyer',
    signInTitle: language === 'ar' ? 'تسجيل الدخول عبر واتساب' : 'Sign In with WhatsApp',
    signInSub: language === 'ar' ? 'جلسة نشطة لمدة 90 يوماً مع رمز تحقق فوري بضغطة واحدة.' : '90-day active session with 1-tap OTP verification.',
    preferencesHeader: language === 'ar' ? 'التفضيلات والتسليم' : 'Preferences & Delivery',
    locationTitle: language === 'ar' ? 'عنوان التسليم عند الباب' : 'Doorstep Delivery Location',
    locationSub: (city?: string) => city ? `${city}` : (language === 'ar' ? 'تحديد الموقع على الخريطة' : 'Pin location on map'),
    languageTitle: language === 'ar' ? 'اللغة / زمان' : 'Language / زمان',
    trustHeader: language === 'ar' ? 'الأمان والضمان' : 'Trust & Protection',
    guaranteeTitle: language === 'ar' ? 'ضمان الدفع عند الاستلام 100%' : '100% Cash-on-Delivery Guarantee',
    guaranteeSub: language === 'ar' ? 'افحص البضاعة وتأكد منها قبل تسليم المبلغ للمندوب.' : 'Open and inspect the item before handing over cash.',
    antiSnipingTitle: language === 'ar' ? 'نظام الحماية من القنص' : 'Anti-Sniping Live Reset',
    antiSnipingSub: language === 'ar' ? 'تمديد تلقائي لدقيقتين عند وجود مزايدة في الثواني الأخيرة.' : 'Auto-extends 2 minutes on last-minute bids.',
    logout: language === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign Out of Session',
    version: 'Zeedo Auction v2.4.0 • أربيل، كوردستان العراق',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
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
              <Text style={styles.userName}>{session.user.name || t.verifiedBuyer}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ موثّق</Text>
              </View>
            </View>
            <Text style={styles.userPhone}>{session.user.phone}</Text>
            <Text style={styles.userCity}>📍 {session.user.city || 'أربيل، إقليم كوردستان'}</Text>
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
            <Text style={styles.signInTitle}>{t.signInTitle}</Text>
            <Text style={styles.signInSub}>{t.signInSub}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}

      {/* Section: Delivery & Settings */}
      <Text style={styles.sectionHeader}>{t.preferencesHeader}</Text>

      {/* Doorstep Location Item */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenLocation}
        style={styles.menuItem}
      >
        <View style={[styles.menuIconContainer, { backgroundColor: AppTheme.colors.pastelBlue }]}>
          <Text style={styles.menuIcon}>📍</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{t.locationTitle}</Text>
          <Text style={styles.menuSubtitle}>
            {t.locationSub(session?.user.city)}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Language Selector Item */}
      <View style={styles.languageContainer}>
        <View style={styles.languageHeader}>
          <View style={[styles.menuIconContainer, { backgroundColor: AppTheme.colors.pastelPurple }]}>
            <Text style={styles.menuIcon}>🌐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>{t.languageTitle}</Text>
            <Text style={styles.menuSubtitle}>العربية، کوردی، English</Text>
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
              activeOpacity={0.8}
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
      <Text style={styles.sectionHeader}>{t.trustHeader}</Text>

      <View style={styles.menuItemStatic}>
        <View style={[styles.menuIconContainer, { backgroundColor: AppTheme.colors.pastelAmber }]}>
          <Text style={styles.menuIcon}>🛡️</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{t.guaranteeTitle}</Text>
          <Text style={styles.menuSubtitle}>{t.guaranteeSub}</Text>
        </View>
      </View>

      <View style={styles.menuItemStatic}>
        <View style={[styles.menuIconContainer, { backgroundColor: AppTheme.colors.pastelTeal }]}>
          <Text style={styles.menuIcon}>⏱️</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{t.antiSnipingTitle}</Text>
          <Text style={styles.menuSubtitle}>{t.antiSnipingSub}</Text>
        </View>
      </View>

      {session && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutButtonText}>{t.logout}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.versionText}>{t.version}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 14,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  userPhone: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginBottom: 2,
  },
  userCity: {
    fontSize: 11,
    color: AppTheme.colors.textTertiary,
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 14,
  },
  signInIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInIcon: {
    fontSize: 24,
  },
  signInTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  signInSub: {
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  menuItemStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: AppTheme.colors.textTertiary,
    fontWeight: '600',
  },
  languageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
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
    paddingVertical: 7,
    borderRadius: AppTheme.radii.full,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  langPillActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textSecondary,
  },
  langPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: AppTheme.radii.lg,
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
    color: AppTheme.colors.textTertiary,
    marginTop: 24,
  },
});
