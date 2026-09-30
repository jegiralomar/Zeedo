'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  PlusCircle,
  Package,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  LogOut,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  Truck,
  Phone,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { ListingAuction, ConditionTag } from '@/types';

interface ScrapedData {
  title: string;
  description: string;
  images: string[];
  retailPriceUsd: number;
  brand: string;
  category: string;
  specs: string[];
  sourceUrl: string;
}

export const MerchantPortalView: React.FC = () => {
  const { buyer, logout } = useBuyerAuthStore();
  const { auctions, createSellerListing, sellers, syncAuctionsFromDb } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'listings' | 'new_listing' | 'orders' | 'billing'>('listings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'moderation_pending' | 'completed' | 'rejected'>('all');

  // Link Scraper State
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [marketExchangeRate, setMarketExchangeRate] = useState<number>(1510);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Consumer Electronics');
  const [condition, setCondition] = useState<ConditionTag>('New');
  const [retailPriceUsd, setRetailPriceUsd] = useState<number>(100);
  const [retailPriceIqd, setRetailPriceIqd] = useState<number>(151000);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load exchange rate and sync DB auctions on mount
  useEffect(() => {
    syncAuctionsFromDb();
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.marketRate) {
          setMarketExchangeRate(json.data.marketRate);
        }
      })
      .catch(() => {});
  }, [syncAuctionsFromDb]);

  // Update converted IQD when USD or exchange rate changes
  useEffect(() => {
    setRetailPriceIqd(Math.round(retailPriceUsd * marketExchangeRate));
  }, [retailPriceUsd, marketExchangeRate]);

  // Current merchant profile
  const currentSeller = sellers.find((s) => s.id === buyer?.sellerId || s.phone === buyer?.phone) || {
    id: buyer?.sellerId || 'sel-merchant',
    storeName: buyer?.storeName || buyer?.name || 'Verified Merchant Store',
    ownerName: buyer?.name || 'Store Owner',
    phone: buyer?.phone || '+964 750 000 0000',
    city: buyer?.city || 'Erbil',
    commissionRate: buyer?.commissionRate || 0.07,
    auto_approve_listings: false,
    totalListings: 0,
    completedSales: 0,
  };

  // Filter listings belonging to this seller
  const merchantAuctions = auctions.filter(
    (a) => a.sellerId === currentSeller.id || a.sellerPhone === currentSeller.phone
  );

  const displayedListings = merchantAuctions.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  // Calculate billing metrics (Merchant Direct COD + Invoicing model)
  const totalPostingsCount = merchantAuctions.length;
  const postingFeesIqd = totalPostingsCount * 1000; // 1,000 IQD per posting
  const soldAuctions = merchantAuctions.filter((a) => a.status === 'completed' && a.highestBidder);
  const totalCodSalesVolumeIqd = soldAuctions.reduce((sum, a) => sum + a.currentBidIqd, 0);
  const commissionRate = currentSeller.commissionRate || 0.07;
  const totalCommissionDueIqd = Math.round(totalCodSalesVolumeIqd * commissionRate);
  const totalBalanceDueIqd = postingFeesIqd + totalCommissionDueIqd;

  // Scraper Handler
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;

    setIsScraping(true);
    setScrapeError(null);

    try {
      const res = await fetch('/api/scraper/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Could not extract product');
      }

      const product: ScrapedData = data.data;
      setTitle(product.title);
      setDescription(product.description || '');
      setCategory(product.category || 'Consumer Electronics');
      setRetailPriceUsd(product.retailPriceUsd || 100);
      setImages(product.images.length > 0 ? product.images : []);
      setSpecs(product.specs || []);
      setSourceUrl(product.sourceUrl || scrapeUrl);
    } catch (err: any) {
      setScrapeError(err.message || 'Scraping failed. You can enter details manually.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    if (specInput.trim()) {
      setSpecs([...specs, specInput.trim()]);
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    createSellerListing({
      sellerId: currentSeller.id,
      sellerName: currentSeller.storeName,
      sellerPhone: currentSeller.phone,
      category,
      condition,
      estimatedRetailPriceUsd: retailPriceUsd,
      estimatedRetailMarketPriceIqd: retailPriceIqd,
      proposedDurationHours: durationHours,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      sourceType: 'url',
      sourceValue: sourceUrl || scrapeUrl,
      multilingual: {
        en: { title, description, specs },
        ar: { title, description, specs },
        ckb: { title, description, specs },
        badini: { title, description, specs },
      },
    });

    setSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      // Reset form
      setTitle('');
      setDescription('');
      setImages([]);
      setSpecs([]);
      setScrapeUrl('');
      setActiveTab('listings');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Merchant Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">{currentSeller.storeName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Merchant Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentSeller.city} • Commission: {(commissionRate * 100).toFixed(0)}% • +1,000 IQD / listing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">Market Rate:</span>
              <span className="font-mono font-bold text-emerald-400">$1 = {marketExchangeRate.toLocaleString()} IQD</span>
            </div>

            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Total Listings</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{merchantAuctions.length}</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {merchantAuctions.filter((a) => a.status === 'live').length} Active Live
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Pending Review</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">
                {merchantAuctions.filter((a) => a.status === 'moderation_pending').length}
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">In Admin Moderation Queue</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Won Auctions (COD)</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{soldAuctions.length}</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-1 block font-mono">
              {totalCodSalesVolumeIqd.toLocaleString()} IQD Sold
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Current Balance Due</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-white font-mono">
                {totalBalanceDueIqd.toLocaleString()} IQD
              </span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Postings + {(commissionRate * 100).toFixed(0)}% Commission</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'listings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Listings ({merchantAuctions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('new_listing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'new_listing'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Listing (Link Scraper)</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Won Orders ({soldAuctions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoices & Settlement</span>
          </button>
        </div>

        {/* TAB 1: LISTINGS VIEW */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {/* Filter Sub-nav */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['all', 'live', 'moderation_pending', 'completed', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      filterStatus === st
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('new_listing')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Item</span>
              </button>
            </div>

            {displayedListings.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
                <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="font-bold text-slate-300 text-sm">No listings found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {filterStatus === 'all'
                    ? "You haven't posted any items yet. Paste a product link from Amazon or foreign sites to generate a listing in seconds!"
                    : `No items in "${filterStatus.replace('_', ' ')}" status.`}
                </p>
                <button
                  onClick={() => setActiveTab('new_listing')}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Listing</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedListings.map((item) => {
                  const statusColors = {
                    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    moderation_pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                    grace_period: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                  };

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Preview & Badges */}
                        <div className="relative h-44 bg-slate-950 overflow-hidden group">
                          {item.images[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.multilingual.en?.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}

                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                statusColors[item.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-slate-300 border border-slate-700">
                              {item.condition}
                            </span>
                          </div>

                          <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[11px] font-mono font-bold text-amber-400">
                            {item.estimatedRetailPriceUsd ? `$${item.estimatedRetailPriceUsd}` : ''}
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-4">
                          <h4 className="font-bold text-sm text-white line-clamp-1">
                            {item.multilingual.en?.title || 'Untitled Item'}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {item.multilingual.en?.description || 'No description provided'}
                          </p>

                          {/* Rejection Note Alert if rejected */}
                          {item.status === 'rejected' && item.rejectionReason && (
                            <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[11px]">Admin Rejection Reason:</span>
                                <span>{item.rejectionReason}</span>
                              </div>
                            </div>
                          )}

                          {/* Auction Bidding Stats */}
                          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Current Bid</span>
                              <p className="font-bold font-mono text-emerald-400 text-sm">
                                {item.currentBidIqd.toLocaleString()} IQD
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Total Bids</span>
                              <p className="font-bold font-mono text-slate-300 text-sm">
                                {item.totalBids || 0} bids
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-3 bg-slate-950/50 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {item.id}
                        </span>
                        {item.status === 'live' && (
                          <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live on zeedo.auction
                          </span>
                        )}
                        {item.status === 'completed' && item.highestBidder && (
                          <span className="text-blue-400 text-[11px] font-bold">
                            Sold to {item.highestBidder.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NEW LISTING VIA LINK SCRAPER */}
        {activeTab === 'new_listing' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Step 1: Scraper Link Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Import from Product Link</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Paste any product URL from Amazon, foreign e-commerce, or manufacturer sites. Zeedo automatically extracts photos, specifications, and USD retail price, converting it to IQD at parallel market exchange rate.
              </p>

              <form onSubmit={handleScrape} className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/... or any product link"
                  className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isScraping || !scrapeUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isScraping ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill Details</span>
                    </>
                  )}
                </button>
              </form>

              {scrapeError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                  {scrapeError}
                </div>
              )}
            </div>

            {/* Step 2: Listing Editor Form */}
            <form onSubmit={handleCreateListing} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Auction Details & Schedule</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Posting fee: 1,000 IQD upon approval
                </span>
              </div>

              {submitSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Item successfully submitted to Admin Moderation Queue!</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Item Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Computers & Tablets">Computers & Tablets</option>
                    <option value="Watches & Luxury">Watches & Luxury</option>
                    <option value="Gaming & Consoles">Gaming & Consoles</option>
                    <option value="Heavy Tools & Machinery">Heavy Tools & Machinery</option>
                    <option value="Vehicles & Parts">Vehicles & Parts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ConditionTag)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="New">New (Brand New Sealed)</option>
                    <option value="New Open Box">New Open Box (Inspected)</option>
                    <option value="Used">Used (Functional / Pre-owned)</option>
                  </select>
                </div>
              </div>

              {/* Currency & Retail Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Retail Price (USD $)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
                    <input
                      type="number"
                      min="1"
                      value={retailPriceUsd}
                      onChange={(e) => setRetailPriceUsd(Number(e.target.value))}
                      className="w-full py-2 pl-7 pr-3 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs font-mono font-bold focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">From scraped link</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Retail Reference (IQD)</label>
                  <input
                    type="number"
                    value={retailPriceIqd}
                    onChange={(e) => setRetailPriceIqd(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-lg border border-slate-700 bg-slate-900 text-emerald-400 text-xs font-mono font-bold focus:outline-hidden focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">@ {marketExchangeRate} IQD/USD</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Auction Duration</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:outline-hidden focus:border-amber-400 font-bold"
                  >
                    <option value={12}>12 Hours (Flash Auction)</option>
                    <option value={24}>24 Hours (Standard)</option>
                    <option value={48}>48 Hours (Weekend Special)</option>
                    <option value={72}>72 Hours (3 Days)</option>
                  </select>
                  <span className="text-[10px] text-slate-500">Goes live immediately on approval</span>
                </div>
              </div>

              {/* Image Gallery Management */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Product Images ({images.length})</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add direct image URL (jpg, png, webp)"
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                  >
                    Add Photo
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                        <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Item Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key features, warranty, box contents..."
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Technical Specifications</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    placeholder="e.g. 256GB Storage, Active Noise Cancelling"
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                  >
                    Add Spec
                  </button>
                </div>

                {specs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {specs.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="text-slate-500 hover:text-rose-400 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Starts at <strong className="text-white">1,000 IQD</strong> strict base fee
                </span>

                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit to Moderation Queue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: WON ORDERS & COD DISPATCH */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Won Auctions / COD Deliveries</h3>
                <p className="text-xs text-slate-400">
                  Auctions won by buyers. Deliver item directly via courier and collect COD cash amount.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                {soldAuctions.length} Won Items
              </span>
            </div>

            {soldAuctions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
                <Truck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="font-bold text-slate-300 text-sm">No won orders yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When your live auctions end, winning buyers and their contact details for Cash on Delivery will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {soldAuctions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                        alt={item.multilingual.en?.title}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{item.multilingual.en?.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-slate-400">Winner:</span>
                          <strong className="text-slate-200">{item.highestBidder?.name}</strong>
                          <span className="text-slate-500 font-mono">({item.highestBidder?.phone})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Destination: {item.highestBidder?.rooftopPin?.city || currentSeller.city}
                        </span>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Cash to Collect (COD)</span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        {item.currentBidIqd.toLocaleString()} IQD
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Zeedo Commission: {Math.round(item.currentBidIqd * commissionRate).toLocaleString()} IQD ({(commissionRate * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BILLING & INVOICING */}
        {activeTab === 'billing' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white">Merchant Commission & Billing Statement</h3>
                  <p className="text-xs text-slate-400">Direct COD collection with monthly Zeedo commission invoicing.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Current Cycle
                </span>
              </div>

              {/* Statement Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Total Listings Created ({totalPostingsCount} items × 1,000 IQD)</span>
                  <span className="font-mono font-bold text-white">{postingFeesIqd.toLocaleString()} IQD</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Total Gross COD Collected ({soldAuctions.length} sales)</span>
                  <span className="font-mono font-bold text-emerald-400">{totalCodSalesVolumeIqd.toLocaleString()} IQD</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Platform Commission Due ({(commissionRate * 100).toFixed(0)}% of COD GMV)</span>
                  <span className="font-mono font-bold text-amber-400">{totalCommissionDueIqd.toLocaleString()} IQD</span>
                </div>

                <div className="flex justify-between pt-2 text-sm">
                  <span className="font-bold text-white">Total Balance Owed to Zeedo</span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {totalBalanceDueIqd.toLocaleString()} IQD
                  </span>
                </div>
              </div>

              {/* Remittance Information */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-300 block">Settlement Payment Methods:</span>
                <p className="text-slate-400">
                  Please remit the platform balance via any of the approved channels below:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">FIB / FastPay</strong>
                    <span className="text-slate-400">+964 750 000 0000</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">ZainCash</strong>
                    <span className="text-slate-400">+964 780 000 0000</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Cash Office</strong>
                    <span className="text-slate-400">Erbil & Baghdad Hubs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
