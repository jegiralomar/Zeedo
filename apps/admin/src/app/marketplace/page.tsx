'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Radio,
  Sparkles,
  Smartphone,
  Watch,
  Gamepad2,
  Laptop,
  Layers,
  LayoutGrid,
  List,
  Timer,
  Gavel,
  ShieldCheck,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { MobileAuctionItem } from '@/types/marketplace';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { LiveAuctionRoomModal } from '@/components/marketplace/LiveAuctionRoomModal';
import { TwoGateKycModal } from '@/components/marketplace/TwoGateKycModal';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';
import { useAdminStore } from '@/store/useAdminStore';

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
          imageUrl: liveItem.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
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

  // Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimers]);

  const categories = [
    { id: 'All', label: t.allCategories, icon: Layers },
    { id: 'Smartphones', label: 'Phones', icon: Smartphone },
    { id: 'Watches', label: 'Watches', icon: Watch },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Computers', label: 'Laptops', icon: Laptop },
  ];

  const filteredAuctions = auctions.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const localized = item.multilingual[language] || item.multilingual.en;
    const matchesQuery =
      searchQuery.trim() === '' ||
      localized.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const hotAuction = auctions.find((a) => a.isAntiSnipingActive) || auctions[0];
  const hotLocalized = hotAuction ? (hotAuction.multilingual[language] || hotAuction.multilingual.en) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search & Category Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${rtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full py-2.5 px-4 ${
              rtl ? 'pr-10 text-right' : 'pl-10 text-left'
            } text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl shadow-xs focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 transition-all`}
          />
        </div>

        {/* View Mode Grid/List Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shadow-2xs ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hot Live Auction Hero Feature Card */}
      {hotAuction && hotLocalized && (
        <div
          onClick={() => setSelectedAuction(hotAuction)}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-white/10 relative overflow-hidden group cursor-pointer"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow-md animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>ANTI-SNIPING ZONE (≤60s)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                  {hotAuction.antiSnipingResetsCount} Timer Resets
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {hotLocalized.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {hotLocalized.description}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <div>
                  <span className="text-[11px] text-slate-400 block">{t.currentBid}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-extrabold text-emerald-400">
                      {hotAuction.currentBidIqd.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-300">IQD</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/20 hidden sm:block" />

                <div>
                  <span className="text-[11px] text-slate-400 block">Retail Market</span>
                  <span className="text-sm font-mono text-slate-300">
                    ~{hotAuction.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                  </span>
                </div>
              </div>
            </div>

            {/* Product Thumbnail & CTA */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative">
                <img
                  src={hotAuction.imageUrl}
                  alt={hotLocalized.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <button className="w-full py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                <Gavel className="w-3.5 h-3.5" />
                <span>Join War Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Auction Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Live Auctions ({filteredAuctions.length})
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-xs text-slate-500">100% Cash-on-Delivery Guarantee</span>
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Gavel className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="font-extrabold text-slate-900 text-base">
                {rtl ? 'هیچ مزادێکی چالاک نییە لەم کاتەدا' : 'No Live Auctions Currently Active'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {rtl
                  ? 'مزادە فەرمییەکان بە پێداچوونەوەی ورد و ١٠٠٪ پارەدانی کاش بەردەوام زیاد دەکرێن. سەردانی پەڕەکە بکەوە بەم نزیکانە.'
                  : 'Verified auctions with 100% Cash-on-Delivery doorstep inspection are scheduled regularly. Check back soon or register as a certified seller.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors"
              >
                {rtl ? 'چوونەژوورەوەی فرۆشیار / بەڕێوەبەر' : 'Merchant / Admin Portal'}
              </Link>
            </div>
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
