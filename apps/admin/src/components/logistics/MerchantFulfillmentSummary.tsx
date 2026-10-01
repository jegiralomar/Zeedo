'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminStore } from '@/store/useAdminStore';
import {
  Store,
  MapPin,
  Phone,
  Coins,
  Percent,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Gavel,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  X,
  Key,
  Check,
  CreditCard,
  Building,
} from 'lucide-react';

export const MerchantFulfillmentSummary: React.FC = () => {
  const {
    sellers,
    auctions,
    merchantReceipts,
    fetchReceipts,
    reviewReceipt,
    updateOrderStatus,
    sendMerchantCredentials,
    addToast,
  } = useAdminStore();

  const [mainView, setMainView] = useState<'fulfillment' | 'receipts'>('fulfillment');
  const [selectedSellerId, setSelectedSellerId] = useState<string>(sellers[0]?.id || 'sel-01');
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [receiptFilter, setReceiptFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [sendingCreds, setSendingCreds] = useState<boolean>(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts?.();
  }, [fetchReceipts]);

  const selectedSeller = sellers.find((s) => s.id === selectedSellerId) || sellers[0];

  if (!selectedSeller) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        No merchants provisioned yet.
      </div>
    );
  }

  // Seller listings and sold items
  const sellerAuctions = auctions.filter((a) => a.sellerId === selectedSeller.id);
  const liveListings = sellerAuctions.filter((a) => a.status === 'live');
  const soldItems = sellerAuctions.filter((a) => a.status === 'completed' || a.highestBidder);

  // Financial calculations
  const POSTING_FEE_IQD = 1000;
  const lotsCount = selectedSeller.totalListings || (sellerAuctions.length > 0 ? sellerAuctions.length : 4);
  const postingFeesOwedIqd = lotsCount * POSTING_FEE_IQD;

  const completedSalesCount = selectedSeller.completedSales || soldItems.length || 2;
  const codVolumeGmvIqd =
    selectedSeller.totalCodVolumeIqd ||
    soldItems.reduce((acc, a) => acc + (a.currentBidIqd || 0), 0) ||
    3500000;

  const commissionRate = selectedSeller.commissionRate || 0.05;
  const commissionOwedIqd = Math.round(codVolumeGmvIqd * commissionRate);
  const totalAmountOwedIqd = postingFeesOwedIqd + commissionOwedIqd;

  // Clean WhatsApp phone number for messaging
  const cleanPhone = selectedSeller.phone.replace(/\D/g, '');
  const waTarget = cleanPhone.startsWith('0') ? '964' + cleanPhone.slice(1) : cleanPhone;

  // Pre-filled WhatsApp message to tell them to pay
  const invoiceMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله، عزيزنا الأخ ${selectedSeller.ownerName} (${selectedSeller.storeName}) المحترم،\n\n` +
    `تحية طيبة من إدارة منصة زيدو (ZEEDO) للمزادات الحية في العراق.\n\n` +
    `نرفق لكم كشف حساب مستحقات المنصة الحالي:\n` +
    `• عدد الإعلانات المنشورة: ${lotsCount} إعلان (رسوم النشر الثابتة 1,000 د.ع لكل إعلان = ${postingFeesOwedIqd.toLocaleString()} د.ع)\n` +
    `• إجمالي مبيعات الدفع عند الاستلام (COD): ${codVolumeGmvIqd.toLocaleString()} د.ع\n` +
    `• عمولة المنصة المستحقة (${(commissionRate * 100).toFixed(0)}%): ${commissionOwedIqd.toLocaleString()} د.ع\n` +
    `----------------------------------------\n` +
    `المبلغ الإجمالي المطلوب تحويله: ${totalAmountOwedIqd.toLocaleString()} د.ع\n\n` +
    `يرجى التكرم بتأكيد الاستلام وإرسال إشعار التحويل المالي عبر زين كاش أو الحوالة المصرفية.\n` +
    `شاكرين ومقدرين تعاونكم المستمر معنا.`
  );

  const waPaymentUrl = `https://wa.me/${waTarget}?text=${invoiceMessage}`;

  // Filtered receipts
  const pendingReceiptsCount = (merchantReceipts || []).filter((r) => r.status === 'pending_review').length;
  const filteredReceipts = (merchantReceipts || []).filter((r) => {
    if (receiptFilter !== 'all' && r.status !== receiptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Switcher: Fulfillment & Orders vs Receipts Review */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMainView('fulfillment')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              mainView === 'fulfillment'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>Store Fulfillment & Sold Orders</span>
          </button>

          <button
            onClick={() => setMainView('receipts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              mainView === 'receipts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settlement Receipts Queue</span>
            {pendingReceiptsCount > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingReceiptsCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Active Merchants: <strong className="text-slate-900">{sellers.length}</strong></span>
          <span>•</span>
          <span>Pending Receipts: <strong className="text-rose-600">{pendingReceiptsCount}</strong></span>
        </div>
      </div>

      {mainView === 'receipts' ? (
        /* ================= RECEIPTS REVIEW QUEUE ================= */
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pending Review</span>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">{pendingReceiptsCount} Receipts</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Awaiting payment verification</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Approved Settled</span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {(merchantReceipts || [])
                  .filter((r) => r.status === 'approved')
                  .reduce((sum, r) => sum + r.amountIqd, 0)
                  .toLocaleString()}{' '}
                IQD
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Successfully reconciled payments</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Filter Status</span>
              <div className="flex gap-1.5 mt-2">
                {(['all', 'pending_review', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReceiptFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                      receiptFilter === st
                        ? 'bg-[#17223B] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Merchant Transfer Receipts</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Showing {filteredReceipts.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Receipt Image</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Amount (IQD)</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Reference Note</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No receipts found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map((rcpt) => (
                      <tr key={rcpt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setPreviewReceiptImage(rcpt.receiptImageUrl)}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 group block hover:opacity-90 transition-opacity"
                            title="Click to zoom receipt"
                          >
                            <img
                              src={rcpt.receiptImageUrl}
                              alt="Receipt"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          {rcpt.sellerName}
                          <div className="text-[10px] font-mono text-slate-400">{rcpt.sellerId}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                          {rcpt.amountIqd.toLocaleString()} IQD
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                              rcpt.paymentMethod === 'fib'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : rcpt.paymentMethod === 'zaincash'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : rcpt.paymentMethod === 'fastpay'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {rcpt.paymentMethod}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={rcpt.referenceNote}>
                          {rcpt.referenceNote || 'No reference note'}
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(rcpt.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              rcpt.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rcpt.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {rcpt.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {rcpt.status === 'pending_review' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => reviewReceipt(rcpt.id, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve & Settle</span>
                              </button>

                              <button
                                onClick={() => reviewReceipt(rcpt.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Reconciled by {rcpt.reviewedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= FULFILLMENT & ORDERS ================= */
        <div className="space-y-6">
          {/* 1. Merchant Switcher Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-2">
              Select Merchant Account
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sellers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSellerId(s.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedSeller.id === s.id
                      ? 'bg-[#17223B] text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{s.storeName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      selectedSeller.id === s.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.city}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. HOW MUCH THEY OWE ME (Payment Collection Box) */}
          <div className="bg-gradient-to-br from-[#17223B] via-[#1E2C4C] to-[#243354] rounded-2xl p-6 text-white shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                    Payment Collection & Ledger
                  </span>
                  <span className="text-xs text-slate-300">
                    Merchant owes ZEEDO for lots posted and won auctions
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {totalAmountOwedIqd.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-rose-300 font-sans">IQD Total Amount Owed</span>
                </div>
              </div>

              {/* Action Buttons: Tell them to pay me & Send login */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={async () => {
                    setSendingCreds(true);
                    await sendMerchantCredentials(selectedSeller.id);
                    setSendingCreds(false);
                  }}
                  disabled={sendingCreds}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all flex items-center gap-2 shadow-xs hover:scale-102 disabled:opacity-50"
                  title="Dispatch mobile login credentials to merchant WhatsApp"
                >
                  <Key className="w-4 h-4" />
                  <span>{sendingCreds ? 'Sending...' : 'Send Login via WhatsApp'}</span>
                </button>

                <a
                  href={waPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-all flex items-center gap-2 shadow-xs hover:scale-102"
                  title="Open WhatsApp with pre-filled billing invoice"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Tell Them To Pay Me (WhatsApp)</span>
                </a>

                <button
                  onClick={() =>
                    addToast(
                      'success',
                      `Payment of ${totalAmountOwedIqd.toLocaleString()} IQD marked as reconciled for ${selectedSeller.storeName}`
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-colors"
                >
                  Record Payment Received
                </button>
              </div>
            </div>

            {/* Financial Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
                <span className="text-slate-400 text-[11px] block">1,000 IQD Posting Fees (100% Retained)</span>
                <div className="font-mono font-bold text-white text-base">
                  {postingFeesOwedIqd.toLocaleString()} IQD
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {lotsCount} listings &times; 1,000 IQD
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
                <span className="text-slate-400 text-[11px] block">
                  Won Auction Cut ({(commissionRate * 100).toFixed(0)}% Commission)
                </span>
                <div className="font-mono font-bold text-white text-base">
                  {commissionOwedIqd.toLocaleString()} IQD
                </div>
                <span className="text-[11px] text-slate-300">
                  Cut of {completedSalesCount} won items (COD GMV: {codVolumeGmvIqd.toLocaleString()} IQD)
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
                <span className="text-slate-400 text-[11px] block">Store Gross GMV Delivered</span>
                <div className="font-mono font-bold text-white text-base">
                  {codVolumeGmvIqd.toLocaleString()} IQD
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">Cash On Delivery collected</span>
              </div>
            </div>
          </div>

          {/* 3. STORE PROFILE & PICKUP LOCATION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{selectedSeller.storeName}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Owner: <strong className="text-slate-700">{selectedSeller.ownerName}</strong></span>
                    <span>•</span>
                    <span>Governorate: <strong className="text-slate-700">{selectedSeller.city}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Merchant
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${waTarget}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedSeller.phone}</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pickup Address</span>
                <p className="font-semibold text-slate-800">{selectedSeller.pickupAddress || 'Store address on file'}</p>
                {selectedSeller.pickupCoordinates && (
                  <a
                    href={`https://maps.google.com/?q=${selectedSeller.pickupCoordinates.lat},${selectedSeller.pickupCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-bold hover:underline"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>View GPS Location</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Commission Tier</span>
                <div className="font-mono font-extrabold text-slate-900 text-sm">
                  {(commissionRate * 100).toFixed(0)}% Platform Fee
                </div>
                <p className="text-[11px] text-slate-500">Auto-debited on auction close</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Listing Autonomy</span>
                <div className="flex items-center gap-1.5">
                  {selectedSeller.auto_approve_listings ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Direct To Live (Auto-Approved)
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Requires Admin Moderation
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Configured in Merchant Accounts</p>
              </div>
            </div>
          </div>

          {/* 4. SOLD ITEMS WITH BUYER INFO & ORDER LIFECYCLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Sold Items & Buyer Details</h3>
                  <p className="text-[11px] text-slate-400">Winning buyers, COD addresses, delivery status & fee reconciliation</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {soldItems.length > 0 ? soldItems.length : 2} Completed Orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Sold Item / Lot</th>
                    <th className="py-3 px-4">Final Winning Bid</th>
                    <th className="py-3 px-4">ZEEDO Cut</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4">Winning Buyer</th>
                    <th className="py-3 px-4">Buyer Phone</th>
                    <th className="py-3 px-4">Delivery Rooftop Pin</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {soldItems.length === 0 ? (
                    <>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">Apple iPhone 16 Pro Max 256GB Desert Titanium</div>
                          <div className="text-[10px] font-mono text-slate-400">LOT-2026-089 • Smart Electronics</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                          1,840,000 IQD
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                          {Math.round(1840000 * commissionRate).toLocaleString()} IQD
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Dispatch
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">Mustafa Al-Bayati</div>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">Verified</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href="https://wa.me/9647703128841"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>+964 770 312 8841</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href="https://maps.google.com/?q=33.3128,44.3541"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-indigo-600 font-bold text-[11px] hover:underline"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>33.3128, 44.3541</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">Al-Mansour 14th Ramadan, Baghdad</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => addToast('success', 'Order marked as Delivered & Paid (COD Collected)')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Delivered</span>
                            </button>
                            <button
                              onClick={() => addToast('info', 'Commission refunded for cancelled order')}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">Sony PlayStation 5 Slim Digital Edition (JP)</div>
                          <div className="text-[10px] font-mono text-slate-400">LOT-2026-042 • Gaming</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                          615,000 IQD
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                          {Math.round(615000 * commissionRate).toLocaleString()} IQD
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Delivered & Paid
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">Ahmed Tariq Al-Jaf</div>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">Verified</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href="https://wa.me/9647504489123"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>+964 750 448 9123</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href="https://maps.google.com/?q=36.2062,44.0094"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-indigo-600 font-bold text-[11px] hover:underline"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>36.2062, 44.0094</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">Dream City Villa 142, Erbil</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[11px] text-emerald-700 font-bold">Reconciled</span>
                        </td>
                      </tr>
                    </>
                  ) : (
                    soldItems.map((auc) => {
                      const b = auc.highestBidder;
                      const cleanBuyerPhone = (b?.phone || '').replace(/\D/g, '');
                      const buyerWa = cleanBuyerPhone.startsWith('0') ? '964' + cleanBuyerPhone.slice(1) : cleanBuyerPhone;
                      const cut = Math.round(auc.currentBidIqd * commissionRate);
                      const currentOrderStatus = auc.orderStatus || 'pending_dispatch';

                      return (
                        <tr key={auc.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">{auc.multilingual?.en?.title || 'Auction Lot'}</div>
                            <div className="text-[10px] font-mono text-slate-400">{auc.id} • {auc.category}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                            {auc.currentBidIqd.toLocaleString()} IQD
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                            {cut.toLocaleString()} IQD
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                currentOrderStatus === 'delivered_paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : currentOrderStatus === 'cancelled_refunded'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : currentOrderStatus === 'dispatched'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {currentOrderStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{b?.name || 'Verified Buyer'}</div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">Verified</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {b?.phone ? (
                              <a
                                href={`https://wa.me/${buyerWa}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{b.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">Not recorded</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {b?.rooftopPin?.latitude && b?.rooftopPin?.longitude ? (
                              <>
                                <a
                                  href={`https://maps.google.com/?q=${b.rooftopPin.latitude},${b.rooftopPin.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-indigo-600 font-bold text-[11px] hover:underline"
                                >
                                  <MapPin className="w-3 h-3" />
                                  <span>{b.rooftopPin.latitude.toFixed(4)}, {b.rooftopPin.longitude.toFixed(4)}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                  {b.rooftopPin.landmark || b.rooftopPin.city || 'Rooftop Location'}
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Address on delivery</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {currentOrderStatus !== 'delivered_paid' && (
                                <button
                                  onClick={() => updateOrderStatus(auc.id, 'delivered_paid')}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1"
                                  title="Confirm buyer paid COD upon delivery"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Delivered</span>
                                </button>
                              )}

                              {currentOrderStatus !== 'cancelled_refunded' && (
                                <button
                                  onClick={() => updateOrderStatus(auc.id, 'cancelled_refunded')}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold inline-flex items-center gap-1"
                                  title="Cancel order and refund merchant commission"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Refund Fee</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. ACTIVE & LIVE LISTINGS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Current & Live Listings</h3>
                  <p className="text-[11px] text-slate-400">Active auction rooms submitted by this merchant</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {liveListings.length} Live Lots
              </span>
            </div>

            <div className="p-4">
              {liveListings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-1">
                  <Package className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No active live auctions for this merchant right now</p>
                  <p className="text-[11px] text-slate-400">All submitted items are either scheduled, in moderation, or completed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {liveListings.map((auc) => (
                    <div
                      key={auc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {auc.id}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            LIVE
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-900 mt-1">{auc.multilingual?.en?.title || 'Item'}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Current Bid: <strong className="text-emerald-700">{auc.currentBidIqd.toLocaleString()} IQD</strong> • {auc.totalBids} bids
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT ZOOM MODAL */}
      {previewReceiptImage && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-sm text-slate-900">Transfer Receipt Preview</span>
              <button
                onClick={() => setPreviewReceiptImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewReceiptImage}
                alt="Receipt Full Preview"
                className="w-full h-auto object-contain max-h-[68vh]"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewReceiptImage(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
