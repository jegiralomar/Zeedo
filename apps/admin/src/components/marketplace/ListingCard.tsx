'use client';

import React, { useState, useEffect } from 'react';
import {
  Gavel,
  ShieldCheck,
  Bookmark,
  Timer,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL, formatCurrency } from '@/i18n/translations';

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
  const [timeLeft, setTimeLeft] = useState<{ m: number; s: number; isExpired: boolean; isUrgent: boolean }>({
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

      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTimeLeft({
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
      buyer?.name || 'Verified Buyer',
      buyer?.phone || '+964 750 000 0000'
    );
    if (success) {
      setBiddingSuccess(true);
      setTimeout(() => setBiddingSuccess(false), 2000);
    }
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      onClick={() => onOpenLiveRoom(item)}
      className="bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-emerald-500/40 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={item.imageUrl}
          alt={localized.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges Row */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/70 backdrop-blur-md text-slate-300 border border-white/10">
            {item.condition}
          </span>

          {/* Live / Soft-Close status */}
          {item.isAntiSnipingActive || timeLeft.isUrgent ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-lg shadow-rose-600/30 animate-pulse">
              <Timer className="w-3 h-3" />
              <span>≤60s RESET ZONE</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
              <span>LIVE NOW</span>
            </span>
          )}
        </div>

        {/* Floating Price Pill Over Image */}
        <div
          className={`absolute bottom-3 ${
            rtl ? 'right-3' : 'left-3'
          } bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl border border-white/15`}
        >
          <span className="text-[10px] font-mono text-slate-400 block leading-tight">
            {t.currentBid}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-black text-emerald-400 text-base">
              {formatCurrency(item.currentBidIqd, language)}
            </span>
          </div>
        </div>

        {/* 100% COD Badge */}
        <div
          className={`absolute bottom-3 ${
            rtl ? 'left-3' : 'right-3'
          } bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 backdrop-blur-md`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>COD</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h4 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {localized.title}
          </h4>

          {/* Clean Meta Row */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
            <span>By {item.sellerName}</span>
            <span className="text-slate-500">
              Retail: ~{formatCurrency(item.estimatedRetailMarketPriceIqd, language)}
            </span>
          </div>
        </div>

        {/* Footer Row: Live Timer & Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Ticking Time */}
          <div
            className={`flex items-center gap-1.5 font-mono text-xs font-bold ${
              timeLeft.isUrgent ? 'text-rose-400 animate-pulse' : 'text-slate-300'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 ${timeLeft.isUrgent ? 'animate-spin' : ''}`} />
            <span>
              {timeLeft.isExpired
                ? 'COMPLETED'
                : `${String(timeLeft.m).padStart(2, '0')}:${String(timeLeft.s).padStart(2, '0')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Watchlist Bookmark */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveAuction(item.id);
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-white/5'
              }`}
              title="Save to Watchlist"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
            </button>

            {/* Quick Bid Button */}
            <button
              onClick={handleQuickBid}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95 ${
                biddingSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {biddingSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Placed!</span>
                </>
              ) : (
                <>
                  <Gavel className="w-3.5 h-3.5" />
                  <span>+{item.incrementStepIqd.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
