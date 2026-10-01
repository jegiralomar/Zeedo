'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAdminStore } from '@/store/useAdminStore';
import {
  Coins,
  TrendingUp,
  Store,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export default function FinancePage() {
  const { sellers, auctions, addToast } = useAdminStore();
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate Core Financial Metrics
  const POSTING_FEE_IQD = 1000;
  const totalLots = auctions.length + sellers.reduce((acc, s) => acc + (s.totalListings || 0), 0);
  const totalPostingFeesIqd = totalLots * POSTING_FEE_IQD;

  const completedAuctions = auctions.filter((a) => a.status === 'completed');
  const completedGmvIqd =
    completedAuctions.reduce((acc, a) => acc + a.currentBidIqd, 0) +
    sellers.reduce((acc, s) => acc + s.totalCodVolumeIqd, 0);

  // Platform standard 5% commission on winning bids
  const totalCommissionsEarnedIqd = Math.round(completedGmvIqd * 0.05);
  const netPlatformRevenueIqd = totalPostingFeesIqd + totalCommissionsEarnedIqd;

  // Filtered merchants
  const filteredMerchants = sellers.filter((m) => {
    const matchesSearch =
      m.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    if (filterTab === 'pending') {
      return matchesSearch && m.completedSales > 0;
    }
    if (filterTab === 'settled') {
      return matchesSearch && m.completedSales === 0;
    }
    return matchesSearch;
  });

  return (
    <>
      <Header
        title="Commissions & Platform Fees"
        subtitle="1,000 IQD Posting Fees & Auction Commission Revenue"
      />

      <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Business Model Notice Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#17223B] to-[#243354] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F83758] flex items-center justify-center font-bold text-white shrink-0 shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">Zero-Fleet Marketplace Architecture</div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                ZEEDO does not operate delivery vans or collect cash at doorsteps. <strong>Merchants handle 100% of physical logistics and COD collection directly.</strong> ZEEDO strictly collects the fixed 1,000 IQD posting fee per lot and the auction commission on winning bids.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              Posting Fee: 1,000 IQD
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#F83758]/30 text-[#F83758] border border-[#F83758]/40 font-bold">
              Base Cut: 5.0%
            </span>
          </div>
        </div>

        {/* Top Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Platform Revenue */}
          <div className="bg-gradient-to-br from-[#F83758] to-[#E02647] rounded-2xl p-5 text-white shadow-md shadow-rose-500/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-rose-100">
                <span>Net Platform Revenue</span>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-black font-mono mt-2 tracking-tight">
                {(netPlatformRevenueIqd / 1000).toLocaleString()}K <span className="text-xs font-sans font-bold text-rose-200">IQD</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/15 text-[11px] text-rose-100 font-medium">
              Posting Fees + Auction Cuts
            </div>
          </div>

          {/* Card 2: Retained Posting Fees */}
          <div className="bg-white rounded-2xl border border-[#ECEFF3] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Posting Fees Collected</span>
                <Coins className="w-4 h-4 text-[#F8991D]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17223B] mt-2 tracking-tight">
                {(totalPostingFeesIqd / 1000).toLocaleString()}K <span className="text-xs font-sans font-bold text-slate-400">IQD</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>{totalLots} Lots Posted</span>
              <span className="font-mono font-bold text-emerald-600">100% Retained</span>
            </div>
          </div>

          {/* Card 3: Auction Commissions */}
          <div className="bg-white rounded-2xl border border-[#ECEFF3] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Auction Commissions</span>
                <TrendingUp className="w-4 h-4 text-[#4392F9]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17223B] mt-2 tracking-tight">
                {(totalCommissionsEarnedIqd / 1000).toLocaleString()}K <span className="text-xs font-sans font-bold text-slate-400">IQD</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Winning Bid Cut</span>
              <span className="font-mono font-bold text-[#4392F9]">Avg 5.0%</span>
            </div>
          </div>

          {/* Card 4: Merchant GMV Volume */}
          <div className="bg-white rounded-2xl border border-[#ECEFF3] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Merchant COD GMV</span>
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17223B] mt-2 tracking-tight">
                {(completedGmvIqd / 1000000).toFixed(1)}M <span className="text-xs font-sans font-bold text-slate-400">IQD</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Cash collected by sellers</span>
              <span className="font-mono font-bold text-slate-700">{sellers.length} Merchants</span>
            </div>
          </div>

        </div>

        {/* Merchant Commission Ledger */}
        <div className="bg-white rounded-2xl border border-[#ECEFF3] shadow-xs overflow-hidden">
          
          {/* Table Header Controls */}
          <div className="p-5 border-b border-[#ECEFF3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#17223B]">Merchant Commission & Fee Ledger</h2>
              <p className="text-xs text-slate-400">
                Track merchant listing fees, commissions due on won lots, and settlement status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Segmented Filter Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterTab === 'all'
                      ? 'bg-white text-[#17223B] shadow-xs'
                      : 'text-slate-500 hover:text-[#17223B]'
                  }`}
                >
                  All ({sellers.length})
                </button>
                <button
                  onClick={() => setFilterTab('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterTab === 'pending'
                      ? 'bg-white text-[#F83758] shadow-xs'
                      : 'text-slate-500 hover:text-[#17223B]'
                  }`}
                >
                  Pending Fee
                </button>
                <button
                  onClick={() => setFilterTab('settled')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterTab === 'settled'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-[#17223B]'
                  }`}
                >
                  Settled
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter merchant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[#ECEFF3] bg-slate-50 text-xs text-[#17223B] focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Export */}
              <button
                onClick={() => addToast('info', 'Exporting Merchant Ledger CSV...')}
                className="p-1.5 rounded-xl border border-[#ECEFF3] hover:bg-slate-50 text-slate-600 transition-colors"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-[#ECEFF3] text-slate-400 uppercase text-[10px] font-bold font-mono">
                <tr>
                  <th className="py-3 px-4">Merchant & Business</th>
                  <th className="py-3 px-4">City / Province</th>
                  <th className="py-3 px-4 text-center">Lots Posted</th>
                  <th className="py-3 px-4">Posting Fees Paid</th>
                  <th className="py-3 px-4">Total COD GMV</th>
                  <th className="py-3 px-4">Commission Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No merchants match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredMerchants.map((merchant) => {
                    const lots = merchant.totalListings || 4;
                    const postingFees = lots * POSTING_FEE_IQD;
                    const commissionDue = Math.round(merchant.totalCodVolumeIqd * (merchant.commissionRate || 0.05));
                    const isSettled = merchant.status === 'active' && merchant.completedSales > 0;

                    return (
                      <tr key={merchant.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#17223B]">{merchant.storeName}</div>
                          <div className="text-[11px] text-slate-400">{merchant.ownerName} • {merchant.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {merchant.city}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                          {lots}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                          {postingFees.toLocaleString()} IQD
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#17223B]">
                          {merchant.totalCodVolumeIqd.toLocaleString()} IQD
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F83758]">
                          {commissionDue.toLocaleString()} IQD
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSettled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSettled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isSettled ? 'Settled' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => addToast('success', `Marked fee settlement for ${merchant.storeName}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FFF1F3] text-slate-700 hover:text-[#F83758] font-bold text-[11px] transition-colors"
                          >
                            Reconcile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>
    </>
  );
}
