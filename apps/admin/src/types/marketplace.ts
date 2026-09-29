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
  role?: 'buyer' | 'seller';
  sellerId?: string;
  storeName?: string;
  commissionRate?: number;
}

export interface BidRecord {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderPhone?: string;
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
  codDeliveryOrder?: {
    trackingNumber: string;
    courierName: string;
    dispatchedAt: string;
    status: 'assigned' | 'in_transit' | 'delivered';
    totalDueIqd: number;
  };
}
