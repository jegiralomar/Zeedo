'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { MerchantFulfillmentSummary } from '@/components/logistics/MerchantFulfillmentSummary';

export default function LogisticsPage() {
  return (
    <>
      <Header
        title="Merchant Fulfillment & Accounts"
        subtitle="Store Details, Active Listings, Sold Items with Buyer Information & Payment Collection"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <MerchantFulfillmentSummary />
      </main>
    </>
  );
}
