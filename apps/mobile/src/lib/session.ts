import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'zeedo_mobile_buyer_session_token_v1';
const BUYER_PROFILE_KEY = 'zeedo_mobile_buyer_profile_v1';

export interface MobileBuyerSession {
  token: string;
  user: {
    id: string;
    phone: string;
    name?: string;
    city?: string;
    role?: string;
  };
}

/**
 * Saves 90-day session token in encrypted device storage
 */
export async function saveMobileSession(session: MobileBuyerSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, session.token);
    await SecureStore.setItemAsync(BUYER_PROFILE_KEY, JSON.stringify(session.user));
  } catch (err) {
    console.warn('[SecureStore] Failed to save session:', err);
  }
}

/**
 * Retrieves existing session on app startup
 */
export async function getMobileSession(): Promise<MobileBuyerSession | null> {
  try {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    const userStr = await SecureStore.getItemAsync(BUYER_PROFILE_KEY);
    if (!token || !userStr) return null;

    return {
      token,
      user: JSON.parse(userStr),
    };
  } catch {
    return null;
  }
}

/**
 * Clears session on user logout
 */
export async function clearMobileSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BUYER_PROFILE_KEY);
  } catch (err) {
    console.warn('[SecureStore] Failed to clear session:', err);
  }
}
