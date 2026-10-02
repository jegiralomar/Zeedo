'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Gavel,
  Trophy,
  Coins,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { UserBuyer } from '@/types';

interface Props {
  buyer: UserBuyer;
  onBack: () => void;
}

export const BuyerProfileDetail: React.FC<Props> = ({ buyer, onBack }) => {
  const { auctions, addToast, logAuditEvent } = useAdminStore();
  const [isBlocked, setIsBlocked] = useState(buyer.isBlocked || false);
  const [isToggling, setIsToggling] = useState(false);

  // All bids by this buyer across all auctions in store
  const buyerBids = auctions.flatMap((a) =>
    (a.bidsHistory || [])
      .filter((b) => b.bidderId === buyer.id || b.bidderName === buyer.name)
      .map((b) => ({
        ...b,
        auctionId: a.id,
        auctionTitle: a.multilingual?.en?.title || a.id,
      }))
  );

  // Won auctions
  const wonAuctions = auctions.filter(
    (a) =>
      a.status === 'completed' &&
      (a.highestBidder?.id === buyer.id || a.highestBidder?.phone === buyer.phone)
  );

  const handleToggleBlock = async () => {
    setIsToggling(true);
    const nextBlocked = !isBlocked;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zeedo_admin_session') : '';
      await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: buyer.id, isBlocked: nextBlocked }),
      });
      setIsBlocked(nextBlocked);
      addToast(
        nextBlocked ? 'warning' : 'success',
        nextBlocked
          ? `Buyer "${buyer.name}" BLOCKED — cannot log in or bid.`
          : `Buyer "${buyer.name}" UNBLOCKED — account restored.`
      );
      logAuditEvent({
        action: nextBlocked ? 'BUYER_BLOCKED' : 'BUYER_UNBLOCKED',
        category: 'buyers',
        targetId: buyer.id,
        description: `${nextBlocked ? 'Blocked' : 'Unblocked'} buyer: ${buyer.name} (${buyer.phone})`,
        diff: { after: { isBlocked: nextBlocked } },
      });
    } catch {
      addToast('error', 'Failed to update block status.');
    }
    setIsToggling(false);
  };

  const totalSpentIqd = buyer.totalSpentIqd ?? wonAuctions.reduce((s, a) => s + a.currentBidIqd, 0);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Buyers
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shrink-0 overflow-hidden border-2 border-slate-200">
              {buyer.avatar || buyer.avatarUrl ? (
                <img src={buyer.avatar || buyer.avatarUrl} alt={buyer.name} className="w-full h-full object-cover" />
              ) : (
                <span>{buyer.name?.charAt(0)?.toUpperCase() || 'B'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">{buyer.name}</h2>
                {isBlocked ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">BLOCKED</span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
                )}
                {buyer.gender && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 capitalize">{buyer.gender}</span>
                )}
              </div>
              <p className="text-sm text-slate-400 font-mono mt-0.5">{buyer.id}</p>
            </div>
          </div>

          <button
            onClick={handleToggleBlock}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50 ${
              isBlocked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            {isBlocked ? <><ShieldCheck className="w-4 h-4" /> Unblock Account</> : <><ShieldBan className="w-4 h-4" /> Block Account</>}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Phone, label: 'Phone', value: buyer.phone, mono: true },
            { icon: MapPin, label: 'City / Governorate', value: buyer.city || '—' },
            { icon: Calendar, label: 'Registered', value: buyer.joinedAt ? new Date(buyer.joinedAt).toLocaleDateString('en-GB') : '—' },
          ].map(({ icon: Icon, label, value, mono }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
              </div>
            </div>
          ))}
          {buyer.rooftopPin && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 sm:col-span-2 lg:col-span-3">
              <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Delivery Address (GPS Pin)</p>
                <p className="text-sm font-semibold text-indigo-900">{buyer.rooftopPin.addressText || buyer.rooftopPin.landmark || '—'}</p>
                {buyer.rooftopPin.latitude && (
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">
                    {buyer.rooftopPin.latitude.toFixed(5)}, {buyer.rooftopPin.longitude.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Gavel, color: 'blue', value: buyer.totalBids || buyerBids.length, label: 'Total Bids Placed' },
          { icon: Trophy, color: 'amber', value: buyer.totalWins || wonAuctions.length, label: 'Auctions Won' },
          { icon: Coins, color: 'emerald', value: `${totalSpentIqd.toLocaleString()} IQD`, label: 'Total Spent' },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center">
            <Icon className={`w-6 h-6 text-${color}-500 mx-auto mb-2`} />
            <p className="text-2xl font-black text-slate-900 font-mono">{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Bids History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><Gavel className="w-4 h-4 text-slate-400" /><h3 className="font-bold text-slate-800">Bids History</h3></div>
          <span className="text-xs text-slate-400 font-mono">{buyerBids.length} bids</span>
        </div>
        {buyerBids.length === 0 ? (
          <div className="py-12 text-center text-slate-400"><Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No bids found in loaded data.</p></div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {buyerBids.slice(0, 50).map((bid, i) => (
              <div key={bid.id || i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50">
                <div><p className="text-sm font-semibold text-slate-800">{bid.auctionTitle}</p><p className="text-xs text-slate-400 font-mono">{bid.auctionId}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-emerald-700 font-mono">{bid.amountIqd?.toLocaleString()} IQD</p><p className="text-xs text-slate-400">{bid.timestamp ? new Date(bid.timestamp).toLocaleDateString('en-GB') : '—'}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Won Auctions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /><h3 className="font-bold text-slate-800">Won Auctions</h3></div>
          <span className="text-xs text-slate-400 font-mono">{wonAuctions.length} won</span>
        </div>
        {wonAuctions.length === 0 ? (
          <div className="py-12 text-center text-slate-400"><Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No won auctions in loaded data.</p></div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {wonAuctions.map((a) => (
              <div key={a.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50">
                <div><p className="text-sm font-semibold text-slate-800">{a.multilingual?.en?.title || a.id}</p><p className="text-xs text-slate-400 font-mono">{a.id}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-amber-700 font-mono">{a.currentBidIqd.toLocaleString()} IQD</p><p className="text-xs text-slate-400">{new Date(a.auctionEndsAt).toLocaleDateString('en-GB')}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
