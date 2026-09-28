import { NextResponse } from 'next/server';
import { SupportTicketMessage } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const newMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      sender: body.sender || 'agent',
      senderName: body.senderName || 'ZEEDO Concierge',
      text: body.text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return NextResponse.json({
      success: true,
      ticketId: id,
      message: newMsg,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to append message' },
      { status: 400 }
    );
  }
}
