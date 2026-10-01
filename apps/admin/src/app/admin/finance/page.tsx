'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function FinanceRedirectPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const prefix = pathname.startsWith('/admin') ? '/admin' : '';
    router.replace(`${prefix}/sellers?tab=commissions`);
  }, [router, pathname]);

  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-3 border-[#F83758] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Redirecting to Merchant Commissions...</p>
      </div>
    </div>
  );
}
