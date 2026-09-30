'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export const SellerProvisioningCenter: React.FC = () => {
  const {
    sellers,
    users,
    auctions,
    invoices,
    provisionSeller,
    toggleSellerAutonomy,
    generateSellerInvoice,
    markInvoicePaid,
    addToast,
  } = useAdminStore();

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'merchants' | 'buyers' | 'invoices'>('merchants');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+964 750 ');
  const [city, setCity] = useState('Erbil');
  const [commissionRate, setCommissionRate] = useState(0.07); // 7%
  const [autoApprove, setAutoApprove] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('ZeedoSeller2026');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState(36.1911);
  const [pickupLng, setPickupLng] = useState(44.0092);

  const filteredSellers = sellers.filter(
    (s) =>
      s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuyers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    // Also persist directly to PostgreSQL
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
      {/* Top Header & Actions */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803d] flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              Merchant Provisioning & Account Management
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#EF4444] font-mono font-bold">
                Admin-Only Provisioning
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Public seller registration is disabled. Create verified merchants and configure listing autonomy flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF] text-xs">
            <button
              onClick={() => setActiveTab('merchants')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'merchants'
                  ? 'bg-[#072F1F] text-white shadow-xs'
                  : 'text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sellers ({sellers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'buyers'
                  ? 'bg-[#072F1F] text-white shadow-xs'
                  : 'text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Buyers ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-[#072F1F] text-white shadow-xs'
                  : 'text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoicing Ledger</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-spark-lime text-xs"
          >
            <UserPlus className="w-4 h-4 text-[#072F1F]" />
            <span>+ Provision New Merchant</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="spark-card !p-3 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#6C7E75]" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'merchants' ? 'merchant store, owner, city...' : 'buyer name, phone...'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#F4F6F5] border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
          />
        </div>
        <span className="text-xs font-mono text-[#6C7E75]">
          Showing {activeTab === 'merchants' ? filteredSellers.length : filteredBuyers.length} records
        </span>
      </div>

      {/* MERCHANTS DIRECTORY TABLE */}
      {activeTab === 'merchants' && (
        <div className="spark-card !p-0 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
                <th className="p-4">Store & Owner</th>
                <th className="p-4">City & Pickup Address</th>
                <th className="p-4">Commission %</th>
                <th className="p-4">Listing Autonomy</th>
                <th className="p-4">Performance Metrics</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFEF]">
              {filteredSellers.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedSellerId(s.id)}
                      className="text-left group"
                    >
                      <div className="font-extrabold text-[#0B130F] group-hover:text-[#072F1F] text-sm flex items-center gap-2 underline-offset-2 group-hover:underline">
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
                    <div className="flex items-center gap-1.5 font-mono text-[#15803d] font-extrabold">
                      <Percent className="w-3.5 h-3.5" />
                      <span>{(s.commissionRate * 100).toFixed(0)}%</span>
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
                          ? 'Goes straight to LIVE'
                          : 'Routes to Admin Moderation'}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1 font-mono text-xs">
                      <div className="text-[#0B130F]">
                        <strong>{s.completedSales}</strong> sales / {s.totalListings} listings
                      </div>
                      <div className="text-[#15803d] font-bold">
                        {(s.totalCodVolumeIqd / 1000000).toFixed(1)}M IQD COD
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BUYERS DIRECTORY TABLE */}
      {activeTab === 'buyers' && (
        <div className="spark-card !p-0 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
                <th className="p-4">Buyer Name & Phone</th>
                <th className="p-4">City & Joined</th>
                <th className="p-4">Gate 1: KYC Status</th>
                <th className="p-4">Gate 2: Rooftop Map Pin</th>
                <th className="p-4">Bids & Wins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFEF]">
              {filteredBuyers.map((u) => {
                const kycBadges = {
                  verified: 'bg-[#DCFCE7] text-[#15803d]',
                  pending: 'bg-[#FFEDD5] text-[#F97316]',
                  rejected: 'bg-[#FEE2E2] text-[#EF4444]',
                  unsubmitted: 'bg-slate-200 text-slate-700',
                };

                return (
                  <tr key={u.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0B130F] text-sm">{u.name}</div>
                      <div className="font-mono text-[#6C7E75] text-xs mt-0.5">{u.phone}</div>
                    </td>

                    <td className="p-4 text-[#6C7E75]">
                      <div className="font-bold text-[#0B130F]">{u.city}</div>
                      <div className="text-[11px]">
                        Joined {new Date(u.joinedAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold capitalize ${kycBadges[u.kycStatus]}`}
                      >
                        {u.kycStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.rooftopPin ? (
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1.5 text-[#15803d] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>GPS Pinned</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#6C7E75] block truncate max-w-xs">
                            {u.rooftopPin.addressText}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#EF4444] text-xs font-mono font-semibold">No Pin Dropped</span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-xs">
                      <div>{u.totalBids} bids placed</div>
                      <div className="text-[#15803d] font-bold">{u.totalWins} auctions won</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* INVOICING & BILLING LEDGER TABLE */}
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
                    No merchants provisioned yet. Click &quot;+ Provision New Merchant&quot; above.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => {
                  const sellerAuctions = auctions.filter((a) => a.sellerId === s.id);
                  const postingCount = sellerAuctions.length;
                  const postingFeesIqd = postingCount * 1000;
                  const completedAuctions = sellerAuctions.filter(
                    (a) => a.status === 'completed' && a.highestBidder
                  );
                  const gmvIqd = completedAuctions.reduce((sum, a) => sum + a.currentBidIqd, 0);
                  const commRate = s.commissionRate || 0.07;
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
                        <div className="text-[11px] text-[#6C7E75]">{completedAuctions.length} won sales</div>
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
              Register an official merchant. Once created, the merchant can log in using Fast2SMS mobile verification.
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
                    <option value="Zakho">Zakho</option>
                  </select>
                </div>
              </div>

              {/* Login Credentials for zeedo.auction */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div>
                  <label className="text-amber-900 font-bold block mb-1">
                    Store Username (for zeedo.auction)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. erbil_mobile"
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-[#0B130F] font-mono text-xs"
                  />
                  <span className="text-[10px] text-amber-700">Defaults to phone if empty</span>
                </div>

                <div>
                  <label className="text-amber-900 font-bold block mb-1">
                    Store Login Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-[#0B130F] font-mono text-xs"
                  />
                  <span className="text-[10px] text-amber-700">Default: ZeedoSeller2026</span>
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
                    className="flex-1 accent-[#072F1F]"
                  />
                  <span className="font-mono text-[#15803d] font-black w-12 text-right">
                    {(commissionRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* CRITICAL AUTONOMY TOGGLE */}
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
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#072F1F]"></div>
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
