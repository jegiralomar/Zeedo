import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LanguageCode,
  UserRole,
  MobileUser,
  MobileAuctionItem,
  WonLotOrder,
  BidRecord,
  DeliveryLocation,
} from '../types';
import { ZEEDO_CONFIG } from '../config/api';

export type BuyerTab = 'auctions' | 'watchlist' | 'bag' | 'profile';

// Storage keys
const STORAGE_KEYS = {
  SESSION_TOKEN: 'zeedo_session_token',
  USER: 'zeedo_user',
  HAS_SEEN_INTRO: 'zeedo_has_seen_intro',
};

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

  // Hydration (load saved session from AsyncStorage on app start)
  hydrate: () => Promise<void>;
  isHydrated: boolean;

  // Location & Profile Setup
  isLocationSetupOpen: boolean;
  openLocationSetup: () => void;
  closeLocationSetup: () => void;
  saveDeliveryLocation: (loc: DeliveryLocation, sessionToken: string) => Promise<void>;
  updateUserProfile: (updates: Partial<MobileUser>, sessionToken?: string) => Promise<void>;

  // Active Tab & Full Screen Selection
  activeTab: BuyerTab;
  setActiveTab: (tab: BuyerTab) => void;
  activeScreen?: string;
  setActiveScreen: (s: string) => void;
  selectedAuctionId: string | null;
  setSelectedAuctionId: (id: string | null) => void;

  // Merchant Sub-Screens
  merchantScreen: 'dashboard' | 'orders' | 'ledger' | 'create_auction';
  setMerchantScreen: (s: 'dashboard' | 'orders' | 'ledger' | 'create_auction') => void;

  // Auctions Catalog (Live from Server)
  auctions: MobileAuctionItem[];
  isLoadingAuctions: boolean;
  auctionsFetchError: boolean;
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
  // Patch a single auction from a WS event (keeps the list fresh without a full refetch)
  patchAuction: (auctionId: string, updates: Partial<import('../types').MobileAuctionItem>) => void;

  // Won Items & COD Orders
  wonOrders: WonLotOrder[];
  isLoadingWonOrders: boolean;
  fetchWonOrders: () => Promise<void>;
  addWonOrder: (order: WonLotOrder) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: 'ar',
  setLanguage: (lang) => set({ language: lang }),

  hasSeenIntro: false,
  completeIntro: () => {
    AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, 'true').catch(() => {});
    set({ hasSeenIntro: true });
  },

  currentUser: null,
  sessionToken: null,
  userRole: 'guest',
  isAuthModalOpen: false,
  isHydrated: false,

  /**
   * Hydrate store from AsyncStorage — must be called once on app mount.
   * Replaces the old synchronous localStorage initialization pattern.
   */
  hydrate: async () => {
    try {
      const [userJson, token, seenIntro] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO),
      ]);

      const introSeen = seenIntro === 'true';

      if (userJson && token) {
        try {
          const user: MobileUser = JSON.parse(userJson);
          set({
            currentUser: user,
            sessionToken: token,
            userRole: user.role,
            hasSeenIntro: introSeen,
            isHydrated: true,
          });
          // Silently refresh won orders in background
          get().fetchWonOrders().catch(() => {});
          return;
        } catch {
          // Corrupted JSON — clear it
          await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.USER),
            AsyncStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN),
          ]);
        }
      }

      set({ hasSeenIntro: introSeen, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  loginWithSession: (token, user) => {
    // Persist to AsyncStorage (works on both native APK and web)
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
    ]).catch(() => {});

    set({
      currentUser: user,
      sessionToken: token,
      userRole: user.role,
      isAuthModalOpen: false,
      activeTab: 'auctions',
    });

    // Fetch won orders for the newly logged-in user
    get().fetchWonOrders().catch(() => {});
  },

  logout: () => {
    Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]).catch(() => {});
    set({
      currentUser: null,
      sessionToken: null,
      userRole: 'guest',
      activeTab: 'auctions',
      myBids: [],
      wonOrders: [],
    });
  },

  isLocationSetupOpen: false,
  openLocationSetup: () => set({ isLocationSetupOpen: true }),
  closeLocationSetup: () => set({ isLocationSetupOpen: false }),

  saveDeliveryLocation: async (loc, sessionToken) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, deliveryLocation: loc, city: loc.city };

    // Persist locally first
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser)).catch(() => {});
    set({ currentUser: updatedUser, isLocationSetupOpen: false });

    // Sync to server (non-blocking)
    try {
      await fetch(ZEEDO_CONFIG.ENDPOINTS.PATCH_PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          city: loc.city,
          deliveryAddress: loc.address,
          deliveryLat: loc.lat,
          deliveryLng: loc.lng,
        }),
      });
    } catch (_) {
      // Server sync is best-effort; location is already saved locally
    }
  },

  updateUserProfile: async (updates, token) => {
    const { currentUser, sessionToken } = get();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };

    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser)).catch(() => {});
    set({ currentUser: updatedUser });

    const effectiveToken = token || sessionToken;
    if (effectiveToken) {
      try {
        await fetch(ZEEDO_CONFIG.ENDPOINTS.PATCH_PROFILE, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify({
            name: updates.name,
            gender: updates.gender,
            avatar: updates.avatar,
            city: updates.city,
            deliveryAddress: updates.deliveryLocation?.address,
            deliveryLat: updates.deliveryLocation?.lat,
            deliveryLng: updates.deliveryLocation?.lng,
          }),
        });
      } catch (_) {
        // Best-effort
      }
    }
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

  // Live Auctions from Production Server
  auctions: [],
  isLoadingAuctions: false,
  auctionsFetchError: false,

  fetchAuctions: async () => {
    set({ isLoadingAuctions: true, auctionsFetchError: false });
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
          set({ auctions: mapped, auctionsFetchError: false });
        }
      } else {
        set({ auctionsFetchError: true });
      }
    } catch (_err) {
      set({ auctionsFetchError: true });
    } finally {
      set({ isLoadingAuctions: false });
    }
  },

  selectedCategory: 'all',
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Watchlist
  watchlistIds: [],
  toggleWatchlist: (id) => {
    const { watchlistIds } = get();
    if (watchlistIds.includes(id)) {
      set({ watchlistIds: watchlistIds.filter((x) => x !== id) });
    } else {
      set({ watchlistIds: [...watchlistIds, id] });
    }
  },

  // Active Bids
  myBids: [],

  // Real Bidding Submission
  placeBid: async (auctionId, amountIqd) => {
    const { currentUser, openAuthModal, auctions, myBids, sessionToken } = get();

    if (!currentUser) {
      openAuthModal();
      return { success: false, message: 'Login required' };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const response = await fetch(ZEEDO_CONFIG.ENDPOINTS.PLACE_BID, {
        method: 'POST',
        headers,
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

      // Use the server-authoritative bid amount and step — not the client-computed one
      const serverBidIqd = resData.auction?.currentBidIqd ?? amountIqd;
      const serverStep = resData.auction?.incrementStepIqd;
      const serverEndsAt = resData.auction?.auctionEndsAt;

      const updatedAuctions = auctions.map((it) => {
        if (it.id !== auctionId) return it;
        const newRecord: BidRecord = {
          bidId: resData.bid?.bidId || `b-${Date.now()}`,
          bidderId: currentUser.id,
          bidderName: currentUser.name,
          amountIqd: serverBidIqd,
          timestamp: new Date().toLocaleTimeString(),
        };

        return {
          ...it,
          currentBidIqd: serverBidIqd,
          bidsCount: it.bidsCount + 1,
          endsAt: serverEndsAt || it.endsAt,
          // Update increment step if server sends a new tier-based step
          ...(serverStep ? { incrementStepIqd: serverStep } : {}),
          bidsHistory: [newRecord, ...(it.bidsHistory || [])].slice(0, 30),
        };
      });

      const updatedMyBids = [
        { auctionId, amountIqd: serverBidIqd, isLeading: true },
        ...myBids.filter((b) => b.auctionId !== auctionId),
      ];

      set({ auctions: updatedAuctions, myBids: updatedMyBids });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error placing bid' };
    }
  },

  // Patch a single auction live (called by WS hook)
  patchAuction: (auctionId, updates) =>
    set((state) => ({
      auctions: state.auctions.map((a) =>
        a.id === auctionId ? { ...a, ...updates } : a
      ),
    })),

  // Won Items & COD Orders
  wonOrders: [],
  isLoadingWonOrders: false,
  fetchWonOrders: async () => {
    set({ isLoadingWonOrders: true });
    try {
      const { currentUser, sessionToken } = get();
      const url = currentUser?.id
        ? `${ZEEDO_CONFIG.ENDPOINTS.WON_ORDERS}?userId=${encodeURIComponent(currentUser.id)}`
        : ZEEDO_CONFIG.ENDPOINTS.WON_ORDERS;

      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.wonOrders)) {
          set({ wonOrders: data.wonOrders, isLoadingWonOrders: false });
          return;
        }
      }
    } catch {
      // Keep existing state on network error
    }
    set({ isLoadingWonOrders: false });
  },
  addWonOrder: (order) => set((state) => ({ wonOrders: [order, ...state.wonOrders] })),
}));
