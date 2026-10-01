import React from 'react';
import { LandingPageContent } from '@/components/landing/LandingPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZEEDO — تطبيق المزادات الحية الأول في العراق | Live Auction Mobile App',
  description:
    'حمّل تطبيق ZEEDO الآن وابدأ المزايدة من 1,000 دينار فقط على بضائع أصلية مع الدفع عند الاستلام والمعاينة في جميع محافظات العراق.',
  keywords: [
    'مزادات العراق',
    'تطبيق مزادات',
    'Zeedo',
    'مزايدات بغداد',
    'مزايدات أربيل',
    'Iraqi Live Auctions',
    'Cash on Delivery Iraq',
  ],
  openGraph: {
    title: 'ZEEDO — تطبيق المزادات الحية الأول في العراق',
    description: 'المزايدات تبدأ من 1,000 دينار فقط. كاش عند الاستلام ومعاينة عند باب بيتك.',
    url: 'https://zeedo.bid',
    siteName: 'ZEEDO',
    locale: 'ar_IQ',
    type: 'website',
  },
};

export default function HomePage() {
  return <LandingPageContent />;
}
