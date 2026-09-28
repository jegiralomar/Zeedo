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
  title: 'ZEEDO BID APP — Spark Admin Console',
  description:
    'Web-Based Admin Panel for Iraq 100% Cash-on-Delivery Auction Platform. Powered by Spark Admin design system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full bg-[#F4F6F5] text-[#0B130F] flex font-sans antialiased selection:bg-[#B4F105] selection:text-[#051C12]">
        <AppLayoutShell>{children}</AppLayoutShell>
        <ToastContainer />
      </body>
    </html>
  );
}
