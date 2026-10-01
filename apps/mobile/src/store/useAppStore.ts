import { create } from 'zustand';
import {
  LanguageCode,
  UserRole,
  MobileUser,
  MobileAuctionItem,
  WonLotOrder,
  BidRecord,
} from '../types';
import { ZEEDO_CONFIG } from '../config/api';

export type BuyerTab = 'auctions' | 'watchlist' | 'bag' | 'profile';

interface AppState {
  // Localization
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // Onboarding Intro
  hasSeenIntro: boolean;
  completeIntro: () => void;

  // Authentication & Session
  currentUser: MobileUser | null;
  sessionToken: string | null;
  userRole: UserRole;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithSession: (token: string, user: MobileUser) => void;
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

  // Auctions Catalog (Live from Server)
  auctions: MobileAuctionItem[];
  isLoadingAuctions: boolean;
  fetchAuctions: () => Promise<void>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Watchlist
  watchlistIds: string[];
  toggleWatchlist: (id: string) => void;

  // Real-Time Bids & Activity
  placeBid: (auctionId: string, amountIqd: number) => Promise<{ success: boolean; message?: string }>;
  myBids: { auctionId: string; amountIqd: number; isLeading: boolean }[];

  // Won Items & COD Orders
  wonOrders: WonLotOrder[];
  addWonOrder: (order: WonLotOrder) => void;
}

const getInitialIntroSeen = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('zeedo_has_seen_intro') === 'true';
  }
  return false;
};

const getInitialSession = (): { user: MobileUser | null; token: string | null } => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedUser = window.localStorage.getItem('zeedo_user');
      const savedToken = window.localStorage.getItem('zeedo_session_token');
      if (savedUser && savedToken) {
        return { user: JSON.parse(savedUser), token: savedToken };
      }
    } catch {
      // Ignored
    }
  }
  return { user: null, token: null };
};

const initialSession = getInitialSession();

export const useAppStore = create<AppState>((set, get) => ({
  language: 'ar',
  setLanguage: (lang) => set({ language: lang }),

  hasSeenIntro: getInitialIntroSeen(),
  completeIntro: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('zeedo_has_seen_intro', 'true');
    }
    set({ hasSeenIntro: true });
  },

  currentUser: initialSession.user,
  sessionToken: initialSession.token,
  userRole: initialSession.user ? initialSession.user.role : 'guest',
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  loginWithSession: (token, user) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('zeedo_session_token', token);
      window.localStorage.setItem('zeedo_user', JSON.stringify(user));
    }
    set({
      currentUser: user,
      sessionToken: token,
      userRole: user.role,
      isAuthModalOpen: false,
      activeTab: 'auctions',
    });
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('zeedo_session_token');
      window.localStorage.removeItem('zeedo_user');
    }
    set({
      currentUser: null,
      sessionToken: null,
      userRole: 'guest',
      activeTab: 'auctions',
      myBids: [],
      wonOrders: [],
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

  // 100% Clean Slate: Live Auctions from Production Server
  auctions: [],
  isLoadingAuctions: false,

  fetchAuctions: async () => {
    set({ isLoadingAuctions: true });
    try {
      const res = await fetch(ZEEDO_CONFIG.ENDPOINTS.LIVE_AUCTIONS);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: MobileAuctionItem[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title || 'Zeedo Auction Lot',
            titleAr: item.title || 'مزاد زيدو المعتمد',
            description: item.description || '',
            descriptionAr: item.description || '',
            category: item.category || 'general',
            startingPriceIqd: Number(item.startingPrice || 1000),
            currentBidIqd: Number(item.currentBid || 1000),
            incrementStepIqd: Number(item.bidIncrement || 1000),
            bidsCount: Number(item.totalBids || 0),
            images: Array.isArray(item.photos) && item.photos.length > 0
              ? item.photos
              : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
            endsAt: item.endsAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            isLive: true,
            sellerCity: item.sellerCity || 'بغداد',
            specs: item.condition ? [item.condition, 'فحص ومعاينة عند الباب'] : ['فحص ومعاينة عند الباب'],
            condition: 'New',
            bidsHistory: Array.isArray(item.bidsHistory) ? item.bidsHistory : [],
          }));
          set({ auctions: mapped });
        }
      }
    } catch (err) {
      console.warn('Could not fetch live auctions from production API:', err);
    } finally {
      set({ isLoadingAuctions: false });
    }
  },

  selectedCategory: 'all',
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Watchlist (Clean initial array)
  watchlistIds: [],
  toggleWatchlist: (id) => {
    const { watchlistIds } = get();
    if (watchlistIds.includes(id)) {
      set({ watchlistIds: watchlistIds.filter((x) => x !== id) });
    } else {
      set({ watchlistIds: [...watchlistIds, id] });
    }
  },

  // Active Bids (Clean initial array)
  myBids: [],

  // Real Bidding Submission
  placeBid: async (auctionId, amountIqd) => {
    const { currentUser, openAuthModal, auctions, myBids } = get();

    if (!currentUser) {
      openAuthModal();
      return { success: false, message: 'Login required' };
    }

    try {
      const response = await fetch(ZEEDO_CONFIG.ENDPOINTS.PLACE_BID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          bidderId: currentUser.id,
          bidderName: currentUser.name,
          bidderPhone: currentUser.phone,
          bidderCity: currentUser.city || 'العراق',
          amountIqd,
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.success === false) {
        return {
          success: false,
          message: resData.error || 'Failed to place bid. You may have been outbid.',
        };
      }

      // Optimistically update local auction and leading status
      const updatedAuctions = auctions.map((it) => {
        if (it.id !== auctionId) return it;
        const newRecord: BidRecord = {
          bidId: `b-${Date.now()}`,
          bidderId: currentUser.id,
          bidderName: currentUser.name,
          amountIqd,
          timestamp: new Date().toLocaleTimeString(),
        };

        return {
          ...it,
          currentBidIqd: amountIqd,
          bidsCount: it.bidsCount + 1,
          endsAt: resData.newEndTime || it.endsAt,
          bidsHistory: [newRecord, ...(it.bidsHistory || [])].slice(0, 30),
        };
      });

      const updatedMyBids = [
        { auctionId, amountIqd, isLeading: true },
        ...myBids.filter((b) => b.auctionId !== auctionId),
      ];

      set({ auctions: updatedAuctions, myBids: updatedMyBids });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error placing bid' };
    }
  },

  // Won Items & COD Orders (Clean initial array)
  wonOrders: [],
  addWonOrder: (order) => set((state) => ({ wonOrders: [order, ...state.wonOrders] })),
}));
