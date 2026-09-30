import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MobileAuctionItem } from '../types/marketplace';

interface BuyerAuctionStoreState {
  auctions: MobileAuctionItem[];
  myAutoBids: Record<string, number>; // auctionId -> ceiling IQD
  lastBidAlert: string | null;
  savedAuctionIds: string[];

  // Actions
  addAuction: (item: MobileAuctionItem) => void;
  syncLiveAuctionsFromDb: () => Promise<void>;
  placeSlideBid: (auctionId: string, bidderName: string, bidderPhone: string) => boolean;
  setAutoBidCeiling: (auctionId: string, ceilingIqd: number) => void;
  toggleSaveAuction: (auctionId: string) => void;
  clearLastBidAlert: () => void;
  tickTimers: () => void;
}

export const INITIAL_MARKETPLACE_AUCTIONS: MobileAuctionItem[] = [];

export const useBuyerAuctionStore = create<BuyerAuctionStoreState>()(
  persist(
    (set, get) => ({
      auctions: INITIAL_MARKETPLACE_AUCTIONS,
      myAutoBids: {},
      lastBidAlert: null,
      savedAuctionIds: [],

      addAuction: (item) => {
        set((state) => ({
          auctions: [item, ...state.auctions.filter((a) => a.id !== item.id)],
        }));
      },

      syncLiveAuctionsFromDb: async () => {
        if (typeof window === 'undefined') return;
        try {
          const res = await fetch('/api/listings?status=live');
          const data = await res.json();
          if (data.success && Array.isArray(data.listings)) {
            const items: MobileAuctionItem[] = data.listings.map((l: any) => ({
              id: l.id,
              sellerId: l.sellerId,
              sellerName: l.sellerName,
              titles: {
                en: l.multilingual?.en?.title || 'New Item',
                ar: l.multilingual?.ar?.title || l.multilingual?.en?.title || 'منتج جديد',
                ckb: l.multilingual?.ckb?.title || l.multilingual?.en?.title || 'کاڵای نوێ',
                badini: l.multilingual?.badini?.title || l.multilingual?.en?.title || 'کەلەپەلی نوی',
              },
              descriptions: {
                en: l.multilingual?.en?.description || '',
                ar: l.multilingual?.ar?.description || '',
                ckb: l.multilingual?.ckb?.description || '',
                badini: l.multilingual?.badini?.description || '',
              },
              specifications: l.multilingual?.en?.specs || [],
              images: l.images || [],
              startingPriceIqd: 1000,
              currentBidIqd: l.currentBidIqd || 1000,
              estimatedRetailPriceIqd: l.estimatedRetailMarketPriceIqd || 150000,
              incrementStepIqd: l.incrementStepIqd || 1000,
              status: 'live',
              totalBids: l.totalBids || 0,
              bidsHistory: l.bidsHistory || [],
              auctionStartsAt: l.auctionStartsAt,
              auctionEndsAt: l.auctionEndsAt,
              isAntiSnipingActive: l.isAntiSnipingActive || false,
              antiSnipingResetsCount: l.antiSnipingResetsCount || 0,
              category: l.category || 'Consumer Electronics',
              condition: l.condition || 'New',
            }));
            set((state) => {
              const dbMap = new Map(items.map((i) => [i.id, i]));
              const merged = [...items];
              for (const local of state.auctions) {
                if (!dbMap.has(local.id)) {
                  merged.push(local);
                }
              }
              return { auctions: merged };
            });
          }
        } catch (err) {
          console.warn('syncLiveAuctionsFromDb error:', err);
        }
      },

      placeSlideBid: (auctionId, bidderName, bidderPhone) => {
        let success = false;
        set((state) => {
          const target = state.auctions.find((a) => a.id === auctionId);
          if (!target || target.status !== 'live') return state;

          // Dynamic step based on price tier
          let step = target.incrementStepIqd || 1000;
          if (target.currentBidIqd >= 200000) step = 3000;
          else if (target.currentBidIqd >= 100000) step = 2000;

          const newBid = target.currentBidIqd + step;
          const now = new Date();
          const currentEnds = new Date(target.auctionEndsAt).getTime();
          const diffSecs = (currentEnds - now.getTime()) / 1000;

          // 60-second Anti-Sniping soft close extension
          let newEndsAt = target.auctionEndsAt;
          let resetsCount = target.antiSnipingResetsCount || 0;
          let isAntiSnipingActive = target.isAntiSnipingActive || false;

          if (diffSecs <= 60 && diffSecs > 0) {
            newEndsAt = new Date(now.getTime() + 60 * 1000).toISOString();
            resetsCount += 1;
            isAntiSnipingActive = true;
          }

          const newRecord = {
            id: `bid-${Date.now()}`,
            bidderId: `usr-${Date.now()}`,
            bidderName: bidderName || 'Authorized Buyer',
            bidderPhone: bidderPhone || '+964 750 000 0000',
            amountIqd: newBid,
            timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
          };

          const updatedAuctions = state.auctions.map((a) => {
            if (a.id !== auctionId) return a;
            return {
              ...a,
              currentBidIqd: newBid,
              totalBids: (a.totalBids || 0) + 1,
              auctionEndsAt: newEndsAt,
              antiSnipingResetsCount: resetsCount,
              isAntiSnipingActive,
              highestBidder: {
                id: newRecord.bidderId,
                name: newRecord.bidderName,
                phone: bidderPhone || '+964 750 000 0000',
              },
              bidsHistory: [newRecord, ...(a.bidsHistory || [])],
            };
          });

          success = true;
          return {
            auctions: updatedAuctions,
            lastBidAlert: `Bid accepted: ${newBid.toLocaleString()} IQD on ${target.multilingual.en?.title || 'item'}`,
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
    }),
    {
      name: 'zeedo_buyer_auction_prod_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
