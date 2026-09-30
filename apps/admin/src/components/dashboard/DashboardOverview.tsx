'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/store/useAdminStore';
import { AnalyticsReports } from './AnalyticsReports';
import {
  Coins,
  Gavel,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  TrendingUp,
  MapPin,
  Flame,
  Store,
  Sparkles,
  Users,
  Clock,
  Headphones,
  ScrollText,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { users, sellers, auctions, manifests, auditLogs, tickets } = useAdminStore();

  const totalCodVolume =
    auctions.reduce((acc, a) => acc + (a.status === 'completed' ? a.currentBidIqd : 0), 0) +
    sellers.reduce((acc, s) => acc + s.totalCodVolumeIqd, 0);

  const liveAuctionsCount = auctions.filter((a) => a.status === 'live').length;
  const pendingKycCount = users.filter((u) => u.kycStatus === 'pending').length;
  const pendingModerationCount = auctions.filter((a) => a.status === 'moderation_pending').length;
  const verifiedPinCount = users.filter((u) => u.rooftopPin && u.kycStatus === 'verified').length;
  const openTicketsCount = (tickets || []).filter((t) => t.status === 'open').length;

  const totalListingsCount = auctions.length + sellers.reduce((acc, s) => acc + (s.totalListings || 0), 0);
  const totalPlatformRetainedIqd = totalListingsCount * 1000;

  const recentAuditEntries = (auditLogs || []).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* TOP ROW: Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card 1: Platform Volume */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-md shadow-blue-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                Gross Merchandise Value
              </span>
              <Sparkles className="w-4 h-4 text-blue-200" />
            </div>
            <div className="text-xs text-blue-100 font-medium">Completed & In-Flight GMV</div>
            <div className="text-2xl font-black font-mono text-white tracking-tight mt-1">
              {(totalCodVolume / 1000000).toFixed(1)}M <span className="text-sm font-sans font-bold text-blue-200">IQD</span>
            </div>
          </div>

          <Link
            href="/auctions"
            className="relative z-10 mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white hover:text-blue-100 transition-colors group"
          >
            <span>Active Bids Center</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-md pointer-events-none" />
        </div>

        {/* Stat Card 2: Active Auctions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Auctions
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono flex items-center gap-2">
              {liveAuctionsCount}{' '}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans">
                Live Now
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-slate-700 font-medium text-[11px]">Real-time Bidding</span>
            <Link href="/auctions" className="text-[11px] font-bold text-blue-600 hover:underline">
              View Active &rarr;
            </Link>
          </div>
        </div>

        {/* Stat Card 3: Pending KYC Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending KYC Queue
              </span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono flex items-center gap-2">
              {pendingKycCount}{' '}
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-sans">
                Review Needed
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-medium text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{verifiedPinCount} GPS Verified</span>
            </span>
            <Link href="/kyc" className="text-[11px] font-bold text-blue-600 hover:underline">
              Review &rarr;
            </Link>
          </div>
        </div>

        {/* Stat Card 4: Listing Fee Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Listing Fee Revenue
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {totalPlatformRetainedIqd.toLocaleString()}{' '}
              <span className="text-xs font-bold text-slate-500 font-sans">IQD</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-slate-700 font-semibold text-[11px]">
              {totalListingsCount} Total Listings
            </span>
            <span className="text-[11px] font-mono text-slate-500">Retained Fees</span>
          </div>
        </div>
      </div>

      {/* Analytics Suite */}
      <AnalyticsReports />

      {/* Core Operational Hub & Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Workflow Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operations Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ZEEDO Platform Console
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active Bids Card */}
            <Link
              href="/auctions"
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                  <Gavel className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Active Bids Command</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live auction management, real-time timer extensions, and bidder dispute inspection.
              </p>
              <div className="text-xs font-bold text-blue-600 font-mono pt-1">
                {liveAuctionsCount} auctions active now &rarr;
              </div>
            </Link>

            {/* Split-Screen KYC Card */}
            <Link
              href="/kyc"
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Split-Screen KYC Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect Bataqa Wataniya ID uploads alongside OCR data extraction and rooftop GPS coordinates.
              </p>
              <div className="text-xs font-bold text-emerald-700 font-mono pt-1">
                {pendingKycCount} submissions awaiting review &rarr;
              </div>
            </Link>

            {/* Listing Moderation Card */}
            <Link
              href="/moderation"
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Multi-Dialect Moderation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review merchant items across Sorani, Badini, Arabic, and English catalogs before publishing.
              </p>
              <div className="text-xs font-bold text-amber-700 font-mono pt-1">
                {pendingModerationCount} listings in moderation queue &rarr;
              </div>
            </Link>

            {/* Logistics & Print Center Card */}
            <Link
              href="/logistics"
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Logistics & Print Center</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Print 4x6&quot; thermal shipping labels with scannable GPS QR codes and batch assemble route manifests.
              </p>
              <div className="text-xs font-bold text-sky-700 font-mono pt-1">
                {manifests.length} manifests assembled &rarr;
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity & Audit Trail (Replaced the lecture rulebook) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent System Activity
            </span>
            <Link href="/audit" className="text-xs font-bold text-blue-600 hover:underline">
              Full Log &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            {recentAuditEntries.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {recentAuditEntries.map((entry) => (
                  <div key={entry.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug line-clamp-2">
                      {entry.description}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      By: <span className="font-semibold text-slate-700">{entry.actorName}</span> ({entry.actorRole.replace(/_/g, ' ')})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
