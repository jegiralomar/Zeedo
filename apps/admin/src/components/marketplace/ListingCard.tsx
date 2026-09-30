'use client';

import React, { useState, useEffect } from 'react';
import {
  Gavel,
  ShieldCheck,
  Bookmark,
  Timer,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { PriceOdometer } from './PriceOdometer';
import { PriceSparkline } from './PriceSparkline';

interface ListingCardProps {
  item: MobileAuctionItem;
  onOpenLiveRoom: (item: MobileAuctionItem) => void;
  onRequestKyc: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  onOpenLiveRoom,
  onRequestKyc,
}) => {
  const { language, buyer } = useBuyerAuthStore();
  const { savedAuctionIds, toggleSaveAuction, placeSlideBid } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const localized = item.multilingual[language] || item.multilingual.en;
  const isSaved = savedAuctionIds.includes(item.id);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{
    h: number;
    m: number;
    s: number;
    isExpired: boolean;
    isUrgent: boolean;
  }>({
    h: 0,
    m: 0,
    s: 0,
    isExpired: false,
    isUrgent: false,
  });

  const [biddingSuccess, setBiddingSuccess] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const ends = new Date(item.auctionEndsAt).getTime();
      const diff = Math.max(0, Math.floor((ends - now) / 1000));

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      setTimeLeft({
        h,
        m,
        s,
        isExpired: diff <= 0,
        isUrgent: diff <= 60 && diff > 0,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [item.auctionEndsAt]);

  const handleQuickBid = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buyer) {
      onRequestKyc();
      return;
    }

    const success = placeSlideBid(
      item.id,
      buyer.name || 'Verified Buyer',
      buyer.phone || '+964 750 000 0000'
    );
    if (success) {
      setBiddingSuccess(true);
      setTimeout(() => setBiddingSuccess(false), 2000);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveAuction(item.id);
  };

  return (
    <div
      onClick={() => onOpenLiveRoom(item)}
      className="group relative bg-white rounded-3xl border border-slate-200/70 hover:border-slate-300 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer select-none"
    >
      <div>
        {/* Product Image Box with Floating Badges */}
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={localized.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Pill Bar */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/60 shadow-2xs">
                {item.condition}
              </span>
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>100% COD</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleSave}
              className={`w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto backdrop-blur-md transition-all shadow-xs active:scale-90 ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/60'
              }`}
              title="Save Auction"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Bottom Countdown Timer Bar */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-xs flex items-center gap-1.5 transition-colors ${
                timeLeft.isUrgent
                  ? 'bg-rose-500 text-white animate-pulse'
                  : timeLeft.isExpired
                  ? 'bg-slate-900/80 text-slate-300'
                  : 'bg-slate-950/75 text-white'
              }`}
            >
              {timeLeft.isUrgent ? (
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span>
                {timeLeft.isExpired
                  ? 'ENDED'
                  : `${String(timeLeft.h).padStart(2, '0')}:${String(timeLeft.m).padStart(2, '0')}:${String(
                      timeLeft.s
                    ).padStart(2, '0')}`}
              </span>
            </div>

            {/* Sparkline mini trajectory */}
            <div className="hidden sm:block bg-white/85 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-200/50 shadow-2xs">
              <PriceSparkline
                bidsHistory={item.bidsHistory}
                startingPriceIqd={item.startingPriceIqd}
                currentBidIqd={item.currentBidIqd}
                width={70}
                height={20}
              />
            </div>
          </div>
        </div>

        {/* Card Content Details */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{item.sellerName}</span>
              <span className="font-mono">{item.totalBids || 0} bids</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 mt-0.5">
              {localized.title}
            </h3>
          </div>

          {/* Pricing & Odometer */}
          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">
                {t.currentBid}
              </span>
              <PriceOdometer value={item.currentBidIqd} size="lg" />
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">
                Retail Ref
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 line-through">
                {item.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Quick Action */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={handleQuickBid}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
            biddingSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {biddingSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bid Placed!</span>
            </>
          ) : (
            <>
              <Gavel className="w-3.5 h-3.5" />
              <span>Quick Bid (+{(item.incrementStepIqd || 1000).toLocaleString()})</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onOpenLiveRoom(item)}
          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-bold transition-colors"
          title="Open War Room"
        >
          Details
        </button>
      </div>
    </div>
  );
};
