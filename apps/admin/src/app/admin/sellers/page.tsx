'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { SellerProvisioningCenter } from '@/components/sellers/SellerProvisioningCenter';

export default function SellersPage() {
  return (
    <>
      <Header
        title="Exclusive Admin Seller Provisioning & Directory"
        subtitle="Manage Merchant Onboarding, Commission Rates, and Auto-Approval Autonomy Flags"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <SellerProvisioningCenter />
      </main>
    </>
  );
}
