'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { SupportTicketsHelpdesk } from '@/components/support/SupportTicketsHelpdesk';

export default function SupportPage() {
  return (
    <>
      <Header
        title="Support & Helpdesk"
        subtitle="Manage customer inquiries, courier dispatch disputes, and delivery inspection tickets"
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <SupportTicketsHelpdesk />
      </main>
    </>
  );
}
