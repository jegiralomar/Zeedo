import { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';
import { handleCorsOptions, jsonResponse } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return jsonResponse({ isValid: false, message: 'Authorization token required' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return jsonResponse({ isValid: false, message: 'Invalid or expired session' }, { status: 401 });
    }

    return jsonResponse({
      isValid: true,
      user: {
        id: payload.userId,
        phone: payload.phone,
        role: payload.role,
        name: payload.name,
        city: payload.city,
      },
      expiresAt: new Date(payload.expiresAt).toISOString(),
    });
  } catch (error) {
    return jsonResponse({ isValid: false, message: 'Session validation error' }, { status: 500 });
  }
}
