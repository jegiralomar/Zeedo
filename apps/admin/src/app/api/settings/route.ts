import { NextResponse } from 'next/server';

// Root /api/settings — redirects to api-status for convenience
export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const metaToken = process.env.META_WHATSAPP_TOKEN || '';
  const apiMode = process.env.ZEEDO_API_MODE || 'sandbox';

  return NextResponse.json({
    success: true,
    apiMode,
    services: {
      ocr: {
        configured: true,
        engine: 'tesseract.js',
        languages: ['ara', 'eng'],
        isLive: true,
      },
      gemini: {
        configured: Boolean(geminiKey && geminiKey.length > 5),
        keyMasked: geminiKey ? `${geminiKey.slice(0, 6)}...${geminiKey.slice(-4)}` : '',
        model: 'gemini-flash-latest',
        isLive: apiMode === 'live' && Boolean(geminiKey),
      },
      whatsapp: {
        configured: Boolean(metaToken && metaToken.length > 5),
        phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
        templateName: process.env.META_WHATSAPP_TEMPLATE_NAME || 'zeedo_auth_otp',
        isLive: apiMode === 'live' && Boolean(metaToken),
      },
    },
    database: {
      connected: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      provider: 'neon_postgres',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // In a real system you'd persist these to Vercel env via API.
    // For now, acknowledge the update and return current config.
    return NextResponse.json({
      success: true,
      message: 'Settings acknowledged. Update GEMINI_API_KEY and ZEEDO_API_MODE in Vercel dashboard to persist across deployments.',
      received: Object.keys(body),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
}
