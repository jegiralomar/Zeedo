'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { LiveWarRoom } from '@/components/auctions/LiveWarRoom';

export default function AuctionsPage() {
  return (
    <>
      <Header
        title="Live Auctions Monitor"
        subtitle="Real-time live bidding feed, anti-sniping soft close monitoring, and moderator controls"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <LiveWarRoom />
      </main>
    </>
  );
}
