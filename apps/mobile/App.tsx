import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
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
import { EviraTheme } from './src/lib/theme';

const API_BASE_URL = 'https://zeedo.auction';

const SAMPLE_LIVE_DROPS: MobileAuctionItem[] = [
  {
    id: 'auc-demo-1',
    title: 'Sony PlayStation 5 Slim 1TB Edition (Japan Spec)',
    category: 'Gaming',
    currentBid: 320000,
    startingPrice: 1000,
    bidIncrement: 5000,
    endsAt: new Date(Date.now() + 18 * 60 * 1000 + 30 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80'],
    totalBids: 48,
    condition: 'Brand New In Box',
  },
  {
    id: 'auc-demo-2',
    title: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
    category: 'Smartphones',
    currentBid: 890000,
    startingPrice: 1000,
    bidIncrement: 10000,
    endsAt: new Date(Date.now() + 42 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'],
    totalBids: 72,
    condition: 'Factory Sealed',
  },
  {
    id: 'auc-demo-3',
    title: 'Dyson V15 Detect Absolute Cordless Vacuum',
    category: 'Home Appliances',
    currentBid: 145000,
    startingPrice: 1000,
    bidIncrement: 2000,
    endsAt: new Date(Date.now() + 6 * 60 * 1000 + 15 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80'],
    totalBids: 29,
    condition: 'Open Box Inspection OK',
  },
  {
    id: 'auc-demo-4',
    title: 'Rolex Submariner Date 41mm Oystersteel Ceramic',
    category: 'Watches',
    currentBid: 14200000,
    startingPrice: 1000,
    bidIncrement: 50000,
    endsAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
    totalBids: 114,
    condition: 'Mint / Certificate',
  },
  {
    id: 'auc-demo-5',
    title: 'Nike Air Jordan 1 Retro High OG Chicago',
    category: 'Sneakers',
    currentBid: 280000,
    startingPrice: 1000,
    bidIncrement: 5000,
    endsAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
    totalBids: 36,
    condition: 'Deadstock / Unworn',
  },
  {
    id: 'auc-demo-6',
    title: 'Apple MacBook Pro 16" M3 Max 36GB / 1TB Space Black',
    category: 'Computers',
    currentBid: 2950000,
    startingPrice: 1000,
    bidIncrement: 25000,
    endsAt: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    totalBids: 88,
    condition: 'Factory Sealed',
  },
];

const EVIRA_CATEGORIES = [
  { id: 'all', name: 'All', icon: '⚡' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'smartphones', name: 'Phones', icon: '📱' },
  { id: 'watches', name: 'Watches', icon: '⌚' },
  { id: 'computers', name: 'Computers', icon: '💻' },
  { id: 'sneakers', name: 'Sneakers', icon: '👟' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'luxury', name: 'Luxury', icon: '💎' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'bids' | 'watchlist' | 'profile'>('feed');
  const [session, setSession] = useState<MobileBuyerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<'ckb' | 'badini' | 'ar' | 'en'>('ckb');
  const [items, setItems] = useState<MobileAuctionItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(['auc-demo-1', 'auc-demo-2']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
          category: l.category || 'Gaming',
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
        if (listings.length > 0) {
          setItems(listings);
        } else {
          setItems(SAMPLE_LIVE_DROPS);
        }
      } else {
        setItems(SAMPLE_LIVE_DROPS);
      }
    } catch (err) {
      console.warn('[Zeedo Mobile] Failed to fetch auctions:', err);
      setItems((prev) => (prev.length > 0 ? prev : SAMPLE_LIVE_DROPS));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
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

    fetchLiveAuctions();
    liveSocket.connect();

    const unsubBids = liveSocket.on('NEW_BID', (data: any) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === data.auctionId) {
            return {
              ...it,
              currentBid: data.amountIqd || data.currentBidIqd,
              totalBids: (it.totalBids || 0) + 1,
            };
          }
          return it;
        })
      );
    });

    const unsubTimerExt = liveSocket.on('TIMER_EXTENDED', (data: any) => {
      if (!data || !data.auctionId || !data.auctionEndsAt) return;
      setItems((prev) =>
        prev.map((it) =>
          it.id === data.auctionId ? { ...it, endsAt: data.auctionEndsAt } : it
        )
      );
    });

    const unsubEnded = liveSocket.on('AUCTION_ENDED', (data: any) => {
      fetchLiveAuctions();
      if (data && data.isWinner) {
        Alert.alert(
          '🎉 Congratulations! You Won!',
          `You won this auction at ${data.wonPriceIqd?.toLocaleString()} IQD!\n\nDoorstep Cash-on-Delivery inspection tracking: ${data.packageAwbId || 'Dispatched'}`,
          [{ text: 'View Won Items', onPress: () => setActiveTab('bids') }]
        );
      }
    });

    return () => {
      unsubBids();
      unsubTimerExt();
      unsubEnded();
      liveSocket.disconnect();
    };
  }, [fetchLiveAuctions]);

  const executeBid = async (item: MobileAuctionItem, customIncrement?: number) => {
    if (!session) {
      setPendingBidItem(item);
      setAuthModalVisible(true);
      return;
    }

    const inc = customIncrement || item.bidIncrement;
    const nextAmount = item.currentBid + inc;

    if (item.id.startsWith('auc-demo-')) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, currentBid: nextAmount, totalBids: it.totalBids + 1 }
            : it
        )
      );
      setSelectedRoomItem((curr) =>
        curr && curr.id === item.id
          ? { ...curr, currentBid: nextAmount, totalBids: curr.totalBids + 1 }
          : curr
      );
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      Alert.alert(
        'Bid Accepted! 🎯',
        `You are now the highest bidder at ${nextAmount.toLocaleString()} IQD.`
      );
      return;
    }

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

  // Filtered items based on search & category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={EviraTheme.colors.primary} />
        <Text style={styles.loadingText}>Syncing Live 1,000 IQD Marketplace...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* EVIRA TOP HEADER BAR */}
      <View style={styles.eviraHeader}>
        {/* Left: User Avatar & Greeting */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('profile')}
          style={styles.profileSection}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {session?.user.name ? session.user.name.charAt(0).toUpperCase() : 'Z'}
            </Text>
          </View>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingSubtext}>Good Day 👋</Text>
            <Text style={styles.greetingUsername} numberOfLines={1}>
              {session ? session.user.name || session.user.phone : 'Guest Buyer'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Notification Bell & Watchlist Heart */}
        <View style={styles.headerActionRow}>
          {/* Watchlist Counter */}
          <TouchableOpacity
            onPress={() => setActiveTab('watchlist')}
            style={styles.iconButton}
          >
            <Text style={styles.actionIconText}>♡</Text>
            {savedIds.length > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{savedIds.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Delivery Location Pin */}
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            style={styles.iconButton}
          >
            <Text style={styles.actionIconText}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN TAB CONTENT */}
      <View style={styles.mainContent}>
        {activeTab === 'feed' && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={EviraTheme.colors.primary}
              />
            }
          >
            {/* EVIRA SEARCH & FILTER BAR */}
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search auctions, brands, items..."
                placeholderTextColor={EviraTheme.colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchIcon}>✕</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  const langs: ('ckb' | 'badini' | 'ar' | 'en')[] = ['ckb', 'badini', 'ar', 'en'];
                  const nextIndex = (langs.indexOf(language) + 1) % langs.length;
                  setLanguage(langs[nextIndex]);
                }}
                style={styles.filterButton}
              >
                <Text style={styles.filterButtonText}>{language.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>

            {/* EVIRA SPECIAL OFFERS CAROUSEL BANNER */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerContent}>
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>1,000 IQD START</Text>
                </View>
                <Text style={styles.bannerHeadline}>Today's Special Drops</Text>
                <Text style={styles.bannerSubtext}>
                  100% Cash-on-Delivery with doorstep open box inspection.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    if (items.length > 0) setSelectedRoomItem(items[0]);
                  }}
                  style={styles.bannerCtaButton}
                >
                  <Text style={styles.bannerCtaText}>Bid Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bannerImageContainer}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
                  }}
                  style={styles.bannerImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* EVIRA 8 CATEGORIES GRID */}
            <View style={styles.categoriesSection}>
              <View style={styles.categoryGrid}>
                {EVIRA_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={styles.categoryItem}
                  >
                    <View
                      style={[
                        styles.categoryIconCircle,
                        selectedCategory === cat.id && styles.categoryIconCircleActive,
                      ]}
                    >
                      <Text style={styles.categoryIconText}>{cat.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === cat.id && styles.categoryLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SECTION HEADER: MOST POPULAR */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {language === 'ckb'
                  ? 'مزادە هەرە بەناوبانگەکان'
                  : language === 'badini'
                  ? 'مەزادێن هەرە بەربڵاڤ'
                  : language === 'ar'
                  ? 'المزادات الأكثر رواجاً'
                  : 'Live Drops'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* HORIZONTAL FILTER PILLS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {['all', 'gaming', 'smartphones', 'watches', 'computers', 'sneakers'].map(
                (filterKey) => (
                  <TouchableOpacity
                    key={filterKey}
                    onPress={() => setSelectedCategory(filterKey)}
                    style={[
                      styles.filterPill,
                      selectedCategory === filterKey && styles.filterPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        selectedCategory === filterKey && styles.filterPillTextActive,
                      ]}
                    >
                      {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            {/* EVIRA 2-COLUMN PRODUCT GRID */}
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No Matching Auctions</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your search or category filter.
                </Text>
              </View>
            ) : (
              <View style={styles.productGrid}>
                {filteredItems.map((item) => (
                  <AuctionCard
                    key={item.id}
                    item={item}
                    language={language}
                    onQuickBid={executeBid}
                    onPressCard={(it) => setSelectedRoomItem(it)}
                    onToggleSave={toggleSaveItem}
                    isSaved={savedIds.includes(item.id)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'bids' && (
          <MyBidsScreen
            session={session}
            items={items}
            onReBid={executeBid}
            onViewItem={(it) => setSelectedRoomItem(it)}
            onSignInRequired={() => setAuthModalVisible(true)}
            language={language}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistScreen
            savedIds={savedIds}
            items={items}
            onToggleSave={toggleSaveItem}
            onQuickBid={executeBid}
            onViewItem={(it) => setSelectedRoomItem(it)}
            language={language}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            session={session}
            onOpenAuth={() => setAuthModalVisible(true)}
            onOpenLocation={() => setLocationModalVisible(true)}
            language={language}
            onSelectLanguage={(lang) => setLanguage(lang)}
            onSessionCleared={() => {
              setSession(null);
              liveSocket.setUserId(null);
            }}
          />
        )}
      </View>

      {/* EVIRA-STYLE BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('feed')}
          style={styles.navItem}
        >
          <Text style={[styles.navIcon, activeTab === 'feed' && styles.navIconActive]}>
            {activeTab === 'feed' ? '◼' : '◻'}
          </Text>
          <Text style={[styles.navLabel, activeTab === 'feed' && styles.navLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('bids')}
          style={styles.navItem}
        >
          <Text style={[styles.navIcon, activeTab === 'bids' && styles.navIconActive]}>
            🏷️
          </Text>
          <Text style={[styles.navLabel, activeTab === 'bids' && styles.navLabelActive]}>
            My Bids
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('watchlist')}
          style={styles.navItem}
        >
          <Text style={[styles.navIcon, activeTab === 'watchlist' && styles.navIconActive]}>
            {activeTab === 'watchlist' ? '♥' : '♡'}
          </Text>
          <Text style={[styles.navLabel, activeTab === 'watchlist' && styles.navLabelActive]}>
            Wishlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('profile')}
          style={styles.navItem}
        >
          <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>
            👤
          </Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Auction Room Modal */}
      <LiveAuctionRoomModal
        visible={Boolean(selectedRoomItem)}
        item={selectedRoomItem}
        onClose={() => setSelectedRoomItem(null)}
        onPlaceBid={executeBid}
        language={language}
        isLeading={false}
      />

      {/* WhatsApp OTP Modal with Instant Demo Login */}
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

      {/* Doorstep Location Pin Modal */}
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
            `Doorstep delivery confirmed for ${loc.city}, ${loc.district}.`
          );
        }}
      />
    </SafeAreaView>
  );
}

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
  loadingText: {
    color: EviraTheme.colors.textSecondary,
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  eviraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: EviraTheme.colors.background,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greetingSubtext: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    fontWeight: '500',
  },
  greetingUsername: {
    fontSize: 16,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginTop: 1,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionIconText: {
    fontSize: 18,
    color: EviraTheme.colors.textPrimary,
  },
  actionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: EviraTheme.colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  actionBadgeText: {
    color: EviraTheme.colors.textWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
    backgroundColor: EviraTheme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.lg,
    paddingHorizontal: 14,
    height: 50,
    marginTop: 4,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: EviraTheme.colors.textPrimary,
    fontWeight: '500',
  },
  clearSearchIcon: {
    fontSize: 14,
    color: EviraTheme.colors.textTertiary,
    paddingHorizontal: 8,
  },
  filterButton: {
    backgroundColor: EviraTheme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 6,
  },
  filterButtonText: {
    color: EviraTheme.colors.textWhite,
    fontSize: 11,
    fontWeight: '800',
  },
  bannerCard: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xxl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  discountTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  discountTagText: {
    color: EviraTheme.colors.accentGold,
    fontSize: 10,
    fontWeight: '800',
  },
  bannerHeadline: {
    fontSize: 20,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 4,
  },
  bannerSubtext: {
    fontSize: 11,
    color: EviraTheme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 14,
  },
  bannerCtaButton: {
    backgroundColor: EviraTheme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: EviraTheme.radii.full,
    alignSelf: 'flex-start',
  },
  bannerCtaText: {
    color: EviraTheme.colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  bannerImageContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconCircleActive: {
    backgroundColor: EviraTheme.colors.primary,
  },
  categoryIconText: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: EviraTheme.colors.textPrimary,
    textAlign: 'center',
  },
  categoryLabelActive: {
    fontWeight: '800',
    color: EviraTheme.colors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: EviraTheme.colors.primary,
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: EviraTheme.radii.full,
    backgroundColor: EviraTheme.colors.background,
    borderWidth: 1.5,
    borderColor: EviraTheme.colors.border,
  },
  filterPillActive: {
    backgroundColor: EviraTheme.colors.primary,
    borderColor: EviraTheme.colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
  },
  filterPillTextActive: {
    color: EviraTheme.colors.textWhite,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: EviraTheme.colors.background,
    borderTopWidth: 1,
    borderTopColor: EviraTheme.colors.borderLight,
    paddingBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 18,
    color: EviraTheme.colors.textTertiary,
    marginBottom: 2,
  },
  navIconActive: {
    color: EviraTheme.colors.primary,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: EviraTheme.colors.textTertiary,
  },
  navLabelActive: {
    color: EviraTheme.colors.primary,
    fontWeight: '800',
  },
});
