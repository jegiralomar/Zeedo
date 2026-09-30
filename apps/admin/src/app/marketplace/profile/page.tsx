'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Trophy,
  Gavel,
  RefreshCw,
  LogOut,
  LogIn,
  UserPlus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { TwoGateKycModal } from '@/components/marketplace/TwoGateKycModal';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';
import { LocationPickerModal } from '@/components/marketplace/LocationPickerModal';

export default function BuyerProfilePage() {
  const { buyer, language, isAuthenticated, logout, isTwoGateVerified } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [showKycModal, setShowKycModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const isVerified = isTwoGateVerified();

  if (!isAuthenticated || !buyer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
          <User className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {rtl ? 'بەخێربێیت بۆ زێدۆ' : 'Welcome to ZEEDO'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {rtl
              ? 'بۆ بینینی هەژمار، بەشداری لە مزادەکان، و بەدواداچوونی داواکارییەکان، تکایە بچۆژوورەوە یان هەژمار دروستبکە.'
              : 'Sign in to access your buyer profile, manage live bids, complete Two-Gate KYC, and track 100% COD deliveries.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{rtl ? 'چوونەژوورەوە' : 'Sign In'}</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>{rtl ? 'دروستکردنی هەژمار' : 'Create Free Account'}</span>
          </button>
        </div>

        {/* Security Feature Checklist */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 max-w-sm mx-auto mt-6">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{rtl ? 'تایبەتمەندییەکانی زێدۆ' : 'Buyer Protections'}</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-500">
            <div>✓ {rtl ? '١٠٠٪ پارەدان لە بەردەم دەرگا' : '100% Cash-on-Delivery at your doorstep'}</div>
            <div>✓ {rtl ? 'پشکنینی ٥ خولەکی پێش پارەدان' : '5-minute open-box inspection before paying'}</div>
            <div>✓ {rtl ? 'پشتڕاستکردنەوەی ناسنامەی عێراقی' : 'Instant Iraqi Bataqa Wataniya verification'}</div>
          </div>
        </div>

        <BuyerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authMode}
        />
      </div>
    );
  }

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
              <span>Member since {new Date(buyer.joinedAt || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowLocationModal(true)}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isVerified ? 'Update Location' : 'Set Location'}</span>
          </button>

          <button
            onClick={() => logout()}
            className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            title="Log out of buyer account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bids Placed</span>
            <Gavel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.totalBids || 0}
          </div>
          <span className="text-[10px] text-slate-400">Live auctions</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Auctions Won</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {buyer.totalWins || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Completed Deliveries</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bidding Status</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
            {isVerified ? 'Verified' : 'Pending Pin'}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {isVerified ? 'Ready to Place Bids' : 'Set Location on Map'}
          </span>
        </div>
      </div>

      {/* Buyer Verification Record */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Buyer Verification Record</span>
            </h3>
            <p className="text-xs text-slate-500">
              WhatsApp phone verification & doorstep GPS coordinates for 100% COD delivery in Iraq
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Step 1: WhatsApp Phone Verification */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center bg-emerald-600">
                  1
                </span>
                <span className="font-bold text-xs text-slate-900">
                  Step 1: Phone Verification (WhatsApp OTP)
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-mono font-bold text-slate-900">
                  {buyer.phone || '+964 750 000 0000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Method:</span>
                <span className="text-emerald-700 font-semibold">WhatsApp 6-Digit OTP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Status:</span>
                <span className="text-emerald-700 font-semibold">Verified Phone ✓</span>
              </div>
            </div>
          </div>

          {/* Gate 2: Location */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center ${buyer.rooftopPin ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                  2
                </span>
                <span className="font-bold text-xs text-slate-900">
                  {t.gate2Title || 'Step 2: Delivery Location'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {buyer.rooftopPin ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{buyer.rooftopPin ? (t.changeLocation || 'Edit on Map') : (t.setDeliveryLocation || 'Set Location')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">City / Governorate:</span>
                <span className="font-semibold text-slate-900">
                  {buyer.rooftopPin?.city || buyer.city || 'Pending Selection'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">District:</span>
                <span className="font-semibold text-slate-900">
                  {buyer.rooftopPin?.district || 'Pending Selection'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery GPS Pin:</span>
                <span className="font-mono text-slate-700">
                  {buyer.rooftopPin ? `${buyer.rooftopPin.latitude.toFixed(4)}, ${buyer.rooftopPin.longitude.toFixed(4)}` : 'Not Set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Landmark:</span>
                <span className="text-slate-900 truncate max-w-[180px]">
                  {buyer.rooftopPin?.landmark || 'None'}
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

      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
