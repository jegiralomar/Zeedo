import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ChevronRight, ExternalLink, Zap } from 'lucide-react-native';
import { ZEEDO_CONFIG } from '../config/api';
import { LanguageCode } from '../types';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const BANNER_HEIGHT = 160;

export interface CmsBanner {
  id: string;
  titleAr: string;
  titleEn: string;
  titleCkb?: string;
  titleBadini?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  subtitleCkb?: string;
  subtitleBadini?: string;
  imageUrl: string;
  tapAction: 'auction' | 'category' | 'url' | 'none';
  actionTarget?: string;
  position?: string;
}

const FALLBACK_BANNERS: CmsBanner[] = [
  {
    id: 'ban-fb-1',
    titleAr: 'مزادات حية يومية بأسعار تبدأ من 1,000 د.ع',
    titleEn: 'Live Daily Auctions Starting at 1,000 IQD',
    titleCkb: 'مزایەدەی ڕۆژانەی زیندوو بە کەمترین نرخ',
    titleBadini: 'مزایدێت ڕۆژانە یێت زندی ب کێمترین بپا',
    subtitleAr: 'زايد الآن وادفع عند الاستلام مع ضمان الفحص بالباب',
    subtitleEn: 'Bid now, pay cash on delivery with doorstep inspection',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    tapAction: 'category',
    actionTarget: 'electronics',
  },
  {
    id: 'ban-fb-2',
    titleAr: 'توصيل موثوق لكافة محافظات العراق وكردستان',
    titleEn: 'Express COD Across All Iraq & Kurdistan',
    titleCkb: 'گەیاندنی خێرا بۆ هەموو پارێزگاکانی عێراق و کوردستان',
    titleBadini: 'گەهاندنا لەز بۆ هەمی پارێزگەهێن عیراق و کوردستانێ',
    subtitleAr: 'شحن سريع ومضمون والدفع فقط بعد معاينة طلبك',
    subtitleEn: 'Pay only after unboxing and inspecting your lot',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    tapAction: 'none',
    actionTarget: '',
  },
];

interface BannerCarouselProps {
  language: LanguageCode;
  onSelectAuction?: (auctionId: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  language,
  onSelectAuction,
  onSelectCategory,
}) => {
  const isRtl = language !== 'en';
  const [banners, setBanners] = useState<CmsBanner[]>(FALLBACK_BANNERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch banners from CMS API
  useEffect(() => {
    let isCancelled = false;
    const fetchBanners = async () => {
      try {
        const res = await fetch(ZEEDO_CONFIG.ENDPOINTS.CMS_BANNERS);
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch {
        // Keep fallback banners
      }
    };

    fetchBanners();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * (BANNER_WIDTH + 12),
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (BANNER_WIDTH + 12));
    if (index !== activeIndex && index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  const getLocalizedTitle = (b: CmsBanner) => {
    if (language === 'ar') return b.titleAr || b.titleEn;
    if (language === 'ckb') return b.titleCkb || b.titleAr || b.titleEn;
    if (language === 'badini') return b.titleBadini || b.titleAr || b.titleEn;
    return b.titleEn || b.titleAr;
  };

  const getLocalizedSubtitle = (b: CmsBanner) => {
    if (language === 'ar') return b.subtitleAr || b.subtitleEn || '';
    if (language === 'ckb') return b.subtitleCkb || b.subtitleAr || b.subtitleEn || '';
    if (language === 'badini') return b.subtitleBadini || b.subtitleAr || b.subtitleEn || '';
    return b.subtitleEn || b.subtitleAr || '';
  };

  const handleBannerPress = (banner: CmsBanner) => {
    if (banner.tapAction === 'auction' && banner.actionTarget) {
      onSelectAuction?.(banner.actionTarget);
    } else if (banner.tapAction === 'category' && banner.actionTarget) {
      onSelectCategory?.(banner.actionTarget.toLowerCase());
    } else if (banner.tapAction === 'url' && banner.actionTarget) {
      Linking.openURL(banner.actionTarget).catch(() => {});
    }
  };

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + 12}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isRtl && styles.scrollContentRtl]}
        onMomentumScrollEnd={handleScroll}
      >
        {banners.map((banner, index) => {
          const title = getLocalizedTitle(banner);
          const subtitle = getLocalizedSubtitle(banner);

          return (
            <TouchableOpacity
              key={banner.id || index}
              activeOpacity={0.92}
              onPress={() => handleBannerPress(banner)}
              style={styles.bannerCard}
            >
              <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
              {/* Gradient Dark Overlay */}
              <View style={styles.bannerOverlay}>
                <View style={styles.tagRow}>
                  <View style={styles.featuredBadge}>
                    <Zap size={11} color="#B4F105" />
                    <Text style={styles.featuredText}>
                      {isRtl ? 'عرض مميز' : 'FEATURED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.textContainer}>
                  <Text style={[styles.bannerTitle, isRtl && styles.textRtl]} numberOfLines={2}>
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text style={[styles.bannerSubtitle, isRtl && styles.textRtl]} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>

                {banner.tapAction !== 'none' && (
                  <View style={[styles.actionPrompt, isRtl && styles.actionPromptRtl]}>
                    <Text style={styles.actionPromptText}>
                      {banner.tapAction === 'category'
                        ? (isRtl ? 'تصفح القسم' : 'Explore Category')
                        : banner.tapAction === 'auction'
                        ? (isRtl ? 'دخول المزاد' : 'Join Auction')
                        : (isRtl ? 'زيارة الرابط' : 'Open Link')}
                    </Text>
                    {isRtl ? (
                      <ChevronRight size={13} color="#B4F105" style={{ transform: [{ rotate: '180deg' }] }} />
                    ) : (
                      <ChevronRight size={13} color="#B4F105" />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.dotsRow}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  scrollContentRtl: {
    flexDirection: 'row',
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#072F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 28, 18, 0.65)',
    padding: 16,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(180, 241, 5, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(180, 241, 5, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featuredText: {
    color: '#B4F105',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  bannerSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  textRtl: {
    textAlign: 'right',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  actionPromptRtl: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  actionPromptText: {
    color: '#B4F105',
    fontSize: 11,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#072F1F',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
});
