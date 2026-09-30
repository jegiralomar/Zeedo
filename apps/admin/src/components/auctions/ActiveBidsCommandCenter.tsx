'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminStore } from '@/store/useAdminStore';
import { ListingAuction } from '@/types';
import {
  Gavel,
  Clock,
  ShieldAlert,
  Flame,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Phone,
  MapPin,
  Store,
  DollarSign,
  TrendingUp,
  User,
  Trash2,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ActiveBidsCommandCenter: React.FC = () => {
  const {
    auctions,
    placeBid,
    triggerAntiSniping,
    extendAuctionTimer,
    togglePauseAuction,
    forceEndAuction,
    voidAuctionBid,
    relistAuction,
    addToast,
    syncAuctionsFromDb,
  } = useAdminStore();

  useEffect(() => {
    syncAuctionsFromDb();
  }, [syncAuctionsFromDb]);

  // 1-second interval to update all countdown timers smoothly
  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'soft_close' | 'ending_soon' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'ending_soon' | 'highest_bid' | 'most_bids' | 'newest'>('ending_soon');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Control Modal state
  const [activeModalAuctionId, setActiveModalAuctionId] = useState<string | null>(null);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('10');
  const [voidBidModal, setVoidBidModal] = useState<{ bidId: string; bidderName: string; amount: number } | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Suspected Shill Bidding / Account Collusion');

  // Helper functions
  const getRemainingSeconds = (endsAt: string) => {
    const diff = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}h ${String(m).padStart(2, '0')}m`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getItemTitle = (auction: ListingAuction) => {
    return (
      auction.multilingual?.ckb?.title ||
      auction.multilingual?.en?.title ||
      auction.multilingual?.ar?.title ||
      auction.multilingual?.badini?.title ||
      'Auction Listing'
    );
  };

  // Filtered auctions
  const liveAuctions = auctions.filter((a) => a.status === 'live' || a.status === 'cancelled');

  const categories = Array.from(new Set(auctions.map((a) => a.category).filter(Boolean)));

  const filteredAuctions = liveAuctions
    .filter((auc) => {
      const title = getItemTitle(auc).toLowerCase();
      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        auc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auc.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || auc.category === selectedCategory;

      const remainingSec = getRemainingSeconds(auc.auctionEndsAt);
      const isSoftClose = remainingSec <= 60 && remainingSec > 0;
      const isEndingSoon = remainingSec <= 300 && remainingSec > 0;
      const isPaused = auc.status === 'cancelled';

      let matchesStatus = true;
      if (statusFilter === 'soft_close') matchesStatus = isSoftClose;
      else if (statusFilter === 'ending_soon') matchesStatus = isEndingSoon;
      else if (statusFilter === 'paused') matchesStatus = isPaused;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'ending_soon') {
        return getRemainingSeconds(a.auctionEndsAt) - getRemainingSeconds(b.auctionEndsAt);
      }
      if (sortBy === 'highest_bid') {
        return b.currentBidIqd - a.currentBidIqd;
      }
      if (sortBy === 'most_bids') {
        return b.totalBids - a.totalBids;
      }
      if (sortBy === 'newest') {
        return new Date(b.auctionStartsAt).getTime() - new Date(a.auctionStartsAt).getTime();
      }
      return 0;
    });

  // KPI Calculations
  const totalLiveCount = liveAuctions.filter((a) => a.status === 'live').length;
  const totalBidsToday = liveAuctions.reduce((acc, a) => acc + (a.totalBids || 0), 0);
  const totalLiveGmvIqd = liveAuctions.reduce((acc, a) => acc + (a.currentBidIqd || 0), 0);
  const softCloseCount = liveAuctions.filter((a) => {
    const s = getRemainingSeconds(a.auctionEndsAt);
    return s > 0 && s <= 60;
  }).length;

  const currentModalAuction = auctions.find((a) => a.id === activeModalAuctionId);

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Windows (Matching User App Aesthetic) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Auctions */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Live Auctions
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono">
                {totalLiveCount}
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Active for live bidding</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Bids Placed Today */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Bids Placed
            </span>
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono mt-1 block">
              {totalBidsToday}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Across active catalog</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Active GMV in IQD */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Volume
            </span>
            <span className="text-xl lg:text-2xl font-extrabold text-slate-900 font-mono mt-1 block truncate max-w-[170px]">
              {totalLiveGmvIqd.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-bold">IQD</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">100% Doorstep COD</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Soft-Close Watch */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Soft-Close Watch
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl lg:text-3xl font-extrabold font-mono ${softCloseCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {softCloseCount}
              </span>
              {softCloseCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                  &lt;60s
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Anti-sniping active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Search, Filter & View Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, ID, merchant, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Active ({liveAuctions.length})
            </button>

            <button
              onClick={() => setStatusFilter('soft_close')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                statusFilter === 'soft_close'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Soft-Close ({softCloseCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('ending_soon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === 'ending_soon'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ending Soon (&lt;5m)
            </button>

            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === 'paused'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paused / Halted
            </button>
          </div>

          {/* Sort & View Mode Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ending_soon">Ending Soonest</option>
                <option value="highest_bid">Highest Bid (IQD)</option>
                <option value="most_bids">Most Bids</option>
                <option value="newest">Recently Started</option>
              </select>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Visual Card Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Operations Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold shrink-0 pr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Empty State */}
      {filteredAuctions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active auctions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or approving listings from the Listing Moderation tab.
          </p>
        </div>
      )}

      {/* 4. Active Bids View Mode: Card Grid */}
      {viewMode === 'grid' && filteredAuctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAuctions.map((auction) => {
            const remainingSec = getRemainingSeconds(auction.auctionEndsAt);
            const isSoftClose = remainingSec > 0 && remainingSec <= 60;
            const isEndingSoon = remainingSec > 0 && remainingSec <= 300;
            const isPaused = auction.status === 'cancelled';
            const itemTitle = getItemTitle(auction);

            return (
              <div
                key={auction.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isSoftClose
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : isPaused
                    ? 'border-slate-300 opacity-80'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Card Top Section */}
                <div className="p-4 space-y-3">
                  {/* Header Row: Category, Condition & Soft-Close Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 truncate">
                        {auction.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                        {auction.condition}
                      </span>
                    </div>

                    {/* Timer Pill */}
                    <div
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0 ${
                        isPaused
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : isSoftClose
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : isEndingSoon
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{isPaused ? 'PAUSED' : formatCountdown(remainingSec)}</span>
                    </div>
                  </div>

                  {/* Thumbnail & Title Row */}
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden relative shrink-0">
                      {auction.images?.[0] ? (
                        <Image
                          src={auction.images[0]}
                          alt={itemTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Gavel className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {itemTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <Store className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{auction.sellerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & High Bidder Box */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Current High Bid
                        </span>
                        <div className="text-lg font-black text-slate-900 font-mono">
                          {auction.currentBidIqd.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-bold">IQD</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          +{auction.incrementStepIqd.toLocaleString()} Step
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {auction.totalBids} bids placed
                        </div>
                      </div>
                    </div>

                    {/* Highest Bidder Details */}
                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">
                          {auction.highestBidder?.name || 'No bids yet'}
                        </span>
                      </div>
                      {auction.highestBidder && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{auction.highestBidder.phone.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Controls Footer */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
                  {/* Fast +1m Timer Extension */}
                  <button
                    onClick={() => extendAuctionTimer(auction.id, 1)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    title="Add 1 minute to auction countdown"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>+1 Min</span>
                  </button>

                  {/* Pause / Resume Button */}
                  <button
                    onClick={() => togglePauseAuction(auction.id)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors shadow-2xs ${
                      isPaused
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={isPaused ? 'Resume live bidding' : 'Pause auction'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>

                  {/* Full Control Panel Modal Button */}
                  <button
                    onClick={() => setActiveModalAuctionId(auction.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Controls</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Active Bids View Mode: Operations Table */}
      {viewMode === 'table' && filteredAuctions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Current High Bid</th>
                  <th className="py-3 px-4">Time Remaining</th>
                  <th className="py-3 px-4">Top Bidder</th>
                  <th className="py-3 px-4">Bids</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAuctions.map((auction) => {
                  const remainingSec = getRemainingSeconds(auction.auctionEndsAt);
                  const isSoftClose = remainingSec > 0 && remainingSec <= 60;
                  const isPaused = auction.status === 'cancelled';
                  const itemTitle = getItemTitle(auction);

                  return (
                    <tr key={auction.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                            {auction.images?.[0] ? (
                              <Image
                                src={auction.images[0]}
                                alt={itemTitle}
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <Gavel className="w-5 h-5 text-slate-300 m-auto" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <div className="font-bold text-slate-900 truncate">{itemTitle}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{auction.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{auction.sellerName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {auction.currentBidIqd.toLocaleString()} IQD
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          +{auction.incrementStepIqd.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold ${
                            isPaused
                              ? 'bg-slate-100 text-slate-600'
                              : isSoftClose
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {isPaused ? 'PAUSED' : formatCountdown(remainingSec)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {auction.highestBidder ? (
                          <div>
                            <div className="font-bold text-slate-800 truncate max-w-[120px]">
                              {auction.highestBidder.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {auction.highestBidder.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {auction.totalBids}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => extendAuctionTimer(auction.id, 1)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="+1 Minute"
                          >
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => togglePauseAuction(auction.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title={isPaused ? 'Resume' : 'Pause'}
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setActiveModalAuctionId(auction.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs"
                          >
                            Controls
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Comprehensive Auction Control Modal */}
      {currentModalAuction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 relative overflow-hidden shrink-0 shadow-2xs">
                  {currentModalAuction.images?.[0] ? (
                    <Image
                      src={currentModalAuction.images[0]}
                      alt="Item"
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Gavel className="w-6 h-6 text-slate-300 m-auto" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {currentModalAuction.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {currentModalAuction.category}
                    </span>
                    {currentModalAuction.status === 'cancelled' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        PAUSED
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {getItemTitle(currentModalAuction)}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveModalAuctionId(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0 shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Row 1: Real-Time Timer & Bidding Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Live Countdown Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Time Remaining
                  </span>
                  <div className="text-3xl font-black font-mono text-slate-900">
                    {formatCountdown(getRemainingSeconds(currentModalAuction.auctionEndsAt))}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Ends: {new Date(currentModalAuction.auctionEndsAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* High Bid Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Current Winning Bid
                  </span>
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {currentModalAuction.currentBidIqd.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-bold">IQD</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    Retail Ref: {currentModalAuction.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                  </div>
                </div>

                {/* Highest Bidder Details Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Top Bidder
                  </span>
                  {currentModalAuction.highestBidder ? (
                    <div>
                      <div className="font-extrabold text-slate-900 truncate">
                        {currentModalAuction.highestBidder.name}
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        {currentModalAuction.highestBidder.phone}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {currentModalAuction.highestBidder.rooftopPin?.city || 'Iraq'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic pt-2">No bids recorded yet</div>
                  )}
                </div>
              </div>

              {/* Row 2: Timer Adjustment & Soft-Close Action Controls */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Timer Management & Anti-Sniping
                  </h4>
                  <span className="text-[11px] text-slate-400">One-click adjustments update live for all buyers</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => extendAuctionTimer(currentModalAuction.id, 1)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                  >
                    +1 Minute
                  </button>

                  <button
                    onClick={() => extendAuctionTimer(currentModalAuction.id, 5)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                  >
                    +5 Minutes
                  </button>

                  <button
                    onClick={() => extendAuctionTimer(currentModalAuction.id, 15)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                  >
                    +15 Minutes
                  </button>

                  <button
                    onClick={() => triggerAntiSniping(currentModalAuction.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Reset to 60s Soft-Close
                  </button>

                  {/* Custom minutes extend */}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={customMinutesInput}
                      onChange={(e) => setCustomMinutesInput(e.target.value)}
                      className="w-16 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center bg-slate-50"
                    />
                    <button
                      onClick={() => {
                        const m = Number(customMinutesInput) || 1;
                        extendAuctionTimer(currentModalAuction.id, m);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      +Add Mins
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Admin Lifecycle Operations */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-blue-600" />
                  Admin Lifecycle Operations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Force Conclude */}
                  <button
                    onClick={() => {
                      if (confirm(`Conclude auction "${getItemTitle(currentModalAuction)}" immediately and create COD delivery order?`)) {
                        forceEndAuction(currentModalAuction.id);
                        setActiveModalAuctionId(null);
                      }
                    }}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-xs text-center"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Force Conclude & Dispatch</span>
                    <span className="text-[10px] text-emerald-100 font-normal">Award to high bidder & gen AWB</span>
                  </button>

                  {/* Pause / Resume */}
                  <button
                    onClick={() => togglePauseAuction(currentModalAuction.id)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-xs text-center ${
                      currentModalAuction.status === 'cancelled'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {currentModalAuction.status === 'cancelled' ? (
                      <>
                        <Play className="w-4 h-4 text-emerald-600" />
                        <span>Resume Live Bidding</span>
                        <span className="text-[10px] text-slate-500 font-normal">Re-open socket stream</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 text-amber-600" />
                        <span>Pause Auction</span>
                        <span className="text-[10px] text-slate-500 font-normal">Halt bids for dispute check</span>
                      </>
                    )}
                  </button>

                  {/* One-Tap Relist */}
                  <button
                    onClick={() => {
                      if (confirm(`Relist "${getItemTitle(currentModalAuction)}" as a new 1,000 IQD auction?`)) {
                        relistAuction(currentModalAuction.id);
                        setActiveModalAuctionId(null);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-2xs text-center"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-600" />
                    <span>Relist at 1,000 IQD</span>
                    <span className="text-[10px] text-slate-400 font-normal">Spawn fresh 24h auction</span>
                  </button>
                </div>
              </div>

              {/* Row 4: Chronological Bidder History & Dispute/Void Control */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    Bidder History & Moderation ({currentModalAuction.bidsHistory?.length || 0} bids)
                  </h4>
                  <button
                    onClick={() => placeBid(currentModalAuction.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simulate Next Step Bid (+{currentModalAuction.incrementStepIqd.toLocaleString()} IQD)</span>
                  </button>
                </div>

                {currentModalAuction.bidsHistory && currentModalAuction.bidsHistory.length > 0 ? (
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                        <tr>
                          <th className="py-2.5 px-3">Bidder</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {currentModalAuction.bidsHistory.map((bid, idx) => (
                          <tr
                            key={bid.id || idx}
                            className={`hover:bg-slate-50/60 ${bid.isVoided ? 'bg-rose-50/40 text-slate-400 line-through' : ''}`}
                          >
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {bid.bidderName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">
                              {bid.bidderPhone}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {bid.amountIqd.toLocaleString()} IQD
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                              {new Date(bid.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2.5 px-3">
                              {bid.isVoided ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                  Voided
                                </span>
                              ) : idx === 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Winning
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  Outbid
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {!bid.isVoided && (
                                <button
                                  onClick={() =>
                                    setVoidBidModal({
                                      bidId: bid.id,
                                      bidderName: bid.bidderName,
                                      amount: bid.amountIqd,
                                    })
                                  }
                                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                                >
                                  Void Bid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 italic">
                    No bids recorded in history yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Merchant: <strong>{currentModalAuction.sellerName}</strong> ({currentModalAuction.sellerPhone})</span>
              <button
                onClick={() => setActiveModalAuctionId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                Close Control Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Void Bid Reason Dialog */}
      {voidBidModal && currentModalAuction && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
                <Trash2 className="w-4 h-4" />
                <span>Void Invalid / Shill Bid</span>
              </div>
              <button
                onClick={() => setVoidBidModal(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are voiding bid of{' '}
              <strong className="text-slate-900">
                {voidBidModal.amount.toLocaleString()} IQD
              </strong>{' '}
              placed by <strong className="text-slate-900">{voidBidModal.bidderName}</strong>. The auction price will revert to the previous valid bid.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Reason for Voiding Bid
              </label>
              <select
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 font-medium"
              >
                <option value="Suspected Shill Bidding / Account Collusion">
                  Suspected Shill Bidding / Account Collusion
                </option>
                <option value="Unreachable Phone / Non-contactable Buyer">
                  Unreachable Phone / Non-contactable Buyer
                </option>
                <option value="Unpaid COD History / Delivery Refusal">
                  Unpaid COD History / Delivery Refusal
                </option>
                <option value="Duplicate Account / Fake Bid Increment">
                  Duplicate Account / Fake Bid Increment
                </option>
                <option value="Admin Correction / Disputed Bid">
                  Admin Correction / Disputed Bid
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVoidBidModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  voidAuctionBid(currentModalAuction.id, voidBidModal.bidId, voidReason);
                  setVoidBidModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Void Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
