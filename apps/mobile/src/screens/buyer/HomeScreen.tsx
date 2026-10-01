import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Clock, ArrowRight, Star, ShieldCheck, Flame, ChevronRight } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { MobileAuctionItem } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export const HomeScreen: React.FC = () => {
  const { language, auctions, setSelectedAuctionId, placeBid, searchQuery } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  // Live countdown ticker simulator
  const [timeLeft, setTimeLeft] = useState('02h 45m 12s');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const h = String(23 - now.getHours()).padStart(2, '0');
      const m = String(59 - now.getMinutes()).padStart(2, '0');
      const s = String(59 - now.getSeconds()).padStart(2, '0');
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter auctions by search query
  const filteredAuctions = auctions.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.titleAr && a.titleAr.includes(q)) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const categories = [
    { id: 'all', name: t.categories, icon: '🔥', color: AppTheme.colors.primaryLight },
    { id: 'electronics', name: t.electronics, icon: '📱', color: AppTheme.colors.catTech },
    { id: 'mens', name: t.mens, icon: '⌚', color: AppTheme.colors.catMens },
    { id: 'fashion', name: t.fashion, icon: '👟', color: AppTheme.colors.catFashion },
    { id: 'beauty', name: t.beauty, icon: '💎', color: AppTheme.colors.catBeauty },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Category Circles (Matching Home page.jpg) */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoriesScroll, isRtl && styles.categoriesScrollRtl]}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              activeOpacity={0.8}
            >
              <View style={[styles.categoryCircle, { backgroundColor: cat.color }]}>
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 2. Hero Promotional Banner Carousel (Matching Home page.jpg) */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroBadge}>50-40% OFF</Text>
          <Text style={styles.heroHeadline}>
            {isRtl ? 'مزادات حية بأسعار تبدأ من 1,000 د.ع' : 'Live Doorstep COD Auctions'}
          </Text>
          <Text style={styles.heroSub}>
            {isRtl ? 'معاينة وفحص السلعة عند الباب قبل الدفع' : 'Inspect before you pay the courier'}
          </Text>

          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => setSelectedAuctionId(auctions[0]?.id || null)}
            activeOpacity={0.85}
          >
            <Text style={styles.heroCtaText}>{t.bidNow}</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
          }}
          style={styles.heroImage}
        />
      </View>

      {/* 3. Deal of the Day (Blue Banner from Home page.jpg) */}
      <View style={styles.dealSection}>
        <View style={[styles.dealBar, isRtl && styles.dealBarRtl]}>
          <View style={styles.dealInfo}>
            <Text style={styles.dealTitle}>{t.dealOfTheDay}</Text>
            <View style={styles.dealTimer}>
              <Clock size={12} color="#FFFFFF" />
              <Text style={styles.dealTimerText}>{timeLeft} {t.hoursRemaining}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.dealViewAll} activeOpacity={0.8}>
            <Text style={styles.dealViewAllText}>{t.viewAll}</Text>
            <ArrowRight size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 2-Column Auction Cards Grid */}
        <View style={styles.gridContainer}>
          {filteredAuctions.slice(0, 2).map((item) => (
            <AuctionCard key={item.id} item={item} />
          ))}
        </View>
      </View>

      {/* 4. Special COD Guarantee Banner */}
      <View style={styles.codBanner}>
        <ShieldCheck size={28} color={AppTheme.colors.green} />
        <View style={styles.codBannerContent}>
          <Text style={styles.codBannerTitle}>
            {isRtl ? 'ضمان زيدو: افحص السلعة قبل دفع الدينار' : '100% COD Inspection Guarantee'}
          </Text>
          <Text style={styles.codBannerSub}>
            {isRtl ? 'لك كامل الحق في فتح الصندوق والتجربة عند الباب' : 'Open the parcel & test before paying'}
          </Text>
        </View>
      </View>

      {/* 5. Trending Products (Coral/Pink Banner from Home page.jpg) */}
      <View style={styles.trendingSection}>
        <View style={[styles.trendingBar, isRtl && styles.trendingBarRtl]}>
          <View>
            <Text style={styles.trendingTitle}>{t.trendingProducts}</Text>
            <Text style={styles.trendingSub}>
              {isRtl ? 'أقوى المزايدات نشاطاً في بغداد وأربيل' : 'High competition live rooms'}
            </Text>
          </View>

          <TouchableOpacity style={styles.dealViewAll} activeOpacity={0.8}>
            <Text style={styles.dealViewAllText}>{t.viewAll}</Text>
            <ArrowRight size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 2-Column Auction Cards Grid */}
        <View style={styles.gridContainer}>
          {filteredAuctions.slice(2).map((item) => (
            <AuctionCard key={item.id} item={item} />
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Sub-component: 2-Column Auction Card (Matches Home page.jpg)
const AuctionCard: React.FC<{ item: MobileAuctionItem }> = ({ item }) => {
  const { language, setSelectedAuctionId, placeBid } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const title = isRtl && item.titleAr ? item.titleAr : item.title;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedAuctionId(item.id)}
      activeOpacity={0.9}
    >
      {/* Product Image */}
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} />

        {/* Live Pulse Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>

        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-45%</Text>
        </View>
      </View>

      {/* Card Details */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, isRtl && styles.textRtl]} numberOfLines={2}>
          {title}
        </Text>

        <Text style={[styles.cardSeller, isRtl && styles.textRtl]} numberOfLines={1}>
          {item.sellerName} • {item.sellerCity}
        </Text>

        {/* Pricing */}
        <View style={[styles.priceRow, isRtl && styles.priceRowRtl]}>
          <Text style={styles.bidPrice}>
            {item.currentBidIqd.toLocaleString()} د.ع
          </Text>
          <Text style={styles.retailPrice}>
            ${item.retailPriceUsd}
          </Text>
        </View>

        {/* Star Rating */}
        <View style={[styles.ratingRow, isRtl && styles.ratingRowRtl]}>
          <Star size={12} color={AppTheme.colors.star} fill={AppTheme.colors.star} />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>

        {/* 1-Tap Fast Bid Button */}
        <TouchableOpacity
          style={styles.bidButton}
          onPress={(e) => {
            e.stopPropagation?.();
            placeBid(item.id, item.currentBidIqd + item.incrementStepIqd);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.bidButtonText}>{t.bidNow}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.canvas,
  },
  categoriesSection: {
    paddingVertical: 12,
    backgroundColor: AppTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoriesScrollRtl: {
    flexDirection: 'row-reverse',
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.colors.textPrimary,
    textAlign: 'center',
  },
  heroBanner: {
    margin: 16,
    borderRadius: AppTheme.radius.lg,
    backgroundColor: AppTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 16,
  },
  heroContent: {
    flex: 1,
    paddingRight: 8,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFE4E8',
    marginBottom: 4,
  },
  heroHeadline: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 11,
    color: '#FFD3DC',
    marginBottom: 12,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF22',
    borderWidth: 1,
    borderColor: '#FFFFFF66',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: AppTheme.radius.md,
  },
  dealSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dealBar: {
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealBarRtl: {
    flexDirection: 'row-reverse',
  },
  dealInfo: {
    flexDirection: 'column',
  },
  dealTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  dealTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dealTimerText: {
    color: '#FFFFFFCC',
    fontSize: 11,
    fontWeight: '600',
  },
  dealViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF88',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.sm,
  },
  dealViewAllText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: AppTheme.colors.surface,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: AppTheme.radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: AppTheme.colors.primary,
  },
  liveBadgeText: {
    color: AppTheme.colors.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    lineHeight: 16,
    marginBottom: 2,
  },
  cardSeller: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  priceRowRtl: {
    flexDirection: 'row-reverse',
  },
  bidPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  retailPrice: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  ratingRowRtl: {
    flexDirection: 'row-reverse',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  reviewCount: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
  },
  bidButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.sm,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  codBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: AppTheme.colors.greenLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: AppTheme.radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codBannerContent: {
    flex: 1,
  },
  codBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  codBannerSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  trendingSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  trendingBar: {
    backgroundColor: '#F83758',
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingBarRtl: {
    flexDirection: 'row-reverse',
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  trendingSub: {
    color: '#FFE4E8',
    fontSize: 10,
    marginTop: 1,
  },
  textRtl: {
    textAlign: 'right',
  },
});
