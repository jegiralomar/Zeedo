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
import { EviraTheme } from '../lib/theme';

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
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'won' | 'history'>('active');

  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.lockedIconCircle}>
          <Text style={styles.lockedIcon}>🔒</Text>
        </View>
        <Text style={styles.emptyTitle}>Sign In to View Bids</Text>
        <Text style={styles.emptySub}>
          Track your live winning bids, outbid alerts, and won items ready for doorstep cash inspection.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSignInRequired}
          style={styles.signInBtn}
        >
          <Text style={styles.signInBtnText}>Sign In with WhatsApp</Text>
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
      {/* Evira Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bids</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'active'
            ? `${activeItems.length} Active Lots`
            : activeTab === 'won'
            ? `${wonItems.length} Won Items`
            : 'Completed History'}
        </Text>
      </View>

      {/* Evira 3-Segment Filter Pills */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.segmentTab, activeTab === 'active' && styles.segmentTabActive]}
        >
          <Text
            style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}
          >
            Active Bids ({activeItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('won')}
          style={[styles.segmentTab, activeTab === 'won' && styles.segmentTabActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'won' && styles.segmentTextActive]}>
            Won ({wonItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.segmentTab, activeTab === 'history' && styles.segmentTabActive]}
        >
          <Text
            style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' && (
          <>
            {activeItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyBoxIcon}>🏷️</Text>
                <Text style={styles.emptyBoxTitle}>No Active Bids</Text>
                <Text style={styles.emptyBoxSub}>
                  Slide to bid on live auctions starting strictly from 1,000 IQD.
                </Text>
              </View>
            ) : (
              activeItems.map((item, idx) => {
                const isLeading = idx % 2 === 0;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onViewItem(item)}
                    activeOpacity={0.88}
                    style={styles.bidCard}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri:
                            item.photos?.[0] ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
                        }}
                        style={styles.cardImage}
                        resizeMode="contain"
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
                            {isLeading ? 'HIGHEST BIDDER' : 'OUTBID'}
                          </Text>
                        </View>
                        <Text style={styles.timeTag}>Live Lot</Text>
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.cardBottom}>
                        <View>
                          <Text style={styles.priceLabel}>Current Bid</Text>
                          <Text style={styles.currentPrice}>
                            {item.currentBid.toLocaleString()} IQD
                          </Text>
                        </View>

                        {!isLeading && (
                          <TouchableOpacity
                            onPress={() => onReBid(item)}
                            style={styles.reBidBtn}
                          >
                            <Text style={styles.reBidBtnText}>+Re-bid</Text>
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
                <Text style={styles.emptyBoxTitle}>No Won Auctions Yet</Text>
                <Text style={styles.emptyBoxSub}>
                  Keep bidding! When an auction timer concludes, your won items will appear here with live courier dispatch tracking.
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
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
                      }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.wonTag}>
                      <Text style={styles.wonTagText}>🎉 AUCTION WON</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.wonPrice}>
                      Won at: {item.currentBid.toLocaleString()} IQD
                    </Text>
                    <View style={styles.awbBadge}>
                      <Text style={styles.awbText}>
                        AWB: AWB-IQ-{item.id.replace(/^auc-/, '')}
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
            <Text style={styles.emptyBoxTitle}>Bid History</Text>
            <Text style={styles.emptyBoxSub}>
              All your historical bids are backed by 90-day device cryptographic keys.
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
    backgroundColor: EviraTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: EviraTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: EviraTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280,
  },
  signInBtn: {
    backgroundColor: EviraTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: EviraTheme.radii.full,
  },
  signInBtnText: {
    color: EviraTheme.colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: EviraTheme.radii.full,
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
  },
  segmentTabActive: {
    backgroundColor: EviraTheme.colors.primary,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: EviraTheme.colors.textSecondary,
  },
  segmentTextActive: {
    color: EviraTheme.colors.textWhite,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyBoxIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyBoxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 4,
  },
  emptyBoxSub: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  bidCard: {
    backgroundColor: EviraTheme.colors.background,
    borderRadius: EviraTheme.radii.xl,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
  },
  wonCard: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: EviraTheme.radii.lg,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '85%',
    height: '85%',
  },
  cardDetails: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillWinning: {
    backgroundColor: '#DCFCE7',
  },
  pillOutbid: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 9,
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
    color: EviraTheme.colors.textTertiary,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 9,
    color: EviraTheme.colors.textTertiary,
    fontWeight: '600',
  },
  currentPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  reBidBtn: {
    backgroundColor: EviraTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: EviraTheme.radii.full,
  },
  reBidBtnText: {
    color: EviraTheme.colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  wonTag: {
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  wonTagText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  wonPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
    marginTop: 2,
  },
  awbBadge: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
  },
  awbText: {
    fontSize: 10,
    fontWeight: '700',
    color: EviraTheme.colors.textSecondary,
  },
});
