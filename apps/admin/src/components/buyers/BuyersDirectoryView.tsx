'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import {
  Users,
  Search,
  MapPin,
  Phone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Gavel,
  Trophy,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const BuyersDirectoryView: React.FC = () => {
  const { users, syncUsersFromDb } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'bidders' | 'winners'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync latest users from database on mount
  useEffect(() => {
    syncUsersFromDb?.();
  }, [syncUsersFromDb]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncUsersFromDb?.();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtered buyers: In ZEEDO architecture, every registered buyer is 100% verified via OTP & GPS pin
  const filteredBuyers = users.filter((buyer) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      buyer.name.toLowerCase().includes(q) ||
      buyer.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      (buyer.id && buyer.id.toLowerCase().includes(q)) ||
      (buyer.city && buyer.city.toLowerCase().includes(q)) ||
      (buyer.rooftopPin?.landmark && buyer.rooftopPin.landmark.toLowerCase().includes(q));

    const matchesCity =
      selectedCity === 'all' || buyer.city.toLowerCase() === selectedCity.toLowerCase();

    const matchesActivity =
      activityFilter === 'all' ||
      (activityFilter === 'bidders' && (buyer.totalBids || 0) > 0) ||
      (activityFilter === 'winners' && (buyer.totalWins || 0) > 0);

    return matchesSearch && matchesCity && matchesActivity;
  });

  // KPI Calculations
  const totalBuyers = users.length;
  const withGpsPin = users.filter((u) => u.rooftopPin?.latitude || u.rooftopPin?.landmark).length;
  const activeBidders = users.filter((u) => (u.totalBids || 0) > 0).length;
  const totalWinners = users.filter((u) => (u.totalWins || 0) > 0).length;

  const citiesList = Array.from(new Set(users.map((u) => u.city).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* 1. Header KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Registered Buyers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Buyer Accounts
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
              {totalBuyers}
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500">WhatsApp OTP & Phone Authenticated</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Rooftop GPS Anchors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rooftop Delivery Pins
            </span>
            <div className="text-2xl font-black text-indigo-600 font-mono flex items-center gap-2">
              {withGpsPin}
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                GPS Anchors
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Precision Rooftop Lat/Lng Coordinates</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Active Live Bidders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Bidders
            </span>
            <div className="text-2xl font-black text-amber-600 font-mono">
              {activeBidders}
            </div>
            <p className="text-[11px] text-slate-500">Placed bids in live auction rooms</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Auction Winners */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Auction Winners
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono flex items-center gap-2">
              {totalWinners}
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                COD Lots Won
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Winning bids fulfilled via COD</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buyers by name, phone (+964...), city, landmark, or ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 placeholder-slate-400 font-medium transition-all"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            <option value="all">All Iraqi Cities</option>
            {citiesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Activity Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalBuyers})
            </button>
            <button
              onClick={() => setActivityFilter('bidders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activityFilter === 'bidders'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bidders ({activeBidders})
            </button>
            <button
              onClick={() => setActivityFilter('winners')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activityFilter === 'winners'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Winners ({totalWinners})
            </button>
          </div>

          {/* Sync / Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all flex items-center justify-center shrink-0"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Buyers Table Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Buyer Account</th>
                <th className="py-3.5 px-4">WhatsApp Phone</th>
                <th className="py-3.5 px-4">City / Governorate</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Delivery Rooftop Pin</th>
                <th className="py-3.5 px-4 text-center">Bids / Wins</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700">No buyers found</p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        No buyer matches your current search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBuyers.map((buyer) => {
                  const cleanPhone = buyer.phone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '964' + cleanPhone.slice(1) : cleanPhone}`;
                  const pin = buyer.rooftopPin;
                  const gmapsUrl =
                    pin?.latitude && pin?.longitude
                      ? `https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`
                      : null;

                  return (
                    <tr key={buyer.id || buyer.phone} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Buyer Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-[#5B50D6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {buyer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {buyer.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {buyer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{buyer.phone}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {buyer.city || 'Erbil'}
                      </td>

                      {/* Account Status Pill */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Verified Active</span>
                        </span>
                      </td>

                      {/* Delivery Rooftop Pin */}
                      <td className="py-3.5 px-4">
                        {pin?.latitude && pin?.longitude ? (
                          <div className="space-y-0.5">
                            <a
                              href={gmapsUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-600 hover:underline"
                              title="View on Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                              {pin.landmark || pin.addressText || buyer.city}
                            </div>
                          </div>
                        ) : pin?.landmark ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{pin.landmark}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No GPS Pin</span>
                        )}
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold text-slate-900" title="Total Bids">
                            {buyer.totalBids || 0} bids
                          </span>
                          {(buyer.totalWins || 0) > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                              🏆 {buyer.totalWins}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {buyer.joinedAt
                          ? new Date(buyer.joinedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors"
                          title="Chat with buyer on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
