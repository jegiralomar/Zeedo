'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/store/useAdminStore';
import { AnalyticsReports } from './AnalyticsReports';
import {
  Coins,
  Flame,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { users, sellers, auctions, manifests } = useAdminStore();

  const totalCodVolume =
    auctions.reduce((acc, a) => acc + (a.status === 'completed' ? a.currentBidIqd : 0), 0) +
    sellers.reduce((acc, s) => acc + s.totalCodVolumeIqd, 0);

  const liveAuctionsCount = auctions.filter((a) => a.status === 'live').length;
  const pendingKycCount = users.filter((u) => u.kycStatus === 'pending').length;
  const pendingModerationCount = auctions.filter((a) => a.status === 'moderation_pending').length;
  const verifiedPinCount = users.filter((u) => u.rooftopPin && u.kycStatus === 'verified').length;

  const totalListingsCount = auctions.length + sellers.reduce((acc, s) => acc + (s.totalListings || 0), 0);
  const totalPlatformRetainedIqd = totalListingsCount * 1000;

  return (
    <div className="space-y-8">
      {/* TOP ROW: Spark Admin Signature Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1: Iconic Spark Alert Green Card */}
        <div className="alert-green-card sm:col-span-2 lg:col-span-1">
          <div className="relative z-10 space-y-2">
            <span className="alert-green-badge">Live Metric Update</span>
            <div className="text-xs text-[#879A91] font-mono">Iraq 100% Cash-on-Delivery</div>
            <div className="text-base font-bold text-white leading-snug">
              Total COD Surpassed {(totalCodVolume / 1000000).toFixed(1)}M IQD
            </div>
          </div>

          <Link href="/auctions" className="alert-green-link mt-2">
            <span>Live Monitor</span>
            <ArrowRight className="w-4 h-4 text-[#B4F105]" />
          </Link>

          {/* Spark Geometric 6-Pointed Star SVG Accent */}
          <svg
            className="alert-green-bg-shape"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(50,50)">
              <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" />
              <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" transform="rotate(60)" />
              <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" transform="rotate(120)" />
            </g>
          </svg>
        </div>

        {/* Stat Card 2: Live Auction Rooms */}
        <div className="spark-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Active Live Rooms
              </span>
              <div className="p-2 rounded-xl bg-[#DCFCE7] text-[#15803d]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0B130F] mt-2">
              {liveAuctionsCount}{' '}
              <span className="text-xs font-semibold text-[#15803d]">Active Now</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9EFEF] flex items-center justify-between text-xs text-[#6C7E75]">
            <span className="flex items-center gap-1.5 font-mono text-[#072F1F] font-bold text-[11px]">
              <Radio className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Low-Data Sync</span>
            </span>
            <span className="text-[11px] font-mono text-[#6C7E75]">60s Soft-Close</span>
          </div>
        </div>

        {/* Stat Card 3: Pending KYC ID Approvals */}
        <div className="spark-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Pending KYC Moderation
              </span>
              <div className="p-2 rounded-xl bg-[#FFEDD5] text-[#F97316]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0B130F] mt-2">
              {pendingKycCount}{' '}
              <span className="text-xs font-semibold text-[#F97316]">Awaiting Review</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9EFEF] flex items-center justify-between text-xs text-[#6C7E75]">
            <span className="flex items-center gap-1 text-[#0B130F] font-semibold text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Gate 2 Pin</span>
            </span>
            <span className="font-mono text-[#15803d] font-bold text-[11px]">{verifiedPinCount} Verified</span>
          </div>
        </div>

        {/* Stat Card 4: Platform 1,000 IQD Base Revenue Engine */}
        <div className="spark-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Platform Listing Fees
              </span>
              <div className="p-2 rounded-xl bg-[#E0F2FE] text-[#0284c7]">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0B130F] mt-2 font-mono">
              {totalPlatformRetainedIqd.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-[#0284c7]">IQD</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9EFEF] flex items-center justify-between text-xs text-[#6C7E75]">
            <span className="flex items-center gap-1 text-[#072F1F] font-bold text-[11px]">
              <span>{totalListingsCount} Total Listings</span>
            </span>
            <span className="text-[11px] font-mono text-[#0284c7] font-bold">1,000 IQD Base</span>
          </div>
        </div>
      </div>

      {/* NEW: Platform Reports & Analytics Suite */}
      <AnalyticsReports />

      {/* Operational Workflows & Platform Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Workflow Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
              Core Operational Modules
            </span>
            <span className="text-xs text-[#072F1F] font-bold font-mono">
              Admin Console
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              href="/kyc"
              className="spark-card hover:-translate-y-1 transition-transform space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803d] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#879A91] group-hover:text-[#072F1F] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-base text-[#0B130F]">Identity Verification (KYC)</h3>
              <p className="text-xs text-[#6C7E75] leading-relaxed">
                Review Iraqi Civil ID and Passport submissions alongside verified rooftop GPS delivery coordinates.
              </p>
              <div className="text-xs font-bold text-[#15803d] font-mono pt-1">
                {pendingKycCount} submissions awaiting review &rarr;
              </div>
            </Link>

            <Link
              href="/moderation"
              className="spark-card hover:-translate-y-1 transition-transform space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#F97316] flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#879A91] group-hover:text-[#072F1F] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-base text-[#0B130F]">Listing Moderation Studio</h3>
              <p className="text-xs text-[#6C7E75] leading-relaxed">
                Approve merchant listings across Arabic, Kurdish, and English with strict starting price verification.
              </p>
              <div className="text-xs font-bold text-[#F97316] font-mono pt-1">
                {pendingModerationCount} listings in moderation queue &rarr;
              </div>
            </Link>

            <Link
              href="/auctions"
              className="spark-card hover:-translate-y-1 transition-transform space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#879A91] group-hover:text-[#072F1F] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-base text-[#0B130F]">Live Auctions Monitor</h3>
              <p className="text-xs text-[#6C7E75] leading-relaxed">
                Real-time room monitoring, live bid auditing, anti-sniping soft close reset triggers, and moderator controls.
              </p>
              <div className="text-xs font-bold text-[#EF4444] font-mono pt-1">
                {liveAuctionsCount} rooms live right now &rarr;
              </div>
            </Link>

            <Link
              href="/logistics"
              className="spark-card hover:-translate-y-1 transition-transform space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284c7] flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#879A91] group-hover:text-[#072F1F] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-base text-[#0B130F]">Logistics & Print Center</h3>
              <p className="text-xs text-[#6C7E75] leading-relaxed">
                Print 4x6&quot; thermal labels with scannable Google Maps GPS QR codes and assemble batch 3PL courier route manifests.
              </p>
              <div className="text-xs font-bold text-[#0284c7] font-mono pt-1">
                {manifests.length} manifests assembled &rarr;
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Platform Gating Rulebook */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6C7E75] px-1">
            Platform Gating & Rules
          </div>

          <div className="spark-card space-y-4 text-xs">
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#0B130F] block">Strict 1,000 IQD Starting Price</strong>
                  <p className="text-[#6C7E75] text-[11px]">
                    Every single platform auction is programmatically locked to start at exactly 1,000 IQD.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#0B130F] block">Dynamic Tiered Increments</strong>
                  <p className="text-[#6C7E75] text-[11px]">
                    &le;100k: +1,000 IQD | 100k-200k: +2,000 IQD | &gt;200k: +3,000 IQD.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#0B130F] block">60-Second Anti-Sniping Soft Close</strong>
                  <p className="text-[#6C7E75] text-[11px]">
                    Any bid placed in the final &le;60s automatically resets the clock back to exactly 60 seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#0B130F] block">Mandatory Rooftop Map Pin Drop</strong>
                  <p className="text-[#6C7E75] text-[11px]">
                    Bidders cannot bid until dropping their rooftop GPS pin, guaranteeing accurate COD delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#0B130F] block">Admin-Only Seller Provisioning</strong>
                  <p className="text-[#6C7E75] text-[11px]">
                    Public registration disabled. Sellers provisioned with autonomy flag (auto-approve vs moderated).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
