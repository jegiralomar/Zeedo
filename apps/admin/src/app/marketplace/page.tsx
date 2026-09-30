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
  Zap,
} from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { MobileAuctionItem } from '@/types/marketplace';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { LiveAuctionRoomModal } from '@/components/marketplace/LiveAuctionRoomModal';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function BuyerMarketplacePage() {
  const { auctions, tickTimers } = useBuyerAuctionStore();
  const { language, buyer } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  // Load persisted view mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zeedo_view_mode');
      if (saved === 'compact' || saved === 'detailed') {
        setViewMode(saved);
      }
    }
  }, []);

  const handleViewModeChange = (mode: 'compact' | 'detailed') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zeedo_view_mode', mode);
    }
  };

  // Modals state
  const [selectedAuction, setSelectedAuction] = useState<MobileAuctionItem | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    const localized = item.multilingual?.[language] || item.multilingual?.en || {
      title: (item as any).titles?.en || (item as any).titles?.[language] || 'Live Auction Item',
      description: '',
      specs: [],
    };
    const matchesQuery =
      searchQuery.trim() === '' ||
      (localized.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sellerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const hotAuction = auctions.find((a) => a.isAntiSnipingActive) || auctions[0];
  const hotLocalized = hotAuction
    ? hotAuction.multilingual?.[language] || hotAuction.multilingual?.en || {
        title: (hotAuction as any).titles?.en || (hotAuction as any).titles?.[language] || 'Hot Drop',
        description: '',
        specs: [],
      }
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search & Category Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className={cn('w-4 h-4 text-slate-400 absolute top-3.5', rtl ? 'right-3.5' : 'left-3.5')} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={cn(
              'w-full py-2.5 px-4 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl shadow-xs transition-all focus:outline-hidden focus:border-[#5B50D6] focus:ring-3 focus:ring-[#5B50D6]/15 text-slate-900 placeholder:text-slate-400',
              rtl ? 'pr-10 text-right' : 'pl-10 text-left'
            )}
          />
        </div>

        {/* View Mode Compact/Detailed Switcher */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => handleViewModeChange('compact')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'compact'
                ? 'bg-white text-[#5B50D6] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
            title={rtl ? 'تۆڕی چڕ (٢ ستوون)' : 'Compact Grid (2-col)'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{rtl ? 'چڕ' : '2-Col'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('detailed')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'detailed'
                ? 'bg-white text-[#5B50D6] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
            title={rtl ? 'لیستی وردەکاری (١ ستوون)' : 'Detailed Feed (1-col)'}
          >
            <List className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{rtl ? 'وردەکاری' : '1-Col'}</span>
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
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shadow-2xs cursor-pointer',
                isSelected
                  ? 'bg-[#5B50D6] text-white border-[#5B50D6] shadow-md shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
              )}
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
          className="bg-gradient-to-r from-[#141724] via-[#1E2235] to-[#141724] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-white/10 relative overflow-hidden group cursor-pointer"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5B50D6]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 flex-1 text-center md:text-left rtl:md:text-right">
              <div className="flex flex-wrap items-center justify-center md:justify-start rtl:md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow-md animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>ANTI-SNIPING ZONE (≤60s)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                  {hotAuction.antiSnipingResetsCount} Timer Resets
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {hotLocalized.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {hotLocalized.description}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start rtl:md:justify-start gap-4 pt-2">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t.currentBid}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      {hotAuction.currentBidIqd.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-300">IQD</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/20 hidden sm:block" />

                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Retail Market</span>
                  <span className="text-sm font-mono text-slate-300 font-bold">
                    ~{hotAuction.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                  </span>
                </div>
              </div>
            </div>

            {/* Product Thumbnail & CTA */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative bg-slate-900">
                <img
                  src={hotAuction.imageUrl}
                  alt={hotLocalized.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <Button
                variant="default"
                size="default"
                className="w-full font-black shadow-lg shadow-indigo-500/30"
                leftIcon={<Gavel className="w-3.5 h-3.5" />}
              >
                Join War Room
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Auction Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 text-base">
              Live Auctions ({filteredAuctions.length})
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#5B50D6]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            <span>Real-Time Sync Active</span>
          </div>
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDFB] text-[#5B50D6] flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">No Auctions Match Your Search</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your category filter or search keywords to view other live merchandise.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-4 sm:gap-6',
              viewMode === 'compact'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {filteredAuctions.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                variant={viewMode}
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
        isOpen={!!selectedAuction}
        onClose={() => setSelectedAuction(null)}
        onRequestKyc={() => setShowAuthModal(true)}
      />

      <BuyerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
