'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Gavel,
  ShieldCheck,
  Bookmark,
  Timer,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { PriceOdometer } from './PriceOdometer';
import { PriceSparkline } from './PriceSparkline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  item: MobileAuctionItem;
  onOpenLiveRoom: (item: MobileAuctionItem) => void;
  onRequestKyc: () => void;
  variant?: 'compact' | 'detailed';
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  onOpenLiveRoom,
  onRequestKyc,
  variant = 'detailed',
}) => {
  const { language, buyer, isAuthenticated, isTwoGateVerified, setPendingAction } = useBuyerAuthStore();
  const { savedAuctionIds, toggleSaveAuction, placeSlideBid } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const localized = item.multilingual?.[language] || item.multilingual?.en || {
    title: 'Listing Details Unavailable',
    description: '',
    specs: [],
  };
  const isSaved = savedAuctionIds.includes(item.id);

  // Price pulse tracking for visual-only highlight
  const prevBidRef = useRef(item.currentBidIqd);
  const [isPricePulsing, setIsPricePulsing] = useState(false);
  const [biddingSuccess, setBiddingSuccess] = useState(false);

  useEffect(() => {
    if (item.currentBidIqd > prevBidRef.current) {
      setIsPricePulsing(true);
      const timer = setTimeout(() => setIsPricePulsing(false), 1600);
      prevBidRef.current = item.currentBidIqd;
      return () => clearTimeout(timer);
    }
    prevBidRef.current = item.currentBidIqd;
  }, [item.currentBidIqd]);

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
    if (!isAuthenticated || !buyer || !isTwoGateVerified()) {
      setPendingAction({ type: 'bid', targetId: item.id });
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
      setIsPricePulsing(true);
      setTimeout(() => {
        setBiddingSuccess(false);
        setIsPricePulsing(false);
      }, 2000);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !buyer || !isTwoGateVerified()) {
      setPendingAction({ type: 'bookmark', targetId: item.id });
      onRequestKyc();
      return;
    }
    toggleSaveAuction(item.id);
  };

  const isHighlighted = isPricePulsing || biddingSuccess;

  // ----------------------------------------------------
  // COMPACT 2-COLUMN VIEW (Optimized for Mobile Browsing)
  // ----------------------------------------------------
  if (variant === 'compact') {
    return (
      <div
        onClick={() => onOpenLiveRoom(item)}
        className={cn(
          'group relative bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer select-none',
          isHighlighted
            ? 'border-emerald-500 ring-2 ring-emerald-500/80 shadow-md shadow-emerald-500/10'
            : 'border-slate-200/90 hover:border-[#5B50D6]/40 shadow-xs hover:shadow-lg hover:-translate-y-0.5'
        )}
      >
        <div>
          {/* Product Image Stage */}
          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={localized.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Top Badges Overlay */}
            <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
              <Badge variant="outline" size="sm" className="bg-white/95 backdrop-blur-md shadow-2xs font-bold text-slate-800">
                {item.condition}
              </Badge>

              <button
                type="button"
                onClick={handleToggleSave}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center pointer-events-auto backdrop-blur-md transition-all shadow-2xs active:scale-90',
                  isSaved
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200/60'
                )}
                title="Save Auction"
              >
                <Bookmark className={cn('w-3 h-3', isSaved && 'fill-rose-500')} />
              </button>
            </div>

            {/* Bottom Timer Pill Overlay */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none">
              <div
                className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-mono font-black backdrop-blur-md shadow-2xs flex items-center gap-1.5 transition-colors',
                  timeLeft.isUrgent
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                    : timeLeft.isExpired
                    ? 'bg-slate-900/85 text-slate-300'
                    : 'bg-[#1E2235]/90 text-white border border-white/10'
                )}
              >
                {timeLeft.isUrgent ? (
                  <Flame className="w-3 h-3 text-amber-300 animate-bounce" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-300" />
                )}
                <span>
                  {timeLeft.isExpired
                    ? 'ENDED'
                    : `${String(timeLeft.h).padStart(2, '0')}:${String(timeLeft.m).padStart(2, '0')}:${String(
                        timeLeft.s
                      ).padStart(2, '0')}`}
                </span>
              </div>

              {item.isAntiSnipingActive && (
                <Badge variant="live" size="sm" className="bg-rose-600 text-white border-none py-0.5">
                  ≤60S
                </Badge>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3 space-y-2">
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
              {localized.title}
            </h3>

            {/* Pricing Details */}
            <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-1">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">
                    {t.currentBid}
                  </span>
                  {isHighlighted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <PriceOdometer value={item.currentBidIqd} size="sm" className="sm:hidden" />
                <PriceOdometer value={item.currentBidIqd} size="md" className="hidden sm:inline-flex" />
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">
                  Retail
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 line-through">
                  {item.estimatedRetailMarketPriceIqd >= 1000000
                    ? `${(item.estimatedRetailMarketPriceIqd / 1000000).toFixed(1)}M`
                    : `${Math.round(item.estimatedRetailMarketPriceIqd / 1000)}k`} IQD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Tap Quick Action */}
        <div className="p-2 sm:p-2.5 bg-[#F5F6FA] border-t border-slate-100">
          <Button
            type="button"
            onClick={handleQuickBid}
            variant={biddingSuccess ? 'success' : 'default'}
            size="sm"
            className="w-full text-[11px] sm:text-xs font-black shadow-xs"
            leftIcon={biddingSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Gavel className="w-3 h-3" />}
          >
            {biddingSuccess
              ? 'Bid Placed!'
              : `+${(item.incrementStepIqd || 1000).toLocaleString()} IQD`}
          </Button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // DETAILED 1-COLUMN FEED VIEW (Spacious & High-Impact)
  // ----------------------------------------------------
  return (
    <div
      onClick={() => onOpenLiveRoom(item)}
      className={cn(
        'group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer select-none',
        isHighlighted
          ? 'border-emerald-500 ring-2 ring-emerald-500/80 shadow-lg shadow-emerald-500/10'
          : 'border-slate-200/90 hover:border-[#5B50D6]/40 shadow-xs hover:shadow-xl hover:-translate-y-1'
      )}
    >
      <div>
        {/* Product Image Box with Floating Badges */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={localized.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Pill Bar */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <Badge variant="outline" size="default" className="bg-white/95 backdrop-blur-md shadow-2xs font-extrabold text-slate-800">
              {item.condition}
            </Badge>

            <button
              type="button"
              onClick={handleToggleSave}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto backdrop-blur-md transition-all shadow-xs active:scale-90',
                isSaved
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200/60'
              )}
              title="Save Auction"
            >
              <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-rose-500')} />
            </button>
          </div>

          {/* Bottom Countdown Timer Bar */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <div
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-mono font-black backdrop-blur-md shadow-xs flex items-center gap-1.5 transition-colors',
                timeLeft.isUrgent
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                  : timeLeft.isExpired
                  ? 'bg-slate-900/80 text-slate-300'
                  : 'bg-[#1E2235]/90 text-white border border-white/10'
              )}
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
            <div className="hidden sm:block bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
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
              <span className="font-bold text-slate-600">{item.sellerName}</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold">{item.totalBids || 0} bids</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 mt-1">
              {localized.title}
            </h3>
          </div>

          {/* Pricing & Odometer */}
          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  {t.currentBid}
                </span>
                {isHighlighted && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full animate-bounce">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>+{((item.incrementStepIqd || 1000)).toLocaleString()} IQD</span>
                  </span>
                )}
              </div>
              <PriceOdometer value={item.currentBidIqd} size="lg" />
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                Retail Ref
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 line-through">
                {item.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Quick Action */}
      <div className="p-3 bg-[#F5F6FA] border-t border-slate-100 flex items-center gap-2">
        <Button
          type="button"
          onClick={handleQuickBid}
          variant={biddingSuccess ? 'success' : 'default'}
          size="default"
          className="flex-1 font-black shadow-md shadow-indigo-500/25"
          leftIcon={biddingSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Gavel className="w-3.5 h-3.5" />}
        >
          {biddingSuccess
            ? 'Bid Placed!'
            : `Quick Bid (+${(item.incrementStepIqd || 1000).toLocaleString()})`}
        </Button>

        <Button
          type="button"
          onClick={() => onOpenLiveRoom(item)}
          variant="secondary"
          size="default"
          className="px-4 font-bold"
          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
        >
          Details
        </Button>
      </div>
    </div>
  );
};
