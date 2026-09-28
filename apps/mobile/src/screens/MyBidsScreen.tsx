import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem } from '../types';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, isRTL } from '../i18n/translations';
import {
  ShoppingBag,
  Truck,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Barcode,
  Sparkles,
} from 'lucide-react-native';

interface MyBidsScreenProps {
  onOpenCheckout: (item: MobileAuctionItem) => void;
  onOpenDispute: (item: MobileAuctionItem) => void;
}

export const MyBidsScreen: React.FC<MyBidsScreenProps> = ({
  onOpenCheckout,
  onOpenDispute,
}) => {
  const { auctions } = useAuctionStore();
  const { language, buyer } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'won' | 'disputes'>('all');

  const wonItems = auctions.filter(
    (a) => a.status === 'completed' || a.highestBidder?.id === buyer.id
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Lively Metrics Grid with Pastel Micro-Icons */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Total Won</Text>
            <View style={[styles.iconPill, { backgroundColor: TOKENS.colors.primaryLight }]}>
              <ShoppingBag size={14} color={TOKENS.colors.primary} />
            </View>
          </View>
          <Text style={styles.metricNumber}>{buyer.totalWins || 2}</Text>
          <Text style={styles.metricSub}>+1 this week</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Active 3PL</Text>
            <View style={[styles.iconPill, { backgroundColor: TOKENS.colors.secondaryLight }]}>
              <Truck size={14} color={TOKENS.colors.secondary} />
            </View>
          </View>
          <Text style={styles.metricNumber}>01</Text>
          <Text style={styles.metricSubGreen}>On Schedule</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Disputes</Text>
            <View style={[styles.iconPill, { backgroundColor: TOKENS.colors.accentLight }]}>
              <AlertTriangle size={14} color={TOKENS.colors.accent} />
            </View>
          </View>
          <Text style={styles.metricNumber}>00</Text>
          <Text style={styles.metricSub}>All Clear</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Authenticated</Text>
            <View style={[styles.iconPill, { backgroundColor: TOKENS.colors.violetLight }]}>
              <Sparkles size={14} color={TOKENS.colors.violet} />
            </View>
          </View>
          <Text style={styles.metricNumber}>100%</Text>
          <Text style={styles.metricSubGreen}>AI Verified</Text>
        </View>
      </View>

      {/* Modern Filter Tabs */}
      <View style={[styles.tabBar, rtl && styles.rtlRow]}>
        {(['all', 'active', 'won', 'disputes'] as const).map((tabKey) => {
          const isSelected = activeTab === tabKey;
          let label = 'All Orders';
          if (tabKey === 'active') label = 'Active';
          if (tabKey === 'won') label = 'Won (COD)';
          if (tabKey === 'disputes') label = 'Disputes';

          return (
            <TouchableOpacity
              key={tabKey}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveTab(tabKey)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Doorstep Cash on Delivery Notice */}
      <View style={[styles.codBanner, rtl && styles.rtlRow]}>
        <ShieldCheck size={18} color={TOKENS.colors.secondary} />
        <Text style={[styles.codBannerText, rtl && styles.alignRight]}>
          {t.codNotice}
        </Text>
      </View>

      {/* Orders List */}
      <View style={styles.ordersList}>
        {wonItems.map((item) => {
          const isCollected = item.codStatus === 'collected_cod';
          const awb = item.packageAwbId || `AWB-IQ-202609-${item.id.replace('auc-', '')}`;

          return (
            <View key={item.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={[styles.orderHeader, rtl && styles.rtlRow]}>
                <View style={styles.awbBadge}>
                  <Barcode size={13} color={TOKENS.colors.primary} />
                  <Text style={styles.awbText}>{awb}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    isCollected ? styles.statusDelivered : styles.statusPending,
                  ]}
                >
                  {isCollected ? (
                    <CheckCircle size={11} color={TOKENS.colors.secondary} />
                  ) : (
                    <Clock size={11} color={TOKENS.colors.primary} />
                  )}
                  <Text
                    style={[
                      styles.statusPillText,
                      isCollected ? styles.statusDeliveredText : styles.statusPendingText,
                    ]}
                  >
                    {isCollected ? 'Delivered & Paid' : 'Ready for Courier'}
                  </Text>
                </View>
              </View>

              {/* Product Info */}
              <View style={[styles.productRow, rtl && styles.rtlRow]}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.productThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.productTitle}>
                    {item.multilingual.en.title}
                  </Text>
                  <Text style={styles.courierInfo}>
                    Courier: {item.courierName || 'Al-Zajil Express • Kurdistan Hub'}
                  </Text>
                  <View style={[styles.priceTagRow, rtl && styles.rtlRow]}>
                    <Text style={styles.hammerLabel}>Hammer Price:</Text>
                    <Text style={styles.hammerPrice}>
                      {item.currentBidIqd.toLocaleString()} IQD
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.orderActions, rtl && styles.rtlRow]}>
                {!isCollected ? (
                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => onOpenCheckout(item)}
                    activeOpacity={0.88}
                  >
                    <Truck size={15} color="#ffffff" />
                    <Text style={styles.checkoutBtnText}>Confirm COD Dispatch</Text>
                    {rtl ? (
                      <ArrowLeft size={15} color="#ffffff" />
                    ) : (
                      <ArrowRight size={15} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedTag}>
                    <CheckCircle size={14} color={TOKENS.colors.secondary} />
                    <Text style={styles.completedTagText}>Cash Collected at Doorstep</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.disputeBtn}
                  onPress={() => onOpenDispute(item)}
                  activeOpacity={0.7}
                >
                  <AlertTriangle size={14} color={TOKENS.colors.accent} />
                  <Text style={styles.disputeBtnText}>Dispute</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  metricSub: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
    marginTop: 2,
  },
  metricSubGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 6,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
  },
  tabBtnActive: {
    backgroundColor: TOKENS.colors.primary,
    borderColor: TOKENS.colors.primary,
    ...TOKENS.shadows.glowPrimary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  codBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.secondaryLight,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  codBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '600',
  },
  alignRight: {
    textAlign: 'right',
  },
  ordersList: {
    gap: 10,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
    gap: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.sm,
  },
  awbText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  statusDelivered: {
    backgroundColor: TOKENS.colors.secondaryLight,
  },
  statusPending: {
    backgroundColor: TOKENS.colors.primaryLight,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusDeliveredText: {
    color: TOKENS.colors.secondary,
  },
  statusPendingText: {
    color: TOKENS.colors.primary,
  },
  productRow: {
    flexDirection: 'row',
    gap: TOKENS.spacing.md,
    alignItems: 'center',
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: TOKENS.borderRadius.md,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    lineHeight: 18,
  },
  courierInfo: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
    marginTop: 2,
  },
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  hammerLabel: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
  },
  hammerPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: TOKENS.colors.primary,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.cardBorder,
  },
  checkoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: TOKENS.colors.primary,
    height: 42,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  checkoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  completedTag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: TOKENS.colors.accentLight,
  },
  disputeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.accent,
  },
});
