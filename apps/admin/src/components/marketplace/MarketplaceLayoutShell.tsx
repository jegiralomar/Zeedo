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
  const { savedAuctionIds, syncLiveAuctionsFromDb } = useBuyerAuctionStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [mounted, setMounted] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setMounted(true);
    syncLiveAuctionsFromDb();
  }, [syncLiveAuctionsFromDb]);

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
      className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Platform Tag */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl tracking-tighter">Z</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  ZEEDO
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
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
                      ? 'bg-blue-50 text-blue-700 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
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
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{dialectInfo.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Buyer Authentication / Profile State */}
            {mounted && isAuthenticated && buyer ? (
              <div className="flex items-center gap-1.5">
                {/* Two-Gate KYC Status Pill */}
                <button
                  onClick={() => setShowKycModal(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    isKycDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                  title="Two-Gate Anti-Sniping & COD Doorstep Verification"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isKycDone ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span className="hidden sm:inline">
                    {isKycDone ? 'KYC Verified' : 'Verify ID'}
                  </span>
                </button>

                {/* Profile Link Badge */}
                <Link
                  href="/marketplace/profile"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors max-w-[130px] sm:max-w-[160px]"
                >
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{buyer.name.split(' ')[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 transition-colors"
                  title="Log Out of Buyer Account"
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>{rtl ? 'چوونەژوورەوە' : 'Sign In'}</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{rtl ? 'هەژماری نوێ' : 'Sign Up'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">{children}</main>

      {/* Bottom Floating Navigation Bar (Mobile Viewport) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-2 px-3 z-40 shadow-lg">
        <div className="flex items-center justify-around">
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
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors relative ${
                  isActive ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
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
