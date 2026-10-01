import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001';

  try {
    const res = await fetch(`${gatewayUrl}/qr`, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/html'
      }
    });

    if (res.ok) {
      const html = await res.text();
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      });
    }

    return new NextResponse('WhatsApp Gateway is starting up... Please refresh in 3 seconds.', {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (err) {
    return new NextResponse('WhatsApp Gateway container is initializing. Please refresh in a few moments.', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
