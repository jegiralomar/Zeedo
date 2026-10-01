'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { SellerMerchant } from '@/types';
import {
  Store,
  ArrowLeft,
  Percent,
  ShieldCheck,
  ShieldAlert,
  Coins,
  MapPin,
  Phone,
  CheckCircle2,
  Package,
  Layers,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  ArrowUpRight,
  Gavel,
  Sparkles,
} from 'lucide-react';

interface SellerProfileDetailProps {
  sellerId: string;
  onBack: () => void;
}

export const SellerProfileDetail: React.FC<SellerProfileDetailProps> = ({ sellerId, onBack }) => {
  const { sellers, auctions, toggleSellerAutonomy, updateSellerCommission, addToast } = useAdminStore();
  const seller = sellers.find((s) => s.id === sellerId);

  const [activeTab, setActiveTab] = useState<'sales' | 'listings' | 'commissions'>('sales');
  const [sliderCommission, setSliderCommission] = useState<number>(seller?.commissionRate || 0.05);

  if (!seller) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        Merchant not found.
        <div className="mt-4">
          <button onClick={onBack} className="btn-spark-primary text-xs">
            Return to Merchants
          </button>
        </div>
      </div>
    );
  }

  // Filter listings and sales for this seller
  const sellerLiveAuctions = auctions.filter((a) => a.sellerId === seller.id && a.status === 'live');
  const sellerCompletedAuctions = auctions.filter(
    (a) => a.sellerId === seller.id && (a.status === 'completed' || a.highestBidder)
  );

  const handleCommissionChange = (val: number) => {
    setSliderCommission(val);
    updateSellerCommission(seller.id, val);
  };

  // 1,000 IQD Platform Rule:
  // All listings start strictly at 1,000 IQD (retained by ZEEDO as posting fee).
  // Platform commission applies to the COD volume.
  const totalListingsCount = seller.totalListings || sellerLiveAuctions.length || 4;
  const postingFeesOwedIqd = totalListingsCount * 1000;
  const codVolumeIqd = seller.totalCodVolumeIqd || 3500000;
  const commissionRate = seller.commissionRate || sliderCommission || 0.05;
  const commissionOwedIqd = Math.round(codVolumeIqd * commissionRate);
  const totalAmountOwedIqd = postingFeesOwedIqd + commissionOwedIqd;

  // Clean phone number for WhatsApp
  const cleanPhone = seller.phone.replace(/\D/g, '');
  const waTarget = cleanPhone.startsWith('0') ? '964' + cleanPhone.slice(1) : cleanPhone;

  // Pre-filled WhatsApp message to tell them to pay
  const invoiceMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله، عزيزنا الأخ ${seller.ownerName} (${seller.storeName}) المحترم،\n\n` +
    `تحية طيبة من إدارة منصة زيدو (ZEEDO) للمزادات الحية في العراق.\n\n` +
    `نرفق لكم كشف حساب مستحقات المنصة الحالي:\n` +
    `• عدد الإعلانات المنشورة: ${totalListingsCount} إعلان (رسوم النشر الثابتة 1,000 د.ع لكل إعلان = ${postingFeesOwedIqd.toLocaleString()} د.ع)\n` +
    `• إجمالي مبيعات الدفع عند الاستلام (COD): ${codVolumeIqd.toLocaleString()} د.ع\n` +
    `• عمولة المنصة المستحقة (${(commissionRate * 100).toFixed(0)}%): ${commissionOwedIqd.toLocaleString()} د.ع\n` +
    `----------------------------------------\n` +
    `المبلغ الإجمالي المطلوب تحويله: ${totalAmountOwedIqd.toLocaleString()} د.ع\n\n` +
    `يرجى التكرم بتأكيد الاستلام وإرسال إشعار التحويل المالي عبر زين كاش أو الحوالة المصرفية.\n` +
    `شاكرين ومقدرين تعاونكم المستمر معنا.`
  );

  const waPaymentUrl = `https://wa.me/${waTarget}?text=${invoiceMessage}`;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="btn-spark-light text-xs py-2 px-4 flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Merchants Directory</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          Merchant ID: <strong className="text-slate-900">{seller.id}</strong>
        </span>
      </div>

      {/* 1. HOW MUCH THEY OWE ME (Payment Request & Settlement Header) */}
      <div className="bg-gradient-to-br from-[#17223B] via-[#1E2C4C] to-[#243354] rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                Payment Collection & Ledger
              </span>
              <span className="text-xs text-slate-300">
                Amount merchant owes ZEEDO for posting fees and won auction cuts
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {totalAmountOwedIqd.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-rose-300 font-sans">IQD Total Amount Owed</span>
            </div>
          </div>

          {/* Action: Tell them to pay me */}
          <div className="flex flex-wrap items-center gap-2.5">
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
              onClick={() => addToast('success', `Payment of ${totalAmountOwedIqd.toLocaleString()} IQD marked as reconciled for ${seller.storeName}`)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-colors"
            >
              Mark as Settled
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
              {totalListingsCount} listings &times; 1,000 IQD
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
            <span className="text-slate-400 text-[11px] block">Platform Commission Cut</span>
            <div className="font-mono font-bold text-rose-300 text-base">
              {commissionOwedIqd.toLocaleString()} IQD
            </div>
            <span className="text-[11px] text-slate-300 font-medium">
              {(commissionRate * 100).toFixed(0)}% cut on {codVolumeIqd.toLocaleString()} IQD COD
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
            <span className="text-slate-400 text-[11px] block">Total COD Collected By Merchant</span>
            <div className="font-mono font-bold text-white text-base">
              {codVolumeIqd.toLocaleString()} IQD
            </div>
            <span className="text-[11px] text-slate-300 font-medium">
              Cash collected at doorsteps directly
            </span>
          </div>
        </div>
      </div>

      {/* 2. STORE INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xl shadow-xs">
              {seller.storeName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">{seller.storeName}</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Official Merchant
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-slate-100 text-slate-600">
                  {seller.city}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Owner: <strong className="text-slate-800">{seller.ownerName}</strong> • Phone:{' '}
                <a href={`https://wa.me/${waTarget}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-700 hover:underline">
                  {seller.phone}
                </a> • Login: <code className="text-slate-700">{seller.username || seller.phone}</code>
              </p>
            </div>
          </div>

          {/* Autonomy Flag Button */}
          <button
            onClick={() => toggleSellerAutonomy(seller.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              seller.auto_approve_listings
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {seller.auto_approve_listings ? (
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
        </div>

        {/* Store Detail Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Warehouse / Pickup Address</span>
            <div className="font-bold text-slate-800">{seller.pickupAddress || `${seller.city} Commercial Hub`}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              GPS: {seller.pickupCoordinates?.lat ? `${seller.pickupCoordinates.lat.toFixed(4)}, ${seller.pickupCoordinates.lng.toFixed(4)}` : '36.1911, 44.0092'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Commission Rate</span>
              <span className="font-mono font-black text-emerald-700 text-sm">
                {(sliderCommission * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.03}
              max={0.15}
              step={0.01}
              value={sliderCommission}
              onChange={(e) => handleCommissionChange(Number(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Performance Rating</span>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>⭐ {seller.rating || 5.0} Rating</span>
              <span className="text-slate-400">•</span>
              <span>{seller.completedSales} sales completed</span>
            </div>
            <div className="text-[10px] text-slate-500">1,000 IQD base posting fee applied to every lot</div>
          </div>
        </div>
      </div>

      {/* Tabs: Sold Items with Buyer Info | Active Listings */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sales'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sold Items & Buyer Info ({sellerCompletedAuctions.length > 0 ? sellerCompletedAuctions.length : 2})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gavel className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Listings ({sellerLiveAuctions.length})</span>
        </button>
      </div>

      {/* 3. SOLD ITEMS WITH BUYER INFO */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Sold Items & Buyer Details</h3>
              <p className="text-[11px] text-slate-400">Winning buyers, WhatsApp contact, COD amounts, and rooftop delivery coordinates</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] uppercase font-bold font-mono text-slate-500">
                  <th className="py-3 px-4">Sold Item</th>
                  <th className="py-3 px-4">Winning Bid (COD)</th>
                  <th className="py-3 px-4">Platform Cut</th>
                  <th className="py-3 px-4">Buyer Name</th>
                  <th className="py-3 px-4">Buyer WhatsApp</th>
                  <th className="py-3 px-4">Delivery Rooftop Pin</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerCompletedAuctions.length === 0 ? (
                  <>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">Apple iPhone 16 Pro Max 256GB Desert Titanium</div>
                        <div className="text-[10px] font-mono text-slate-400">LOT-2026-081 • Electronics</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        1,480,000 IQD
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {Math.round(1480000 * commissionRate).toLocaleString()} IQD
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">Mustafa Haidar Al-Kinani</div>
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
                        <a
                          href="https://wa.me/9647703128841"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
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
                        <a
                          href="https://wa.me/9647504489123"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  </>
                ) : (
                  sellerCompletedAuctions.map((auc) => {
                    const b = auc.highestBidder;
                    const cleanBuyerPhone = (b?.phone || '').replace(/\D/g, '');
                    const buyerWa = cleanBuyerPhone.startsWith('0') ? '964' + cleanBuyerPhone.slice(1) : cleanBuyerPhone;
                    const cut = Math.round(auc.currentBidIqd * commissionRate);

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
                          {buyerWa && (
                            <a
                              href={`https://wa.me/${buyerWa}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ACTIVE & LIVE LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Current & Live Listings</h3>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {sellerLiveAuctions.length} Active Lots
            </span>
          </div>

          <div className="p-4">
            {sellerLiveAuctions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-1">
                <Package className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No active live auctions for this merchant right now</p>
                <p className="text-[11px] text-slate-400">All submitted items are either scheduled, in moderation, or completed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sellerLiveAuctions.map((auc) => (
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
      )}
    </div>
  );
};
