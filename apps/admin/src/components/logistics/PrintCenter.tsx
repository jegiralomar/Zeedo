'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAdminStore } from '@/store/useAdminStore';
import {
  Printer,
  QrCode,
  Truck,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react';
import { ParcelLifecycleBoard } from './ParcelLifecycleBoard';

export const PrintCenter: React.FC = () => {
  const {
    auctions,
    manifests,
    createCourierManifest,
    markManifestHandedOver,
    addToast,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'lifecycle_board' | 'awb_label' | 'manifest_batch'>('lifecycle_board');

  // AWB state
  const completedAuctions = auctions.filter((a) => a.status === 'completed' || a.codStatus);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>(
    completedAuctions[0]?.id || ''
  );
  const [labelFormat, setLabelFormat] = useState<'thermal_4x6' | 'standard_a4'>('thermal_4x6');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Manifest builder state
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [courierCompanyName, setCourierCompanyName] = useState('Al-Zajil Express Logistics');
  const [courierDriverName, setCourierDriverName] = useState('Sarmad Adil');
  const [courierDriverPhone, setCourierDriverPhone] = useState('+964 750 918 2233');
  const [courierVehiclePlate, setCourierVehiclePlate] = useState('Baghdad 49102 A');
  const [selectedManifestId, setSelectedManifestId] = useState<string>(manifests[0]?.id || '');

  const currentAuction =
    completedAuctions.find((a) => a.id === selectedAuctionId) || completedAuctions[0];

  const currentManifest =
    manifests.find((m) => m.id === selectedManifestId) || manifests[0];

  useEffect(() => {
    if (currentAuction && currentAuction.highestBidder?.rooftopPin) {
      const { latitude, longitude } = currentAuction.highestBidder.rooftopPin;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      QRCode.toDataURL(mapsUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    } else {
      QRCode.toDataURL('https://maps.google.com/?q=36.1911,44.0092', {
        width: 180,
        margin: 1,
      }).then((url) => setQrCodeDataUrl(url));
    }
  }, [currentAuction]);

  const handlePrint = () => {
    window.print();
  };

  const handleToggleSelectListing = (id: string) => {
    setSelectedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedListingIds.length === completedAuctions.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(completedAuctions.map((a) => a.id));
    }
  };

  const handleCreateManifest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedListingIds.length === 0) {
      addToast('error', 'Select at least one completed auction to generate manifest');
      return;
    }
    createCourierManifest({
      courierCompanyName,
      courierDriverName,
      courierDriverPhone,
      courierVehiclePlate,
      selectedListingIds,
    });
    setSelectedListingIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284c7] flex items-center justify-center font-bold">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F]">
              Logistics & Document Print Center
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Generate scannable AWB thermal labels with rooftop GPS QR codes and batch courier route manifests.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF]">
          <button
            onClick={() => setActiveTab('lifecycle_board')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'lifecycle_board'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>COD Lifecycle Board (4 Stages)</span>
          </button>
          <button
            onClick={() => setActiveTab('awb_label')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'awb_label'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Package AWB / Thermal 4x6</span>
          </button>
          <button
            onClick={() => setActiveTab('manifest_batch')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'manifest_batch'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Courier Route Manifests</span>
          </button>
        </div>
      </div>

      {/* VIEW 0: COD PARCEL LIFECYCLE BOARD */}
      {activeTab === 'lifecycle_board' && (
        <ParcelLifecycleBoard
          onSelectForPrint={(auctionId) => {
            setSelectedAuctionId(auctionId);
            setActiveTab('awb_label');
          }}
        />
      )}

      {/* VIEW 1: PACKAGE AWB / BOX LABEL */}
      {activeTab === 'awb_label' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Completed Orders Table */}
          <div className="lg:col-span-5 space-y-3 no-print">
            <div className="flex items-center justify-between text-xs font-bold text-[#6C7E75] uppercase tracking-wider px-1">
              <span>Orders Ready for Dispatch</span>
              <span className="text-[#072F1F] font-mono font-bold">{completedAuctions.length} Orders</span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {completedAuctions.map((auc) => {
                const isSelected = auc.id === currentAuction?.id;
                return (
                  <div
                    key={auc.id}
                    onClick={() => setSelectedAuctionId(auc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#072F1F] shadow-md ring-2 ring-[#072F1F]/10'
                        : 'bg-white border-[#E9EFEF] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#072F1F]">
                        {auc.packageAwbId || auc.id}
                      </span>
                      <span className="text-xs font-mono font-black text-[#15803d]">
                        {auc.currentBidIqd.toLocaleString()} IQD
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#0B130F] mt-1 line-clamp-1">
                      {auc.multilingual?.en?.title || 'Parcel Item'}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#6C7E75] mt-2 font-mono">
                      <span>Buyer: {auc.highestBidder?.name}</span>
                      <span className="text-[#0B130F] font-semibold">{auc.highestBidder?.rooftopPin?.city}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Printable Label Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="spark-card !p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6C7E75]">Format:</span>
                <button
                  onClick={() => setLabelFormat('thermal_4x6')}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    labelFormat === 'thermal_4x6'
                      ? 'bg-[#072F1F] text-white'
                      : 'bg-[#F4F6F5] text-[#6C7E75]'
                  }`}
                >
                  4x6&quot; Thermal (100x150mm)
                </button>
                <button
                  onClick={() => setLabelFormat('standard_a4')}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    labelFormat === 'standard_a4'
                      ? 'bg-[#072F1F] text-white'
                      : 'bg-[#F4F6F5] text-[#6C7E75]'
                  }`}
                >
                  A4 Packing Slip
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="btn-spark-lime text-xs px-5 py-2 font-black shadow-md"
              >
                <Printer className="w-4 h-4 text-[#072F1F]" />
                <span>Print Package Label</span>
              </button>
            </div>

            {currentAuction ? (
              <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#E9EFEF] flex justify-center shadow-inner">
                <div
                  className={`printable-thermal-label bg-white text-black font-sans shadow-2xl rounded-xl ${
                    labelFormat === 'thermal_4x6'
                      ? 'w-[380px] p-6 border-2 border-dashed border-slate-300'
                      : 'w-full max-w-[650px] p-8 border border-slate-300'
                  }`}
                >
                  {/* Brand & AWB Header */}
                  <div className="border-b-2 border-black pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black tracking-wider text-black">ZEEDO BID</h2>
                        <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-700">
                          Express Courier Logistics
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-600 block">
                          Air Waybill (AWB)
                        </span>
                        <span className="font-mono text-sm font-black text-black">
                          {currentAuction.packageAwbId || `AWB-IQ-${currentAuction.id.replace('auc-', '')}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOLD CASH ON DELIVERY HIGHLIGHT BOX */}
                  <div className="my-3.5 p-3 rounded-md bg-black text-white text-center border-2 border-black">
                    <span className="text-[11px] uppercase tracking-widest font-extrabold block text-[#B4F105]">
                      CASH ON DELIVERY (COD) — COLLECT AT DOORSTEP
                    </span>
                    <span className="text-2xl font-black tracking-tight block font-mono text-white">
                      {currentAuction.currentBidIqd.toLocaleString()} IQD
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      Strict COD Ecosystem: Hand physical cash to driver before handover.
                    </span>
                  </div>

                  {/* Recipient & Rooftop Map Pin QR Code Block */}
                  <div className="grid grid-cols-12 gap-3 py-2 border-b-2 border-black">
                    <div className="col-span-7 space-y-1 text-xs">
                      <span className="text-[9px] uppercase font-bold text-slate-600 block">
                        SHIP TO (RECIPIENT)
                      </span>
                      <div className="font-black text-sm text-black">
                        {currentAuction.highestBidder?.name || 'Authorized Buyer'}
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {currentAuction.highestBidder?.phone || '+964 750 000 0000'}
                      </div>
                      <div className="text-[11px] text-slate-800 leading-tight">
                        <strong>City:</strong> {currentAuction.highestBidder?.rooftopPin?.city || 'Erbil'}
                        <br />
                        <strong>Landmark:</strong> {currentAuction.highestBidder?.rooftopPin?.landmark || 'Central'}
                        <br />
                        <span className="text-[10px] text-slate-700">
                          {currentAuction.highestBidder?.rooftopPin?.addressText}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-5 flex flex-col items-center justify-center border-l-2 border-black pl-2">
                      <span className="text-[8px] uppercase font-extrabold text-black tracking-tighter text-center block mb-1">
                        SCAN GPS FOR ROOFTOP
                      </span>
                      {qrCodeDataUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={qrCodeDataUrl}
                          alt="Google Maps GPS QR Code"
                          className="w-24 h-24 border border-black p-0.5 rounded"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px]">
                          Generating QR...
                        </div>
                      )}
                      <span className="text-[8px] font-mono text-slate-600 text-center mt-1">
                        Lat: {currentAuction.highestBidder?.rooftopPin?.latitude?.toFixed(4) || '36.1911'}
                        <br />
                        Lng: {currentAuction.highestBidder?.rooftopPin?.longitude?.toFixed(4) || '44.0092'}
                      </span>
                    </div>
                  </div>

                  {/* Item Description & Seller Details */}
                  <div className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-600">
                      <span>Auction ID: {currentAuction.id}</span>
                      <span>Condition: {currentAuction.condition}</span>
                    </div>
                    <div className="font-bold text-xs text-black line-clamp-2">
                      {currentAuction.multilingual?.en?.title || 'Item'}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-700 border-t border-slate-300">
                      <span>Sender: {currentAuction.sellerName}</span>
                      <span>Dispatch: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-[#6C7E75] rounded-3xl bg-white border border-[#E9EFEF]">
                No order selected for label generation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: EXTERNAL COURIER MANIFESTS */}
      {activeTab === 'manifest_batch' && (
        <div className="space-y-6">
          <div className="spark-card space-y-4 no-print">
            <h3 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#072F1F]" />
              Generate External Courier Route Handoff Manifest
            </h3>

            <form onSubmit={handleCreateManifest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">
                    Courier Company Name
                  </label>
                  <input
                    type="text"
                    value={courierCompanyName}
                    onChange={(e) => setCourierCompanyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">
                    Driver Full Name
                  </label>
                  <input
                    type="text"
                    value={courierDriverName}
                    onChange={(e) => setCourierDriverName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">
                    Driver Phone Number
                  </label>
                  <input
                    type="text"
                    value={courierDriverPhone}
                    onChange={(e) => setCourierDriverPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">
                    Vehicle License Plate
                  </label>
                  <input
                    type="text"
                    value={courierVehiclePlate}
                    onChange={(e) => setCourierVehiclePlate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* Package Selection Table */}
              <div className="border border-[#E9EFEF] rounded-2xl overflow-hidden bg-white">
                <div className="flex items-center justify-between p-3.5 bg-[#F8FAF9] border-b border-[#E9EFEF] text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[#0B130F] font-bold flex items-center gap-1.5"
                    >
                      {selectedListingIds.length === completedAuctions.length ? (
                        <CheckSquare className="w-4 h-4 text-[#15803d]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#6C7E75]" />
                      )}
                      <span>Select All Parcels ({completedAuctions.length})</span>
                    </button>
                  </div>
                  <span className="font-mono text-[#072F1F] font-bold">
                    {selectedListingIds.length} Packages Selected
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {completedAuctions.map((auc) => {
                    const isChecked = selectedListingIds.includes(auc.id);
                    return (
                      <div
                        key={auc.id}
                        onClick={() => handleToggleSelectListing(auc.id)}
                        className={`p-3.5 border-b border-[#E9EFEF] flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#DCFCE7]/40' : 'bg-white hover:bg-[#F8FAF9]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#15803d] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-[#879A91] shrink-0" />
                          )}
                          <div>
                            <span className="font-mono font-bold text-[#0B130F] block">
                              {auc.packageAwbId || auc.id}
                            </span>
                            <span className="text-[#6C7E75] text-[11px] line-clamp-1">
                              {auc.multilingual?.en?.title || 'Parcel Item'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-[#15803d] block">
                            {auc.currentBidIqd.toLocaleString()} IQD
                          </span>
                          <span className="text-[10px] text-[#6C7E75] font-mono">
                            {auc.highestBidder?.rooftopPin?.city || 'Erbil'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="btn-spark-primary text-xs"
                >
                  Create & Assemble Manifest Sheet
                </button>
              </div>
            </form>
          </div>

          {currentManifest && (
            <div className="space-y-4">
              <div className="spark-card !p-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#6C7E75]">Inspect Manifest:</span>
                  <select
                    value={selectedManifestId}
                    onChange={(e) => setSelectedManifestId(e.target.value)}
                    className="p-2 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-xs font-mono text-[#0B130F]"
                  >
                    {manifests.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.manifestCode} ({m.courierCompanyName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {currentManifest.status !== 'handed_over' && (
                    <button
                      onClick={() => markManifestHandedOver(currentManifest.id)}
                      className="btn-spark-light text-xs"
                    >
                      Mark Handed Over
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="btn-spark-lime text-xs"
                  >
                    <Printer className="w-4 h-4 text-[#072F1F]" />
                    <span>Print Manifest Sheet</span>
                  </button>
                </div>
              </div>

              {/* Printable A4 Manifest Document */}
              <div className="p-8 rounded-3xl bg-white text-black font-sans printable-manifest-sheet shadow-2xl border border-slate-300">
                <div className="flex items-start justify-between border-b-2 border-black pb-4">
                  <div>
                    <h1 className="text-2xl font-black text-black">ZEEDO BID APP</h1>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                      Third-Party Logistics Route Handoff Manifest (COD)
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Dispatching Hub: {currentManifest.dispatcherName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold uppercase text-slate-600 block">
                      Manifest Number
                    </span>
                    <span className="text-base font-mono font-black text-black">
                      {currentManifest.manifestCode}
                    </span>
                    <span className="text-xs font-mono text-slate-600 block">
                      Date: {currentManifest.date}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-b border-black text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      Courier Company
                    </span>
                    <span className="font-bold text-black text-sm">
                      {currentManifest.courierCompanyName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      Driver Representative
                    </span>
                    <span className="font-semibold text-black">
                      {currentManifest.courierDriverName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      Driver Phone
                    </span>
                    <span className="font-mono text-black">
                      {currentManifest.courierDriverPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      Vehicle Plate
                    </span>
                    <span className="font-mono font-bold text-black">
                      {currentManifest.courierVehiclePlate}
                    </span>
                  </div>
                </div>

                <div className="py-4">
                  <table className="print-table w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="p-2 border border-black font-bold">#</th>
                        <th className="p-2 border border-black font-bold">AWB / Auction ID</th>
                        <th className="p-2 border border-black font-bold">Item Description</th>
                        <th className="p-2 border border-black font-bold">Recipient & Phone</th>
                        <th className="p-2 border border-black font-bold">Delivery City & Landmark</th>
                        <th className="p-2 border border-black font-bold text-right">
                          COD Amount (IQD)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentManifest.items.map((item) => (
                        <tr key={item.sequenceNumber} className="border-b border-black">
                          <td className="p-2 border border-black font-mono font-bold">
                            {item.sequenceNumber}
                          </td>
                          <td className="p-2 border border-black font-mono font-bold">
                            {item.packageAwbId}
                          </td>
                          <td className="p-2 border border-black font-medium">{item.itemTitle}</td>
                          <td className="p-2 border border-black">
                            <span className="font-bold block">{item.buyerName}</span>
                            <span className="font-mono text-[11px]">{item.buyerPhone}</span>
                          </td>
                          <td className="p-2 border border-black text-[11px]">
                            <strong>{item.city}:</strong> {item.landmark}
                          </td>
                          <td className="p-2 border border-black font-mono font-black text-right">
                            {item.codAmountIqd.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-black">
                        <td colSpan={5} className="p-2 border border-black text-right uppercase">
                          Total COD Sum to Collect ({currentManifest.totalPackages} Parcels):
                        </td>
                        <td className="p-2 border border-black font-mono font-black text-right text-sm">
                          {currentManifest.totalCodSumIqd.toLocaleString()} IQD
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-8 text-xs border-t-2 border-black mt-8">
                  <div className="space-y-6">
                    <span className="font-bold uppercase text-slate-700 block">
                      Dispatched By (ZEEDO Logistics Hub Representative)
                    </span>
                    <div className="border-b border-black h-10"></div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                      <span>Signature: ___________________</span>
                      <span>Date: {currentManifest.date}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <span className="font-bold uppercase text-slate-700 block">
                      Received By (Courier Driver & Third-Party Carrier)
                    </span>
                    <div className="border-b border-black h-10"></div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                      <span>Signature: ___________________</span>
                      <span>Vehicle: {currentManifest.courierVehiclePlate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
