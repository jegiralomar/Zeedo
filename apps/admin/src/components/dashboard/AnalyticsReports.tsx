'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import {
  TrendingUp,
  Coins,
  MapPin,
  Flame,
  Truck,
  Download,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const { auctions, sellers, addToast } = useAdminStore();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Simulated chart data points for COD volume trends
  const trendData = {
    '7d': [
      { label: 'Mon', codMillion: 18.4, commissionMillion: 1.47 },
      { label: 'Tue', codMillion: 24.1, commissionMillion: 1.92 },
      { label: 'Wed', codMillion: 29.8, commissionMillion: 2.38 },
      { label: 'Thu', codMillion: 35.2, commissionMillion: 2.81 },
      { label: 'Fri', codMillion: 42.6, commissionMillion: 3.40 },
      { label: 'Sat', codMillion: 48.0, commissionMillion: 3.84 },
      { label: 'Sun', codMillion: 53.5, commissionMillion: 4.28 },
    ],
    '30d': [
      { label: 'Week 1', codMillion: 82.5, commissionMillion: 6.6 },
      { label: 'Week 2', codMillion: 114.2, commissionMillion: 9.1 },
      { label: 'Week 3', codMillion: 142.8, commissionMillion: 11.4 },
      { label: 'Week 4', codMillion: 175.4, commissionMillion: 14.0 },
    ],
    '90d': [
      { label: 'July', codMillion: 280.0, commissionMillion: 22.4 },
      { label: 'August', codMillion: 345.0, commissionMillion: 27.6 },
      { label: 'September', codMillion: 414.9, commissionMillion: 33.1 },
    ],
  };

  const currentTrends = trendData[timeframe];
  const maxVolume = Math.max(...currentTrends.map((d) => d.codMillion));

  // Regional breakdown
  const regionalDistribution = [
    { city: 'Baghdad', share: 38, codVolumeM: 157.6, bidders: 5390, color: 'bg-[#072F1F]' },
    { city: 'Erbil', share: 32, codVolumeM: 132.8, bidders: 4540, color: 'bg-[#B4F105]' },
    { city: 'Sulaymaniyah', share: 18, codVolumeM: 74.7, bidders: 2550, color: 'bg-[#22C55E]' },
    { city: 'Duhok', share: 8, codVolumeM: 33.2, bidders: 1130, color: 'bg-[#38bdf8]' },
    { city: 'Basra', share: 4, codVolumeM: 16.6, bidders: 590, color: 'bg-[#f59e0b]' },
  ];

  const handleExportReport = () => {
    addToast('success', `Exported ZEEDO COD Analytics & Settlement Report (${timeframe.toUpperCase()})`);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header Bar */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              Platform Financial Reports & Moderation Analytics
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
                100% COD Audited
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Real-time Cash on Delivery volume, governorate share, and courier delivery success metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF] text-xs">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-full font-bold uppercase transition-colors ${
                  timeframe === t
                    ? 'bg-[#072F1F] text-white shadow-xs'
                    : 'text-[#6C7E75] hover:text-[#0B130F]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="btn-spark-light text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Revenue & COD Volume Trends Chart on Left, Regional Distribution on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Volume & Revenue Chart */}
        <div className="lg:col-span-8 spark-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Cash on Delivery Volume Trends
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#0B130F]">
                  {currentTrends[currentTrends.length - 1].codMillion.toFixed(1)}M IQD
                </span>
                <span className="text-xs text-[#15803d] font-bold font-mono">
                  +{(currentTrends[currentTrends.length - 1].commissionMillion).toFixed(2)}M Platform Commission
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#072F1F] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#072F1F]"></span>
                <span>Gross COD Volume</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#15803d] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B4F105] border border-[#072F1F]"></span>
                <span>Commission Proceeds</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#0284c7] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                <span>1,000 IQD Base Retained</span>
              </span>
            </div>
          </div>

          {/* 1,000 IQD Platform Fee Banner */}
          <div className="p-3 rounded-2xl bg-[#E0F2FE]/60 border border-[#0284c7]/30 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#0284c7] font-bold shrink-0">
              <Coins className="w-4 h-4" />
              <span>Universal 1,000 IQD Platform Base:</span>
            </div>
            <p className="text-[11px] text-[#0B130F] leading-relaxed">
              Every auction starts at 1,000 IQD. That initial 1,000 IQD is retained by ZEEDO as the platform insertion fee, with seller payouts calculated on the hammer price above the base.
            </p>
          </div>

          {/* Bar Chart Visualization (Pure CSS/SVG Spark Style) */}
          <div className="space-y-2 pt-2">
            <div className="h-60 flex items-end justify-between gap-3 px-2 pt-6">
              {currentTrends.map((item, idx) => {
                const heightPercent = Math.round((item.codMillion / maxVolume) * 100);
                const commHeightPercent = Math.round((item.commissionMillion / (maxVolume * 0.15)) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#072F1F] text-white text-[10px] p-2 rounded-xl text-center font-mono pointer-events-none shadow-xl mb-1 w-28">
                      <div className="text-[#B4F105] font-bold">{item.codMillion}M IQD</div>
                      <div className="text-slate-300">Comm: {item.commissionMillion}M</div>
                    </div>

                    {/* Bars Container */}
                    <div className="w-full max-w-[42px] flex items-end gap-1.5 h-full justify-center">
                      {/* COD Volume Bar */}
                      <div
                        className="w-full bg-[#072F1F] rounded-t-xl transition-all duration-500 group-hover:bg-[#051C12]"
                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                      ></div>
                      {/* Commission Bar */}
                      <div
                        className="w-2.5 bg-[#B4F105] rounded-t-lg transition-all duration-500 group-hover:bg-[#c1f824]"
                        style={{ height: `${Math.max(8, commHeightPercent)}%` }}
                      ></div>
                    </div>

                    {/* X-Axis Label */}
                    <span className="text-[11px] font-bold text-[#6C7E75] group-hover:text-[#0B130F] mt-1 font-mono">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary Indicators */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E9EFEF] text-xs">
            <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF]">
              <span className="text-[#6C7E75] text-[10px] uppercase font-bold block">
                Avg. Winning Auction Bid
              </span>
              <span className="font-mono text-[#0B130F] font-extrabold text-sm mt-0.5 block">
                214,000 IQD
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF]">
              <span className="text-[#6C7E75] text-[10px] uppercase font-bold block">
                Avg. Bids Per Auction
              </span>
              <span className="font-mono text-[#15803d] font-extrabold text-sm mt-0.5 block">
                48.6 Bids
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF]">
              <span className="text-[#6C7E75] text-[10px] uppercase font-bold block">
                60s Soft Close Triggers
              </span>
              <span className="font-mono text-[#F97316] font-extrabold text-sm mt-0.5 block">
                68.2% of Rooms
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Regional Iraqi City Distribution */}
        <div className="lg:col-span-4 spark-card space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Governorate COD Share
              </span>
              <span className="text-[11px] font-mono text-[#15803d] font-bold">
                5 Major Hubs
              </span>
            </div>

            <div className="space-y-4 mt-4">
              {regionalDistribution.map((reg) => (
                <div key={reg.city} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B130F] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#072F1F]" />
                      <span>{reg.city}</span>
                    </span>
                    <span className="font-mono font-extrabold text-[#0B130F]">
                      {reg.share}%{' '}
                      <span className="text-[#6C7E75] font-normal text-[11px]">
                        ({reg.codVolumeM.toFixed(1)}M IQD)
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-[#E9EFEF] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${reg.color} transition-all duration-500`}
                      style={{ width: `${reg.share}%` }}
                    ></div>
                  </div>

                  <div className="text-[10px] text-[#6C7E75] font-mono flex items-center justify-between">
                    <span>{reg.bidders.toLocaleString()} verified bidders</span>
                    <span>100% Doorstep COD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Delivery Performance */}
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#0B130F] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#072F1F]" />
                <span>3PL Courier COD Success Rate</span>
              </span>
              <span className="font-mono text-[#15803d]">94.2%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#FEE2E2] overflow-hidden flex">
              <div className="h-full bg-[#22C55E]" style={{ width: '94.2%' }}></div>
              <div className="h-full bg-[#EF4444]" style={{ width: '5.8%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6C7E75]">
              <span className="text-[#15803d] font-bold">94.2% Cash Collected</span>
              <span className="text-[#EF4444] font-bold">5.8% Doorstep Refusal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
