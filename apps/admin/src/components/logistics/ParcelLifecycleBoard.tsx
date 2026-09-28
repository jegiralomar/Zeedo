'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { ListingAuction, ParcelDeliveryStage, DeliveryAttempt } from '@/types';
import {
  Truck,
  RotateCcw,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Printer,
  MessageSquare,
} from 'lucide-react';

interface ParcelLifecycleBoardProps {
  onSelectForPrint: (auctionId: string) => void;
}

export const ParcelLifecycleBoard: React.FC<ParcelLifecycleBoardProps> = ({
  onSelectForPrint,
}) => {
  const { auctions, updateParcelStage, logDeliveryAttempt, addToast } = useAdminStore();

  const completedAuctions = auctions.filter(
    (a) => a.status === 'completed' || a.codStatus
  );

  // Modal State for logging courier delivery attempt
  const [selectedAuctionForAttempt, setSelectedAuctionForAttempt] =
    useState<ListingAuction | null>(null);
  const [attemptStatus, setAttemptStatus] =
    useState<DeliveryAttempt['status']>('unreachable');
  const [driverNote, setDriverNote] = useState('');

  // Quick filter for search/city
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');

  const filteredAuctions = completedAuctions.filter((auc) => {
    const matchesSearch =
      auc.multilingual.en.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (auc.packageAwbId && auc.packageAwbId.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (auc.highestBidder?.name && auc.highestBidder.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
      auc.id.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCity =
      selectedGovernorate === 'all' ||
      auc.highestBidder?.rooftopPin?.city.toLowerCase() === selectedGovernorate.toLowerCase();

    return matchesSearch && matchesCity;
  });

  // Buckets for 4 Lifecycle Stages
  const readyParcels = filteredAuctions.filter(
    (a) => !a.deliveryStage || a.deliveryStage === 'ready_for_dispatch'
  );
  const outForDeliveryParcels = filteredAuctions.filter(
    (a) => a.deliveryStage === 'out_for_delivery'
  );
  const deliveredParcels = filteredAuctions.filter(
    (a) => a.deliveryStage === 'delivered_paid'
  );
  const failedRthParcels = filteredAuctions.filter(
    (a) => a.deliveryStage === 'failed_rth'
  );

  // Financial Metrics
  const inFlightCodSum = [...readyParcels, ...outForDeliveryParcels].reduce(
    (sum, a) => sum + a.currentBidIqd,
    0
  );
  const deliveredCodSum = deliveredParcels.reduce((sum, a) => sum + a.currentBidIqd, 0);
  const failedCodSum = failedRthParcels.reduce((sum, a) => sum + a.currentBidIqd, 0);
  const totalParcelsCount = completedAuctions.length;
  const deliverySuccessRate =
    totalParcelsCount > 0
      ? Math.round((deliveredParcels.length / (deliveredParcels.length + failedRthParcels.length || 1)) * 100)
      : 100;

  const handleOpenAttemptModal = (auc: ListingAuction) => {
    setSelectedAuctionForAttempt(auc);
    setAttemptStatus('unreachable');
    setDriverNote('');
  };

  const handleSaveAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuctionForAttempt) return;

    if (!driverNote.trim()) {
      addToast('error', 'Please record a courier driver note describing the doorstep attempt');
      return;
    }

    logDeliveryAttempt(selectedAuctionForAttempt.id, {
      status: attemptStatus,
      driverNote: driverNote.trim(),
    });

    setSelectedAuctionForAttempt(null);
    setDriverNote('');
  };

  return (
    <div className="space-y-6">
      {/* 4 Financial & Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6C7E75]">
            <span className="font-bold uppercase tracking-wider">In-Flight COD Float</span>
            <Clock className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="text-xl font-black font-mono text-[#0B130F]">
            {inFlightCodSum.toLocaleString()} IQD
          </div>
          <p className="text-[11px] text-[#6C7E75]">
            {readyParcels.length + outForDeliveryParcels.length} parcels in transit with couriers
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#22C55E]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#15803d]">
            <span className="font-bold uppercase tracking-wider">COD Collected & Paid</span>
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
          </div>
          <div className="text-xl font-black font-mono text-[#15803d]">
            {deliveredCodSum.toLocaleString()} IQD
          </div>
          <p className="text-[11px] text-[#15803d]/80 font-medium">
            {deliveredParcels.length} parcels cleared at doorstep ({deliverySuccessRate}% success)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E0F2FE]/60 border border-[#0284c7]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#0284c7]">
            <span className="font-bold uppercase tracking-wider">Active Courier Vans</span>
            <Truck className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="text-xl font-black font-mono text-[#0284c7]">
            {outForDeliveryParcels.length} Out on Route
          </div>
          <p className="text-[11px] text-[#6C7E75]">
            Al-Zajil & Erbil Speed dispatched
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FEE2E2]/60 border border-[#EF4444]/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#EF4444]">
            <span className="font-bold uppercase tracking-wider">Refused / Return-to-Hub</span>
            <RotateCcw className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-xl font-black font-mono text-[#EF4444]">
            {failedRthParcels.length} Failed ({failedCodSum.toLocaleString()} IQD)
          </div>
          <p className="text-[11px] text-[#EF4444]/80 font-medium">
            3-attempt protocol exhausted or refused
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search AWB #, buyer name, or listing title..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs text-[#0B130F] w-72 focus:outline-hidden focus:border-[#072F1F]"
          />

          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs text-[#0B130F] font-bold focus:outline-hidden focus:border-[#072F1F]"
          >
            <option value="all">All Governorates</option>
            <option value="Erbil">Erbil</option>
            <option value="Baghdad">Baghdad</option>
            <option value="Sulaymaniyah">Sulaymaniyah</option>
            <option value="Duhok">Duhok</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6C7E75]">
          <span className="font-bold text-[#0B130F] font-mono">{filteredAuctions.length}</span>
          <span>Parcels tracked in Iraqi COD network</span>
        </div>
      </div>

      {/* 4-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {/* STAGE 1: READY FOR DISPATCH */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-[#E9EFEF] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
              <span className="text-xs font-black text-[#0B130F] uppercase tracking-wider">
                1. Ready for Dispatch
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F4F6F5] text-[#072F1F]">
              {readyParcels.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyParcels.map((auc) => (
              <ParcelCard
                key={auc.id}
                auction={auc}
                currentStage="ready_for_dispatch"
                onAdvance={() => updateParcelStage(auc.id, 'out_for_delivery', 'Handed over to courier driver')}
                onLogAttempt={() => handleOpenAttemptModal(auc)}
                onPrint={() => onSelectForPrint(auc.id)}
              />
            ))}

            {readyParcels.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl bg-white/50">
                No parcels awaiting dispatch.
              </div>
            )}
          </div>
        </div>

        {/* STAGE 2: OUT FOR DELIVERY */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-[#0284c7]/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-pulse"></div>
              <span className="text-xs font-black text-[#0284c7] uppercase tracking-wider">
                2. Out for Delivery
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284c7]">
              {outForDeliveryParcels.length}
            </span>
          </div>

          <div className="space-y-3">
            {outForDeliveryParcels.map((auc) => (
              <ParcelCard
                key={auc.id}
                auction={auc}
                currentStage="out_for_delivery"
                onAdvance={() => updateParcelStage(auc.id, 'delivered_paid', 'Cash collected and verified at doorstep')}
                onLogAttempt={() => handleOpenAttemptModal(auc)}
                onPrint={() => onSelectForPrint(auc.id)}
              />
            ))}

            {outForDeliveryParcels.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl bg-white/50">
                No vans currently out on route.
              </div>
            )}
          </div>
        </div>

        {/* STAGE 3: DELIVERED & PAID */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-[#22C55E]/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#15803d]"></div>
              <span className="text-xs font-black text-[#15803d] uppercase tracking-wider">
                3. Delivered & Paid
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d]">
              {deliveredParcels.length}
            </span>
          </div>

          <div className="space-y-3">
            {deliveredParcels.map((auc) => (
              <ParcelCard
                key={auc.id}
                auction={auc}
                currentStage="delivered_paid"
                onAdvance={() => {}}
                onLogAttempt={() => handleOpenAttemptModal(auc)}
                onPrint={() => onSelectForPrint(auc.id)}
              />
            ))}

            {deliveredParcels.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl bg-white/50">
                No delivered parcels yet.
              </div>
            )}
          </div>
        </div>

        {/* STAGE 4: RETURN TO HUB (RTH) */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-[#EF4444]/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
              <span className="text-xs font-black text-[#EF4444] uppercase tracking-wider">
                4. Failed / Return-to-Hub
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#EF4444]">
              {failedRthParcels.length}
            </span>
          </div>

          <div className="space-y-3">
            {failedRthParcels.map((auc) => (
              <ParcelCard
                key={auc.id}
                auction={auc}
                currentStage="failed_rth"
                onAdvance={() => updateParcelStage(auc.id, 'ready_for_dispatch', 'Re-dispatch requested after buyer dispute resolved')}
                onLogAttempt={() => handleOpenAttemptModal(auc)}
                onPrint={() => onSelectForPrint(auc.id)}
              />
            ))}

            {failedRthParcels.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl bg-white/50">
                Zero return-to-hub parcels!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Record Delivery Attempt & Driver Feedback */}
      {selectedAuctionForAttempt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E9EFEF] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0B130F]">
                    Log Doorstep Delivery Attempt
                  </h3>
                  <span className="text-[11px] font-mono text-[#6C7E75]">
                    AWB: {selectedAuctionForAttempt.packageAwbId || selectedAuctionForAttempt.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAuctionForAttempt(null)}
                className="text-[#6C7E75] hover:text-[#0B130F] p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6C7E75]">Buyer:</span>
                <span className="font-bold text-[#0B130F]">{selectedAuctionForAttempt.highestBidder?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6C7E75]">Phone:</span>
                <span className="font-mono text-[#0B130F]">{selectedAuctionForAttempt.highestBidder?.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6C7E75]">COD to Collect:</span>
                <span className="font-mono font-extrabold text-[#15803d]">
                  {selectedAuctionForAttempt.currentBidIqd.toLocaleString()} IQD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6C7E75]">Attempt Count:</span>
                <span className="font-mono font-bold text-[#0284c7]">
                  Attempt {(selectedAuctionForAttempt.deliveryAttempts?.length || 0) + 1} of 3
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveAttempt} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0B130F] block">
                  Delivery Attempt Status / Outcome:
                </label>
                <select
                  value={attemptStatus}
                  onChange={(e) => setAttemptStatus(e.target.value as DeliveryAttempt['status'])}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs font-bold text-[#0B130F] focus:outline-hidden focus:border-[#072F1F]"
                >
                  <option value="unreachable">Unreachable (Phone Switched Off / No Answer)</option>
                  <option value="rescheduled">Buyer Rescheduled (Delayed to Later / Tomorrow)</option>
                  <option value="refused_cash">Refused Cash Payment (Doorstep Rejection)</option>
                  <option value="wrong_address">Wrong Address / Landmark Not Located</option>
                  <option value="delivered">Delivered Successfully & Physical Cash Collected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0B130F] block">
                  Courier Driver Field Note:
                </label>
                <textarea
                  rows={3}
                  value={driverNote}
                  onChange={(e) => setDriverNote(e.target.value)}
                  placeholder="e.g. Driver arrived at Italian Village villa 42B. Buyer asked to deliver after 5pm because they were at work..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E9EFEF] text-xs text-[#0B130F] focus:outline-hidden focus:border-[#072F1F]"
                />
              </div>

              {/* Escalation Warning */}
              {((selectedAuctionForAttempt.deliveryAttempts?.length || 0) + 1 >= 3 ||
                attemptStatus === 'refused_cash') &&
                attemptStatus !== 'delivered' && (
                  <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">AUTOMATIC RETURN-TO-HUB ESCALATION</span>
                      <p className="text-[11px] text-[#EF4444]/90 mt-0.5">
                        Recording this attempt will exhaust the 3-attempt protocol or process a cash refusal. The parcel will be moved to <strong>Return-to-Hub (RTH)</strong> and the seller warehouse will be notified.
                      </p>
                    </div>
                  </div>
                )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuctionForAttempt(null)}
                  className="btn-spark-light text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-spark-primary text-xs py-2 px-5 font-bold"
                >
                  Confirm & Update Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Individual Parcel Card on Kanban
interface ParcelCardProps {
  auction: ListingAuction;
  currentStage: ParcelDeliveryStage;
  onAdvance: () => void;
  onLogAttempt: () => void;
  onPrint: () => void;
}

const ParcelCard: React.FC<ParcelCardProps> = ({
  auction,
  currentStage,
  onAdvance,
  onLogAttempt,
  onPrint,
}) => {
  const attemptsCount = auction.deliveryAttempts?.length || 0;
  const lastAttempt = auction.deliveryAttempts?.[attemptsCount - 1];

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E9EFEF] hover:border-[#072F1F]/40 shadow-xs transition-all space-y-3">
      {/* Top Header: AWB + COD Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#072F1F] bg-[#F4F6F5] px-2 py-0.5 rounded-md">
          {auction.packageAwbId || auction.id}
        </span>
        <span className="font-mono text-xs font-black text-[#15803d]">
          {auction.currentBidIqd.toLocaleString()} IQD
        </span>
      </div>

      {/* Item Title & Seller */}
      <div>
        <h4 className="font-bold text-xs text-[#0B130F] line-clamp-1">
          {auction.multilingual.en.title}
        </h4>
        <span className="text-[10px] text-[#6C7E75]">Seller: {auction.sellerName}</span>
      </div>

      {/* Buyer & Landmark Info */}
      <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0B130F] flex items-center gap-1">
            <User className="w-3 h-3 text-[#6C7E75]" />
            <span>{auction.highestBidder?.name || 'Walk-in Buyer'}</span>
          </span>
          <span className="text-[#072F1F] font-mono">{auction.highestBidder?.phone}</span>
        </div>

        <div className="flex items-center gap-1 text-[#6C7E75] text-[10px]">
          <MapPin className="w-3 h-3 text-[#0284c7] shrink-0" />
          <span className="truncate">
            {auction.highestBidder?.rooftopPin?.city} &bull; {auction.highestBidder?.rooftopPin?.landmark}
          </span>
        </div>
      </div>

      {/* Assigned Courier Driver */}
      {auction.courierDriverName && (
        <div className="flex items-center justify-between text-[10px] text-[#6C7E75] font-mono px-1">
          <span className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-[#0284c7]" />
            <span>{auction.courierDriverName}</span>
          </span>
          <span>{auction.courierDriverPhone}</span>
        </div>
      )}

      {/* Delivery Attempt Badge */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E9EFEF]">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
              currentStage === 'delivered_paid'
                ? 'bg-[#DCFCE7] text-[#15803d]'
                : currentStage === 'failed_rth'
                ? 'bg-[#FEE2E2] text-[#EF4444]'
                : attemptsCount > 0
                ? 'bg-[#FFEDD5] text-[#F97316]'
                : 'bg-[#F4F6F5] text-[#6C7E75]'
            }`}
          >
            {currentStage === 'delivered_paid'
              ? 'Delivered'
              : currentStage === 'failed_rth'
              ? 'RTH (Failed)'
              : `Attempt ${attemptsCount}/3`}
          </span>

          {lastAttempt && (
            <span className="text-[10px] text-[#6C7E75] italic truncate max-w-[120px]" title={lastAttempt.driverNote}>
              &quot;{lastAttempt.driverNote}&quot;
            </span>
          )}
        </div>

        <button
          onClick={onPrint}
          className="text-[#6C7E75] hover:text-[#072F1F] p-1 rounded-md hover:bg-[#F4F6F5]"
          title="Print 4x6 Thermal AWB"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Buttons depending on Stage */}
      <div className="pt-1 flex items-center gap-2">
        {currentStage === 'ready_for_dispatch' && (
          <button
            onClick={onAdvance}
            className="w-full btn-spark-primary text-xs py-1.5 flex items-center justify-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-[#B4F105]" />
            <span>Handoff to Courier</span>
          </button>
        )}

        {currentStage === 'out_for_delivery' && (
          <div className="w-full grid grid-cols-2 gap-2">
            <button
              onClick={onLogAttempt}
              className="btn-spark-light text-xs py-1.5 flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3 h-3 text-[#0284c7]" />
              <span>Log Attempt</span>
            </button>
            <button
              onClick={onAdvance}
              className="btn-spark-lime text-xs py-1.5 flex items-center justify-center gap-1 font-bold"
            >
              <CheckCircle2 className="w-3 h-3 text-[#072F1F]" />
              <span>Delivered</span>
            </button>
          </div>
        )}

        {currentStage === 'delivered_paid' && (
          <div className="w-full p-1.5 rounded-xl bg-[#DCFCE7] text-center text-[11px] font-bold text-[#15803d] flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Physical Cash Reconciled</span>
          </div>
        )}

        {currentStage === 'failed_rth' && (
          <div className="w-full flex items-center gap-2">
            <button
              onClick={onAdvance}
              className="w-full btn-spark-light text-xs py-1.5 flex items-center justify-center gap-1 text-[#072F1F]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Re-Attempt Dispatch</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
