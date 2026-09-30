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
import { AppTheme } from './src/lib/theme';
import { API_BASE_URL } from './src/lib/config';

const SAMPLE_LIVE_DROPS: MobileAuctionItem[] = [
  {
    id: 'auc-demo-1',
    title: 'دايمال براند كار (BMW M240i Coupe)',
    category: 'cars',
    currentBid: 34500000,
    startingPrice: 1000,
    bidIncrement: 250000,
    endsAt: new Date(Date.now() + 14 * 60 * 1000 + 30 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
    totalBids: 84,
    condition: 'Brand New In Box',
    sellerName: 'عادل عدنان',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'auc-demo-2',
    title: 'فيلا قصر أربيل رويال (Erbil Landmark Villa)',
    category: 'building',
    currentBid: 145000000,
    startingPrice: 1000,
    bidIncrement: 1000000,
    endsAt: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80'],
    totalBids: 112,
    condition: 'Verified Title Deed',
    sellerName: 'عادل عدنان',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'auc-demo-3',
    title: 'Sony PlayStation 5 Pro Edition 2TB',
    category: 'gaming',
    currentBid: 420000,
    startingPrice: 1000,
    bidIncrement: 5000,
    endsAt: new Date(Date.now() + 6 * 60 * 1000 + 15 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80'],
    totalBids: 49,
    condition: 'Factory Sealed',
    sellerName: 'سارة الكردي',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'auc-demo-4',
    title: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
    category: 'home',
    currentBid: 890000,
    startingPrice: 1000,
    bidIncrement: 10000,
    endsAt: new Date(Date.now() + 42 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'],
    totalBids: 72,
    condition: 'Factory Sealed',
    sellerName: 'ريكان محمد',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'auc-demo-5',
    title: 'Rolex Submariner Date 41mm Oystersteel Ceramic',
    category: 'watches',
    currentBid: 14200000,
    startingPrice: 1000,
    bidIncrement: 50000,
    endsAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
    totalBids: 114,
    condition: 'Mint / Certificate',
    sellerName: 'عادل عدنان',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'auc-demo-6',
    title: 'Apple MacBook Pro 16" M3 Max 36GB / 1TB Space Black',
    category: 'gaming',
    currentBid: 2950000,
    startingPrice: 1000,
    bidIncrement: 25000,
    endsAt: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
    photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    totalBids: 88,
    condition: 'Factory Sealed',
    sellerName: 'كامران عثمان',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
];

// Soft neo-pastel category pills matching reference style
const CATEGORY_ITEMS = [
  { id: 'home', name: 'بيت', icon: '🔔', bg: AppTheme.colors.pastelPink, iconColor: AppTheme.colors.pastelPinkIcon },
  { id: 'building', name: 'بناء', icon: '🏢', bg: AppTheme.colors.pastelBlue, iconColor: AppTheme.colors.pastelBlueIcon },
  { id: 'gaming', name: 'لعب', icon: '🎮', bg: AppTheme.colors.pastelTeal, iconColor: AppTheme.colors.pastelTealIcon },
  { id: 'watches', name: 'ساعات', icon: '⌚', bg: AppTheme.colors.pastelPurple, iconColor: AppTheme.colors.pastelPurpleIcon },
  { id: 'cars', name: 'سيارات', icon: '🚗', bg: AppTheme.colors.pastelAmber, iconColor: AppTheme.colors.pastelAmberIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'bids' | 'watchlist' | 'profile'>('feed');
  const [session, setSession] = useState<MobileBuyerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<MobileAuctionItem[]>(SAMPLE_LIVE_DROPS);
  const [savedIds, setSavedIds] = useState<string[]>(['auc-demo-1', 'auc-demo-4']);
  const [selectedRoomItem, setSelectedRoomItem] = useState<MobileAuctionItem | null>(null);
  const [pendingBidItem, setPendingBidItem] = useState<MobileAuctionItem | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [language, setLanguage] = useState<'ckb' | 'badini' | 'ar' | 'en'>('ar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wsConnected, setWsConnected] = useState(false);

  const fetchLiveAuctions = useCallback(async () => {
    try {
      let res = await fetch(`${API_BASE_URL}/api/auctions/live`);
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/api/listings?status=live`);
      }
      if (!res.ok) throw new Error('Live auction feed unavailable');
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.listings || []);
      if (rawList.length > 0) {
        const listings: MobileAuctionItem[] = rawList.map((l: any) => ({
          id: l.id || `auc-${Math.random()}`,
          title: l.title || l.multilingual?.ar?.title || l.multilingual?.en?.title || l.name || 'Zeedo Auction Lot',
          category: l.category || 'general',
          currentBid: Number(l.currentBid || l.currentBidIqd || l.current_bid || l.startingPrice || 1000),
          startingPrice: Number(l.startingPrice || l.startingPriceIqd || 1000),
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
          sellerName: l.sellerName || 'عادل عدنان',
          sellerAvatar: l.sellerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        }));
        setItems(listings);
      } else {
        setItems(SAMPLE_LIVE_DROPS);
      }
    } catch {
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
    const unsubConn = liveSocket.onConnectionChange(setWsConnected);

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
          '🎉 مبروك! لقد فزت بالمزاد!',
          `فزت بهذا المزاد بمبلغ ${data.wonPriceIqd?.toLocaleString()} د.ع!\n\nرقم بوليصة الفحص والتسليم عند الباب: ${data.packageAwbId || 'جاري التجهيز'}`,
          [{ text: 'عرض المشتريات', onPress: () => setActiveTab('bids') }]
        );
      }
    });

    return () => {
      unsubConn();
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

    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, currentBid: nextAmount, totalBids: (it.totalBids || 0) + 1 }
            : it
        )
      );

      const res = await fetch(`${API_BASE_URL}/api/bids/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          auctionId: item.id,
          amountIqd: nextAmount,
          bidderId: session.user.id,
          bidderName: session.user.name,
          bidderPhone: session.user.phone,
          bidderCity: session.user.city || 'Baghdad',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Bid rejected by server');
      }

      liveSocket.sendBid(item.id, nextAmount);
    } catch (err: any) {
      Alert.alert('تنبيه المزايدة', err.message || 'تعذر تسجيل المزايدة حالياً.');
      fetchLiveAuctions();
    }
  };

  const toggleSaveItem = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLiveAuctions();
  }, [fetchLiveAuctions]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesCat =
        selectedCategory === 'all'
          ? true
          : it.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = searchQuery.trim()
        ? it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        <Text style={styles.loadingText}>جاري مزامنة البث المباشر والمزادات...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.background} />

      {/* TOP HEADER BAR (Hamburger on Left, Gavel Logo Center, Avatar Right) */}
      <View style={styles.topHeader}>
        {/* Left: Hamburger Menu Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setLocationModalVisible(true)}
          style={styles.menuIconButton}
        >
          <View style={styles.hamburgerLine} />
          <View style={[styles.hamburgerLine, { width: 14 }]} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>

        {/* Center: Royal Indigo Gavel Auction Logo & Real-Time Sync Indicator */}
        <View style={{ alignItems: 'center' }}>
          <View style={styles.gavelBadge}>
            <Text style={styles.gavelIcon}>⚖️</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: wsConnected ? '#10B981' : '#F59E0B' }} />
            <Text style={{ fontSize: 9, fontWeight: '700', color: wsConnected ? '#10B981' : '#F59E0B' }}>
              {wsConnected ? 'مباشر متصل' : 'جاري الاتصال'}
            </Text>
          </View>
        </View>

        {/* Right: User Avatar Photo */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('profile')}
          style={styles.avatarButton}
        >
          <Image
            source={{
              uri: session
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.mainContent}>
        {activeTab === 'feed' && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={AppTheme.colors.primary}
              />
            }
          >
            {/* HERO PROMOTIONAL BANNER CARD (Headline & 3D Parcel Box) */}
            <View style={styles.heroBannerCard}>
              <View style={styles.heroTextSection}>
                <Text style={styles.heroHeadline}>
                  کن المالك{'\n'}من هذه السيارة
                </Text>
                <Text style={styles.heroSubtext}>
                  مزادات مباشرة تبدأ من 1,000 د.ع مع فحص مجاني عند الباب.
                </Text>
              </View>

              <View style={styles.heroImageSection}>
                <Image
                  source={require('./assets/auction_box_banner.jpg')}
                  style={styles.heroBoxImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* SEARCH BAR & PURPLE FILTER BUTTON ROW */}
            <View style={styles.searchFilterRow}>
              {/* Filter Button (Soft Purple with Sliders Icon) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const langs: ('ar' | 'ckb' | 'badini' | 'en')[] = ['ar', 'ckb', 'badini', 'en'];
                  const nextIndex = (langs.indexOf(language) + 1) % langs.length;
                  setLanguage(langs[nextIndex]);
                }}
                style={styles.filterButton}
              >
                <Text style={styles.filterSlidersIcon}>🎚️</Text>
              </TouchableOpacity>

              {/* White Search Input Container with Right Magnifying Glass */}
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="عناصر البحث"
                  placeholderTextColor={AppTheme.colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <Text style={styles.searchIcon}>🔍</Text>
              </View>
            </View>

            {/* CATEGORIES SECTION ("التصنيفات") */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>التصنيفات</Text>
                {selectedCategory !== 'all' && (
                  <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                    <Text style={styles.clearFilterText}>عرض الكل</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORY_ITEMS.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)
                      }
                      style={[
                        styles.categoryCard,
                        { backgroundColor: cat.bg },
                        isSelected && styles.categoryCardSelected,
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryName,
                          { color: cat.iconColor },
                          isSelected && { fontWeight: '900' },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* LIVE STREAM SECTION ("البث المباشر") */}
            <View style={styles.liveSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>البث المباشر</Text>
                <View style={styles.livePillHeader}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillHeaderText}>
                    {filteredItems.length} مزاد نشط
                  </Text>
                </View>
              </View>

              {/* 2-Column Live Auction Grid */}
              {filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>لا توجد مزادات مطابقة</Text>
                  <Text style={styles.emptySub}>
                    يرجى تجربة البحث عن صنف آخر أو مسح التصفية.
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
            </View>
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

      {/* SIGNATURE CURVED BOTTOM NAVIGATION DOCK WITH CENTER FAB */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavDock}>
          {/* Tab 1: Home (Active Yellow Pill when active) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('feed')}
            style={styles.navTab}
          >
            {activeTab === 'feed' ? (
              <View style={styles.activeHomePill}>
                <Text style={styles.activeHomeIcon}>🏠</Text>
              </View>
            ) : (
              <Text style={styles.inactiveNavIcon}>🏠</Text>
            )}
          </TouchableOpacity>

          {/* Tab 2: Shopping Cart / My Bids */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('bids')}
            style={styles.navTab}
          >
            <Text
              style={[
                styles.inactiveNavIcon,
                activeTab === 'bids' && styles.activeNavIconBlue,
              ]}
            >
              🛒
            </Text>
          </TouchableOpacity>

          {/* Center Elevated Floating Action Button (FAB) */}
          <View style={styles.centerFabSlot}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                if (items.length > 0) setSelectedRoomItem(items[0]);
              }}
              style={styles.centerFabButton}
            >
              <Text style={styles.centerFabIcon}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* Tab 3: Wishlist Heart */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('watchlist')}
            style={styles.navTab}
          >
            <Text
              style={[
                styles.inactiveNavIcon,
                activeTab === 'watchlist' && styles.activeNavIconBlue,
              ]}
            >
              ♡
            </Text>
            {savedIds.length > 0 && <View style={styles.navDotBadge} />}
          </TouchableOpacity>

          {/* Tab 4: Profile / User */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('profile')}
            style={styles.navTab}
          >
            <Text
              style={[
                styles.inactiveNavIcon,
                activeTab === 'profile' && styles.activeNavIconBlue,
              ]}
            >
              👤
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* POPUP MODAL WINDOWS */}
      <LiveAuctionRoomModal
        visible={!!selectedRoomItem}
        item={selectedRoomItem}
        onClose={() => setSelectedRoomItem(null)}
        onPlaceBid={(it, inc) => executeBid(it, inc)}
        language={language}
      />

      <WhatsAppAuthModal
        visible={authModalVisible}
        onClose={() => {
          setAuthModalVisible(false);
          setPendingBidItem(null);
        }}
        onSuccess={(sess) => {
          setSession(sess);
          setAuthModalVisible(false);
          if (pendingBidItem) {
            executeBid(pendingBidItem);
            setPendingBidItem(null);
          }
        }}
        apiBaseUrl={API_BASE_URL}
      />

      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSaved={(loc) => {
          if (session) {
            const updated = {
              ...session,
              user: { ...session.user, city: loc.city },
            };
            setSession(updated);
            saveMobileSession(updated);
          }
          Alert.alert(
            'تم تأكيد العنوان',
            `عنوان التسليم: ${loc.city}، ${loc.district} (الدفع عند الاستلام مع فحص البضاعة).`
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  centerLoading: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontWeight: '700',
  },

  // TOP BAR (Hamburger, Gavel Logo, Avatar)
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: AppTheme.colors.background,
  },
  menuIconButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
  gavelBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gavelIcon: {
    fontSize: 22,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  // HERO BANNER CARD
  heroBannerCard: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  heroTextSection: {
    flex: 1.2,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '900',
    color: AppTheme.colors.primary,
    textAlign: 'right',
    lineHeight: 28,
    marginBottom: 6,
  },
  heroSubtext: {
    fontSize: 10.5,
    color: AppTheme.colors.textSecondary,
    textAlign: 'right',
    lineHeight: 15,
  },
  heroImageSection: {
    flex: 0.9,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBoxImage: {
    width: '100%',
    height: '100%',
  },

  // SEARCH & FILTER ROW
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSlidersIcon: {
    fontSize: 20,
  },
  searchInputContainer: {
    flex: 1,
    height: 48,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.textPrimary,
    textAlign: 'right',
    paddingRight: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: '#94A3B8',
  },

  // CATEGORIES SECTION
  categoriesSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.primary,
  },
  categoryScroll: {
    gap: 12,
    paddingRight: 4,
  },
  categoryCard: {
    width: 92,
    height: 96,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: AppTheme.colors.primary,
    transform: [{ scale: 1.04 }],
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '800',
  },

  // LIVE AUCTION SECTION
  liveSection: {
    marginBottom: 20,
  },
  livePillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.radii.full,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppTheme.colors.liveRed,
  },
  livePillHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppTheme.colors.liveRed,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
  },

  // SIGNATURE BOTTOM NAV WITH CENTER FAB
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNavDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 68,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#1E2235',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeHomePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppTheme.colors.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.accentYellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  activeHomeIcon: {
    fontSize: 20,
  },
  inactiveNavIcon: {
    fontSize: 22,
    color: '#94A3B8',
  },
  activeNavIconBlue: {
    color: AppTheme.colors.primary,
  },
  centerFabSlot: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  centerFabButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: AppTheme.colors.fabNavy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E2235',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  centerFabIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  navDotBadge: {
    position: 'absolute',
    top: 14,
    right: 22,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppTheme.colors.liveRed,
  },
});
