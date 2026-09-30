'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { ActiveBidsCommandCenter } from '@/components/auctions/ActiveBidsCommandCenter';

export default function AuctionsPage() {
  return (
    <>
      <Header
        title="Active Bids"
        subtitle="Real-Time Auction Controls, Timer Extensions & Bidder Inspection"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <ActiveBidsCommandCenter />
      </main>
    </>
  );
}
