'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { ApiStatusModal } from '@/components/settings/ApiStatusModal';
import {
  ShieldAlert,
  Radio,
  Truck,
  Search,
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
    <header className="sticky top-0 z-30 flex flex-col bg-white/90 backdrop-blur-md border-b border-slate-200/80 no-print">
      {/* Top Banner: Anti-Sniping Alert Flash */}
      {antiSnipingAlert && (
        <div className="bg-amber-500 text-white px-5 py-2.5 flex items-center justify-between shadow-md border-b border-amber-600 animate-pulse">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-white animate-bounce shrink-0" />
            <span>
              <strong>60-SECOND ANTI-SNIPING TRIGGERED:</strong> Bid placed on &ldquo;{antiSnipingAlert.itemTitle}&rdquo; at {antiSnipingAlert.timestamp}. Timer extended to 60s soft close!
            </span>
          </div>
          <button
            onClick={clearAntiSnipingAlert}
            className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full font-mono transition-colors font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header / Navbar Bar */}
      <div className="flex items-center justify-between px-6 lg:px-8 py-3.5 gap-4">
        {/* Page Title & Breadcrumb */}
        <div>
          <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            {title}
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              100% COD
            </span>
          </h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center relative w-64 lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search auctions, users, AWB..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 shadow-2xs transition-colors"
          />
        </div>

        {/* System Health Indicators & Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Socket & 3PL Status Pill */}
          <div className="hidden xl:flex items-center gap-2.5 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Fast2SMS</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>Low-Data</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Truck className="w-3.5 h-3.5" />
              <span>3PL COD</span>
            </div>
          </div>

          {/* Live Iraqi Parallel Exchange Rate Widget */}
          <button
            onClick={() => setShowRateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-mono font-bold text-slate-800 shadow-2xs transition-all hover:border-emerald-300"
            title="Iraqi Parallel Street Exchange Rate (Click to override)"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>$1 = {marketRate.toLocaleString()} IQD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* AI APIs Button */}
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-blue-300"
            title="View Google Gemini & Meta WhatsApp API Status"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">AI APIs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* Staff User Avatar Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono capitalize">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApiStatusModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />

      {/* Exchange Rate Override Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
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

            <p className="text-xs text-slate-500">
              Real-time street cash conversion rate applied to all scraped USD e-commerce product links into Iraqi Dinars (IQD).
            </p>

            <form onSubmit={handleUpdateRate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
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
                    className="w-full pl-12 pr-12 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-emerald-600">IQD</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRate}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
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
