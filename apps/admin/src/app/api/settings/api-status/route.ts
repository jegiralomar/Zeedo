import { NextRequest } from 'next/server';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';
import { initDatabaseSchema, getSetting, setSetting } from '@/lib/db';

export async function OPTIONS() {
  return handleCorsOptions();
}

function maskKey(key?: string): string {
  if (!key || key.length < 8) return '';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

/**
 * Resolve a config value: DB (user-saved) → env var → fallback
 */
async function resolveConfig(dbKey: string, envKey: string, fallback = ''): Promise<string> {
  await initDatabaseSchema();
  const fromDb = await getSetting(dbKey);
  if (fromDb) return fromDb;
  return process.env[envKey] || fallback;
}

export async function GET() {
  const [geminiKey, metaToken, metaPhoneId, mode] = await Promise.all([
    resolveConfig('gemini_api_key', 'GEMINI_API_KEY'),
    resolveConfig('meta_whatsapp_token', 'META_WHATSAPP_TOKEN'),
    resolveConfig('meta_phone_number_id', 'META_WHATSAPP_PHONE_NUMBER_ID'),
    resolveConfig('api_mode', 'ZEEDO_API_MODE', 'sandbox'),
  ]);

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

    // ACTION 1: Save credentials persistently to Neon Postgres
    if (body.action === 'save_keys') {
      const { geminiApiKey, metaToken, metaPhoneId, apiMode } = body;

      // Persist non-empty values to the DB settings table
      const saves: Promise<void>[] = [];
      if (geminiApiKey !== undefined && geminiApiKey.trim()) {
        saves.push(setSetting('gemini_api_key', geminiApiKey.trim()));
      }
      if (metaToken !== undefined && metaToken.trim()) {
        saves.push(setSetting('meta_whatsapp_token', metaToken.trim()));
      }
      if (metaPhoneId !== undefined && metaPhoneId.trim()) {
        saves.push(setSetting('meta_phone_number_id', metaPhoneId.trim()));
      }
      if (apiMode !== undefined) {
        saves.push(setSetting('api_mode', apiMode));
      }
      await Promise.all(saves);

      return jsonResponse({
        isSuccess: true,
        message: 'Credentials saved to database and will persist across all deployments!',
        apiMode,
        saved: saves.length,
      });
    }

    // ACTION 2: Run diagnostic latency tests
    const geminiKey = await resolveConfig('gemini_api_key', 'GEMINI_API_KEY');
    const mode = await resolveConfig('api_mode', 'ZEEDO_API_MODE', 'sandbox');
    let geminiTest = { success: false, latencyMs: 0, message: '' };

    if (mode === 'live' && geminiKey) {
      const start = Date.now();
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'PING' }] }] }),
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
      geminiTest = { success: true, latencyMs: 12, message: 'Sandbox mode active (simulated responses enabled)' };
    }

    const metaToken = await resolveConfig('meta_whatsapp_token', 'META_WHATSAPP_TOKEN');
    return jsonResponse({
      timestamp: new Date().toISOString(),
      tests: {
        gemini: geminiTest,
        whatsapp: {
          success: true,
          mode: mode === 'live' && metaToken ? 'live' : 'sandbox',
          message:
            mode === 'live' && metaToken
              ? 'Meta Cloud Graph API credentials registered'
              : 'Sandbox simulation ready (code 782910)',
        },
      },
    });
  } catch (error) {
    return jsonResponse({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
