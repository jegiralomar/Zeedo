'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { MultiDialectReviewStudio } from '@/components/moderation/MultiDialectReviewStudio';

export default function ModerationPage() {
  return (
    <>
      <Header
        title="4-Dialect Listing Moderation Queue"
        subtitle="Review Gemini AI-extracted specs across English, Arabic, Kurdish Sorani, and Kurdish Badini"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <MultiDialectReviewStudio />
      </main>
    </>
  );
}
