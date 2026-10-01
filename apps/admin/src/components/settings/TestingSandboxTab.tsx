'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import {
  FlaskConical,
  Sparkles,
  Users,
  Store,
  Gavel,
  Trash2,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Zap,
  TrendingUp,
  Flame,
  ShieldCheck,
  MapPin,
  Phone,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const TestingSandboxTab: React.FC = () => {
  const {
    users,
    sellers,
    auctions,
    merchantReceipts,
    provisionSeller,
    placeBid,
    addToast,
    syncUsersFromDb,
    syncSellersFromDb,
    syncAuctionsFromDb,
    fetchReceipts,
  } = useAdminStore();

  const [activeFormTab, setActiveFormTab] = useState<'buyer' | 'merchant' | 'auction' | 'bid'>('buyer');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form: Create Mock Buyer
  const [buyerName, setBuyerName] = useState('Hayder Al-Tamimi');
  const [buyerPhone, setBuyerPhone] = useState(`+964 770 ${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [buyerCity, setBuyerCity] = useState('Baghdad');
  const [buyerDistrict, setBuyerDistrict] = useState('Al-Karrada');
  const [buyerVerified, setBuyerVerified] = useState(true);

  // Form: Create Mock Merchant
  const [storeName, setStoreName] = useState('Dijlah Mobile & Electronics (Test)');
  const [ownerName, setOwnerName] = useState('Ahmed Dijlah');
  const [merchantPhone, setMerchantPhone] = useState(`+964 750 ${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [merchantCity, setMerchantCity] = useState('Erbil');
  const [commissionRate, setCommissionRate] = useState(0.07);
  const [autoApprove, setAutoApprove] = useState(true);
  const [merchantUsername, setMerchantUsername] = useState('test_dijlah');
  const [merchantPassword, setMerchantPassword] = useState('ZeedoTest98');

  // Form: Create Mock Auction
  const [auctionTitle, setAuctionTitle] = useState('Apple iPad Pro M4 13-inch 256GB Wi-Fi Space Black');
  const [auctionSellerId, setAuctionSellerId] = useState(sellers[0]?.id || 'sel-01');
  const [auctionCategory, setAuctionCategory] = useState('Computers & Tablets');
  const [auctionCondition, setAuctionCondition] = useState<'New' | 'Used' | 'New Open Box'>('New');
  const [auctionDuration, setAuctionDuration] = useState<'30s' | '2m' | '10m' | '1h' | '24h'>('2m');
  const [auctionRetailUsd, setAuctionRetailUsd] = useState(1299);
  const [auctionImageUrl, setAuctionImageUrl] = useState(
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
  );

  // Form: Simulate Bid
  const liveAuctions = auctions.filter((a) => a.status === 'live');
  const [selectedBidAuctionId, setSelectedBidAuctionId] = useState(liveAuctions[0]?.id || '');
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);

  // 1. Action: Seed Full Demo Marketplace
  const handleSeedDemoData = async () => {
    setLoadingAction('seeding');
    try {
      const res = await fetch('/api/testing/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await Promise.all([
          syncUsersFromDb?.(),
          syncSellersFromDb?.(),
          syncAuctionsFromDb?.(),
          fetchReceipts?.(),
        ]);
        addToast('success', 'Demo marketplace dataset seeded into PostgreSQL & store!');
      } else {
        addToast('error', data.error || 'Failed to seed data');
      }
    } catch {
      addToast('error', 'Network error seeding demo data');
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Action: Purge Test Data
  const handlePurgeTestData = async () => {
    setLoadingAction('purging');
    try {
      const res = await fetch('/api/testing/purge', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await Promise.all([
          syncUsersFromDb?.(),
          syncSellersFromDb?.(),
          syncAuctionsFromDb?.(),
          fetchReceipts?.(),
        ]);
        addToast(
          'success',
          `Purged ${data.deleted?.auctions || 0} auctions, ${data.deleted?.merchants || 0} merchants, and ${data.deleted?.buyers || 0} buyers.`
        );
      } else {
        addToast('error', data.error || 'Failed to purge test data');
      }
    } catch {
      addToast('error', 'Network error purging test data');
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Action: Instant 45s Sniping Battle
  const handleTriggerSnipingBattle = async () => {
    setLoadingAction('sniping');
    try {
      const seller = sellers[0] || { id: 'sel-01', storeName: 'ZEEDO Official Store', phone: '+964 750 111 2233' };
      const now = Date.now();
      const testAuctionId = `auc-test-snipe-${now.toString().slice(-4)}`;

      // Create 45s auction directly in DB
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testAuctionId,
          sellerId: seller.id,
          sellerName: seller.storeName,
          sellerPhone: seller.phone,
          title: 'Sony PlayStation 5 Slim 1TB (LIVE 45s Sniping Battle)',
          category: 'Gaming & Consoles',
          condition: 'New',
          currentBidIqd: 450000,
          estimatedRetailIqd: 650000,
          estimatedRetailUsd: 499,
          durationHours: 0.0125, // ~45 seconds
          images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80'],
          status: 'live',
        }),
      });

      if (res.ok) {
        await syncAuctionsFromDb?.();
        addToast('success', `Created 45-second Live Auction room (${testAuctionId})!`);

        // Simulate 2 competing bids
        setTimeout(async () => {
          await fetch('/api/bids/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auctionId: testAuctionId,
              bidderId: 'usr-test-01',
              bidderName: 'Omar Al-Ani',
              bidderPhone: '+964 770 999 1234',
              bidderCity: 'Baghdad',
            }),
          });
          syncAuctionsFromDb?.();
          addToast('info', 'Omar placed bid -> 452,000 IQD (+60s Soft-Close Reset!)');
        }, 3000);
      }
    } catch {
      addToast('error', 'Error launching sniping test');
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Action: Simulate Receipt Upload
  const handleSimulateReceipt = async () => {
    setLoadingAction('receipt');
    try {
      const seller = sellers[0] || { id: 'sel-01', storeName: 'ZEEDO Official Store' };
      const res = await fetch('/api/sellers/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller.id,
          sellerName: seller.storeName,
          amountIqd: 250000,
          paymentMethod: 'fib',
          receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          referenceNote: `Test FIB Transfer Ref #FIB-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });

      if (res.ok) {
        await fetchReceipts?.();
        addToast('success', 'Simulated FIB transfer receipt submitted! Review it in Settlements Queue.');
      }
    } catch {
      addToast('error', 'Error creating simulated receipt');
    } finally {
      setLoadingAction(null);
    }
  };

  // 5. Submit Custom Mock Buyer
  const handleCreateCustomBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction('create-buyer');
    try {
      const buyerId = `usr-test-${Date.now().toString().slice(-4)}`;
      const pinObj = {
        latitude: buyerCity === 'Baghdad' ? 33.3152 : buyerCity === 'Erbil' ? 36.1911 : 30.5081,
        longitude: buyerCity === 'Baghdad' ? 44.3661 : buyerCity === 'Erbil' ? 44.0092 : 47.8182,
        city: buyerCity,
        district: buyerDistrict,
        landmark: `${buyerDistrict}, Near Central Square`,
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: buyerId,
          name: buyerName,
          phone: buyerPhone,
          city: buyerCity,
          kycStatus: buyerVerified ? 'verified' : 'pending',
          rooftopLandmark: pinObj.landmark,
          rooftopPin: pinObj,
          role: 'buyer',
          isTest: true,
        }),
      });

      if (res.ok) {
        await syncUsersFromDb?.();
        addToast('success', `Created mock buyer: ${buyerName} (${buyerCity})`);
        setBuyerPhone(`+964 770 ${Math.floor(1000000 + Math.random() * 9000000)}`);
      } else {
        addToast('error', 'Failed to save mock buyer');
      }
    } catch {
      addToast('error', 'Network error creating mock buyer');
    } finally {
      setLoadingAction(null);
    }
  };

  // 6. Submit Custom Mock Merchant
  const handleCreateCustomMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction('create-merchant');
    try {
      const sellerId = `sel-test-${Date.now().toString().slice(-4)}`;
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sellerId,
          storeName,
          ownerName,
          phone: merchantPhone,
          city: merchantCity,
          commissionRate,
          auto_approve_listings: autoApprove,
          pickupAddress: `${merchantCity} Commercial District, St. 14`,
          username: merchantUsername,
          password: merchantPassword,
          isTest: true,
        }),
      });

      if (res.ok) {
        await syncSellersFromDb?.();
        addToast('success', `Created mock merchant: ${storeName}`);
        setMerchantPhone(`+964 750 ${Math.floor(1000000 + Math.random() * 9000000)}`);
        setMerchantUsername(`test_${Date.now().toString().slice(-4)}`);
      } else {
        addToast('error', 'Failed to save mock merchant');
      }
    } catch {
      addToast('error', 'Network error creating mock merchant');
    } finally {
      setLoadingAction(null);
    }
  };

  // 7. Submit Custom Mock Auction
  const handleCreateCustomAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction('create-auction');
    try {
      const seller = sellers.find((s) => s.id === auctionSellerId) || sellers[0];
      const now = Date.now();
      const aucId = `auc-test-${now.toString().slice(-4)}`;

      // Calculate end time
      let durationMs = 2 * 60 * 1000; // 2 minutes default
      if (auctionDuration === '30s') durationMs = 30 * 1000;
      else if (auctionDuration === '10m') durationMs = 10 * 60 * 1000;
      else if (auctionDuration === '1h') durationMs = 3600 * 1000;
      else if (auctionDuration === '24h') durationMs = 24 * 3600 * 1000;

      const endsAt = new Date(now + durationMs).toISOString();

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: aucId,
          sellerId: seller?.id || 'sel-01',
          sellerName: seller?.storeName || 'Merchant Store',
          sellerPhone: seller?.phone || '+964 750 000 0000',
          title: auctionTitle,
          category: auctionCategory,
          condition: auctionCondition,
          currentBidIqd: 1000,
          estimatedRetailIqd: Math.round(auctionRetailUsd * 1510),
          estimatedRetailUsd: auctionRetailUsd,
          auctionEndsAt: endsAt,
          images: [auctionImageUrl],
          status: 'live',
          isTest: true,
        }),
      });

      if (res.ok) {
        await syncAuctionsFromDb?.();
        addToast('success', `Created custom live auction: "${auctionTitle}" (Ends in ${auctionDuration})`);
      } else {
        addToast('error', 'Failed to create mock auction');
      }
    } catch {
      addToast('error', 'Network error creating mock auction');
    } finally {
      setLoadingAction(null);
    }
  };

  // 8. Place Simulated Bid
  const handleSimulateBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBidAuctionId) return;
    setLoadingAction('sim-bid');
    try {
      const targetAuc = auctions.find((a) => a.id === selectedBidAuctionId);
      const current = targetAuc?.currentBidIqd || 1000;
      const nextAmount = customBidAmount > current ? customBidAmount : current + 2000;

      const res = await fetch('/api/bids/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: selectedBidAuctionId,
          bidderId: 'usr-test-01',
          bidderName: 'Simulated Bidder',
          bidderPhone: '+964 770 999 1234',
          bidderCity: 'Baghdad',
          amount: nextAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await syncAuctionsFromDb?.();
        addToast('success', `Simulated bid placed: ${nextAmount.toLocaleString()} IQD on ${selectedBidAuctionId}`);
      } else {
        addToast('error', data.error || 'Bid rejected');
      }
    } catch {
      addToast('error', 'Error placing simulated bid');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Quick Scenario Launchers */}
      <div className="rounded-2xl bg-gradient-to-br from-[#17223B] via-[#1E2C4C] to-[#2B3A5A] p-6 lg:p-7 text-white shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Interactive Testing Lab & Mock Sandbox</h2>
                <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  SANDBOX MODE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Generate mock Iraqi buyer accounts, merchant stores, live bidding rooms, and payment settlement flows.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePurgeTestData}
              disabled={loadingAction !== null}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              title="Deletes all generated test data from PostgreSQL and local store"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loadingAction === 'purging' ? 'Purging...' : 'Purge Test Data'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Scenario Generators */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            1-Click Preset Scenarios (Automated Pipeline Testing)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleSeedDemoData}
              disabled={loadingAction !== null}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group flex flex-col justify-between space-y-2 hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Seed Demo Marketplace
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">Run &rarr;</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Populates 3 merchants, 5 verified Iraqi buyers, 4 live auctions, and 2 settlement receipts.
              </p>
            </button>

            <button
              onClick={handleTriggerSnipingBattle}
              disabled={loadingAction !== null}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group flex flex-col justify-between space-y-2 hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  45s Sniping Battle
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">Run &rarr;</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Creates a live PS5 auction ending in 45s and injects competing bids to test the 60s soft-close reset.
              </p>
            </button>

            <button
              onClick={handleSimulateReceipt}
              disabled={loadingAction !== null}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group flex flex-col justify-between space-y-2 hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Simulate Merchant Receipt
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">Run &rarr;</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Uploads a test FIB bank transfer screenshot for a merchant awaiting settlement approval.
              </p>
            </button>
          </div>
        </div>

        {/* Live Active Entity Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="font-mono">
            <span className="text-slate-400 text-[10px] block">Live Auctions</span>
            <strong className="text-white text-base">{liveAuctions.length} Active</strong>
          </div>
          <div className="font-mono">
            <span className="text-slate-400 text-[10px] block">Merchants</span>
            <strong className="text-white text-base">{sellers.length} Stores</strong>
          </div>
          <div className="font-mono">
            <span className="text-slate-400 text-[10px] block">Buyers</span>
            <strong className="text-white text-base">{users.length} Accounts</strong>
          </div>
          <div className="font-mono">
            <span className="text-slate-400 text-[10px] block">Receipts</span>
            <strong className="text-white text-base">{(merchantReceipts || []).length} Uploaded</strong>
          </div>
        </div>
      </div>

      {/* 2. Custom Creation Forms */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Form Selector Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFormTab('buyer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFormTab === 'buyer'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Create Mock Buyer</span>
          </button>

          <button
            onClick={() => setActiveFormTab('merchant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFormTab === 'merchant'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create Mock Merchant</span>
          </button>

          <button
            onClick={() => setActiveFormTab('auction')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFormTab === 'auction'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gavel className="w-3.5 h-3.5 text-amber-600" />
            <span>Create Mock Auction</span>
          </button>

          <button
            onClick={() => setActiveFormTab('bid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFormTab === 'bid'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Live Bid</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {activeFormTab === 'buyer' && (
            /* ================= MOCK BUYER FORM ================= */
            <form onSubmit={handleCreateCustomBuyer} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Buyer Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Phone Number (Iraqi WhatsApp)</label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Governorate / City</label>
                  <select
                    value={buyerCity}
                    onChange={(e) => setBuyerCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Baghdad">Baghdad (بغداد)</option>
                    <option value="Erbil">Erbil (هەولێر)</option>
                    <option value="Basra">Basra (البصرة)</option>
                    <option value="Sulaymaniyah">Sulaymaniyah (سلێمانی)</option>
                    <option value="Duhok">Duhok (دهۆك)</option>
                    <option value="Kirkuk">Kirkuk (كركوك)</option>
                    <option value="Najaf">Najaf (النجف)</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">District / Neighborhood</label>
                  <input
                    type="text"
                    value={buyerDistrict}
                    onChange={(e) => setBuyerDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="buyer-verified"
                  checked={buyerVerified}
                  onChange={(e) => setBuyerVerified(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="buyer-verified" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as 2-Gate Verified (WhatsApp OTP confirmed + Rooftop GPS Location set)
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingAction !== null}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loadingAction === 'create-buyer' ? 'Creating...' : 'Create Mock Buyer Account'}</span>
                </button>
              </div>
            </form>
          )}

          {activeFormTab === 'merchant' && (
            /* ================= MOCK MERCHANT FORM ================= */
            <form onSubmit={handleCreateCustomMerchant} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Store / Business Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Merchant Phone (WhatsApp)</label>
                  <input
                    type="text"
                    value={merchantPhone}
                    onChange={(e) => setMerchantPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Governorate / City</label>
                  <select
                    value={merchantCity}
                    onChange={(e) => setMerchantCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Erbil">Erbil</option>
                    <option value="Baghdad">Baghdad</option>
                    <option value="Basra">Basra</option>
                    <option value="Sulaymaniyah">Sulaymaniyah</option>
                    <option value="Duhok">Duhok</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Commission Rate (% cut of won bids)</label>
                  <select
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold font-mono"
                  >
                    <option value={0.05}>5% Platform Commission</option>
                    <option value={0.07}>7% Platform Commission (Standard)</option>
                    <option value={0.10}>10% Platform Commission</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Login Username</label>
                  <input
                    type="text"
                    value={merchantUsername}
                    onChange={(e) => setMerchantUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="merchant-auto-approve"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="merchant-auto-approve" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Enable Auto-Approve Listings (Direct to LIVE room without Moderation Queue)
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingAction !== null}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Store className="w-4 h-4" />
                  <span>{loadingAction === 'create-merchant' ? 'Creating...' : 'Provision Mock Merchant Account'}</span>
                </button>
              </div>
            </form>
          )}

          {activeFormTab === 'auction' && (
            /* ================= MOCK AUCTION FORM ================= */
            <form onSubmit={handleCreateCustomAuction} className="space-y-4 max-w-2xl">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Product / Auction Title</label>
                <input
                  type="text"
                  value={auctionTitle}
                  onChange={(e) => setAuctionTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Assign to Merchant Store</label>
                  <select
                    value={auctionSellerId}
                    onChange={(e) => setAuctionSellerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.storeName} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={auctionCategory}
                    onChange={(e) => setAuctionCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Gaming & Consoles">Gaming & Consoles</option>
                    <option value="Computers & Tablets">Computers & Tablets</option>
                    <option value="Watches & Luxury">Watches & Luxury</option>
                    <option value="Home & Lifestyle">Home & Lifestyle</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Auction Live Duration</label>
                  <select
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold font-mono"
                  >
                    <option value="30s">30 Seconds (Ultra-Fast Sniping Test)</option>
                    <option value="2m">2 Minutes (Fast Live Demo)</option>
                    <option value="10m">10 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours (Standard)</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Retail Market Price (USD)</label>
                  <input
                    type="number"
                    value={auctionRetailUsd}
                    onChange={(e) => setAuctionRetailUsd(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Image CDN URL</label>
                <input
                  type="text"
                  value={auctionImageUrl}
                  onChange={(e) => setAuctionImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingAction !== null}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Gavel className="w-4 h-4" />
                  <span>{loadingAction === 'create-auction' ? 'Creating...' : 'Create Live Auction Room'}</span>
                </button>
              </div>
            </form>
          )}

          {activeFormTab === 'bid' && (
            /* ================= SIMULATE BID FORM ================= */
            <form onSubmit={handleSimulateBid} className="space-y-4 max-w-2xl">
              {liveAuctions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-2">
                  <p>No active live auctions right now to place bids on.</p>
                  <button
                    type="button"
                    onClick={handleTriggerSnipingBattle}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs"
                  >
                    Launch a 45s Live Auction First
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700">Select Active Auction Room</label>
                    <select
                      value={selectedBidAuctionId}
                      onChange={(e) => setSelectedBidAuctionId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    >
                      {liveAuctions.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.id} — {a.multilingual?.en?.title || 'Lot'} (Current: {a.currentBidIqd.toLocaleString()} IQD)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700">Custom Bid Amount (IQD) (Leave 0 for automatic increment)</label>
                    <input
                      type="number"
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                      placeholder="e.g. 500000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loadingAction !== null}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{loadingAction === 'sim-bid' ? 'Broadcasting...' : 'Broadcast Simulated Bid via WebSocket'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
