'use client';

import React from 'react';
import { QrCode, Download, Smartphone, Sparkles, CheckCircle, Shield } from 'lucide-react';

interface LandingQrSectionProps {
  lang: 'ar' | 'ckb' | 'en';
  t: {
    qrBadge: string;
    qrTitle: string;
    qrSubtitle: string;
    qrScanInstruction: string;
    btnAppStore: string;
    btnGooglePlay: string;
    btnApk: string;
    compatibility: string;
  };
}

export function LandingQrSection({ lang, t }: LandingQrSectionProps) {
  const isRtl = lang === 'ar' || lang === 'ckb';

  return (
    <section id="download" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Download Card */}
        <div className="relative rounded-[40px] bg-gradient-to-br from-[#17223B] via-[#101726] to-[#0A0E18] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl shadow-[#17223B]/30 border border-slate-800">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F83758]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4392F9]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#F83758]">
                <Smartphone className="w-3.5 h-3.5 text-[#F83758]" />
                <span className="text-xs font-black uppercase tracking-wider font-['Montserrat']">
                  {t.qrBadge}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {t.qrTitle}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.qrSubtitle}
              </p>

              {/* Direct Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                
                {/* App Store */}
                <a
                  href="https://apps.apple.com/app/zeedo-bid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#17223B] text-xs font-extrabold shadow-md flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 fill-[#17223B]" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.42-6.19-9.5-11.04-20.2-14.54-32.08-3.5-11.89-5.25-23.2-5.25-33.95 0-14.44 3.73-26.68 11.19-36.71 7.46-10.03 16.9-15.19 28.32-15.49 4.36 0 9.27 1.15 14.73 3.46 5.46 2.31 9.4 3.52 11.82 3.63 2.12-.11 6.16-1.32 12.13-3.63 5.97-2.31 10.68-3.41 14.13-3.3 10.36.42 19.01 4.25 25.96 11.5-9.16 5.56-13.68 13.23-13.57 23.01.11 8.24 3.32 15.17 9.63 20.8 6.31 5.63 13.67 9.07 22.09 10.32-2.12 6.53-4.7 13.14-7.75 19.83zm-27.18-106.6c.11 3.58-1.06 7.23-3.51 10.95-2.45 3.72-5.71 6.78-9.78 9.18-2.67-3.15-4.22-6.79-4.66-10.93-.44-4.14.61-8.15 3.16-12.03 2.55-3.88 5.86-6.91 9.94-9.09 1.78 2.06 3.14 4.38 4.08 6.96.94 2.58 1.41 4.77 1.41 6.58z" />
                  </svg>
                  <span>App Store</span>
                </a>

                {/* Google Play */}
                <a
                  href="https://play.google.com/store/apps/details?id=bid.zeedo.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#17223B] text-xs font-extrabold shadow-md flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 512 512">
                    <path fill="#4392F9" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 59.1z" />
                    <path fill="#F83758" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
                    <path fill="#F8991D" d="M405.4 337.8L104.6 499l220.7-220.7 80.1 59.5z" />
                    <path fill="#00E599" d="M495.2 233.1l-69.8-40.1-40.1 41.3 40.1 41.3 70.8-40.7c11.9-6.9 11.9-18.4-.1-25.3z" />
                  </svg>
                  <span>Google Play</span>
                </a>

                {/* Direct APK */}
                <a
                  href="#download"
                  className="px-5 py-3 rounded-2xl bg-[#F83758] hover:bg-[#E02647] text-white text-xs font-extrabold shadow-md shadow-[#F83758]/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK</span>
                </a>
              </div>

              <div className="pt-2 text-xs text-slate-400 font-medium">
                {t.compatibility}
              </div>

            </div>

            {/* Right QR Code Container (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="p-6 rounded-3xl bg-white text-[#17223B] shadow-2xl text-center space-y-4 max-w-[280px]">
                
                {/* QR Code SVG Visual */}
                <div className="w-52 h-52 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Corner Squares */}
                    <rect x="5" y="5" width="25" height="25" fill="#17223B" rx="4" />
                    <rect x="9" y="9" width="17" height="17" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="13" width="9" height="9" fill="#F83758" rx="1.5" />

                    <rect x="70" y="5" width="25" height="25" fill="#17223B" rx="4" />
                    <rect x="74" y="9" width="17" height="17" fill="#FFFFFF" rx="2" />
                    <rect x="78" y="13" width="9" height="9" fill="#4392F9" rx="1.5" />

                    <rect x="5" y="70" width="25" height="25" fill="#17223B" rx="4" />
                    <rect x="9" y="74" width="17" height="17" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="78" width="9" height="9" fill="#17223B" rx="1.5" />

                    {/* QR Code Pixel Matrix Simulation */}
                    <rect x="36" y="8" width="5" height="5" fill="#17223B" />
                    <rect x="46" y="8" width="5" height="5" fill="#17223B" />
                    <rect x="56" y="8" width="5" height="5" fill="#17223B" />

                    <rect x="36" y="18" width="5" height="5" fill="#17223B" />
                    <rect x="51" y="18" width="5" height="5" fill="#F83758" />
                    <rect x="61" y="18" width="5" height="5" fill="#17223B" />

                    <rect x="8" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="18" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="28" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="38" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="48" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="58" y="36" width="5" height="5" fill="#4392F9" />
                    <rect x="68" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="78" y="36" width="5" height="5" fill="#17223B" />
                    <rect x="88" y="36" width="5" height="5" fill="#17223B" />

                    {/* Center Brand Badge */}
                    <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
                    <circle cx="50" cy="50" r="11" fill="#F83758" />
                    <text x="50" y="54" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      Z
                    </text>

                    <rect x="8" y="46" width="5" height="5" fill="#17223B" />
                    <rect x="23" y="46" width="5" height="5" fill="#17223B" />
                    <rect x="73" y="46" width="5" height="5" fill="#17223B" />
                    <rect x="88" y="46" width="5" height="5" fill="#17223B" />

                    <rect x="8" y="56" width="5" height="5" fill="#17223B" />
                    <rect x="28" y="56" width="5" height="5" fill="#17223B" />
                    <rect x="68" y="56" width="5" height="5" fill="#17223B" />
                    <rect x="83" y="56" width="5" height="5" fill="#17223B" />

                    <rect x="36" y="68" width="5" height="5" fill="#17223B" />
                    <rect x="46" y="68" width="5" height="5" fill="#17223B" />
                    <rect x="56" y="68" width="5" height="5" fill="#17223B" />
                    <rect x="76" y="68" width="5" height="5" fill="#17223B" />
                    <rect x="86" y="68" width="5" height="5" fill="#17223B" />

                    <rect x="36" y="78" width="5" height="5" fill="#F83758" />
                    <rect x="51" y="78" width="5" height="5" fill="#17223B" />
                    <rect x="66" y="78" width="5" height="5" fill="#17223B" />
                    <rect x="81" y="78" width="5" height="5" fill="#4392F9" />

                    <rect x="41" y="88" width="5" height="5" fill="#17223B" />
                    <rect x="56" y="88" width="5" height="5" fill="#17223B" />
                    <rect x="71" y="88" width="5" height="5" fill="#17223B" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-black text-[#17223B]">
                    {t.qrScanInstruction}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Instant Camera Scan
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
