import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, isRTL } from '../i18n/translations';
import {
  User,
  Store,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react-native';

interface AccountSwitchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AccountSwitchModal: React.FC<AccountSwitchModalProps> = ({
  visible,
  onClose,
}) => {
  const { role, switchAccount, buyer, seller, language } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const handleSelectAccount = (selectedRole: 'buyer' | 'seller') => {
    switchAccount(selectedRole);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialogCard}>
          {/* Header */}
          <View style={[styles.headerRow, rtl && styles.rtlRow]}>
            <View>
              <Text style={styles.title}>Account Session</Text>
              <Text style={styles.subtitle}>Select an authenticated Iraqi account</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={TOKENS.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Account 1: Buyer Account */}
          <TouchableOpacity
            style={[
              styles.accountCard,
              role === 'buyer' && styles.accountCardActive,
              rtl && styles.rtlRow,
            ]}
            onPress={() => handleSelectAccount('buyer')}
            activeOpacity={0.85}
          >
            <View style={[styles.avatarCircle, role === 'buyer' && styles.avatarCircleActive]}>
              <User size={22} color={role === 'buyer' ? '#FFFFFF' : TOKENS.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.nameRow, rtl && styles.rtlRow]}>
                <Text style={styles.accountName}>{buyer.name}</Text>
                <View style={styles.typePillBuyer}>
                  <Text style={styles.typePillTextBuyer}>BUYER</Text>
                </View>
              </View>
              <Text style={styles.accountSub}>{buyer.phone} • {buyer.city}</Text>
              <Text style={styles.scopeText}>
                Scope: Explore, Slide-to-Bid, My Bids, COD Delivery
              </Text>
            </View>
            {role === 'buyer' && (
              <CheckCircle2 size={20} color={TOKENS.colors.primary} />
            )}
          </TouchableOpacity>

          {/* Account 2: Seller Account */}
          <TouchableOpacity
            style={[
              styles.accountCard,
              role === 'seller' && styles.accountCardActiveSeller,
              rtl && styles.rtlRow,
            ]}
            onPress={() => handleSelectAccount('seller')}
            activeOpacity={0.85}
          >
            <View style={[styles.avatarCircleSeller, role === 'seller' && styles.avatarCircleSellerActive]}>
              <Store size={22} color={role === 'seller' ? '#FFFFFF' : TOKENS.colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.nameRow, rtl && styles.rtlRow]}>
                <Text style={styles.accountName}>{seller.storeName}</Text>
                <View style={styles.typePillSeller}>
                  <Text style={styles.typePillTextSeller}>MERCHANT</Text>
                </View>
              </View>
              <Text style={styles.accountSub}>{seller.ownerName} • {seller.city} Depot</Text>
              <Text style={styles.scopeTextSeller}>
                Scope: Seller Studio, Create Listings, Financial COD Reports
              </Text>
            </View>
            {role === 'seller' && (
              <CheckCircle2 size={20} color={TOKENS.colors.secondary} />
            )}
          </TouchableOpacity>

          {/* Strict Separation Notice */}
          <View style={styles.footerNotice}>
            <Lock size={13} color={TOKENS.colors.textMuted} />
            <Text style={styles.footerNoticeText}>
              Seller and Buyer credentials are strictly separated. Seller accounts do not access marketplace bidding.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TOKENS.spacing.md,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.lg,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: TOKENS.borderRadius.xl,
    backgroundColor: TOKENS.colors.cardMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  accountCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: TOKENS.colors.primary,
  },
  accountCardActiveSeller: {
    backgroundColor: '#F0FDF4',
    borderColor: TOKENS.colors.secondary,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleActive: {
    backgroundColor: TOKENS.colors.primary,
  },
  avatarCircleSeller: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleSellerActive: {
    backgroundColor: TOKENS.colors.secondary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  typePillBuyer: {
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: TOKENS.borderRadius.full,
  },
  typePillTextBuyer: {
    fontSize: 9,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  typePillSeller: {
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: TOKENS.borderRadius.full,
  },
  typePillTextSeller: {
    fontSize: 9,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  accountSub: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  scopeText: {
    fontSize: 9.5,
    color: TOKENS.colors.primary,
    fontWeight: '700',
    marginTop: 3,
  },
  scopeTextSeller: {
    fontSize: 9.5,
    color: '#065F46',
    fontWeight: '700',
    marginTop: 3,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  footerNoticeText: {
    flex: 1,
    fontSize: 10,
    color: TOKENS.colors.textMuted,
    lineHeight: 14,
  },
});
