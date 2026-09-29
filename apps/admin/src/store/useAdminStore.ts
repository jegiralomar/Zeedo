import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserBuyer,
  SellerMerchant,
  ListingAuction,
  CourierManifest,
  MobileBanner,
  PushNotificationMessage,
  LowDataSocketPayload,
  LanguageCode,
  MultilingualContent,
  KycDocument,
  CodLogisticsStatus,
  ParcelDeliveryStage,
  DeliveryAttempt,
  StaffUser,
  StaffRole,
  AuditLogEntry,
  AuditCategory,
  SupportTicket,
  TicketStatus,
  SupportTicketMessage,
  SellerInvoice,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SELLERS,
  INITIAL_AUCTIONS,
  INITIAL_MANIFESTS,
  INITIAL_BANNERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS,
  INITIAL_TICKETS,
} from '../data/mockData';

interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

interface AdminStoreState {
  users: UserBuyer[];
  sellers: SellerMerchant[];
  auctions: ListingAuction[];
  manifests: CourierManifest[];
  banners: MobileBanner[];
  notifications: PushNotificationMessage[];
  lowDataSocketFeed: LowDataSocketPayload[];
  antiSnipingAlert: { auctionId: string; itemTitle: string; timestamp: string } | null;
  toasts: ToastNotification[];

  // Support & Helpdesk State
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  selectTicket: (id: string | null) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  assignTicketAgent: (id: string, agentName: string) => void;
  replyToTicket: (ticketId: string, text: string, senderName?: string) => void;
  createTicket: (ticket: SupportTicket) => void;

  // Staff RBAC & Audit State
  staffUsers: StaffUser[];
  currentUser: StaffUser | null;
  auditLogs: AuditLogEntry[];

  // Auth & Team RBAC Actions
  loginStaff: (email: string, password: string) => boolean;
  logoutStaff: () => void;
  setCurrentUser: (user: StaffUser | null) => void;
  createStaffUser: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: StaffRole;
  }) => void;
  updateStaffUser: (id: string, updates: Partial<StaffUser>) => void;
  deleteStaffUser: (id: string) => void;
  logAuditEvent: (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorRole'>
  ) => void;

  // Toast actions
  addToast: (type: ToastNotification['type'], message: string) => void;
  removeToast: (id: string) => void;
  clearAntiSnipingAlert: () => void;

  // KYC Actions
  approveKyc: (userId: string) => void;
  rejectKyc: (userId: string, reason: string) => void;
  updateKycOcrFields: (userId: string, fields: Partial<KycDocument>) => void;

  // Invoices & Billing
  invoices: SellerInvoice[];
  generateSellerInvoice: (sellerId: string) => void;
  markInvoicePaid: (invoiceId: string) => void;

  // Seller Provisioning Actions
  provisionSeller: (sellerData: {
    storeName: string;
    ownerName: string;
    phone: string;
    city: string;
    commissionRate: number;
    auto_approve_listings: boolean;
    pickupAddress: string;
    pickupCoordinates: { lat: number; lng: number };
    username?: string;
    password?: string;
  }) => void;
  toggleSellerAutonomy: (sellerId: string) => void;
  updateSellerCommission: (sellerId: string, commissionRate: number) => void;

  // Listing Moderation & Merchant Submission Actions
  createSellerListing: (listingData: Partial<ListingAuction>) => void;
  approveListing: (listingId: string) => void;
  rejectListing: (listingId: string, reason: string) => void;
  updateListingMultilingual: (
    listingId: string,
    lang: LanguageCode,
    content: MultilingualContent
  ) => void;
  relistAuction: (listingId: string) => void;

  // Live Auction Actions & Anti-Sniping
  placeBid: (auctionId: string, bidderId?: string, customAmount?: number) => void;
  triggerAntiSniping: (auctionId: string) => void;
  pauseAuction: (auctionId: string) => void;
  forceEndAuction: (auctionId: string) => void;
  voidAuctionBid: (auctionId: string, bidId: string, reason: string) => void;

  // Logistics & Manifest Actions
  createCourierManifest: (data: {
    courierCompanyName: string;
    courierDriverName: string;
    courierDriverPhone: string;
    courierVehiclePlate: string;
    selectedListingIds: string[];
  }) => void;
  updateCodStatus: (listingId: string, status: CodLogisticsStatus) => void;
  updateParcelStage: (listingId: string, stage: ParcelDeliveryStage, driverNote?: string) => void;
  logDeliveryAttempt: (
    listingId: string,
    attempt: { status: DeliveryAttempt['status']; driverNote: string }
  ) => void;
  markManifestHandedOver: (manifestId: string) => void;

  // CMS Actions
  addBanner: (banner: Omit<MobileBanner, 'id' | 'clicks'>) => void;
  toggleBannerStatus: (bannerId: string) => void;
  deleteBanner: (bannerId: string) => void;
  dispatchPushNotification: (data: {
    title: { en: string; ar: string; ckb: string };
    body: { en: string; ar: string; ckb: string };
    targetAudience: 'all' | 'verified_only' | 'sellers' | 'outbid_bidders';
    deepLinkTarget?: string;
  }) => void;

  // Interactive Mock Simulator Triggers
  simulateIncomingBid: (auctionId?: string) => void;
  simulateNewKycSubmission: () => void;
  simulateNewSellerListing: (autonomous?: boolean) => void;
  resetToDefaults: () => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,
      sellers: INITIAL_SELLERS,
      auctions: INITIAL_AUCTIONS,
      manifests: INITIAL_MANIFESTS,
      banners: INITIAL_BANNERS,
      notifications: INITIAL_NOTIFICATIONS,
      lowDataSocketFeed: [],
      antiSnipingAlert: null,
      toasts: [],
      invoices: [],

      // Support & Helpdesk State
      tickets: INITIAL_TICKETS,
      selectedTicketId: null,

      selectTicket: (id) => set({ selectedTicketId: id }),

      updateTicketStatus: (id, status) => {
        set((state) => {
          const updated = state.tickets.map((t) =>
            t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
          );
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(
                'zeedo_support_sync',
                JSON.stringify({ type: 'STATUS_UPDATE', ticketId: id, status, timestamp: Date.now() })
              );
            } catch (e) {}
          }
          return { tickets: updated };
        });
        get().addToast('success', `Ticket status updated to ${status.replace('_', ' ').toUpperCase()}`);
      },

      assignTicketAgent: (id, agentName) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, assignedAgent: agentName, updatedAt: new Date().toISOString() } : t
          ),
        }));
        get().addToast('info', `Assigned ticket to ${agentName}`);
      },

      replyToTicket: (ticketId, text, senderName) => {
        if (!text.trim()) return;
        const currentStaff = get().currentUser;
        const agentName = senderName || currentStaff?.name || 'ZEEDO Concierge Agent';
        const newMsg: SupportTicketMessage = {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          senderName: agentName,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => {
          const updated = state.tickets.map((t) => {
            if (t.id === ticketId) {
              return {
                ...t,
                status: t.status === 'open' ? 'in_progress' : t.status,
                updatedAt: new Date().toISOString(),
                assignedAgent: t.assignedAgent || agentName,
                messages: [...t.messages, newMsg],
              };
            }
            return t;
          });

          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(
                'zeedo_support_sync',
                JSON.stringify({
                  type: 'NEW_AGENT_MESSAGE',
                  ticketId,
                  message: newMsg,
                  timestamp: Date.now(),
                })
              );
            } catch (e) {}
          }

          return { tickets: updated };
        });

        get().addToast('success', 'Replied to customer support ticket');
      },

      createTicket: (ticket) => {
        set((state) => {
          const exists = state.tickets.some((t) => t.id === ticket.id);
          const updated = exists
            ? state.tickets.map((t) => (t.id === ticket.id ? ticket : t))
            : [ticket, ...state.tickets];

          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(
                'zeedo_support_sync',
                JSON.stringify({ type: 'TICKET_SYNC', ticket, timestamp: Date.now() })
              );
            } catch (e) {}
          }
          return { tickets: updated, selectedTicketId: ticket.id };
        });
        get().addToast('info', `Support ticket ${ticket.ticketNumber} registered in queue`);
      },

      // Staff RBAC & Audit State
      staffUsers: INITIAL_STAFF,
      currentUser: null, // Secured by default: requires admin login
      auditLogs: INITIAL_AUDIT_LOGS,

      setCurrentUser: (user) => set({ currentUser: user }),

      loginStaff: (identifier, password) => {
        const cleanId = identifier.trim().toLowerCase();

        // Direct check for master administrator credentials
        if (
          (cleanId === 'zadmin9898' ||
            cleanId === 'zadmin' ||
            cleanId === 'admin@zeedo.auction' ||
            cleanId === 'superadmin@zeedo.iq') &&
          password === 'ZEEDOA98'
        ) {
          const masterAdmin = get().staffUsers[0] || INITIAL_STAFF[0];
          const updatedStaff: StaffUser = { ...masterAdmin, lastLogin: new Date().toISOString() };
          set((state) => ({
            currentUser: updatedStaff,
            staffUsers: state.staffUsers.map((s) => (s.id === masterAdmin.id ? updatedStaff : s)),
          }));
          get().logAuditEvent({
            action: 'STAFF_LOGIN',
            category: 'auth',
            targetId: masterAdmin.id,
            description: `Master Administrator logged into Admin Console (${masterAdmin.role})`,
          });
          get().addToast('success', `Signed in as ZEEDO Master Admin (Super Admin)`);
          return true;
        }

        const staff = get().staffUsers.find(
          (s) =>
            (s.email.toLowerCase() === cleanId ||
              s.name.toLowerCase() === cleanId ||
              s.phone.replace(/\s+/g, '') === cleanId) &&
            s.password === password
        );
        if (!staff) {
          get().addToast('error', 'Invalid staff credentials. Default admin: ZAdmin9898 / ZEEDOA98');
          return false;
        }
        if (staff.status === 'suspended') {
          get().addToast('error', 'This staff account has been suspended by SuperAdmin.');
          return false;
        }
        const updatedStaff: StaffUser = { ...staff, lastLogin: new Date().toISOString() };
        set((state) => ({
          currentUser: updatedStaff,
          staffUsers: state.staffUsers.map((s) => (s.id === staff.id ? updatedStaff : s)),
        }));
        get().logAuditEvent({
          action: 'STAFF_LOGIN',
          category: 'auth',
          targetId: staff.id,
          description: `Staff member ${staff.name} logged into Admin Console (${staff.role})`,
        });
        get().addToast(
          'success',
          `Signed in as ${staff.name} (${staff.role.replace('_', ' ').toUpperCase()})`
        );
        return true;
      },

      logoutStaff: () => {
        const user = get().currentUser;
        if (user) {
          get().logAuditEvent({
            action: 'STAFF_LOGOUT',
            category: 'auth',
            targetId: user.id,
            description: `Staff member ${user.name} logged out of Admin Console`,
          });
        }
        set({ currentUser: null });
        get().addToast('info', 'Logged out successfully');
      },

      createStaffUser: (userData) => {
        const newId = `stf-${Date.now().toString().slice(-4)}`;
        const newStaff: StaffUser = {
          ...userData,
          id: newId,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: 'Never',
        };
        set((state) => ({ staffUsers: [newStaff, ...state.staffUsers] }));
        get().logAuditEvent({
          action: 'STAFF_CREATED',
          category: 'team',
          targetId: newId,
          description: `SuperAdmin provisioned new staff user ${userData.name} with role ${userData.role}`,
          diff: { after: { name: userData.name, email: userData.email, role: userData.role } },
        });
        get().addToast('success', `Created staff account for ${userData.name} (${userData.role})`);
      },

      updateStaffUser: (id, updates) => {
        const user = get().staffUsers.find((s) => s.id === id);
        if (!user) return;
        set((state) => ({
          staffUsers: state.staffUsers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          currentUser:
            state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser,
        }));
        get().logAuditEvent({
          action: 'STAFF_UPDATED',
          category: 'team',
          targetId: id,
          description: `Updated profile / credentials for ${user.name}`,
          diff: { before: user, after: updates },
        });
        get().addToast('info', `Updated staff member ${user.name}`);
      },

      deleteStaffUser: (id) => {
        const user = get().staffUsers.find((s) => s.id === id);
        if (!user) return;
        set((state) => ({
          staffUsers: state.staffUsers.filter((s) => s.id !== id),
        }));
        get().logAuditEvent({
          action: 'STAFF_DELETED',
          category: 'team',
          targetId: id,
          description: `Revoked access and deleted staff account for ${user.name}`,
        });
        get().addToast('warning', `Revoked staff account ${user.name}`);
      },

      logAuditEvent: (entry) => {
        const cur = get().currentUser || {
          id: 'stf-sys',
          name: 'System Admin',
          role: 'super_admin' as const,
        };
        const newEntry: AuditLogEntry = {
          ...entry,
          id: `aud-${Date.now().toString().slice(-5)}`,
          timestamp: new Date().toISOString(),
          actorId: cur.id,
          actorName: cur.name,
          actorRole: cur.role,
        };
        set((state) => ({ auditLogs: [newEntry, ...state.auditLogs] }));
      },

      addToast: (type, message) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { id, type, message }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      clearAntiSnipingAlert: () => set({ antiSnipingAlert: null }),

      approveKyc: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  kycStatus: 'verified' as const,
                  kycDocument: u.kycDocument
                    ? { ...u.kycDocument, discrepancies: [] }
                    : undefined,
                }
              : u
          ),
        }));
        get().addToast('success', `KYC Approved for user ID: ${userId}`);
        get().logAuditEvent({
          action: 'KYC_APPROVED',
          category: 'kyc',
          targetId: userId,
          description: `Approved KYC National ID document verification for user ${userId}`,
          diff: { after: { kycStatus: 'verified' } },
        });
      },

      rejectKyc: (userId, reason) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  kycStatus: 'rejected' as const,
                  kycDocument: u.kycDocument
                    ? { ...u.kycDocument, rejectedReason: reason }
                    : undefined,
                }
              : u
          ),
        }));
        get().addToast('warning', `KYC Rejected for user ID ${userId}: ${reason}`);
        get().logAuditEvent({
          action: 'KYC_REJECTED',
          category: 'kyc',
          targetId: userId,
          description: `Rejected KYC document for user ${userId}. Reason: ${reason}`,
          diff: { after: { kycStatus: 'rejected', reason } },
        });
      },

      updateKycOcrFields: (userId, fields) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId && u.kycDocument
              ? { ...u, kycDocument: { ...u.kycDocument, ...fields } }
              : u
          ),
        }));
        get().addToast('info', 'OCR fields updated manually');
      },

      provisionSeller: (data) => {
        const newSeller: SellerMerchant = {
          id: `sel-${String(get().sellers.length + 1).padStart(2, '0')}`,
          storeName: data.storeName,
          ownerName: data.ownerName,
          phone: data.phone,
          city: data.city,
          commissionRate: data.commissionRate,
          auto_approve_listings: data.auto_approve_listings,
          pickupAddress: data.pickupAddress,
          pickupCoordinates: data.pickupCoordinates,
          status: 'active',
          totalListings: 0,
          completedSales: 0,
          totalCodVolumeIqd: 0,
          rating: 5.0,
          createdAt: new Date().toISOString(),
          username: data.username || data.phone.replace(/\s+/g, ''),
          password: data.password || 'ZeedoSeller2026',
        };
        set((state) => ({ sellers: [newSeller, ...state.sellers] }));
        get().addToast('success', `Seller "${data.storeName}" provisioned successfully. Login: ${newSeller.username}`);
        get().logAuditEvent({
          action: 'SELLER_PROVISIONED',
          category: 'sellers',
          targetId: newSeller.id,
          description: `Provisioned new merchant "${data.storeName}" (${data.city}) with ${(data.commissionRate * 100).toFixed(0)}% commission rate`,
          diff: { after: newSeller },
        });
      },

      toggleSellerAutonomy: (sellerId) => {
        set((state) => {
          const seller = state.sellers.find((s) => s.id === sellerId);
          const newStatus = !seller?.auto_approve_listings;
          return {
            sellers: state.sellers.map((s) =>
              s.id === sellerId ? { ...s, auto_approve_listings: newStatus } : s
            ),
          };
        });
        const seller = get().sellers.find((s) => s.id === sellerId);
        get().addToast(
          'info',
          `Seller ${seller?.storeName} autonomy toggled: ${
            seller?.auto_approve_listings ? 'AUTO-APPROVE ON' : 'MODERATED'
          }`
        );
        get().logAuditEvent({
          action: 'SELLER_AUTONOMY_TOGGLED',
          category: 'sellers',
          targetId: sellerId,
          description: `Toggled listing autonomy for "${seller?.storeName}" to ${seller?.auto_approve_listings ? 'AUTO-APPROVE ON' : 'MODERATED'}`,
        });
      },

      updateSellerCommission: (sellerId, commissionRate) => {
        set((state) => ({
          sellers: state.sellers.map((s) =>
            s.id === sellerId ? { ...s, commissionRate } : s
          ),
        }));
        get().addToast('info', `Commission rate updated to ${(commissionRate * 100).toFixed(1)}%`);
        get().logAuditEvent({
          action: 'SELLER_COMMISSION_MODIFIED',
          category: 'sellers',
          targetId: sellerId,
          description: `Modified commission rate for merchant ${sellerId} to ${(commissionRate * 100).toFixed(0)}%`,
          diff: { after: { commissionRate } },
        });
      },

      createSellerListing: (listingData) => {
        const seller = get().sellers.find((s) => s.id === listingData.sellerId);
        const autoApprove = seller?.auto_approve_listings || false;
        const newId = `auc-${Math.floor(100 + Math.random() * 900)}`;
        const durationHours = listingData.proposedDurationHours || 24;
        const now = new Date();
        const endsAt = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString();

        const newListing: ListingAuction = {
          id: newId,
          sellerId: listingData.sellerId || seller?.id || 'sel-01',
          sellerName: listingData.sellerName || seller?.storeName || 'Merchant Partner',
          sellerPhone: listingData.sellerPhone || seller?.phone || '+964 750 000 0000',
          sellerAutoApprove: autoApprove,
          status: autoApprove ? 'live' : 'moderation_pending',
          condition: listingData.condition || 'New',
          startingPriceIqd: 1000,
          currentBidIqd: 1000,
          estimatedRetailMarketPriceIqd: listingData.estimatedRetailMarketPriceIqd || 150000,
          incrementStepIqd: listingData.incrementStepIqd || 1000,
          multilingual: listingData.multilingual || {
            en: { title: 'New Item', description: '', specs: [] },
            ar: { title: 'منتج جديد', description: '', specs: [] },
            ckb: { title: 'کاڵای نوێ', description: '', specs: [] },
            badini: { title: 'کەلەپەلی نوی', description: '', specs: [] },
          },
          images: listingData.images && listingData.images.length > 0 ? listingData.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
          category: listingData.category || 'Consumer Electronics',
          sourceType: listingData.sourceType || 'url',
          sourceValue: listingData.sourceValue || '',
          submittedAt: now.toISOString(),
          proposedStartsAt: listingData.proposedStartsAt,
          proposedDurationHours: durationHours,
          estimatedRetailPriceUsd: listingData.estimatedRetailPriceUsd,
          auctionStartsAt: now.toISOString(),
          auctionEndsAt: endsAt,
          isAntiSnipingActive: false,
          antiSnipingResetsCount: 0,
          totalBids: 0,
          bidsHistory: [],
        };

        set((state) => ({
          auctions: [newListing, ...state.auctions],
          sellers: state.sellers.map((s) =>
            s.id === newListing.sellerId
              ? { ...s, totalListings: s.totalListings + 1 }
              : s
          ),
        }));

        if (autoApprove) {
          get().addToast('success', `Listing "${newListing.multilingual.en.title}" auto-approved and is now LIVE!`);
        } else {
          get().addToast('info', `Listing "${newListing.multilingual.en.title}" submitted to Admin Moderation Queue.`);
        }
      },

      approveListing: (listingId) => {
        const target = get().auctions.find((a) => a.id === listingId);
        if (!target) return;

        const durationHours = target.proposedDurationHours || 24;
        const now = new Date();
        const endsAt = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString();

        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === listingId
              ? {
                  ...a,
                  status: 'live' as const,
                  auctionStartsAt: now.toISOString(),
                  auctionEndsAt: endsAt,
                }
              : a
          ),
          sellers: state.sellers.map((s) =>
            s.id === target.sellerId
              ? { ...s, totalListings: s.totalListings + 1 }
              : s
          ),
        }));

        get().addToast('success', `Listing "${target.multilingual.en?.title || listingId}" approved & is now LIVE for ${durationHours} hours!`);
        get().logAuditEvent({
          action: 'LISTING_APPROVED',
          category: 'moderation',
          targetId: listingId,
          description: `Approved listing ${listingId}. Set Live for ${durationHours}h. Accrued 1,000 IQD posting fee to merchant.`,
          diff: { after: { status: 'live', durationHours } },
        });
      },

      generateSellerInvoice: (sellerId) => {
        const seller = get().sellers.find((s) => s.id === sellerId);
        if (!seller) return;

        const sellerAuctions = get().auctions.filter((a) => a.sellerId === sellerId);
        const postingsCount = sellerAuctions.length;
        const totalPostingFeesIqd = postingsCount * 1000;
        const completedAuctions = sellerAuctions.filter((a) => a.status === 'completed' && a.highestBidder);
        const totalCodVolumeIqd = completedAuctions.reduce((sum, a) => sum + a.currentBidIqd, 0);
        const commissionRate = seller.commissionRate || 0.07;
        const totalCommissionDueIqd = Math.round(totalCodVolumeIqd * commissionRate);
        const totalAmountDueIqd = totalPostingFeesIqd + totalCommissionDueIqd;

        const newInvoice: SellerInvoice = {
          id: `inv-${Date.now().toString().slice(-6)}`,
          invoiceNumber: `INV-ZEEDO-${Math.floor(1000 + Math.random() * 9000)}`,
          sellerId: seller.id,
          sellerStoreName: seller.storeName,
          period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          postingsCount,
          postingFeePerItemIqd: 1000,
          totalPostingFeesIqd,
          completedSalesCount: completedAuctions.length,
          totalCodVolumeIqd,
          commissionRate,
          totalCommissionDueIqd,
          totalAmountDueIqd,
          status: 'unpaid',
          dueDate: new Date(Date.now() + 14 * 86400 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
        get().addToast('success', `Invoice generated for ${seller.storeName}: Total Due ${totalAmountDueIqd.toLocaleString()} IQD`);
      },

      markInvoicePaid: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString() }
              : inv
          ),
        }));
        get().addToast('success', `Invoice ${invoiceId} marked as PAID.`);
      },

      rejectListing: (listingId, reason) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === listingId
              ? { ...a, status: 'rejected' as const, rejectionReason: reason }
              : a
          ),
        }));
        get().addToast('warning', `Listing ${listingId} rejected: ${reason}`);
        get().logAuditEvent({
          action: 'LISTING_REJECTED',
          category: 'moderation',
          targetId: listingId,
          description: `Rejected listing ${listingId}. Reason: ${reason}`,
          diff: { after: { status: 'rejected', reason } },
        });
      },

      updateListingMultilingual: (listingId, lang, content) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === listingId
              ? {
                  ...a,
                  multilingual: {
                    ...a.multilingual,
                    [lang]: content,
                  },
                }
              : a
          ),
        }));
        get().addToast('info', `Updated ${lang.toUpperCase()} listing translation`);
      },

      relistAuction: (listingId) => {
        const item = get().auctions.find((a) => a.id === listingId);
        if (!item) return;

        const newAuctionId = `auc-${Math.floor(800 + Math.random() * 200)}`;
        const relisted: ListingAuction = {
          ...item,
          id: newAuctionId,
          status: 'live',
          startingPriceIqd: 1000,
          currentBidIqd: 1000,
          totalBids: 0,
          highestBidder: undefined,
          bidsHistory: [],
          codStatus: undefined,
          packageAwbId: undefined,
          submittedAt: new Date().toISOString(),
          auctionStartsAt: new Date().toISOString(),
          auctionEndsAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          isAntiSnipingActive: false,
          antiSnipingResetsCount: 0,
        };

        set((state) => ({ auctions: [relisted, ...state.auctions] }));
        get().addToast('success', `One-Tap Relisted item! New auction ID: ${newAuctionId} at 1,000 IQD.`);
      },

      placeBid: (auctionId, bidderId, customAmount) => {
        const auction = get().auctions.find((a) => a.id === auctionId);
        if (!auction || auction.status !== 'live') return;

        const verifiedBuyers = get().users.filter((u) => u.kycStatus === 'verified');
        const defaultBuyer =
          verifiedBuyers[Math.floor(Math.random() * verifiedBuyers.length)] || get().users[0];
        const chosenBuyer = bidderId
          ? get().users.find((u) => u.id === bidderId) || defaultBuyer
          : defaultBuyer;

        const step = auction.incrementStepIqd;
        const newBidAmount = customAmount || auction.currentBidIqd + step;

        const now = Date.now();
        const endTime = new Date(auction.auctionEndsAt).getTime();
        const secondsLeft = Math.max(0, Math.floor((endTime - now) / 1000));

        let newEndsAt = auction.auctionEndsAt;
        let isAntiSnipeTriggered = false;

        // Anti-Sniping Rule: If bid placed with <= 60 seconds remaining, hard-reset back to exactly 60s
        if (secondsLeft <= 60) {
          newEndsAt = new Date(now + 60 * 1000).toISOString();
          isAntiSnipeTriggered = true;
        }

        const newBidRecord = {
          id: `bid-${Math.floor(100 + Math.random() * 900)}`,
          bidderId: chosenBuyer.id,
          bidderName: chosenBuyer.name,
          bidderPhone: chosenBuyer.phone,
          amountIqd: newBidAmount,
          timestamp: new Date().toISOString(),
        };

        const updatedAuctions = get().auctions.map((a) => {
          if (a.id === auctionId) {
            return {
              ...a,
              currentBidIqd: newBidAmount,
              totalBids: a.totalBids + 1,
              highestBidder: {
                id: chosenBuyer.id,
                name: chosenBuyer.name,
                phone: chosenBuyer.phone,
                rooftopPin: chosenBuyer.rooftopPin,
              },
              bidsHistory: [newBidRecord, ...a.bidsHistory],
              auctionEndsAt: newEndsAt,
              isAntiSnipingActive: isAntiSnipeTriggered ? true : a.isAntiSnipingActive,
              antiSnipingResetsCount: isAntiSnipeTriggered
                ? a.antiSnipingResetsCount + 1
                : a.antiSnipingResetsCount,
            };
          }
          return a;
        });

        // 12-25 byte compact socket payload format: [listingId, price, bidderId, secondsLeft]
        const remainingAfterReset = isAntiSnipeTriggered
          ? 60
          : Math.max(0, Math.floor((new Date(newEndsAt).getTime() - now) / 1000));
        const compactPayload: LowDataSocketPayload = [
          auctionId,
          newBidAmount,
          chosenBuyer.id,
          remainingAfterReset,
        ];

        set((state) => ({
          auctions: updatedAuctions,
          lowDataSocketFeed: [compactPayload, ...state.lowDataSocketFeed.slice(0, 19)],
          antiSnipingAlert: isAntiSnipeTriggered
            ? {
                auctionId,
                itemTitle: auction.multilingual.en.title,
                timestamp: new Date().toLocaleTimeString(),
              }
            : state.antiSnipingAlert,
        }));

        if (isAntiSnipeTriggered) {
          get().addToast(
            'warning',
            `⚠️ ANTI-SNIPING SOFT CLOSE: Bid placed at <=60s on "${auction.multilingual.en.title}". Timer reset to 60s!`
          );
        } else {
          get().addToast(
            'success',
            `Bid of ${newBidAmount.toLocaleString()} IQD placed by ${chosenBuyer.name}`
          );
        }
      },

      triggerAntiSniping: (auctionId) => {
        const auction = get().auctions.find((a) => a.id === auctionId);
        if (!auction) return;
        const now = Date.now();
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId
              ? {
                  ...a,
                  auctionEndsAt: new Date(now + 60 * 1000).toISOString(),
                  isAntiSnipingActive: true,
                  antiSnipingResetsCount: a.antiSnipingResetsCount + 1,
                }
              : a
          ),
          antiSnipingAlert: {
            auctionId,
            itemTitle: auction.multilingual.en.title,
            timestamp: new Date().toLocaleTimeString(),
          },
        }));
        get().addToast(
          'warning',
          `Manual Anti-Sniping triggered: Timer for ${auctionId} reset to 60 seconds!`
        );
        get().logAuditEvent({
          action: 'ANTI_SNIPE_RESET',
          category: 'auctions',
          targetId: auctionId,
          description: `Anti-sniping 60s window reset manually triggered for auction ${auctionId}`,
          diff: { after: { secondsLeft: 60, isAntiSnipingActive: true } },
        });
      },

      pauseAuction: (auctionId) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId ? { ...a, status: 'cancelled' as const } : a
          ),
        }));
        get().addToast('warning', `Auction ${auctionId} paused/cancelled by admin.`);
      },

      forceEndAuction: (auctionId) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId
              ? {
                  ...a,
                  status: 'completed' as const,
                  auctionEndsAt: new Date().toISOString(),
                  codStatus: 'ready_for_dispatch' as const,
                  packageAwbId: `AWB-IQ-202609-${a.id.replace('auc-', '')}`,
                }
              : a
          ),
        }));
        get().addToast('success', `Auction ${auctionId} concluded. Marked for COD dispatch.`);
      },

      voidAuctionBid: (auctionId, bidId, reason) => {
        const auction = get().auctions.find((a) => a.id === auctionId);
        if (!auction) return;

        const targetBid = auction.bidsHistory.find((b) => b.id === bidId);
        if (!targetBid) return;

        const currentUser = get().currentUser;
        const updatedHistory = auction.bidsHistory.map((b) =>
          b.id === bidId
            ? {
                ...b,
                isVoided: true,
                voidReason: reason,
                voidedAt: new Date().toISOString(),
                voidedBy: currentUser?.name || 'Staff Moderator',
              }
            : b
        );

        // Find highest remaining valid bid
        const validBids = updatedHistory.filter((b) => !b.isVoided);
        let newCurrentBid = 1000; // Platform starting rule
        let newHighestBidder: ListingAuction['highestBidder'] = undefined;

        if (validBids.length > 0) {
          const sorted = [...validBids].sort((a, b) => b.amountIqd - a.amountIqd);
          const topBid = sorted[0];
          newCurrentBid = topBid.amountIqd;
          const bidderUser = get().users.find((u) => u.id === topBid.bidderId);
          newHighestBidder = {
            id: topBid.bidderId,
            name: topBid.bidderName,
            phone: topBid.bidderPhone,
            rooftopPin: bidderUser?.rooftopPin,
          };
        }

        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId
              ? {
                  ...a,
                  bidsHistory: updatedHistory,
                  currentBidIqd: newCurrentBid,
                  highestBidder: newHighestBidder,
                  totalBids: validBids.length,
                }
              : a
          ),
        }));

        get().addToast(
          'warning',
          `Bid of ${targetBid.amountIqd.toLocaleString()} IQD by ${targetBid.bidderName} voided. Price rolled back to ${newCurrentBid.toLocaleString()} IQD.`
        );
        get().logAuditEvent({
          action: 'AUCTION_BID_VOIDED',
          category: 'moderation',
          targetId: auctionId,
          description: `Moderator ${currentUser?.name || 'Staff'} voided bid ${bidId} (${targetBid.amountIqd.toLocaleString()} IQD) by ${targetBid.bidderName}. Reason: ${reason}. Price rolled back to ${newCurrentBid.toLocaleString()} IQD.`,
          diff: {
            before: { currentBidIqd: auction.currentBidIqd, bidder: targetBid.bidderName },
            after: {
              currentBidIqd: newCurrentBid,
              voidReason: reason,
              rolledBackToBidder: newHighestBidder?.name || 'None (Base 1,000 IQD)',
            },
          },
        });
      },

      createCourierManifest: (data) => {
        const selectedAuctions = get().auctions.filter((a) =>
          data.selectedListingIds.includes(a.id)
        );

        if (selectedAuctions.length === 0) {
          get().addToast('error', 'Please select at least one package for the manifest');
          return;
        }

        const items = selectedAuctions.map((auc, index) => ({
          sequenceNumber: index + 1,
          listingId: auc.id,
          packageAwbId: auc.packageAwbId || `AWB-IQ-202609-${auc.id.replace('auc-', '')}`,
          itemTitle: auc.multilingual.en.title,
          buyerName: auc.highestBidder?.name || 'Walk-in Buyer',
          buyerPhone: auc.highestBidder?.phone || '+964 750 000 0000',
          city: auc.highestBidder?.rooftopPin?.city || 'Erbil',
          addressText: auc.highestBidder?.rooftopPin?.addressText || 'Pickup Hub',
          landmark: auc.highestBidder?.rooftopPin?.landmark || 'Central Station',
          gpsCoordinates: {
            lat: auc.highestBidder?.rooftopPin?.latitude || 36.1911,
            lng: auc.highestBidder?.rooftopPin?.longitude || 44.0092,
          },
          codAmountIqd: auc.currentBidIqd,
          sellerStoreName: auc.sellerName,
        }));

        const totalCod = items.reduce((acc, curr) => acc + curr.codAmountIqd, 0);

        const newManifest: CourierManifest = {
          id: `man-${Math.floor(500 + Math.random() * 400)}`,
          manifestCode: `MNF-HUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
            10 + Math.random() * 90
          )}`,
          courierCompanyName: data.courierCompanyName,
          courierDriverName: data.courierDriverName,
          courierDriverPhone: data.courierDriverPhone,
          courierVehiclePlate: data.courierVehiclePlate,
          dispatcherName: 'ZEEDO Admin Dispatcher Hub',
          date: new Date().toISOString().slice(0, 10),
          items,
          totalPackages: items.length,
          totalCodSumIqd: totalCod,
          status: 'draft',
        };

        // Update auction states to manifested
        set((state) => ({
          manifests: [newManifest, ...state.manifests],
          auctions: state.auctions.map((a) =>
            data.selectedListingIds.includes(a.id)
              ? { ...a, codStatus: 'manifested' as const }
              : a
          ),
        }));

        get().addToast(
          'success',
          `Created Manifest ${newManifest.manifestCode} with ${items.length} parcels. Total COD: ${totalCod.toLocaleString()} IQD`
        );
        get().logAuditEvent({
          action: 'MANIFEST_PRINTED',
          category: 'logistics',
          targetId: newManifest.manifestCode,
          description: `Generated 3PL courier route manifest for ${data.courierCompanyName} (${items.length} packages, ${totalCod.toLocaleString()} IQD COD)`,
          diff: { after: { manifestCode: newManifest.manifestCode, courier: data.courierCompanyName, packages: items.length, totalCod } },
        });
      },

      updateCodStatus: (listingId, status) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === listingId ? { ...a, codStatus: status } : a
          ),
        }));
        get().addToast('info', `Logistics status updated to ${status}`);
      },

      updateParcelStage: (listingId, stage, driverNote) => {
        const stageStatusMap: Record<ParcelDeliveryStage, CodLogisticsStatus> = {
          ready_for_dispatch: 'ready_for_dispatch',
          out_for_delivery: 'with_courier',
          delivered_paid: 'collected_cod',
          failed_rth: 'cod_refused',
        };

        const targetAuction = get().auctions.find((a) => a.id === listingId);
        if (!targetAuction) return;

        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === listingId
              ? {
                  ...a,
                  deliveryStage: stage,
                  codStatus: stageStatusMap[stage],
                  courierTrackingNotes: driverNote
                    ? `${a.courierTrackingNotes ? a.courierTrackingNotes + ' | ' : ''}${driverNote}`
                    : a.courierTrackingNotes,
                }
              : a
          ),
        }));

        const stageLabels: Record<ParcelDeliveryStage, string> = {
          ready_for_dispatch: 'Ready for Dispatch',
          out_for_delivery: 'Out for Delivery (With Courier)',
          delivered_paid: 'Delivered & COD Collected',
          failed_rth: 'Delivery Failed (Return to Hub)',
        };

        get().addToast('success', `Parcel ${targetAuction.packageAwbId || listingId} moved to ${stageLabels[stage]}`);
        get().logAuditEvent({
          action: 'PARCEL_STAGE_UPDATED',
          category: 'logistics',
          targetId: listingId,
          description: `Updated delivery stage to ${stageLabels[stage]} for parcel ${targetAuction.packageAwbId || listingId}`,
          diff: { before: { deliveryStage: targetAuction.deliveryStage }, after: { deliveryStage: stage, driverNote } },
        });
      },

      logDeliveryAttempt: (listingId, attempt) => {
        const targetAuction = get().auctions.find((a) => a.id === listingId);
        if (!targetAuction) return;

        const currentAttempts = targetAuction.deliveryAttempts || [];
        const attemptNumber = currentAttempts.length + 1;
        const newAttempt: DeliveryAttempt = {
          id: `att-${Date.now()}`,
          attemptNumber,
          timestamp: new Date().toISOString(),
          status: attempt.status,
          driverNote: attempt.driverNote,
        };

        let newStage: ParcelDeliveryStage = targetAuction.deliveryStage || 'out_for_delivery';
        let newCodStatus: CodLogisticsStatus = targetAuction.codStatus || 'with_courier';

        if (attempt.status === 'delivered') {
          newStage = 'delivered_paid';
          newCodStatus = 'collected_cod';
        } else if (attemptNumber >= 3 || attempt.status === 'refused_cash') {
          newStage = 'failed_rth';
          newCodStatus = 'cod_refused';
        }

        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === listingId
              ? {
                  ...a,
                  deliveryAttempts: [...(a.deliveryAttempts || []), newAttempt],
                  deliveryStage: newStage,
                  codStatus: newCodStatus,
                  courierTrackingNotes: `${a.courierTrackingNotes ? a.courierTrackingNotes + ' | ' : ''}Attempt ${attemptNumber}: ${attempt.driverNote}`,
                }
              : a
          ),
        }));

        if (newStage === 'failed_rth') {
          get().addToast('error', `Parcel ${targetAuction.packageAwbId || listingId} auto-escalated to Return-to-Hub (3 attempts exhausted or cash refused)`);
        } else if (newStage === 'delivered_paid') {
          get().addToast('success', `Parcel ${targetAuction.packageAwbId || listingId} marked Delivered & Cash Collected!`);
        } else {
          get().addToast('info', `Attempt ${attemptNumber}/3 recorded for parcel ${targetAuction.packageAwbId || listingId}`);
        }

        get().logAuditEvent({
          action: 'DELIVERY_ATTEMPT_LOGGED',
          category: 'logistics',
          targetId: listingId,
          description: `Logged delivery attempt #${attemptNumber} (${attempt.status}) for ${targetAuction.packageAwbId || listingId}: "${attempt.driverNote}"`,
          diff: { after: { attemptNumber, status: attempt.status, driverNote: attempt.driverNote, resultingStage: newStage } },
        });
      },

      markManifestHandedOver: (manifestId) => {
        set((state) => ({
          manifests: state.manifests.map((m) =>
            m.id === manifestId ? { ...m, status: 'handed_over' as const } : m
          ),
        }));
        get().addToast('success', `Manifest ${manifestId} marked handed over to courier!`);
      },

      addBanner: (bannerData) => {
        const newBanner: MobileBanner = {
          ...bannerData,
          id: `ban-${Math.floor(10 + Math.random() * 90)}`,
          clicks: 0,
        };
        set((state) => ({ banners: [newBanner, ...state.banners] }));
        get().addToast('success', 'Mobile hero banner scheduled');
      },

      toggleBannerStatus: (bannerId) => {
        set((state) => ({
          banners: state.banners.map((b) =>
            b.id === bannerId ? { ...b, isActive: !b.isActive } : b
          ),
        }));
        get().addToast('info', 'Banner status toggled');
      },

      deleteBanner: (bannerId) => {
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== bannerId),
        }));
        get().addToast('info', 'Banner deleted');
      },

      dispatchPushNotification: (data) => {
        const newNotif: PushNotificationMessage = {
          id: `notif-${Math.floor(10 + Math.random() * 90)}`,
          title: data.title,
          body: data.body,
          targetAudience: data.targetAudience,
          deepLinkTarget: data.deepLinkTarget,
          sentAt: new Date().toISOString(),
          status: 'sent',
          recipientCount:
            data.targetAudience === 'all'
              ? 14200
              : data.targetAudience === 'verified_only'
              ? 4120
              : 890,
        };
        set((state) => ({ notifications: [newNotif, ...state.notifications] }));
        get().addToast(
          'success',
          `Dispatched push notification to ${newNotif.recipientCount} mobile app users!`
        );
      },

      // Simulator Functions
      simulateIncomingBid: (auctionId) => {
        const liveAuctions = get().auctions.filter((a) => a.status === 'live');
        if (liveAuctions.length === 0) {
          get().addToast('warning', 'No live auctions available to place simulated bids.');
          return;
        }
        const target = auctionId
          ? liveAuctions.find((a) => a.id === auctionId) || liveAuctions[0]
          : liveAuctions[Math.floor(Math.random() * liveAuctions.length)];

        get().placeBid(target.id);
      },

      simulateNewKycSubmission: () => {
        const sampleNames = ['Aram Faraidun', 'Yousif Basil Al-Rawi', 'Shwan Qadir', 'Maryam Tariq'];
        const sampleCities = ['Erbil', 'Sulaymaniyah', 'Baghdad', 'Duhok'];
        const randomIdx = Math.floor(Math.random() * sampleNames.length);

        const newId = `usr-${Math.floor(200 + Math.random() * 800)}`;
        const newUser: UserBuyer = {
          id: newId,
          name: sampleNames[randomIdx],
          phone: `+964 750 ${Math.floor(100 + Math.random() * 899)} ${Math.floor(1000 + Math.random() * 8999)}`,
          city: sampleCities[randomIdx],
          kycStatus: 'pending',
          totalBids: 0,
          totalWins: 0,
          joinedAt: new Date().toISOString(),
          rooftopPin: {
            latitude: 36.19 + (Math.random() - 0.5) * 0.05,
            longitude: 44.01 + (Math.random() - 0.5) * 0.05,
            city: sampleCities[randomIdx],
            landmark: 'Near New City Gate Plaza',
            addressText: `Building ${Math.floor(1 + Math.random() * 99)}, Main Boulevard, ${sampleCities[randomIdx]}`,
            isVerified: true,
          },
          kycDocument: {
            idType: 'national_id',
            docNumber: `IQ-${Math.floor(1990 + Math.random() * 12)}0${Math.floor(1 + Math.random() * 9)}${Math.floor(10 + Math.random() * 18)}-${Math.floor(10000 + Math.random() * 89999)}`,
            docUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
            fullName: sampleNames[randomIdx],
            dob: '1995-06-14',
            issueDate: '2022-03-01',
            expiryDate: '2032-02-28',
            ocrConfidence: Math.floor(92 + Math.random() * 7),
            discrepancies: Math.random() > 0.6 ? ['Birthplace code requires manual admin confirmation'] : [],
            submittedAt: new Date().toISOString(),
          },
        };

        set((state) => ({ users: [newUser, ...state.users] }));
        get().addToast('info', `New KYC submission received from ${newUser.name} (${newUser.city})`);
      },

      simulateNewSellerListing: (autonomous) => {
        const chosenSeller = autonomous
          ? get().sellers.find((s) => s.auto_approve_listings) || get().sellers[0]
          : get().sellers.find((s) => !s.auto_approve_listings) || get().sellers[1];

        const mockTitles = [
          'Apple iPad Air 11-inch (M2 Chip, 128GB, Space Gray)',
          'Anker Prime 27,650mAh Power Bank (250W Ultra-Fast)',
          'Bosch Professional GSB 18V-50 Cordless Combi Drill',
        ];
        const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
        const newId = `auc-${Math.floor(810 + Math.random() * 80)}`;

        const baseline = 160000;
        const newListing: ListingAuction = {
          id: newId,
          sellerId: chosenSeller.id,
          sellerName: chosenSeller.storeName,
          sellerPhone: chosenSeller.phone,
          sellerAutoApprove: chosenSeller.auto_approve_listings,
          status: chosenSeller.auto_approve_listings ? 'live' : 'moderation_pending',
          condition: 'New',
          startingPriceIqd: 1000,
          currentBidIqd: 1000,
          estimatedRetailMarketPriceIqd: baseline,
          incrementStepIqd: 2000,
          category: 'Consumer Electronics',
          sourceType: 'keywords',
          sourceValue: randomTitle,
          images: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
          ],
          multilingual: {
            en: {
              title: randomTitle,
              description: 'Multimodal Gemini AI-extracted specs and market evaluation. Sealed in box with warranty.',
              specs: ['Original Retail Seal', 'Manufacturer 1-Year Warranty', 'Fast Charging Compatible'],
            },
            ar: {
              title: randomTitle,
              description: 'مواصفات مستخرجة بالذكاء الاصطناعي جيميني مع تقييم سعر السوق. المنتج مختوم بالكرتون الأصلي.',
              specs: ['ختم المصنع الأصلي', 'ضمان رسمي لمدة عام', 'يدعم الشحن السريع'],
            },
            ckb: {
              title: randomTitle,
              description: 'تایبەتمەندییە دەرهێنراوەكانی ژیریی دەستكردی جێمینای لەگەڵ هەڵسەنگاندنی نرخی بازاڕ لە عێراق.',
              specs: ['کارتۆنی فابريكەی دەستلێنەدراو', 'گرەنتی یەک ساڵ', 'پشتیوانی بارگاویکردنەوەی خێرا'],
            },
            badini: {
              title: randomTitle,
              description: 'تایبەتمەندیێن ژیرییا دەستكرد یا جێمینای دگەل نرخاندنا بازاڕێ كوردستان و عێراقێ.',
              specs: ['كارتۆنا ئەسلی', 'گەڕەنتیا فەرمی یا ١ سالێ', 'بارگاویكرنا لەزگین'],
            },
          },
          submittedAt: new Date().toISOString(),
          auctionStartsAt: new Date().toISOString(),
          auctionEndsAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          isAntiSnipingActive: false,
          antiSnipingResetsCount: 0,
          totalBids: 0,
          bidsHistory: [],
        };

        set((state) => ({ auctions: [newListing, ...state.auctions] }));
        if (chosenSeller.auto_approve_listings) {
          get().addToast(
            'success',
            `Autonomous Seller "${chosenSeller.storeName}" submitted listing ${newId} -> Direct to LIVE!`
          );
        } else {
          get().addToast(
            'info',
            `Non-autonomous Seller "${chosenSeller.storeName}" submitted listing ${newId} -> Queued for Moderation!`
          );
        }
      },

      resetToDefaults: () => {
        set({
          users: INITIAL_USERS,
          sellers: INITIAL_SELLERS,
          auctions: INITIAL_AUCTIONS,
          manifests: INITIAL_MANIFESTS,
          banners: INITIAL_BANNERS,
          notifications: INITIAL_NOTIFICATIONS,
          lowDataSocketFeed: [],
          staffUsers: INITIAL_STAFF,
          currentUser: null,
          auditLogs: INITIAL_AUDIT_LOGS,
          tickets: INITIAL_TICKETS,
          selectedTicketId: null,
        });
        get().addToast('info', 'Clean production data state restored');
      },
    }),
    {
      name: 'zeedo_admin_store_prod_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
