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
  docUrl?: string;
  fullName: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  ocrConfidence: number;
  submittedAt: string;
}

export interface BuyerProfile {
  id: string;
  name: string;
  phone: string;
  city: string;
  kycStatus: KycStatus;
  kycDocument?: KycDocument;
  rooftopPin?: RooftopPin;
  totalBids: number;
  totalWins: number;
  joinedAt: string;
}

export interface SellerProfile {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  city: string;
  commissionRate: number;
  auto_approve_listings: boolean;
  pickupAddress: string;
  pickupCoordinates: { lat: number; lng: number };
  totalCodVolumeIqd: number;
  completedSales: number;
  rating: number;
}

export interface BidRecord {
  id: string;
  bidderId: string;
  bidderName: string;
  amountIqd: number;
  timestamp: string;
  isAutoBid?: boolean;
}

export interface MobileAuctionItem {
  id: string;
  sellerId: string;
  sellerName: string;
  category: string;
  condition: 'New' | 'Used' | 'New Open Box';
  imageUrl: string;
  startingPriceIqd: number; // Strictly 1,000 IQD
  currentBidIqd: number;
  incrementStepIqd: number; // +1,000, +2,000, or +3,000 IQD
  estimatedRetailMarketPriceIqd: number;
  multilingual: {
    en: MultilingualContent;
    ar: MultilingualContent;
    ckb: MultilingualContent;
    badini: MultilingualContent;
  };
  submittedAt: string;
  auctionStartsAt: string;
  auctionEndsAt: string;
  status: 'grace_period' | 'moderation_pending' | 'live' | 'completed' | 'cancelled';
  isAntiSnipingActive: boolean;
  antiSnipingResetsCount: number;
  totalBids: number;
  highestBidder?: {
    id: string;
    name: string;
    phone: string;
  };
  bidsHistory: BidRecord[];
  // COD Order Tracking (if completed)
  codStatus?: 'ready_for_dispatch' | 'manifested' | 'with_courier' | 'collected_cod' | 'cod_refused';
  packageAwbId?: string;
  courierName?: string;
  gracePeriodEndsAt?: string;
}

export type NotificationType = 'outbid' | 'auction_won' | 'delivery' | 'ending_soon' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: {
    en: string;
    ar: string;
    ckb: string;
    badini: string;
  };
  body: {
    en: string;
    ar: string;
    ckb: string;
    badini: string;
  };
  timestamp: string;
  isRead: boolean;
  auctionId?: string;
  awbId?: string;
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


