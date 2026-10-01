'use client';

import React, { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { SellerProvisioningCenter } from '@/components/sellers/SellerProvisioningCenter';

export default function SellersPage() {
  return (
    <>
      <Header
        title="Merchant Accounts"
        subtitle="Manage Iraqi Merchants, Listing Autonomy Flags, 1,000 IQD Posting Fees & Auction Commissions"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading merchant accounts...</div>}>
          <SellerProvisioningCenter />
        </Suspense>
      </main>
    </>
  );
}
