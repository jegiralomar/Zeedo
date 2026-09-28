import { NextRequest } from 'next/server';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';
import fs from 'fs';
import path from 'path';

export async function OPTIONS() {
  return handleCorsOptions();
}

function maskKey(key?: string): string {
  if (!key || key.length < 8) return '';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const metaToken = process.env.META_WHATSAPP_TOKEN || '';
  const metaPhoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '';
  const mode = process.env.ZEEDO_API_MODE || 'sandbox';

  const geminiConfigured = Boolean(geminiKey && geminiKey.length > 5);
  const whatsappConfigured = Boolean(metaToken && metaPhoneId);

  return jsonResponse({
    status: 'operational',
    timestamp: new Date().toISOString(),
    apiMode: mode,
    credentials: {
      geminiApiKeyMasked: maskKey(geminiKey),
      hasGeminiApiKey: geminiConfigured,
      metaTokenMasked: maskKey(metaToken),
      hasMetaToken: Boolean(metaToken),
      metaPhoneId: metaPhoneId || '',
    },
    services: {
      gemini: {
        name: 'Google Gemini 2.0/1.5 Flash (Vision & Grounded Search)',
        isConfigured: geminiConfigured,
        mode: mode === 'live' && geminiConfigured ? 'live_api' : 'sandbox_simulation',
        model: 'gemini-2.0-flash',
        features: ['Iraqi National ID OCR', 'Web Scraping Enrichment', '4-Dialect Copy', 'Market Pricing'],
      },
      whatsapp: {
        name: 'Meta WhatsApp Business Cloud API',
        isConfigured: whatsappConfigured,
        mode: mode === 'live' && whatsappConfigured ? 'live_meta_cloud' : 'sandbox_simulation',
        templateName: process.env.META_WHATSAPP_TEMPLATE_NAME || 'zeedo_auth_otp',
        features: ['6-Digit WhatsApp OTP', 'Iraqi E.164 Normalization (+964 7XX)', 'Anti-Fraud Verification'],
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{
      action?: string;
      geminiApiKey?: string;
      metaToken?: string;
      metaPhoneId?: string;
      apiMode?: 'sandbox' | 'live';
      testTarget?: string;
    }>(req);

    // ACTION 1: Save and update credentials from Admin Pop Up Window
    if (body.action === 'save_keys') {
      const { geminiApiKey, metaToken, metaPhoneId, apiMode } = body;

      if (geminiApiKey !== undefined) process.env.GEMINI_API_KEY = geminiApiKey.trim();
      if (metaToken !== undefined) process.env.META_WHATSAPP_TOKEN = metaToken.trim();
      if (metaPhoneId !== undefined) process.env.META_WHATSAPP_PHONE_NUMBER_ID = metaPhoneId.trim();
      if (apiMode !== undefined) process.env.ZEEDO_API_MODE = apiMode;

      // Try writing to .env.local if filesystem is writable
      try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = `# ZEEDO BID APP - Updated via Admin Settings Pop Up Window
GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}
META_WHATSAPP_TOKEN=${process.env.META_WHATSAPP_TOKEN || ''}
META_WHATSAPP_PHONE_NUMBER_ID=${process.env.META_WHATSAPP_PHONE_NUMBER_ID || ''}
META_WHATSAPP_TEMPLATE_NAME=${process.env.META_WHATSAPP_TEMPLATE_NAME || 'zeedo_auth_otp'}
ZEEDO_API_MODE=${process.env.ZEEDO_API_MODE || 'sandbox'}
`;
        fs.writeFileSync(envPath, envContent, 'utf-8');
      } catch (fileErr) {
        console.warn('Could not write .env.local file directly (read-only container):', fileErr);
      }

      return jsonResponse({
        isSuccess: true,
        message: 'Credentials updated and applied instantly across all ZEEDO services!',
        apiMode: process.env.ZEEDO_API_MODE,
      });
    }

    // ACTION 2: Run diagnostic latency tests
    const geminiKey = process.env.GEMINI_API_KEY;
    const mode = process.env.ZEEDO_API_MODE || 'sandbox';
    let geminiTest = { success: false, latencyMs: 0, message: '' };

    if (mode === 'live' && geminiKey) {
      const start = Date.now();
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'PING' }] }],
            }),
          }
        );
        geminiTest = {
          success: res.ok,
          latencyMs: Date.now() - start,
          message: res.ok ? 'Gemini 2.0 Flash live connection verified' : `Failed: HTTP ${res.status}`,
        };
      } catch (err: unknown) {
        geminiTest = {
          success: false,
          latencyMs: Date.now() - start,
          message: err instanceof Error ? err.message : 'Connection failed',
        };
      }
    } else {
      geminiTest = {
        success: true,
        latencyMs: 12,
        message: 'Sandbox mode active (simulated high-fidelity responses enabled)',
      };
    }

    return jsonResponse({
      timestamp: new Date().toISOString(),
      tests: {
        gemini: geminiTest,
        whatsapp: {
          success: true,
          mode: mode === 'live' && process.env.META_WHATSAPP_TOKEN ? 'live' : 'sandbox',
          message:
            mode === 'live' && process.env.META_WHATSAPP_TOKEN
              ? 'Meta Cloud Graph API credentials registered'
              : 'Sandbox simulation ready (code 782910)',
        },
      },
    });
  } catch (error) {
    return jsonResponse({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
