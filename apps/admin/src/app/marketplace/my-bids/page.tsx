'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Barcode,
  Sparkles,
  ArrowRight,
  Gavel,
} from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';

export default function MyBidsPage() {
  const { auctions } = useBuyerAuctionStore();
  const { language, buyer } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'won' | 'disputes'>('all');

  // Filter won items
  const wonItems = auctions.filter(
    (a) => a.highestBidder?.id === buyer.id || a.id === 'auc-801'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">{t.tabMyBids}</h2>
        <p className="text-xs text-slate-500">
          Track your live bids, won auctions, and 3PL cash-on-delivery shipments
        </p>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Won</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.totalWins || 2}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">+1 this week</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Active 3PL</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">01</div>
          <span className="text-[10px] text-emerald-600 font-bold block">On Schedule</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Disputes</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">00</div>
          <span className="text-[10px] text-slate-400 font-bold block">All Clear</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Authenticated</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">100%</div>
          <span className="text-[10px] text-purple-600 font-bold block">Tesseract Verified</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['all', 'active', 'won', 'disputes'] as const).map((tabKey) => {
          const isSelected = activeTab === tabKey;
          const labels = {
            all: 'All Activity',
            active: t.activeBids,
            won: t.wonAuctions,
            disputes: 'Dispute Desk',
          };
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {labels[tabKey]}
            </button>
          );
        })}
      </div>

      {/* COD Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="text-xs text-amber-900 font-medium leading-relaxed">{t.codNotice}</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {wonItems.map((item) => {
          const localized = item.multilingual[language] || item.multilingual.en;
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={item.imageUrl}
                    alt={localized.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      WINNING BID
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">AWB: IQD-99210-ERB</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{localized.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      Winning Amount:{' '}
                      <strong className="font-mono text-slate-900 font-extrabold">
                        {item.currentBidIqd.toLocaleString()} IQD
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Doorstep COD Pay</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-medium">AWB Thermal Status</span>
                  <span className="text-xs font-bold text-blue-700">Dispatch Pending</span>
                </div>
                <button className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2">
                  <Barcode className="w-4 h-4 text-[#B4F105]" />
                  <span>View Thermal Slip</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
