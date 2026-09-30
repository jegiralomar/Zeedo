'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, Radio, MapPin } from 'lucide-react';

interface LiveBidTickerPillProps {
  recentBids?: Array<{
    bidderName: string;
    city?: string;
    amountIqd: number;
    timeAgo?: string;
  }>;
  className?: string;
}

const DEFAULT_CITIES = ['Erbil', 'Sulaymaniyah', 'Duhok', 'Baghdad', 'Kirkuk', 'Basra'];

export const LiveBidTickerPill: React.FC<LiveBidTickerPillProps> = ({
  recentBids = [],
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback realistic activity events if recent bids empty
  const events = recentBids.length > 0
    ? recentBids
    : [
        { bidderName: 'Buyer', city: 'Erbil', amountIqd: 1000, timeAgo: 'Just now' },
        { bidderName: 'Buyer', city: 'Sulaymaniyah', amountIqd: 2000, timeAgo: '1m ago' },
        { bidderName: 'Buyer', city: 'Duhok', amountIqd: 3000, timeAgo: '2m ago' },
      ];

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  const current = events[currentIndex];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 backdrop-blur-md text-[11px] font-medium text-slate-700 shadow-2xs select-none transition-all duration-300 ${className}`}
    >
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <span className="text-slate-500 font-mono text-[10px]">LIVE FEED</span>
      <span className="text-slate-300">•</span>

      <span className="flex items-center gap-1 font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>{current.city || 'Erbil'}</span>
      </span>

      <span className="text-slate-500 font-mono">
        +{current.amountIqd.toLocaleString()} IQD
      </span>

      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
        ({current.timeAgo || '3s ago'})
      </span>
    </div>
  );
};
