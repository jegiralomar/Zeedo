export type LanguageCode = 'en' | 'ar' | 'ckb' | 'badini';

export type UserRole = 'guest' | 'buyer' | 'merchant';

export interface MobileUser {
  id: string;
  name: string;
  phone: string;
  city: string;
  role: UserRole;
  storeName?: string;
  commissionRate?: number;
  kycStatus?: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
}

export interface BidRecord {
  bidId: string;
  bidderId: string;
  bidderName: string;
  amountIqd: number;
  amountUsd: number;
  timestamp: string;
}

export interface MobileAuctionItem {
  id: string;
  title: string;
  titleAr?: string;
  titleCkb?: string;
  titleBadini?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  retailPriceUsd: number;
  currentBidIqd: number;
  currentBidUsd: number;
  incrementStepIqd: number;
  bidsCount: number;
  images: string[];
  endsAt: string;
  isLive: boolean;
  sellerName: string;
  sellerId: string;
  sellerCity: string;
  rating: number;
  reviewCount: number;
  specs: string[];
  condition: 'New' | 'Used' | 'New Open Box';
  bidsHistory: BidRecord[];
}

export interface WonLotOrder {
  orderId: string;
  auctionId: string;
  title: string;
  image: string;
  winningBidUsd: number;
  winningBidIqd: number;
  deliveryCity: string;
  addressText: string;
  awbNumber: string;
  codStatus: 'ready_for_dispatch' | 'with_courier' | 'delivered';
  placedAt: string;
}
