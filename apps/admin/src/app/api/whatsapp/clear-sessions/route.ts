import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isValid) {
    return NextResponse.json({ isSuccess: false, message: auth.error || 'Unauthorized admin access' }, { status: 401 });
  }

  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001';

  try {
    const res = await fetch(`${gatewayUrl}/clear-corrupted-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { isSuccess: false, message: 'Gateway returned error while clearing sessions' },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { isSuccess: false, message: err?.message || 'Failed to reach WhatsApp Gateway' },
      { status: 500 }
    );
  }
}
