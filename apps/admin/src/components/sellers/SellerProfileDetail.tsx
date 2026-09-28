'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { SellerMerchant } from '@/types';
import {
  Store,
  ArrowLeft,
  Percent,
  ShieldCheck,
  ShieldAlert,
  Coins,
  MapPin,
  Phone,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  Package,
  Layers,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

interface SellerProfileDetailProps {
  sellerId: string;
  onBack: () => void;
}

export const SellerProfileDetail: React.FC<SellerProfileDetailProps> = ({ sellerId, onBack }) => {
  const { sellers, auctions, toggleSellerAutonomy, updateSellerCommission, addToast } = useAdminStore();
  const seller = sellers.find((s) => s.id === sellerId);

  const [activeTab, setActiveTab] = useState<'listings' | 'sales' | 'moderation' | 'ratings'>('listings');
  const [sliderCommission, setSliderCommission] = useState<number>(seller?.commissionRate || 0.08);

  if (!seller) {
    return (
      <div className="spark-card p-12 text-center text-[#6C7E75]">
        Merchant not found.
        <button onClick={onBack} className="btn-spark-primary text-xs mt-4">
          Return to Merchants
        </button>
      </div>
    );
  }

  // Filter listings and sales for this seller
  const sellerLiveAuctions = auctions.filter((a) => a.sellerId === seller.id && a.status === 'live');
  const sellerCompletedAuctions = auctions.filter(
    (a) => a.sellerId === seller.id && (a.status === 'completed' || a.codStatus)
  );
  const sellerModerationAuctions = auctions.filter(
    (a) => a.sellerId === seller.id && a.status === 'moderation_pending'
  );

  const handleCommissionChange = (val: number) => {
    setSliderCommission(val);
    updateSellerCommission(seller.id, val);
  };

  // 1,000 IQD Platform Rule:
  // All listings start strictly at 1,000 IQD. That first 1,000 IQD is retained by ZEEDO as the platform listing fee.
  // The seller payout is calculated on the remaining balance (Winning Bid - 1,000 IQD).
  const totalListingsCount = seller.totalListings || seller.completedSales || 1;
  const platformRetainedListingBaseIqd = totalListingsCount * 1000;
  const sellerGrossAboveBase = Math.max(0, seller.totalCodVolumeIqd - platformRetainedListingBaseIqd);
  const platformCommissionEarned = sellerGrossAboveBase * seller.commissionRate;
  const totalPlatformRevenue = platformCommissionEarned + platformRetainedListingBaseIqd;
  const netMerchantPayout = sellerGrossAboveBase * (1 - seller.commissionRate);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="btn-spark-light text-xs py-2 px-4 flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Merchants Directory</span>
        </button>

        <span className="text-xs font-mono text-[#6C7E75]">
          Merchant ID: <strong className="text-[#0B130F]">{seller.id}</strong>
        </span>
      </div>

      {/* Seller Header Identity Card */}
      <div className="spark-card space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E9EFEF]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-black text-2xl shadow-xl">
              {seller.storeName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-[#0B130F]">{seller.storeName}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#15803d]">
                  Official Merchant
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#F4F6F5] text-[#6C7E75]">
                  {seller.city}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#6C7E75] mt-1 font-medium">
                <span>Owner: <strong className="text-[#0B130F]">{seller.ownerName}</strong></span>
                <span>•</span>
                <span className="font-mono text-[#0B130F]">{seller.phone}</span>
                <span>•</span>
                <span>Member since {new Date(seller.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Autonomy Switch Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSellerAutonomy(seller.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-black flex items-center gap-2 shadow-xs transition-all ${
                seller.auto_approve_listings
                  ? 'bg-[#B4F105] text-[#051C12] hover:bg-[#c1f824]'
                  : 'bg-[#FFEDD5] text-[#F97316] hover:bg-[#fed7aa]'
              }`}
            >
              {seller.auto_approve_listings ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#051C12]" />
                  <span>AUTONOMOUS (AUTO-APPROVE ON)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-[#F97316]" />
                  <span>MODERATION REQUIRED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Financial & Commission KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
              Lifetime COD Gross Sales
            </span>
            <span className="font-mono text-xl font-black text-[#0B130F] block">
              {(seller.totalCodVolumeIqd / 1000000).toFixed(2)}M IQD
            </span>
            <span className="text-[11px] text-[#15803d] font-bold block">
              {seller.completedSales} parcels delivered & collected
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#22C55E]/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#15803d] block">
              Net Merchant Payout
            </span>
            <span className="font-mono text-xl font-black text-[#15803d] block">
              {(netMerchantPayout / 1000000).toFixed(2)}M IQD
            </span>
            <span className="text-[11px] text-[#6C7E75] block">
              Disbursed via Hawala / Zain Cash
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0F2FE]/60 border border-[#0284c7]/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#0284c7] block">
                Platform 1,000 IQD Base
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0284c7] text-white font-mono font-bold">
                ZEEDO FEE
              </span>
            </div>
            <span className="font-mono text-xl font-black text-[#0284c7] block">
              {platformRetainedListingBaseIqd.toLocaleString()} IQD
            </span>
            <span className="text-[11px] text-[#6C7E75] block">
              {totalListingsCount} listings &times; 1,000 IQD base retained
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
              Total ZEEDO Revenue
            </span>
            <span className="font-mono text-xl font-black text-[#072F1F] block">
              {(totalPlatformRevenue / 1000000).toFixed(2)}M IQD
            </span>
            <span className="text-[11px] text-[#6C7E75] block">
              {(seller.commissionRate * 100).toFixed(0)}% Fee + 1k IQD Base
            </span>
          </div>
        </div>

        {/* Commission Adjuster & Warehouse Dispatch Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Commission Adjuster Slider with Presets */}
          <div className="p-4 rounded-2xl bg-[#F4F6F5] border border-[#E9EFEF] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B130F] flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-[#072F1F]" />
                <span>Custom Seller Commission Rate</span>
              </span>
              <span className="font-mono font-black text-sm text-[#15803d]">
                {(sliderCommission * 100).toFixed(0)}% Fee
              </span>
            </div>

            <p className="text-[11px] text-[#6C7E75]">
              Every auction starts at 1,000 IQD (retained by ZEEDO). This percentage applies to winning bid proceeds above the initial 1,000 IQD base.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min={0.03}
                max={0.2}
                step={0.01}
                value={sliderCommission}
                onChange={(e) => handleCommissionChange(Number(e.target.value))}
                className="flex-1 accent-[#072F1F]"
              />
              <span className="text-xs font-mono font-bold text-[#072F1F]">
                {(sliderCommission * 100).toFixed(0)}%
              </span>
            </div>

            {/* Quick Commission Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] uppercase font-bold text-[#6C7E75]">Presets:</span>
              {[
                { label: 'VIP (5%)', val: 0.05 },
                { label: 'High Vol (6%)', val: 0.06 },
                { label: 'Standard (8%)', val: 0.08 },
                { label: 'Retail (10%)', val: 0.10 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleCommissionChange(p.val)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold transition-all ${
                    Math.abs(sliderCommission - p.val) < 0.005
                      ? 'bg-[#072F1F] text-[#B4F105] shadow-xs'
                      : 'bg-white border border-[#E9EFEF] text-[#6C7E75] hover:text-[#0B130F]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Warehouse Pickup Dispatch Info */}
          <div className="p-4 rounded-2xl bg-[#F4F6F5] border border-[#E9EFEF] space-y-2 text-xs">
            <span className="font-bold text-[#0B130F] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#072F1F]" />
              <span>Courier Pickup Warehouse</span>
            </span>
            <p className="text-[#0B130F] font-semibold text-[11px]">
              {seller.pickupAddress}
            </p>
            <div className="flex items-center justify-between text-[11px] text-[#6C7E75] font-mono pt-1">
              <span>GPS: {seller.pickupCoordinates.lat.toFixed(4)}, {seller.pickupCoordinates.lng.toFixed(4)}</span>
              <span className="text-[#15803d] font-bold">Standard 3PL Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Seller's Catalog & History */}
      <div className="spark-card !p-4 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-[#072F1F] text-white shadow-xs'
              : 'text-[#6C7E75] hover:text-[#0B130F]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Live Auctions ({sellerLiveAuctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'sales'
              ? 'bg-[#072F1F] text-white shadow-xs'
              : 'text-[#6C7E75] hover:text-[#0B130F]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Delivered COD Sales ({sellerCompletedAuctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-[#072F1F] text-white shadow-xs'
              : 'text-[#6C7E75] hover:text-[#0B130F]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>In Moderation ({sellerModerationAuctions.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Live Auctions */}
      {activeTab === 'listings' && (
        <div className="spark-card space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B130F]">
            Currently Live Auction Rooms
          </h3>

          <div className="space-y-3">
            {sellerLiveAuctions.map((auc) => (
              <div
                key={auc.id}
                className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#072F1F]">{auc.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#15803d]">
                      LIVE
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B130F] mt-1">{auc.multilingual.en.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-[#6C7E75] mt-1 font-mono">
                    <span>Current Bid: <strong className="text-[#15803d]">{auc.currentBidIqd.toLocaleString()} IQD</strong></span>
                    <span>•</span>
                    <span>Total Bids: {auc.totalBids}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
                    Starting Price Rule
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#0B130F]">
                    1,000 IQD (Strict)
                  </span>
                </div>
              </div>
            ))}

            {sellerLiveAuctions.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl">
                No active live auctions currently running for this merchant.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Completed COD Sales */}
      {activeTab === 'sales' && (
        <div className="spark-card space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B130F]">
            Completed Cash on Delivery Orders
          </h3>

          <div className="space-y-3">
            {sellerCompletedAuctions.map((auc) => (
              <div
                key={auc.id}
                className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#072F1F]">{auc.packageAwbId || auc.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#15803d]">
                      COD Collected
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B130F] mt-1">{auc.multilingual.en.title}</h4>
                  <div className="text-[#6C7E75] mt-0.5">
                    Buyer: <strong className="text-[#0B130F]">{auc.highestBidder?.name}</strong> ({auc.highestBidder?.phone}) • {auc.highestBidder?.rooftopPin?.city}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase font-bold text-[#6C7E75] block">
                    Cash Collected
                  </span>
                  <span className="font-black text-sm text-[#15803d]">
                    {auc.currentBidIqd.toLocaleString()} IQD
                  </span>
                </div>
              </div>
            ))}

            {sellerCompletedAuctions.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl">
                No completed sales recorded for this merchant yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="spark-card space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B130F]">
            Listings in Moderation Queue
          </h3>

          <div className="space-y-3">
            {sellerModerationAuctions.map((auc) => (
              <div
                key={auc.id}
                className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#F97316]">{auc.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FFEDD5] text-[#F97316]">
                      Awaiting Admin Approval
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B130F] mt-1">{auc.multilingual.en.title}</h4>
                  <div className="text-[#6C7E75] mt-0.5">
                    Scraped Retail Baseline: {auc.estimatedRetailMarketPriceIqd.toLocaleString()} IQD
                  </div>
                </div>
              </div>
            ))}

            {sellerModerationAuctions.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl">
                No listings from this merchant are currently in the moderation queue.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
