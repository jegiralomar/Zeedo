import { NextRequest } from 'next/server';
import { sendWhatsAppOtp } from '@/lib/whatsapp';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ phoneNumber?: string; phone?: string }>(req);
    const phoneNumber = body.phoneNumber || body.phone;

    if (!phoneNumber) {
      return jsonResponse({ isSuccess: false, message: 'Phone number is required' }, { status: 400 }, req);
    }

    const result = await sendWhatsAppOtp(phoneNumber);
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
