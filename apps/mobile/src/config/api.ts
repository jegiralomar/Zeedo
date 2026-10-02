/**
 * Zeedo Production API Configuration
 * Real backend services & self-hosted Baileys WhatsApp Gateway (+964 750 881 3641)
 */

import { Platform } from 'react-native';
 
const isLocalWeb =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// When developing locally on web, route through same-origin Metro proxy to bypass browser CORS
export const API_BASE_URL = isLocalWeb ? '' : 'https://zeedo.bid';

// WebSocket Gateway — connects to the real-time bidding service
export const WS_BASE_URL = isLocalWeb
  ? 'ws://localhost:8080'
  : 'wss://zeedo.bid/ws';

export const ZEEDO_CONFIG = {
  API_BASE_URL,
  WHATSAPP_BOT_NUMBER: '+964 750 881 3641',
  ENDPOINTS: {
    // WhatsApp Real OTP Dispatcher (Self-hosted Baileys Gateway)
    SEND_OTP: `${API_BASE_URL}/api/auth/whatsapp/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/whatsapp/verify-otp`,

    // Live Auctions Stream
    LIVE_AUCTIONS: `${API_BASE_URL}/api/auctions/live`,

    // Real Bidding
    PLACE_BID: `${API_BASE_URL}/api/bids/place`,

    // User Profile & Won Orders
    USER_PROFILE: `${API_BASE_URL}/api/users`,
    PATCH_PROFILE: `${API_BASE_URL}/api/users/profile`,
    WON_ORDERS: `${API_BASE_URL}/api/users/won-orders`,

    // Product Scraper (merchant listing creation)
    SCRAPE_PRODUCT: `${API_BASE_URL}/api/scraper/product`,

    // CMS Banners
    CMS_BANNERS: `${API_BASE_URL}/api/cms/banners`,
  },

  // Real-Time WebSocket Gateway
  WS_URL: WS_BASE_URL,
};
