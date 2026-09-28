import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem, RooftopPin } from '../types';
import {
  ShieldCheck,
  MapPin,
  Lock,
  Truck,
  CheckCircle,
  X,
  Banknote,
} from 'lucide-react-native';

interface CodCheckoutModalProps {
  visible: boolean;
  item: MobileAuctionItem | null;
  rooftopPin?: RooftopPin;
  onConfirmDispatch: (awbId: string) => void;
  onClose: () => void;
  isRtl?: boolean;
}

export const CodCheckoutModal: React.FC<CodCheckoutModalProps> = ({
  visible,
  item,
  rooftopPin,
  onConfirmDispatch,
  onClose,
  isRtl = false,
}) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!item) return null;

  const courierFeeIqd = 3000;
  const totalCodDueIqd = item.currentBidIqd + courierFeeIqd;
  const generatedAwb = `AWB-IQ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${item.id.replace('auc-', '')}`;

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirmDispatch(generatedAwb);
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={[styles.headerRow, isRtl && styles.rtlRow]}>
            <View style={[styles.titleGroup, isRtl && styles.rtlRow]}>
              <View style={styles.shieldIcon}>
                <ShieldCheck size={20} color={TOKENS.colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isRtl ? 'تەواوکردنی داواکاری (پارەدان بە کاش)' : 'Secure COD Checkout'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  100% Cash on Delivery Doorstep Dispatch
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={TOKENS.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Won Auction Summary Card */}
            <View style={styles.card}>
              <View style={[styles.cardHeaderLine, isRtl && styles.rtlRow]}>
                <View style={styles.wonBadge}>
                  <CheckCircle size={12} color={TOKENS.colors.secondary} />
                  <Text style={styles.wonBadgeText}>
                    {isRtl ? 'مزایەدەی بردنەوە' : 'Won Auction'}
                  </Text>
                </View>
                <Text style={styles.orderRef}>#{item.id.toUpperCase()}</Text>
              </View>

              <View style={[styles.productRow, isRtl && styles.rtlRow]}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.productThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.productTitle}>
                    {item.multilingual.en.title}
                  </Text>
                  <Text style={styles.productCondition}>Condition: {item.condition}</Text>
                  <View style={[styles.priceTagRow, isRtl && styles.rtlRow]}>
                    <Text style={styles.priceAmount}>{item.currentBidIqd.toLocaleString()}</Text>
                    <Text style={styles.priceCurrency}>IQD</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Delivery Address & Pinned Rooftop Card */}
            <View style={styles.card}>
              <View style={[styles.cardHeaderLine, isRtl && styles.rtlRow]}>
                <View style={[styles.titleWithIcon, isRtl && styles.rtlRow]}>
                  <MapPin size={18} color={TOKENS.colors.primary} />
                  <Text style={styles.sectionTitle}>
                    {isRtl ? 'ناونیشانی گەیاندن' : 'Delivery Address'}
                  </Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Lock size={10} color={TOKENS.colors.onPrimaryFixed} />
                  <Text style={styles.lockedBadgeText}>Locked & Verified</Text>
                </View>
              </View>

              {/* Coordinates bar */}
              <View style={[styles.coordBar, isRtl && styles.rtlRow]}>
                <Text style={styles.coordText}>
                  📍 GPS: {rooftopPin ? `${rooftopPin.latitude.toFixed(4)}° N, ${rooftopPin.longitude.toFixed(4)}° E` : '37.1438° N, 42.6874° E'}
                </Text>
              </View>

              <View style={styles.addressBox}>
                <Text style={styles.addressCity}>
                  {rooftopPin?.district || 'Zakho - Bedar District'}
                </Text>
                <Text style={styles.addressRegion}>
                  {rooftopPin?.landmark || 'Duhok Governorate, Kurdistan Region, Iraq'}
                </Text>
              </View>
            </View>

            {/* 100% COD Payment Method Card */}
            <View style={styles.card}>
              <View style={[styles.cardHeaderLine, isRtl && styles.rtlRow]}>
                <View style={[styles.titleWithIcon, isRtl && styles.rtlRow]}>
                  <ShieldCheck size={18} color={TOKENS.colors.secondary} />
                  <Text style={styles.sectionTitle}>
                    {isRtl ? 'شێوازی پارەدان' : 'Payment Method'}
                  </Text>
                </View>
                <Text style={styles.secureTag}>100% Secure</Text>
              </View>

              <View style={[styles.codMethodBox, isRtl && styles.rtlRow]}>
                <View style={styles.moneyIconCircle}>
                  <Banknote size={20} color={TOKENS.colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.codMethodTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.codMethodDesc}>
                    {isRtl
                      ? 'پارەدانی کاشی فیعلی لە بەردەم دەرگا. پارە دەدرێتە شۆفێری گەیاندن دوای پشکنینی ڕاستەوخۆ.'
                      : 'Doorstep physical cash collection. Hand exact Iraqi Dinars to the 3PL courier upon packet inspection.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Doorstep Open-Box Inspection Policy Guarantee Card */}
            <View style={[styles.inspectionCard, isRtl && styles.rtlRow]}>
              <View style={styles.inspectionIconCircle}>
                <ShieldCheck size={20} color={TOKENS.colors.secondary} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.inspectionTitle, isRtl && styles.alignRight]}>
                  {isRtl ? 'پشکنینی ناو کارتۆن لە بەردەم دەرگا' : 'Doorstep Open-Box Inspection Guarantee'}
                </Text>
                <Text style={[styles.inspectionDesc, isRtl && styles.alignRight]}>
                  {isRtl
                    ? 'مافی تەواوت هەیە کارتۆنەکە لە ئامادەبوونی شۆفێر بکەیتەوە و بیپشکنیت پێش پێدانی پارە. پاش پێدانی پارەی کاش، فرۆشتنەکە کۆتایی پێدێت.'
                    : 'Inspect the item in the courier’s presence before paying. The driver will call upon arrival at your landmark. Once cash is exchanged and accepted, the sale is final.'}
                </Text>
              </View>
            </View>

            {/* Order Total Breakdown Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {isRtl ? 'کۆی گشتی باڵانس' : 'Order Summary'}
              </Text>
              <View style={styles.breakdownList}>
                <View style={[styles.breakdownRow, isRtl && styles.rtlRow]}>
                  <Text style={styles.breakdownLabel}>Winning Item Bid</Text>
                  <Text style={styles.breakdownValue}>{item.currentBidIqd.toLocaleString()} IQD</Text>
                </View>
                <View style={[styles.breakdownRow, isRtl && styles.rtlRow]}>
                  <Text style={styles.breakdownLabel}>Insured 3PL Courier Delivery</Text>
                  <Text style={styles.breakdownValue}>{courierFeeIqd.toLocaleString()} IQD</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.breakdownRow, isRtl && styles.rtlRow]}>
                  <Text style={styles.totalLabel}>
                    {isRtl ? 'کۆی کۆتایی بۆ دان (کاش)' : 'Total Due (COD)'}
                  </Text>
                  <View style={[styles.totalAmountBox, isRtl && styles.rtlRow]}>
                    <Text style={styles.totalAmount}>{totalCodDueIqd.toLocaleString()}</Text>
                    <Text style={styles.totalCurrency}>IQD</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Dock */}
          <View style={styles.dock}>
            <TouchableOpacity
              style={[
                styles.dispatchBtn,
                isSuccess && styles.successBtn,
                isDispatching && styles.dispatchingBtn,
              ]}
              onPress={handleDispatch}
              disabled={isDispatching || isSuccess}
              activeOpacity={0.88}
            >
              {isSuccess ? (
                <>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.dispatchBtnText}>Courier Dispatched Successfully!</Text>
                </>
              ) : (
                <>
                  <Truck size={20} color="#ffffff" />
                  <Text style={styles.dispatchBtnText}>
                    {isDispatching
                      ? 'Dispatching Courier...'
                      : isRtl
                      ? 'پەسەندکردن و ناردنی گەیەنەر (کاش)'
                      : 'Confirm & Dispatch Courier (COD)'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 30, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: TOKENS.colors.surface,
    borderTopLeftRadius: TOKENS.borderRadius.xxl,
    borderTopRightRadius: TOKENS.borderRadius.xxl,
    maxHeight: '92%',
    ...TOKENS.shadows.modal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.lg,
    paddingVertical: TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.surfaceContainerHigh,
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderTopLeftRadius: TOKENS.borderRadius.xxl,
    borderTopRightRadius: TOKENS.borderRadius.xxl,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.sm,
  },
  shieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TOKENS.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TOKENS.colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 10,
    color: TOKENS.colors.onSurfaceVariant,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: TOKENS.spacing.md,
    gap: TOKENS.spacing.md,
  },
  card: {
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    ...TOKENS.shadows.card,
  },
  cardHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TOKENS.spacing.sm,
  },
  wonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${TOKENS.colors.secondary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  wonBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  orderRef: {
    fontSize: 11,
    fontWeight: '600',
    color: TOKENS.colors.outline,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.md,
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: TOKENS.borderRadius.md,
    backgroundColor: TOKENS.colors.surfaceContainerHigh,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
    lineHeight: 18,
  },
  productCondition: {
    fontSize: 11,
    color: TOKENS.colors.outline,
    marginTop: 2,
  },
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  priceCurrency: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.outline,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: TOKENS.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  lockedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: TOKENS.colors.onPrimaryFixed,
  },
  coordBar: {
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.md,
    marginVertical: 6,
  },
  coordText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: TOKENS.colors.onSurfaceVariant,
  },
  addressBox: {
    marginTop: 4,
  },
  addressCity: {
    fontSize: 13,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  addressRegion: {
    fontSize: 11,
    color: TOKENS.colors.onSurfaceVariant,
    marginTop: 2,
  },
  secureTag: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  codMethodBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: TOKENS.spacing.md,
    backgroundColor: `${TOKENS.colors.secondary}10`,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
    marginTop: 4,
  },
  moneyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${TOKENS.colors.secondary}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codMethodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  codMethodDesc: {
    fontSize: 11,
    color: TOKENS.colors.onSurfaceVariant,
    lineHeight: 16,
    marginTop: 2,
  },
  breakdownList: {
    marginTop: 8,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: TOKENS.colors.outline,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: TOKENS.colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: TOKENS.colors.surfaceContainerHigh,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: TOKENS.colors.onSurface,
  },
  totalAmountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  totalCurrency: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.outline,
  },
  dock: {
    padding: TOKENS.spacing.lg,
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.surfaceContainerHigh,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    height: 52,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.card,
  },
  dispatchingBtn: {
    opacity: 0.8,
  },
  successBtn: {
    backgroundColor: TOKENS.colors.secondary,
  },
  dispatchBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  inspectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: TOKENS.borderRadius.xl,
    padding: 14,
  },
  inspectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TOKENS.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  inspectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065F46',
  },
  inspectionDesc: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#047857',
  },
  alignRight: {
    textAlign: 'right',
  },
});
