'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Timer,
  Gavel,
  LogIn,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL, formatCurrency } from '@/i18n/translations';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';

export default function MyBidsPage() {
  const { auctions } = useBuyerAuctionStore();
  const { language, buyer, isAuthenticated } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'won'>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const cleanPhone = buyer?.phone?.replace(/\s+/g, '') || '';

  // Filter won auctions
  const wonItems = buyer
    ? auctions.filter(
        (a) =>
          (a.status === 'completed' || new Date(a.auctionEndsAt).getTime() <= Date.now()) &&
          (a.highestBidder?.phone?.replace(/\s+/g, '') === cleanPhone || a.highestBidder?.id === buyer.id)
      )
    : [];

  // Filter active live bids
  const activeBids = buyer
    ? auctions.filter(
        (a) =>
          a.status === 'live' &&
          new Date(a.auctionEndsAt).getTime() > Date.now() &&
          (a.highestBidder?.phone?.replace(/\s+/g, '') === cleanPhone ||
            a.bidsHistory?.some((b) => b.bidderPhone?.replace(/\s+/g, '') === cleanPhone))
      )
    : [];

  if (!isAuthenticated || !buyer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xl">
          <Gavel className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {rtl ? 'هەژمارەکەت پێویستە بۆ بینینی مزادەکان' : 'Sign In to View Your Bids'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {rtl
              ? 'تکایە بە ژمارەی مۆبایل بچۆژوورەوە بۆ بەدواداچوونی پێشنیارەکانت و کاڵا براوەکانی کاش لە بەردەم دەرگا.'
              : 'Sign in with your phone number to track your live bids, won auctions, and Cash on Delivery doorstep orders.'}
          </p>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{rtl ? 'چوونەژوورەوە بە ژمارەی مۆبایل' : 'Sign In with Phone Number'}</span>
        </button>
        <BuyerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  const displayedItems =
    activeTab === 'won' ? wonItems : activeTab === 'active' ? activeBids : [...activeBids, ...wonItems];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-black text-white">{t.tabMyBids}</h2>
        <p className="text-xs text-slate-400">
          Track your live bids and won Cash on Delivery auctions
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Won Auctions</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {wonItems.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">100% COD Pay</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Bids</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {activeBids.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">Live Events</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Payment Mode</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-black text-white font-mono mt-1">Cash on Delivery</div>
          <span className="text-[10px] text-emerald-400 font-bold block">5-Min Doorstep Inspection</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Account ID</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Gavel className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-slate-300 truncate">
            {buyer.phone}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">{buyer.city} Hub</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {(['all', 'active', 'won'] as const).map((tabKey) => {
          const isSelected = activeTab === tabKey;
          const labels = {
            all: `All Activity (${activeBids.length + wonItems.length})`,
            active: `Active Bids (${activeBids.length})`,
            won: `Won Items (${wonItems.length})`,
          };
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {labels[tabKey]}
            </button>
          );
        })}
      </div>

      {/* Items Feed */}
      <div className="space-y-4">
        {displayedItems.length === 0 ? (
          <div className="py-16 px-4 bg-slate-900/60 rounded-3xl border border-dashed border-white/10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">
                {activeTab === 'won'
                  ? 'No won auctions yet'
                  : activeTab === 'active'
                  ? 'No active bids placed'
                  : 'No auction activity found'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Join live auctions and swipe to place your bids with 100% Cash-on-Delivery doorstep inspection.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 inline-block transition-transform active:scale-95"
              >
                Browse Live Auctions
              </Link>
            </div>
          </div>
        ) : (
          displayedItems.map((item) => {
            const localized = item.multilingual[language] || item.multilingual.en;
            const isWon =
              (item.status === 'completed' || new Date(item.auctionEndsAt).getTime() <= Date.now()) &&
              (item.highestBidder?.phone?.replace(/\s+/g, '') === cleanPhone ||
                item.highestBidder?.id === buyer.id);

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 rounded-3xl border border-white/10 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-white/10">
                    <img
                      src={item.imageUrl}
                      alt={localized.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isWon
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {isWon ? 'AUCTION WON' : 'ACTIVE BID'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        By {item.sellerName}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{localized.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>
                        Bid Amount:{' '}
                        <strong className="font-mono text-emerald-400 font-black">
                          {formatCurrency(item.currentBidIqd, language)}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">100% COD Pay</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">
                      {isWon ? 'COD Status' : 'Countdown'}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {isWon ? 'Pending Courier Dispatch' : 'Live Ticking'}
                    </span>
                  </div>

                  <Link
                    href={`/marketplace`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-white/10"
                  >
                    View Room
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
