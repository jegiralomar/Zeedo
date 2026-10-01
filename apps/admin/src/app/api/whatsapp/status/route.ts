import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001';

  try {
    const res = await fetch(`${gatewayUrl}/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ isConnected: false, message: 'Gateway returned error' }, { status: 502 });
  } catch (err) {
    return NextResponse.json({
      isConnected: false,
      message: 'Self-hosted WhatsApp Gateway is offline or starting up'
    });
  }
}
