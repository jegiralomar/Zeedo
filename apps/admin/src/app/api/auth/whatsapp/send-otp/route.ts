import { NextRequest } from 'next/server';
import { sendWhatsAppOtp } from '@/lib/whatsapp';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ phoneNumber?: string }>(req);
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return jsonResponse({ isSuccess: false, message: 'Phone number is required' }, { status: 400 });
    }

    const result = await sendWhatsAppOtp(phoneNumber);
    return jsonResponse(result);
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return jsonResponse(
      { isSuccess: false, message: 'Internal server error processing OTP dispatch' },
      { status: 500 }
    );
  }
}
