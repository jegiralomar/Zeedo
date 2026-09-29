'use client';

import React from 'react';
import { MarketplaceLayoutShell } from '@/components/marketplace/MarketplaceLayoutShell';
import BuyerMarketplacePage from './marketplace/page';

export default function RootMarketplaceEntry() {
  return (
    <MarketplaceLayoutShell>
      <BuyerMarketplacePage />
    </MarketplaceLayoutShell>
  );
}
