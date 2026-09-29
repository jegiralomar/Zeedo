'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  User,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';

interface BuyerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

const IRAQI_CITIES = [
  { id: 'erbil', name: 'Erbil (هەولێر)' },
  { id: 'sulaymaniyah', name: 'Sulaymaniyah (سلێمانی)' },
  { id: 'duhok', name: 'Duhok (دهۆک)' },
  { id: 'baghdad', name: 'Baghdad (بغداد)' },
  { id: 'basra', name: 'Basra (البصرة)' },
  { id: 'kirkuk', name: 'Kirkuk (كەرکووک)' },
  { id: 'nineveh', name: 'Nineveh / Mosul (نينوى)' },
  { id: 'najaf', name: 'Najaf (النجف)' },
  { id: 'karbala', name: 'Karbala (كربلاء)' },
  { id: 'anbar', name: 'Anbar (الأنبار)' },
];

export const BuyerAuthModal: React.FC<BuyerAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { language, login, signUp } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Erbil (هەولێر)');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError(rtl ? 'تکایە ناوی تەواو بنووسە' : 'Please enter your full name');
          setLoading(false);
          return;
        }
        if (!phone.trim()) {
          setError(rtl ? 'تکایە ژمارەی مۆبایل بنووسە' : 'Please enter your phone number');
          setLoading(false);
          return;
        }

        const ok = signUp(fullName, phone, city, password);
        setLoading(false);
        if (ok) {
          onClose();
        } else {
          setError(rtl ? 'هەڵەیەک ڕوویدا لە دروستکردنی هەژمار' : 'Failed to create account');
        }
      } else {
        if (!phone.trim()) {
          setError(rtl ? 'تکایە ژمارەی مۆبایل یان هەژمار بنووسە' : 'Please enter your phone or username');
          setLoading(false);
          return;
        }

        const ok = login(phone, password);
        setLoading(false);
        if (ok) {
          onClose();
        } else {
          setError(rtl ? 'زانیارییەکان نادروستن' : 'Invalid credentials');
        }
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
              Z
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                {mode === 'login'
                  ? rtl
                    ? 'چوونەژوورەوە بۆ زێدۆ'
                    : 'Sign In to ZEEDO'
                  : rtl
                  ? 'دروستکردنی هەژماری نوێ'
                  : 'Create ZEEDO Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {rtl ? 'مزاداتی عێراق بە پارەدانی کاش' : '100% Cash-on-Delivery Auctions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{rtl ? 'چوونەژوورەوە' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{rtl ? 'هەژماری نوێ' : 'Sign Up'}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                {rtl ? 'ناوی تەواو (وەک ناسنامە)' : 'Full Legal Name'}
              </label>
              <div className="relative">
                <User className={`w-4 h-4 text-slate-400 absolute top-3 ${rtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={rtl ? 'ناوی یەکەم و باوک و باپیر' : 'e.g. Karwan Ahmed'}
                  className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                    rtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              {rtl ? 'ژمارەی مۆبایل لە عێراق' : 'Iraqi Mobile Phone'}
            </label>
            <div className="relative">
              <Phone className={`w-4 h-4 text-slate-400 absolute top-3 ${rtl ? 'right-3' : 'left-3'}`} />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+964 750 XXX XXXX"
                className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono font-semibold focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                  rtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {rtl ? 'بەکاردێت بۆ دڵنیابوونەوە لە کاتی گەیاندنی کاڵا' : 'Used for courier doorstep delivery coordination'}
            </p>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                {rtl ? 'پارێزگا / شار' : 'Governorate / City'}
              </label>
              <div className="relative">
                <MapPin className={`w-4 h-4 text-slate-400 absolute top-3 ${rtl ? 'right-3' : 'left-3'}`} />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                    rtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                >
                  {IRAQI_CITIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block">
                {rtl ? 'وشەی تێپەڕ' : 'Password'}
              </label>
              <span className="text-[10px] text-slate-400">
                {mode === 'signup' ? (rtl ? 'لانیکەم ٦ پیت' : 'Min 6 chars') : ''}
              </span>
            </div>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${rtl ? 'right-3' : 'left-3'}`} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                  rtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>{rtl ? 'تکایە چاوەڕێبە...' : 'Please wait...'}</span>
            ) : (
              <>
                <span>
                  {mode === 'signup'
                    ? rtl
                      ? 'دروستکردنی هەژمار و بەردەوامبوون'
                      : 'Create Account & Continue'
                    : rtl
                    ? 'چوونەژوورەوە'
                    : 'Sign In to Marketplace'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* COD Guarantee Micro-badge */}
          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {rtl
                ? '١٠٠٪ پارەدان لە بەردەم دەرگا پاش پشکنینی کاڵا'
                : '100% Cash-on-Delivery Doorstep Inspection Guarantee'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
