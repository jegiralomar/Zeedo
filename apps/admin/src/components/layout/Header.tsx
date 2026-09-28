'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { ApiStatusModal } from '@/components/settings/ApiStatusModal';
import {
  Zap,
  ShieldAlert,
  FileCheck2,
  PackagePlus,
  RotateCcw,
  Radio,
  Truck,
  Search,
  Bell,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    simulateIncomingBid,
    triggerAntiSniping,
    simulateNewKycSubmission,
    simulateNewSellerListing,
    resetToDefaults,
    antiSnipingAlert,
    clearAntiSnipingAlert,
    auctions,
    currentUser,
  } = useAdminStore();

  const [showApiModal, setShowApiModal] = useState(false);

  const liveAuctions = auctions.filter((a) => a.status === 'live');
  const targetLiveAuction = liveAuctions[0];

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

          {/* API Services Button */}
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#E9EFEF] text-xs font-bold text-[#072F1F] shadow-xs transition-all hover:border-indigo-300"
            title="View Google Gemini & Meta WhatsApp API Status"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI & WhatsApp APIs</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* Spark Simulator Quick Bar */}
      <div className="flex items-center justify-between px-8 py-2.5 bg-[#FFFFFF] border-t border-b border-[#E9EFEF] text-xs overflow-x-auto gap-2">
        <div className="flex items-center gap-2 text-[#072F1F] shrink-0 font-bold">
          <Zap className="w-3.5 h-3.5 text-[#B4F105] fill-[#072F1F]" />
          <span>Interactive Simulator:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => simulateIncomingBid()}
            className="btn-spark-lime text-xs px-3 py-1.5 rounded-full shadow-xs"
            title="Simulates real-time incoming bid with dynamic increment"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Live Bid</span>
          </button>

          <button
            onClick={() => targetLiveAuction && triggerAntiSniping(targetLiveAuction.id)}
            className="btn-spark-primary text-xs px-3 py-1.5 rounded-full shadow-xs"
            title="Triggers 60-second anti-sniping reset timer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#B4F105]" />
            <span>Trigger 60s Soft-Close</span>
          </button>

          <button
            onClick={() => simulateNewKycSubmission()}
            className="btn-spark-light text-xs px-3 py-1.5 rounded-full shadow-xs"
            title="Dispatches a new user ID KYC upload with OCR extraction"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#072F1F]" />
            <span>Simulate KYC Upload</span>
          </button>

          <button
            onClick={() => simulateNewSellerListing(false)}
            className="btn-spark-light text-xs px-3 py-1.5 rounded-full shadow-xs"
            title="Simulates new listing requiring admin moderation"
          >
            <PackagePlus className="w-3.5 h-3.5 text-[#072F1F]" />
            <span>Queue Moderation</span>
          </button>

          <button
            onClick={() => resetToDefaults()}
            className="btn-spark-light text-xs px-2.5 py-1.5 rounded-full shadow-xs"
            title="Reset mock state to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6C7E75]" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      <ApiStatusModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />
    </header>
  );
};
