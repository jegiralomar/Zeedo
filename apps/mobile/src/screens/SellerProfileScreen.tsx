import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, DIALECT_LABELS, isRTL } from '../i18n/translations';
import {
  Store,
  Building2,
  MapPin,
  ShieldCheck,
  Globe,
  ChevronRight,
  ChevronLeft,
  Truck,
  LogOut,
  Award,
  Lock,
} from 'lucide-react-native';

interface SellerProfileScreenProps {
  onRequestLanguage: () => void;
  onRequestSwitchAccount: () => void;
}

export const SellerProfileScreen: React.FC<SellerProfileScreenProps> = ({
  onRequestLanguage,
  onRequestSwitchAccount,
}) => {
  const { seller, language } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Merchant Header Card */}
      <View style={styles.storeCard}>
        <View style={[styles.storeRow, rtl && styles.rtlRow]}>
          <View style={styles.storeIconCircle}>
            <Store size={26} color={TOKENS.colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{seller.storeName}</Text>
            <Text style={styles.ownerText}>{seller.ownerName} • {seller.phone}</Text>
            <Text style={styles.hubText}>📍 {seller.city} Central Hub, Iraq</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={12} color={TOKENS.colors.secondary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
      </View>

      {/* Commercial Credentials Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Merchant Accreditation & Logistics</Text>
          <Text style={styles.sectionSub}>Commercial Registration & Pickup Depot</Text>
        </View>

        <View style={styles.infoRow}>
          <Building2 size={16} color={TOKENS.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Commercial Registration</Text>
            <Text style={styles.infoVal}>IQ-KRG-2024-88421 (Ministry of Trade)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color={TOKENS.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Verified Pickup Depot</Text>
            <Text style={styles.infoVal}>{seller.pickupAddress}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Truck size={16} color={TOKENS.colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Primary 3PL Courier Agreement</Text>
            <Text style={styles.infoVal}>Al-Zajil Express & Erbil Logistics (24h Doorstep Cash)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Award size={16} color={TOKENS.colors.violet} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Platform Fee Tier</Text>
            <Text style={styles.infoVal}>
              {Math.round(seller.commissionRate * 100)}% Fee • Autonomous Seller Status (Instant Live)
            </Text>
          </View>
        </View>
      </View>

      {/* Universal 1,000 IQD Rule Notice */}
      <View style={styles.ruleCard}>
        <View style={styles.ruleHeader}>
          <Lock size={16} color={TOKENS.colors.primary} />
          <Text style={styles.ruleTitle}>Universal 1,000 IQD Starting Rule</Text>
        </View>
        <Text style={styles.ruleText}>
          Every auction submitted on ZEEDO begins strictly at 1,000 IQD. This first 1,000 IQD is retained by the platform as a base service fee; your {Math.round(seller.commissionRate * 100)}% commission applies to all remaining bid value.
        </Text>
      </View>

      {/* Language Preferences */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Regionalization & Dialect</Text>
        <TouchableOpacity
          style={[styles.settingRow, rtl && styles.rtlRow]}
          onPress={onRequestLanguage}
          activeOpacity={0.7}
        >
          <View style={[styles.settingLeft, rtl && styles.rtlRow]}>
            <View style={styles.globePill}>
              <Globe size={16} color={TOKENS.colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>Display Language & Script</Text>
              <Text style={styles.settingSub}>
                {DIALECT_LABELS[language].label} ({DIALECT_LABELS[language].script})
              </Text>
            </View>
          </View>
          {rtl ? (
            <ChevronLeft size={16} color={TOKENS.colors.textMuted} />
          ) : (
            <ChevronRight size={16} color={TOKENS.colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Sign Out / Switch Account */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Session</Text>
        <Text style={styles.sectionSub}>Seller accounts are distinct from buyer accounts</Text>
        <TouchableOpacity
          style={styles.switchAccountBtn}
          onPress={onRequestSwitchAccount}
          activeOpacity={0.8}
        >
          <LogOut size={16} color={TOKENS.colors.accent} />
          <Text style={styles.switchAccountBtnText}>{t.switchAccount}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  content: {
    padding: TOKENS.spacing.md,
    paddingBottom: 110,
    gap: 12,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TOKENS.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  ownerText: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 1,
  },
  hubText: {
    fontSize: 11,
    fontWeight: '600',
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
    marginTop: 1,
    lineHeight: 16,
  },
  ruleCard: {
    backgroundColor: TOKENS.colors.primaryLight,
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    gap: 6,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: TOKENS.colors.primary,
  },
  ruleText: {
    fontSize: 11,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  globePill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    marginTop: 1,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.accentLight,
    paddingVertical: 12,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    marginTop: 4,
  },
  switchAccountBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.accent,
  },
});
