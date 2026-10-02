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

export type KycStatus = 'verified' | 'pending' | 'rejected';

export interface UserBuyer {
  id: string;
  name: string;
  phone: string; // e.g. +964 750 482 9102
  city: string;
  avatarUrl?: string;
  avatar?: string;
  gender?: 'male' | 'female' | string;
  kycStatus: KycStatus;
  kycDocument?: any;
  rooftopPin?: RooftopPin;
  totalBids: number;
  totalWins: number;
  totalSpentIqd?: number;
  joinedAt: string;
  isBlocked?: boolean;
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
  pickupCoordinates?: { lat: number; lng: number };
  status: 'active' | 'suspended';
  totalListings: number;
  completedSales: number;
  totalCodVolumeIqd: number;
  totalRevenueIqd?: number;      // total winning bids from completed sales
  totalPayoutIqd?: number;        // amount paid out to merchant so far
  outstandingBalanceIqd?: number; // totalRevenueIqd * (1 - rate) - 1000*sales - totalPayoutIqd
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
  
  // Moderation notes
  moderationNotes?: string;

  // Finance: auto-computed on auction end
  zeedoCommissionIqd?: number;  // winningBid * commissionRate
  flatPostingFeeIqd?: number;    // always 1,000 IQD
  merchantPayoutIqd?: number;    // winningBid - commission - 1000

  // Optional COD & Merchant Order Tracking
  codStatus?: string;
  orderStatus?: string;
  packageAwbId?: string;
  deliveryStage?: string;
  deliveryAttempts?: any[];
  courierTrackingNotes?: any;
  orderDeliveredAt?: string;
  orderCommissionRefunded?: boolean;
  orderNotes?: string;
}

export interface MerchantReceipt {
  id: string;
  sellerId: string;
  sellerName: string;
  amountIqd: number;
  paymentMethod: 'fib' | 'zaincash' | 'fastpay' | 'cash';
  receiptImageUrl: string;
  referenceNote?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
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
  | 'moderation'
  | 'auctions'
  | 'finance'
  | 'sellers'
  | 'buyers'
  | 'support'
  | 'team'
  | 'kyc'
  | 'logistics';

export type CodLogisticsStatus = string;
export type ParcelDeliveryStage = string;
export type DeliveryAttempt = any;
export type KycDocument = any;
export type CourierManifest = any;

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

