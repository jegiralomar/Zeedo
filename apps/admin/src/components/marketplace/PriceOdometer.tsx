'use client';

import React, { useEffect, useState } from 'react';

interface PriceOdometerProps {
  value: number;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PriceOdometer: React.FC<PriceOdometerProps> = ({
  value,
  currency = 'IQD',
  className = '',
  size = 'md',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const start = displayValue;
      const end = value;
      const duration = 400; // ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(start + (end - start) * easeProgress);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, displayValue]);

  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black tracking-tight',
  };

  return (
    <div className={`inline-flex items-baseline gap-1.5 font-mono select-none ${className}`}>
      <span
        className={`transition-all duration-300 ${sizeClasses[size]} ${
          isAnimating ? 'text-emerald-500 scale-105' : 'text-slate-900'
        }`}
      >
        {displayValue.toLocaleString()}
      </span>
      {currency && (
        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider font-sans">
          {currency}
        </span>
      )}
    </div>
  );
};
