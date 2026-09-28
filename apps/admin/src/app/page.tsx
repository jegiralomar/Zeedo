'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard Overview"
        subtitle="Platform Performance & Real-time Moderation KPIs"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <DashboardOverview />
      </main>
    </>
  );
}
