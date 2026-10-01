'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Download,
  Flame,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface LandingHeroProps {
  lang: 'ar' | 'ckb' | 'en';
  t: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    btnAppStore: string;
    btnGooglePlay: string;
    btnApk: string;
    trustCod: string;
    trustInspection: string;
    trustStartingBid: string;
    liveAuction: string;
    placeBid: string;
    timeLeft: string;
    currentBid: string;
    bidNotification: string;
    itemTitle: string;
  };
}

export function LandingHero({ lang, t }: LandingHeroProps) {
  const isRtl = lang === 'ar' || lang === 'ckb';

  // Live timer simulation in the phone mockup
  const [seconds, setSeconds] = useState(48);
  const [bidCount, setBidCount] = useState(14);
  const [currentAmount, setCurrentAmount] = useState(38000);
  const [showBidAlert, setShowBidAlert] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Anti-sniping reset simulation
          setCurrentAmount((p) => p + 1000);
          setBidCount((b) => b + 1);
          setShowBidAlert(true);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSimulateBid = () => {
    setCurrentAmount((p) => p + 1000);
    setBidCount((b) => b + 1);
    setSeconds((s) => Math.max(s, 45));
    setShowBidAlert(true);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#F83758]/10 via-[#4392F9]/10 to-[#F83758]/10 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-[#4392F9]/8 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Download Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-start">
            
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F2] border border-[#F83758]/20 text-[#F83758] shadow-xs">
              <Flame className="w-4 h-4 fill-[#F83758] text-[#F83758] animate-pulse" />
              <span className="text-xs font-black tracking-wide uppercase font-['Montserrat']">
                {t.heroBadge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#17223B] tracking-tight leading-[1.15]">
              {t.heroTitle.split(' ').map((word, i) => {
                const isHighlight = i === 1 || i === 2;
                return (
                  <span
                    key={i}
                    className={isHighlight ? 'text-[#F83758] inline-block' : 'inline-block'}
                  >
                    {word}&nbsp;
                  </span>
                );
              })}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t.heroSubtitle}
            </p>

            {/* Store Download Buttons Cluster */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              
              {/* App Store Button */}
              <a
                href="https://apps.apple.com/app/zeedo-bid"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-[#17223B] hover:bg-black text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-7 h-7 fill-white flex-shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.42-6.19-9.5-11.04-20.2-14.54-32.08-3.5-11.89-5.25-23.2-5.25-33.95 0-14.44 3.73-26.68 11.19-36.71 7.46-10.03 16.9-15.19 28.32-15.49 4.36 0 9.27 1.15 14.73 3.46 5.46 2.31 9.4 3.52 11.82 3.63 2.12-.11 6.16-1.32 12.13-3.63 5.97-2.31 10.68-3.41 14.13-3.3 10.36.42 19.01 4.25 25.96 11.5-9.16 5.56-13.68 13.23-13.57 23.01.11 8.24 3.32 15.17 9.63 20.8 6.31 5.63 13.67 9.07 22.09 10.32-2.12 6.53-4.7 13.14-7.75 19.83zm-27.18-106.6c.11 3.58-1.06 7.23-3.51 10.95-2.45 3.72-5.71 6.78-9.78 9.18-2.67-3.15-4.22-6.79-4.66-10.93-.44-4.14.61-8.15 3.16-12.03 2.55-3.88 5.86-6.91 9.94-9.09 1.78 2.06 3.14 4.38 4.08 6.96.94 2.58 1.41 4.77 1.41 6.58z" />
                </svg>
                <div className="text-start">
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                    Download on the
                  </div>
                  <div className="text-base font-extrabold text-white leading-tight font-['Montserrat']">
                    App Store
                  </div>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="https://play.google.com/store/apps/details?id=bid.zeedo.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-[#17223B] hover:bg-black text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 512 512">
                  <path
                    fill="#4392F9"
                    d="M325.3 234.3L104.6 13l280.8 161.2-60.1 59.1z"
                  />
                  <path
                    fill="#F83758"
                    d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"
                  />
                  <path
                    fill="#F8991D"
                    d="M405.4 337.8L104.6 499l220.7-220.7 80.1 59.5z"
                  />
                  <path
                    fill="#00E599"
                    d="M495.2 233.1l-69.8-40.1-40.1 41.3 40.1 41.3 70.8-40.7c11.9-6.9 11.9-18.4-.1-25.3z"
                  />
                </svg>
                <div className="text-start">
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                    GET IT ON
                  </div>
                  <div className="text-base font-extrabold text-white leading-tight font-['Montserrat']">
                    Google Play
                  </div>
                </div>
              </a>

              {/* Direct APK Download Button */}
              <a
                href="#download"
                className="group flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#17223B] border-2 border-slate-200 hover:border-[#F83758] shadow-sm transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-[#FFF0F2] text-[#F83758] flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <div className="text-start">
                  <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                    Direct Sideload
                  </div>
                  <div className="text-xs font-black text-[#17223B] font-['Montserrat']">
                    Download APK
                  </div>
                </div>
              </a>

            </div>

            {/* Trust Points Badges Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-start space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#17223B]">
                  <Truck className="w-4 h-4 text-[#4392F9]" />
                  <span>{t.trustCod}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">All 18 Governorates</p>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-start space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#17223B]">
                  <ShieldCheck className="w-4 h-4 text-[#F83758]" />
                  <span>{t.trustInspection}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">100% Genuine Brands</p>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-start space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#17223B]">
                  <Sparkles className="w-4 h-4 text-[#F8991D]" />
                  <span>{t.trustStartingBid}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Zero Advance Deposit</p>
              </div>
            </div>

          </div>

          {/* Right Column: Realistic iPhone 16 Mockup with Interactive Live Bid (5 cols) */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Phone Outer Shell */}
            <div className="relative w-[310px] sm:w-[340px] h-[640px] sm:h-[680px] bg-[#17223B] rounded-[48px] p-3 shadow-2xl shadow-[#17223B]/30 border-4 border-slate-700/80 ring-1 ring-white/20 select-none">
              
              {/* iPhone Side Buttons / Antenna Accents */}
              <div className="absolute -left-[6px] top-28 w-[4px] h-9 bg-slate-700 rounded-l" />
              <div className="absolute -left-[6px] top-42 w-[4px] h-12 bg-slate-700 rounded-l" />
              <div className="absolute -left-[6px] top-58 w-[4px] h-12 bg-slate-700 rounded-l" />
              <div className="absolute -right-[6px] top-36 w-[4px] h-16 bg-slate-700 rounded-r" />

              {/* iPhone Screen Container */}
              <div className="relative w-full h-full bg-white rounded-[40px] overflow-hidden flex flex-col justify-between border border-slate-200">
                
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0D1A2D] ring-1 ring-blue-900/50" />
                </div>

                {/* Status Bar */}
                <div className="px-6 pt-3 pb-1 flex justify-between items-center text-[10px] font-bold text-slate-900 z-20">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 bg-slate-900 rounded-xs" />
                    <span className="w-3 h-2 bg-slate-900 rounded-xs" />
                    <span className="w-4 h-2.5 border border-slate-900 rounded-xs flex items-center p-0.5">
                      <span className="w-full h-full bg-slate-900" />
                    </span>
                  </div>
                </div>

                {/* Mockup App Content Body */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                  
                  {/* Top Bar with Zeedo Logo */}
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#4392F9] to-[#F83758]" />
                      <span className="text-sm font-black text-[#17223B] font-['Montserrat']">
                        ZEEDO<span className="text-[#F83758]">.</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#F83758] bg-[#FFF0F2] px-2 py-0.5 rounded-full">
                        Erbil Hub
                      </span>
                    </div>
                  </div>

                  {/* "Deal of the Day" Banner matching Stylish UI Kit */}
                  <div className="mx-3 mt-2 p-3 rounded-2xl bg-gradient-to-r from-[#4392F9] to-[#2575FC] text-white flex items-center justify-between shadow-md shadow-[#4392F9]/20">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">
                        Deal of the Day
                      </div>
                      <div className="text-xs font-black flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>00:{seconds < 10 ? `0${seconds}` : seconds} left</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 text-[10px] font-bold bg-white text-[#4392F9] rounded-full shadow-xs">
                      Live Room
                    </button>
                  </div>

                  {/* Live Auction Card */}
                  <div className="m-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-md space-y-2.5 flex-1 flex flex-col justify-between">
                    
                    {/* Product Image Frame */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center group">
                      <img
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-[#F83758] text-white">
                        40% OFF
                      </span>
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                        {bidCount} Bids Placed
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <h4 className="text-xs font-black text-[#17223B] line-clamp-1">
                        {t.itemTitle}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Original Box &bull; Doorstep Inspection &bull; Cash on Delivery
                      </p>
                    </div>

                    {/* Live Bidding Box */}
                    <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">
                          {t.currentBid}
                        </div>
                        <div className="text-sm font-black text-[#F83758] font-['Montserrat']">
                          {currentAmount.toLocaleString()} IQD
                        </div>
                      </div>
                      
                      <button
                        onClick={handleSimulateBid}
                        className="px-3.5 py-2 rounded-xl bg-[#F83758] hover:bg-[#E02647] active:scale-95 text-white text-[11px] font-extrabold shadow-sm shadow-[#F83758]/30 transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{t.placeBid}</span>
                      </button>
                    </div>

                  </div>

                </div>

                {/* Bottom App Navigation Bar (from Stylish UI Kit) */}
                <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex justify-between items-center text-slate-400">
                  <div className="flex flex-col items-center text-[#F83758]">
                    <span className="w-4 h-4 rounded-full bg-[#F83758]" />
                    <span className="text-[8px] font-bold mt-0.5">Home</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    <span className="text-[8px] font-medium mt-0.5">Auctions</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    <span className="text-[8px] font-medium mt-0.5">My Bids</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    <span className="text-[8px] font-medium mt-0.5">Profile</span>
                  </div>
                </div>

                {/* iPhone Home Bar */}
                <div className="w-28 h-1 bg-slate-900 rounded-full mx-auto my-1.5" />
              </div>

              {/* Floating Live Bid Toast Notification */}
              {showBidAlert && (
                <div className="absolute -bottom-6 -left-6 bg-white text-[#17223B] p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#F83758] flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div className="text-start">
                    <div className="text-[10px] font-bold text-slate-400">Instant Bid Alert</div>
                    <div className="text-xs font-black text-[#17223B]">
                      {t.bidNotification}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
