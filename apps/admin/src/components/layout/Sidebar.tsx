'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { isRouteAllowed, ROLE_PERMISSIONS } from '@/utils/rbac';
import {
  LayoutDashboard,
  Gavel,
  ShieldCheck,
  FileSpreadsheet,
  Truck,
  Store,
  Megaphone,
  Coins,
  Users,
  ScrollText,
  LogOut,
  Headphones,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Settings,
  FlaskConical,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { users, sellers, auctions, currentUser, logoutStaff, tickets, syncUsersFromDb } = useAdminStore();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setSearchQuery(typeof window !== 'undefined' ? window.location.search : '');
    syncUsersFromDb?.();
    const saved = localStorage.getItem('zeedo_admin_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }

    const handlePopState = () => {
      setSearchQuery(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncUsersFromDb, pathname]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('zeedo_admin_sidebar_collapsed', String(next));
  };

  const userRole = currentUser?.role || 'super_admin';
  const roleConfig = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.super_admin;

  const pendingKycCount = users.filter((u) => u.kycStatus === 'pending').length;
  const pendingModerationCount = auctions.filter((a) => a.status === 'moderation_pending').length;
  const liveAuctionsCount = auctions.filter((a) => a.status === 'live').length;
  const readyLogisticsCount = auctions.filter((a) => a.codStatus === 'ready_for_dispatch').length;
  const openTicketsCount = (tickets || []).filter((t) => t.status === 'open').length;

  const pathPrefix = pathname.startsWith('/admin') ? '/admin' : '';

  const rawMenuSections = [
    {
      title: 'AUCTIONS & LOTS',
      items: [
        {
          label: 'Overview Dashboard',
          href: '/',
          icon: LayoutDashboard,
        },
        {
          label: 'Live Bidding Center',
          href: '/auctions',
          icon: Gavel,
          badge: liveAuctionsCount > 0 ? `${liveAuctionsCount} Live` : null,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          label: 'Listing Moderation',
          href: '/moderation',
          icon: FileSpreadsheet,
          badge: pendingModerationCount > 0 ? pendingModerationCount : null,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
      ],
    },
    {
      title: 'ACCOUNTS & USERS',
      items: [
        {
          label: 'Buyer Accounts',
          href: '/buyers',
          icon: Users,
          badge: users.length > 0 ? `${users.length}` : null,
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        },
        {
          label: 'Merchant Accounts',
          href: '/sellers',
          icon: Store,
          badge: sellers.length > 0 ? `${sellers.length}` : null,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          label: 'Support & Disputes',
          href: '/support',
          icon: Headphones,
          badge: openTicketsCount > 0 ? `${openTicketsCount} Open` : null,
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        },
      ],
    },
    {
      title: 'GROWTH & CMS',
      items: [
        {
          label: 'Marketing & CMS',
          href: '/cms',
          icon: Megaphone,
        },
      ],
    },
    {
      title: 'GOVERNANCE & SYSTEM',
      items: [
        {
          label: 'Team & Roles',
          href: '/team',
          icon: UserCheck,
        },
        {
          label: 'Audit Trail Logs',
          href: '/audit',
          icon: ScrollText,
        },
        {
          label: 'System Settings',
          href: '/settings',
          icon: Settings,
        },
        {
          label: 'Testing Sandbox',
          href: '/settings?tab=sandbox',
          icon: FlaskConical,
          badge: 'TEST',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-mono font-bold',
        },
      ],
    },
  ];

  // RBAC Filter: Only render sections and items permitted for the active role
  const menuSections = rawMenuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isRouteAllowed(userRole, item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`bg-white border-r border-[#ECEFF3] flex flex-col justify-between shrink-0 min-h-screen no-print text-[#17223B] z-40 transition-all duration-300 relative ${
        collapsed ? 'w-[76px]' : 'w-[264px]'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className={`p-4 border-b border-[#ECEFF3] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href={pathPrefix || '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <img src="/brand/zeedo-icon.png" alt="ZEEDO" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base text-[#17223B] tracking-tight font-['Montserrat']">ZEEDO</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#FFF1F3] text-[#F83758] border border-[#FFE4E8]">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Live Auctions & Commissions
                </p>
              </div>
            )}
          </Link>

          {/* Expand/Collapse Toggle Button */}
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {collapsed && (
          <div className="flex justify-center py-2 border-b border-[#ECEFF3]">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#F83758] hover:bg-[#FFF1F3] transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-['Montserrat']">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const [baseHref, queryPart] = item.href.split('?');
                  const itemHref = pathPrefix
                    ? `${pathPrefix}${item.href === '/' ? '' : item.href}` || '/admin'
                    : item.href;
                  const targetBase = pathPrefix
                    ? `${pathPrefix}${baseHref === '/' ? '' : baseHref}` || '/admin'
                    : baseHref;

                  let isActive = false;
                  if (queryPart) {
                    const matchesPath = pathname === targetBase || pathname.startsWith(targetBase);
                    isActive = matchesPath && searchQuery.includes(queryPart);
                  } else if (item.href === '/settings') {
                    isActive =
                      (pathname === targetBase || pathname.startsWith(targetBase)) &&
                      !searchQuery.includes('tab=sandbox');
                  } else {
                    isActive =
                      pathname === targetBase ||
                      (item.href === '/' && (pathname === '/' || pathname === '/admin')) ||
                      (item.href !== '/' && pathname.startsWith(targetBase));
                  }

                  const IconComp = item.icon;

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={itemHref}
                        onClick={() => {
                          if (queryPart) {
                            setSearchQuery(`?${queryPart}`);
                          } else if (item.href === '/settings') {
                            setSearchQuery('');
                          }
                        }}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all relative ${
                          collapsed
                            ? 'w-11 h-11 mx-auto justify-center'
                            : 'px-3 py-2.5 justify-between'
                        } ${
                          isActive
                            ? 'bg-[#FFF1F3] text-[#F83758] font-bold border-l-4 border-[#F83758] shadow-xs'
                            : 'text-slate-600 hover:text-[#17223B] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#F83758]' : 'text-slate-400 group-hover:text-slate-700'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!collapsed && item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Notification Dot */}
                        {collapsed && item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F83758] ring-2 ring-white" />
                        )}
                      </Link>

                      {/* Tooltip on Hover (When Collapsed) */}
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-[#17223B] text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F83758] text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Indicators */}
      <div className="p-3 border-t border-[#ECEFF3] space-y-2.5 bg-slate-50/60">

        {/* Staff User Profile Card */}
        {currentUser ? (
          <div className={`rounded-xl bg-white border border-[#ECEFF3] shadow-xs ${collapsed ? 'p-2 flex flex-col items-center' : 'p-2.5 space-y-2'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F83758] to-[#4392F9] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#17223B] truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={() => {
                    logoutStaff();
                    router.push(pathPrefix ? `${pathPrefix}/login` : '/login');
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {!collapsed && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                <span className="font-semibold text-slate-500">Access Tier:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${roleConfig.badgeBg} ${roleConfig.badgeText}`}>
                  {roleConfig.roleLabel}
                </span>
              </div>
            )}
          </div>
        ) : (
          <Link
            href={pathPrefix ? `${pathPrefix}/login` : '/login'}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-[#ECEFF3] text-xs font-bold text-[#17223B] hover:bg-[#FFF1F3] hover:text-[#F83758] hover:border-[#FFE4E8] transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            {!collapsed && <span>Staff Login</span>}
          </Link>
        )}

        {/* Live System Heartbeat */}
        <div className="flex items-center justify-between px-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {!collapsed && (
              <span className="text-[10px] font-semibold text-slate-500">Engine Online</span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[9px] font-mono text-slate-400">v2.4.0</span>
          )}
        </div>
      </div>
    </aside>
  );
};
