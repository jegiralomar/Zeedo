import { StaffRole } from '@/types';

export interface RoleConfig {
  allowedRoutes: string[];
  defaultHub: string;
  roleLabel: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const ROLE_PERMISSIONS: Record<StaffRole, RoleConfig> = {
  super_admin: {
    allowedRoutes: [
      '/',
      '/auctions',
      '/buyers',
      '/kyc',
      '/moderation',
      '/logistics',
      '/sellers',
      '/cms',
      '/support',
      '/team',
      '/audit',
    ],
    defaultHub: '/',
    roleLabel: 'Super Admin',
    badgeBg: 'bg-[#B4F105]',
    badgeText: 'text-[#051C12]',
    description: 'Full unconstrained platform control, seller provisioning, commission edits & team management.',
  },
  moderator: {
    allowedRoutes: ['/moderation', '/kyc', '/buyers', '/cms', '/auctions', '/support'],
    defaultHub: '/moderation',
    roleLabel: 'Listing & KYC Moderator',
    badgeBg: 'bg-[#FFEDD5]',
    badgeText: 'text-[#F97316]',
    description: '4-Dialect listing approval, KYC document verification, and CMS notifications.',
  },
  dispatcher: {
    allowedRoutes: ['/logistics', '/auctions', '/support'],
    defaultHub: '/logistics',
    roleLabel: 'Logistics Dispatcher',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0284C7]',
    description: 'Thermal AWB label generation and 3PL courier route manifest handoffs.',
  },
  auditor: {
    allowedRoutes: ['/', '/audit', '/buyers', '/auctions'],
    defaultHub: '/audit',
    roleLabel: 'Financial & Compliance Auditor',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#7E22CE]',
    description: 'Read-only audit trail inspection and COD financial volume tracking.',
  },
};

export function isRouteAllowed(role: StaffRole, pathname: string): boolean {
  if (role === 'super_admin') return true;
  const config = ROLE_PERMISSIONS[role];
  if (!config) return false;
  const cleanPath = pathname.replace(/^\/admin/, '') || '/';
  return config.allowedRoutes.some((route) => {
    if (route === '/') return cleanPath === '/';
    return cleanPath.startsWith(route);
  });
}
