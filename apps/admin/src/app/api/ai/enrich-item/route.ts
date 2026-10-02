import { NextRequest } from 'next/server';
import { enrichAuctionItem } from '@/lib/gemini';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';
import { verifySessionToken, verifyAdminRequest } from '@/lib/session';

export async function OPTIONS() {
  return handleCorsOptions();
}

// In-memory rate limiter: max 10 calls per minute per user/IP
const aiRateMap = new Map<string, { count: number; windowStart: number }>();
const AI_WINDOW_MS = 60 * 1000;
const AI_MAX_PER_WINDOW = 10;

function isAiRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = aiRateMap.get(identifier);
  if (!entry || now - entry.windowStart > AI_WINDOW_MS) {
    aiRateMap.set(identifier, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= AI_MAX_PER_WINDOW) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const adminAuth = verifyAdminRequest(req);
    const userSession = token ? verifySessionToken(token) : null;

    if (!adminAuth.isValid && !userSession) {
      return jsonResponse({ isSuccess: false, message: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const rateId = userSession?.userId || adminAuth.admin?.userId || 'admin';
    if (isAiRateLimited(rateId)) {
      return jsonResponse({ isSuccess: false, message: 'Too many enrichment requests. Please wait a minute.' }, { status: 429 });
    }

    const body = await safeParseJson<{ query?: string; imageBase64?: string }>(req);
    const { query, imageBase64 } = body;

    if (!query && !imageBase64) {
      return jsonResponse(
        { isSuccess: false, message: 'Please provide either a product query/title or a packaging image' },
        { status: 400 }
      );
    }

    // Guard against oversized payloads
    if (query && query.length > 500) {
      return jsonResponse({ isSuccess: false, message: 'Query string exceeds maximum limit of 500 characters' }, { status: 400 });
    }
    if (imageBase64 && imageBase64.length > 10 * 1024 * 1024) {
      return jsonResponse({ isSuccess: false, message: 'Image base64 exceeds maximum limit of 10MB' }, { status: 400 });
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
