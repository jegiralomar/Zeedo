import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { TRANSLATIONS, DIALECT_LABELS, isRTL } from '../i18n/translations';
import { Globe, Bell, Store, ShoppingBag, ShieldCheck, Sparkles, Headphones } from 'lucide-react-native';

interface HeaderBarProps {
  onOpenLanguageModal: () => void;
  onOpenNotifications?: () => void;
  onOpenSupport?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenLanguageModal,
  onOpenNotifications,
  onOpenSupport,
}) => {
  const { role, language } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const rtl = isRTL(language);
  const count = unreadCount();

  return (
    <View style={[styles.headerContainer, rtl && styles.rtlContainer]}>
      {/* Brand & Badge */}
      <View style={[styles.brandSection, rtl && styles.rtlRow]}>
        <View style={styles.brandWrapper}>
          <Text style={styles.brandTitle}>
            ZEEDO<Text style={styles.brandDot}>.</Text>
          </Text>
        </View>

        {role === 'seller' ? (
          <View style={styles.sellerHubBadge}>
            <Store size={12} color={TOKENS.colors.secondary} />
            <Text style={styles.sellerHubText}>MERCHANT STUDIO</Text>
          </View>
        ) : (
          <View style={styles.codPill}>
            <ShieldCheck size={12} color={TOKENS.colors.secondary} />
            <Text style={styles.codText}>100% COD</Text>
          </View>
        )}
      </View>

      {/* Actions Section: Language Switcher, Support & Notifications */}
      <View style={[styles.actionSection, rtl && styles.rtlRow]}>
        {/* Support Chat Concierge */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={onOpenSupport}
          activeOpacity={0.75}
        >
          <Headphones size={15} color={TOKENS.colors.primary} />
        </TouchableOpacity>

        {/* Language Dialect Switcher Pill */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={onOpenLanguageModal}
          activeOpacity={0.8}
        >
          <Globe size={13} color={TOKENS.colors.primary} />
          <Text style={styles.languageText}>{DIALECT_LABELS[language].label}</Text>
        </TouchableOpacity>

        {/* Notification Bell with Dynamic Unread Counter */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={onOpenNotifications}
          activeOpacity={0.75}
        >
          <Bell size={16} color={TOKENS.colors.textSecondary} />
          {count > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{count > 9 ? '9+' : count}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.md,
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    letterSpacing: -0.8,
  },
  brandDot: {
    color: TOKENS.colors.primary,
  },
  codPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  codText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
    letterSpacing: 0.2,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  languageText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
  sellerHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sellerHubText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 0.3,
  },
  supportButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TOKENS.colors.accent,
  },
});
