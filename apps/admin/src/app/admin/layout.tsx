import React from 'react';
import { AppLayoutShell } from '@/components/layout/AppLayoutShell';

export const metadata = {
  title: 'ZEEDO — Admin Console',
  description: 'Operations, Moderation, Split-Screen KYC & Logistics Center for ZEEDO Bid App',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutShell>{children}</AppLayoutShell>;
}
