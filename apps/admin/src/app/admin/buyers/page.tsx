'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { BuyersDirectoryView } from '@/components/buyers/BuyersDirectoryView';

export default function BuyersPage() {
  return (
    <>
      <Header
        title="Buyer Accounts"
        subtitle="Registered Iraqi Buyers — Authenticated via WhatsApp OTP & Rooftop Delivery Pins"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <BuyersDirectoryView />
      </main>
    </>
  );
}
