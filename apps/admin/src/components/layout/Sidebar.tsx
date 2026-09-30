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
  Printer,
  Store,
  Megaphone,
  Coins,
  Globe2,
  Users,
  ScrollText,
  LogOut,
  LogIn,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { users, auctions, currentUser, logoutStaff, tickets } = useAdminStore();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('zeedo_admin_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

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
      title: 'CORE PLATFORM',
      items: [
        {
          label: 'Overview Dashboard',
          href: '/',
          icon: LayoutDashboard,
        },
        {
          label: 'Active Bids',
          href: '/auctions',
          icon: Gavel,
          badge: liveAuctionsCount > 0 ? `${liveAuctionsCount} Live` : null,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
      ],
    },
    {
      title: 'MODERATION & GATING',
      items: [
        {
          label: 'Split-Screen KYC',
          href: '/kyc',
          icon: ShieldCheck,
          badge: pendingKycCount > 0 ? pendingKycCount : null,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        },
        {
          label: 'Listing Moderation',
          href: '/moderation',
          icon: FileSpreadsheet,
          badge: pendingModerationCount > 0 ? pendingModerationCount : null,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        },
      ],
    },
    {
      title: 'OPERATIONS & GROWTH',
      items: [
        {
          label: 'Logistics & Print',
          href: '/logistics',
          icon: Printer,
          badge: readyLogisticsCount > 0 ? readyLogisticsCount : null,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        },
        {
          label: 'Merchants & Sellers',
          href: '/sellers',
          icon: Store,
        },
        {
          label: 'Marketing & CMS',
          href: '/cms',
          icon: Megaphone,
        },
        {
          label: 'Support & Tickets',
          href: '/support',
          icon: Headphones,
          badge: openTicketsCount > 0 ? `${openTicketsCount} Open` : null,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        },
      ],
    },
    {
      title: 'ADMIN & COMPLIANCE',
      items: [
        {
          label: 'Team & Roles',
          href: '/team',
          icon: Users,
        },
        {
          label: 'Audit Trail Logs',
          href: '/audit',
          icon: ScrollText,
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
      className={`bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-screen no-print text-slate-800 z-40 transition-all duration-300 relative ${
        collapsed ? 'w-[76px]' : 'w-[260px]'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-100 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href={pathPrefix || '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#5B50D6] text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl">⚖️</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">ZEEDO</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#EEEDFB] text-[#5B50D6] border border-[#D8D4F7]">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Operations & Management
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
          <div className="flex justify-center py-2 border-b border-slate-100">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="p-3 space-y-5">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const itemHref = pathPrefix
                    ? `${pathPrefix}${item.href === '/' ? '' : item.href}` || '/admin'
                    : item.href;
                  const isActive =
                    pathname === itemHref ||
                    (item.href === '/' && (pathname === '/' || pathname === '/admin')) ||
                    (item.href !== '/' && pathname.startsWith(itemHref));

                  const IconComp = item.icon;

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={itemHref}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all relative ${
                          collapsed
                            ? 'w-11 h-11 mx-auto justify-center'
                            : 'px-3 py-2.5 justify-between'
                        } ${
                          isActive
                            ? 'bg-[#EEEDFB] text-[#5B50D6] font-bold border-r-2 border-[#5B50D6]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#5B50D6]' : 'text-slate-500 group-hover:text-slate-900'
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
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </Link>

                      {/* Tooltip on Hover (When Collapsed) */}
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
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
      <div className="p-3 border-t border-slate-200/80 space-y-2.5 bg-slate-50/50">

        {/* Staff User Profile Card */}
        {currentUser ? (
          <div className={`rounded-xl bg-white border border-slate-200/80 shadow-2xs ${collapsed ? 'p-2 flex flex-col items-center' : 'p-2.5 space-y-2'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#5B50D6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</div>
                  </div>
                )}
              </div>
            </div>

            {!collapsed && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#EEEDFB] text-[#5B50D6] border border-[#D8D4F7]">
                  {roleConfig.roleLabel}
                </span>

                <button
                  onClick={() => {
                    logoutStaff();
                    router.push(pathPrefix ? `${pathPrefix}/login` : '/login');
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {collapsed && (
              <button
                onClick={() => {
                  logoutStaff();
                  router.push(pathPrefix ? `${pathPrefix}/login` : '/login');
                }}
                className="mt-1 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <Link
            href={pathPrefix ? `${pathPrefix}/login` : '/login'}
            className="w-full py-2 px-3 rounded-xl bg-[#5B50D6] hover:bg-[#4A40C4] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {!collapsed && <span>Staff Sign In</span>}
          </Link>
        )}
      </div>
    </aside>
  );
};
