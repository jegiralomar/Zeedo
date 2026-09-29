'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { isRouteAllowed, ROLE_PERMISSIONS } from '@/utils/rbac';
import {
  LayoutDashboard,
  ShieldCheck,
  FileSpreadsheet,
  Flame,
  Printer,
  Store,
  Megaphone,
  Sparkles,
  Coins,
  MapPin,
  Globe2,
  Users,
  ScrollText,
  LogOut,
  LogIn,
  Headphones,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { users, auctions, currentUser, logoutStaff, tickets } = useAdminStore();

  const userRole = currentUser?.role || 'super_admin';
  const roleConfig = ROLE_PERMISSIONS[userRole];

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
          icon: <LayoutDashboard className="w-[1.15rem] h-[1.15rem]" />,
        },
        {
          label: 'Live Auction War Room',
          href: '/auctions',
          icon: <Flame className="w-[1.15rem] h-[1.15rem]" />,
          badge: liveAuctionsCount > 0 ? `${liveAuctionsCount} Live` : null,
          badgeColor: 'bg-[#B4F105] text-[#051C12] font-black',
        },
      ],
    },
    {
      title: 'MODERATION & GATING',
      items: [
        {
          label: 'Split-Screen KYC',
          href: '/kyc',
          icon: <ShieldCheck className="w-[1.15rem] h-[1.15rem]" />,
          badge: pendingKycCount > 0 ? pendingKycCount : null,
          badgeColor: 'bg-[#EF4444] text-white font-bold',
        },
        {
          label: 'Listing Moderation',
          href: '/moderation',
          icon: <FileSpreadsheet className="w-[1.15rem] h-[1.15rem]" />,
          badge: pendingModerationCount > 0 ? pendingModerationCount : null,
          badgeColor: 'bg-[#B4F105] text-[#051C12] font-bold',
        },
      ],
    },
    {
      title: 'OPERATIONS & GROWTH',
      items: [
        {
          label: 'Logistics & Print Center',
          href: '/logistics',
          icon: <Printer className="w-[1.15rem] h-[1.15rem]" />,
          badge: readyLogisticsCount > 0 ? readyLogisticsCount : null,
          badgeColor: 'bg-[#38bdf8] text-[#051C12] font-bold',
        },
        {
          label: 'Merchants & Sellers',
          href: '/sellers',
          icon: <Store className="w-[1.15rem] h-[1.15rem]" />,
        },
        {
          label: 'Marketing & CMS',
          href: '/cms',
          icon: <Megaphone className="w-[1.15rem] h-[1.15rem]" />,
        },
        {
          label: 'Support & Tickets',
          href: '/support',
          icon: <Headphones className="w-[1.15rem] h-[1.15rem]" />,
          badge: openTicketsCount > 0 ? `${openTicketsCount} Open` : null,
          badgeColor: 'bg-[#EF4444] text-white font-bold',
        },
      ],
    },
    {
      title: 'ADMIN & COMPLIANCE',
      items: [
        {
          label: 'Team & Roles',
          href: '/team',
          icon: <Users className="w-[1.15rem] h-[1.15rem]" />,
        },
        {
          label: 'Audit Trail Logs',
          href: '/audit',
          icon: <ScrollText className="w-[1.15rem] h-[1.15rem]" />,
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
    <aside className="w-[280px] bg-[#051C12] border-r border-white/10 flex flex-col justify-between shrink-0 min-h-screen no-print text-white z-40 transition-all duration-300">
      <div>
        {/* Spark Brand Identity */}
        <div className="p-6 pb-4">
          <Link href={pathPrefix || '/'} className="flex items-center gap-3 group">
            {/* Spark 6-pointed Asterisk SVG */}
            <div className="w-10 h-10 rounded-xl bg-[#072F1F] border border-white/10 flex items-center justify-center text-[#B4F105] shadow-lg group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-[#B4F105]" viewBox="0 0 100 100">
                <g transform="translate(50,50)">
                  <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" />
                  <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" transform="rotate(60)" />
                  <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" transform="rotate(120)" />
                </g>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">ZEEDO</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#B4F105] text-[#051C12]">
                  SPARK
                </span>
              </div>
              <p className="text-[11px] text-[#879A91] font-medium tracking-wide">
                Iraq 100% COD Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 pt-2 space-y-5">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#879A91] opacity-75">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const itemHref = pathPrefix ? `${pathPrefix}${item.href === '/' ? '' : item.href}` || '/admin' : item.href;
                  const isActive = pathname === itemHref || pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={itemHref}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[0.92rem] font-medium transition-all relative ${
                        isActive
                          ? 'text-white bg-white/5 font-semibold before:content-[""] before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-1 before:bg-[#B4F105] before:rounded-r'
                          : 'text-[#879A91] hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-[#B4F105]' : 'text-[#879A91]'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Spark Sidebar Footer & Profile Card */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Platform Indicator */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[#879A91]">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#B4F105]" />
              Start Rule
            </span>
            <span className="font-mono font-bold text-white">1,000 IQD</span>
          </div>
          <div className="flex items-center justify-between text-[#879A91]">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#B4F105]" />
              Dialects
            </span>
            <span className="font-mono text-white">4 Regional</span>
          </div>
        </div>

        {/* User Profile & Session Card */}
        {currentUser ? (
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-black text-xs shrink-0 border border-white/10">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#879A91] truncate font-mono">{currentUser.email}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${roleConfig.badgeBg} ${roleConfig.badgeText}`}
              >
                {roleConfig.roleLabel}
              </span>

              <button
                onClick={() => {
                  logoutStaff();
                  router.push('/login');
                }}
                className="text-[11px] text-[#879A91] hover:text-[#EF4444] font-medium flex items-center gap-1 transition-colors"
                title="Sign Out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full btn-spark-lime text-xs justify-center py-2.5"
          >
            <LogIn className="w-4 h-4 text-[#051C12]" />
            <span>Staff Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
