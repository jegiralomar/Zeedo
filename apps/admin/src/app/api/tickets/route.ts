import { NextResponse } from 'next/server';
import { INITIAL_TICKETS } from '@/data/mockData';
import { SupportTicket } from '@/types';
import { getDb, initDatabaseSchema } from '@/lib/db';

// In-memory fallback
let serverTickets: SupportTicket[] = [...INITIAL_TICKETS];

export async function GET() {
  const sql = getDb();
  if (sql) {
    try {
      await initDatabaseSchema();
      const rows = await sql`
        SELECT 
          id, ticket_number as "ticketNumber", buyer_id as "buyerId",
          buyer_name as "buyerName", buyer_phone as "buyerPhone",
          buyer_city as "buyerCity", kyc_status as "kycStatus",
          rooftop_landmark as "rooftopLandmark", subject, category,
          status, priority, messages, created_at as "createdAt",
          updated_at as "updatedAt"
        FROM support_tickets
        ORDER BY created_at DESC;
      `;

      // If database is empty, seed initial tickets
      if (rows.length === 0) {
        for (const t of INITIAL_TICKETS) {
          await sql`
            INSERT INTO support_tickets (
              id, ticket_number, buyer_id, buyer_name, buyer_phone,
              buyer_city, kyc_status, rooftop_landmark, subject,
              category, status, priority, messages, created_at, updated_at
            ) VALUES (
              ${t.id}, ${t.ticketNumber}, ${t.buyerId}, ${t.buyerName},
              ${t.buyerPhone}, ${t.buyerCity}, ${t.kycStatus}, ${t.rooftopLandmark},
              ${t.subject}, ${t.category}, ${t.status}, ${t.priority},
              ${JSON.stringify(t.messages)}::jsonb, ${t.createdAt}, ${t.updatedAt}
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
        return NextResponse.json({
          success: true,
          count: INITIAL_TICKETS.length,
          tickets: INITIAL_TICKETS,
          source: 'neon_postgres_seeded',
        });
      }

      return NextResponse.json({
        success: true,
        count: rows.length,
        tickets: rows,
        source: 'neon_postgres',
      });
    } catch (err) {
      console.warn('Postgres query error, falling back to in-memory tickets:', err);
    }
  }

  return NextResponse.json({
    success: true,
    count: serverTickets.length,
    tickets: serverTickets,
    source: 'in_memory_fallback',
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

    const sql = getDb();
    if (sql) {
      try {
        await initDatabaseSchema();
        await sql`
          INSERT INTO support_tickets (
            id, ticket_number, buyer_id, buyer_name, buyer_phone,
            buyer_city, kyc_status, rooftop_landmark, subject,
            category, status, priority, messages, created_at, updated_at
          ) VALUES (
            ${newTicket.id}, ${newTicket.ticketNumber}, ${newTicket.buyerId},
            ${newTicket.buyerName}, ${newTicket.buyerPhone}, ${newTicket.buyerCity},
            ${newTicket.kycStatus}, ${newTicket.rooftopLandmark}, ${newTicket.subject},
            ${newTicket.category}, ${newTicket.status}, ${newTicket.priority},
            ${JSON.stringify(newTicket.messages)}::jsonb, ${newTicket.createdAt}, ${newTicket.updatedAt}
          );
        `;

        return NextResponse.json({
          success: true,
          ticket: newTicket,
          source: 'neon_postgres',
        });
      } catch (dbErr) {
        console.warn('Failed to insert ticket into Postgres, falling back to memory:', dbErr);
      }
    }

    serverTickets = [newTicket, ...serverTickets];

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      source: 'in_memory_fallback',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 400 }
    );
  }
}
