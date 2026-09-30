'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { SplitScreenKycCard } from '@/components/kyc/SplitScreenKycCard';

export default function KycPage() {
  return (
    <>
      <Header
        title="Split-Screen KYC Moderation Card"
        subtitle="Buyer Verification: WhatsApp OTP Authentication & Delivery Location GPS Pin"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <SplitScreenKycCard />
      </main>
    </>
  );
}
