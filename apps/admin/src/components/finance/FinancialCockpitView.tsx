'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { SellerMerchant, ListingAuction } from '@/types';
import { PrintableSettlementModal } from './PrintableSettlementModal';
import {
  DollarSign,
  TrendingUp,
  Coins,
  Truck,
  CreditCard,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

export const FinancialCockpitView: React.FC = () => {
  const { auctions, sellers, addToast } = useAdminStore();

  const [marketRate, setMarketRate] = useState<number>(1510);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('all');

  // Selected Merchant for Printable PDF Modal
  const [selectedSellerForPrint, setSelectedSellerForPrint] = useState<{
    seller: SellerMerchant;
    items: any[];
    settledAmountIqd: number;
  } | null>(null);

  // Settlement Receipts
  const [receipts, setReceipts] = useState<any[]>([]);
  const [, setLoadingReceipts] = useState(false);

  // WhatsApp Alert Testing
  const [waStatus, setWaStatus] = useState<{ isConnected: boolean; connectedPhone: string | null }>({
    isConnected: false,
    connectedPhone: null,
  });
  const [testPhone, setTestPhone] = useState('07701234567');
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch exchange rate, receipts, and WhatsApp status on mount
  useEffect(() => {
    fetchExchangeRate();
    fetchReceipts();
    checkWhatsAppStatus();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      const json = await res.json();
      if (json?.data?.marketRate) {
        setMarketRate(json.data.marketRate);
      }
    } catch {}
  };

  const fetchReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const res = await fetch('/api/sellers/receipts');
      const json = await res.json();
      if (json.success && Array.isArray(json.receipts)) {
        setReceipts(json.receipts);
      }
    } catch {}
    setLoadingReceipts(false);
  };

  const checkWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const json = await res.json();
      if (json.success) {
        setWaStatus({
          isConnected: json.isConnected,
          connectedPhone: json.connectedPhone || null,
        });
      }
    } catch {}
  };

  // 1. Calculate Closed/Sold Lots
  const closedAuctions = useMemo(() => {
    return auctions.filter(
      (a: ListingAuction) =>
        a.status === 'completed' ||
        (a.status === 'live' && a.currentBidIqd && a.totalBids > 3)
    );
  }, [auctions]);

  // 2. High-Level Metrics
  const grossMerchandiseValueIqd = useMemo(() => {
    return closedAuctions.reduce((acc, a) => acc + (a.currentBidIqd || a.estimatedRetailMarketPriceIqd || 1000), 0);
  }, [closedAuctions]);

  const grossMerchandiseValueUsd = Math.round(grossMerchandiseValueIqd / marketRate);
  const platformCommissionsIqd = Math.round(grossMerchandiseValueIqd * 0.1);
  const platformCommissionsUsd = Math.round(platformCommissionsIqd / marketRate);

  const totalSettledReceiptsIqd = useMemo(() => {
    return receipts
      .filter((r) => r.status === 'approved' || r.status === 'settled')
      .reduce((acc, r) => acc + Number(r.amountIqd || 0), 0);
  }, [receipts]);

  const netMerchantPayableIqd = grossMerchandiseValueIqd - platformCommissionsIqd;
  const pendingMerchantPayoutsIqd = Math.max(0, netMerchantPayableIqd - totalSettledReceiptsIqd);

  // 3. Governorate Distribution
  const governorateStats = useMemo(() => {
    const counts: Record<string, { count: number; totalIqd: number }> = {
      Baghdad: { count: 0, totalIqd: 0 },
      Basra: { count: 0, totalIqd: 0 },
      Erbil: { count: 0, totalIqd: 0 },
      Najaf: { count: 0, totalIqd: 0 },
      Sulaymaniyah: { count: 0, totalIqd: 0 },
      Other: { count: 0, totalIqd: 0 },
    };

    closedAuctions.forEach((a) => {
      const city = a.highestBidder?.rooftopPin?.city || 'Baghdad';
      const key = Object.keys(counts).find((k) => city.toLowerCase().includes(k.toLowerCase())) || 'Other';
      const itemIqd = a.currentBidIqd || a.estimatedRetailMarketPriceIqd || 1000;
      counts[key].count += 1;
      counts[key].totalIqd += itemIqd;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      totalUsd: Math.round(data.totalIqd / marketRate),
      percent: grossMerchandiseValueIqd > 0 ? Math.round((data.totalIqd / grossMerchandiseValueIqd) * 100) : 0,
    }));
  }, [closedAuctions, grossMerchandiseValueIqd, marketRate]);

  // 4. Per-Merchant Settlements Breakdown
  const merchantSettlementData = useMemo(() => {
    return sellers.map((seller: SellerMerchant) => {
      const sellerLots = closedAuctions.filter((a) => a.sellerId === seller.id);
      const grossIqd = sellerLots.reduce((acc, a) => acc + (a.currentBidIqd || a.estimatedRetailMarketPriceIqd || 1000), 0);
      const grossUsd = Math.round(grossIqd / marketRate);
      const commissionRate = seller.commissionRate || 0.10;
      const commIqd = Math.round(grossIqd * commissionRate);
      const commUsd = Math.round(grossUsd * commissionRate);
      const netPayIqd = grossIqd - commIqd;

      const sellerReceipts = receipts.filter(
        (r) => r.sellerId === seller.id && (r.status === 'approved' || r.status === 'settled')
      );
      const settledIqd = sellerReceipts.reduce((acc, r) => acc + Number(r.amountIqd || 0), 0);
      const balanceDueIqd = Math.max(0, netPayIqd - settledIqd);

      const items = sellerLots.map((a) => {
        const itemGrossIqd = a.currentBidIqd || a.estimatedRetailMarketPriceIqd || 1000;
        const itemGrossUsd = Math.round(itemGrossIqd / marketRate);
        const itemCommIqd = Math.round(itemGrossIqd * commissionRate);
        const itemCommUsd = Math.round(itemGrossUsd * commissionRate);
        const itemTitle =
          a.multilingual?.en?.title ||
          a.multilingual?.ar?.title ||
          'Auction Item';

        return {
          id: a.id,
          title: itemTitle,
          closingPriceUsd: itemGrossUsd,
          closingPriceIqd: itemGrossIqd,
          commissionUsd: itemCommUsd,
          commissionIqd: itemCommIqd,
          netPayableUsd: itemGrossUsd - itemCommUsd,
          netPayableIqd: itemGrossIqd - itemCommIqd,
          buyerCity: a.highestBidder?.rooftopPin?.city || 'Baghdad',
          closedAt: a.auctionEndsAt ? new Date(a.auctionEndsAt).toLocaleDateString() : 'Recent',
          status: a.codStatus || 'settled',
        };
      });

      return {
        seller,
        lotsCount: sellerLots.length,
        grossUsd,
        grossIqd,
        commissionIqd: commIqd,
        netPayIqd,
        settledIqd,
        balanceDueIqd,
        items,
        isSettled: balanceDueIqd === 0 && grossIqd > 0,
      };
    });
  }, [sellers, closedAuctions, marketRate, receipts]);

  // Filtered Merchants
  const filteredMerchants = useMemo(() => {
    return merchantSettlementData.filter((item) => {
      const storeLabel = item.seller.storeName || item.seller.ownerName || '';
      const matchSearch =
        storeLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller.phone.includes(searchTerm);

      if (!matchSearch) return false;

      if (statusFilter === 'pending') return item.balanceDueIqd > 0;
      if (statusFilter === 'settled') return item.balanceDueIqd === 0 && item.grossIqd > 0;
      return true;
    });
  }, [merchantSettlementData, searchTerm, statusFilter]);

  // Export Master Audit Sheet (CSV)
  const handleExportMasterAudit = () => {
    const headers = [
      'Seller ID',
      'Merchant Store',
      'Phone',
      'Governorate',
      'Closed Lots',
      'Gross GMV (USD)',
      'Gross GMV (IQD)',
      'Zeedo Commission 10% (IQD)',
      'Net Payable (IQD)',
      'Settled Payouts (IQD)',
      'Remaining Balance Due (IQD)',
    ];

    const rows = merchantSettlementData.map((m) => {
      const storeName = m.seller.storeName || m.seller.ownerName || 'Merchant';
      return [
        m.seller.id,
        `"${storeName.replace(/"/g, '""')}"`,
        m.seller.phone,
        m.seller.city || 'Baghdad',
        m.lotsCount,
        m.grossUsd,
        m.grossIqd,
        m.commissionIqd,
        m.netPayIqd,
        m.settledIqd,
        m.balanceDueIqd,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `"ZEEDO MASTER FINANCIAL & COMMISSIONS AUDIT"`,
        `"Exported: ${new Date().toISOString()}"`,
        `"Exchange Rate Reference: 1 USD = ${marketRate} IQD"`,
        `"Total Platform GMV: $${grossMerchandiseValueUsd.toLocaleString()} (${grossMerchandiseValueIqd.toLocaleString()} IQD)"`,
        `"Total Platform Commissions (10%): ${platformCommissionsIqd.toLocaleString()} IQD"`,
        '',
        headers.join(','),
        ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zeedo_Master_Financial_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Master financial audit spreadsheet downloaded');
  };

  // Test WhatsApp Notification Dispatcher
  const handleTestWhatsAppAlert = async (type: string) => {
    setSendingTest(true);
    try {
      let payload: any = {};
      if (type === 'auction_won') {
        payload = {
          buyerPhone: testPhone,
          buyerName: 'كرار حيدر (تجريبي)',
          auctionTitle: 'Sony PlayStation 5 Pro 2TB (عراقي أصلي)',
          finalPriceUsd: 799,
          finalPriceIqd: 799 * marketRate,
          city: 'بغداد - الكرادة',
          auctionId: 'auc-demo-won',
        };
      } else if (type === 'outbid') {
        payload = {
          buyerPhone: testPhone,
          buyerName: 'علي المنصوري (تجريبي)',
          auctionTitle: 'Rolex Submariner Date 41mm',
          newBidAmountUsd: 1250,
          newBidAmountIqd: 1250 * marketRate,
          auctionId: 'auc-demo-outbid',
        };
      } else if (type === 'dispatched') {
        payload = {
          buyerPhone: testPhone,
          buyerName: 'أحمد البصري (تجريبي)',
          auctionTitle: 'Apple iPhone 16 Pro Max 256GB',
          courierName: 'شركة الزاجل للشحن السريع',
          awbNumber: 'ZED-ZJL-984210',
          codAmountIqd: 1199 * marketRate,
          city: 'البصرة - العشار',
        };
      }

      const res = await fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', `WhatsApp ${type.replace('_', ' ')} alert sent to ${testPhone}`);
      } else {
        addToast(
          'warning',
          data.isGatewayOffline
            ? 'WhatsApp Gateway offline. Scan QR code in System Settings to connect.'
            : data.error || 'Failed to dispatch alert'
        );
      }
    } catch {
      addToast('error', 'Network error connecting to WhatsApp notification service');
    }
    setSendingTest(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Coins className="w-5 h-5 text-[#B4F105]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Financial Analytics & Merchant Settlements</h1>
              <p className="text-xs text-slate-500 font-medium">
                Dual-Currency Platform GMV, 10% Closing Fees, COD Receipts & High-DPI Settlement Statements
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Parallel Exchange Rate</span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              $1 = {marketRate.toLocaleString()} IQD
            </span>
          </div>

          <button
            onClick={handleExportMasterAudit}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#B4F105]" />
            Export Master Audit (CSV)
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform GMV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales (GMV)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-900 font-['Montserrat']">
              ${grossMerchandiseValueUsd.toLocaleString()}
            </p>
            <p className="text-xs font-mono font-semibold text-slate-500">
              {grossMerchandiseValueIqd.toLocaleString()} IQD
            </p>
          </div>
          <div className="pt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1 border-t border-slate-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{closedAuctions.length} Total closed lots across Iraq</span>
          </div>
        </div>

        {/* Platform 10% Commission Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Zeedo Fees (10%)</span>
            <div className="w-6 h-6 rounded-md bg-[#FFF1F3] text-[#F83758] flex items-center justify-center font-bold text-xs">
              %
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-[#F83758] font-['Montserrat']">
              ${platformCommissionsUsd.toLocaleString()}
            </p>
            <p className="text-xs font-mono font-semibold text-slate-500">
              {platformCommissionsIqd.toLocaleString()} IQD
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1 border-t border-slate-100">
            <span>Automatic debit upon closing hammer</span>
          </div>
        </div>

        {/* Net Merchant Payables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Merchant Net Earnings</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-900 font-['Montserrat']">
              ${(grossMerchandiseValueUsd - platformCommissionsUsd).toLocaleString()}
            </p>
            <p className="text-xs font-mono font-semibold text-blue-700">
              {netMerchantPayableIqd.toLocaleString()} IQD
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1 border-t border-slate-100">
            <span>After 10% platform commission deduction</span>
          </div>
        </div>

        {/* Pending Payout Balances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Unsettled Payouts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-amber-700 font-['Montserrat']">
              {pendingMerchantPayoutsIqd.toLocaleString()} IQD
            </p>
            <p className="text-xs font-mono font-semibold text-slate-500">
              Settled: {totalSettledReceiptsIqd.toLocaleString()} IQD
            </p>
          </div>
          <div className="pt-2 text-[11px] text-amber-800 font-medium flex items-center gap-1 border-t border-slate-100">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Ready for bank/ZainCash disbursement</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Governorates Breakdown & Automated WhatsApp Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governorate Sales Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-700" />
              Regional Sales Distribution
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">By Volume</span>
          </div>

          <div className="space-y-3">
            {governorateStats.map((gov) => (
              <div key={gov.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 font-semibold">{gov.name}</span>
                  <span className="text-slate-500 font-mono">
                    ${gov.totalUsd.toLocaleString()} ({gov.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#17223B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, gov.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
            <span>Doorstep COD Delivery Success</span>
            <span className="font-bold text-emerald-700">97.4% Clear</span>
          </div>
        </div>

        {/* WhatsApp Automated Alert Dispatcher */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Automated WhatsApp Auction Alerts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time transactional messaging to Iraqi bidders & merchants via Baileys Gateway
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  waStatus.isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {waStatus.isConnected ? `CONNECTED (+${waStatus.connectedPhone})` : 'AWAITING QR SCAN'}
              </span>
            </div>
          </div>

          {/* Test Alert Dispatch Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-48">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Recipient Test Phone
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="07701234567"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#F83758]"
                />
              </div>

              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Trigger Instant Test Scenario
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={sendingTest}
                    onClick={() => handleTestWhatsAppAlert('auction_won')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  >
                    <Send className="w-3 h-3 text-emerald-600" />
                    Auction Won
                  </button>
                  <button
                    disabled={sendingTest}
                    onClick={() => handleTestWhatsAppAlert('outbid')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  >
                    <Send className="w-3 h-3 text-amber-600" />
                    Outbid Notice
                  </button>
                  <button
                    disabled={sendingTest}
                    onClick={() => handleTestWhatsAppAlert('dispatched')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  >
                    <Send className="w-3 h-3 text-blue-600" />
                    Courier AWB
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Automated triggers execute instantly on live auctions when hammer falls or when 3PL couriers accept package handoff.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Merchant Settlements & Statements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Merchant Settlement Statements & Ledgers</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review line-item sales per merchant, deduct platform fees, and print official statements.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant or store ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#F83758] focus:bg-white"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({merchantSettlementData.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Pending Balance
              </button>
              <button
                onClick={() => setStatusFilter('settled')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'settled' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Settled
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Closed Lots</th>
                <th className="py-3 px-4 text-right">Gross GMV ($)</th>
                <th className="py-3 px-4 text-right">Gross (IQD)</th>
                <th className="py-3 px-4 text-right">Zeedo Fee (10%)</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No merchant settlements match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((item) => {
                  const storeLabel = item.seller.storeName || item.seller.ownerName || 'Merchant';
                  return (
                    <tr key={item.seller.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{storeLabel}</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {item.seller.id} • {item.seller.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.seller.city || 'Baghdad'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                          {item.lotsCount} lots
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        ${item.grossUsd.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {item.grossIqd.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                        -{item.commissionIqd.toLocaleString()} د.ع
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {item.netPayIqd.toLocaleString()} د.ع
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {item.balanceDueIqd > 0 ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {item.balanceDueIqd.toLocaleString()} د.ع
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Settled ✓
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() =>
                            setSelectedSellerForPrint({
                              seller: item.seller,
                              items: item.items,
                              settledAmountIqd: item.settledIqd,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#B4F105]" />
                          Statement
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

      {/* 5. Printable Statement Modal */}
      {selectedSellerForPrint && (
        <PrintableSettlementModal
          seller={selectedSellerForPrint.seller}
          items={selectedSellerForPrint.items}
          settledAmountIqd={selectedSellerForPrint.settledAmountIqd}
          marketRate={marketRate}
          onClose={() => setSelectedSellerForPrint(null)}
        />
      )}
    </div>
  );
};
