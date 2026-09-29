export type LanguageCode = 'en' | 'ar' | 'ckb' | 'badini';

export interface MultilingualContent {
  title: string;
  description: string;
  specs: string[];
}

export interface RooftopPin {
  latitude: number;
  longitude: number;
  city: string;
  district?: string;
  landmark: string;
  addressText: string;
  isVerified: boolean;
}

export type KycStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';

export interface KycDocument {
  idType: 'national_id' | 'passport';
  docNumber: string;
  docUrl: string;
  docBackUrl?: string;
  fullName: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  ocrConfidence: number; // e.g. 96 for 96%
  discrepancies: string[];
  submittedAt: string;
  rejectedReason?: string;
}

export interface UserBuyer {
  id: string;
  name: string;
  phone: string; // e.g. +964 750 482 9102
  city: string;
  avatarUrl?: string;
  kycStatus: KycStatus;
  kycDocument?: KycDocument;
  rooftopPin?: RooftopPin;
  totalBids: number;
  totalWins: number;
  joinedAt: string;
}

export interface SellerMerchant {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  city: string;
  commissionRate: number; // e.g. 0.08 for 8%
  auto_approve_listings: boolean; // Autonomy flag
  pickupAddress: string;
  pickupCoordinates: { lat: number; lng: number };
  status: 'active' | 'suspended';
  totalListings: number;
  completedSales: number;
  totalCodVolumeIqd: number;
  rating: number;
  createdAt: string;
  username?: string;
  password?: string;
}

export type ConditionTag = 'New' | 'Used' | 'New Open Box';

export type ListingStatus = 
  | 'draft' 
  | 'grace_period' 
  | 'moderation_pending' 
  | 'live' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type CodLogisticsStatus = 
  | 'ready_for_dispatch' 
  | 'manifested' 
  | 'with_courier' 
  | 'collected_cod' 
  | 'cod_refused';

export type ParcelDeliveryStage = 
  | 'ready_for_dispatch' 
  | 'out_for_delivery' 
  | 'delivered_paid' 
  | 'failed_rth';

export interface DeliveryAttempt {
  id: string;
  attemptNumber: number; // 1, 2, 3
  timestamp: string;
  status: 'unreachable' | 'rescheduled' | 'refused_cash' | 'wrong_address' | 'delivered';
  driverNote: string;
}

export interface BidRecord {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderPhone: string;
  amountIqd: number;
  timestamp: string;
  isAutoBid?: boolean;
  isVoided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface ListingAuction {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAutoApprove: boolean;
  status: ListingStatus;
  condition: ConditionTag;
  
  // Pricing mechanics
  startingPriceIqd: 1000; // Strict platform rule: always 1,000 IQD (ZEEDO retained base fee)
  currentBidIqd: number;
  estimatedRetailMarketPriceIqd: number; // Scraped baseline
  incrementStepIqd: number; // Tiered: <=100k -> 1k, <=200k -> 2k, >200k -> 3k
  
  // Multi-dialect copies
  multilingual: {
    en: MultilingualContent;
    ar: MultilingualContent;
    ckb: MultilingualContent;
    badini: MultilingualContent;
  };
  
  // Images
  images: string[];
  category: string;
  sourceType: 'url' | 'keywords' | 'photos';
  sourceValue: string;
  
  // Timers & Life cycle
  submittedAt: string;
  proposedStartsAt?: string;
  proposedDurationHours?: number;
  rejectionReason?: string;
  estimatedRetailPriceUsd?: number;
  gracePeriodEndsAt?: string; // 10 minutes post-submission
  auctionStartsAt: string;
  auctionEndsAt: string;
  
  // Soft close anti-sniping (60-second rule)
  isAntiSnipingActive: boolean;
  antiSnipingResetsCount: number;
  
  // Bids & Leader
  totalBids: number;
  highestBidder?: {
    id: string;
    name: string;
    phone: string;
    rooftopPin?: RooftopPin;
  };
  bidsHistory: BidRecord[];
  
  // Logistics & Parcel Delivery Lifecycle
  codStatus?: CodLogisticsStatus;
  packageAwbId?: string;
  courierManifestId?: string;
  deliveryStage?: ParcelDeliveryStage;
  deliveryAttempts?: DeliveryAttempt[];
  courierDriverName?: string;
  courierDriverPhone?: string;
  courierTrackingNotes?: string;
  
  // Moderation notes
  moderationNotes?: string;
}

export interface SellerInvoice {
  id: string;
  invoiceNumber: string;
  sellerId: string;
  sellerStoreName: string;
  period: string; // e.g. "October 2026"
  postingsCount: number;
  postingFeePerItemIqd: number; // 1,000 IQD per posting
  totalPostingFeesIqd: number; // postingsCount * 1,000
  completedSalesCount: number;
  totalCodVolumeIqd: number;
  commissionRate: number; // e.g. 0.07 (7%)
  totalCommissionDueIqd: number;
  totalAmountDueIqd: number; // totalPostingFeesIqd + totalCommissionDueIqd
  status: 'unpaid' | 'paid';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface CourierManifestItem {
  sequenceNumber: number;
  listingId: string;
  packageAwbId: string;
  itemTitle: string;
  buyerName: string;
  buyerPhone: string;
  city: string;
  addressText: string;
  landmark: string;
  gpsCoordinates: { lat: number; lng: number };
  codAmountIqd: number;
  sellerStoreName: string;
}

export interface CourierManifest {
  id: string;
  manifestCode: string;
  courierCompanyName: string; // e.g. "Al-Zajil Express", "Erbil Speed Logistics"
  courierDriverName: string;
  courierDriverPhone: string;
  courierVehiclePlate: string;
  dispatcherName: string;
  date: string;
  items: CourierManifestItem[];
  totalPackages: number;
  totalCodSumIqd: number;
  status: 'draft' | 'handed_over' | 'completed';
}

export interface MobileBanner {
  id: string;
  title: string;
  imageUrl: string;
  actionType: 'auction' | 'category' | 'url';
  actionTarget: string;
  startDate: string;
  endDate: string;
  targetAudience: 'all' | 'verified_only';
  isActive: boolean;
  priority: number;
  clicks: number;
}

export interface PushNotificationMessage {
  id: string;
  title: {
    en: string;
    ar: string;
    ckb: string;
  };
  body: {
    en: string;
    ar: string;
    ckb: string;
  };
  targetAudience: 'all' | 'verified_only' | 'sellers' | 'outbid_bidders';
  deepLinkTarget?: string;
  sentAt?: string;
  status: 'sent' | 'scheduled' | 'draft';
  recipientCount: number;
}

// Low data network payload format: [listingId, price, bidderId, secondsLeft]
export type LowDataSocketPayload = [string, number, string, number];

export type StaffRole = 'super_admin' | 'moderator' | 'dispatcher' | 'auditor';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Plaintext for local dev/demo
  role: StaffRole;
  status: 'active' | 'suspended';
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
}

export type AuditCategory =
  | 'auth'
  | 'kyc'
  | 'moderation'
  | 'auctions'
  | 'logistics'
  | 'sellers'
  | 'team';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: StaffRole;
  action: string;
  category: AuditCategory;
  targetId: string;
  description: string;
  diff?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketPriority = 'urgent' | 'high' | 'normal';
export type TicketCategory = 'bidding' | 'cod_inspection' | 'courier_delay' | 'account' | 'general';

export interface SupportTicketMessage {
  id: string;
  sender: 'buyer' | 'agent' | 'bot' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  kycStatus: KycStatus;
  rooftopLandmark?: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  messages: SupportTicketMessage[];
}

