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
