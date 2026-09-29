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
  Share2,
  TrendingUp,
  Store,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL, formatCurrency } from '@/i18n/translations';
import { SlideToBidSlider } from './SlideToBidSlider';

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

  // Fast Bid Increment State
  const [selectedIncrement, setSelectedIncrement] = useState<number>(1000);
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);
  const [autoBidAmount, setAutoBidAmount] = useState('350000');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{ m: number; s: number; isUrgent: boolean; isExpired: boolean }>({
    m: 0,
    s: 0,
    isUrgent: false,
    isExpired: false,
  });

  useEffect(() => {
    if (!item) return;

    const calcTime = () => {
      const now = Date.now();
      const ends = new Date(item.auctionEndsAt).getTime();
      const diff = Math.max(0, Math.floor((ends - now) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTimeLeft({
        m,
        s,
        isUrgent: diff <= 60 && diff > 0,
        isExpired: diff <= 0,
      });
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [item?.auctionEndsAt]);

  if (!isOpen || !item) return null;

  const localized = item.multilingual[language] || item.multilingual.en;
  const currentAutoCeiling = myAutoBids[item.id];
  const nextBidAmount = item.currentBidIqd + selectedIncrement;

  // 1-Click WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const text = `🔥 Live Auction on Zeedo: ${localized.title}\n💰 Current Bid: ${formatCurrency(
      item.currentBidIqd,
      language
    )}\n🚚 100% Cash on Delivery (5-Min Doorstep Inspection)\n👉 Place your bid live: https://zeedo.auction`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handleConfirmBid = () => {
    if (!buyer) {
      onRequestKyc();
      return;
    }

    placeSlideBid(
      item.id,
      buyer?.name || 'Verified Buyer',
      buyer?.phone || '+964 750 000 0000'
    );
  };

  const handleSaveAutoBid = () => {
    const val = parseInt(autoBidAmount.replace(/\D/g, ''), 10);
    if (val && val > item.currentBidIqd) {
      setAutoBidCeiling(item.id, val);
      setShowAutoBidModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-white/10 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2 mb-1" />

        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE WAR ROOM</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {item.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Click WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Anti-Sniping Alert Banner (when ≤ 60s) */}
          {(item.isAntiSnipingActive || timeLeft.isUrgent) && (
            <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3 flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-black text-rose-300 block">⚡ ANTI-SNIPING ZONE (≤60s)</span>
                <span className="text-rose-400 text-[11px]">
                  Any bid placed now resets timer to 1:00 (Resets: {item.antiSnipingResetsCount || 0} times)
                </span>
              </div>
            </div>
          )}

          {/* Product Media & Main Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Main Image with Condition Badge */}
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-white/10">
                <img
                  src={item.imageUrl}
                  alt={localized.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold border border-white/10">
                  {item.condition}
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-emerald-500/90 text-slate-950 px-2.5 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>5-Min Inspection</span>
                </div>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2.5">
              <h3 className="font-black text-white text-base leading-snug">
                {localized.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {localized.description}
              </p>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant Store:</span>
                  <span className="font-bold text-white">{item.sellerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Retail Reference:</span>
                  <span className="font-bold text-slate-300">
                    ~{formatCurrency(item.estimatedRetailMarketPriceIqd, language)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Starting Bid:</span>
                  <span className="text-emerald-400 font-black">1,000 IQD Base</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Slide-to-Bid Interactive Console */}
          <div className="bg-slate-950 rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {t.currentBid}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    {formatCurrency(item.currentBidIqd, language)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {timeLeft.isExpired ? 'Status' : t.endsIn}
                </span>
                <span
                  className={`text-2xl font-mono font-black ${
                    timeLeft.isUrgent ? 'text-rose-400 animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {timeLeft.isExpired
                    ? 'ENDED'
                    : `${String(timeLeft.m).padStart(2, '0')}:${String(timeLeft.s).padStart(2, '0')}`}
                </span>
              </div>
            </div>

            {/* Fast-Bid Increment Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Select Bid Increment:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setSelectedIncrement(inc)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                      selectedIncrement === inc
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    +{inc.toLocaleString()} IQD
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Slide-to-Bid Swipe Slider */}
            <div className="pt-1">
              <SlideToBidSlider
                amountText={`+${selectedIncrement.toLocaleString()} IQD`}
                onBidConfirmed={handleConfirmBid}
                disabled={timeLeft.isExpired}
                isRtl={rtl}
              />
            </div>

            {/* Cash on Delivery Doorstep Guarantee */}
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/5">
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                100% Cash-on-Delivery: 5-minute doorstep inspection before paying physical cash.
              </span>
            </div>
          </div>

          {/* Recent Live Bids Feed */}
          {item.bidsHistory && item.bidsHistory.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Live Bidding Activity ({item.bidsHistory.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {item.bidsHistory.slice(0, 5).map((bid) => (
                  <div
                    key={bid.id}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <Gavel className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-slate-200">{bid.bidderName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-black">
                        {formatCurrency(bid.amountIqd, language)}
                      </span>
                      <span className="text-[10px] text-slate-500">{bid.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
