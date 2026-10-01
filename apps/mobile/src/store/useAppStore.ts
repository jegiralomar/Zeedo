import { create } from 'zustand';
import { LanguageCode, UserRole, MobileUser, MobileAuctionItem, WonLotOrder, BidRecord } from '../types';

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

  // Navigation Screen State
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedAuctionId: string | null;
  setSelectedAuctionId: (id: string | null) => void;

  // Live Auctions Catalog
  auctions: MobileAuctionItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Real-Time Bidding Action
  placeBid: (auctionId: string, amountIqd: number) => void;

  // Won Items & COD Orders
  wonOrders: WonLotOrder[];
  addWonOrder: (order: WonLotOrder) => void;

  // WebSocket Live Connection Status
  isWsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

const DEFAULT_AUCTIONS: MobileAuctionItem[] = [
  {
    id: 'auc-ps5-pro',
    title: 'Sony PlayStation 5 Pro 2TB Edition (عراقي أصلي)',
    titleAr: 'جهاز سوني بلايستيشن 5 برو 2 تيرابايت (ضمان محلي)',
    description: 'PlayStation 5 Pro console with enhanced ray tracing, AI-driven PSSR 4K 120fps upscaling, 2TB high-speed NVMe SSD, DualSense wireless controller.',
    descriptionAr: 'نسخة برو الرسمية مع دعم 4K بمعدل 120 إطار، ذواكر تخزين فائقة السرعة 2 تيرابايت، ومعالج رسومي فائق الأداء مع ضمان الوكيل المعتمد.',
    category: 'electronics',
    retailPriceUsd: 799,
    currentBidIqd: 450000,
    currentBidUsd: 298,
    incrementStepIqd: 10000,
    bidsCount: 24,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
    isLive: true,
    sellerName: 'Al-Mansour Electronics',
    sellerId: 'sel-mansour',
    sellerCity: 'Baghdad - Al-Mansour',
    rating: 4.9,
    reviewCount: 384,
    specs: ['2TB High-Speed SSD', 'DualSense Haptic Feedback', 'Ray Tracing 2.0', '100% Authentic Stock'],
    condition: 'New',
    bidsHistory: [
      { bidId: 'b-1', bidderId: 'u-1', bidderName: 'كرار حيدر', amountIqd: 450000, amountUsd: 298, timestamp: '14:23:05' },
      { bidId: 'b-2', bidderId: 'u-2', bidderName: 'أحمد البصري', amountIqd: 440000, amountUsd: 291, timestamp: '14:21:40' },
      { bidId: 'b-3', bidderId: 'u-3', bidderName: 'ريبوار كوردستان', amountIqd: 430000, amountUsd: 285, timestamp: '14:18:12' },
    ],
  },
  {
    id: 'auc-rolex-sub',
    title: 'Rolex Submariner Date 41mm Oystersteel Ceramic',
    titleAr: 'ساعة رولكس صبمارينر ديت 41 ملم ستانلس ستيل مع ميناء أسود',
    description: 'Rolex Submariner 126610LN Oystersteel case, Cerachrom ceramic rotating bezel, black dial with Chromalight luminescent display. Complete box & papers.',
    descriptionAr: 'ساعة غوص فاخرة مقاومة للماء 300 متر، إطار سيراميك أسود مقاوم للخدش، حركة أوتوماتيكية سويسرية كاليبر 3235، الصندوق والأوراق الأصلية متوفرة.',
    category: 'mens',
    retailPriceUsd: 14200,
    currentBidIqd: 4850000,
    currentBidUsd: 3212,
    incrementStepIqd: 50000,
    bidsCount: 41,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfa63096aa?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes
    isLive: true,
    sellerName: 'Baghdad Prime Watches',
    sellerId: 'sel-watches',
    sellerCity: 'Baghdad - Karrada',
    rating: 5.0,
    reviewCount: 92,
    specs: ['41mm Oystersteel', 'Calibre 3235 Movement', 'Cerachrom Bezel', 'Certificate Included'],
    condition: 'New Open Box',
    bidsHistory: [
      { bidId: 'b-10', bidderId: 'u-5', bidderName: 'زياد طارق', amountIqd: 4850000, amountUsd: 3212, timestamp: '14:24:11' },
      { bidId: 'b-11', bidderId: 'u-6', bidderName: 'عمر النعيمي', amountIqd: 4800000, amountUsd: 3178, timestamp: '14:22:00' },
    ],
  },
  {
    id: 'auc-iphone-16-pro',
    title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
    titleAr: 'آيفون 16 برو ماكس 256 جيجابايت تيتانيوم طبيعي',
    description: 'Latest A18 Pro Bionic chip, Camera Control button, Grade 5 Titanium finish, 48MP Fusion camera system with 5x telephoto optical zoom.',
    descriptionAr: 'الهاتف الأقوى من أبل بتصميم التيتانيوم فائق المتانة، شاشة 6.9 إنش بروموشن 120 هرتز، نظام كاميرات سينمائي 48 ميجابكسل، وبطارية تدوم طوال اليوم.',
    category: 'electronics',
    retailPriceUsd: 1199,
    currentBidIqd: 820000,
    currentBidUsd: 543,
    incrementStepIqd: 15000,
    bidsCount: 19,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    isLive: true,
    sellerName: 'Erbil Apple Center',
    sellerId: 'sel-erbil-tech',
    sellerCity: 'Erbil - Dream City',
    rating: 4.8,
    reviewCount: 215,
    specs: ['256GB Storage', 'A18 Pro Chip', 'Natural Titanium', 'Official Iraqi 1-Year Warranty'],
    condition: 'New',
    bidsHistory: [
      { bidId: 'b-20', bidderId: 'u-7', bidderName: 'سامان عثمان', amountIqd: 820000, amountUsd: 543, timestamp: '14:15:30' },
    ],
  },
  {
    id: 'auc-airjordan-1',
    title: 'Nike Air Jordan 1 Retro High OG Chicago Lost & Found',
    titleAr: 'حذاء نايكي إير جوردان 1 ريترو شيكاغو الأصلي',
    description: 'Iconic Chicago colorway with aged vintage aesthetics, cracked leather collar, authentic retro Nike packaging and receipt.',
    descriptionAr: 'الحذاء الأكثر شهرة في عالم الأحذية الرياضية، جلد طبيعي معتق بدرجات الأحمر والأسود والأبيض، إصدار محدود لهواة الجمع ومحبي الرياضة.',
    category: 'fashion',
    retailPriceUsd: 380,
    currentBidIqd: 195000,
    currentBidUsd: 129,
    incrementStepIqd: 5000,
    bidsCount: 32,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ],
    endsAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(), // 18m remaining!
    isLive: true,
    sellerName: 'Basra Streetwear Co.',
    sellerId: 'sel-basra',
    sellerCity: 'Basra - Al-Ashar',
    rating: 4.7,
    reviewCount: 140,
    specs: ['Size 43 EU (9.5 US)', 'Chicago Vintage Colors', '100% Authentic with Tag'],
    condition: 'New',
    bidsHistory: [
      { bidId: 'b-30', bidderId: 'u-8', bidderName: 'مصطفى علاء', amountIqd: 195000, amountUsd: 129, timestamp: '14:26:55' },
    ],
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  language: 'ar', // Default to Arabic for Iraqi audience
  setLanguage: (lang) => set({ language: lang }),

  currentUser: null,
  userRole: 'guest',
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  loginAsBuyer: (phone, name = 'مشتري معتمد') => {
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
      activeScreen: 'home',
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
      activeScreen: 'merchant_home',
    });
  },

  logout: () => {
    set({
      currentUser: null,
      userRole: 'guest',
      activeScreen: 'home',
    });
  },

  activeScreen: 'home',
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  selectedAuctionId: null,
  setSelectedAuctionId: (id) => set({ selectedAuctionId: id, activeScreen: id ? 'auction_detail' : 'home' }),

  auctions: DEFAULT_AUCTIONS,
  selectedCategory: 'all',
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  placeBid: (auctionId, amountIqd) => {
    const { currentUser, openAuthModal, auctions } = get();
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
        amountUsd: Math.round(amountIqd / 1510),
        timestamp: new Date().toLocaleTimeString(),
      };

      // Extend soft close anti-sniping if < 60s remaining
      const endsTime = new Date(item.endsAt).getTime();
      const diffSecs = (endsTime - Date.now()) / 1000;
      let newEndsAt = item.endsAt;
      if (diffSecs <= 60 && diffSecs > 0) {
        newEndsAt = new Date(Date.now() + 60 * 1000).toISOString();
      }

      return {
        ...item,
        currentBidIqd: amountIqd,
        currentBidUsd: Math.round(amountIqd / 1510),
        bidsCount: item.bidsCount + 1,
        endsAt: newEndsAt,
        bidsHistory: [newRecord, ...item.bidsHistory].slice(0, 30),
      };
    });

    set({ auctions: updated });
  },

  wonOrders: [
    {
      orderId: 'ORD-ZED-98214',
      auctionId: 'auc-ps5-pro',
      title: 'Sony PlayStation 5 Pro 2TB Edition (عراقي أصلي)',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
      winningBidUsd: 298,
      winningBidIqd: 450000,
      deliveryCity: 'بغداد - المنصور',
      addressText: 'شارع 14 رمضان، قرب جامع الرواد',
      awbNumber: 'AWB-IQ-2026-98214',
      codStatus: 'ready_for_dispatch',
      placedAt: 'اليوم، 13:40',
    },
  ],
  addWonOrder: (order) => set((state) => ({ wonOrders: [order, ...state.wonOrders] })),

  isWsConnected: true,
  setWsConnected: (connected) => set({ isWsConnected: connected }),
}));
