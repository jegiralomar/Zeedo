import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { getMobileSession, clearMobileSession, MobileBuyerSession } from './src/lib/session';
import { liveSocket } from './src/lib/socket';
import { AuctionCard, MobileAuctionItem } from './src/components/AuctionCard';
import { WhatsAppAuthModal } from './src/components/WhatsAppAuthModal';
import { LocationPickerModal } from './src/components/LocationPickerModal';

const API_BASE_URL = 'https://zeedo.auction';

export default function App() {
  const [session, setSession] = useState<MobileBuyerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<'ckb' | 'badini' | 'ar' | 'en'>('ckb');
  const [items, setItems] = useState<MobileAuctionItem[]>([]);
  
  // Modals
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [pendingBidItem, setPendingBidItem] = useState<MobileAuctionItem | null>(null);

  // Fetch live auctions from backend
  const fetchLiveAuctions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings?status=live`);
      if (res.ok) {
        const data = await res.json();
        const listings = (data.listings || []).map((l: any) => ({
          id: l.id,
          title: l.title,
          category: l.category || 'Electronics',
          currentBid: Number(l.currentBid || l.current_bid || 1000),
          startingPrice: Number(l.startingPrice || l.starting_price || 1000),
          bidIncrement: Number(l.bidIncrement || 1000),
          endsAt: l.endsAt || l.ends_at,
          photos: l.photos || (l.image ? [l.image] : []),
          totalBids: Number(l.totalBids || l.total_bids || 0),
          condition: l.condition || 'Brand New',
        }));
        setItems(listings);
      }
    } catch (err) {
      console.warn('[Zeedo Mobile] Failed to fetch auctions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // 1. Hydrate 90-day hardware session from iOS Keychain / Android Keystore
    getMobileSession().then((saved) => {
      setSession(saved);
    });

    // 2. Initial load
    fetchLiveAuctions();

    // 3. Connect to low-latency WebSocket bidding gateway
    liveSocket.connect();

    // 4. Subscribe to live bid updates
    const unsubscribe = liveSocket.on('BID_PLACED', (data: any) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === data.auctionId) {
            return {
              ...it,
              currentBid: data.amount,
              totalBids: it.totalBids + 1,
            };
          }
          return it;
        })
      );
    });

    return () => {
      unsubscribe();
      liveSocket.disconnect();
    };
  }, [fetchLiveAuctions]);

  // Handle Placing Bids
  const executeBid = async (item: MobileAuctionItem) => {
    if (!session) {
      setPendingBidItem(item);
      setAuthModalVisible(true);
      return;
    }

    const nextAmount = item.currentBid + item.bidIncrement;

    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          auctionId: item.id,
          amount: nextAmount,
          userId: session.user.id,
          userName: session.user.name || session.user.phone,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to place bid');
      }

      Alert.alert(
        'Bid Accepted! 🎯',
        `You are now the highest bidder at ${nextAmount.toLocaleString()} IQD.`
      );
    } catch (err: any) {
      Alert.alert('Bid Error', err.message || 'Could not place bid.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveAuctions();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#B4F105" />
        <Text style={styles.loadingText}>Syncing Live 1,000 IQD Marketplace...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#072F1F" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ZEEDO</Text>
          <Text style={styles.headerSubtitle}>Live 1,000 IQD Marketplace</Text>
        </View>

        {/* Dialect Switcher */}
        <View style={styles.dialectRow}>
          {(['ckb', 'badini', 'ar', 'en'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[styles.dialectPill, language === lang && styles.dialectPillActive]}
            >
              <Text
                style={[
                  styles.dialectPillText,
                  language === lang && styles.dialectPillTextActive,
                ]}
              >
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B4F105"
            colors={['#B4F105']}
          />
        }
      >
        {/* User Session & Doorstep Pin Bar */}
        <View style={styles.sessionCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionStatusText}>
              {session
                ? `Signed in as ${session.user.name || session.user.phone}`
                : 'Guest Mode — 1-Tap WhatsApp OTP'}
            </Text>
            <Text style={styles.sessionSubtext}>
              {session
                ? '90-Day Active Session ✓ Hardware Key Secure'
                : '100% Cash-on-Delivery with Open Box Inspection'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setLocationModalVisible(true)}
              style={styles.locationPill}
            >
              <Text style={styles.locationPillText}>📍 Pin Map</Text>
            </TouchableOpacity>

            {session ? (
              <TouchableOpacity
                onPress={async () => {
                  await clearMobileSession();
                  setSession(null);
                }}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutButtonText}>Exit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setAuthModalVisible(true)}
                style={styles.loginPill}
              >
                <Text style={styles.loginPillText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Live Auctions Feed */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            {language === 'ckb'
              ? 'مزادە ڕاستەوخۆکان'
              : language === 'badini'
              ? 'مەزادێن ئێکسەر'
              : language === 'ar'
              ? 'المزادات المباشرة'
              : 'Live Auctions'}
          </Text>
          <Text style={styles.liveIndicator}>🔴 LIVE NOW</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Live Drops Right Now</Text>
            <Text style={styles.emptySubtitle}>
              New items start strictly from 1,000 IQD. Check back shortly!
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <AuctionCard
              key={item.id}
              item={item}
              language={language}
              onQuickBid={executeBid}
              onSlideBid={executeBid}
              onPressCard={(it) => {
                // View auction details
              }}
            />
          ))
        )}
      </ScrollView>

      {/* WhatsApp OTP Modal */}
      <WhatsAppAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        apiBaseUrl={API_BASE_URL}
        onSuccess={(newSession) => {
          setSession(newSession);
          if (pendingBidItem) {
            executeBid(pendingBidItem);
            setPendingBidItem(null);
          }
        }}
      />

      {/* Location Doorstep Pin Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSaved={(loc) => {
          Alert.alert(
            'Location Saved',
            `Delivery destination confirmed for ${loc.city}, ${loc.district}.`
          );
        }}
      />
    </SafeAreaView>
  );
}

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
    padding: 24,
  },
  loadingText: {
    color: '#A7C1B5',
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B4F105',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#A7C1B5',
    marginTop: 2,
    fontWeight: '600',
  },
  dialectRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dialectPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialectPillActive: {
    backgroundColor: '#B4F105',
  },
  dialectPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dialectPillTextActive: {
    color: '#072F1F',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionSubtext: {
    color: '#6EE7B7',
    fontSize: 10,
    marginTop: 2,
  },
  locationPill: {
    backgroundColor: 'rgba(180, 241, 5, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(180, 241, 5, 0.4)',
  },
  locationPillText: {
    color: '#B4F105',
    fontSize: 11,
    fontWeight: 'bold',
  },
  loginPill: {
    backgroundColor: '#B4F105',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loginPillText: {
    color: '#072F1F',
    fontSize: 11,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FB7185',
    fontSize: 11,
    fontWeight: 'bold',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  liveIndicator: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
