import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, isRTL } from '../i18n/translations';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  FileDown,
  Building2,
  CheckCircle2,
  Clock,
  Truck,
  Lock,
  ArrowUpRight,
} from 'lucide-react-native';

export const SellerFinancialsScreen: React.FC = () => {
  const { seller, language } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [statementDownloaded, setStatementDownloaded] = useState(false);

  const grossVolume = seller.totalCodVolumeIqd;
  const commissionRate = seller.commissionRate;
  const platformFee = Math.round(grossVolume * commissionRate);
  const baseFeesRetained = seller.completedSales * 1000;
  const netPayout = grossVolume - platformFee - baseFeesRetained;

  const settlements = [
    {
      awb: 'AWB-IQ-202609-804',
      item: 'Apple MacBook Air 13.6" (M2, 256GB Midnight)',
      buyerCity: 'Erbil (Dream City)',
      courier: 'Al-Zajil Express',
      grossIqd: 310000,
      feeIqd: Math.round(310000 * commissionRate),
      baseRuleIqd: 1000,
      netIqd: 310000 - Math.round(310000 * commissionRate) - 1000,
      status: 'cash_handed_over',
      date: '2026-09-27',
    },
    {
      awb: 'AWB-IQ-202609-802',
      item: 'Rolex Datejust 41 (Fluted Bezel, Jubilee)',
      buyerCity: 'Sulaymaniyah (Bakrajo)',
      courier: 'Al-Zajil Express',
      grossIqd: 1840000,
      feeIqd: Math.round(1840000 * commissionRate),
      baseRuleIqd: 1000,
      netIqd: 1840000 - Math.round(1840000 * commissionRate) - 1000,
      status: 'cash_handed_over',
      date: '2026-09-26',
    },
    {
      awb: 'AWB-IQ-202609-798',
      item: 'Google Pixel 8 Pro (Bay Blue, 128GB)',
      buyerCity: 'Erbil (Gulan St)',
      courier: 'Erbil Logistics Hub',
      grossIqd: 236000,
      feeIqd: Math.round(236000 * commissionRate),
      baseRuleIqd: 1000,
      netIqd: 236000 - Math.round(236000 * commissionRate) - 1000,
      status: 'cash_handed_over',
      date: '2026-09-25',
    },
    {
      awb: 'AWB-IQ-202609-795',
      item: 'Sony PlayStation 5 Slim Disc Edition',
      buyerCity: 'Baghdad (Mansour)',
      courier: 'Al-Zajil Express',
      grossIqd: 142000,
      feeIqd: Math.round(142000 * commissionRate),
      baseRuleIqd: 1000,
      netIqd: 142000 - Math.round(142000 * commissionRate) - 1000,
      status: 'cash_handed_over',
      date: '2026-09-24',
    },
  ];

  const handleExportStatement = () => {
    setStatementDownloaded(true);
    setTimeout(() => {
      setStatementDownloaded(false);
    }, 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={[styles.headerRow, rtl && styles.rtlRow]}>
          <View style={styles.iconCircle}>
            <TrendingUp size={22} color={TOKENS.colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t.financeTitle}</Text>
            <Text style={styles.headerSub}>{t.financeSubtitle}</Text>
          </View>
          <View style={styles.storeRatePill}>
            <Text style={styles.storeRateText}>{Math.round(commissionRate * 100)}% Fee Tier</Text>
          </View>
        </View>

        {/* Filter Period Pills */}
        <View style={[styles.periodPillRow, rtl && styles.rtlRow]}>
          <TouchableOpacity
            style={[styles.periodBtn, filterPeriod === 'all' && styles.periodBtnActive]}
            onPress={() => setFilterPeriod('all')}
          >
            <Text style={[styles.periodBtnText, filterPeriod === 'all' && styles.periodBtnTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, filterPeriod === 'month' && styles.periodBtnActive]}
            onPress={() => setFilterPeriod('month')}
          >
            <Text style={[styles.periodBtnText, filterPeriod === 'month' && styles.periodBtnTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, filterPeriod === 'week' && styles.periodBtnActive]}
            onPress={() => setFilterPeriod('week')}
          >
            <Text style={[styles.periodBtnText, filterPeriod === 'week' && styles.periodBtnTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Financial Metrics Quad */}
      <View style={styles.metricsGrid}>
        {/* Total COD Volume */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={styles.metricLabel}>{t.totalCodCollected}</Text>
            <Truck size={14} color={TOKENS.colors.primary} />
          </View>
          <Text style={styles.metricNumber}>
            {(grossVolume / 1000000).toFixed(2)}M
          </Text>
          <Text style={styles.metricCurrency}>IQD (38 parcels)</Text>
          <View style={styles.trendRow}>
            <ArrowUpRight size={12} color={TOKENS.colors.secondary} />
            <Text style={styles.trendText}>+18.4% this month</Text>
          </View>
        </View>

        {/* Net Merchant Payout */}
        <View style={[styles.metricCard, styles.metricCardGreen]}>
          <View style={styles.metricTopRow}>
            <Text style={styles.metricLabelGreen}>{t.netCashRemitted}</Text>
            <CheckCircle2 size={14} color={TOKENS.colors.secondary} />
          </View>
          <Text style={styles.metricNumberGreen}>
            {(netPayout / 1000000).toFixed(2)}M
          </Text>
          <Text style={styles.metricCurrencyGreen}>IQD Doorstep Cash</Text>
          <Text style={styles.subNoteGreen}>100% Settled & Verified</Text>
        </View>

        {/* Platform 8% Commission */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={styles.metricLabel}>{t.platformFeeDeduction}</Text>
            <Building2 size={14} color={TOKENS.colors.textMuted} />
          </View>
          <Text style={styles.metricNumberMuted}>
            {(platformFee / 1000000).toFixed(2)}M
          </Text>
          <Text style={styles.metricCurrency}>IQD Platform Margin</Text>
          <Text style={styles.subNote}>Auto-deducted on courier return</Text>
        </View>

        {/* Universal 1,000 IQD Base Fee */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={styles.metricLabel}>{t.baseListingFeeRetained}</Text>
            <Lock size={14} color={TOKENS.colors.accent} />
          </View>
          <Text style={styles.metricNumberAccent}>
            {(baseFeesRetained / 1000).toLocaleString()}k
          </Text>
          <Text style={styles.metricCurrency}>IQD Retained Starting Fee</Text>
          <Text style={styles.subNote}>Fixed 1,000 IQD platform rule</Text>
        </View>
      </View>

      {/* Export / Download Statement Action */}
      <TouchableOpacity
        style={[styles.exportBtn, statementDownloaded && styles.exportBtnSuccess]}
        onPress={handleExportStatement}
        activeOpacity={0.85}
      >
        <FileDown size={16} color="#FFFFFF" />
        <Text style={styles.exportBtnText}>
          {statementDownloaded
            ? '✓ Reconciliation PDF Statement Downloaded'
            : t.exportStatement}
        </Text>
      </TouchableOpacity>

      {/* Courier Doorstep Settlements Table */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t.settlementHistory}</Text>
        <Text style={styles.sectionSub}>Doorstep Physical Cash Receipts</Text>
      </View>

      <View style={styles.settlementList}>
        {settlements.map((item, idx) => (
          <View key={idx} style={styles.settlementCard}>
            <View style={[styles.settlementTopRow, rtl && styles.rtlRow]}>
              <View style={styles.awbBadge}>
                <Text style={styles.awbBadgeText}>{item.awb}</Text>
              </View>
              <View style={styles.handedPill}>
                <CheckCircle2 size={11} color={TOKENS.colors.secondary} />
                <Text style={styles.handedPillText}>CASH HANDED OVER</Text>
              </View>
            </View>

            <Text numberOfLines={1} style={[styles.itemTitle, rtl && styles.alignRight]}>
              {item.item}
            </Text>

            <View style={[styles.detailsRow, rtl && styles.rtlRow]}>
              <Text style={styles.detailLabel}>📍 {item.buyerCity}</Text>
              <Text style={styles.detailLabel}>🚚 {item.courier}</Text>
              <Text style={styles.detailLabel}>📅 {item.date}</Text>
            </View>

            {/* Price Accounting Strip */}
            <View style={[styles.accountingStrip, rtl && styles.rtlRow]}>
              <View style={styles.accountItem}>
                <Text style={styles.accountLabel}>Winning Bid</Text>
                <Text style={styles.accountVal}>{item.grossIqd.toLocaleString()} IQD</Text>
              </View>
              <View style={styles.accountItem}>
                <Text style={styles.accountLabel}>Platform Fee (8%)</Text>
                <Text style={styles.accountFee}>-{item.feeIqd.toLocaleString()}</Text>
              </View>
              <View style={styles.accountItem}>
                <Text style={styles.accountLabel}>Base Fee</Text>
                <Text style={styles.accountFee}>-1,000</Text>
              </View>
              <View style={styles.accountItem}>
                <Text style={styles.accountLabel}>Net Cash Remitted</Text>
                <Text style={styles.accountNet}>{item.netIqd.toLocaleString()} IQD</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Cash Guarantee Notice */}
      <View style={styles.policyNotice}>
        <ShieldCheck size={18} color={TOKENS.colors.secondary} />
        <Text style={styles.policyNoticeText}>
          ZEEDO Merchant Guarantee: 3PL courier drivers deposit 100% of doorstep collected physical Iraqi cash directly to your Erbil warehouse depot within 24 hours of package delivery.
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
    gap: 14,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  alignRight: {
    textAlign: 'right',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  storeRatePill: {
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  storeRateText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  periodPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  periodBtnActive: {
    backgroundColor: TOKENS.colors.primary,
    ...TOKENS.shadows.glowPrimary,
  },
  periodBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  metricCardGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
  },
  metricLabelGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
    textTransform: 'uppercase',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    letterSpacing: -0.5,
  },
  metricNumberGreen: {
    fontSize: 20,
    fontWeight: '900',
    color: TOKENS.colors.secondary,
    letterSpacing: -0.5,
  },
  metricNumberMuted: {
    fontSize: 20,
    fontWeight: '900',
    color: TOKENS.colors.textSecondary,
    letterSpacing: -0.5,
  },
  metricNumberAccent: {
    fontSize: 20,
    fontWeight: '900',
    color: TOKENS.colors.accent,
    letterSpacing: -0.5,
  },
  metricCurrency: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  metricCurrencyGreen: {
    fontSize: 10,
    color: TOKENS.colors.secondary,
    fontWeight: '700',
    marginTop: 1,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  subNoteGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 6,
  },
  subNote: {
    fontSize: 9,
    color: TOKENS.colors.textMuted,
    marginTop: 6,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    height: 46,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  exportBtnSuccess: {
    backgroundColor: TOKENS.colors.secondary,
    ...TOKENS.shadows.glowSecondary,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 1,
  },
  settlementList: {
    gap: 10,
  },
  settlementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
    gap: 8,
  },
  settlementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  awbBadge: {
    backgroundColor: TOKENS.colors.cardMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.sm,
  },
  awbBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    fontFamily: 'monospace',
  },
  handedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  handedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
  },
  accountingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TOKENS.colors.cardMuted,
    borderRadius: TOKENS.borderRadius.md,
    padding: 8,
    marginTop: 4,
  },
  accountItem: {
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: 9,
    color: TOKENS.colors.textMuted,
    fontWeight: '600',
  },
  accountVal: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    marginTop: 2,
  },
  accountFee: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.accent,
    marginTop: 2,
  },
  accountNet: {
    fontSize: 11,
    fontWeight: '900',
    color: TOKENS.colors.secondary,
    marginTop: 2,
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.secondaryLight,
    padding: 14,
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  policyNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '600',
  },
});
