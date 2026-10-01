/**
 * Zeedo Production API Configuration
 * Real backend services & self-hosted Baileys WhatsApp Gateway (+964 750 881 3641)
 */

export const ZEEDO_CONFIG = {
  API_BASE_URL: 'https://zeedo.bid',
  WHATSAPP_BOT_NUMBER: '+964 750 881 3641',
  ENDPOINTS: {
    // WhatsApp Real OTP Dispatcher (Self-hosted Baileys Gateway)
    SEND_OTP: 'https://zeedo.bid/api/auth/whatsapp/send-otp',
    VERIFY_OTP: 'https://zeedo.bid/api/auth/whatsapp/verify-otp',

    // Live Auctions Stream
    LIVE_AUCTIONS: 'https://zeedo.bid/api/auctions/live',

    // Real Bidding
    PLACE_BID: 'https://zeedo.bid/api/bids/place',

    // User Profile & Won Orders
    USER_PROFILE: 'https://zeedo.bid/api/users',
  },
};
