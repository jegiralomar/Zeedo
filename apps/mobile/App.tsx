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
import * as Haptics from 'expo-haptics';
import { getMobileSession, clearMobileSession, saveMobileSession, MobileBuyerSession } from './src/lib/session';
import { liveSocket } from './src/lib/socket';
import { AuctionCard, MobileAuctionItem } from './src/components/AuctionCard';
import { LiveAuctionRoomModal } from './src/components/LiveAuctionRoomModal';
import { WhatsAppAuthModal } from './src/components/WhatsAppAuthModal';
import { LocationPickerModal } from './src/components/LocationPickerModal';
import { MyBidsScreen } from './src/screens/MyBidsScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const API_BASE_URL = 'https://zeedo.auction';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'bids' | 'watchlist' | 'profile'>('feed');
  const [session, setSession] = useState<MobileBuyerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<'ckb' | 'badini' | 'ar' | 'en'>('ckb');
  const [items, setItems] = useState<MobileAuctionItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  // Modals
  const [selectedRoomItem, setSelectedRoomItem] = useState<MobileAuctionItem | null>(null);
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
          title:
            l.title ||
            l.multilingual?.ckb?.title ||
            l.multilingual?.en?.title ||
            l.multilingual?.ar?.title ||
            'Auction Lot',
          category: l.category || 'Electronics',
          currentBid: Number(l.currentBid || l.currentBidIqd || l.current_bid || 1000),
          startingPrice: Number(l.startingPrice || l.startingPriceIqd || l.starting_price || 1000),
          bidIncrement: Number(l.bidIncrement || l.incrementStepIqd || 1000),
          endsAt: l.endsAt || l.auctionEndsAt || l.ends_at,
          photos:
            l.photos ||
            (Array.isArray(l.images) && l.images.length > 0
              ? l.images
              : l.image
              ? [l.image]
              : []),
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
    // 1. Hydrate and verify 90-day hardware session from iOS Keychain / Android Keystore
    getMobileSession().then(async (saved) => {
      if (saved && saved.token) {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/api/auth/session/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${saved.token}`,
            },
          });
          const verifyData = await verifyRes.json();
          if (verifyData.isValid) {
            setSession(saved);
            liveSocket.setUserId(saved.user.id);
          } else {
            await clearMobileSession();
            setSession(null);
            liveSocket.setUserId(null);
          }
        } catch {
          setSession(saved);
          liveSocket.setUserId(saved.user.id);
        }
      }
    });

    // 2. Initial live drops load
    fetchLiveAuctions();

    // 3. Connect to low-latency WebSocket bidding gateway
    liveSocket.connect();

    // 4. Subscribe to live bid updates across all auctions
    const unsubBids = liveSocket.on('NEW_BID', (data: any) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === data.auctionId) {
            return {
              ...it,
              currentBid: data.currentBidIqd,
              totalBids: data.totalBids,
              endsAt: data.auctionEndsAt || it.endsAt,
            };
          }
          return it;
        })
      );

      // If active in room, update room item in real time
      setSelectedRoomItem((current) => {
        if (current && current.id === data.auctionId) {
          return {
            ...current,
            currentBid: data.currentBidIqd,
            totalBids: data.totalBids,
            endsAt: data.auctionEndsAt || current.endsAt,
          };
        }
        return current;
      });
    });

    // 5. Anti-Sniping Timer Extensions & Admin Extensions
    const handleTimerChange = (data: any) => {
      if (!data || !data.auctionId) return;
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === data.auctionId) {
            return {
              ...it,
              endsAt: data.auctionEndsAt || it.endsAt,
            };
          }
          return it;
        })
      );

      setSelectedRoomItem((current) => {
        if (current && current.id === data.auctionId) {
          return {
            ...current,
            endsAt: data.auctionEndsAt || current.endsAt,
          };
        }
        return current;
      });
    };

    const unsubTimerExt = liveSocket.on('TIMER_EXTENDED', handleTimerChange);
    const unsubTimerReset = liveSocket.on('TIMER_RESET', handleTimerChange);

    // 6. Pause & Resume Operations
    const handleStatusChange = () => {
      fetchLiveAuctions();
    };
    const unsubPause = liveSocket.on('AUCTION_PAUSED', handleStatusChange);
    const unsubResume = liveSocket.on('AUCTION_RESUMED', handleStatusChange);

    // 7. Concluded Auction
    const unsubEnded = liveSocket.on('AUCTION_ENDED', (data: any) => {
      fetchLiveAuctions();
      if (data && data.isWinner) {
        Alert.alert(
          '🎉 Congratulations! You Won!',
          `You are the winning bidder for this auction at ${data.wonPriceIqd?.toLocaleString()} IQD!\n\nYour order has been confirmed with 100% Cash-on-Delivery inspection. Tracking: ${data.packageAwbId || 'Pending Courier Dispatch'}`,
          [{ text: 'View Won Items', onPress: () => setActiveTab('my_bids') }]
        );
      }
    });

    // 8. Voided Bids
    const unsubVoid = liveSocket.on('BID_VOIDED', (data: any) => {
      if (!data || !data.auctionId) return;
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === data.auctionId) {
            return {
              ...it,
              currentBid: data.currentBidIqd,
              totalBids: data.totalBids,
            };
          }
          return it;
        })
      );

      setSelectedRoomItem((current) => {
        if (current && current.id === data.auctionId) {
          return {
            ...current,
            currentBid: data.currentBidIqd,
            totalBids: data.totalBids,
          };
        }
        return current;
      });
    });

    // 9. Subscribe to personal outbid notifications
    const unsubOutbid = liveSocket.on('OUTBID_ALERT', (data: any) => {
      if (data && data.isWinner) {
        Alert.alert(
          '🎉 Congratulations! You Won!',
          `You won "${data.auctionTitle || 'an item'}" at ${data.wonPriceIqd?.toLocaleString()} IQD!\n\nDoorstep Cash-on-Delivery inspection AWB: ${data.packageAwbId || 'Dispatched'}`,
          [{ text: 'View In My Bids', onPress: () => setActiveTab('my_bids') }]
        );
        return;
      }

      Alert.alert(
        'Outbid Alert! ⚠️',
        `Someone just outbid you on "${data.auctionTitle || 'an item'}" at ${data.newBidIqd?.toLocaleString()} IQD! Place another bid to regain the lead!`,
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'Re-bid +1,000 IQD',
            onPress: () => {
              setItems((currentItems) => {
                const target = currentItems.find((it) => it.id === data.auctionId);
                if (target) executeBid(target);
                return currentItems;
              });
            },
          },
        ]
      );
    });

    return () => {
      unsubBids();
      unsubTimerExt();
      unsubTimerReset();
      unsubPause();
      unsubResume();
      unsubEnded();
      unsubVoid();
      unsubOutbid();
      liveSocket.disconnect();
    };
  }, [fetchLiveAuctions]);

  // Handle Placing Bids
  const executeBid = async (item: MobileAuctionItem, customIncrement?: number) => {
    if (!session) {
      setPendingBidItem(item);
      setAuthModalVisible(true);
      return;
    }

    const inc = customIncrement || item.bidIncrement;
    const nextAmount = item.currentBid + inc;

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
          bidderId: session.user.id,
          bidderName: session.user.name || session.user.phone,
          bidderPhone: session.user.phone,
          bidderCity: session.user.city || 'Erbil',
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to place bid');
      }

      // Minimal tactile haptic on successful bid confirmation
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      Alert.alert(
        'Bid Accepted! 🎯',
        `You are now the highest bidder at ${nextAmount.toLocaleString()} IQD.`
      );
    } catch (err: any) {
      Alert.alert('Bid Error', err.message || 'Could not place bid.');
    }
  };

  const toggleSaveItem = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

      {/* Global Top App Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ZEEDO</Text>
          <Text style={styles.headerSubtitle}>Live 1,000 IQD Marketplace</Text>
        </View>

        {/* Dialect Switcher Pills */}
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

      {/* Main Tab Screen Content */}
      <View style={styles.mainContent}>
        {activeTab === 'feed' && (
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

                {!session && (
                  <TouchableOpacity
                    onPress={() => setAuthModalVisible(true)}
                    style={styles.loginPill}
                  >
                    <Text style={styles.loginPillText}>Sign In</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Live Feed Header */}
            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>
                {language === 'ckb'
                  ? 'مزادە ڕاستەوخۆکان'
                  : language === 'badini'
                  ? 'مەزادێن ئێکسەر'
                  : language === 'ar'
                  ? 'المزادات المباشرة'
                  : 'Live Drops'}
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
                  onPressCard={(it) => setSelectedRoomItem(it)}
                />
              ))
            )}
          </ScrollView>
        )}

        {activeTab === 'bids' && (
          <MyBidsScreen
            session={session}
            items={items}
            language={language}
            onReBid={executeBid}
            onViewItem={(it) => setSelectedRoomItem(it)}
            onSignInRequired={() => setAuthModalVisible(true)}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistScreen
            savedIds={savedIds}
            items={items}
            language={language}
            onToggleSave={toggleSaveItem}
            onQuickBid={executeBid}
            onViewItem={(it) => setSelectedRoomItem(it)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            session={session}
            language={language}
            onSelectLanguage={setLanguage}
            onOpenAuth={() => setAuthModalVisible(true)}
            onOpenLocation={() => setLocationModalVisible(true)}
            onSessionCleared={() => setSession(null)}
          />
        )}
      </View>

      {/* 4-Tab Bottom Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('feed')}
          style={styles.tabItem}
        >
          <Text style={[styles.tabIcon, activeTab === 'feed' && styles.tabIconActive]}>🔥</Text>
          <Text style={[styles.tabLabel, activeTab === 'feed' && styles.tabLabelActive]}>
            Live Drops
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('bids')}
          style={styles.tabItem}
        >
          <Text style={[styles.tabIcon, activeTab === 'bids' && styles.tabIconActive]}>🏷️</Text>
          <Text style={[styles.tabLabel, activeTab === 'bids' && styles.tabLabelActive]}>
            My Bids
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('watchlist')}
          style={styles.tabItem}
        >
          <Text style={[styles.tabIcon, activeTab === 'watchlist' && styles.tabIconActive]}>⭐</Text>
          <Text style={[styles.tabLabel, activeTab === 'watchlist' && styles.tabLabelActive]}>
            Watchlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          style={styles.tabItem}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full-Screen Live Auction Room Modal */}
      <LiveAuctionRoomModal
        visible={Boolean(selectedRoomItem)}
        item={selectedRoomItem}
        onClose={() => setSelectedRoomItem(null)}
        onPlaceBid={executeBid}
        language={language}
        isLeading={false}
      />

      {/* WhatsApp OTP Modal */}
      <WhatsAppAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        apiBaseUrl={API_BASE_URL}
        onSuccess={(newSession) => {
          setSession(newSession);
          liveSocket.setUserId(newSession.user.id);
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
        onLocationSaved={async (loc) => {
          if (session) {
            const updated = {
              ...session,
              user: {
                ...session.user,
                city: loc.city,
              },
            };
            setSession(updated);
            await saveMobileSession(updated);
          }
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
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 20,
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
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#052216',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 10,
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A7C1B5',
  },
  tabLabelActive: {
    color: '#B4F105',
    fontWeight: '900',
  },
});
