import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  User,
  ShieldCheck,
  Globe,
  Gavel,
  Trophy,
  Store,
  LogOut,
  ChevronRight,
  Phone,
  MapPin,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { LanguageCode } from '../../types';

export const ProfileScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    userRole,
    logout,
    openAuthModal,
    loginAsBuyer,
    loginAsMerchant,
    setActiveScreen,
  } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const languages: { code: LanguageCode; label: string; sub: string }[] = [
    { code: 'ar', label: 'العربية', sub: 'Iraqi Standard' },
    { code: 'ckb', label: 'کوردی (سۆرانی)', sub: 'Sorani Kurdish' },
    { code: 'badini', label: 'کوردی (بادینی)', sub: 'Badini Kurdish' },
    { code: 'en', label: 'English', sub: 'International' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Profile Avatar Header (Matching Profile.jpg) */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'Z'}
            </Text>
          </View>
        </View>

        <Text style={styles.userName}>
          {currentUser ? currentUser.name : (isRtl ? 'زائر غير مسجل' : 'Guest Visitor')}
        </Text>
        <Text style={styles.userPhone}>
          {currentUser ? currentUser.phone : '+964 770 000 0000'}
        </Text>

        <View style={styles.kycBadge}>
          <ShieldCheck size={14} color={AppTheme.colors.green} />
          <Text style={styles.kycBadgeText}>
            {currentUser?.kycStatus === 'verified' ? t.verified : t.unverified}
          </Text>
        </View>
      </View>

      {/* 2. Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Gavel size={18} color={AppTheme.colors.primary} />
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>{t.totalBids}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Trophy size={18} color={AppTheme.colors.amber} />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>{t.totalWins}</Text>
        </View>
      </View>

      {/* 3. 4-Dialect Language Switcher */}
      <View style={styles.section}>
        <View style={[styles.sectionTitleRow, isRtl && styles.sectionTitleRowRtl]}>
          <Globe size={16} color={AppTheme.colors.primary} />
          <Text style={styles.sectionTitle}>{t.language}</Text>
        </View>

        <View style={styles.langGrid}>
          {languages.map((item) => (
            <TouchableOpacity
              key={item.code}
              onPress={() => setLanguage(item.code)}
              style={[
                styles.langButton,
                language === item.code && styles.langButtonActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.langButtonText,
                  language === item.code && styles.langButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.langSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. Quick Account Switching (Buyer vs Merchant) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRtl && styles.textRtl]}>
          {isRtl ? 'تبديل تجريبي للحسابات' : 'Instant Demo Roles'}
        </Text>

        <View style={styles.demoButtonsRow}>
          <TouchableOpacity
            onPress={() => loginAsBuyer('07701234567', 'كرار حيدر')}
            style={[styles.rolePill, userRole === 'buyer' && styles.rolePillActive]}
            activeOpacity={0.8}
          >
            <User size={16} color={userRole === 'buyer' ? '#FFFFFF' : AppTheme.colors.textPrimary} />
            <Text style={[styles.rolePillText, userRole === 'buyer' && styles.rolePillTextActive]}>
              {isRtl ? 'دخول كمشتري عراقي' : 'Login as Buyer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => loginAsMerchant('Al-Mansour Electronics', '07809876543')}
            style={[styles.rolePill, userRole === 'merchant' && styles.rolePillActive]}
            activeOpacity={0.8}
          >
            <Store size={16} color={userRole === 'merchant' ? '#FFFFFF' : AppTheme.colors.textPrimary} />
            <Text style={[styles.rolePillText, userRole === 'merchant' && styles.rolePillTextActive]}>
              {isRtl ? 'دخول كتاجر معتمد' : 'Login as Merchant'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Auth / Logout Button */}
      <View style={styles.authSection}>
        {currentUser ? (
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutButton}
            activeOpacity={0.85}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutButtonText}>{t.logout}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={openAuthModal}
            style={styles.loginMainButton}
            activeOpacity={0.85}
          >
            <User size={16} color="#FFFFFF" />
            <Text style={styles.loginMainButtonText}>{t.loginBtn}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.canvas,
    padding: 16,
  },
  headerCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 16,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppTheme.colors.primaryLight,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: AppTheme.radius.full,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: AppTheme.colors.border,
  },
  section: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleRowRtl: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 10,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langButton: {
    width: '48%',
    padding: 10,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
  },
  langButtonActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: AppTheme.colors.primaryLight,
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  langButtonTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '900',
  },
  langSub: {
    fontSize: 9,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  demoButtonsRow: {
    gap: 8,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AppTheme.colors.surface,
    padding: 12,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  rolePillActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  rolePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  authSection: {
    marginTop: 8,
  },
  loginMainButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginMainButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  textRtl: {
    textAlign: 'right',
  },
});
