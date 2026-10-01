'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { BuyersDirectoryView } from '@/components/buyers/BuyersDirectoryView';

export default function BuyersPage() {
  return (
    <>
      <Header
        title="Buyers Directory & 2-Gate Verification"
        subtitle="Manage Registered Iraqi Buyers, WhatsApp Phone Authentications & Rooftop GPS Delivery Pins"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <BuyersDirectoryView />
      </main>
    </>
  );
}
