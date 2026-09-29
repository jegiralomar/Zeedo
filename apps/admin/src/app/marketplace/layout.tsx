import React from 'react';
import { MarketplaceLayoutShell } from '@/components/marketplace/MarketplaceLayoutShell';

export const metadata = {
  title: 'ZEEDO BID — Live Auctions & 100% Cash-on-Delivery Marketplace',
  description:
    'Experience live Iraqi auctions with 1,000 IQD starting prices, anti-sniping protection, and doorstep cash-on-delivery inspection.',
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceLayoutShell>{children}</MarketplaceLayoutShell>;
}
