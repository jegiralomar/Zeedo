import { NextRequest } from 'next/server';
import { ocrIraqiNationalId } from '@/lib/gemini';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ imageBase64?: string }>(req);
    const { imageBase64 } = body;

    const result = await ocrIraqiNationalId(imageBase64);
    return jsonResponse(result);
  } catch (error) {
    console.error('Error in Iraqi National ID OCR:', error);
    return jsonResponse(
      { isSuccess: false, message: 'Internal server error analyzing ID document' },
      { status: 500 }
    );
  }
}
