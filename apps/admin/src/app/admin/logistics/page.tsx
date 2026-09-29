'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { PrintCenter } from '@/components/logistics/PrintCenter';

export default function LogisticsPage() {
  return (
    <>
      <Header
        title="Logistics & Dispatch Operations"
        subtitle="100% Cash-on-Delivery fulfillment, thermal AWB generation, and 3PL courier route manifests"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <PrintCenter />
      </main>
    </>
  );
}
