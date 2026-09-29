'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { LiveWarRoom } from '@/components/auctions/LiveWarRoom';

export default function AuctionsPage() {
  return (
    <>
      <Header
        title="Live Auction War Room"
        subtitle="Real-Time Bidding Mechanics, 60s Soft-Close Anti-Sniping & Low-Data Socket Stream"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <LiveWarRoom />
      </main>
    </>
  );
}
