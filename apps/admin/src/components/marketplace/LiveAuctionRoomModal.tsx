'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Gavel,
  ShieldCheck,
  Timer,
  Flame,
  Radio,
  Clock,
  Coins,
  Truck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';

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
  const { language, buyer, isTwoGateVerified } = useBuyerAuthStore();
  const { placeSlideBid, setAutoBidCeiling, myAutoBids } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [bidding, setBidding] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);
  const [autoBidAmount, setAutoBidAmount] = useState('350000');

  if (!isOpen || !item) return null;

  const localized = item.multilingual[language] || item.multilingual.en;
  const currentAutoCeiling = myAutoBids[item.id];

  const handlePlaceBid = (increment?: number) => {
    if (!isTwoGateVerified()) {
      onRequestKyc();
      return;
    }

    setBidding(true);
    const success = placeSlideBid(item.id, buyer.name, buyer.phone);
    if (success) {
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 2500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>LIVE WAR ROOM</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {item.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Anti-Sniping Alert Banner */}
          {item.isAntiSnipingActive && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-rose-950 block">{t.softCloseAlert}</span>
                <span className="text-rose-700 text-[11px]">
                  {t.softCloseResets}: {item.antiSnipingResetsCount} times
                </span>
              </div>
            </div>
          )}

          {/* Product Image & Main Details Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
              <img
                src={item.imageUrl}
                alt={localized.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold">
                {item.condition}
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Stock</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                {localized.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {localized.description}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Seller Merchant:</span>
                  <span className="font-semibold text-slate-900">{item.sellerName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Retail Market:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {item.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Starting Bid:</span>
                  <span className="font-mono text-emerald-700 font-bold">1,000 IQD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Bidding Console */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  {t.currentBid}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                    {item.currentBidIqd.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">IQD</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">{t.endsIn}</span>
                <span className="text-xl font-mono font-bold text-rose-400">
                  {new Date(item.auctionEndsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Quick Bid Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => handlePlaceBid()}
                disabled={bidding}
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Gavel className="w-4 h-4" />
                <span>
                  {bidSuccess
                    ? 'BID CONFIRMED!'
                    : `BID +${item.incrementStepIqd.toLocaleString()} IQD`}
                </span>
              </button>

              <button
                onClick={() => setShowAutoBidModal(true)}
                className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>
                  {currentAutoCeiling
                    ? `Auto: ${currentAutoCeiling.toLocaleString()} IQD`
                    : t.autoBidButton}
                </span>
              </button>
            </div>

            {/* Doorstep Inspection Guarantee */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 border-t border-white/10">
              <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                100% Cash-on-Delivery: Inspect unit for 5 minutes at doorstep before handing physical cash.
              </span>
            </div>
          </div>

          {/* Auto-Bid Configuration Modal Form */}
          {showAutoBidModal && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">{t.autoBidTitle}</span>
                <button
                  onClick={() => setShowAutoBidModal(false)}
                  className="text-amber-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-amber-800">
                System will auto-counter on your behalf up to your ceiling using official tier steps.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={autoBidAmount}
                  onChange={(e) => setAutoBidAmount(e.target.value)}
                  placeholder="Ceiling amount in IQD"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-amber-300 rounded-xl text-slate-900"
                />
                <button
                  onClick={handleSaveAutoBid}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Ceiling
                </button>
              </div>
            </div>
          )}

          {/* Live Bid History Feed */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Bids Ledger ({item.bidsHistory.length})</span>
            </h4>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {item.bidsHistory.map((bid, idx) => (
                <div
                  key={bid.id || idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    idx === 0
                      ? 'bg-blue-50/70 border-blue-200 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-slate-900">{bid.bidderName}</span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                        LEADER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900">
                      {bid.amountIqd.toLocaleString()} IQD
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{bid.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
