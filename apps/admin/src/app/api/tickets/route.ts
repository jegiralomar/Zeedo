import { NextResponse } from 'next/server';
import { INITIAL_TICKETS } from '@/data/mockData';
import { SupportTicket } from '@/types';

// In-memory store for server runtime (falls back to initial tickets)
let serverTickets: SupportTicket[] = [...INITIAL_TICKETS];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: serverTickets.length,
    tickets: serverTickets,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTicketId = `tkt-${Date.now()}`;
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const ticketNumber = `TKT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${randomSeq}`;

    const newTicket: SupportTicket = {
      id: newTicketId,
      ticketNumber,
      buyerId: body.buyerId || 'usr-buyer-88',
      buyerName: body.buyerName || 'Rebaz Farhad Salih',
      buyerPhone: body.buyerPhone || '+964 750 192 8844',
      buyerCity: body.buyerCity || 'Erbil',
      kycStatus: body.kycStatus || 'verified',
      rooftopLandmark: body.rooftopLandmark || 'Behind Family Mall, Street 10',
      subject: body.subject || 'Live Auction Inquiry',
      category: body.category || 'general',
      status: 'open',
      priority: body.priority || 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: body.initialMessage
        ? [
            {
              id: `msg-${Date.now()}`,
              sender: 'buyer',
              senderName: body.buyerName || 'Rebaz Farhad Salih',
              text: body.initialMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]
        : [],
    };

    serverTickets = [newTicket, ...serverTickets];

    return NextResponse.json({
      success: true,
      ticket: newTicket,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 400 }
    );
  }
}
