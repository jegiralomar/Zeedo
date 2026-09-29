'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import {
  Flame,
  ShieldAlert,
  Radio,
  Zap,
  Clock,
  Sliders,
  Send,
  MessageCircle,
  AlertTriangle,
  History,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  List,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  Ban,
  ShieldX,
  Undo2,
} from 'lucide-react';

export const LiveWarRoom: React.FC = () => {
  const {
    auctions,
    lowDataSocketFeed,
    placeBid,
    triggerAntiSniping,
    pauseAuction,
    forceEndAuction,
    voidAuctionBid,
    addToast,
  } = useAdminStore();

  const liveAuctions = auctions.filter((a) => a.status === 'live');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>(
    liveAuctions[0]?.id || ''
  );

  // View Mode & Multi-criteria Sorting State
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'ending_soon' | 'highest_bid' | 'most_bids' | 'category'>('ending_soon');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [softCloseOnly, setSoftCloseOnly] = useState<boolean>(false);

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slide-to-bid simulation state
  const [sliderPosition, setSliderPosition] = useState(0);

  // Proxy Auto-bid safety brake simulator
  const [proxyCeilingIqd, setProxyCeilingIqd] = useState<number>(300000);
  const [showSafetyBrakeWarning, setShowSafetyBrakeWarning] = useState(false);

  // Moderator Bid Voiding State
  const [voidTargetBid, setVoidTargetBid] = useState<{ id: string; bidderName: string; amountIqd: number } | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Suspected Shill Bidding / Account Collusion');

  const currentAuction =
    liveAuctions.find((a) => a.id === selectedAuctionId) || liveAuctions[0];

  const getRemainingSeconds = (endsAt: string) => {
    const diff = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSliderDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderPosition(val);
    if (val >= 88 && currentAuction) {
      placeBid(currentAuction.id);
      setSliderPosition(0);
      addToast('success', 'Slide-to-Bid: 88%+ gesture confirmed! Bid submitted.');
    }
  };

  const handleTestAutoBid = () => {
    if (!currentAuction) return;
    const threshold = currentAuction.estimatedRetailMarketPriceIqd * 1.5;
    if (proxyCeilingIqd > threshold) {
      setShowSafetyBrakeWarning(true);
    } else {
      setShowSafetyBrakeWarning(false);
      addToast(
        'info',
        `Proxy Auto-Bid ceiling configured at ${proxyCeilingIqd.toLocaleString()} IQD (Safety brake clear)`
      );
    }
  };

  const categories = Array.from(new Set(liveAuctions.map((a) => a.category)));

  const filteredAndSortedAuctions = [...liveAuctions]
    .filter((auc) => {
      const matchesSearch =
        auc.multilingual.en.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auc.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || auc.category === categoryFilter;
      const remainingSec = getRemainingSeconds(auc.auctionEndsAt);
      const matchesSoftClose = !softCloseOnly || (remainingSec <= 60 && remainingSec > 0);
      return matchesSearch && matchesCategory && matchesSoftClose;
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
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top War Room Header & Actions */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              Live Auctions Monitor
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
                {liveAuctions.length} Rooms Active
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Real-time live bidding feed, anti-sniping soft close monitoring, and moderator controls.
            </p>
          </div>
        </div>

        {/* Global Live Action Controls */}
        <div className="flex items-center gap-2">
          {currentAuction && (
            <>
              <button
                onClick={() => triggerAntiSniping(currentAuction.id)}
                className="btn-spark-primary text-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#B4F105]" />
                <span>Test Anti-Sniping Reset</span>
              </button>

              <button
                onClick={() => placeBid(currentAuction.id)}
                className="btn-spark-lime text-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>+ Place Test Bid</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Multi-Room Live Bids Streaming Ticker */}
      <div className="p-3 rounded-2xl bg-white border border-[#E9EFEF] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#15803d] animate-ping"></div>
            <span className="font-extrabold text-[#0B130F] uppercase tracking-wider text-[11px]">
              Live Multi-Room Bids Feed (Iraq Nationwide)
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#6C7E75]">
            Auto-Syncing Bids
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none text-xs">
          {liveAuctions
            .flatMap((auc) =>
              (auc.bidsHistory || []).map((b) => ({
                ...b,
                auctionId: auc.id,
                auctionTitle: auc.multilingual.en.title,
                city: auc.highestBidder?.rooftopPin?.city || 'Erbil',
              }))
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 8)
            .map((liveBid) => (
              <div
                key={liveBid.id}
                onClick={() => setSelectedAuctionId(liveBid.auctionId)}
                className={`p-2.5 rounded-xl border shrink-0 cursor-pointer transition-all flex items-center gap-3 ${
                  liveBid.auctionId === selectedAuctionId
                    ? 'bg-[#072F1F] text-white border-[#072F1F] shadow-xs'
                    : 'bg-[#F8FAF9] text-[#0B130F] border-[#E9EFEF] hover:bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs">{liveBid.bidderName}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      liveBid.auctionId === selectedAuctionId ? 'bg-white/20 text-[#B4F105]' : 'bg-[#DCFCE7] text-[#15803d]'
                    }`}>
                      {liveBid.city}
                    </span>
                  </div>
                  <span className={`text-[10px] block line-clamp-1 max-w-[130px] ${
                    liveBid.auctionId === selectedAuctionId ? 'text-white/80' : 'text-[#6C7E75]'
                  }`}>
                    {liveBid.auctionTitle}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-extrabold text-xs block ${
                    liveBid.auctionId === selectedAuctionId ? 'text-[#B4F105]' : 'text-[#15803d]'
                  }`}>
                    {liveBid.amountIqd.toLocaleString()} IQD
                  </span>
                  <span className={`text-[10px] font-mono ${
                    liveBid.auctionId === selectedAuctionId ? 'text-white/60' : 'text-[#6C7E75]'
                  }`}>
                    {new Date(liveBid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main War Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Live Auction Grid/Table/Compact List */}
        <div className="lg:col-span-8 space-y-4">
          {/* View Mode & Multi-criteria Sorting Control Bar */}
          <div className="spark-card !p-3 flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1 bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF]">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#072F1F] text-white shadow-xs'
                    : 'text-[#6C7E75] hover:text-[#0B130F]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Dense Data Table View"
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#072F1F] text-white shadow-xs'
                    : 'text-[#6C7E75] hover:text-[#0B130F]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                title="Compact List View"
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-[#072F1F] text-white shadow-xs'
                    : 'text-[#6C7E75] hover:text-[#0B130F]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Compact</span>
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6C7E75]" />
                <input
                  type="text"
                  placeholder="Search live..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#F4F6F5] border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-[#F4F6F5] px-2.5 py-1 rounded-full border border-[#E9EFEF] text-xs">
                <ArrowUpDown className="w-3 h-3 text-[#6C7E75]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[#0B130F] font-semibold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="ending_soon">Ending Soonest</option>
                  <option value="highest_bid">Highest Bid</option>
                  <option value="most_bids">Most Contested</option>
                  <option value="category">Category</option>
                </select>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#F4F6F5] text-[#0B130F] font-semibold text-xs px-2.5 py-1.5 rounded-full border border-[#E9EFEF] focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Soft Close Threat Toggle */}
              <button
                onClick={() => setSoftCloseOnly(!softCloseOnly)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 transition-colors border ${
                  softCloseOnly
                    ? 'bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]/30 shadow-xs'
                    : 'bg-[#F4F6F5] text-[#6C7E75] border-[#E9EFEF] hover:text-[#0B130F]'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>&le;60s Only</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: GRID CARDS VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedAuctions.map((auc) => {
                const secondsRemaining = getRemainingSeconds(auc.auctionEndsAt);
                const isSnipingThreat = secondsRemaining <= 60 && secondsRemaining > 0;
                const isSelected = auc.id === currentAuction?.id;

                return (
                  <div
                    key={auc.id}
                    onClick={() => setSelectedAuctionId(auc.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-white border-[#072F1F] shadow-lg ring-2 ring-[#072F1F]/10'
                        : 'bg-white border-[#E9EFEF] hover:border-slate-300'
                    }`}
                  >
                    {/* Anti-Sniping Soft Close Threat Banner */}
                    {isSnipingThreat && (
                      <div className="absolute top-0 left-0 right-0 bg-[#072F1F] text-[#B4F105] text-[10px] font-bold uppercase tracking-wider py-1 px-3 flex items-center justify-between border-b border-[#B4F105]/40 animate-pulse">
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-[#B4F105]" />
                          Soft Close Zone (&le;60s)
                        </span>
                        <span>Resets: {auc.antiSnipingResetsCount}</span>
                      </div>
                    )}

                    <div className={`flex items-start justify-between gap-3 ${isSnipingThreat ? 'pt-4' : ''}`}>
                      <div>
                        <span className="text-xs font-mono font-bold text-[#6C7E75]">
                          {auc.id} &bull; {auc.category}
                        </span>
                        <h3 className="font-bold text-sm text-[#0B130F] line-clamp-1 mt-0.5">
                          {auc.multilingual.en.title}
                        </h3>
                      </div>

                      {/* Live Countdown Badge */}
                      <div
                        className={`px-3 py-1 rounded-full font-mono text-xs font-black flex items-center gap-1.5 shrink-0 ${
                          isSnipingThreat
                            ? 'bg-[#FEE2E2] text-[#EF4444] animate-bounce'
                            : 'bg-[#DCFCE7] text-[#15803d]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatCountdown(secondsRemaining)}</span>
                      </div>
                    </div>

                    {/* Price and Dynamic Increment Breakdown */}
                    <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
                          Current Highest Bid
                        </span>
                        <span className="font-mono text-base font-black text-[#0B130F]">
                          {auc.currentBidIqd.toLocaleString()}{' '}
                          <span className="text-xs font-normal text-[#6C7E75]">IQD</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
                          Dynamic Tier Step
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0284c7]">
                          +{auc.incrementStepIqd.toLocaleString()} IQD
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#6C7E75]">
                      <span className="truncate max-w-[160px]">
                        Leader:{' '}
                        <strong className="text-[#0B130F]">
                          {auc.highestBidder?.name || 'No bids yet'}
                        </strong>
                      </span>
                      <span className="font-mono text-[11px] text-[#15803d] font-bold">
                        {auc.totalBids} Bids Placed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: DENSE DATA TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="spark-card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
                      <th className="p-3.5">Auction Item</th>
                      <th className="p-3.5">Time Left</th>
                      <th className="p-3.5">Current Bid</th>
                      <th className="p-3.5">Dynamic Step</th>
                      <th className="p-3.5">Leader / Activity</th>
                      <th className="p-3.5 text-center">Sniping Resets</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EFEF]">
                    {filteredAndSortedAuctions.map((auc) => {
                      const secondsRemaining = getRemainingSeconds(auc.auctionEndsAt);
                      const isSnipingThreat = secondsRemaining <= 60 && secondsRemaining > 0;
                      const isSelected = auc.id === currentAuction?.id;

                      return (
                        <tr
                          key={auc.id}
                          onClick={() => setSelectedAuctionId(auc.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#072F1F]/5 font-semibold' : 'hover:bg-[#F8FAF9]'
                          }`}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-[#6C7E75]">{auc.id}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F4F6F5] text-[#072F1F] font-bold">
                                {auc.category}
                              </span>
                            </div>
                            <div className="font-extrabold text-[#0B130F] mt-0.5 line-clamp-1 max-w-[220px]">
                              {auc.multilingual.en.title}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-black inline-flex items-center gap-1 ${
                                isSnipingThreat
                                  ? 'bg-[#FEE2E2] text-[#EF4444] animate-pulse'
                                  : 'bg-[#DCFCE7] text-[#15803d]'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatCountdown(secondsRemaining)}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">
                            <span className="font-black text-sm text-[#0B130F]">
                              {auc.currentBidIqd.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#6C7E75] ml-1">IQD</span>
                          </td>
                          <td className="p-3.5 font-mono text-[#0284c7] font-bold">
                            +{auc.incrementStepIqd.toLocaleString()} IQD
                          </td>
                          <td className="p-3.5 text-xs">
                            <div className="text-[#0B130F] font-medium truncate max-w-[120px]">
                              {auc.highestBidder?.name || 'No bids'}
                            </div>
                            <div className="text-[10px] font-mono text-[#6C7E75]">
                              {auc.totalBids} bids
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                auc.antiSnipingResetsCount > 0
                                  ? 'bg-[#FFEDD5] text-[#F97316]'
                                  : 'bg-[#F4F6F5] text-[#6C7E75]'
                              }`}
                            >
                              {auc.antiSnipingResetsCount}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAuctionId(auc.id);
                              }}
                              className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#072F1F] text-[#B4F105]'
                                  : 'bg-[#F4F6F5] text-[#072F1F] hover:bg-[#E9EFEF]'
                              }`}
                            >
                              {isSelected ? 'Active Room' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: COMPACT LIST VIEW */}
          {viewMode === 'compact' && (
            <div className="space-y-2">
              {filteredAndSortedAuctions.map((auc) => {
                const secondsRemaining = getRemainingSeconds(auc.auctionEndsAt);
                const isSnipingThreat = secondsRemaining <= 60 && secondsRemaining > 0;
                const isSelected = auc.id === currentAuction?.id;

                return (
                  <div
                    key={auc.id}
                    onClick={() => setSelectedAuctionId(auc.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-wrap items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-[#072F1F] shadow-md ring-2 ring-[#072F1F]/10'
                        : 'bg-white border-[#E9EFEF] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <span className="font-mono text-xs font-bold text-[#6C7E75]">{auc.id}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#0B130F] line-clamp-1">
                            {auc.multilingual.en.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F4F6F5] text-[#6C7E75]">
                            {auc.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6C7E75] mt-0.5">
                          Leader: <strong className="text-[#0B130F]">{auc.highestBidder?.name || 'None'}</strong> &bull; {auc.totalBids} bids
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <span className="font-mono text-xs font-black text-[#15803d]">
                          {auc.currentBidIqd.toLocaleString()} IQD
                        </span>
                        <span className="text-[10px] font-mono text-[#0284c7] block">
                          (+{auc.incrementStepIqd.toLocaleString()})
                        </span>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-full font-mono text-xs font-black flex items-center gap-1 ${
                          isSnipingThreat
                            ? 'bg-[#FEE2E2] text-[#EF4444] animate-pulse'
                            : 'bg-[#DCFCE7] text-[#15803d]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{formatCountdown(secondsRemaining)}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAuctionId(auc.id);
                        }}
                        className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                          isSelected
                            ? 'bg-[#072F1F] text-[#B4F105]'
                            : 'bg-[#F4F6F5] text-[#072F1F] hover:bg-[#E9EFEF]'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty Filter State */}
          {filteredAndSortedAuctions.length === 0 && (
            <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl bg-white">
              No live auctions match your filter criteria.
            </div>
          )}

          {/* Interactive Bidding Feature Demonstrator */}
          {currentAuction && (
            <div className="spark-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-3">
                <h3 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#072F1F]" />
                  Mobile UX Bidding Mechanics Simulation
                </h3>
                <span className="text-xs font-mono text-[#6C7E75]">
                  Target: {currentAuction.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Interactive 88%+ Slide-To-Bid Slider */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B130F]">Interactive Slide-To-Bid</span>
                    <span className="font-mono text-[#6C7E75] text-[11px]">88%+ Threshold Required</span>
                  </div>
                  <p className="text-xs text-[#6C7E75]">
                    Eliminates accidental taps during fast-paced bidding wars by requiring a deliberate gesture.
                  </p>

                  <div className="relative pt-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPosition}
                      onChange={handleSliderDrag}
                      className="w-full h-10 bg-white border border-[#E9EFEF] rounded-xl appearance-none cursor-pointer accent-[#072F1F]"
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#6C7E75] mt-1">
                      <span>0% Drag</span>
                      <span className="text-[#15803d] font-bold">88% Trigger Mark</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="text-center font-mono text-xs text-[#0B130F]">
                    Next Bid Amount:{' '}
                    <strong className="text-[#15803d] font-bold">
                      {(currentAuction.currentBidIqd + currentAuction.incrementStepIqd).toLocaleString()}{' '}
                      IQD
                    </strong>
                  </div>
                </div>

                {/* 2. Proxy Auto-Bidding Safety Brake */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B130F]">Proxy Auto-Bidding Safety Brake</span>
                    <span className="font-mono text-[#F97316] text-[11px]">&gt; 150% Market Warning</span>
                  </div>
                  <p className="text-xs text-[#6C7E75]">
                    Calculated against Gemini baseline (
                    {currentAuction.estimatedRetailMarketPriceIqd.toLocaleString()} IQD).
                    Threshold: {(currentAuction.estimatedRetailMarketPriceIqd * 1.5).toLocaleString()} IQD.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={5000}
                      value={proxyCeilingIqd}
                      onChange={(e) => setProxyCeilingIqd(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs font-mono text-[#0B130F] focus:outline-hidden focus:border-[#072F1F]"
                      placeholder="Max Ceiling (IQD)"
                    />
                    <button
                      onClick={handleTestAutoBid}
                      className="btn-spark-light text-xs shrink-0"
                    >
                      Test Ceiling
                    </button>
                  </div>

                  {showSafetyBrakeWarning && (
                    <div className="p-2.5 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                        <span>SAFETY BRAKE TRIGGERED!</span>
                      </div>
                      <p className="text-[11px]">
                        Entered ceiling exceeds 150% of the scraped market value. Mobile app displays explicit confirmation modal before accepting.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contextual WhatsApp Help Link Generator */}
              <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#22C55E]/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[#15803d] font-bold text-xs">
                    <MessageCircle className="w-4 h-4" />
                    <span>Contextual One-Tap WhatsApp Support Link</span>
                  </div>
                  <p className="text-[11px] text-[#0B130F]">
                    Pre-fills listing ID <code className="text-[#15803d] font-bold">{currentAuction.id}</code>, title, and seller name directly into WhatsApp.
                  </p>
                </div>

                <a
                  href={`https://wa.me/9647500000000?text=${encodeURIComponent(
                    `Hello ZEEDO Support, I have an inquiry regarding Auction ID: ${currentAuction.id} (${currentAuction.multilingual.en.title}), Seller: ${currentAuction.sellerName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-spark-primary text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#B4F105]" />
                  <span>Preview WhatsApp Link</span>
                </a>
              </div>

              {/* Emergency Operator Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E9EFEF] text-xs">
                <span className="text-[#6C7E75]">Emergency Operator Controls:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => pauseAuction(currentAuction.id)}
                    className="btn-spark-light text-xs"
                  >
                    <span>Pause / Cancel</span>
                  </button>
                  <button
                    onClick={() => forceEndAuction(currentAuction.id)}
                    className="btn-spark-lime text-xs"
                  >
                    <span>Conclude & Award</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Low-Data Socket Stream & Live Bid Log */}
        <div className="lg:col-span-4 space-y-4">
          {/* Low-Data Network Resilience Feed */}
          <div className="spark-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#15803d]" />
                <span className="text-xs font-bold text-[#0B130F] uppercase tracking-wider">
                  Low-Data WebSocket Stream
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
                12-25 Bytes/Pkt
              </span>
            </div>

            <p className="text-[11px] text-[#6C7E75]">
              Array-based payload: <code className="text-[#072F1F] font-bold">[listingId, price, bidderId, secondsLeft]</code> drops payload overhead by 88% over spotty Iraqi 3G/4G.
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
              {lowDataSocketFeed.map((pkt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] flex items-center justify-between"
                >
                  <span className="font-semibold">{JSON.stringify(pkt)}</span>
                  <span className="text-[10px] text-[#6C7E75]">~{JSON.stringify(pkt).length}B</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Room Bid History */}
          {currentAuction && (
            <div className="spark-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#072F1F]" />
                  <span className="text-xs font-bold text-[#0B130F] uppercase tracking-wider">
                    Room Bid History ({currentAuction.bidsHistory.length})
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {currentAuction.bidsHistory.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      b.isVoided
                        ? 'bg-[#FEF2F2] border-[#EF4444]/40 opacity-75'
                        : 'bg-[#F8FAF9] border-[#E9EFEF]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#0B130F] flex items-center gap-1.5">
                        <span className={b.isVoided ? 'line-through text-[#EF4444]' : ''}>
                          {b.bidderName}
                        </span>
                        {b.isAutoBid && !b.isVoided && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#072F1F] text-[#B4F105] font-mono">
                            AUTO
                          </span>
                        )}
                        {b.isVoided && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#EF4444] text-white font-mono font-bold">
                            VOIDED
                          </span>
                        )}
                      </div>

                      {b.isVoided ? (
                        <p className="text-[10px] text-[#EF4444] font-medium">
                          Reason: {b.voidReason}
                        </p>
                      ) : (
                        <span className="text-[10px] text-[#6C7E75] font-mono">{b.bidderPhone}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`font-mono font-extrabold block ${
                          b.isVoided ? 'line-through text-slate-400' : 'text-[#15803d]'
                        }`}>
                          {b.amountIqd.toLocaleString()} IQD
                        </span>
                        <span className="text-[10px] text-[#6C7E75] font-mono">
                          {new Date(b.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {!b.isVoided && (
                        <button
                          onClick={() => {
                            setVoidTargetBid({ id: b.id, bidderName: b.bidderName, amountIqd: b.amountIqd });
                            setVoidReason('Suspected Shill Bidding / Account Collusion');
                          }}
                          className="p-1.5 rounded-lg bg-white border border-[#E9EFEF] text-[#EF4444] hover:bg-[#FEE2E2] hover:border-[#EF4444] transition-colors"
                          title="Void Bid & Roll Back Price"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {currentAuction.bidsHistory.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl">
                    No bids recorded yet. Starts at 1,000 IQD.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Moderator Bid Voiding & Rollback */}
      {voidTargetBid && currentAuction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EF4444]/30 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center font-bold">
                  <ShieldX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0B130F]">
                    Void Bid & Roll Back Price
                  </h3>
                  <span className="text-[11px] font-mono text-[#6C7E75]">
                    Auction: {currentAuction.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setVoidTargetBid(null)}
                className="text-[#6C7E75] hover:text-[#0B130F] p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#EF4444]/30 space-y-1 text-xs text-[#EF4444]">
              <div className="flex items-center justify-between">
                <span>Target Bidder:</span>
                <strong className="text-[#0B130F]">{voidTargetBid.bidderName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Bid Amount to Void:</span>
                <strong className="font-mono font-extrabold text-[#EF4444]">
                  {voidTargetBid.amountIqd.toLocaleString()} IQD
                </strong>
              </div>
            </div>

            <p className="text-xs text-[#6C7E75]">
              Voiding this bid will cancel the offer, automatically roll back the auction price to the previous valid bid (or fallback to starting 1,000 IQD), and log a permanent audit record.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B130F] block">
                Disqualification / Void Reason:
              </label>
              <select
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs font-bold text-[#0B130F] focus:outline-hidden focus:border-[#EF4444]"
              >
                <option value="Suspected Shill Bidding / Account Collusion">
                  Suspected Shill Bidding / Account Collusion
                </option>
                <option value="Errant Bid Input / User Decimal Slip">
                  Errant Bid Input / User Decimal Slip
                </option>
                <option value="KYC Revoked / Insolvent Bidder">
                  KYC Revoked / Insolvent Bidder
                </option>
                <option value="Doorstep COD Refusal Blacklist">
                  Doorstep COD Refusal Blacklist
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVoidTargetBid(null)}
                className="btn-spark-light text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  voidAuctionBid(currentAuction.id, voidTargetBid.id, voidReason);
                  setVoidTargetBid(null);
                }}
                className="px-5 py-2 rounded-full bg-[#EF4444] text-white font-bold text-xs hover:bg-[#dc2626] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Void & Rollback</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
