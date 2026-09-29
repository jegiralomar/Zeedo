import { create } from 'zustand';
import { BuyerProfile, LanguageCode, RooftopPin } from '../types/marketplace';

interface BuyerAuthStoreState {
  isAuthenticated: boolean;
  language: LanguageCode;
  buyer: BuyerProfile;

  setLanguage: (lang: LanguageCode) => void;
  loginWithWhatsAppOtp: (phone: string, fullName?: string, city?: string) => void;
  logout: () => void;

  // Gate 1 & Gate 2 KYC Actions
  completeGate1: (docNumber: string, fullName: string, dob: string) => void;
  completeGate2: (pin: RooftopPin) => void;

  // Verification Checker
  isTwoGateVerified: () => boolean;
}

export const useBuyerAuthStore = create<BuyerAuthStoreState>((set, get) => ({
  isAuthenticated: true,
  language: 'ckb', // Default to Kurdish Sorani (Erbil & Sulaymaniyah hub)

  buyer: {
    id: 'usr-buyer-88',
    name: 'Rebaz Farhad Salih',
    phone: '+964 750 192 8844',
    city: 'Erbil',
    kycStatus: 'verified', // Starts verified by default for seamless instant bidding demo
    totalBids: 14,
    totalWins: 2,
    joinedAt: '2026-08-10T12:00:00Z',
    rooftopPin: {
      latitude: 36.1911,
      longitude: 44.0092,
      city: 'Erbil',
      district: 'Dream City',
      landmark: 'Near Italian Village Villa 42B',
      addressText: 'Villa 42B, Dream City Compound, Gulan St, Erbil',
      isVerified: true,
    },
    kycDocument: {
      idType: 'national_id',
      docNumber: 'IQ-19960412-99182',
      fullName: 'Rebaz Farhad Salih',
      dob: '1996-04-12',
      issueDate: '2022-01-10',
      expiryDate: '2032-01-09',
      ocrConfidence: 98,
      submittedAt: '2026-09-28T14:10:00Z',
    },
  },

  setLanguage: (language) => set({ language }),

  loginWithWhatsAppOtp: (phone, fullName, city) => {
    set((state) => ({
      isAuthenticated: true,
      buyer: {
        ...state.buyer,
        phone: phone || state.buyer.phone,
        name: fullName || state.buyer.name,
        city: city || state.buyer.city,
      },
    }));
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
