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

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    // Constant-time comparison to prevent timing attacks; check length first to prevent Node.js RangeError
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }
    return payload;
  } catch {
    return null;
  }
}

const ADMIN_ROLES = new Set(['super_admin', 'operations', 'moderator', 'finance', 'staff']);

/**
 * Validates whether an incoming HTTP request is made by an authorized staff/admin member.
 * Checks for:
 * 1. Bearer session token with admin role
 * 2. Or 'x-admin-token' / 'x-admin-secret' header matching SESSION_SECRET
 */
export interface AdminAuthResult {
  isAuthorized: boolean;
  isValid: boolean;
  admin?: SessionPayload;
  error?: string;
}

export function verifyAdminRequest(req: Request): AdminAuthResult {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const adminHeader = req.headers.get('x-admin-token') || req.headers.get('x-admin-secret') || '';

    // Check internal secret bypass
    if (adminHeader && adminHeader === SESSION_SECRET) {
      return {
        isAuthorized: true,
        isValid: true,
        admin: {
          userId: 'system-internal',
          phone: '+964000000000',
          role: 'super_admin',
          name: 'System Admin',
          issuedAt: Date.now(),
          expiresAt: Date.now() + 3600000,
        },
      };
    }

    if (!token) {
      return { isAuthorized: false, isValid: false, error: 'Missing admin authorization token' };
    }

    const session = verifySessionToken(token);
    if (!session) {
      return { isAuthorized: false, isValid: false, error: 'Invalid or expired session token' };
    }

    if (ADMIN_ROLES.has(session.role)) {
      return { isAuthorized: true, isValid: true, admin: session };
    }

    return { isAuthorized: false, isValid: false, error: 'Insufficient permissions for admin role' };
  } catch (err: any) {
    return { isAuthorized: false, isValid: false, error: err?.message || 'Admin authentication error' };
  }
}

