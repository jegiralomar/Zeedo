'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { FinancialCockpitView } from '@/components/finance/FinancialCockpitView';

export default function FinancePage() {
  return (
    <>
      <Header
        title="Financial Cockpit & Settlements"
        subtitle="Platform GMV, 10% Closing Fees, Iraqi Dinar Parallel Conversions & Merchant Ledgers"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <FinancialCockpitView />
      </main>
    </>
  );
}
