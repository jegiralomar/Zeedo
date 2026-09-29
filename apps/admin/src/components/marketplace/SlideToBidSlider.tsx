'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Gavel, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlideToBidSliderProps {
  amountText: string;
  onBidConfirmed: () => void;
  disabled?: boolean;
  isRtl?: boolean;
}

export const SlideToBidSlider: React.FC<SlideToBidSliderProps> = ({
  amountText,
  onBidConfirmed,
  disabled = false,
  isRtl = false,
}) => {
  const [sliderPos, setSliderPos] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const handleStart = (clientX: number) => {
    if (disabled || isSuccess) return;
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || isSuccess || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width - 56; // Handle width = 56px

    if (width <= 0) return;

    let delta = clientX - rect.left - 28;
    if (isRtl) {
      delta = rect.right - clientX - 28;
    }

    const progress = Math.max(0, Math.min(1, delta / width));
    setSliderPos(progress);

    if (progress >= 0.88) {
      triggerSuccess();
    }
  };

  const handleEnd = () => {
    if (!isDragging || isSuccess) return;
    setIsDragging(false);
    if (sliderPos < 0.88) {
      setSliderPos(0); // Spring back
    }
  };

  const triggerSuccess = () => {
    setIsDragging(false);
    setSliderPos(1);
    setIsSuccess(true);

    // Haptic feedback if supported on mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 100]);
      } catch (e) {}
    }

    // Confetti celebration burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#FFFFFF'],
      });
    } catch (e) {}

    onBidConfirmed();

    setTimeout(() => {
      setIsSuccess(false);
      setSliderPos(0);
    }, 2200);
  };

  // Global mouse up / touch end listeners when dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onMouseUp = () => {
      if (isDragging) handleEnd();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      if (isDragging) handleEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, sliderPos]);

  return (
    <div
      ref={containerRef}
      className={`relative h-14 rounded-2xl p-1 select-none overflow-hidden transition-all shadow-lg ${
        isSuccess
          ? 'bg-emerald-600 shadow-emerald-500/30'
          : disabled
          ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
          : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-white/10 shadow-black/40'
      }`}
    >
      {/* Background Progress Fill */}
      <div
        className={`absolute top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} ${
          isSuccess
            ? 'bg-emerald-500'
            : 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/50'
        } transition-all duration-75`}
        style={{ width: `${sliderPos * 100}%` }}
      />

      {/* Shimmering Center Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isSuccess ? (
          <div className="flex items-center gap-2 text-white font-black text-sm tracking-wide animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>BID CONFIRMED ({amountText})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs tracking-wider uppercase opacity-90">
            <span>{isRtl ? 'بخشێنە بۆ مزایدەکردن' : 'Slide to Bid'}</span>
            <span className="font-mono text-emerald-400 font-black">{amountText}</span>
            {isRtl ? (
              <ChevronLeft className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <ChevronRight className="w-4 h-4 text-emerald-400 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Draggable Gavel Pill Handle */}
      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches[0]) handleStart(e.touches[0].clientX);
        }}
        className={`absolute top-1 bottom-1 w-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-transform ${
          isSuccess
            ? 'bg-white text-emerald-600'
            : 'bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-950 shadow-emerald-500/30 active:scale-105'
        }`}
        style={{
          [isRtl ? 'right' : 'left']: `calc(${sliderPos * 100}% - ${sliderPos * 48}px)`,
        }}
      >
        {isSuccess ? (
          <Sparkles className="w-5 h-5 animate-spin" />
        ) : (
          <Gavel className="w-5 h-5" />
        )}
      </div>
    </div>
  );
};
