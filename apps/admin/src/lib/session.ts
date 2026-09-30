import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'zeedo_production_session_jwt_secret_key_2026';
const SESSION_DURATION_DAYS = 90;

export interface SessionPayload {
  userId: string;
  phone: string;
  role: string;
  name?: string;
  city?: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a tamper-proof 90-day signed session token for mobile devices
 * Eliminates repeated WhatsApp OTP costs on return visits.
 */
export function createSessionToken(user: { id: string; phone: string; role?: string; name?: string; city?: string }): string {
  const now = Date.now();
  const payload: SessionPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role || 'buyer',
    name: user.name,
    city: user.city,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_DAYS * 24 * 3600 * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a 90-day mobile session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }
    return payload;
  } catch {
    return null;
  }
}
