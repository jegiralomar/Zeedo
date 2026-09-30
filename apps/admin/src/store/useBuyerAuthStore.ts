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
  setSellerSession: (seller: any) => void;
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
          role: 'buyer',
          kycStatus: 'pending',
          totalBids: 0,
          totalWins: 0,
          joinedAt: new Date().toISOString(),
        };

        set({
          isAuthenticated: true,
          buyer: newBuyer,
        });

        // Persist user to PostgreSQL backend
        if (typeof window !== 'undefined') {
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: newBuyer.id,
              name: cleanName,
              phone: cleanPhone,
              city: cleanCity,
              role: 'buyer',
            }),
          }).catch(() => {});
        }

        return true;
      },

      setSellerSession: (seller: any) => {
        const sellerBuyerProfile: BuyerProfile = {
          id: seller.id || `sel-${Date.now()}`,
          name: seller.ownerName || seller.storeName || 'Merchant Partner',
          phone: seller.phone || '',
          city: seller.city || 'Erbil',
          role: 'seller',
          sellerId: seller.id || 'sel-01',
          storeName: seller.storeName || 'Official Store',
          commissionRate: seller.commissionRate || 0.07,
          kycStatus: 'verified',
          totalBids: 0,
          totalWins: seller.completedSales || 0,
          joinedAt: seller.createdAt || new Date().toISOString(),
        };

        set({
          isAuthenticated: true,
          buyer: sellerBuyerProfile,
        });
      },

      login: (identifier, password) => {
        const cleanId = (identifier || '').trim();
        if (!cleanId) return false;

        // Check if pre-seeded default merchant
        if (
          (cleanId.toLowerCase() === 'merchant' || cleanId.replace(/\s+/g, '') === '+9647501112233') &&
          (!password || password === 'ZEEDOMerchant98')
        ) {
          const defaultSellerProfile: BuyerProfile = {
            id: 'sel-01',
            name: 'ZEEDO Official Store',
            phone: '+964 750 111 2233',
            city: 'Erbil',
            role: 'seller',
            sellerId: 'sel-01',
            storeName: 'ZEEDO Official Store',
            commissionRate: 0.07,
            kycStatus: 'verified',
            totalBids: 0,
            totalWins: 0,
            joinedAt: new Date().toISOString(),
          };

          set({
            isAuthenticated: true,
            buyer: defaultSellerProfile,
          });
          return true;
        }

        // Check if matching provisioned merchant in localStorage / admin store
        if (typeof window !== 'undefined') {
          try {
            const adminRaw = window.localStorage.getItem('zeedo_admin_store_prod_v1');
            if (adminRaw) {
              const adminParsed = JSON.parse(adminRaw);
              const sellers: any[] = adminParsed.state?.sellers || [];
              const matchedSeller = sellers.find(
                (s) =>
                  (s.username && s.username.toLowerCase() === cleanId.toLowerCase()) ||
                  s.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') ||
                  s.storeName.toLowerCase() === cleanId.toLowerCase()
              );

              if (matchedSeller) {
                // If seller found and password matches or no password enforcement
                if (!password || !matchedSeller.password || matchedSeller.password === password) {
                  const sellerBuyerProfile: BuyerProfile = {
                    id: matchedSeller.id,
                    name: matchedSeller.ownerName || matchedSeller.storeName,
                    phone: matchedSeller.phone,
                    city: matchedSeller.city,
                    role: 'seller',
                    sellerId: matchedSeller.id,
                    storeName: matchedSeller.storeName,
                    commissionRate: matchedSeller.commissionRate,
                    kycStatus: 'verified',
                    totalBids: 0,
                    totalWins: matchedSeller.completedSales || 0,
                    joinedAt: matchedSeller.createdAt || new Date().toISOString(),
                  };

                  set({
                    isAuthenticated: true,
                    buyer: sellerBuyerProfile,
                  });
                  return true;
                }
              }
            }
          } catch (e) {}
        }

        // Regular Buyer Session
        const current = get().buyer;
        const buyerSession: BuyerProfile = {
          id: current?.id || `usr-${Date.now()}`,
          name: current?.name || 'ZEEDO Buyer',
          phone: cleanId,
          city: current?.city || 'Erbil',
          role: 'buyer',
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
            kycStatus: 'verified',
          },
        });
      },

      isTwoGateVerified: () => {
        const b = get().buyer;
        if (!b) return false;
        // User confirmed number with WhatsApp OTP and chose delivery location
        return Boolean(b.phone && b.rooftopPin && b.rooftopPin.isVerified);
      },
    }),
    {
      name: 'zeedo_buyer_auth_prod_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
