import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppLayoutShell } from '@/components/layout/AppLayoutShell';
import { ToastContainer } from '@/components/layout/ToastContainer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'ZEEDO — Iraq Premier Live Auction Ecosystem',
  description:
    '100% Cash-on-Delivery Live Auctions across Iraq and Kurdistan. Verified items, doorstep inspection, and real-time live bidding.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full bg-white text-[#17223B] font-sans antialiased selection:bg-[#F83758] selection:text-white">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
