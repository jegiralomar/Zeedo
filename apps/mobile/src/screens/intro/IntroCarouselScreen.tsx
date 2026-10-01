import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  Gavel,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Globe,
  Check,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { LanguageCode } from '../../types';

const { width, height } = Dimensions.get('window');

interface IntroSlide {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  titleAr: string;
  titleCkb: string;
  titleBadini: string;
  titleEn: string;
  subAr: string;
  subCkb: string;
  subBadini: string;
  subEn: string;
  tagAr: string;
  tagCkb: string;
  tagBadini: string;
  tagEn: string;
}

const SLIDES: IntroSlide[] = [
  {
    id: 'live_auctions',
    icon: <Gavel size={56} color="#FFFFFF" />,
    iconBg: '#F83758',
    tagAr: 'المزايدة التفاعلية',
    tagCkb: 'موزایەدەی ڕاستەوخۆ',
    tagBadini: 'مزایدێ ئێکسەر',
    tagEn: 'Interactive Bidding',
    titleAr: 'مزادات حية تبدأ من 1,000 د.ع',
    titleCkb: 'موزایەدەی ڕاستەوخۆ دەست پێدەکات لە 1,000 د.ع',
    titleBadini: 'مزایدێن ئێکسەر دەست پێدکەن ژ 1,000 د.ع',
    titleEn: 'Live Auctions Starting at 1,000 IQD',
    subAr: 'تنافس لحظة بلحظة على أحدث الإلكترونيات والساعات الفاخرة والأجهزة بأسعار شفافة ومضمونة.',
    subCkb: 'بەشدار بە لە کێبڕکێی ڕاستەوخۆ لەسەر باشترین کەلوپەلەکان بە نرخێکی شەفاف و مسۆگەر.',
    subBadini: 'پشکداریێ د کێبڕکێیا ئێکسەر دا بکە لسەر باشترین کاڵایان ب بهایەکێ ڕوون و باوەرپێکری.',
    subEn: 'Compete in real-time for authentic electronics, luxury watches, and devices with transparent bidding.',
  },
  {
    id: 'doorstep_inspection',
    icon: <ShieldCheck size={56} color="#FFFFFF" />,
    iconBg: '#10B981',
    tagAr: 'حق الفحص الكامل',
    tagCkb: 'مافی پشکنینی تەواو',
    tagBadini: 'مافێ پشکنینێ',
    tagEn: 'Inspection Guarantee',
    titleAr: 'افحص عند الباب قبل أن تدفع ديناراً واحداً',
    titleCkb: 'پشکنین لە بەر دەرگا پێش ئەوەی یەک دینار بدەیت',
    titleBadini: 'پشکنین ل بەر دەرگەهی بەری پارەدانێ',
    titleEn: 'Inspect at Your Door Before Paying a Dinar',
    subAr: 'لك كامل الحق في فتح الطرد وتشغيل وفحص السلعة أمام مندوب التوصيل في منزلك قبل تسليم أي مبلغ.',
    subCkb: 'تەواوی مافی خۆتە پاکەتەکە بکەیتەوە و پشکنین بۆ کاڵاکە بکەیت پێش ئەوەی پارەکە بدەیت.',
    subBadini: 'مافێ تە یێ تەمامە پاکێتێ ڤەکەی و کاڵای بپشکنی ل بەر دەستێ مەندوبی بەری پارەی بدەی.',
    subEn: 'You have the complete right to open and test the item with the courier at your doorstep before paying cash.',
  },
  {
    id: 'all_iraq_cod',
    icon: <Truck size={56} color="#FFFFFF" />,
    iconBg: '#3B82F6',
    tagAr: 'توصيل لكافة المحافظات',
    tagCkb: 'گەیاندن بۆ هەموو پارێزگاکان',
    tagBadini: 'گەهاندن بۆ هەمی پارێزگەهان',
    tagEn: 'All-Iraq Delivery',
    titleAr: 'شحن سريع ودفع نقداً عند الاستلام',
    titleCkb: 'گەیاندنی خێرا و پارەدان لە کاتی وەرگرتن',
    titleBadini: 'گەهاندنا لەز و پارەدان دەمێ وەرگرتنێ',
    titleEn: 'Fast Shipping & Doorstep Cash on Delivery',
    subAr: 'من بغداد وأربيل إلى البصرة، نصلك إلى عنوانك مع كبرى شركات الشحن الموثوقة وبأمان تام.',
    subCkb: 'لە بەغدا و هەولێرەوە تا بەسڕە، دەگەینە ناونیشانەکەت بە بەرزترین ئاستی پارێزراوی.',
    subBadini: 'ژ بەغدا و هەولێرێ تا بەسرا، دگەهینە ناڤونیشانێ تە ب بلندترین باوەری و لەزاتی.',
    subEn: 'From Baghdad and Erbil to Basra, fast and insured delivery right to your home across all 18 governorates.',
  },
];

export const IntroCarouselScreen: React.FC = () => {
  const { language, setLanguage, completeIntro } = useAppStore();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isRtl = language !== 'en';

  const languagesList: { code: LanguageCode; name: string; region: string }[] = [
    { code: 'ar', name: 'العربية', region: 'العراق (بغداد، البصرة، النجف...)' },
    { code: 'ckb', name: 'کوردی (سۆرانی)', region: 'کوردستان (هەولێر، سلێمانی)' },
    { code: 'badini', name: 'کوردی (بادینی)', region: 'کوردستان (دهۆک، زاخۆ)' },
    { code: 'en', name: 'English', region: 'International Edition' },
  ];

  // Handle language selection
  const handleSelectLanguage = (langCode: LanguageCode) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(slideIndex);
  };

  // STEP 0: Language Choosing Screen
  if (!selectedLanguage) {
    return (
      <View style={styles.langContainer}>
        {/* Brand Header */}
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>Z</Text>
          </View>
          <Text style={styles.brandName}>ZEEDO</Text>
          <View style={styles.liveTag}>
            <View style={styles.livePulse} />
            <Text style={styles.liveTagText}>LIVE AUCTIONS</Text>
          </View>
          <Text style={styles.heroTitle}>منصة المزادات الحية الأولى في العراق</Text>
          <Text style={styles.heroSub}>اختر لغتك المفضلة للمتابعة / زمانێ خۆ هەڵبژێرە</Text>
        </View>

        {/* 4 Dialect Cards */}
        <View style={styles.langList}>
          {languagesList.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={styles.langCard}
              onPress={() => handleSelectLanguage(item.code)}
              activeOpacity={0.85}
            >
              <View style={styles.langCardLeft}>
                <View style={styles.globeCircle}>
                  <Globe size={18} color={AppTheme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.langName}>{item.name}</Text>
                  <Text style={styles.langRegion}>{item.region}</Text>
                </View>
              </View>
              <View style={styles.arrowCircle}>
                <ArrowRight size={16} color={AppTheme.colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.guaranteeFootnote}>
          حق المعاينة والفحص عند الباب مضمون 100% لكافة المشترين في العراق
        </Text>
      </View>
    );
  }

  // STEP 1-3: Value Proposition Carousel (Swipe & Dots Only)
  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => {
          const title =
            language === 'ar'
              ? slide.titleAr
              : language === 'ckb'
              ? slide.titleCkb
              : language === 'badini'
              ? slide.titleBadini
              : slide.titleEn;

          const sub =
            language === 'ar'
              ? slide.subAr
              : language === 'ckb'
              ? slide.subCkb
              : language === 'badini'
              ? slide.subBadini
              : slide.subEn;

          const tag =
            language === 'ar'
              ? slide.tagAr
              : language === 'ckb'
              ? slide.tagCkb
              : language === 'badini'
              ? slide.tagBadini
              : slide.tagEn;

          return (
            <View key={slide.id} style={styles.slide}>
              {/* Illustration Hero */}
              <View style={styles.iconWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}>
                  {slide.icon}
                </View>
                <View style={styles.tagBadge}>
                  <Sparkles size={12} color="#D97706" />
                  <Text style={styles.tagBadgeText}>{tag}</Text>
                </View>
              </View>

              {/* Text Content */}
              <View style={styles.slideContent}>
                <Text style={[styles.slideTitle, isRtl && styles.textRtl]}>{title}</Text>
                <Text style={[styles.slideSub, isRtl && styles.textRtl]}>{sub}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Area: Dots & Start Button (Only on final slide) */}
      <View style={styles.bottomArea}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeSlide === idx && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Start Button appears on the final slide */}
        {activeSlide === SLIDES.length - 1 ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={completeIntro}
            activeOpacity={0.88}
          >
            <Text style={styles.startButtonText}>
              {language === 'ar'
                ? 'ابدأ المزايدة الآن 🚀'
                : language === 'ckb'
                ? 'دەست پێبکە ئێستا 🚀'
                : language === 'badini'
                ? 'دەست پێبکە نوکە 🚀'
                : 'Start Bidding Now 🚀'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.swipeHintRow}>
            <Text style={styles.swipeHintText}>
              {isRtl ? 'اسحب لمتابعة المميزات ←' : 'Swipe to continue →'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  langContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  langList: {
    gap: 12,
    marginBottom: 24,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  globeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  langRegion: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeFootnote: {
    fontSize: 11,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  slideContent: {
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  slideSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  textRtl: {
    textAlign: 'center',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppTheme.colors.primary,
  },
  startButton: {
    width: '100%',
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  swipeHintRow: {
    height: 48,
    justifyContent: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
