import { Platform } from 'react-native';

/**
 * Zeedo Global Connection Configuration
 * Environment-aware auto-discovery for Web, Android Emulator, iOS, and Production.
 */
function resolveApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 1. Web environment (Expo Web)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:3000`;
    }
    return `https://${hostname}`;
  }

  // 2. Native development (__DEV__)
  if (__DEV__) {
    // Android Emulator host loopback is 10.0.2.2
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // iOS Simulator can access localhost directly
    return 'http://localhost:3000';
  }

  // 3. Production Default
  return 'https://zeedo.auction';
}

function resolveWsBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WS_URL) {
    return process.env.EXPO_PUBLIC_WS_URL;
  }

  // 1. Web environment (Expo Web)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Connect to local standalone WebSocket gateway on port 8080
      return `ws://${hostname}:8080`;
    }
    return `wss://${hostname}/ws`;
  }

  // 2. Native development (__DEV__)
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:8080';
    }
    return 'ws://localhost:8080';
  }

  // 3. Production Default
  return 'wss://zeedo.auction/ws';
}

export const API_BASE_URL = resolveApiBaseUrl();
export const WS_BASE_URL = resolveWsBaseUrl();

console.log(`[Zeedo Config] API Base URL: ${API_BASE_URL}`);
console.log(`[Zeedo Config] WebSocket Base URL: ${WS_BASE_URL}`);
