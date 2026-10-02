import { NextResponse } from 'next/server';
import {
  sendAuctionWonAlert,
  sendOutbidAlert,
  sendDispatchedAlert,
  sendMerchantSettlementAlert,
  sendWhatsAppMessage,
} from '@/lib/whatsappAlerts';
import { verifyAdminRequest } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { type, payload } = body;

    if (!type) {
      return NextResponse.json({ success: false, error: 'Event type is required' }, { status: 400 });
    }

    let result;
    switch (type) {
      case 'auction_won':
        result = await sendAuctionWonAlert(payload);
        break;
      case 'outbid':
        result = await sendOutbidAlert(payload);
        break;
      case 'dispatched':
        result = await sendDispatchedAlert(payload);
        break;
      case 'merchant_closed':
        result = await sendMerchantSettlementAlert(payload);
        break;
      case 'custom':
        result = await sendWhatsAppMessage(payload.phone, payload.message);
        break;
      default:
        return NextResponse.json({ success: false, error: `Unknown event type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('WhatsApp notify error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
