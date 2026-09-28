import { create } from 'zustand';
import { MobileAuctionItem, MultilingualContent } from '../types';
import { useAuthStore } from './useAuthStore';

interface AuctionStoreState {
  auctions: MobileAuctionItem[];
  myAutoBids: Record<string, number>; // auctionId -> ceiling IQD
  lastBidAlert: string | null;

  // Actions
  placeSlideBid: (auctionId: string, bidderName: string, bidderPhone: string) => boolean;
  setAutoBidCeiling: (auctionId: string, ceilingIqd: number) => void;
  savedAuctionIds: string[];
  toggleSaveAuction: (auctionId: string) => void;
  createSellerListing: (data: {
    sellerId: string;
    sellerName: string;
    category: string;
    condition: 'New' | 'Used' | 'New Open Box';
    imageUrl: string;
    estimatedRetailMarketPriceIqd: number;
    primaryTitle: string;
    primaryDescription: string;
    primarySpecs: string[];
    isAutonomousSeller: boolean;
    multilingual?: {
      en: MultilingualContent;
      ar: MultilingualContent;
      ckb: MultilingualContent;
      badini: MultilingualContent;
    };
  }) => MobileAuctionItem | null;
  clearLastBidAlert: () => void;
}

export const INITIAL_MOBILE_AUCTIONS: MobileAuctionItem[] = [
  {
    id: 'auc-801',
    sellerId: 'sel-merchant-01',
    sellerName: 'Erbil Mobile & Watch Studio',
    category: 'Smartphones',
    condition: 'New Open Box',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 236000,
    incrementStepIqd: 3000, // > 200k IQD tier
    estimatedRetailMarketPriceIqd: 1350000,
    multilingual: {
      en: {
        title: 'Google Pixel 8 Pro (128GB, Bay Blue, Pristine Condition)',
        description: 'Flagship Google device with Tensor G3 chip, AI camera features, and factory box.',
        specs: ['128GB Storage', 'Bay Blue Color', 'Factory Unlocked', 'Battery Health 100%'],
      },
      ar: {
        title: 'گوگل بکسل 8 برو (128 كیجابایت، أزرق سمائي، بحالة الوكالة)',
        description: 'هاتف جوجل الرائد مع معالج تنسور G3، كاميرات بالذكاء الاصطناعي وعلبة المصنع.',
        specs: ['ذاكرة 128 غيغابايت', 'اللون أزرق سماوي', 'مفتوح رسمي', 'بطارية 100%'],
      },
      ckb: {
        title: 'گووگڵ پیكسڵ 8 پرۆ (١٢٨ گێگابایت، شینی ئاسمانی، زۆر پاک)',
        description: 'مۆبایلی پێشەنگی گووگڵ بە چیپی تێنسەر G3، کامێرای ژیریی دەستکرد و کارتۆنی ئەسڵی.',
        specs: ['بیرگەی ١٢٨ گێگابایت', 'ڕەنگی شینی ئاسمانی', 'فەرمی و بێ کێشە', 'پاتری ١٠٠٪'],
      },
      badini: {
        title: 'گووگڵ پیكسڵ 8 پرۆ (١٢٨ گێگابایت، شینێ ئاسمانی، پاك وەک نوی)',
        description: 'ئامیرێ سەرەکیێ گووگڵ ب چیپێ تێنسەر G3، کامێرا ب ژیرییا دەستکرد و کارتۆنا فەرمی.',
        specs: ['بیرگە ١٢٨ گێگابایت', 'ڕەنگێ شینێ ئاسمانی', 'فەرمی بێ كێشە', 'پاتری ١٠٠٪'],
      },
    },
    submittedAt: '2026-09-28T14:00:00Z',
    auctionStartsAt: '2026-09-28T16:00:00Z',
    auctionEndsAt: new Date(Date.now() + 52 * 1000).toISOString(), // 52s remaining -> IN ANTI-SNIPING ZONE!
    status: 'live',
    isAntiSnipingActive: true,
    antiSnipingResetsCount: 2,
    totalBids: 48,
    highestBidder: {
      id: 'usr-104',
      name: 'Ahmed Kawa Othman',
      phone: '+964 750 331 4455',
    },
    bidsHistory: [
      { id: 'b-99', bidderId: 'usr-104', bidderName: 'Ahmed Kawa Othman', amountIqd: 236000, timestamp: '17:42:01' },
      { id: 'b-98', bidderId: 'usr-103', bidderName: 'Soran Othman', amountIqd: 233000, timestamp: '17:41:25' },
      { id: 'b-97', bidderId: 'usr-buyer-88', bidderName: 'Rebaz Farhad Salih', amountIqd: 230000, timestamp: '17:40:10' },
    ],
  },
  {
    id: 'auc-802',
    sellerId: 'sel-merchant-01',
    sellerName: 'Erbil Mobile & Watch Studio',
    category: 'Watches',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 94000,
    incrementStepIqd: 1000, // <= 100k IQD tier
    estimatedRetailMarketPriceIqd: 450000,
    multilingual: {
      en: {
        title: 'Tissot PRX Powermatic 80 (Automatic, Emerald Green Dial)',
        description: 'Swiss-made luxury sports watch with 80 hours power reserve and sapphire glass.',
        specs: ['Automatic Powermatic 80', 'Emerald Green Sunray Dial', 'Stainless Steel 316L', '100m Water Resistant'],
      },
      ar: {
        title: 'ساعة تيسو بي آر إكس باوماتيك 80 (أوتوماتيك، ميناء أخضر زمردي)',
        description: 'ساعة رياضية سويسرية فاخرة باحتياطي طاقة 80 ساعة وزجاج ياقوتي مقاوم للخدش.',
        specs: ['حركة أوتوماتيكية سويسرية', 'ميناء أخضر زمردي', 'فولاذ 316L مقاوم للصدأ', 'مقاومة ماء 100 متر'],
      },
      ckb: {
        title: 'کاتژمێری تیسۆ PRX پاوەرماتیک 80 (ئۆتۆماتیک، مینای سەوزی زەمرووتی)',
        description: 'کاتژمێری سویسڕی وەرزشی شاهانە بە پاشەکەوتی هێزی ٨٠ کاتژمێر و شوشەی سافایەر.',
        specs: ['مەکینەی ئۆتۆماتیکی سویسڕی', 'ڕەنگی سەوزی زەمرووتی', 'پۆڵای دژە ژەنگ 316L', 'بەرگری ئاو تا ١٠٠ مەتر'],
      },
      badini: {
        title: 'دەستژمێرێ تیسۆ PRX پاوەرماتیك 80 (ئۆتۆماتیك، ڕەنگێ كەسکێ زەمڕووتی)',
        description: 'دەستژمێرەکێ لوكسێ سویسڕی ب ٨٠ دەمژمێرین هێزا ئۆتۆماتیك و شویشێ سافایەر.',
        specs: ['مەکینەیا ئۆتۆماتیك یا سویسڕی', 'ڕەنگێ كەسكێ شوشەیی', 'پۆلایێ 316L دژی ژەنگێ', 'بەرگرییا ئاڤێ ١٠٠م'],
      },
    },
    submittedAt: '2026-09-28T13:30:00Z',
    auctionStartsAt: '2026-09-28T15:00:00Z',
    auctionEndsAt: new Date(Date.now() + 1840 * 1000).toISOString(),
    status: 'live',
    isAntiSnipingActive: false,
    antiSnipingResetsCount: 0,
    totalBids: 24,
    highestBidder: {
      id: 'usr-102',
      name: 'Zaid Mustafa Al-Kinani',
      phone: '+964 770 192 4433',
    },
    bidsHistory: [
      { id: 'b-52', bidderId: 'usr-102', bidderName: 'Zaid Mustafa Al-Kinani', amountIqd: 94000, timestamp: '17:15:02' },
      { id: 'b-51', bidderId: 'usr-buyer-88', bidderName: 'Rebaz Farhad Salih', amountIqd: 93000, timestamp: '17:10:14' },
    ],
  },
  {
    id: 'auc-803',
    sellerId: 'sel-merchant-01',
    sellerName: 'Erbil Mobile & Watch Studio',
    category: 'Gaming',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 142000,
    incrementStepIqd: 2000, // 100k - 200k IQD tier
    estimatedRetailMarketPriceIqd: 680000,
    multilingual: {
      en: {
        title: 'Sony PlayStation 5 Slim (1TB SSD, Disc Edition with DualSense)',
        description: 'Brand new in sealed box with Iraqi official dealer warranty slip.',
        specs: ['1TB Custom NVMe SSD', 'Ultra HD Blu-ray Drive', 'DualSense Haptic Controller', '4K 120Hz HDR'],
      },
      ar: {
        title: 'سوني بلايستيشن 5 سليم (1 تيرابايت، إصدار الأقراص مع ذراع دوال سينس)',
        description: 'جديد بكرتون المصنع مع وصل الضمان الرسمي من الوكيل المعتمد في العراق.',
        specs: ['قرص SSD سريع 1 تيرابايت', 'قارئ أقراص Ultra HD', 'ذراع تحكم دوال سينس', 'دعم 4K 120Hz'],
      },
      ckb: {
        title: 'پلەیستەیشن 5 سلیم (١ تێرابایت، دیسک ئێدیشن لەگەڵ دەسکی دوال سێنس)',
        description: 'تەواو نوێ لە کارتۆنی مۆرکراو بە گرەنتی فەرمی بریکاری باوەڕپێکراوی عێراق.',
        specs: ['بیرگەی خێرای ١ تێرابایت', 'خوێنەری دیسکی ئەلترا ئێچدی', 'دەسکی دوال سێنس', 'پشتیوانی 4K 120Hz'],
      },
      badini: {
        title: 'پلەیستەیشن 5 سلیم (١ تێرابایت، دیسک دگەل دەستكێ دوال سێنس)',
        description: 'ئێکجار نوی د کارتۆنێ کارگەهێ دا ب گەرەنتیا فەرمی یا بریکارێ عێراقێ.',
        specs: ['بیرگەیا بلەز یا ١ تێرابایت', 'خوینەرێ دیسکان یێ فەرمی', 'دەستكێ دوال سێنس', 'پشتیڤانییا 4K 120Hz'],
      },
    },
    submittedAt: '2026-09-28T12:00:00Z',
    auctionStartsAt: '2026-09-28T14:00:00Z',
    auctionEndsAt: new Date(Date.now() + 2900 * 1000).toISOString(),
    status: 'live',
    isAntiSnipingActive: false,
    antiSnipingResetsCount: 0,
    totalBids: 35,
    highestBidder: {
      id: 'usr-101',
      name: 'Karwan Ahmed Salih',
      phone: '+964 750 341 8821',
    },
    bidsHistory: [
      { id: 'b-77', bidderId: 'usr-101', bidderName: 'Karwan Ahmed Salih', amountIqd: 142000, timestamp: '16:55:12' },
      { id: 'b-76', bidderId: 'usr-103', bidderName: 'Soran Othman', amountIqd: 140000, timestamp: '16:50:30' },
    ],
  },
  {
    id: 'auc-804',
    sellerId: 'sel-merchant-01',
    sellerName: 'Erbil Mobile & Watch Studio',
    category: 'Computers',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 310000,
    incrementStepIqd: 3000,
    estimatedRetailMarketPriceIqd: 1480000,
    multilingual: {
      en: {
        title: 'Apple MacBook Air 13.6-inch (M2 Chip, 8GB Unified, 256GB SSD, Midnight)',
        description: 'Delivered auction won item. Doorstep Cash on Delivery completed via Al-Zajil Express.',
        specs: ['Apple M2 8-core CPU', '8GB Unified Memory', '256GB SSD', 'Liquid Retina Display'],
      },
      ar: {
        title: 'أبل ماك بوك إير 13.6 إنش (معالج M2، ذاكرة 8GB، سعة 256GB، أسود ليلي)',
        description: 'تم إتمام المزاد واستلام المبلغ نقدًا عند الباب بواسطة شركة الزاجل إكسبريس.',
        specs: ['معالج M2 ثماني النواة', 'ذاكرة موحدة 8 غيغابايت', 'قرص 256GB SSD', 'شاشة ليكويد ريتينا'],
      },
      ckb: {
        title: 'ئەپڵ ماکبووک ئێر ١٣.٦ ئینچ (چیپی M2، میمۆری 8GB، بیرگەی 256GB، ڕەنگی نیوەشەو)',
        description: 'مەزادەکە کۆتایی هاتووە و پارە بە کاش لە بەردەم دەرگا لە ڕێگەی ئەلزاجل دراوە.',
        specs: ['چیپی بەهێزی ئەپڵ M2', '٨ گێگابایت میمۆری', 'بیرگەی ٢٥٦ گێگابایت SSD', 'شاشەی ڕیتینای ڕوون'],
      },
      badini: {
        title: 'ئەپڵ ماکبووك ئێر ١٣.٦ ئینچ (چیپێ M2، میمۆری 8GB، بیرگە 256GB، ڕەنگێ تاری)',
        description: 'موزایەدە ب دوماهیک هاتییە و پارە ب کاش ل بەر دەرگەهی هاتییە دان ب زاجل ئێکسپرێس.',
        specs: ['چیپێ ئەپڵ M2', '٨ گێگابایت میمۆری', 'بیرگەیا ٢٥٦ گێگابایت SSD', 'شاشەیا ڕیتینایا جوان'],
      },
    },
    submittedAt: '2026-09-27T10:00:00Z',
    auctionStartsAt: '2026-09-27T12:00:00Z',
    auctionEndsAt: '2026-09-27T18:00:00Z',
    status: 'completed',
    isAntiSnipingActive: false,
    antiSnipingResetsCount: 1,
    totalBids: 62,
    highestBidder: {
      id: 'usr-buyer-88',
      name: 'Rebaz Farhad Salih',
      phone: '+964 750 192 8844',
    },
    bidsHistory: [],
    codStatus: 'collected_cod',
    packageAwbId: 'AWB-IQ-202609-804',
    courierName: 'Al-Zajil Express',
  },
];

export const useAuctionStore = create<AuctionStoreState>((set, get) => ({
  auctions: INITIAL_MOBILE_AUCTIONS,
  myAutoBids: {},
  savedAuctionIds: ['auc-802'],
  lastBidAlert: null,

  toggleSaveAuction: (auctionId: string) => {
    set((state) => {
      const isSaved = state.savedAuctionIds.includes(auctionId);
      return {
        savedAuctionIds: isSaved
          ? state.savedAuctionIds.filter((id) => id !== auctionId)
          : [...state.savedAuctionIds, auctionId],
        lastBidAlert: isSaved ? 'Removed from Watchlist' : 'Saved to Watchlist',
      };
    });
  },

  placeSlideBid: (auctionId, bidderName, bidderPhone) => {
    const auction = get().auctions.find((a) => a.id === auctionId);
    if (!auction || auction.status !== 'live') return false;

    const step = auction.incrementStepIqd;
    const newBidAmount = auction.currentBidIqd + step;

    // Calculate next tier step for future bids
    let nextStep = 1000;
    if (newBidAmount > 200000) nextStep = 3000;
    else if (newBidAmount > 100000) nextStep = 2000;

    const now = Date.now();
    const endTime = new Date(auction.auctionEndsAt).getTime();
    const secondsRemaining = Math.max(0, Math.floor((endTime - now) / 1000));

    let newEndsAt = auction.auctionEndsAt;
    let antiSnipeTriggered = false;

    // 60-Second Anti-Sniping Soft Close Reset Rule
    if (secondsRemaining <= 60) {
      newEndsAt = new Date(now + 60 * 1000).toISOString();
      antiSnipeTriggered = true;
    }

    const newBidRecord = {
      id: `b-${Date.now().toString().slice(-4)}`,
      bidderId: 'usr-buyer-88',
      bidderName: bidderName || 'You',
      amountIqd: newBidAmount,
      timestamp: new Date().toLocaleTimeString(),
    };

    set((state) => ({
      auctions: state.auctions.map((a) =>
        a.id === auctionId
          ? {
              ...a,
              currentBidIqd: newBidAmount,
              incrementStepIqd: nextStep,
              totalBids: a.totalBids + 1,
              highestBidder: {
                id: 'usr-buyer-88',
                name: bidderName || 'You',
                phone: bidderPhone || '+964 750 000 0000',
              },
              bidsHistory: [newBidRecord, ...a.bidsHistory],
              auctionEndsAt: newEndsAt,
              isAntiSnipingActive: antiSnipeTriggered ? true : a.isAntiSnipingActive,
              antiSnipingResetsCount: antiSnipeTriggered
                ? a.antiSnipingResetsCount + 1
                : a.antiSnipingResetsCount,
            }
          : a
      ),
      lastBidAlert: antiSnipeTriggered
        ? `⚡ Anti-Sniping Triggered! Clock reset to 60s for ${auction.multilingual.en.title}`
        : `Bid of ${newBidAmount.toLocaleString()} IQD placed successfully!`,
    }));

    return true;
  },

  setAutoBidCeiling: (auctionId, ceilingIqd) => {
    set((state) => ({
      myAutoBids: { ...state.myAutoBids, [auctionId]: ceilingIqd },
    }));
  },

  createSellerListing: (data) => {
    // CRITICAL RBAC ENFORCEMENT: Only sellers can add a new listing
    const currentRole = useAuthStore.getState().role;
    if (currentRole !== 'seller') {
      console.warn('RBAC Access Denied: Only sellers can add a new listing.');
      set({ lastBidAlert: '🔒 Access Denied: Only verified sellers can add a new listing.' });
      return null;
    }

    if (!data.sellerId || !data.sellerName) {
      console.warn('Unauthorized: Only registered sellers can create listings.');
      return null;
    }
    const newId = `auc-${Math.floor(820 + Math.random() * 80)}`;

    // Calculate dynamic step based on baseline retail price
    let step = 1000;
    if (data.estimatedRetailMarketPriceIqd > 200000) step = 3000;
    else if (data.estimatedRetailMarketPriceIqd > 100000) step = 2000;

    // Use Gemini AI 4-Dialect translations if available, or fallback
    const multilingual = data.multilingual || {
      en: {
        title: data.primaryTitle,
        description: data.primaryDescription,
        specs: data.primarySpecs,
      },
      ar: {
        title: `${data.primaryTitle} (مواصفات رسمية من البائع)`,
        description: `${data.primaryDescription} - تم التحقق من سلامة المنتج مع بدء المزاد بسعر ١,٠٠٠ د.ع ثابت.`,
        specs: data.primarySpecs,
      },
      ckb: {
        title: `${data.primaryTitle} (تایبەتمەندی فەرمی فرۆشیار)`,
        description: `${data.primaryDescription} - بە یاسای ١,٠٠٠ دیناری نەگۆڕی دەستپێک.`,
        specs: data.primarySpecs,
      },
      badini: {
        title: `${data.primaryTitle} (تایبەتمەندیێن فەرمیێن فرۆشیاری)`,
        description: `${data.primaryDescription} - ب یاسایا ١,٠٠٠ دینارێن نەگوهۆڕ یێن دەستپێکێ.`,
        specs: data.primarySpecs,
      },
    };

    const newAuction: MobileAuctionItem = {
      id: newId,
      sellerId: data.sellerId,
      sellerName: data.sellerName,
      category: data.category,
      condition: data.condition,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      startingPriceIqd: 1000, // Strictly 1,000 IQD universal starting rule
      currentBidIqd: 1000,
      incrementStepIqd: step,
      estimatedRetailMarketPriceIqd: data.estimatedRetailMarketPriceIqd,
      multilingual,
      submittedAt: new Date().toISOString(),
      auctionStartsAt: new Date(Date.now() + 600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4200 * 1000).toISOString(),
      status: 'grace_period', // 10-minute grace window begins!
      gracePeriodEndsAt: new Date(Date.now() + 600 * 1000).toISOString(),
      isAntiSnipingActive: false,
      antiSnipingResetsCount: 0,
      totalBids: 0,
      bidsHistory: [],
    };

    set((state) => ({
      auctions: [newAuction, ...state.auctions],
    }));

    return newAuction;
  },

  clearLastBidAlert: () => set({ lastBidAlert: null }),
}));
