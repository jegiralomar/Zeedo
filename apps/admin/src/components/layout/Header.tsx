'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/store/useAdminStore';
import {
  ShieldAlert,
  Search,
  Bell,
  Settings,
  Radio,
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

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-white/95 backdrop-blur-md border-b border-[#ECEFF3] no-print">
      {/* Top Banner: Anti-Sniping Alert Flash */}
      {antiSnipingAlert && (
        <div className="bg-[#F83758] text-white px-5 py-2.5 flex items-center justify-between shadow-md border-b border-rose-600 animate-pulse">
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

      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-6 lg:px-8 py-3.5 gap-4">
        {/* Page Title & Breadcrumb */}
        <div>
          <h1 className="text-lg lg:text-xl font-black text-[#17223B] tracking-tight font-['Montserrat']">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center relative w-64 lg:w-88">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search lots, merchants, buyers, ID..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-slate-50 border border-[#ECEFF3] text-xs text-[#17223B] placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#F83758] focus:ring-2 focus:ring-[#F83758]/10 shadow-2xs transition-all"
          />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Live Sync Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </div>

          {/* Quick Settings Link */}
          <Link
            href="/admin/settings"
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-[#ECEFF3] flex items-center justify-center text-slate-500 hover:text-[#17223B] transition-colors"
            title="System & Exchange Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Staff User Avatar Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#ECEFF3]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F83758] to-[#4392F9] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-[#17223B] leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#F83758] font-bold font-mono capitalize">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
