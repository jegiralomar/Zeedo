import { NextRequest } from 'next/server';
import { enrichAuctionItem } from '@/lib/gemini';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ query?: string; imageBase64?: string }>(req);
    const { query, imageBase64 } = body;

    if (!query && !imageBase64) {
      return jsonResponse(
        { isSuccess: false, message: 'Please provide either a product query/title or a packaging image' },
        { status: 400 }
      );
    }

    const result = await enrichAuctionItem(query || 'Consumer Electronics', imageBase64);
    return jsonResponse(result);
  } catch (error) {
    console.error('Error in Gemini Item Enrichment:', error);
    return jsonResponse(
      { isSuccess: false, message: 'Internal server error enriching item catalog data' },
      { status: 500 }
    );
  }
}
