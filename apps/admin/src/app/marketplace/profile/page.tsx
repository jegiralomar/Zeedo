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
  Globe,
  ChevronRight,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { TwoGateKycModal } from '@/components/marketplace/TwoGateKycModal';
import { BuyerAuthModal } from '@/components/marketplace/BuyerAuthModal';

export default function BuyerProfilePage() {
  const { buyer, language, setLanguage, isAuthenticated, logout, isTwoGateVerified } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const isVerified = isTwoGateVerified();

  if (!isAuthenticated || !buyer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <User className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {rtl ? 'بەخێربێیت بۆ زێدۆ' : 'Welcome to ZEEDO'}
          </h2>
          <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
            {rtl
              ? 'بۆ بینینی هەژمارەکەت و بەشداریکردن لە مزادە ڕاستەوخۆکان، تکایە بچۆ ژوورەوە.'
              : 'Sign in to access your profile, place live bids, and manage orders.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>{rtl ? 'چوونەژوورەوە' : 'Sign In'}</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0F141C] hover:bg-[#161C26] text-white/80 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>{rtl ? 'دروستکردنی هەژمار' : 'Create Account'}</span>
          </button>
        </div>

        {/* Security Highlights */}
        <div className="p-4 rounded-2xl bg-[#0F141C] border border-white/10 text-left text-xs text-white/70 space-y-2.5 max-w-sm mx-auto mt-6">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{rtl ? 'پارێزراوی کڕیار' : 'Buyer Guarantee'}</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-white/50">
            <div>✓ {rtl ? '١٠٠٪ پارەدان لە کاتی وەرگرتن' : '100% Cash on Delivery across all 18 governorates'}</div>
            <div>✓ {rtl ? 'پشکنینی بەرهەم پێش وەرگرتن' : 'Inspect package before paying courier'}</div>
            <div>✓ {rtl ? 'مزادی سەلامەت و دڵنیابەخش' : 'Verified authentic sellers and transparent bidding'}</div>
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
      <div className="bg-[#0F141C] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 backdrop-blur-xl">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
          {buyer.name.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl font-black text-white">{buyer.name}</h2>
            {isVerified ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Buyer</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Verification Incomplete
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5 font-mono text-white/70">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{buyer.phone}</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{buyer.city}, Iraq</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/30" />
              <span>Member since {new Date(buyer.joinedAt || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowKycModal(true)}
            className="py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isVerified ? 'Edit Address & ID' : 'Complete Verification'}</span>
          </button>

          <button
            onClick={() => logout()}
            className="py-2.5 px-4 bg-white/5 hover:bg-rose-500/10 text-white/60 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F141C] p-5 rounded-3xl border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>Bids Placed</span>
            <Gavel className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {buyer.totalBids || 0}
          </div>
          <span className="text-[10px] text-white/40">In live auctions</span>
        </div>

        <div className="bg-[#0F141C] p-5 rounded-3xl border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>Auctions Won</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {buyer.totalWins || 0}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">Ready for delivery</span>
        </div>

        <div className="bg-[#0F141C] p-5 rounded-3xl border border-white/10 shadow-lg space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>Account Status</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {isVerified ? 'Active' : 'Unverified'}
          </div>
          <span className="text-[10px] text-white/40">
            {isVerified ? 'Eligible for all auctions' : 'ID upload needed to bid'}
          </span>
        </div>
      </div>

      {/* Verification & Delivery Address Details */}
      <div className="bg-[#0F141C] rounded-3xl border border-white/10 p-6 space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Identity & Delivery Credentials</span>
            </h3>
            <p className="text-xs text-white/50">
              Required for doorstep delivery and courier dispatch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Identity Document */}
          <div className="bg-[#141A24] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center ${buyer.kycDocument ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  1
                </span>
                <span className="font-bold text-xs text-white">Civil ID (Bataqa Wataniya)</span>
              </div>
              {buyer.kycDocument ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-white/30" />
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Document Status:</span>
                <span className="font-semibold text-emerald-400">
                  {buyer.kycDocument ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">ID Number:</span>
                <span className="font-mono font-bold text-white/90">
                  {buyer.kycDocument?.docNumber ? `•••• •••• ${buyer.kycDocument.docNumber.slice(-4)}` : 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="bg-[#141A24] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center ${buyer.rooftopPin ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  2
                </span>
                <span className="font-bold text-xs text-white">Delivery Location</span>
              </div>
              {buyer.rooftopPin ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-white/30" />
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">District:</span>
                <span className="font-semibold text-white/90">
                  {buyer.rooftopPin?.district || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Landmark:</span>
                <span className="text-white/90 truncate max-w-[180px]">
                  {buyer.rooftopPin?.landmark || 'None provided'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Switcher Section */}
      <div className="bg-[#0F141C] rounded-3xl border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/70">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">App Language / زمانی ئەپ / لغة التطبيق</h4>
            <p className="text-xs text-white/50">Switch language for interface and notifications</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#141A24] rounded-2xl border border-white/5">
          {(['en', 'ar', 'ckb'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === lang
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : 'کوردی'}
            </button>
          ))}
        </div>
      </div>

      <TwoGateKycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />
    </div>
  );
}
