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
  title: 'ZEEDO — Bid. Win. Own. | Iraq Premier Live Auctions',
  description:
    '100% Cash-on-Delivery Live Auctions across Iraq. Bid on authentic electronics, luxury items, and deals with doorstep inspection. زايد. اربح. امتلك.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
