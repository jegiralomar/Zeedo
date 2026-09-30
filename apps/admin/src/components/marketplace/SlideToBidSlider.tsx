'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Gavel, Check, ChevronRight } from 'lucide-react';

interface SlideToBidSliderProps {
  onConfirm: () => void;
  amountIqd: number;
  disabled?: boolean;
  label?: string;
}

export const SlideToBidSlider: React.FC<SlideToBidSliderProps> = ({
  onConfirm,
  amountIqd,
  disabled = false,
  label = 'Slide to Place Bid',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isConfirmed, setIsConfirmed] = useState(false);

  const startDrag = (clientX: number) => {
    if (disabled || isConfirmed) return;
    setIsDragging(true);
    updateProgress(clientX);
  };

  const updateProgress = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width - 52; // thumb size
    const currentX = Math.max(0, Math.min(clientX - rect.left - 26, width));
    const progress = currentX / width;
    setDragProgress(progress);

    if (progress >= 0.88) {
      triggerConfirm();
    }
  };

  const triggerConfirm = () => {
    setIsDragging(false);
    setDragProgress(1);
    setIsConfirmed(true);
    onConfirm();

    setTimeout(() => {
      setIsConfirmed(false);
      setDragProgress(0);
    }, 1800);
  };

  const handleTouchStart = (e: React.TouchEvent) => startDrag(e.touches[0].clientX);
  const handleMouseDown = (e: React.MouseEvent) => startDrag(e.clientX);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      updateProgress(e.touches[0].clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateProgress(e.clientX);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (dragProgress < 0.88) {
        // Snap back animation
        setDragProgress(0);
      }
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isDragging, dragProgress]);

  return (
    <div
      ref={containerRef}
      className={`relative h-14 rounded-2xl p-1 select-none overflow-hidden transition-all duration-200 border ${
        disabled
          ? 'opacity-40 pointer-events-none bg-slate-100 border-slate-200'
          : isConfirmed
          ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
          : 'bg-slate-100 border-slate-200/80'
      }`}
    >
      {/* Background Fill Track */}
      <div
        className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-2xl transition-all duration-75"
        style={{ width: `${Math.max(52, dragProgress * 100)}%` }}
      />

      {/* Shimmer Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
        <span
          className={`text-xs font-bold tracking-tight transition-opacity duration-200 flex items-center gap-1.5 ${
            isConfirmed
              ? 'text-white font-black text-sm'
              : dragProgress > 0.4
              ? 'text-slate-400 opacity-30'
              : 'text-slate-600'
          }`}
        >
          {isConfirmed ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Bid Accepted: {amountIqd.toLocaleString()} IQD</span>
            </>
          ) : (
            <>
              <span>{label}</span>
              <span className="font-mono font-black text-slate-900">
                (+{amountIqd.toLocaleString()} IQD)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
            </>
          )}
        </span>
      </div>

      {/* Draggable Thumb */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`absolute top-1 bottom-1 w-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform shadow-md ${
          isConfirmed
            ? 'bg-white text-emerald-600'
            : isDragging
            ? 'bg-emerald-600 text-white scale-105'
            : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
        }`}
        style={{
          transform: `translateX(${
            containerRef.current
              ? dragProgress * (containerRef.current.clientWidth - 56)
              : 0
          }px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {isConfirmed ? (
          <Check className="w-5 h-5 stroke-[3]" />
        ) : (
          <Gavel className="w-5 h-5 text-emerald-600" />
        )}
      </div>
    </div>
  );
};
