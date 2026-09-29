'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Gavel,
  RefreshCw,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS } from '@/i18n/translations';
import { TwoGateKycModal } from '@/components/marketplace/TwoGateKycModal';

export default function BuyerProfilePage() {
  const { buyer, language, isTwoGateVerified } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];

  const [showKycModal, setShowKycModal] = useState(false);
  const isVerified = isTwoGateVerified();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
          {buyer.name.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">{buyer.name}</h2>
            {isVerified ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Two-Gate Verified</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                KYC Pending
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{buyer.phone}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{buyer.city}, Iraq</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Member since Aug 2026</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowKycModal(true)}
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Update KYC Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bids Placed</span>
            <Gavel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.totalBids || 14}
          </div>
          <span className="text-[10px] text-slate-400">All live events</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Auctions Won</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.totalWins || 2}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% COD Settled</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>OCR Trust Score</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">98%</div>
          <span className="text-[10px] text-purple-600 font-semibold">Tesseract Dual-Language</span>
        </div>
      </div>

      {/* Two-Gate Security Verification Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Two-Gate Anti-Sniping Verification Record</span>
            </h3>
            <p className="text-xs text-slate-500">
              Guarantees doorstep courier accuracy and authentic buyer validation in Iraq
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gate 1 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-xs text-slate-900">Gate 1: Iraqi Civil ID</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-semibold text-slate-900">Bataqa Wataniya</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unified ID Number:</span>
                <span className="font-mono font-bold text-slate-900">
                  {buyer.kycDocument?.docNumber || 'IQ-19960412-99182'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OCR Engine:</span>
                <span className="text-emerald-700 font-semibold">Tesseract.js (ara+eng)</span>
              </div>
            </div>
          </div>

          {/* Gate 2 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-xs text-slate-900">Gate 2: Rooftop Map Pin</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">District:</span>
                <span className="font-semibold text-slate-900">
                  {buyer.rooftopPin?.district || 'Dream City'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GPS Pin:</span>
                <span className="font-mono text-slate-700">
                  {buyer.rooftopPin?.latitude || 36.1911}, {buyer.rooftopPin?.longitude || 44.0092}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Landmark:</span>
                <span className="text-slate-900 truncate max-w-[180px]">
                  {buyer.rooftopPin?.landmark || 'Near Italian Village'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TwoGateKycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />
    </div>
  );
}
