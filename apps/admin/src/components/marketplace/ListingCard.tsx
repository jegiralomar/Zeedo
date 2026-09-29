'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gavel,
  ShieldCheck,
  Bookmark,
  Timer,
  ChevronRight,
  Flame,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';

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
  const { language, buyer, isTwoGateVerified } = useBuyerAuthStore();
  const { savedAuctionIds, toggleSaveAuction, placeSlideBid } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const localized = item.multilingual[language] || item.multilingual.en;
  const isSaved = savedAuctionIds.includes(item.id);

  // Countdown timer state
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

  const getDialectBadgeText = () => {
    switch (language) {
      case 'badini':
        return 'بادینی (RTL)';
      case 'ckb':
        return 'سۆرانی (RTL)';
      case 'ar':
        return 'عربي (RTL)';
      default:
        return 'English';
    }
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      onClick={() => onOpenLiveRoom(item)}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer hover:border-blue-400"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={localized.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges Row */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Dialect pill */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/20">
            {getDialectBadgeText()}
          </span>

          {/* Live / Soft-Close status */}
          {item.isAntiSnipingActive || timeLeft.isUrgent ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-md animate-pulse">
              <Timer className="w-3 h-3" />
              <span>SOFT CLOSE</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>LIVE NOW</span>
            </span>
          )}
        </div>

        {/* Floating Price Pill Over Image */}
        <div
          className={`absolute bottom-3 ${
            rtl ? 'right-3' : 'left-3'
          } bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-200/60`}
        >
          <span className="text-[10px] font-semibold text-slate-500 block leading-tight">
            {t.currentBid}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-base text-slate-900 font-mono">
              {item.currentBidIqd.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-blue-600">IQD</span>
          </div>
        </div>

        {/* Verified Badge */}
        <div
          className={`absolute bottom-3 ${
            rtl ? 'left-3' : 'right-3'
          } bg-emerald-500/90 text-white px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{rtl ? 'ڕەسەن' : 'Verified'}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {localized.title}
          </h4>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {localized.description}
          </p>

          {/* Specification Pills */}
          {localized.specs && localized.specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {localized.specs.slice(0, 3).map((spec, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-lg border border-slate-200/60 truncate max-w-[150px]"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Row: Live Timer & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Ticking Time */}
          <div
            className={`flex items-center gap-1.5 font-mono text-xs font-bold ${
              timeLeft.isUrgent ? 'text-rose-600' : 'text-slate-700'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 ${timeLeft.isUrgent ? 'animate-spin' : ''}`} />
            <span>
              {String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveAuction(item.id);
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
            </button>

            {/* Quick Bid / Live Room CTA */}
            <button
              onClick={handleQuickBid}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all ${
                biddingSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
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
