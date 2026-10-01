'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, MessageCircle, Heart, Phone, MapPin } from 'lucide-react';

interface LandingFooterProps {
  lang: 'ar' | 'ckb' | 'en';
  t: {
    footerTagline: string;
    footerDesc: string;
    quickLinks: string;
    forSellers: string;
    support: string;
    terms: string;
    privacy: string;
    sellerLogin: string;
    whatsappSupport: string;
    erbilOffice: string;
    baghdadOffice: string;
    allRightsReserved: string;
  };
}

export function LandingFooter({ lang, t }: LandingFooterProps) {
  const isRtl = lang === 'ar' || lang === 'ckb';

  return (
    <footer className="bg-[#17223B] text-white border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4392F9] to-[#F83758] flex items-center justify-center font-bold text-white shadow-md">
                Z
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-['Montserrat']">
                ZEEDO<span className="text-[#F83758]">.</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
              {t.footerDesc}
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#F83758]" />
                <span>{t.erbilOffice}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#4392F9]" />
                <span>{t.baghdadOffice}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-['Montserrat']">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  App Features
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-white transition-colors">
                  Download iOS & Android
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-white transition-colors">
                  Direct APK File
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Anti-Sniping Rules
                </a>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-['Montserrat']">
              {t.forSellers}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a
                  href="https://admin.zeedo.bid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F83758] transition-colors flex items-center gap-1"
                >
                  <span>{t.sellerLogin}</span>
                  <span className="text-[10px] bg-[#F83758]/20 text-[#F83758] px-1.5 py-0.5 rounded font-bold">
                    Admin
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://admin.zeedo.bid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Merchant Onboarding
                </a>
              </li>
              <li>
                <a
                  href="https://admin.zeedo.bid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Commission Rates
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-['Montserrat']">
              {t.support}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a
                  href="https://wa.me/9647500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.whatsappSupport}</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.terms}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.privacy}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ZEEDO Inc. {t.allRightsReserved}</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted for Iraq with</span>
            <Heart className="w-3 h-3 text-[#F83758] fill-[#F83758]" />
            <span>in Erbil & Baghdad</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
