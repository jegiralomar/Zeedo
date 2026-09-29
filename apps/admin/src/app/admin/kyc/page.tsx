'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { SplitScreenKycCard } from '@/components/kyc/SplitScreenKycCard';

export default function KycPage() {
  return (
    <>
      <Header
        title="Split-Screen KYC Moderation Card"
        subtitle="Gate 1 (Government ID OCR) & Gate 2 (Mandatory Rooftop Delivery GPS Pin Drop)"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <SplitScreenKycCard />
      </main>
    </>
  );
}
