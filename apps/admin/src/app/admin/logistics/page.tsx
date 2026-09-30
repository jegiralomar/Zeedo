'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { PrintCenter } from '@/components/logistics/PrintCenter';

export default function LogisticsPage() {
  return (
    <>
      <Header
        title="Logistics & Print Center"
        subtitle="4x6&quot; AWB Thermal Slips & 3PL Route Manifests"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <PrintCenter />
      </main>
    </>
  );
}
