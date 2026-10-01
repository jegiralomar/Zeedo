'use client';

import React from 'react';
import Link from 'next/link';
import { Download, Globe, Shield, Sparkles } from 'lucide-react';

interface LandingHeaderProps {
  lang: 'ar' | 'ckb' | 'en';
  onLangChange: (lang: 'ar' | 'ckb' | 'en') => void;
  t: {
    navFeatures: string;
    navHowItWorks: string;
    navDownload: string;
    navMerchant: string;
    ctaGetApp: string;
  };
}

export function LandingHeader({ lang, onLangChange, t }: LandingHeaderProps) {
  const isRtl = lang === 'ar' || lang === 'ckb';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/brand/zeedo-icon.png" 
              alt="ZEEDO" 
              className="w-10 h-10 object-contain drop-shadow-sm" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-[#17223B] font-['Montserrat']">
              ZEEDO<span className="text-[#F83758]">.</span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 -mt-1 font-['Montserrat']">
              BID. WIN. OWN.
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-semibold text-slate-600 hover:text-[#F83758] transition-colors"
          >
            {t.navFeatures}
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-slate-600 hover:text-[#F83758] transition-colors"
          >
            {t.navHowItWorks}
          </a>
          <a
            href="#download"
            className="text-sm font-semibold text-slate-600 hover:text-[#F83758] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#4392F9]" />
            <span>{t.navDownload}</span>
          </a>
          <a
            href="https://admin.zeedo.bid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-500 hover:text-[#17223B] px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.navMerchant}</span>
          </a>
        </nav>

        {/* Right Actions: Language Switcher & Primary Download Button */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/80">
            <button
              onClick={() => onLangChange('ar')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'ar'
                  ? 'bg-white text-[#F83758] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => onLangChange('ckb')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'ckb'
                  ? 'bg-white text-[#F83758] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              کوردی
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-white text-[#F83758] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* Primary CTA Button */}
          <a
            href="#download"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F83758] hover:bg-[#E02647] text-white text-xs font-extrabold shadow-md shadow-[#F83758]/25 hover:shadow-lg hover:shadow-[#F83758]/35 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.ctaGetApp}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
