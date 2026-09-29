'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { MarketingCmsCenter } from '@/components/cms/MarketingCmsCenter';

export default function CmsPage() {
  return (
    <>
      <Header
        title="Marketing & Mobile Engagement CMS"
        subtitle="Schedule Home-Screen Hero Banners and Dispatch Localized Push Notifications"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <MarketingCmsCenter />
      </main>
    </>
  );
}
