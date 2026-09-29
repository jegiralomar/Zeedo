import { create } from 'zustand';
import { MobileAuctionItem, MultilingualContent } from '../types/marketplace';

interface BuyerAuctionStoreState {
  auctions: MobileAuctionItem[];
  myAutoBids: Record<string, number>; // auctionId -> ceiling IQD
  lastBidAlert: string | null;
  savedAuctionIds: string[];

  // Actions
  placeSlideBid: (auctionId: string, bidderName: string, bidderPhone: string) => boolean;
  setAutoBidCeiling: (auctionId: string, ceilingIqd: number) => void;
  toggleSaveAuction: (auctionId: string) => void;
  clearLastBidAlert: () => void;
  tickTimers: () => void;
}

export const INITIAL_MARKETPLACE_AUCTIONS: MobileAuctionItem[] = [
  {
    id: 'auc-801',
    sellerId: 'sel-merchant-01',
    sellerName: 'Erbil Mobile & Watch Studio',
    category: 'Smartphones',
    condition: 'New Open Box',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 236000,
    incrementStepIqd: 3000,
    estimatedRetailMarketPriceIqd: 1350000,
    multilingual: {
      en: {
        title: 'Google Pixel 8 Pro (128GB, Bay Blue, Pristine Condition)',
        description: 'Flagship Google device with Tensor G3 chip, AI camera features, factory box, and 1-year Iraqi partner warranty.',
        specs: ['128GB High-Speed Storage', 'Bay Blue Color', 'Factory Unlocked (Global)', '100% Doorstep COD Inspection'],
      },
      ar: {
        title: 'غوغل بكسل 8 برو (128 غيغابايت، أزرق سمائي، بحالة الوكالة)',
        description: 'هاتف غوغل الرائد مع معالج تنسور G3، كاميرات بالذكاء الاصطناعي وعلبة المصنع، مع ضمان الوكيل المعتمد في العراق.',
        specs: ['ذاكرة 128 غيغابايت', 'اللون أزرق سماوي', 'مفتوح رسمي على جميع الشبكات', 'فحص مباشر عند الاستلام'],
      },
      ckb: {
        title: 'گووگڵ پیكسڵ 8 پرۆ (١٢٨ گێگابایت، شینی ئاسمانی، زۆر پاک)',
        description: 'مۆبایلی پێشەنگی گووگڵ بە چیپی تێنسەر G3، کامێرای ژیریی دەستکرد و کارتۆنی ئەسڵی لەگەڵ گرێنتی بریکاری عێراق.',
        specs: ['بیرگەی ١٢٨ گێگابایت', 'ڕەنگی شینی ئاسمانی', 'فەرمی و بێ کێشە', 'پشکنینی ٥ خولەکی بەردەم دەرگا پێش پارەدان'],
      },
      badini: {
        title: 'گووگڵ پیكسڵ 8 پرۆ (١٢٨ گێگابایت، شینێ ئاسمانی، پاك وەک نوی)',
        description: 'ئامیرێ سەرەکیێ گووگڵ ب چیپێ تێنسەر G3، کامێرا ب ژیرییا دەستکرد و کارتۆنا فەرمی دگەل گرەنتیا فەرمی.',
        specs: ['بیرگە ١٢٨ گێگابایت', 'ڕەنگێ شینێ ئاسمانی', 'فەرمی بێ كێشە', 'پشکنینا ڕاستەوخۆ دەمێ وەرگرتنێ'],
      },
    },
    submittedAt: '2026-09-28T14:00:00Z',
    auctionStartsAt: '2026-09-28T16:00:00Z',
    auctionEndsAt: new Date(Date.now() + 45 * 1000).toISOString(), // Under 60s -> In Anti-Sniping Zone!
    status: 'live',
    isAntiSnipingActive: true,
    antiSnipingResetsCount: 3,
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
    incrementStepIqd: 1000,
    estimatedRetailMarketPriceIqd: 450000,
    multilingual: {
      en: {
        title: 'Tissot PRX Powermatic 80 (Automatic, Emerald Green Dial)',
        description: 'Swiss-made luxury sports watch with 80 hours power reserve, sapphire crystal, and steel integrated bracelet.',
        specs: ['Automatic Powermatic 80', 'Emerald Green Sunray Dial', 'Stainless Steel 316L', '100m Water Resistant'],
      },
      ar: {
        title: 'ساعة تيسو بي آر إكس باوماتيك 80 (أوتوماتيك، ميناء أخضر زمردي)',
        description: 'ساعة رياضية سويسرية فاخرة باحتياطي طاقة 80 ساعة، زجاج ياقوتي مقاوم للخدش وسوار متكامل.',
        specs: ['حركة أوتوماتيكية سويسرية', 'ميناء أخضر زمردي فاخر', 'فولاذ مقاوم للصدأ 316L', 'مقاومة ماء 100 متر'],
      },
      ckb: {
        title: 'کاتژمێری تیسۆت PRX پاوەرماتیک 80 (سەوزی زومڕوودی، ئۆتۆماتیک)',
        description: 'کاتژمێری لوکسی وەرزشی سویسری بە هەڵگرتنی وزەی 80 کاتژمێر و شوشەی یاقووتی دژە ڕووشان.',
        specs: ['بزوێنەری ئۆتۆماتیکی سویسری', 'ڕووکاری سەوزی زومڕوودی', 'پۆڵای دژە ژەنگ 316L', 'بەرگری ئاو تا 100 مەتر'],
      },
      badini: {
        title: 'دەستژمێرێ تیسۆت PRX پاوەرماتیک 80 (کەسکێ زومڕوودی)',
        description: 'دەستژمێرێ لوکسێ سویسری یێ وەرزشی ب پاراستنا کارەبایێ یا 80 دەمژمێر و شیشێ یاقووتێ.',
        specs: ['بزوێنەرێ ئۆتۆماتیکی', 'ڕەنگێ کەسکێ زومڕوودی', 'پۆلایێ دژە ژەنگ 316L', 'بەرگری ئاڤێ تا 100 مەتر'],
      },
    },
    submittedAt: '2026-09-28T14:15:00Z',
    auctionStartsAt: '2026-09-28T15:30:00Z',
    auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
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
      { id: 'b-92', bidderId: 'usr-102', bidderName: 'Zaid Mustafa Al-Kinani', amountIqd: 94000, timestamp: '17:35:10' },
      { id: 'b-91', bidderId: 'usr-buyer-88', bidderName: 'Rebaz Farhad Salih', amountIqd: 93000, timestamp: '17:33:04' },
    ],
  },
  {
    id: 'auc-803',
    sellerId: 'sel-merchant-02',
    sellerName: 'Baghdad Gaming & Consoles Hub',
    category: 'Gaming',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 312000,
    incrementStepIqd: 3000,
    estimatedRetailMarketPriceIqd: 720000,
    multilingual: {
      en: {
        title: 'Sony PlayStation 5 Slim 1TB Edition (Middle East Official Stock)',
        description: 'Brand new sealed Sony PS5 Slim console with DualSense Wireless Controller and 1TB ultra-fast NVMe SSD.',
        specs: ['1TB Ultra-Fast SSD', 'DualSense Haptic Controller', '4K 120Hz Output', '1 Year Middle East Warranty'],
      },
      ar: {
        title: 'سوني بلايستيشن 5 سليم 1 تيرابايت (المواصفات الشرق أوسطية الرسمية)',
        description: 'جهاز بلايستيشن 5 سليم جديد ومختوم مع يدة تحكم لاسلكية ومساحة تخزين سريعة 1 تيرابايت.',
        specs: ['1 تيرابايت SSD فائق السرعة', 'يدة تحكم دوال سينس', 'دعم 4K 120 إطار', 'ضمان رسمي لمدة سنة'],
      },
      ckb: {
        title: 'سۆنی پلەیستەیشن 5 سلیم قەبارەی 1 تێرابایت (مۆدێلی ڕۆژهەڵاتی ناوەڕاست)',
        description: 'کۆنسۆڵی ئەسڵی پلەیستەیشن 5 سلیم لەگەڵ کۆنتڕۆڵی دوواڵسێنس و 1 تێرابایت بیرگەی خێرا.',
        specs: ['١ تێرابایت بیرگەی NVMe', 'کۆنتڕۆڵی دوواڵسێنس', 'دەرچوونی 4K 120Hz', '١ ساڵ گرێنتی فەرمی'],
      },
      badini: {
        title: 'سۆنی پلەیستەیشن 5 سلیم 1 تێرابایت (مۆدێلێ فەرمی)',
        description: 'کۆنسۆلا ئەسلی یا پلەیستەیشن 5 سلیم دگەل کۆنترۆلا دوال سێنس و بیرگەها بلەز یا 1 تێرابایت.',
        specs: ['١ تێرابایت بیرگەها بلەز', 'کۆنترۆلا دوال سێنس', 'پشتیڤانیا 4K 120Hz', '١ سال گرەنتیا فەرمی'],
      },
    },
    submittedAt: '2026-09-28T13:00:00Z',
    auctionStartsAt: '2026-09-28T15:00:00Z',
    auctionEndsAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    status: 'live',
    isAntiSnipingActive: false,
    antiSnipingResetsCount: 0,
    totalBids: 62,
    highestBidder: {
      id: 'usr-105',
      name: 'Rawa Dilshad Harki',
      phone: '+964 750 991 2233',
    },
    bidsHistory: [
      { id: 'b-85', bidderId: 'usr-105', bidderName: 'Rawa Dilshad Harki', amountIqd: 312000, timestamp: '17:39:12' },
      { id: 'b-84', bidderId: 'usr-101', bidderName: 'Karwan Ahmed Salih', amountIqd: 309000, timestamp: '17:38:00' },
    ],
  },
  {
    id: 'auc-804',
    sellerId: 'sel-merchant-01',
    sellerName: 'Erbil Mobile & Watch Studio',
    category: 'Computers',
    condition: 'New Open Box',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    startingPriceIqd: 1000,
    currentBidIqd: 418000,
    incrementStepIqd: 3000,
    estimatedRetailMarketPriceIqd: 950000,
    multilingual: {
      en: {
        title: 'Apple iPad Air 11-inch M2 (128GB, Space Gray, Wi-Fi)',
        description: 'Apple iPad Air powered by the M2 chip, Liquid Retina display with anti-reflective coating, and Apple Pencil Pro support.',
        specs: ['Apple M2 8-core CPU', '128GB Storage', 'Liquid Retina Display', 'Touch ID Top Button'],
      },
      ar: {
        title: 'آبل آيباد إير 11 إنش معالج M2 (سعة 128 غيغابايت، رمادي فلكي)',
        description: 'جهاز آيباد إير مدعوم بشريحة M2 القوية وشاشة ليكويد ريتنا فائقة الوضوح مع دعم قلم آبل برو.',
        specs: ['معالج Apple M2 ثماني النوى', 'ذاكرة 128 غيغابايت', 'شاشة ليكويد ريتنا', 'بصمة إصبع مدمجة'],
      },
      ckb: {
        title: 'ئەپڵ ئایپاد ئێر 11 ئینج بە چیپی M2 (١٢٨ گێگابایت، ڕەساسی)',
        description: 'ئایپاد ئێری پێشکەوتوو بە چیپی بەهێزی M2 و شاشەی لکوید ڕێتینا لەگەڵ پشتگیری قەڵەمی ئەپڵ پرۆ.',
        specs: ['چیپی ئەپڵ M2', 'بیرگەی ١٢٨ گێگابایت', 'شاشەی Liquid Retina', 'پەنجەمۆری سەرەکی Touch ID'],
      },
      badini: {
        title: 'ئەپڵ ئایپاد ئێر 11 ئینج ب چیپێ M2 (١٢٨ گێگابایت)',
        description: 'ئایپاد ئێرا نووی ب چیپێ بهێز یێ M2 و شاشەیا لکوید ڕێتینا دگەل پشتەڤانیا قەلەمێ ئەپڵ پرۆ.',
        specs: ['چیپێ ئەپڵ M2', 'بیرگە ١٢٨ گێگابایت', 'شاشەیا ڕوون Liquid Retina', 'پەنجەمۆرێ سەرەکی'],
      },
    },
    submittedAt: '2026-09-28T12:00:00Z',
    auctionStartsAt: '2026-09-28T14:00:00Z',
    auctionEndsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: 'live',
    isAntiSnipingActive: false,
    antiSnipingResetsCount: 0,
    totalBids: 39,
    highestBidder: {
      id: 'usr-104',
      name: 'Ahmed Kawa Othman',
      phone: '+964 750 331 4455',
    },
    bidsHistory: [
      { id: 'b-78', bidderId: 'usr-104', bidderName: 'Ahmed Kawa Othman', amountIqd: 418000, timestamp: '17:28:44' },
    ],
  },
];

export const useBuyerAuctionStore = create<BuyerAuctionStoreState>((set, get) => ({
  auctions: INITIAL_MARKETPLACE_AUCTIONS,
  myAutoBids: {},
  lastBidAlert: null,
  savedAuctionIds: ['auc-801'],

  placeSlideBid: (auctionId, bidderName, bidderPhone) => {
    let success = false;
    set((state) => {
      const target = state.auctions.find((a) => a.id === auctionId);
      if (!target || target.status !== 'live') return state;

      // Calculate dynamic step based on current price tier
      let step = 1000;
      if (target.currentBidIqd >= 200000) step = 3000;
      else if (target.currentBidIqd >= 100000) step = 2000;

      const newBid = target.currentBidIqd + step;
      const now = new Date();
      const currentEnds = new Date(target.auctionEndsAt).getTime();
      const diffSecs = (currentEnds - now.getTime()) / 1000;

      // Soft-close anti-sniping rule: if bid within 60s, extend by 60s
      let newEndsAt = target.auctionEndsAt;
      let resetsCount = target.antiSnipingResetsCount;
      let isAntiSnipingActive = target.isAntiSnipingActive;

      if (diffSecs <= 60 && diffSecs > 0) {
        newEndsAt = new Date(now.getTime() + 60 * 1000).toISOString();
        resetsCount += 1;
        isAntiSnipingActive = true;
      }

      const newRecord = {
        id: `bid-${Date.now()}`,
        bidderId: 'usr-buyer-88',
        bidderName: bidderName || 'Rebaz Farhad Salih',
        amountIqd: newBid,
        timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
      };

      success = true;

      const updatedAuctions = state.auctions.map((a) => {
        if (a.id === auctionId) {
          return {
            ...a,
            currentBidIqd: newBid,
            incrementStepIqd: step,
            auctionEndsAt: newEndsAt,
            antiSnipingResetsCount: resetsCount,
            isAntiSnipingActive,
            totalBids: a.totalBids + 1,
            highestBidder: {
              id: 'usr-buyer-88',
              name: bidderName || 'Rebaz Farhad Salih',
              phone: bidderPhone || '+964 750 192 8844',
            },
            bidsHistory: [newRecord, ...a.bidsHistory],
          };
        }
        return a;
      });

      return {
        auctions: updatedAuctions,
        lastBidAlert: `Bid placed for ${target.multilingual.en.title}: ${newBid.toLocaleString()} IQD`,
      };
    });

    return success;
  },

  setAutoBidCeiling: (auctionId, ceilingIqd) => {
    set((state) => ({
      myAutoBids: {
        ...state.myAutoBids,
        [auctionId]: ceilingIqd,
      },
    }));
  },

  toggleSaveAuction: (auctionId) => {
    set((state) => {
      const exists = state.savedAuctionIds.includes(auctionId);
      return {
        savedAuctionIds: exists
          ? state.savedAuctionIds.filter((id) => id !== auctionId)
          : [...state.savedAuctionIds, auctionId],
      };
    });
  },

  clearLastBidAlert: () => set({ lastBidAlert: null }),

  tickTimers: () => {
    set((state) => {
      const now = Date.now();
      const updated = state.auctions.map((a) => {
        const remaining = (new Date(a.auctionEndsAt).getTime() - now) / 1000;
        const isSniping = remaining <= 60 && remaining > 0;
        if (isSniping !== a.isAntiSnipingActive) {
          return { ...a, isAntiSnipingActive: isSniping };
        }
        return a;
      });
      return { auctions: updated };
    });
  },
}));
