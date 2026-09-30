'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { ApiStatusModal } from '@/components/settings/ApiStatusModal';
import {
  ShieldAlert,
  Radio,
  Truck,
  Search,
  Bell,
  Cpu,
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    antiSnipingAlert,
    clearAntiSnipingAlert,
    auctions,
    currentUser,
    addToast,
  } = useAdminStore();

  const [showApiModal, setShowApiModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [marketRate, setMarketRate] = useState(1510);
  const [newRateInput, setNewRateInput] = useState('1510');
  const [updatingRate, setUpdatingRate] = useState(false);

  React.useEffect(() => {
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.marketRate) {
          setMarketRate(json.data.marketRate);
          setNewRateInput(String(json.data.marketRate));
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(newRateInput);
    if (!rateNum || rateNum < 1000 || rateNum > 2500) {
      addToast('error', 'Rate must be between 1,000 and 2,500 IQD');
      return;
    }
    setUpdatingRate(true);
    try {
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: rateNum }),
      });
      const data = await res.json();
      if (data.success) {
        setMarketRate(rateNum);
        setShowRateModal(false);
        addToast('success', `Iraqi parallel rate updated to $1 = ${rateNum.toLocaleString()} IQD`);
      } else {
        addToast('error', data.message || 'Failed to update rate');
      }
    } catch {
      addToast('error', 'Network error updating rate');
    } finally {
      setUpdatingRate(false);
    }
  };


  return (
    <header className="sticky top-0 z-30 flex flex-col bg-[#F4F6F5]/90 backdrop-blur-md border-b border-[#E9EFEF] no-print">
      {/* Top Banner: Anti-Sniping Alert Flash */}
      {antiSnipingAlert && (
        <div className="bg-[#072F1F] text-white px-5 py-2.5 flex items-center justify-between shadow-lg border-b border-[#B4F105]/30 animate-pulse">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#B4F105] animate-bounce" />
            <span>
              <strong className="text-[#B4F105]">60-SECOND ANTI-SNIPING TRIGGERED:</strong> Bid placed on &ldquo;{antiSnipingAlert.itemTitle}&rdquo; at {antiSnipingAlert.timestamp}. Timer hard-reset to 60s!
            </span>
          </div>
          <button
            onClick={clearAntiSnipingAlert}
            className="text-[11px] bg-white/10 hover:bg-white/20 text-[#B4F105] px-3 py-1 rounded-full font-mono transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header / Navbar Bar */}
      <div className="flex items-center justify-between px-8 py-4 gap-4">
        {/* Page Title & Breadcrumb */}
        <div>
          <h1 className="text-xl font-extrabold text-[#0B130F] tracking-tight flex items-center gap-3">
            {title}
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#15803d]">
              100% COD ECOSYSTEM
            </span>
          </h1>
          {subtitle && <p className="text-xs text-[#6C7E75] mt-0.5 font-medium">{subtitle}</p>}
        </div>

        {/* Center Search Pill (Spark Admin Style) */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 text-[#6C7E75]" />
          <input
            type="text"
            placeholder="Search auctions, users, AWB..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#E9EFEF] text-xs text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F] shadow-xs"
          />
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono px-3.5 py-1.5 rounded-full bg-white border border-[#E9EFEF] text-[#0B130F] shadow-xs">
            <div className="flex items-center gap-1.5 text-[#15803d]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              <span className="font-semibold">Fast2SMS: Live</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-[#072F1F]">
              <Radio className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Low-Data (12-25B)</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-[#d97706]">
              <Truck className="w-3.5 h-3.5" />
              <span>3PL Only</span>
            </div>
          </div>

          {/* Live Iraqi Parallel Exchange Rate Widget */}
          <button
            onClick={() => setShowRateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#E9EFEF] text-xs font-mono font-bold text-[#072F1F] shadow-xs transition-all hover:border-emerald-300"
            title="Iraqi Street Parallel Exchange Rate (Click to override)"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>$1 = {marketRate.toLocaleString()} IQD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* API Services Button */}
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#E9EFEF] text-xs font-bold text-[#072F1F] shadow-xs transition-all hover:border-indigo-300"
            title="View Google Gemini & Meta WhatsApp API Status"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI APIs</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {currentUser && (
            <div className="flex items-center gap-2 pl-3 border-l border-[#E9EFEF]">
              <div className="w-7 h-7 rounded-full bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-extrabold text-[#0B130F] leading-tight truncate max-w-[130px]">{currentUser.name}</div>
                <div className="text-[10px] text-[#6C7E75] font-mono capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApiStatusModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />

      {/* Exchange Rate Override Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#E9EFEF] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9EFEF]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B130F]">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Iraqi Parallel Market Rate</span>
              </div>
              <button
                onClick={() => setShowRateModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6C7E75]">
              Real-time street cash conversion rate applied to all scraped USD e-commerce product links into Iraqi Dinars (IQD).
            </p>

            <form onSubmit={handleUpdateRate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#0B130F] block mb-1">
                  Parallel Cash Exchange Rate (IQD per $1 USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">$1 =</span>
                  <input
                    type="number"
                    min="1000"
                    max="2500"
                    value={newRateInput}
                    onChange={(e) => setNewRateInput(e.target.value)}
                    className="w-full pl-12 pr-12 py-2 rounded-xl border border-[#E9EFEF] bg-[#F8FAF9] text-sm font-mono font-bold text-[#0B130F]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-emerald-600">IQD</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-[#6C7E75] space-y-1">
                <div className="flex justify-between">
                  <span>Official CBI Forex Peg:</span>
                  <span className="font-mono font-bold">1,320 IQD</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Parallel Spread:</span>
                  <span className="font-mono font-bold text-amber-600">+{Number(newRateInput) - 1320} IQD</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C7E75] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRate}
                  className="px-4 py-2 rounded-xl bg-[#072F1F] hover:bg-[#0c4a32] text-white text-xs font-bold disabled:opacity-50"
                >
                  {updatingRate ? 'Saving...' : 'Apply Live Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
