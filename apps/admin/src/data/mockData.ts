import {
  UserBuyer,
  SellerMerchant,
  ListingAuction,
  CourierManifest,
  MobileBanner,
  PushNotificationMessage,
  SupportTicket,
  StaffUser,
  AuditLogEntry,
  MerchantReceipt,
} from '../types';

/**
 * Production Iraqi Buyer Accounts
 * Every buyer account is 100% verified (WhatsApp OTP Confirmed + Rooftop GPS Location Set).
 * Unverified accounts cannot log in to ZEEDO.
 */
export const INITIAL_USERS: UserBuyer[] = [];

/**
 * Production Iraqi Merchant Accounts
 * Provisioned verified merchants with active commission rates and direct COD handling.
 */
export const INITIAL_SELLERS: SellerMerchant[] = [];

export const INITIAL_AUCTIONS: ListingAuction[] = [];

export const INITIAL_MANIFESTS: CourierManifest[] = [];

export const INITIAL_BANNERS: MobileBanner[] = [];

export const INITIAL_NOTIFICATIONS: PushNotificationMessage[] = [];

/**
 * Default Master Administrator Credentials:
 * Username / Identifier: ZAdmin9898
 * Password: ZEEDOA98
 */
export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'stf-admin-master',
    name: 'ZEEDO Master Admin',
    email: 'ZAdmin9898',
    phone: '+964 750 000 0000',
    password: 'ZEEDOA98',
    role: 'super_admin',
    status: 'active',
    createdAt: '2026-09-30T00:00:00Z',
    lastLogin: '2026-09-30T00:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-30T00:00:00Z',
    actorId: 'stf-admin-master',
    actorName: 'ZEEDO Master Admin',
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOTSTRAP',
    category: 'auth',
    targetId: 'sys-01',
    description: 'ZEEDO Platform initialized in Production Mode with Master Admin',
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_RECEIPTS: MerchantReceipt[] = [];

