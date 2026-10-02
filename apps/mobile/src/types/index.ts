export type LanguageCode = 'en' | 'ar' | 'ckb' | 'badini';

export type UserRole = 'guest' | 'buyer' | 'merchant';

export interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string; // Human-readable reverse-geocoded address
  city: string;
}

export interface MobileUser {
  id: string;
  name: string;
  phone: string;
  city: string;
  role: UserRole;
  gender?: 'male' | 'female';
  avatar?: string;
  storeName?: string;
  commissionRate?: number;
  kycStatus?: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  deliveryLocation?: DeliveryLocation;
}

export interface BidRecord {
  bidId: string;
  bidderId: string;
  bidderName: string;
  amountIqd: number;
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
  startingPriceIqd: number;
  currentBidIqd: number;
  incrementStepIqd: number;
  bidsCount: number;
  images: string[];
  endsAt: string;
  isLive: boolean;
  sellerCity: string;
  sellerId?: string;
  specs: string[];
  condition: 'New' | 'Used' | 'New Open Box';
  bidsHistory: BidRecord[];
}

export interface WonLotOrder {
  orderId: string;
  auctionId: string;
  title: string;
  image: string;
  winningBidIqd: number;
  deliveryCity: string;
  addressText: string;
  awbNumber: string;
  codStatus: 'ready_for_dispatch' | 'with_courier' | 'delivered';
  placedAt: string;
}
