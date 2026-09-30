import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MobileAuctionItem } from '../components/AuctionCard';
import { MobileBuyerSession } from '../lib/session';
import { AppTheme } from '../lib/theme';

interface MyBidsScreenProps {
  session: MobileBuyerSession | null;
  items: MobileAuctionItem[];
  onReBid: (item: MobileAuctionItem) => void;
  onViewItem: (item: MobileAuctionItem) => void;
  onSignInRequired: () => void;
  language?: 'ckb' | 'badini' | 'ar' | 'en';
}

export const MyBidsScreen: React.FC<MyBidsScreenProps> = ({
  session,
  items,
  onReBid,
  onViewItem,
  onSignInRequired,
  language = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'won' | 'history'>('active');

  const t = {
    title: language === 'ar' ? 'مزايداتي' : language === 'ckb' ? 'زیادکردنەکانم' : 'My Bids',
    activeTab: language === 'ar' ? 'المزايدات الحالية' : language === 'ckb' ? 'چالاکەکان' : 'Active Bids',
    wonTab: language === 'ar' ? 'المزادات الفائزة' : language === 'ckb' ? 'براوەکان' : 'Won Items',
    historyTab: language === 'ar' ? 'السجل' : language === 'ckb' ? 'مێژوو' : 'History',
    signInTitle: language === 'ar' ? 'سجّل الدخول لعرض مزايداتك' : 'Sign In to View Bids',
    signInSub: language === 'ar' ? 'تابع مزايداتك المباشرة والتنبيهات وحالة الاستلام عند الباب.' : 'Track your live winning bids, outbid alerts, and won items ready for doorstep cash inspection.',
    signInBtn: language === 'ar' ? 'تسجيل الدخول عبر واتساب' : 'Sign In with WhatsApp',
    currentBid: language === 'ar' ? 'المزايدة الحالية' : 'Current Bid',
    reBid: language === 'ar' ? 'زيادة الآن' : '+Re-bid',
    winningBadge: language === 'ar' ? 'أعلى مزايد' : 'HIGHEST BIDDER',
    outbidBadge: language === 'ar' ? 'تمت المزايدة عليك' : 'OUTBID',
    wonBadge: language === 'ar' ? '🎉 فزت بالمزاد' : '🎉 AUCTION WON',
    emptyActive: language === 'ar' ? 'لا توجد مزايدات نشطة حالياً' : 'No Active Bids',
    emptyWon: language === 'ar' ? 'لم تفز بمزادات بعد' : 'No Won Auctions Yet',
  };

  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.lockedIconCircle}>
          <Text style={styles.lockedIcon}>⚖️</Text>
        </View>
        <Text style={styles.emptyTitle}>{t.signInTitle}</Text>
        <Text style={styles.emptySub}>{t.signInSub}</Text>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onSignInRequired}
          style={styles.signInBtn}
        >
          <Text style={styles.signInBtnText}>{t.signInBtn}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeItems = items.filter((it) => it.totalBids > 0);
  const wonItems = items.filter((it) => {
    const isExpired = new Date(it.endsAt).getTime() <= Date.now();
    return isExpired && it.totalBids > 0;
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'active'
            ? `${activeItems.length} مزاد نشط`
            : activeTab === 'won'
            ? `${wonItems.length} عنصر فائز`
            : 'السجل الكامل'}
        </Text>
      </View>

      {/* 3-Segment Filter Bar (Royal Indigo Pill) */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.segmentTab, activeTab === 'active' && styles.segmentTabActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}
          >
            {t.activeTab} ({activeItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('won')}
          style={[styles.segmentTab, activeTab === 'won' && styles.segmentTabActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'won' && styles.segmentTextActive]}>
            {t.wonTab} ({wonItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.segmentTab, activeTab === 'history' && styles.segmentTabActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}
          >
            {t.historyTab}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' && (
          <>
            {activeItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyBoxIcon}>🏷️</Text>
                <Text style={styles.emptyBoxTitle}>{t.emptyActive}</Text>
                <Text style={styles.emptyBoxSub}>
                  ابدأ المزايدة على القطع الحية ابتداءً من 1,000 د.ع مع فحص مجاني عند الباب.
                </Text>
              </View>
            ) : (
              activeItems.map((item, idx) => {
                const isLeading = idx % 2 === 0;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onViewItem(item)}
                    activeOpacity={0.9}
                    style={styles.bidCard}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri:
                            item.photos?.[0] ||
                            'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80',
                        }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.statusRow}>
                        <View
                          style={[
                            styles.statusPill,
                            isLeading ? styles.pillWinning : styles.pillOutbid,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              isLeading ? styles.textWinning : styles.textOutbid,
                            ]}
                          >
                            {isLeading ? t.winningBadge : t.outbidBadge}
                          </Text>
                        </View>
                        <Text style={styles.timeTag}>⏱ بث مباشر</Text>
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.cardBottom}>
                        <View>
                          <Text style={styles.priceLabel}>{t.currentBid}</Text>
                          <Text style={styles.currentPrice}>
                            {item.currentBid.toLocaleString()} IQD
                          </Text>
                        </View>

                        {!isLeading && (
                          <TouchableOpacity
                            onPress={() => onReBid(item)}
                            style={styles.reBidBtn}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.reBidBtnText}>{t.reBid}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {activeTab === 'won' && (
          <>
            {wonItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyBoxIcon}>🏆</Text>
                <Text style={styles.emptyBoxTitle}>{t.emptyWon}</Text>
                <Text style={styles.emptyBoxSub}>
                  استمر في المزايدة! عندما ينتهي وقت المزاد، ستظهر القطع التي فزت بها هنا لمتابعة تسليمها وفحصها عند الباب.
                </Text>
              </View>
            ) : (
              wonItems.map((item) => (
                <View key={item.id} style={styles.wonCard}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri:
                          item.photos?.[0] ||
                          'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80',
                      }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.wonTag}>
                      <Text style={styles.wonTagText}>{t.wonBadge}</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.wonPrice}>
                      سعر الفوز: {item.currentBid.toLocaleString()} IQD
                    </Text>
                    <View style={styles.awbBadge}>
                      <Text style={styles.awbText}>
                        📦 بوليصة الشحن: AWB-IQ-{item.id.replace(/^auc-/, '')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxIcon}>📜</Text>
            <Text style={styles.emptyBoxTitle}>سجل المزايدات والمشتريات</Text>
            <Text style={styles.emptyBoxSub}>
              جميع مزايداتك التاريخية موثقة ومشفرة ومحمية بضمان معاينة البضاعة قبل الدفع.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: AppTheme.colors.background,
  },
  lockedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: AppTheme.radii.lg,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentTabActive: {
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  bidCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  wonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#EDF2F7',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillWinning: {
    backgroundColor: '#DCFCE7',
  },
  pillOutbid: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textWinning: {
    color: '#15803D',
  },
  textOutbid: {
    color: '#B91C1C',
  },
  timeTag: {
    fontSize: 10,
    fontWeight: '600',
    color: AppTheme.colors.textTertiary,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    lineHeight: 18,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: AppTheme.colors.textTertiary,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  reBidBtn: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reBidBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  wonTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  wonTagText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
  },
  wonPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  awbBadge: {
    backgroundColor: AppTheme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  awbText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppTheme.colors.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginTop: 20,
  },
  emptyBoxIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyBoxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  emptyBoxSub: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
