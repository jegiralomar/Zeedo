'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { SellerProfileDetail } from './SellerProfileDetail';
import {
  Store,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Search,
  Star,
  CheckCircle2,
  Users,
  Eye,
  FileText,
  DollarSign,
  Coins,
  TrendingUp,
  Sparkles,
  Download,
} from 'lucide-react';

export const SellerProvisioningCenter: React.FC = () => {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');

  const {
    sellers,
    auctions,
    invoices,
    provisionSeller,
    toggleSellerAutonomy,
    generateSellerInvoice,
    markInvoicePaid,
    syncSellersFromDb,
    addToast,
  } = useAdminStore();

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'merchants' | 'commissions' | 'invoices'>('merchants');
  const [commissionFilterTab, setCommissionFilterTab] = useState<'all' | 'pending' | 'settled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+964 750 ');
  const [city, setCity] = useState('Erbil');
  const [commissionRate, setCommissionRate] = useState(0.05); // 5% default
  const [autoApprove, setAutoApprove] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('ZeedoSeller2026');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState(36.1911);
  const [pickupLng, setPickupLng] = useState(44.0092);

  // Sync tab from URL if present
  useEffect(() => {
    if (urlTab === 'commissions') {
      setActiveTab('commissions');
    } else if (urlTab === 'invoices') {
      setActiveTab('invoices');
    }
  }, [urlTab]);

  useEffect(() => {
    syncSellersFromDb?.();
  }, [syncSellersFromDb]);

  // 1. Calculate Platform Financial Metrics
  const POSTING_FEE_IQD = 1000;
  const totalLots = auctions.length + sellers.reduce((acc, s) => acc + (s.totalListings || 0), 0);
  const totalPostingFeesIqd = totalLots * POSTING_FEE_IQD;

  const completedAuctions = auctions.filter((a) => a.status === 'completed');
  const completedGmvIqd =
    completedAuctions.reduce((acc, a) => acc + a.currentBidIqd, 0) +
    sellers.reduce((acc, s) => acc + (s.totalCodVolumeIqd || 0), 0);

  const totalCommissionsEarnedIqd = Math.round(
    sellers.reduce((acc, s) => acc + ((s.totalCodVolumeIqd || 0) * (s.commissionRate || 0.05)), 0)
  );
  const netPlatformRevenueIqd = totalPostingFeesIqd + totalCommissionsEarnedIqd;

  // Filtered sellers
  const filteredSellers = sellers.filter(
    (s) =>
      s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery))
  );

  // Filtered merchants for commission ledger
  const filteredLedgerMerchants = sellers.filter((m) => {
    const matchesSearch =
      m.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (commissionFilterTab === 'pending') {
      return matchesSearch && m.completedSales > 0;
    }
    if (commissionFilterTab === 'settled') {
      return matchesSearch && m.completedSales === 0;
    }
    return matchesSearch;
  });

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !ownerName || !phone) {
      addToast('error', 'Please fill in all required seller details');
      return;
    }

    const cleanUsername = username.trim() || phone.replace(/\s+/g, '');
    const cleanPassword = password.trim() || 'ZeedoSeller2026';

    provisionSeller({
      storeName,
      ownerName,
      phone,
      city,
      commissionRate,
      auto_approve_listings: autoApprove,
      pickupAddress: pickupAddress || `${city} Commercial District Hub`,
      pickupCoordinates: { lat: pickupLat, lng: pickupLng },
      username: cleanUsername,
      password: cleanPassword,
    });

    fetch('/api/sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeName,
        ownerName,
        phone,
        city,
        commissionRate,
        auto_approve_listings: autoApprove,
        pickupAddress: pickupAddress || `${city} Commercial District Hub`,
        pickupCoordinates: { lat: pickupLat, lng: pickupLng },
        username: cleanUsername,
        password: cleanPassword,
      }),
    }).catch((err) => console.warn('Failed to sync seller to Postgres:', err));

    setIsModalOpen(false);
    setStoreName('');
    setOwnerName('');
    setUsername('');
    setPassword('ZeedoSeller2026');
    setPhone('+964 750 ');
    setAutoApprove(false);
  };

  if (selectedSellerId) {
    return <SellerProfileDetail sellerId={selectedSellerId} onBack={() => setSelectedSellerId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              Merchant Accounts & Platform Commissions
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF1F3] text-[#F83758] font-mono font-bold border border-[#FFE4E8]">
                1,000 IQD Base Fee Active
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Manage Iraqi merchants, listing autonomy flags, 1,000 IQD posting fees & commission settlement ledgers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-Tabs: Merchant Directory | Commissions & Fees | Invoices */}
          <div className="flex items-center bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF] text-xs">
            <button
              onClick={() => setActiveTab('merchants')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'merchants'
                  ? 'bg-[#17223B] text-white shadow-xs'
                  : 'text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchants Directory ({sellers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'commissions'
                  ? 'bg-[#17223B] text-white shadow-xs'
                  : 'text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-[#F8991D]" />
              <span>Commissions & Fees</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-[#17223B] text-white shadow-xs'
                  : 'text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoicing Ledger</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-spark-lime text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-[#072F1F]" />
            <span>+ Provision Merchant</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MERCHANTS DIRECTORY TABLE */}
      {activeTab === 'merchants' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="spark-card !p-3 flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#6C7E75]" />
              <input
                type="text"
                placeholder="Search merchant store, owner, city, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#F4F6F5] border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#17223B]"
              />
            </div>
            <span className="text-xs font-mono text-[#6C7E75]">
              Showing {filteredSellers.length} of {sellers.length} merchants
            </span>
          </div>

          <div className="spark-card !p-0 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
                  <th className="p-4">Store & Owner</th>
                  <th className="p-4">City & Pickup Address</th>
                  <th className="p-4">Commission %</th>
                  <th className="p-4">1K IQD Fees & GMV</th>
                  <th className="p-4">Listing Autonomy</th>
                  <th className="p-4">Sales & Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EFEF]">
                {filteredSellers.map((s) => {
                  const postingCount = s.totalListings || 4;
                  const postingFeesPaid = postingCount * 1000;
                  const commDue = Math.round((s.totalCodVolumeIqd || 0) * (s.commissionRate || 0.05));

                  return (
                    <tr key={s.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedSellerId(s.id)}
                          className="text-left group"
                        >
                          <div className="font-extrabold text-[#0B130F] group-hover:text-blue-600 text-sm flex items-center gap-2 underline-offset-2 group-hover:underline">
                            <span>{s.storeName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#F4F6F5] text-[#6C7E75]">
                              {s.id}
                            </span>
                          </div>
                        </button>
                        <div className="text-[#6C7E75] text-xs mt-0.5">Owner: {s.ownerName}</div>
                        <div className="font-mono text-[#879A91] text-[11px] mt-0.5">{s.phone}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-[#0B130F]">{s.city}</div>
                        <div className="text-[11px] text-[#6C7E75] max-w-xs truncate mt-0.5">
                          {s.pickupAddress}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-extrabold">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{(s.commissionRate * 100).toFixed(0)}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Winning bid cut</span>
                      </td>

                      <td className="p-4">
                        <div className="font-mono text-xs">
                          <div className="font-bold text-slate-800">
                            {postingFeesPaid.toLocaleString()} IQD <span className="text-[10px] font-normal text-slate-500">({postingCount} lots)</span>
                          </div>
                          <div className="text-emerald-700 font-bold text-[11px] mt-0.5">
                            {(s.totalCodVolumeIqd / 1000000).toFixed(1)}M IQD GMV
                          </div>
                          <div className="text-rose-600 text-[10px] font-semibold">
                            {commDue.toLocaleString()} IQD commission
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <button
                            onClick={() => toggleSellerAutonomy(s.id)}
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                              s.auto_approve_listings
                                ? 'bg-[#DCFCE7] text-[#15803d]'
                                : 'bg-[#FFEDD5] text-[#F97316]'
                            }`}
                          >
                            {s.auto_approve_listings ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>AUTO-APPROVE ON</span>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>MODERATED QUEUE</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-[#6C7E75] block">
                            {s.auto_approve_listings
                              ? 'Direct to LIVE room'
                              : 'Admin Moderation review'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 font-mono text-xs">
                          <div className="text-[#0B130F]">
                            <strong>{s.completedSales}</strong> sales / {s.totalListings} listings
                          </div>
                          <div className="flex items-center gap-1 text-[#f59e0b] text-[11px]">
                            <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
                            <span>{s.rating} rating</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSellerId(s.id)}
                            className="btn-spark-primary text-xs py-1 px-3 flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Profile</span>
                          </button>
                          <button
                            onClick={() => toggleSellerAutonomy(s.id)}
                            className="btn-spark-light text-xs py-1 px-3"
                          >
                            Toggle Flag
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSIONS & FEES VIEW (INTEGRATED DIRECTLY IN MERCHANTS TAB) */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Zero-Fleet COD Architecture Banner */}
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

          {/* Merchant Commission Ledger Table */}
          <div className="bg-white rounded-2xl border border-[#ECEFF3] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#ECEFF3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#17223B]">Merchant Commission & Fee Ledger</h3>
                <p className="text-xs text-slate-400">
                  Track merchant listing posting fees (1,000 IQD/item), commission cuts on won lots, and settlement status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Segmented Filter Pills */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setCommissionFilterTab('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      commissionFilterTab === 'all'
                        ? 'bg-white text-[#17223B] shadow-xs'
                        : 'text-slate-500 hover:text-[#17223B]'
                    }`}
                  >
                    All ({sellers.length})
                  </button>
                  <button
                    onClick={() => setCommissionFilterTab('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      commissionFilterTab === 'pending'
                        ? 'bg-white text-[#F83758] shadow-xs'
                        : 'text-slate-500 hover:text-[#17223B]'
                    }`}
                  >
                    Pending Fee
                  </button>
                  <button
                    onClick={() => setCommissionFilterTab('settled')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      commissionFilterTab === 'settled'
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
                  onClick={() => addToast('info', 'Exporting Merchant Commission Ledger CSV...')}
                  className="p-1.5 rounded-xl border border-[#ECEFF3] hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

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
                  {filteredLedgerMerchants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No merchants match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerMerchants.map((merchant) => {
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
        </div>
      )}

      {/* TAB 3: INVOICING & BILLING LEDGER TABLE */}
      {activeTab === 'invoices' && (
        <div className="spark-card !p-0 overflow-hidden space-y-4">
          <div className="p-4 bg-[#F8FAF9] border-b border-[#E9EFEF] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-[#0B130F] block text-sm">
                Merchant Direct COD & Commission Invoicing
              </span>
              <span className="text-[#6C7E75]">
                Merchants collect 100% COD directly. Invoices track listing posting fees (1,000 IQD/item) + commission % on GMV.
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
              1,000 IQD Base Posting Fee Active
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
                <th className="p-4">Merchant & Credentials</th>
                <th className="p-4">Total Postings (1,000 IQD ea)</th>
                <th className="p-4">COD Sales Volume (GMV)</th>
                <th className="p-4">Commission Rate</th>
                <th className="p-4">Total Balance Due</th>
                <th className="p-4 text-right">Invoicing Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFEF]">
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6C7E75]">
                    No merchants provisioned yet. Click &quot;+ Provision Merchant&quot; above.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => {
                  const sellerAuctions = auctions.filter((a) => a.sellerId === s.id);
                  const postingCount = sellerAuctions.length || s.totalListings || 4;
                  const postingFeesIqd = postingCount * 1000;
                  const completedAuctions = sellerAuctions.filter(
                    (a) => a.status === 'completed' && a.highestBidder
                  );
                  const gmvIqd = completedAuctions.reduce((sum, a) => sum + a.currentBidIqd, 0) || s.totalCodVolumeIqd;
                  const commRate = s.commissionRate || 0.05;
                  const commDue = Math.round(gmvIqd * commRate);
                  const totalDue = postingFeesIqd + commDue;

                  const sellerInvoice = invoices.find((inv) => inv.sellerId === s.id);

                  return (
                    <tr key={s.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-[#0B130F] text-sm">{s.storeName}</div>
                        <div className="text-[11px] text-[#6C7E75] font-mono mt-0.5">
                          Login: <strong className="text-slate-900">{s.username || s.phone}</strong> • {s.city}
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        <div className="font-bold text-[#0B130F]">{postingCount} listings</div>
                        <div className="text-[11px] text-[#6C7E75]">{postingFeesIqd.toLocaleString()} IQD</div>
                      </td>

                      <td className="p-4 font-mono">
                        <div className="font-bold text-[#15803d]">{gmvIqd.toLocaleString()} IQD</div>
                        <div className="text-[11px] text-[#6C7E75]">{s.completedSales} sales</div>
                      </td>

                      <td className="p-4 font-mono font-bold text-[#0B130F]">
                        {(commRate * 100).toFixed(0)}%
                      </td>

                      <td className="p-4 font-mono">
                        <div className="text-base font-extrabold text-[#072F1F]">
                          {totalDue.toLocaleString()} IQD
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold">
                          {sellerInvoice?.status === 'paid' ? 'Paid / Settled' : 'Unpaid Balance'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {sellerInvoice?.status === 'paid' ? (
                          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803d] font-bold text-xs">
                            Invoice Settled
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => generateSellerInvoice(s.id)}
                              className="btn-spark-light text-xs py-1 px-3"
                            >
                              Generate Invoice
                            </button>
                            {sellerInvoice && (
                              <button
                                onClick={() => markInvoicePaid(sellerInvoice.id)}
                                className="btn-spark-lime text-xs py-1 px-3 font-bold"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Provision Seller Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <Store className="w-5 h-5 text-[#072F1F]" />
              Provision Merchant Account
            </h3>
            <p className="text-xs text-[#6C7E75]">
              Register an official merchant. Once created, the merchant can log in with their credentials.
            </p>

            <form onSubmit={handleCreateSeller} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Store / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Erbil Mobile World"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Owner Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Sardar Rashid"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Iraqi Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 750 000 0000"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">City / Governorate *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs font-semibold"
                  >
                    <option value="Erbil">Erbil</option>
                    <option value="Baghdad">Baghdad</option>
                    <option value="Sulaymaniyah">Sulaymaniyah</option>
                    <option value="Duhok">Duhok</option>
                    <option value="Basra">Basra</option>
                    <option value="Kirkuk">Kirkuk</option>
                    <option value="Najaf">Najaf</option>
                  </select>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">
                    Store Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. erbil_mobile"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-[#0B130F] font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500">Defaults to phone if empty</span>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">
                    Store Login Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-[#0B130F] font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500">Default: ZeedoSeller2026</span>
                </div>
              </div>

              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">
                  Commission Rate (% Platform Fee)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0.03}
                    max={0.2}
                    step={0.01}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="flex-1 accent-[#17223B]"
                  />
                  <span className="font-mono text-emerald-700 font-black w-12 text-right">
                    {(commissionRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Autonomy Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B130F]">auto_approve_listings Autonomy Flag</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoApprove}
                      onChange={(e) => setAutoApprove(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#17223B]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-[#6C7E75]">
                  When enabled, listings submitted by this seller bypass the Admin Moderation Queue after their 10-minute grace window and go directly LIVE.
                </p>
              </div>

              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Warehouse / Pickup Address</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Street, building, or landmark for courier package collection"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9EFEF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-spark-primary text-xs"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
