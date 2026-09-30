'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  MapPin,
  Coins,
  ChevronRight,
  ChevronLeft,
  X,
  Globe2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL, DIALECT_LABELS } from '@/i18n/translations';
import { LanguageCode } from '@/types/marketplace';

interface IntroWalkthroughModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceOpen?: boolean;
}

export const IntroWalkthroughModal: React.FC<IntroWalkthroughModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  forceOpen = false,
}) => {
  const { language, setLanguage } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (forceOpen) {
      setInternalOpen(true);
      return;
    }
    // Check if intro has been seen previously
    if (typeof window !== 'undefined') {
      const hasSeen = localStorage.getItem('zeedo_intro_seen_v1');
      if (!hasSeen) {
        setInternalOpen(true);
      }
    }
  }, [forceOpen]);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zeedo_intro_seen_v1', 'true');
    }
    setInternalOpen(false);
    if (propOnClose) propOnClose();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  if (!mounted || !isOpen) return null;

  const slides = [
    {
      badge: t.introSlide1Badge,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: t.introSlide1Title,
      description: t.introSlide1Desc,
      icon: Coins,
      iconBg: 'from-emerald-500 to-teal-600',
      illustration: (
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/15 rounded-full animate-ping duration-1000" />
          <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/30 flex flex-col items-center justify-center text-white border-2 border-white/80 p-4 text-center">
            <Coins className="w-10 h-10 mb-1 drop-shadow" />
            <span className="text-2xl font-black tracking-tight font-mono">1,000</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">IQD Starting Price</span>
          </div>
        </div>
      ),
    },
    {
      badge: t.introSlide2Badge,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: t.introSlide2Title,
      description: t.introSlide2Desc,
      icon: Flame,
      iconBg: 'from-amber-500 to-orange-600',
      illustration: (
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/15 rounded-full animate-pulse" />
          <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 shadow-xl shadow-amber-500/30 flex flex-col items-center justify-center text-white border-2 border-white/80 p-4 text-center">
            <Flame className="w-10 h-10 mb-1 text-yellow-200 animate-bounce" />
            <span className="text-2xl font-black font-mono">≤60s</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Anti-Sniping Reset</span>
          </div>
        </div>
      ),
    },
    {
      badge: t.introSlide3Badge,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: t.introSlide3Title,
      description: t.introSlide3Desc,
      icon: ShieldCheck,
      iconBg: 'from-blue-600 to-indigo-600',
      illustration: (
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/15 rounded-full animate-pulse" />
          <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 flex flex-col items-center justify-center text-white border-2 border-white/80 p-4 text-center">
            <ShieldCheck className="w-10 h-10 mb-1 text-blue-100" />
            <span className="text-xl font-black tracking-tight">100% COD</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Pay at Doorstep</span>
          </div>
        </div>
      ),
    },
    {
      badge: t.introSlide4Badge,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: t.introSlide4Title,
      description: t.introSlide4Desc,
      icon: MapPin,
      iconBg: 'from-emerald-600 to-cyan-600',
      illustration: (
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping duration-1000" />
          <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-emerald-600 to-cyan-600 shadow-xl shadow-emerald-500/30 flex flex-col items-center justify-center text-white border-2 border-white/80 p-4 text-center">
            <MapPin className="w-10 h-10 mb-1 text-white" />
            <span className="text-lg font-black tracking-tight">GPS Precision</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">All Iraq Cities</span>
          </div>
        </div>
      ),
    },
  ];

  const activeSlide = slides[currentSlide];
  const isFinalSlide = currentSlide === slides.length - 1;

  const dialects: LanguageCode[] = ['ckb', 'badini', 'ar', 'en'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] relative"
      >
        {/* Top Header Bar: Logo + Dialect Selector + Skip */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              Z
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">ZEEDO</span>
          </div>

          {/* Quick Dialect Selector Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {dialects.map((code) => {
              const isSelected = language === code;
              return (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {DIALECT_LABELS[code].label.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Skip Button */}
          <button
            onClick={handleDismiss}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t.introSkip}
          </button>
        </div>

        {/* Slide Stage */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          {/* Visual Illustration */}
          <div className="py-2">{activeSlide.illustration}</div>

          {/* Slide Text Content */}
          <div className="space-y-2 max-w-sm">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold border ${activeSlide.badgeColor}`}
            >
              {activeSlide.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {activeSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {activeSlide.description}
            </p>
          </div>
        </div>

        {/* Bottom Navigation & Action Bar */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all rounded-full h-2 ${
                  currentSlide === index
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Controls: Prev / Next / Get Started */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-2xs"
                title="Previous slide"
              >
                {rtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <span>{isFinalSlide ? t.introGetStarted : t.introNext}</span>
              {rtl ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroWalkthroughModal;
