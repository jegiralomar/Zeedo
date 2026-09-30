import { NextRequest } from 'next/server';
import { verifyWhatsAppOtp } from '@/lib/whatsapp';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ phoneNumber?: string; code?: string }>(req);
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return jsonResponse(
        { isValid: false, message: 'Both phone number and OTP code are required' },
        { status: 400 }
      );
    }

    const result = verifyWhatsAppOtp(phoneNumber, code);
    if (result.isValid) {
      const { createSessionToken } = await import('@/lib/session');
      const sessionToken = createSessionToken({
        id: `usr-${phoneNumber.replace(/\D/g, '')}`,
        phone: phoneNumber,
        role: 'buyer',
      });
      return jsonResponse({
        ...result,
        sessionToken,
        expiresInDays: 90,
      });
    }
    return jsonResponse(result);
  } catch (error) {
    console.error('Error verifying WhatsApp OTP:', error);
    return jsonResponse(
      { isValid: false, message: 'Internal server error verifying OTP' },
      { status: 500 }
    );
  }
}
