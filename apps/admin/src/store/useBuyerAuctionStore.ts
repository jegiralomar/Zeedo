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
            const items: MobileAuctionItem[] = data.listings.map((l: any) => {
              const enTitle = l.multilingual?.en?.title || l.titles?.en || 'New Item';
              const arTitle = l.multilingual?.ar?.title || l.titles?.ar || enTitle;
              const ckbTitle = l.multilingual?.ckb?.title || l.titles?.ckb || enTitle;
              const badiniTitle = l.multilingual?.badini?.title || l.titles?.badini || enTitle;

              const enDesc = l.multilingual?.en?.description || l.descriptions?.en || '';
              const arDesc = l.multilingual?.ar?.description || l.descriptions?.ar || enDesc;
              const ckbDesc = l.multilingual?.ckb?.description || l.descriptions?.ckb || enDesc;
              const badiniDesc = l.multilingual?.badini?.description || l.descriptions?.badini || enDesc;

              const specs = l.multilingual?.en?.specs || l.specifications || [];
              const imageUrl =
                (Array.isArray(l.images) && l.images[0]) ||
                l.imageUrl ||
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

              return {
                id: l.id,
                sellerId: l.sellerId || 'sel-01',
                sellerName: l.sellerName || 'Zeedo Merchant',
                category: l.category || 'Consumer Electronics',
                condition: l.condition || 'New',
                imageUrl,
                startingPriceIqd: 1000,
                currentBidIqd: l.currentBidIqd || 1000,
                incrementStepIqd: l.incrementStepIqd || 1000,
                estimatedRetailMarketPriceIqd: l.estimatedRetailMarketPriceIqd || 150000,
                multilingual: {
                  en: { title: enTitle, description: enDesc, specs },
                  ar: { title: arTitle, description: arDesc, specs },
                  ckb: { title: ckbTitle, description: ckbDesc, specs },
                  badini: { title: badiniTitle, description: badiniDesc, specs },
                },
                submittedAt: l.submittedAt || new Date().toISOString(),
                auctionStartsAt: l.auctionStartsAt || new Date().toISOString(),
                auctionEndsAt: l.auctionEndsAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                status: 'live',
                isAntiSnipingActive: l.isAntiSnipingActive || false,
                antiSnipingResetsCount: l.antiSnipingResetsCount || 0,
                totalBids: l.totalBids || 0,
                highestBidder: l.highestBidder,
                bidsHistory: l.bidsHistory || [],
              };
            });

            set({ auctions: items });
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
            lastBidAlert: `Bid accepted: ${newBid.toLocaleString()} IQD on ${target.multilingual?.en?.title || (target as any).titles?.en || 'item'}`,
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
      name: 'zeedo_buyer_auction_prod_v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
