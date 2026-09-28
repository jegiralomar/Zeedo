'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { ListingAuction, LanguageCode, MultilingualContent } from '@/types';
import {
  FileSpreadsheet,
  Globe2,
  Sparkles,
  Lock,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Edit3,
  Layers,
  Search,
} from 'lucide-react';

export const MultiDialectReviewStudio: React.FC = () => {
  const { auctions, approveListing, rejectListing, updateListingMultilingual, relistAuction } =
    useAdminStore();

  const pendingListings = auctions.filter((a) => a.status === 'moderation_pending');
  const otherListings = auctions.filter((a) => a.status !== 'moderation_pending');

  const [selectedAuctionId, setSelectedAuctionId] = useState<string>(
    pendingListings[0]?.id || auctions[0]?.id || ''
  );

  const [searchQueue, setSearchQueue] = useState('');

  const filteredPending = pendingListings.filter(
    (a) =>
      a.multilingual.en.title.toLowerCase().includes(searchQueue.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQueue.toLowerCase()) ||
      a.sellerName.toLowerCase().includes(searchQueue.toLowerCase())
  );

  const filteredOther = otherListings.filter(
    (a) =>
      a.multilingual.en.title.toLowerCase().includes(searchQueue.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQueue.toLowerCase()) ||
      a.sellerName.toLowerCase().includes(searchQueue.toLowerCase())
  );

  const [activeTabLang, setActiveTabLang] = useState<LanguageCode>('en');
  const [viewMode, setViewMode] = useState<'tabbed' | 'side_by_side'>('side_by_side');

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<MultilingualContent>({
    title: '',
    description: '',
    specs: [],
  });

  // Rejection modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Missing Technical Specifications');

  const currentAuction =
    auctions.find((a) => a.id === selectedAuctionId) || pendingListings[0] || auctions[0];

  const handleStartEditing = (lang: LanguageCode) => {
    if (!currentAuction) return;
    setActiveTabLang(lang);
    setEditedContent({ ...currentAuction.multilingual[lang] });
    setIsEditing(true);
  };

  const handleSaveTranslation = () => {
    if (!currentAuction) return;
    updateListingMultilingual(currentAuction.id, activeTabLang, editedContent);
    setIsEditing(false);
  };

  const getTierStep = (baseline: number) => {
    if (baseline <= 100000) return 1000;
    if (baseline <= 200000) return 2000;
    return 3000;
  };

  const dialects: { code: LanguageCode; label: string; sub: string; dir: 'ltr' | 'rtl' }[] = [
    { code: 'en', label: 'English', sub: 'Latin • LTR', dir: 'ltr' },
    { code: 'ar', label: 'العربية (Arabic)', sub: 'Arabic • RTL', dir: 'rtl' },
    { code: 'ckb', label: 'کوردی سۆرانی (Sorani)', sub: 'Kurdish • RTL (Erbil/Sulaymaniyah)', dir: 'rtl' },
    { code: 'badini', label: 'بادینی (Badini)', sub: 'Kurdish • RTL (Duhok/Zakho)', dir: 'rtl' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Summary & Layout Switcher */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-bold">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              4-Dialect Multilingual Review Studio
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
                Gemini 1.5 Flash Unified Output
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Verify AI-generated titles, specs, starting price (1,000 IQD rule), and regional translations.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF]">
          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'side_by_side'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Column Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('tabbed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'tabbed'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Tabbed Deep Edit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Listing Queue, Right Review Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Listings in Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#6C7E75] uppercase tracking-wider px-1">
            <span>Listings for Moderation</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFEDD5] text-[#F97316] font-mono font-bold">
              {filteredPending.length} Pending
            </span>
          </div>

          {/* Search Queue Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6C7E75]" />
            <input
              type="text"
              placeholder="Search queue by title, ID, seller..."
              value={searchQueue}
              onChange={(e) => setSearchQueue(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
            />
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredPending.map((item) => {
              const isSelected = item.id === currentAuction?.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedAuctionId(item.id);
                    setIsEditing(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#072F1F] shadow-md ring-2 ring-[#072F1F]/10'
                      : 'bg-white border-[#E9EFEF] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F97316]">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEDD5] text-[#F97316]">
                      Needs Review
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#0B130F] mt-1 line-clamp-1">
                    {item.multilingual.en.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-[#6C7E75] mt-2">
                    <span className="truncate max-w-[140px] text-[#0B130F] font-medium">
                      {item.sellerName}
                    </span>
                    <span className="font-mono text-[#15803d] font-bold">
                      Est. {item.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                    </span>
                  </div>

                  {item.gracePeriodEndsAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#0284c7] mt-2 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>10m Grace Expired &bull; Routed to Admin</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPending.length === 0 && (
              <div className="p-4 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-xl bg-white">
                No pending listings match your search.
              </div>
            )}

            {/* Other Listings */}
            <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-[#6C7E75] px-1">
              Active & Completed Auctions
            </div>

            {filteredOther.map((item) => {
              const isSelected = item.id === currentAuction?.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedAuctionId(item.id);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#072F1F] shadow-sm'
                      : 'bg-white/70 border-[#E9EFEF] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#6C7E75]">{item.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        item.status === 'live'
                          ? 'bg-[#DCFCE7] text-[#15803d]'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-xs text-[#0B130F] mt-1 line-clamp-1">
                    {item.multilingual.en.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Multi-Dialect Inspection Board */}
        <div className="lg:col-span-8">
          {currentAuction ? (
            <div className="spark-card space-y-6">
              {/* Top Banner: Verification Rules Check */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  {/* Strict Starting Price Rule */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803d] flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
                        Strict Starting Price
                      </span>
                      <span className="font-mono text-sm font-extrabold text-[#15803d]">
                        1,000 IQD (ZEEDO Base Retained)
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Tiered Increment Rule */}
                  <div className="flex items-center gap-2.5 border-l border-[#E9EFEF] pl-6">
                    <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284c7] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
                        Tiered Step Increment
                      </span>
                      <span className="font-mono text-sm font-extrabold text-[#0284c7]">
                        +{getTierStep(currentAuction.estimatedRetailMarketPriceIqd).toLocaleString()} IQD
                        <span className="text-[10px] text-[#6C7E75] ml-1 font-normal">
                          (Baseline: {currentAuction.estimatedRetailMarketPriceIqd.toLocaleString()} IQD)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Autonomy Flag Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                      currentAuction.sellerAutoApprove
                        ? 'bg-[#DCFCE7] text-[#15803d]'
                        : 'bg-[#FFEDD5] text-[#F97316]'
                    }`}
                  >
                    Seller: {currentAuction.sellerAutoApprove ? 'Autonomous' : 'Moderation Required'}
                  </span>
                </div>
              </div>

              {/* Multimodal Gemini AI Source Log */}
              <div className="p-3.5 rounded-2xl bg-[#F4F6F5] border border-[#E9EFEF] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#072F1F] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B4F105] fill-[#072F1F]" />
                    Multimodal Gemini 1.5 Flash Scraper Prompt Input
                  </span>
                  <span className="font-mono text-[11px] text-[#6C7E75]">
                    Source: {currentAuction.sourceType.toUpperCase()}
                  </span>
                </div>
                <p className="text-[#0B130F] font-mono text-[11px] bg-white p-2.5 rounded-xl border border-[#E9EFEF]">
                  {currentAuction.sourceValue}
                </p>
              </div>

              {/* Side-by-Side 4-Column View */}
              {viewMode === 'side_by_side' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dialects.map((d) => {
                    const content = currentAuction.multilingual[d.code];
                    return (
                      <div
                        key={d.code}
                        dir={d.dir}
                        className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-3 relative group hover:border-[#072F1F] transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-2">
                          <div>
                            <span className="font-bold text-xs text-[#0B130F]">{d.label}</span>
                            <span className="text-[10px] text-[#6C7E75] block font-mono">
                              {d.sub}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setViewMode('tabbed');
                              handleStartEditing(d.code);
                            }}
                            className="text-[11px] text-[#072F1F] hover:underline font-bold font-mono"
                          >
                            Edit
                          </button>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#6C7E75] uppercase font-bold">
                            Title
                          </div>
                          <h4 className="text-xs font-bold text-[#0B130F] mt-0.5 leading-snug">
                            {content.title}
                          </h4>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#6C7E75] uppercase font-bold">
                            Description
                          </div>
                          <p className="text-xs text-[#6C7E75] mt-0.5 line-clamp-3 leading-relaxed">
                            {content.description}
                          </p>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#6C7E75] uppercase font-bold">
                            Bulleted Specs ({content.specs.length})
                          </div>
                          <ul className="text-[11px] text-[#0B130F] space-y-1 mt-1">
                            {content.specs.map((s, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Tabbed Deep Edit View */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E9EFEF] pb-2">
                    {dialects.map((d) => (
                      <button
                        key={d.code}
                        onClick={() => {
                          setActiveTabLang(d.code);
                          if (isEditing) {
                            setEditedContent({ ...currentAuction.multilingual[d.code] });
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          activeTabLang === d.code
                            ? 'bg-[#072F1F] text-white'
                            : 'bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <div
                    dir={dialects.find((d) => d.code === activeTabLang)?.dir}
                    className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-4"
                  >
                    <div>
                      <label className="text-xs font-bold text-[#6C7E75] block mb-1">
                        Localized Listing Title
                      </label>
                      <input
                        type="text"
                        value={
                          isEditing
                            ? editedContent.title
                            : currentAuction.multilingual[activeTabLang].title
                        }
                        onChange={(e) =>
                          setEditedContent({ ...editedContent, title: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-sm text-[#0B130F] font-bold disabled:opacity-85"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#6C7E75] block mb-1">
                        Localized Product Description
                      </label>
                      <textarea
                        rows={3}
                        value={
                          isEditing
                            ? editedContent.description
                            : currentAuction.multilingual[activeTabLang].description
                        }
                        onChange={(e) =>
                          setEditedContent({ ...editedContent, description: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs text-[#0B130F] leading-relaxed disabled:opacity-85"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E9EFEF]">
                      {!isEditing ? (
                        <button
                          onClick={() => handleStartEditing(activeTabLang)}
                          className="btn-spark-light text-xs"
                        >
                          Enable Inline Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-xl bg-slate-200 text-[#0B130F] text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveTranslation}
                            className="btn-spark-lime text-xs"
                          >
                            Save Translation Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Moderation Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E9EFEF]">
                <button
                  onClick={() => relistAuction(currentAuction.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4F6F5] hover:bg-[#E9EFEF] text-xs font-bold text-[#072F1F] transition-colors"
                  title="One-Tap Relist: Preserves photos and 4-dialect translations, restarting fresh at 1,000 IQD"
                >
                  <Copy className="w-3.5 h-3.5 text-[#072F1F]" />
                  <span>One-Tap Relist at 1,000 IQD</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentAuction.status === 'moderation_pending' ? (
                    <>
                      <button
                        onClick={() => setIsRejectOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#FEE2E2] text-[#EF4444] hover:bg-[#fecaca] transition-all text-xs font-bold"
                      >
                        Reject Listing
                      </button>

                      <button
                        onClick={() => approveListing(currentAuction.id)}
                        className="btn-spark-lime text-xs px-5 py-2 rounded-xl font-black shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#072F1F]" />
                        <span>Approve & Publish LIVE</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs font-mono text-[#6C7E75]">
                      Status:{' '}
                      <span className="text-[#15803d] font-bold uppercase">
                        {currentAuction.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-white border border-[#E9EFEF] text-[#6C7E75]">
              Select a listing to moderate and verify translations.
            </div>
          )}
        </div>
      </div>

      {/* Reject Listing Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#EF4444]" />
              Reject Listing Submission
            </h3>
            <p className="text-xs text-[#6C7E75]">
              Provide feedback to {currentAuction?.sellerName}. The listing will not be published to the buyer marketplace.
            </p>

            <div className="space-y-2">
              {[
                'Missing Technical Specifications',
                'Unrealistic Estimated Market Retail Price',
                'Product Images Do Not Meet Guidelines',
                'Prohibited or Restricted Item in Iraq',
                'Duplicate Listing Detected',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F6F5] border border-[#E9EFEF] text-xs text-[#0B130F] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="listingRejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="accent-[#072F1F]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentAuction) {
                    rejectListing(currentAuction.id, rejectReason);
                    setIsRejectOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
