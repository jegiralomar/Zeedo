'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { UserBuyer, KycDocument } from '@/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  ExternalLink,
  CreditCard,
  Sparkles,
  Search,
} from 'lucide-react';

export const SplitScreenKycCard: React.FC = () => {
  const { users, approveKyc, rejectKyc, updateKycOcrFields } = useAdminStore();

  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find((u) => u.kycStatus === 'pending')?.id || users[0]?.id || ''
  );

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Image manipulation state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState('Blurry Image / Illegible Text');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Edit OCR fields state
  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<KycDocument>>({});

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filterStatus === 'all' || u.kycStatus === filterStatus;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const currentUser = users.find((u) => u.id === selectedUserId) || filteredUsers[0];
  const doc = currentUser?.kycDocument;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetTransforms = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleStartEdit = () => {
    if (!doc) return;
    setEditedFields({
      fullName: doc.fullName,
      docNumber: doc.docNumber,
      dob: doc.dob,
      expiryDate: doc.expiryDate,
    });
    setIsEditingOcr(true);
  };

  const handleSaveEdit = () => {
    if (currentUser) {
      updateKycOcrFields(currentUser.id, editedFields);
      setIsEditingOcr(false);
    }
  };

  const handleConfirmReject = () => {
    if (!currentUser) return;
    const finalReason =
      selectedRejectReason === 'Other (Specify Below)'
        ? customRejectReason
        : selectedRejectReason;
    rejectKyc(currentUser.id, finalReason);
    setIsRejectModalOpen(false);
  };

  const rejectionPresets = [
    'Blurry Image / Illegible Text',
    'Full Name Mismatch with Registration Phone Profile',
    'Document is Expired or Damaged',
    'Invalid Rooftop GPS Pin / Delivery Zone Unreachable',
    'Cropped Edges / Incomplete Document Frame',
    'Other (Specify Below)',
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and User Selector Bar */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-[#072F1F] text-white shadow-xs'
                  : 'bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F]'
              }`}
            >
              {status} ({users.filter((u) => (status === 'all' ? true : u.kycStatus === status)).length})
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6C7E75]" />
          <input
            type="text"
            placeholder="Search buyer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#F4F6F5] border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
          />
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Queue List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-[#6C7E75] uppercase tracking-wider px-1">
            Verification Queue ({filteredUsers.length})
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => {
              const isSelected = u.id === currentUser?.id;
              const statusBadges = {
                pending: 'bg-[#FFEDD5] text-[#F97316]',
                verified: 'bg-[#DCFCE7] text-[#15803d]',
                rejected: 'bg-[#FEE2E2] text-[#EF4444]',
                unsubmitted: 'bg-slate-200 text-slate-700',
              };

              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setIsEditingOcr(false);
                    handleResetTransforms();
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#072F1F] shadow-md ring-2 ring-[#072F1F]/10'
                      : 'bg-white border-[#E9EFEF] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0B130F]">{u.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadges[u.kycStatus]}`}
                    >
                      {u.kycStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6C7E75] mt-1 font-mono">
                    <span>{u.phone}</span>
                    <span className="text-[#0B130F] font-semibold">{u.city}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#6C7E75] mt-2">
                    <span className="flex items-center gap-1 text-[#0284c7]">
                      <MapPin className="w-3 h-3" />
                      {u.rooftopPin ? 'Rooftop Pinned' : 'No Pin Dropped'}
                    </span>
                    {u.kycDocument && (
                      <span className="flex items-center gap-1 text-[#15803d] font-semibold">
                        <Sparkles className="w-3 h-3 text-[#B4F105]" />
                        OCR: {u.kycDocument.ocrConfidence}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-xs text-[#6C7E75] border border-dashed border-[#E9EFEF] rounded-2xl bg-white">
                No users match the selected criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Split-Screen Inspector */}
        <div className="lg:col-span-8">
          {currentUser && doc ? (
            <div className="spark-card space-y-6">
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E9EFEF]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#072F1F] flex items-center justify-center font-bold text-[#B4F105] text-lg">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
                      {currentUser.name}
                      <span className="text-xs font-mono text-[#6C7E75]">({currentUser.id})</span>
                    </h3>
                    <p className="text-xs text-[#6C7E75] font-mono">
                      Submitted: {new Date(doc.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quick Status Action Badges */}
                <div className="flex items-center gap-2">
                  {currentUser.kycStatus === 'verified' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#15803d] text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      <span>KYC VERIFIED & UNLOCKED</span>
                    </div>
                  ) : currentUser.kycStatus === 'rejected' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#EF4444] text-xs font-bold">
                      <XCircle className="w-4 h-4 text-[#EF4444]" />
                      <span>REJECTED: {doc.rejectedReason}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsRejectModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#FEE2E2] text-[#EF4444] hover:bg-[#fecaca] transition-all text-xs font-bold"
                      >
                        Reject KYC
                      </button>

                      <button
                        onClick={() => approveKyc(currentUser.id)}
                        className="btn-spark-lime text-xs px-5 py-2 rounded-xl font-black shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#072F1F]" />
                        <span>Approve & Verify</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Split Viewer: Image on Left, OCR Extraction on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel: High-Resolution ID Inspection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6C7E75]">
                    <span className="font-bold text-[#0B130F] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#072F1F]" />
                      Uploaded Document
                    </span>

                    {/* Image Controls: Zoom, Rotate, Reset */}
                    <div className="flex items-center gap-1 bg-[#F4F6F5] p-1 rounded-lg border border-[#E9EFEF]">
                      <button
                        onClick={handleZoomIn}
                        title="Zoom In"
                        className="p-1 hover:bg-white rounded text-[#0B130F]"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleZoomOut}
                        title="Zoom Out"
                        className="p-1 hover:bg-white rounded text-[#0B130F]"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleRotate}
                        title="Rotate 90 deg"
                        className="p-1 hover:bg-white rounded text-[#0B130F]"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleResetTransforms}
                        title="Reset View"
                        className="p-1 hover:bg-white rounded text-[#0B130F]"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Viewport Box */}
                  <div className="relative h-80 rounded-2xl bg-[#051C12] overflow-hidden flex items-center justify-center p-2 border border-[#E9EFEF]">
                    <div
                      className="transition-transform duration-200 ease-out origin-center"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={doc.docUrl}
                        alt="National ID Document Preview"
                        className="max-h-72 max-w-full object-contain rounded-md shadow-2xl"
                      />
                    </div>

                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 text-[10px] text-white font-mono">
                      Scale: {(zoomLevel * 100).toFixed(0)}% • {rotation}°
                    </div>
                  </div>
                </div>

                {/* Right Panel: Gemini Vision OCR Extracted Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B130F] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#072F1F]" />
                      Gemini Vision OCR Extraction
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-[#DCFCE7] text-[#15803d]">
                        {doc.ocrConfidence}% Confidence
                      </span>
                      {!isEditingOcr ? (
                        <button
                          onClick={handleStartEdit}
                          className="text-[11px] text-[#072F1F] font-semibold hover:underline"
                        >
                          Edit Fields
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveEdit}
                          className="text-[11px] text-[#15803d] font-bold"
                        >
                          Save Changes
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Discrepancy Alert */}
                  {doc.discrepancies.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FFEDD5] border border-[#F97316]/30 text-xs text-[#9a3412] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-[#F97316]" />
                        <span>OCR Discrepancy Flagged</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] pl-1">
                        {doc.discrepancies.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formatted Fields in Spark Style */}
                  <div className="space-y-3 bg-[#F8FAF9] p-4 rounded-2xl border border-[#E9EFEF] text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#6C7E75]">
                        Full Legal Name (OCR)
                      </label>
                      {isEditingOcr ? (
                        <input
                          type="text"
                          value={editedFields.fullName || ''}
                          onChange={(e) =>
                            setEditedFields({ ...editedFields, fullName: e.target.value })
                          }
                          className="w-full mt-1 p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                        />
                      ) : (
                        <div className="font-extrabold text-[#0B130F] mt-0.5 text-sm">
                          {doc.fullName}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#6C7E75]">
                          Document Number
                        </label>
                        {isEditingOcr ? (
                          <input
                            type="text"
                            value={editedFields.docNumber || ''}
                            onChange={(e) =>
                              setEditedFields({ ...editedFields, docNumber: e.target.value })
                            }
                            className="w-full mt-1 p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                          />
                        ) : (
                          <div className="font-mono text-[#0B130F] font-bold mt-0.5">{doc.docNumber}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#6C7E75]">
                          Document Type
                        </label>
                        <div className="font-mono text-[#0B130F] mt-0.5 capitalize">
                          {doc.idType.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#6C7E75]">
                          Date of Birth
                        </label>
                        {isEditingOcr ? (
                          <input
                            type="date"
                            value={editedFields.dob || ''}
                            onChange={(e) =>
                              setEditedFields({ ...editedFields, dob: e.target.value })
                            }
                            className="w-full mt-1 p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                          />
                        ) : (
                          <div className="font-mono text-[#0B130F] mt-0.5">{doc.dob}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#6C7E75]">
                          Expiry Date
                        </label>
                        {isEditingOcr ? (
                          <input
                            type="date"
                            value={editedFields.expiryDate || ''}
                            onChange={(e) =>
                              setEditedFields({ ...editedFields, expiryDate: e.target.value })
                            }
                            className="w-full mt-1 p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                          />
                        ) : (
                          <div className="font-mono text-[#15803d] mt-0.5 font-bold">
                            {doc.expiryDate} (Valid)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Mandatory Rooftop Delivery GPS Map Pin Inspector */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#15803d]" />
                    <span className="text-xs font-bold text-[#0B130F] uppercase tracking-wider">
                      Mandatory Rooftop Delivery GPS Pin Drop (Gate 2)
                    </span>
                  </div>

                  {currentUser.rooftopPin ? (
                    <a
                      href={`https://maps.google.com/?q=${currentUser.rooftopPin.latitude},${currentUser.rooftopPin.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#072F1F] font-bold hover:underline font-mono"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>

                {currentUser.rooftopPin ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-[#E9EFEF]">
                      <span className="text-[#6C7E75] text-[10px] uppercase font-bold block">
                        GPS Coordinates
                      </span>
                      <span className="font-mono text-[#0B130F] font-bold">
                        {currentUser.rooftopPin.latitude.toFixed(4)},{' '}
                        {currentUser.rooftopPin.longitude.toFixed(4)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E9EFEF]">
                      <span className="text-[#6C7E75] text-[10px] uppercase font-bold block">
                        City & Landmark
                      </span>
                      <span className="text-[#0B130F] font-semibold">
                        {currentUser.rooftopPin.city} • {currentUser.rooftopPin.landmark}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E9EFEF]">
                      <span className="text-[#6C7E75] text-[10px] uppercase font-bold block">
                        Full Dispatch Address
                      </span>
                      <span className="text-[#6C7E75] text-[11px] line-clamp-2">
                        {currentUser.rooftopPin.addressText}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>User has not dropped rooftop map pin yet. Bidding remains locked.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-white border border-[#E9EFEF] text-[#6C7E75]">
              Select a user from the queue to inspect their KYC and Rooftop Map Pin.
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#EF4444]" />
              Reject KYC Submission
            </h3>
            <p className="text-xs text-[#6C7E75]">
              Select the reason for rejecting {currentUser?.name}&apos;s ID verification. An SMS notification will be dispatched via Fast2SMS.
            </p>

            <div className="space-y-2">
              {rejectionPresets.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F4F6F5] border border-[#E9EFEF] hover:border-slate-300 cursor-pointer text-xs text-[#0B130F]"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={selectedRejectReason === reason}
                    onChange={(e) => setSelectedRejectReason(e.target.value)}
                    className="accent-[#072F1F]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedRejectReason === 'Other (Specify Below)' && (
              <textarea
                placeholder="Enter specific rejection reason..."
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F4F6F5] border border-[#E9EFEF] text-xs text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
                rows={3}
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs font-bold shadow-md"
              >
                Confirm Rejection & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
