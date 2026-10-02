import { NextRequest } from 'next/server';
import { sendWhatsAppOtp, normalizeIraqiPhone } from '@/lib/whatsapp';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

// In-memory OTP rate limiter: max 3 requests per phone per 10 minutes
const otpRateMap = new Map<string, { count: number; windowStart: number }>();
const OTP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_PER_WINDOW = 3;

function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const entry = otpRateMap.get(phone);
  if (!entry || now - entry.windowStart > OTP_WINDOW_MS) {
    otpRateMap.set(phone, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= OTP_MAX_PER_WINDOW) return true;
  entry.count += 1;
  return false;
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ phoneNumber?: string; phone?: string }>(req);
    const phoneNumber = (body.phoneNumber || body.phone || '').trim();

    if (!phoneNumber) {
      return jsonResponse({ isSuccess: false, message: 'Phone number is required' }, { status: 400 }, req);
    }

    const normalizedPhone = normalizeIraqiPhone(phoneNumber);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return jsonResponse({ isSuccess: false, message: 'Invalid phone number format' }, { status: 400 }, req);
    }

    if (isRateLimited(normalizedPhone)) {
      return jsonResponse(
        { isSuccess: false, message: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
        { status: 429 },
        req
      );
    }

    const result = await sendWhatsAppOtp(normalizedPhone);
    return jsonResponse(result, undefined, req);
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return jsonResponse(
      { isSuccess: false, message: 'Internal server error processing OTP dispatch' },
      { status: 500 },
      req
    );
  }
}
