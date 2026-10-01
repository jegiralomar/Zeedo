import { create } from 'zustand';
import { LanguageCode, UserRole, MobileUser, MobileAuctionItem, WonLotOrder, BidRecord } from '../types';

export type BuyerTab = 'auctions' | 'watchlist' | 'bag' | 'profile';

interface AppState {
  // Localization
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // Authentication & Role
  currentUser: MobileUser | null;
  userRole: UserRole;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginAsBuyer: (phone: string, name?: string) => void;
  loginAsMerchant: (storeName: string, phone: string) => void;
  logout: () => void;

  // Active Tab & Full Screen Selection
  activeTab: BuyerTab;
  setActiveTab: (tab: BuyerTab) => void;
  activeScreen?: string;
  setActiveScreen: (s: string) => void;
  selectedAuctionId: string | null;
  setSelectedAuctionId: (id: string | null) => void;

  // Merchant Sub-Screens
  merchantScreen: 'dashboard' | 'orders' | 'ledger';
  setMerchantScreen: (s: 'dashboard' | 'orders' | 'ledger') => void;

  // Auctions Catalog
  auctions: MobileAuctionItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Watchlist
  watchlistIds: string[];
  toggleWatchlist: (id: string) => void;

  // Real-Time Bids & Activity
  placeBid: (auctionId: string, amountIqd: number) => void;
  myBids: { auctionId: string; amountIqd: number; isLeading: boolean }[];

  // Won Items & COD Orders
  wonOrders: WonLotOrder[];
  addWonOrder: (order: WonLotOrder) => void;
}

const DEFAULT_AUCTIONS: MobileAuctionItem[] = [
  {
    id: 'auc-ps5-pro',
    title: 'Sony PlayStation 5 Pro 2TB (عراقي أصلي)',
    titleAr: 'سوني بلايستيشن 5 برو 2 تيرابايت (ضمان محلي)',
    description: 'PlayStation 5 Pro console with enhanced ray tracing, AI-driven PSSR 4K 120fps upscaling, 2TB high-speed NVMe SSD, DualSense wireless controller.',
    descriptionAr: 'نسخة برو الرسمية مع دعم 4K بمعدل 120 إطار، ذواكر تخزين فائقة السرعة 2 تيرابايت، ومعالج رسومي فائق الأداء مع ضمان الوكيل المعتمد.',
    category: 'electronics',
    startingPriceIqd: 1000,
    currentBidIqd: 450000,
    incrementStepIqd: 10000,
    bidsCount: 24,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
    isLive: true,
    sellerCity: 'بغداد - المنصور',
    specs: ['2TB High-Speed SSD', 'DualSense Haptic Feedback', 'Ray Tracing 2.0', 'ضمان عراقي أصلي 1 سنة'],
    condition: 'New',
    bidsHistory: [
      { bidId: 'b-1', bidderId: 'u-1', bidderName: 'كرار حيدر', amountIqd: 450000, timestamp: '14:23:05' },
      { bidId: 'b-2', bidderId: 'u-2', bidderName: 'أحمد البصري', amountIqd: 440000, timestamp: '14:21:40' },
      { bidId: 'b-3', bidderId: 'u-3', bidderName: 'ريبوار كوردستان', amountIqd: 430000, timestamp: '14:18:12' },
    ],
  },
  {
    id: 'auc-rolex-sub',
    title: 'Rolex Submariner Date 41mm Oystersteel Ceramic',
    titleAr: 'ساعة رولكس صبمارينر ديت 41 ملم ستانلس ستيل مع ميناء أسود',
    description: 'Rolex Submariner 126610LN Oystersteel case, Cerachrom ceramic rotating bezel, black dial with Chromalight luminescent display. Complete box & papers.',
    descriptionAr: 'ساعة غوص فاخرة مقاومة للماء 300 متر، إطار سيراميك أسود مقاوم للخدش، حركة أوتوماتيكية سويسرية كاليبر 3235، الصندوق والأوراق الأصلية متوفرة.',
    category: 'watches',
    startingPriceIqd: 50000,
    currentBidIqd: 4850000,
    incrementStepIqd: 50000,
    bidsCount: 41,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfa63096aa?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    isLive: true,
    sellerCity: 'بغداد - الكرادة',
    specs: ['41mm Oystersteel', 'Calibre 3235 Movement', 'Cerachrom Bezel', 'شهادة الفحص والأصالة متوفرة'],
    condition: 'New Open Box',
    bidsHistory: [
      { bidId: 'b-10', bidderId: 'u-5', bidderName: 'زياد طارق', amountIqd: 4850000, timestamp: '14:24:11' },
      { bidId: 'b-11', bidderId: 'u-6', bidderName: 'عمر النعيمي', amountIqd: 4800000, timestamp: '14:22:00' },
    ],
  },
  {
    id: 'auc-iphone-16-pro',
    title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
    titleAr: 'آيفون 16 برو ماكس 256 جيجابايت تيتانيوم طبيعي',
    description: 'Latest A18 Pro Bionic chip, Camera Control button, Grade 5 Titanium finish, 48MP Fusion camera system with 5x telephoto optical zoom.',
    descriptionAr: 'الهاتف الأقوى من أبل بتصميم التيتانيوم فائق المتانة، شاشة 6.9 إنش بروموشن 120 هرتز، نظام كاميرات سينمائي 48 ميجابكسل، وبطارية تدوم طوال اليوم.',
    category: 'electronics',
    startingPriceIqd: 5000,
    currentBidIqd: 820000,
    incrementStepIqd: 15000,
    bidsCount: 19,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    isLive: true,
    sellerCity: 'أربيل - القرية الإنجليزية',
    specs: ['256GB Storage', 'A18 Pro Chip', 'Natural Titanium', 'ضمان محلي سنة كاملة'],
    condition: 'New',
    bidsHistory: [
      { bidId: 'b-20', bidderId: 'u-7', bidderName: 'سامان عثمان', amountIqd: 820000, timestamp: '14:15:30' },
    ],
  },
  {
    id: 'auc-airjordan-1',
    title: 'Nike Air Jordan 1 Retro High OG Chicago Lost & Found',
    titleAr: 'حذاء نايكي إير جوردان 1 ريترو شيكاغو الأصلي',
    description: 'Iconic Chicago colorway with aged vintage aesthetics, cracked leather collar, authentic retro Nike packaging and receipt.',
    descriptionAr: 'الحذاء الأكثر شهرة في عالم الأحذية الرياضية، جلد طبيعي معتق بدرجات الأحمر والأسود والأبيض، إصدار محدود لهواة الجمع ومحبي الرياضة.',
    category: 'fashion',
    startingPriceIqd: 1000,
    currentBidIqd: 195000,
    incrementStepIqd: 5000,
    bidsCount: 32,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    isLive: true,
    sellerCity: 'البصرة - العشار',
    specs: ['Size 43 EU (9.5 US)', 'Chicago Vintage Colors', '100% Authentic with Tag'],
    condition: 'New',
    bidsHistory: [
      { bidId: 'b-30', bidderId: 'u-8', bidderName: 'مصطفى علاء', amountIqd: 195000, timestamp: '14:26:55' },
    ],
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  language: 'ar',
  setLanguage: (lang) => set({ language: lang }),

  currentUser: null,
  userRole: 'guest',
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  loginAsBuyer: (phone, name = 'كرار حيدر') => {
    const user: MobileUser = {
      id: `usr-${Date.now()}`,
      name,
      phone,
      city: 'بغداد',
      role: 'buyer',
      kycStatus: 'verified',
    };
    set({
      currentUser: user,
      userRole: 'buyer',
      isAuthModalOpen: false,
      activeTab: 'auctions',
    });
  },

  loginAsMerchant: (storeName, phone) => {
    const merchant: MobileUser = {
      id: `merch-${Date.now()}`,
      name: storeName,
      storeName,
      phone,
      city: 'بغداد - الكرادة',
      role: 'merchant',
      commissionRate: 10,
    };
    set({
      currentUser: merchant,
      userRole: 'merchant',
      isAuthModalOpen: false,
      merchantScreen: 'dashboard',
    });
  },

  logout: () => {
    set({
      currentUser: null,
      userRole: 'guest',
      activeTab: 'auctions',
    });
  },

  activeTab: 'auctions',
  setActiveTab: (tab) => set({ activeTab: tab, selectedAuctionId: null }),
  activeScreen: 'auctions',
  setActiveScreen: (s: string) => {
    if (s === 'merchant_orders') set({ merchantScreen: 'orders' });
    else if (s === 'merchant_commissions') set({ merchantScreen: 'ledger' });
    else if (s === 'merchant_home') set({ merchantScreen: 'dashboard' });
    else if (s === 'profile') set({ activeTab: 'profile' });
    else if (s === 'watchlist') set({ activeTab: 'watchlist' });
    else if (s === 'won_lots' || s === 'checkout' || s === 'bag') set({ activeTab: 'bag' });
    else set({ activeTab: 'auctions', selectedAuctionId: null });
  },
  selectedAuctionId: null,
  setSelectedAuctionId: (id) => set({ selectedAuctionId: id }),

  merchantScreen: 'dashboard',
  setMerchantScreen: (s) => set({ merchantScreen: s }),

  auctions: DEFAULT_AUCTIONS,
  selectedCategory: 'all',
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  watchlistIds: ['auc-ps5-pro', 'auc-rolex-sub'],
  toggleWatchlist: (id) => {
    const { watchlistIds } = get();
    if (watchlistIds.includes(id)) {
      set({ watchlistIds: watchlistIds.filter((x) => x !== id) });
    } else {
      set({ watchlistIds: [...watchlistIds, id] });
    }
  },

  myBids: [
    { auctionId: 'auc-ps5-pro', amountIqd: 450000, isLeading: true },
    { auctionId: 'auc-iphone-16-pro', amountIqd: 800000, isLeading: false },
  ],

  placeBid: (auctionId, amountIqd) => {
    const { currentUser, openAuthModal, auctions, myBids } = get();
    if (!currentUser) {
      openAuthModal();
      return;
    }

    const updated = auctions.map((item) => {
      if (item.id !== auctionId) return item;

      const newRecord: BidRecord = {
        bidId: `b-${Date.now()}`,
        bidderId: currentUser.id,
        bidderName: currentUser.name,
        amountIqd,
        timestamp: new Date().toLocaleTimeString(),
      };

      const endsTime = new Date(item.endsAt).getTime();
      const diffSecs = (endsTime - Date.now()) / 1000;
      let newEndsAt = item.endsAt;
      if (diffSecs <= 60 && diffSecs > 0) {
        newEndsAt = new Date(Date.now() + 60 * 1000).toISOString();
      }

      return {
        ...item,
        currentBidIqd: amountIqd,
        bidsCount: item.bidsCount + 1,
        endsAt: newEndsAt,
        bidsHistory: [newRecord, ...item.bidsHistory].slice(0, 30),
      };
    });

    const updatedMyBids = [
      { auctionId, amountIqd, isLeading: true },
      ...myBids.filter((b) => b.auctionId !== auctionId),
    ];

    set({ auctions: updated, myBids: updatedMyBids });
  },

  wonOrders: [
    {
      orderId: 'ORD-ZED-98214',
      auctionId: 'auc-ps5-pro',
      title: 'سوني بلايستيشن 5 برو 2 تيرابايت (ضمان محلي)',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
      winningBidIqd: 450000,
      deliveryCity: 'بغداد - المنصور',
      addressText: 'شارع 14 رمضان، قرب جامع الرواد',
      awbNumber: 'AWB-IQ-2026-98214',
      codStatus: 'ready_for_dispatch',
      placedAt: 'اليوم، 13:40',
    },
  ],
  addWonOrder: (order) => set((state) => ({ wonOrders: [order, ...state.wonOrders] })),
}));
