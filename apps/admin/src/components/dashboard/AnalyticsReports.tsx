'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import {
  TrendingUp,
  Download,
  Calendar,
  Coins,
  MapPin,
  Truck,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const { auctions, addToast } = useAdminStore();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const trendsData = {
    '7d': [
      { label: 'Mon', codMillion: 12.4, commissionMillion: 0.99 },
      { label: 'Tue', codMillion: 15.2, commissionMillion: 1.21 },
      { label: 'Wed', codMillion: 18.7, commissionMillion: 1.49 },
      { label: 'Thu', codMillion: 14.1, commissionMillion: 1.12 },
      { label: 'Fri', codMillion: 24.8, commissionMillion: 1.98 },
      { label: 'Sat', codMillion: 28.5, commissionMillion: 2.28 },
      { label: 'Sun', codMillion: 22.1, commissionMillion: 1.76 },
    ],
    '30d': [
      { label: 'Wk 1', codMillion: 84.5, commissionMillion: 6.76 },
      { label: 'Wk 2', codMillion: 112.3, commissionMillion: 8.98 },
      { label: 'Wk 3', codMillion: 145.8, commissionMillion: 11.66 },
      { label: 'Wk 4', codMillion: 168.2, commissionMillion: 13.45 },
    ],
    '90d': [
      { label: 'Month 1', codMillion: 320.5, commissionMillion: 25.64 },
      { label: 'Month 2', codMillion: 410.2, commissionMillion: 32.81 },
      { label: 'Month 3', codMillion: 510.8, commissionMillion: 40.86 },
    ],
  };

  const regionalDistribution = [
    { city: 'Erbil', share: 38, codVolumeM: 64.2, bidders: 1840, color: 'bg-blue-600' },
    { city: 'Baghdad', share: 31, codVolumeM: 52.1, bidders: 2150, color: 'bg-indigo-600' },
    { city: 'Sulaymaniyah', share: 16, codVolumeM: 26.9, bidders: 940, color: 'bg-emerald-600' },
    { city: 'Basra', share: 10, codVolumeM: 16.8, bidders: 680, color: 'bg-amber-600' },
    { city: 'Duhok', share: 5, codVolumeM: 8.4, bidders: 410, color: 'bg-purple-600' },
  ];

  const currentTrends = trendsData[timeframe];
  const maxVolume = Math.max(...currentTrends.map((t) => t.codMillion));

  const handleExportReport = () => {
    addToast('success', `Exported Settlement Report (${timeframe.toUpperCase()})`);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Financial Reports & Platform Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Cash on Delivery volume, governorate share, and delivery metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg font-bold uppercase transition-colors ${
                  timeframe === t
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="text-xs py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Revenue & COD Volume Trends Chart on Left, Regional Distribution on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Volume & Revenue Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Volume Trends
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {currentTrends[currentTrends.length - 1].codMillion.toFixed(1)}M IQD
                </span>
                <span className="text-xs text-emerald-700 font-bold font-mono">
                  +{(currentTrends[currentTrends.length - 1].commissionMillion).toFixed(2)}M Platform Commission
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Gross Volume</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Commission</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-2 pt-2">
            <div className="h-60 flex items-end justify-between gap-3 px-2 pt-6">
              {currentTrends.map((item, idx) => {
                const heightPercent = Math.round((item.codMillion / maxVolume) * 100);
                const commHeightPercent = Math.round((item.commissionMillion / (maxVolume * 0.15)) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded-xl text-center font-mono pointer-events-none shadow-xl mb-1 w-28">
                      <div className="text-emerald-400 font-bold">{item.codMillion}M IQD</div>
                      <div className="text-slate-300">Comm: {item.commissionMillion}M</div>
                    </div>

                    {/* Bars Container */}
                    <div className="w-full max-w-[42px] flex items-end gap-1.5 h-full justify-center">
                      <div
                        className="w-full bg-blue-600 rounded-t-xl transition-all duration-500 group-hover:bg-blue-700"
                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                      ></div>
                      <div
                        className="w-2.5 bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-600"
                        style={{ height: `${Math.max(8, commHeightPercent)}%` }}
                      ></div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 mt-1 font-mono">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary Indicators */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                Avg. Winning Auction Bid
              </span>
              <span className="font-mono text-slate-900 font-extrabold text-sm mt-0.5 block">
                214,000 IQD
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                Avg. Bids Per Auction
              </span>
              <span className="font-mono text-emerald-700 font-extrabold text-sm mt-0.5 block">
                48.6 Bids
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                60s Soft Close Triggers
              </span>
              <span className="font-mono text-amber-700 font-extrabold text-sm mt-0.5 block">
                68.2% of Rooms
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Regional City Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Governorate Share
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                5 Major Hubs
              </span>
            </div>

            <div className="space-y-4 mt-4">
              {regionalDistribution.map((reg) => (
                <div key={reg.city} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{reg.city}</span>
                    </span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {reg.share}%{' '}
                      <span className="text-slate-400 font-normal text-[11px]">
                        ({reg.codVolumeM.toFixed(1)}M IQD)
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${reg.color} transition-all duration-500`}
                      style={{ width: `${reg.share}%` }}
                    ></div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{reg.bidders.toLocaleString()} verified bidders</span>
                    <span>Active Hub</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Delivery Performance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Courier Delivery Success Rate</span>
              </span>
              <span className="font-mono text-emerald-700">94.2%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: '94.2%' }}></div>
              <div className="h-full bg-rose-500" style={{ width: '5.8%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-700 font-bold">94.2% Delivered</span>
              <span className="text-rose-600 font-bold">5.8% Refusal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
