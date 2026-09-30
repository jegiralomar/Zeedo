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

interface MyBidsScreenProps {
  session: MobileBuyerSession | null;
  items: MobileAuctionItem[];
  onReBid: (item: MobileAuctionItem) => void;
  onViewItem: (item: MobileAuctionItem) => void;
  onSignInRequired: () => void;
  language: 'ckb' | 'badini' | 'ar' | 'en';
}

export const MyBidsScreen: React.FC<MyBidsScreenProps> = ({
  session,
  items,
  onReBid,
  onViewItem,
  onSignInRequired,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'won' | 'history'>('active');

  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>🔒</Text>
        <Text style={styles.emptyTitle}>Sign In to View Bids</Text>
        <Text style={styles.emptySub}>
          Track your live winning bids, outbid alerts, and won items ready for doorstep cash inspection.
        </Text>
        <TouchableOpacity onPress={onSignInRequired} style={styles.signInBtn}>
          <Text style={styles.signInBtnText}>Sign In with WhatsApp</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Segment items based on user activity
  const activeItems = items.filter((it) => it.totalBids > 0);
  const wonItems = items.filter((it) => {
    const isExpired = new Date(it.endsAt).getTime() <= Date.now();
    return isExpired && it.totalBids > 0;
  });

  return (
    <View style={styles.container}>
      {/* 3-Segment Filter Bar */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.segmentTab, activeTab === 'active' && styles.segmentTabActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
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
          <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
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
                // Mock leading vs outbid for active items
                const isLeading = idx % 2 === 0;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onViewItem(item)}
                    activeOpacity={0.9}
                    style={styles.bidCard}
                  >
                    <Image
                      source={{
                        uri:
                          item.photos?.[0] ||
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
                      }}
                      style={styles.cardImage}
                    />
                    <View style={styles.cardDetails}>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusPill, isLeading ? styles.pillWinning : styles.pillOutbid]}>
                          <Text style={[styles.statusText, isLeading ? styles.textWinning : styles.textOutbid]}>
                            {isLeading ? '🟢 HIGHEST BIDDER' : '🔴 OUTBID'}
                          </Text>
                        </View>
                        <Text style={styles.timeTag}>Live Stream</Text>
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.cardBottom}>
                        <View>
                          <Text style={styles.currentPrice}>
                            {item.currentBid.toLocaleString()} <Text style={styles.iqd}>IQD</Text>
                          </Text>
                          <Text style={styles.usdText}>~${(item.currentBid / 1500).toFixed(2)} USD</Text>
                        </View>

                        {!isLeading && (
                          <TouchableOpacity
                            onPress={() => onReBid(item)}
                            style={styles.reBidBtn}
                          >
                            <Text style={styles.reBidBtnText}>+1,000 Re-bid</Text>
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
                  When you win an auction, your Cash-on-Delivery doorstep dispatch order appears here.
                </Text>
              </View>
            ) : (
              wonItems.map((item) => (
                <View key={item.id} style={styles.wonCard}>
                  <View style={styles.wonHeader}>
                    <Text style={styles.wonTag}>✓ AUCTION WON</Text>
                    <Text style={styles.wonPrice}>{item.currentBid.toLocaleString()} IQD</Text>
                  </View>

                  <Text style={styles.wonTitle}>{item.title}</Text>

                  {/* Delivery Tracking Bar */}
                  <View style={styles.deliveryProgress}>
                    <View style={styles.stepDone}>
                      <Text style={styles.stepText}>1. Won ✓</Text>
                    </View>
                    <View style={styles.stepActive}>
                      <Text style={styles.stepText}>2. Dispatching 🚚</Text>
                    </View>
                    <View style={styles.stepPending}>
                      <Text style={styles.stepText}>3. Inspection</Text>
                    </View>
                  </View>

                  <View style={styles.codNotice}>
                    <Text style={styles.codNoticeText}>
                      💵 Pay on doorstep arrival: You have the right to inspect the item before paying cash.
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxIcon}>📜</Text>
            <Text style={styles.emptyBoxTitle}>Past Activity</Text>
            <Text style={styles.emptyBoxSub}>
              All your concluded auctions and past delivery receipts are archived securely.
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
    backgroundColor: '#072F1F',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#072F1F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptySub: {
    color: '#A7C1B5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: '#B4F105',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  signInBtnText: {
    color: '#072F1F',
    fontWeight: '900',
    fontSize: 14,
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#B4F105',
  },
  segmentText: {
    color: '#A7C1B5',
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#072F1F',
    fontWeight: '900',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  emptyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyBoxIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyBoxTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyBoxSub: {
    color: '#A7C1B5',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  bidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#1E293B',
  },
  cardDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillWinning: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pillOutbid: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textWinning: {
    color: '#059669',
  },
  textOutbid: {
    color: '#DC2626',
  },
  timeTag: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#072F1F',
  },
  iqd: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  usdText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  reBidBtn: {
    backgroundColor: '#072F1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reBidBtnText: {
    color: '#B4F105',
    fontWeight: '900',
    fontSize: 11,
  },
  wonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  wonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wonTag: {
    color: '#059669',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  wonPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#072F1F',
  },
  wonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  deliveryProgress: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    gap: 6,
    marginBottom: 12,
  },
  stepDone: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  stepActive: {
    flex: 1,
    backgroundColor: 'rgba(180, 241, 5, 0.25)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  stepPending: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  codNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 10,
    borderRadius: 10,
  },
  codNoticeText: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
    fontWeight: '600',
  },
});
