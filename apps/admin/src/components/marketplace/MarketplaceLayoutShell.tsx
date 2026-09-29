'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  Gavel,
  Bookmark,
  User,
  Globe2,
  ShieldCheck,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { TRANSLATIONS, isRTL, DIALECT_LABELS } from '@/i18n/translations';
import { LanguageModal } from './LanguageModal';
import { TwoGateKycModal } from './TwoGateKycModal';
import { BuyerAuthModal } from './BuyerAuthModal';
import { MerchantPortalView } from '../merchant/MerchantPortalView';

export const MarketplaceLayoutShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { language, buyer, isAuthenticated, logout, isTwoGateVerified } = useBuyerAuthStore();
  const { savedAuctionIds } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [mounted, setMounted] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: t.tabHome,
      href: '/marketplace',
      altHref: '/',
      icon: Flame,
    },
    {
      label: t.tabMyBids,
      href: '/marketplace/my-bids',
      altHref: '/my-bids',
      icon: Gavel,
    },
    {
      label: t.tabSaved,
      href: '/marketplace/watchlist',
      altHref: '/watchlist',
      icon: Bookmark,
      badge: savedAuctionIds.length > 0 ? savedAuctionIds.length : null,
    },
    {
      label: t.tabProfile,
      href: '/marketplace/profile',
      altHref: '/profile',
      icon: User,
    },
  ];

  const dialectInfo = DIALECT_LABELS[language] || DIALECT_LABELS.ckb;
  const isKycDone = mounted && isTwoGateVerified();

  // If logged in as Merchant Seller, render the dedicated Merchant Portal
  if (mounted && isAuthenticated && buyer?.role === 'seller') {
    return <MerchantPortalView />;
  }

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Platform Tag */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl tracking-tighter">Z</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">
                  ZEEDO
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  100% COD
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                Iraq Live Auctions • مزادات حية
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname === item.altHref ||
                (item.altHref === '/' && pathname === '/marketplace');
              const IconComp = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                    isActive
                      ? 'bg-white/10 text-white font-extrabold shadow-xs border border-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Dialect Selector Button */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-850 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dialectInfo.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Buyer Authentication / Profile State */}
            {mounted && isAuthenticated && buyer ? (
              <div className="flex items-center gap-1.5">
                {/* Two-Gate KYC Status Pill */}
                <button
                  onClick={() => setShowKycModal(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    isKycDone
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  }`}
                  title="Two-Gate Anti-Sniping & COD Doorstep Verification"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isKycDone ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span className="hidden sm:inline">
                    {isKycDone ? 'KYC Verified' : 'Verify ID'}
                  </span>
                </button>

                {/* Profile Link Badge */}
                <Link
                  href="/marketplace/profile"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors max-w-[130px] sm:max-w-[160px]"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{buyer.name.split(' ')[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-xl border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-slate-400 transition-colors"
                  title="Log Out of Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{rtl ? 'چوونەژوورەوە' : 'Sign In'}</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{rtl ? 'هەژماری نوێ' : 'Sign Up'}</span>
                </button>
              </div>
            )}

            {/* Switch to Admin link */}
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Admin & Operations Center"
            >
              <Lock className="w-3 h-3 text-[#B4F105]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8">{children}</main>

      {/* Floating Frosted Glass Island Navigation (Mobile Viewport) */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-40">
        <div className="bg-[#0B0F17]/95 backdrop-blur-2xl border border-white/10 rounded-3xl py-2 px-3 shadow-2xl shadow-black/80 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname === item.altHref ||
              (item.altHref === '/' && pathname === '/marketplace');
            const IconComp = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors relative ${
                  isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <IconComp className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Shared Modals */}
      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
      <TwoGateKycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />
      <BuyerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
};
