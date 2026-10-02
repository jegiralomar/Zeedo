import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Heart, ShieldCheck, MapPin, Gavel, Sparkles, WifiOff } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { MobileAuctionItem } from '../../types';
import { BannerCarousel } from '../../components/BannerCarousel';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export const HomeScreen: React.FC = () => {
  const {
    language,
    auctions,
    fetchAuctions,
    isLoadingAuctions,
    auctionsFetchError,
    setSelectedAuctionId,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    watchlistIds,
    toggleWatchlist,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  // Live countdown ticker simulator
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format remaining time for an auction
  const formatCountdown = (endsAt: string) => {
    const totalMs = new Date(endsAt).getTime() - Date.now();
    if (totalMs <= 0) return isRtl ? 'منتهي' : 'Ended';
    const totalSecs = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const categories = [
    { id: 'all', name: t.categories, icon: '⚡' },
    { id: 'electronics', name: t.electronics, icon: '📱' },
    { id: 'watches', name: language === 'en' ? 'Watches' : 'ساعات ومجوهرات', icon: '⌚' },
    { id: 'fashion', name: t.fashion, icon: '👟' },
    { id: 'motors', name: language === 'en' ? 'Motors' : 'سيارات ومحركات', icon: '🚗' },
  ];

  // Filter auctions by category and search
  const filteredAuctions = auctions.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.titleAr && a.titleAr.includes(q)) ||
      a.category.toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoadingAuctions}
          onRefresh={fetchAuctions}
          tintColor={AppTheme.colors.primary}
        />
      }
    >
      {/* 1. Doorstep Inspection Guarantee Banner */}
      <View style={styles.guaranteeBanner}>
        <View style={styles.guaranteeRow}>
          <ShieldCheck size={18} color="#10B981" />
          <Text style={styles.guaranteeText}>
            {isRtl
              ? 'ضمان زيدو: افحص السلعة عند الباب قبل دفع دينار واحد لمندوب التوصيل'
              : 'Zeedo Guarantee: Inspect at your doorstep before paying COD'}
          </Text>
        </View>
      </View>

      {/* 2. Marketing & Promotional CMS Banners Carousel */}
      <BannerCarousel
        language={language}
        onSelectAuction={(auctionId) => setSelectedAuctionId(auctionId)}
        onSelectCategory={(categoryId) => setSelectedCategory(categoryId)}
      />

      {/* 3. Category Filter Pills */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoriesScroll, isRtl && styles.categoriesScrollRtl]}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Section Title Bar */}
      <View style={[styles.sectionHeader, isRtl && styles.sectionHeaderRtl]}>
        <View style={styles.titleWithBadge}>
          <View style={styles.livePulseDot} />
          <Text style={styles.sectionTitle}>{t.liveAuctions}</Text>
        </View>
        <Text style={styles.resultsCount}>
          {filteredAuctions.length} {isRtl ? 'مزاد نشط' : 'active lots'}
        </Text>
      </View>

      {/* 4. High-Urgency 2-Column Live Auction Grid */}
      {auctionsFetchError && auctions.length === 0 ? (
        <View style={styles.errorContainer}>
          <WifiOff size={40} color="#94A3B8" />
          <Text style={styles.errorTitle}>
            {isRtl ? 'تعذر تحميل المزادات' : 'Could not load auctions'}
          </Text>
          <Text style={styles.errorSub}>
            {isRtl ? 'تحقق من اتصالك بالإنترنت' : 'Check your internet connection'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAuctions} activeOpacity={0.8}>
            <Text style={styles.retryText}>{isRtl ? 'إعادة المحاولة' : 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <View style={styles.gridContainer}>
        {filteredAuctions.map((item) => {
          const isWatched = watchlistIds.includes(item.id);
          const countdown = formatCountdown(item.endsAt);
          const isEnded = countdown === 'Ended' || countdown === 'منتهي';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => setSelectedAuctionId(item.id)}
              activeOpacity={0.88}
            >
              {/* Product Image & Overlays */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.images[0] }} style={styles.cardImage} />

                {/* Live Countdown Glass Pill */}
                <View style={[styles.countdownPill, isEnded && styles.countdownPillEnded]}>
                  <View style={[styles.timerDot, isEnded && styles.timerDotEnded]} />
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>

                {/* Heart Button */}
                <TouchableOpacity
                  style={[styles.heartButton, isWatched && styles.heartButtonActive]}
                  onPress={() => toggleWatchlist(item.id)}
                  activeOpacity={0.8}
                >
                  <Heart
                    size={16}
                    color={isWatched ? '#F83758' : '#FFFFFF'}
                    fill={isWatched ? '#F83758' : 'none'}
                  />
                </TouchableOpacity>

                {/* Location Badge */}
                {item.sellerCity && (
                  <View style={styles.cityBadge}>
                    <MapPin size={10} color="#FFFFFF" />
                    <Text style={styles.cityText} numberOfLines={1}>
                      {item.sellerCity}
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <Text
                  style={[styles.cardTitle, isRtl && styles.cardTitleRtl]}
                  numberOfLines={2}
                >
                  {isRtl && item.titleAr ? item.titleAr : item.title}
                </Text>

                {/* Bid Information */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{t.currentBid}</Text>
                  <Text style={styles.priceValue}>
                    {item.currentBidIqd.toLocaleString()} {t.currency}
                  </Text>
                </View>

                {/* Card Footer: Bids Count & Tap Indicator */}
                <View style={styles.cardFooter}>
                  <View style={styles.bidsBadge}>
                    <Gavel size={11} color="#64748B" />
                    <Text style={styles.bidsBadgeText}>
                      {item.bidsCount} {isRtl ? 'مزايدة' : 'bids'}
                    </Text>
                  </View>
                  <View style={styles.viewRoomPill}>
                    <Text style={styles.viewRoomText}>
                      {isRtl ? 'المزاد' : 'Room'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      )}

      {/* Empty State */}
      {filteredAuctions.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Gavel size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyStateTitle}>
            {auctions.length === 0
              ? (isRtl ? 'لا توجد مزادات نشطة حالياً' : 'No Live Auctions Active')
              : (isRtl ? 'لا توجد مزادات في هذه الفئة' : 'No auctions found in this category')}
          </Text>
          <Text style={styles.emptyStateSub}>
            {auctions.length === 0
              ? (isRtl
                ? 'يتم إطلاق صفقات ومزادات جديدة دورياً لكافة محافظات العراق. اسحب الشاشة للأسفل للتحديث أو اضغط الزر أدناه.'
                : 'New live auctions are listed regularly across Iraq. Pull down or tap below to refresh.')
              : (isRtl
                ? 'جرّب البحث عن كلمة أخرى أو تصفح كل الفئات المتاحة'
                : 'Try searching for something else or explore all categories')}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              if (auctions.length === 0) {
                fetchAuctions();
              } else {
                setSelectedCategory('all');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.resetButtonText}>
              {auctions.length === 0
                ? (isRtl ? 'تحديث المزادات الحية 🔄' : 'Refresh Live Auctions 🔄')
                : (isRtl ? 'عرض كل المزادات' : 'View all auctions')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Spacer for Floating Nav */}
      <View style={{ height: 96 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  guaranteeBanner: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    lineHeight: 18,
  },
  categoriesSection: {
    paddingVertical: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoriesScrollRtl: {
    flexDirection: 'row-reverse',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionHeaderRtl: {
    flexDirection: 'row-reverse',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 1.05,
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  countdownPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  countdownPillEnded: {
    backgroundColor: 'rgba(100, 116, 139, 0.85)',
  },
  timerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  timerDotEnded: {
    backgroundColor: '#94A3B8',
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  cityBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  cityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
    minHeight: 36,
  },
  cardTitleRtl: {
    textAlign: 'right',
  },
  priceRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bidsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  viewRoomPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  viewRoomText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  errorSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
