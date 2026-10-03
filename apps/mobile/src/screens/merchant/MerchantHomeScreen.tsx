import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from 'react-native';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Plus,
  ShieldCheck,
  ChevronRight,
  Gavel,
  Printer,
  QrCode,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

export const MerchantHomeScreen: React.FC = () => {
  const { language, currentUser, auctions, setSelectedAuctionId, setMerchantScreen } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const myLots = auctions.filter((a) => currentUser?.id ? a.sellerId === currentUser.id : false);

  const totalGrossIqd = myLots.reduce((acc, it) => acc + it.currentBidIqd, 0);
  const netEarningsIqd = Math.round(totalGrossIqd * 0.9);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Merchant Store Header */}
      <View style={styles.storeHeader}>
        <View style={styles.storeIcon}>
          <Store size={24} color="#FFFFFF" />
        </View>
        <View style={styles.storeInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.storeName}>{currentUser?.storeName || 'Al-Mansour Electronics'}</Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.verifiedText}>PRO MERCHANT</Text>
            </View>
          </View>
          <Text style={styles.storePhone}>{currentUser?.phone || '+964 780 987 6543'} • Baghdad, Iraq</Text>
        </View>
      </View>

      {/* 2. Primary KPI Cards */}
      <View style={styles.kpiGrid}>
        {/* Gross Sales */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>CASH COLLECTED (DIRECT COD)</Text>
          <Text style={styles.kpiValueIqd}>{totalGrossIqd.toLocaleString()} د.ع</Text>
          <Text style={styles.kpiSub}>Collected directly by you at doorstep</Text>
        </View>

        {/* Platform Fees Owed (1,000 IQD listing + Commission) */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>PLATFORM FEES OWED</Text>
          <Text style={[styles.kpiValueIqd, { color: '#DC2626' }]}>
            {(Math.round(totalGrossIqd * 0.05) + (myLots.length * 1000)).toLocaleString()} د.ع
          </Text>
          <Text style={styles.kpiSub}>1,000 د.ع listing fee + commission</Text>
        </View>
      </View>

      {/* 3. Primary Action: List New Lot */}
      <TouchableOpacity
        style={styles.createLotBtn}
        onPress={() => setMerchantScreen('create_auction')}
        activeOpacity={0.85}
      >
        <Plus size={18} color="#0B130F" />
        <Text style={styles.createLotBtnText}>
          {isRtl ? '+ إدراج مزاد جديد (سحب ذكي بالذكاء الاصطناعي)' : '+ List New Lot (AI Smart Scraper)'}
        </Text>
      </TouchableOpacity>

      {/* 4. Action Shortcuts */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          onPress={() => setMerchantScreen('orders')}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Package size={16} color={AppTheme.colors.primary} />
          <Text style={styles.actionBtnText}>
            {isRtl ? 'طلبات التوصيل (1 بانتظار الشحن)' : 'COD Orders (1 Pending)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMerchantScreen('ledger')}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <DollarSign size={16} color={AppTheme.colors.secondary} />
          <Text style={styles.actionBtnText}>
            {isRtl ? 'كشف الحساب والمستحقات' : 'Ledger & Payouts'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Active Auction Lots List */}
      <View style={styles.sectionHeader}>
        <Gavel size={16} color={AppTheme.colors.primary} />
        <Text style={styles.sectionTitle}>
          {isRtl ? 'مزادات متجري النشطة' : 'My Active Auction Lots'} ({myLots.length})
        </Text>
      </View>

      {myLots.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.lotCard}
          onPress={() => setSelectedAuctionId(item.id)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.images[0] }} style={styles.lotImage} />
          <View style={styles.lotContent}>
            <Text style={styles.lotTitle} numberOfLines={1}>
              {isRtl && item.titleAr ? item.titleAr : item.title}
            </Text>

            <View style={styles.lotBidRow}>
              <Text style={styles.lotCurrentBid}>
                {item.currentBidIqd.toLocaleString()} د.ع
              </Text>
              <Text style={styles.lotBidsCount}>({item.bidsCount} عطاء)</Text>
            </View>

            <View style={styles.timerRow}>
              <Clock size={11} color={AppTheme.colors.textMuted} />
              <Text style={styles.timerText}>ينتهي خلال 45 دقيقة</Text>
            </View>
          </View>
          
          {/* Quick Print QR for Inventory */}
          <TouchableOpacity
            style={styles.lotPrintBtn}
            onPress={(e) => {
              e.stopPropagation();
              const trackUrl = `https://zeedo.bid/track/${item.id}`;
              if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
                window.print();
              } else {
                Linking.openURL(trackUrl).catch((err) => console.warn(err));
              }
            }}
            activeOpacity={0.7}
          >
            <Printer size={15} color="#0B130F" />
            <Text style={styles.lotPrintBtnText}>QR</Text>
          </TouchableOpacity>

          <ChevronRight size={18} color={AppTheme.colors.textMuted} />
        </TouchableOpacity>
      ))}

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
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppTheme.colors.textPrimary,
    borderRadius: AppTheme.radius.md,
    padding: 16,
    marginBottom: 16,
  },
  storeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#065F46',
  },
  storePhone: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AppTheme.colors.textMuted,
    marginBottom: 4,
  },
  kpiValueIqd: {
    fontSize: 16,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  kpiValueUsd: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: AppTheme.colors.green,
    fontWeight: '700',
    marginTop: 2,
  },
  createLotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B4F105',
    borderRadius: 14,
    height: 48,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  createLotBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B130F',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  lotCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  lotImage: {
    width: 60,
    height: 60,
    borderRadius: AppTheme.radius.sm,
  },
  lotContent: {
    flex: 1,
  },
  lotTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  lotBidRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 2,
  },
  lotCurrentBid: {
    fontSize: 13,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  lotBidsCount: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
  },
  lotPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#B4F105',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lotPrintBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B130F',
  },
});

