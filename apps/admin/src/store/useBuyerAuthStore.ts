import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BuyerProfile, LanguageCode, RooftopPin } from '../types/marketplace';

interface BuyerAuthStoreState {
  isAuthenticated: boolean;
  language: LanguageCode;
  buyer: BuyerProfile | null;

  setLanguage: (lang: LanguageCode) => void;
  signUp: (name: string, phone: string, city: string, password?: string) => boolean;
  login: (phone: string, password?: string) => boolean;
  loginWithWhatsAppOtp: (phone: string, fullName?: string, city?: string) => void;
  logout: () => void;

  // Gate 1 & Gate 2 KYC Actions
  completeGate1: (docNumber: string, fullName: string, dob: string) => void;
  completeGate2: (pin: RooftopPin) => void;

  // Verification Checker
  isTwoGateVerified: () => boolean;
}

export const useBuyerAuthStore = create<BuyerAuthStoreState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      language: 'ckb', // Default to Kurdish Sorani (Erbil & Sulaymaniyah hub)
      buyer: null,

      setLanguage: (language) => set({ language }),

      signUp: (name, phone, city) => {
        const cleanPhone = phone.trim();
        const cleanName = name.trim();
        const cleanCity = city.trim() || 'Erbil';

        if (!cleanName || !cleanPhone) return false;

        const newBuyer: BuyerProfile = {
          id: `usr-${Date.now()}`,
          name: cleanName,
          phone: cleanPhone,
          city: cleanCity,
          kycStatus: 'pending',
          totalBids: 0,
          totalWins: 0,
          joinedAt: new Date().toISOString(),
        };

        set({
          isAuthenticated: true,
          buyer: newBuyer,
        });

        return true;
      },

      login: (phone) => {
        const cleanPhone = phone.trim();
        if (!cleanPhone) return false;

        // If existing buyer matches or create session
        const current = get().buyer;
        if (current && current.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')) {
          set({ isAuthenticated: true });
          return true;
        }

        // Initialize session for returning phone number
        const buyerSession: BuyerProfile = {
          id: current?.id || `usr-${Date.now()}`,
          name: current?.name || 'ZEEDO Buyer',
          phone: cleanPhone,
          city: current?.city || 'Erbil',
          kycStatus: current?.kycStatus || 'pending',
          totalBids: current?.totalBids || 0,
          totalWins: current?.totalWins || 0,
          joinedAt: current?.joinedAt || new Date().toISOString(),
          rooftopPin: current?.rooftopPin,
          kycDocument: current?.kycDocument,
        };

        set({
          isAuthenticated: true,
          buyer: buyerSession,
        });

        return true;
      },

      loginWithWhatsAppOtp: (phone, fullName, city) => {
        const current = get().buyer;
        const buyerSession: BuyerProfile = {
          id: current?.id || `usr-${Date.now()}`,
          name: fullName || current?.name || 'Verified Buyer',
          phone: phone || current?.phone || '+964 750 000 0000',
          city: city || current?.city || 'Erbil',
          kycStatus: current?.kycStatus || 'pending',
          totalBids: current?.totalBids || 0,
          totalWins: current?.totalWins || 0,
          joinedAt: current?.joinedAt || new Date().toISOString(),
          rooftopPin: current?.rooftopPin,
          kycDocument: current?.kycDocument,
        };

        set({
          isAuthenticated: true,
          buyer: buyerSession,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          buyer: null,
        });
      },

      completeGate1: (docNumber, fullName, dob) => {
        const current = get().buyer;
        if (!current) return;

        set({
          buyer: {
            ...current,
            name: fullName || current.name,
            kycDocument: {
              idType: 'national_id',
              docNumber: docNumber,
              fullName: fullName || current.name,
              dob: dob,
              issueDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date(Date.now() + 10 * 365 * 86400 * 1000).toISOString().split('T')[0],
              ocrConfidence: 98,
              submittedAt: new Date().toISOString(),
            },
            kycStatus: current.rooftopPin ? 'verified' : 'pending',
          },
        });
      },

      completeGate2: (pin) => {
        const current = get().buyer;
        if (!current) return;

        set({
          buyer: {
            ...current,
            city: pin.city || current.city,
            rooftopPin: {
              latitude: pin.latitude,
              longitude: pin.longitude,
              city: pin.city,
              district: pin.district,
              landmark: pin.landmark,
              addressText: pin.addressText,
              isVerified: true,
            },
            kycStatus: current.kycDocument ? 'verified' : 'pending',
          },
        });
      },

      isTwoGateVerified: () => {
        const b = get().buyer;
        if (!b) return false;
        return b.kycStatus === 'verified' || Boolean(b.kycDocument && b.rooftopPin);
      },
    }),
    {
      name: 'zeedo_buyer_auth_prod_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
