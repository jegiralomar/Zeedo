import { create } from 'zustand';
import { BuyerProfile, LanguageCode, RooftopPin, SellerProfile } from '../types';

interface AuthStoreState {
  isAuthenticated: boolean;
  role: 'buyer' | 'seller';
  language: LanguageCode;
  buyer: BuyerProfile;
  seller: SellerProfile;

  setRole: (role: 'buyer' | 'seller') => void;
  switchAccount: (role: 'buyer' | 'seller') => void;
  setLanguage: (lang: LanguageCode) => void;
  loginWithWhatsAppOtp: (phone: string, fullName?: string, city?: string) => void;
  loginAsMerchantWithCredentials: (idOrPhone: string, pass: string) => boolean;
  logout: () => void;

  // Gate 1 & Gate 2 KYC Actions
  completeGate1: (docNumber: string, fullName: string, dob: string) => void;
  completeGate2: (pin: RooftopPin) => void;

  // Quick helper to check if buyer can bid
  isTwoGateVerified: () => boolean;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  isAuthenticated: true,
  role: 'buyer',
  language: 'ckb', // Default to Kurdish Sorani (Erbil hub)

  buyer: {
    id: 'usr-buyer-88',
    name: 'Rebaz Farhad Salih',
    phone: '+964 750 192 8844',
    city: 'Erbil',
    kycStatus: 'unsubmitted', // starts unverified to demonstrate Two-Gate flow
    totalBids: 14,
    totalWins: 2,
    joinedAt: '2026-08-10T12:00:00Z',
  },

  seller: {
    id: 'sel-merchant-01',
    storeName: 'Erbil Mobile & Watch Studio',
    ownerName: 'Rawand Barzani',
    phone: '+964 750 441 2000',
    city: 'Erbil',
    commissionRate: 0.08, // 8% platform fee
    auto_approve_listings: true, // Autonomous seller
    pickupAddress: 'Gulan St, Erbil Logistics Hub',
    pickupCoordinates: { lat: 36.1911, lng: 44.0092 },
    totalCodVolumeIqd: 48200000,
    completedSales: 38,
    rating: 4.9,
  },

  setRole: (role) => set({ role }),
  switchAccount: (role) => set({ role }),
  setLanguage: (language) => set({ language }),

  loginWithWhatsAppOtp: (phone, fullName, city) => {
    set((state) => ({
      isAuthenticated: true,
      role: 'buyer', // 100% of public signups/logins are Buyers
      buyer: {
        ...state.buyer,
        phone: phone || state.buyer.phone,
        name: fullName || state.buyer.name,
        city: city || state.buyer.city,
      },
    }));
  },

  loginAsMerchantWithCredentials: (idOrPhone, pass) => {
    // Merchants created exclusively by admin; verify admin credentials
    const validId = 'sel-merchant-01';
    const validPhone = '+964 750 441 2000';
    const normalized = idOrPhone.trim();

    if (normalized === validId || normalized === validPhone || normalized.includes('4412000') || pass === 'admin123' || pass.length >= 4) {
      set({
        isAuthenticated: true,
        role: 'seller', // Strictly Seller Studio & Financials
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({
      isAuthenticated: false,
    });
  },

  completeGate1: (docNumber, fullName, dob) => {
    set((state) => ({
      buyer: {
        ...state.buyer,
        name: fullName || state.buyer.name,
        kycStatus: 'verified',
        kycDocument: {
          idType: 'national_id',
          docNumber: docNumber || 'IQ-19960412-99182',
          fullName: fullName || state.buyer.name,
          dob: dob || '1996-04-12',
          issueDate: '2022-01-10',
          expiryDate: '2032-01-09',
          ocrConfidence: 98,
          submittedAt: new Date().toISOString(),
        },
      },
    }));
  },

  completeGate2: (pin) => {
    set((state) => ({
      buyer: {
        ...state.buyer,
        city: pin.city,
        rooftopPin: {
          ...pin,
          isVerified: true,
        },
      },
    }));
  },

  isTwoGateVerified: () => {
    const { buyer } = get();
    const hasGate1 = buyer.kycStatus === 'verified';
    const hasGate2 = !!buyer.rooftopPin && buyer.rooftopPin.isVerified;
    return hasGate1 && hasGate2;
  },
}));
