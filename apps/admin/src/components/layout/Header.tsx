'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { ApiStatusModal } from '@/components/settings/ApiStatusModal';
import {
  ShieldAlert,
  Search,
  Cpu,
  DollarSign,
  TrendingUp,
  Activity,
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
  } = useAdminStore();

  const [showApiModal, setShowApiModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1510);

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.marketRate) {
          setExchangeRate(data.data.marketRate);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/80 no-print">
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
      <div className="flex items-center justify-between px-8 py-3.5 gap-4">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            {title}
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              COD ECOSYSTEM
            </span>
          </h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
        </div>

        {/* Center Search Pill */}
        <div className="hidden md:flex items-center relative w-72 lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings, users, shipments..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-800 shadow-2xs transition-all"
          />
        </div>

        {/* Right-Side Command Center Indicators */}
        <div className="flex items-center gap-3">
          {/* Live Parallel Market Exchange Rate */}
          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs font-mono"
            title="Current Parallel Cash Market Rate (Baghdad Kifah & Erbil Index)"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900">$1 = {exchangeRate.toLocaleString()} IQD</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-sans font-medium">Market Rate</span>
          </div>

          {/* AI & Services Health */}
          <button
            onClick={() => setShowApiModal(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-slate-300 active:scale-95"
            title="Platform Services: Gemini AI, WhatsApp, OCR"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI & API Services</span>
          </button>

          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-extrabold text-slate-900 leading-tight truncate max-w-[130px]">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApiStatusModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />
    </header>
  );
};

