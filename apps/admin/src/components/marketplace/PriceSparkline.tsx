'use client';

import React from 'react';
import { BidRecord } from '@/types/marketplace';

interface PriceSparklineProps {
  bidsHistory: BidRecord[];
  startingPriceIqd?: number;
  currentBidIqd: number;
  width?: number;
  height?: number;
  className?: string;
}

export const PriceSparkline: React.FC<PriceSparklineProps> = ({
  bidsHistory = [],
  startingPriceIqd = 1000,
  currentBidIqd,
  width = 160,
  height = 42,
  className = '',
}) => {
  // Construct chronological data points
  const points = [
    startingPriceIqd,
    ...bidsHistory.slice().reverse().map((b) => b.amountIqd),
    currentBidIqd,
  ];

  // Remove consecutive duplicates for clean slope
  const cleanPoints = points.filter((p, i, arr) => i === 0 || p !== arr[i - 1]);

  if (cleanPoints.length < 2) {
    cleanPoints.unshift(startingPriceIqd);
  }

  const min = Math.min(...cleanPoints);
  const max = Math.max(...cleanPoints, startingPriceIqd + 1000);
  const range = max - min || 1;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const coordinates = cleanPoints.map((val, idx) => {
    const x = padding + (idx / (cleanPoints.length - 1)) * chartWidth;
    const y = height - padding - ((val - min) / range) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coordinates.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <div className={`relative inline-block ${className}`} title="Bid Price Trajectory">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill under curve */}
        <path d={areaD} fill="url(#sparklineGrad)" />

        {/* Trend stroke */}
        <path
          d={pathD}
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current price marker dot */}
        {coordinates.length > 0 && (
          <circle
            cx={coordinates[coordinates.length - 1].split(',')[0]}
            cy={coordinates[coordinates.length - 1].split(',')[1]}
            r="3.5"
            fill="#059669"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
};
