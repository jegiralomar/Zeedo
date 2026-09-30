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
  LogIn,
} from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';

export default function MyBidsPage() {
  const { auctions } = useBuyerAuctionStore();
  const { language, buyer, isAuthenticated } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'won' | 'disputes'>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const cleanPhone = buyer?.phone?.replace(/\s+/g, '') || '';

  // Filter won auctions (status completed or countdown finished, with buyer as highest bidder)
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
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
          <Gavel className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {rtl ? 'هەژمارەکەت پێویستە بۆ بینینی مزادەکان' : 'Sign In to View Your Bids'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {rtl
              ? 'تکایە بچۆژوورەوە بۆ بەدواداچوونی پێشنیارەکانت، کاڵا براوەکان، و گەیشتنی شۆفێری کاش لە بەردەم دەرگا.'
              : 'Sign in with your phone number to track your live bids, winning auctions, and doorstep cash-on-delivery parcels.'}
          </p>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{rtl ? 'چوونەژوورەوە یان دروستکردنی هەژمار' : 'Sign In / Register Account'}</span>
        </button>
        <BuyerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="login"
        />
      </div>
    );
  }

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
            {buyer.totalWins || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">100% COD</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Active Bids</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.totalBids || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">Live Events</span>
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
            <span className="text-xs text-slate-500 font-semibold">KYC Level</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.kycStatus === 'verified' ? 'Gate 2' : 'Gate 0'}
          </div>
          <span className="text-[10px] text-purple-600 font-bold block">
            {buyer.kycStatus === 'verified' ? 'Verified' : 'Pending'}
          </span>
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

      {/* Orders List / Empty State */}
      <div className="space-y-4">
        {wonItems.length === 0 ? (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                {rtl ? 'هیچ مزادێکی بردنەوەت تۆمار نەکراوە' : 'No Won Auctions Yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {rtl
                  ? 'بەشداری لە مزادە ڕاستەوخۆکان بکە بۆ بردنەوەی باشترین کاڵا بە نرخی هەرزان و پارەدانی کاش.'
                  : 'Join live auctions to place your bids and win items with 100% Cash-on-Delivery inspection.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors inline-block"
              >
                {rtl ? 'گەڕان بەناو مزادەکاندا' : 'Browse Live Auctions'}
              </Link>
            </div>
          </div>
        ) : (
          wonItems.map((item) => {
            const localized = item.multilingual?.[language] || item.multilingual?.en || {
              title: (item as any).titles?.en || (item as any).titles?.[language] || 'Won Item',
              description: '',
              specs: [],
            };
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
          })
        )}
      </div>
    </div>
  );
}
