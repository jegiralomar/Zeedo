import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/session';

// Root /api/settings — redirects to api-status for convenience
export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.isValid) {
    return NextResponse.json({ success: false, error: auth.error || 'Unauthorized: Admin access required' }, { status: 401 });
  }

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const apiMode = process.env.ZEEDO_API_MODE || 'sandbox';

  return NextResponse.json({
    success: true,
    apiMode,
    services: {
      gemini: {
        configured: Boolean(geminiKey && geminiKey.length > 5),
        keyMasked: geminiKey ? `${geminiKey.slice(0, 6)}...${geminiKey.slice(-4)}` : '',
        model: 'gemini-flash-latest',
        isLive: apiMode === 'live' && Boolean(geminiKey),
      },
      whatsapp: {
        type: 'self-hosted-baileys',
        gatewayUrl: process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001',
        isLive: true,
      },
    },
    database: {
      connected: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      provider: 'postgresql',
    },
  });
}

export async function POST(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized: Admin access required' }, { status: 401 });
    }

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
