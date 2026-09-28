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
  User,
  ShieldCheck,
  MapPin,
  FileText,
  Globe,
  ChevronRight,
  ChevronLeft,
  Banknote,
  CheckCircle,
  Store,
  Lock,
  LogOut,
  Headphones,
} from 'lucide-react-native';

interface ProfileScreenProps {
  onRequestTwoGate: () => void;
  onRequestLanguage: () => void;
  onRequestRooftop: () => void;
  onRequestSwitchAccount: () => void;
  onRequestSupport?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onRequestTwoGate,
  onRequestLanguage,
  onRequestRooftop,
  onRequestSwitchAccount,
  onRequestSupport,
}) => {
  const { buyer, language, isTwoGateVerified } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const hasGate1 = buyer.kycStatus === 'verified';
  const hasGate2 = !!buyer.rooftopPin && buyer.rooftopPin.isVerified;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card with 28px corners */}
      <View style={styles.userCard}>
        <View style={[styles.userRow, rtl && styles.rtlRow]}>
          <View style={styles.avatarCircle}>
            <User size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{buyer.name}</Text>
            <Text style={styles.userPhone}>{buyer.phone}</Text>
            <Text style={styles.userCity}>📍 {buyer.city}, Iraq</Text>
          </View>

          <View
            style={[
              styles.overallBadge,
              isTwoGateVerified() ? styles.verifiedBadge : styles.pendingBadge,
            ]}
          >
            <ShieldCheck
              size={13}
              color={
                isTwoGateVerified()
                  ? TOKENS.colors.secondary
                  : TOKENS.colors.primary
              }
            />
            <Text
              style={[
                styles.overallBadgeText,
                isTwoGateVerified()
                  ? styles.verifiedBadgeText
                  : styles.pendingBadgeText,
              ]}
            >
              {isTwoGateVerified() ? '2-Gate Verified' : 'Action Needed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Two-Gate Security Center Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Two-Gate Verification Center</Text>
          <Text style={styles.sectionSub}>Required for 100% Cash-on-Delivery Bidding</Text>
        </View>

        {/* Gate 1 */}
        <TouchableOpacity
          style={[styles.gateItem, hasGate1 && styles.gateItemDone, rtl && styles.rtlRow]}
          onPress={onRequestTwoGate}
          activeOpacity={0.8}
        >
          <View style={[styles.gateIconBox, hasGate1 ? styles.gateIconDone : styles.gateIconPending]}>
            <FileText size={18} color={hasGate1 ? TOKENS.colors.secondary : TOKENS.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gateName}>Gate 1: Civil ID Verification</Text>
            <Text style={styles.gateDesc}>
              {hasGate1
                ? `Verified • ${buyer.kycDocument?.docNumber || 'IQ-99182'} (OCR: 98%)`
                : 'National ID or Passport not uploaded'}
            </Text>
          </View>
          {rtl ? (
            <ChevronLeft size={16} color={TOKENS.colors.textMuted} />
          ) : (
            <ChevronRight size={16} color={TOKENS.colors.textMuted} />
          )}
        </TouchableOpacity>

        {/* Gate 2 */}
        <TouchableOpacity
          style={[styles.gateItem, hasGate2 && styles.gateItemDone, rtl && styles.rtlRow]}
          onPress={onRequestRooftop}
          activeOpacity={0.8}
        >
          <View style={[styles.gateIconBox, hasGate2 ? styles.gateIconDone : styles.gateIconPending]}>
            <MapPin size={18} color={hasGate2 ? TOKENS.colors.secondary : TOKENS.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gateName}>Gate 2: Rooftop Map Pin Dropper</Text>
            <Text style={styles.gateDesc}>
              {hasGate2
                ? `GPS Calibrated • ${buyer.rooftopPin?.district || 'Bedar, Zakho'}`
                : 'Precise rooftop GPS coordinates not set'}
            </Text>
          </View>
          {rtl ? (
            <ChevronLeft size={16} color={TOKENS.colors.textMuted} />
          ) : (
            <ChevronRight size={16} color={TOKENS.colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Account Session Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Session</Text>
          <Text style={styles.sectionSub}>Authenticated Iraqi Buyer Profile</Text>
        </View>

        <View style={[styles.sessionRow, rtl && styles.rtlRow]}>
          <View style={styles.sessionAvatarCircle}>
            <User size={20} color={TOKENS.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionName}>{buyer.name}</Text>
            <Text style={styles.sessionRoleText}>Personal Buyer Account ({buyer.phone})</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.switchAccountBtn}
          onPress={onRequestSwitchAccount}
          activeOpacity={0.8}
        >
          <LogOut size={15} color={TOKENS.colors.textSecondary} />
          <Text style={styles.switchAccountBtnText}>{t.switchAccount}</Text>
        </TouchableOpacity>
      </View>

      {/* Regional Language / Dialect Preferences */}
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

      {/* 24/7 Live Support & Concierge */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Help & Live Concierge</Text>
        <TouchableOpacity
          style={[styles.settingRow, rtl && styles.rtlRow]}
          onPress={onRequestSupport}
          activeOpacity={0.7}
        >
          <View style={[styles.settingLeft, rtl && styles.rtlRow]}>
            <View style={styles.globePill}>
              <Headphones size={16} color={TOKENS.colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>ZEEDO Concierge Live Chat</Text>
              <Text style={styles.settingSub}>
                Instant support in Kurdish & Arabic • Erbil Hub
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

      {/* 100% COD Policy Notice */}
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <Banknote size={18} color={TOKENS.colors.secondary} />
          <Text style={styles.policyTitle}>100% Cash-on-Delivery Guarantee</Text>
        </View>
        <Text style={styles.policyText}>
          ZEEDO completely eliminates credit cards and online escrow holds. Couriers hand you physical packages at your doorstep; payments are made directly in physical Iraqi Dinars upon visual confirmation.
        </Text>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TOKENS.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...TOKENS.shadows.glowPrimary,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  userPhone: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 1,
  },
  userCity: {
    fontSize: 11,
    fontWeight: '600',
    color: TOKENS.colors.textSecondary,
    marginTop: 1,
  },
  overallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
  },
  verifiedBadge: {
    backgroundColor: TOKENS.colors.secondaryLight,
  },
  pendingBadge: {
    backgroundColor: TOKENS.colors.primaryLight,
  },
  overallBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  verifiedBadgeText: {
    color: TOKENS.colors.secondary,
  },
  pendingBadgeText: {
    color: TOKENS.colors.primary,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
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
    fontSize: 10,
    color: TOKENS.colors.textMuted,
  },
  gateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.cardMuted,
    padding: 12,
    borderRadius: TOKENS.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gateItemDone: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: TOKENS.colors.secondaryLight,
  },
  gateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateIconDone: {
    backgroundColor: '#FFFFFF',
  },
  gateIconPending: {
    backgroundColor: '#FFFFFF',
  },
  gateName: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  gateDesc: {
    fontSize: 10,
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
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
  policyCard: {
    backgroundColor: TOKENS.colors.secondaryLight,
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: TOKENS.colors.secondary,
  },
  policyText: {
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '500',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  sessionAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  sessionRoleText: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.cardMuted,
    paddingVertical: 11,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    marginTop: 4,
  },
  switchAccountBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
});
