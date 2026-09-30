'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Gavel,
  ShieldCheck,
  Timer,
  Flame,
  Truck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { PriceOdometer } from './PriceOdometer';
import { PriceSparkline } from './PriceSparkline';
import { SlideToBidSlider } from './SlideToBidSlider';
import { PhotoCarousel } from './PhotoCarousel';
import { LiveBidTickerPill } from './LiveBidTickerPill';

interface LiveAuctionRoomModalProps {
  item: MobileAuctionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestKyc: () => void;
}

export const LiveAuctionRoomModal: React.FC<LiveAuctionRoomModalProps> = ({
  item,
  isOpen,
  onClose,
  onRequestKyc,
}) => {
  const { language, buyer } = useBuyerAuthStore();
  const { placeSlideBid, setAutoBidCeiling, myAutoBids } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [bidding, setBidding] = useState(false);
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);
  const [autoBidAmount, setAutoBidAmount] = useState('');

  // Countdown timer state
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
    if (!item) return;
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
  }, [item?.auctionEndsAt]);

  if (!isOpen || !item) return null;

  const localized = item.multilingual?.[language] || item.multilingual?.en || { title: 'Listing Details Unavailable', description: '', specs: [] };
  const currentAutoCeiling = myAutoBids[item.id];
  const currentStep = item.incrementStepIqd || 1000;

  const handlePlaceBid = (customIncrement?: number) => {
    if (!buyer) {
      onRequestKyc();
      return;
    }

    setBidding(true);
    const inc = customIncrement || currentStep;
    const success = placeSlideBid(
      item.id,
      buyer.name || 'Verified Buyer',
      buyer.phone || '+964 750 000 0000'
    );

    if (success) {
      setBidSuccessMessage(`Bid Accepted! (+${inc.toLocaleString()} IQD)`);
      setTimeout(() => setBidSuccessMessage(null), 2500);
    }
    setBidding(false);
  };

  const handleSaveAutoBid = () => {
    const val = parseInt(autoBidAmount.replace(/\D/g, ''), 10);
    if (val && val > item.currentBidIqd) {
      setAutoBidCeiling(item.id, val);
      setShowAutoBidModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <LiveBidTickerPill />
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shadow-2xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Anti-Sniping Alert Ribbon if active */}
          {item.isAntiSnipingActive && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-3 flex items-center justify-between animate-pulse text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-rose-950 block">ANTI-SNIPING SOFT CLOSE ACTIVE</span>
                  <span className="text-rose-700 text-[11px]">
                    Timer reset to 1:00 on bids under 60 seconds ({item.antiSnipingResetsCount} extensions)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Product Gallery & Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <PhotoCarousel
              images={[item.imageUrl]}
              title={localized.title}
              aspectRatio="square"
            />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {item.condition}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Store: <strong className="text-slate-900">{item.sellerName}</strong>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {localized.title}
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {localized.description || 'Verified authentic merchandise. 100% Cash-on-Delivery.'}
              </p>

              {/* Badges Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800">5-Min Doorstep Inspection</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800">Pay Cash on Delivery</span>
                </div>
              </div>

              {/* Retail Baseline */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Retail Value:</span>
                <span className="font-bold text-slate-800">
                  {item.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Price Console */}
          <div className="p-5 rounded-3xl bg-slate-950 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                  {t.currentBid}
                </span>
                <PriceOdometer value={item.currentBidIqd} size="xl" className="text-white" />
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                  Time Remaining
                </span>
                <div
                  className={`text-xl font-mono font-black ${
                    timeLeft.isUrgent ? 'text-amber-400 animate-pulse' : 'text-white'
                  }`}
                >
                  {timeLeft.isExpired
                    ? 'AUCTION ENDED'
                    : `${String(timeLeft.h).padStart(2, '0')}:${String(timeLeft.m).padStart(2, '0')}:${String(
                        timeLeft.s
                      ).padStart(2, '0')}`}
                </div>
              </div>
            </div>

            {/* Price Sparkline & Bids Count */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                Total Activity: <strong className="text-white">{item.totalBids || 0} bids placed</strong>
              </span>
              <PriceSparkline
                bidsHistory={item.bidsHistory}
                startingPriceIqd={item.startingPriceIqd}
                currentBidIqd={item.currentBidIqd}
                width={120}
                height={26}
              />
            </div>
          </div>

          {/* Tactile Bidding Section */}
          <div className="space-y-3">
            {bidSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{bidSuccessMessage}</span>
              </div>
            )}

            {/* Quick Bid Jump Chips */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Quick Jump:</span>
              {[1000, 2000, 5000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handlePlaceBid(inc)}
                  disabled={bidding || timeLeft.isExpired}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 border border-slate-200/80 text-xs font-mono font-bold transition-all disabled:opacity-40"
                >
                  +{inc.toLocaleString()} IQD
                </button>
              ))}
            </div>

            {/* Tactile Slide-To-Bid Slider */}
            <SlideToBidSlider
              onConfirm={() => handlePlaceBid(currentStep)}
              amountIqd={currentStep}
              disabled={bidding || timeLeft.isExpired}
              label={timeLeft.isExpired ? 'Auction Concluded' : 'Slide to Place Bid'}
            />

            {/* Auto-Bid Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowAutoBidModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {currentAutoCeiling
                    ? `Auto-Bid Ceiling Active: ${currentAutoCeiling.toLocaleString()} IQD`
                    : 'Configure Auto-Bid Ceiling'}
                </span>
              </button>

              <span className="text-[11px] text-slate-400 font-mono">
                Step: +{currentStep.toLocaleString()} IQD
              </span>
            </div>
          </div>

          {/* Auto-Bid Dialog */}
          {showAutoBidModal && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Set Maximum Auto-Bid Ceiling</span>
                <button
                  onClick={() => setShowAutoBidModal(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                System automatically counter-bids on your behalf using official step tiers up to your ceiling.
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={autoBidAmount}
                  onChange={(e) => setAutoBidAmount(e.target.value)}
                  placeholder={`Min: ${(item.currentBidIqd + currentStep).toLocaleString()} IQD`}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleSaveAutoBid}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Set Ceiling
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
