'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Flame,
  LayoutGrid,
  List,
  Gavel,
  ShieldCheck,
  X,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL, formatCurrency } from '@/i18n/translations';
import { MobileAuctionItem } from '@/types/marketplace';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { LiveAuctionRoomModal } from '@/components/marketplace/LiveAuctionRoomModal';
import { TwoGateKycModal } from '@/components/marketplace/TwoGateKycModal';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';
import { CategoryBar } from '@/components/marketplace/CategoryBar';
import { useAdminStore } from '@/store/useAdminStore';

const TRENDING_SEARCH_CHIPS = [
  'iPhone 16 Pro',
  'Rolex Submariner',
  'PlayStation 5',
  'DeWalt Drill',
  'MacBook Pro',
  'Sony XM5',
];

export default function BuyerMarketplacePage() {
  const { auctions: adminAuctions } = useAdminStore();
  const { auctions, addAuction, tickTimers } = useBuyerAuctionStore();
  const { language, buyer } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [selectedAuction, setSelectedAuction] = useState<MobileAuctionItem | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync approved live auctions from admin store into marketplace store
  useEffect(() => {
    adminAuctions
      .filter((a) => a.status === 'live')
      .forEach((liveItem) => {
        addAuction({
          id: liveItem.id,
          sellerId: liveItem.sellerId,
          sellerName: liveItem.sellerName,
          category: liveItem.category,
          condition: liveItem.condition,
          imageUrl:
            liveItem.images[0] ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          startingPriceIqd: 1000,
          currentBidIqd: liveItem.currentBidIqd,
          incrementStepIqd: liveItem.incrementStepIqd || 1000,
          estimatedRetailMarketPriceIqd: liveItem.estimatedRetailMarketPriceIqd,
          multilingual: liveItem.multilingual,
          submittedAt: liveItem.submittedAt,
          auctionStartsAt: liveItem.auctionStartsAt,
          auctionEndsAt: liveItem.auctionEndsAt,
          status: 'live',
          isAntiSnipingActive: liveItem.isAntiSnipingActive,
          antiSnipingResetsCount: liveItem.antiSnipingResetsCount,
          totalBids: liveItem.totalBids,
          highestBidder: liveItem.highestBidder,
          bidsHistory: liveItem.bidsHistory,
        });
      });
  }, [adminAuctions, addAuction]);

  // Real-time Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimers]);

  const filteredAuctions = auctions.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' ||
      item.category === selectedCategory ||
      (selectedCategory === 'Watches' && item.category?.includes('Watch'));
    const localized = item.multilingual[language] || item.multilingual.en;
    const matchesQuery =
      searchQuery.trim() === '' ||
      localized.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const hotAuction = auctions.find((a) => a.isAntiSnipingActive) || auctions[0];
  const hotLocalized = hotAuction ? hotAuction.multilingual[language] || hotAuction.multilingual.en : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-6">
      {/* Search Bar with Instant Zero-Latency Filter & Trending Chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 text-slate-400 absolute top-3.5 ${rtl ? 'right-3.5' : 'left-3.5'}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={rtl ? 'گەڕان بۆ ئایفۆن، کاتژمێر، پلەیستەیشن...' : 'Search live auctions, electronics, luxury watches...'}
              className={`w-full py-2.5 px-4 ${
                rtl ? 'pr-10 pl-9 text-right' : 'pl-10 pr-9 text-left'
              } text-xs sm:text-sm bg-slate-900/80 border border-white/10 rounded-2xl shadow-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 transition-all`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center absolute top-3 ${
                  rtl ? 'left-3' : 'right-3'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* View Mode Grid/List Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1-Tap Trending Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider shrink-0 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Trending:</span>
          </span>
          {TRENDING_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setSearchQuery(chip)}
              className="px-2.5 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] border border-white/5 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Category Carousel */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        auctions={auctions}
        isRtl={rtl}
      />

      {/* Hot Live Auction Hero Feature Card */}
      {hotAuction && hotLocalized && (
        <div
          onClick={() => setSelectedAuction(hotAuction)}
          className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 hover:border-emerald-500/30 relative overflow-hidden group cursor-pointer transition-all"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/30 animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>ANTI-SNIPING ZONE (≤60s)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
                  {hotAuction.antiSnipingResetsCount || 0} Clock Resets
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight line-clamp-2">
                {hotLocalized.title}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed line-clamp-2">
                {hotLocalized.description}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Current Bid</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      {formatCurrency(hotAuction.currentBidIqd, language)}
                    </span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block" />

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Retail Reference</span>
                  <span className="text-xs font-mono text-slate-400">
                    ~{formatCurrency(hotAuction.estimatedRetailMarketPriceIqd, language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Thumbnail & CTA */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-950">
                <img
                  src={hotAuction.imageUrl}
                  alt={hotLocalized.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <button className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                <Gavel className="w-3.5 h-3.5" />
                <span>Swipe to Bid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Auction Listings Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-white text-base">
              Live Auctions ({filteredAuctions.length})
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Cash on Delivery</span>
          </span>
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="py-16 px-4 bg-slate-900/60 rounded-3xl border border-dashed border-white/10 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Gavel className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-bold text-white text-base">
                {rtl ? 'هیچ مزادێکی چالاک نەدۆزرایەوە' : 'No Live Auctions Found'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {searchQuery
                  ? `No live auctions matched "${searchQuery}". Try searching for another item or clear filters.`
                  : 'New verified auctions with 100% Cash-on-Delivery doorstep inspection are scheduled regularly.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAuctions.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onOpenLiveRoom={(target) => setSelectedAuction(target)}
                onRequestKyc={() => setShowAuthModal(true)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAuctions.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onOpenLiveRoom={(target) => setSelectedAuction(target)}
                onRequestKyc={() => setShowAuthModal(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <LiveAuctionRoomModal
        item={selectedAuction}
        isOpen={Boolean(selectedAuction)}
        onClose={() => setSelectedAuction(null)}
        onRequestKyc={() => setShowAuthModal(true)}
      />

      <TwoGateKycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />

      <BuyerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
