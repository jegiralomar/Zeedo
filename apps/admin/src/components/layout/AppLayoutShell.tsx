'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { isRouteAllowed, ROLE_PERMISSIONS } from '@/utils/rbac';
import { Sidebar } from '@/components/layout/Sidebar';

export const AppLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, addToast, syncAuctionsFromDb, syncSellersFromDb } = useAdminStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Initial sync from DB
    syncAuctionsFromDb();
    syncSellersFromDb();

    // Periodic sync every 15s to catch new merchant listings in real-time
    const interval = setInterval(() => {
      syncAuctionsFromDb();
      syncSellersFromDb();
    }, 15000);

    return () => clearInterval(interval);
  }, [syncAuctionsFromDb, syncSellersFromDb]);

  const isLoginPage = pathname === '/login' || pathname === '/admin/login';
  const pathPrefix = pathname.startsWith('/admin') ? '/admin' : '';

  useEffect(() => {
    if (!mounted || isLoginPage) return;

    // If not logged in, route to login
    if (!currentUser) {
      router.push(`${pathPrefix}/login`);
      return;
    }

    // If logged in, check role permissions
    if (!isRouteAllowed(currentUser.role, pathname)) {
      const rawHub = ROLE_PERMISSIONS[currentUser.role]?.defaultHub || '/';
      const targetHub = `${pathPrefix}${rawHub === '/' ? '' : rawHub}` || '/';
      addToast(
        'warning',
        `Access to ${pathname} restricted for role ${currentUser.role.replace('_', ' ').toUpperCase()}. Redirected to your operations hub.`
      );
      router.push(targetHub);
    }
  }, [mounted, pathname, currentUser, isLoginPage, router, addToast, pathPrefix]);

  if (isLoginPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F6F5]">{children}</div>
    </div>
  );
};
