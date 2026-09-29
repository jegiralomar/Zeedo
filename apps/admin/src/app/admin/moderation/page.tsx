'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { MultiDialectReviewStudio } from '@/components/moderation/MultiDialectReviewStudio';

export default function ModerationPage() {
  return (
    <>
      <Header
        title="Listing Moderation & Approval"
        subtitle="Review merchant submissions, multilingual specifications, and pricing before publishing"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <MultiDialectReviewStudio />
      </main>
    </>
  );
}
