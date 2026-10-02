import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId')?.trim() || '';
  const phone = searchParams.get('phone')?.trim() || '';

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    let rows: any[] = [];
    if (userId || phone) {
      rows = await sql`
        SELECT * FROM support_tickets
        WHERE user_id = ${userId} OR buyer_id = ${userId} OR user_phone = ${phone} OR buyer_phone = ${phone}
        ORDER BY updated_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM support_tickets
        ORDER BY updated_at DESC
      `;
    }

    const tickets = rows.map((t: any) => ({
      id: t.id,
      ticketNumber: t.ticket_number || `TKT-${t.id.slice(-6)}`,
      userId: t.user_id || t.buyer_id,
      userName: t.user_name || t.buyer_name || 'ZEEDO Buyer',
      userPhone: t.user_phone || t.buyer_phone || '',
      buyerCity: t.buyer_city || 'Erbil',
      subject: t.subject || 'Customer Support',
      category: t.category || 'general',
      status: t.status || 'open',
      priority: t.priority || 'normal',
      lastMessage: t.last_message || '',
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    return NextResponse.json({ success: true, count: tickets.length, tickets });
  } catch (error: any) {
    console.error('Support tickets GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userPhone, subject = 'Customer Inquiry', initialMessage = '' } = body;

    if (!userId && !userPhone) {
      return NextResponse.json({ success: false, error: 'User ID or Phone is required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    // Check if there is an existing open ticket for this user
    const existing = await sql`
      SELECT * FROM support_tickets
      WHERE (user_id = ${userId || ''} OR user_phone = ${userPhone || ''} OR buyer_phone = ${userPhone || ''})
        AND status IN ('open', 'in_progress')
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (existing.length > 0) {
      const ticket = existing[0];
      // If initialMessage provided, add it
      if (initialMessage.trim()) {
        const msgId = `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO support_messages (id, ticket_id, sender_type, sender_id, sender_name, message, created_at)
          VALUES (${msgId}, ${ticket.id}, 'user', ${userId || 'guest'}, ${userName || 'Buyer'}, ${initialMessage.trim()}, NOW())
        `;
        await sql`
          UPDATE support_tickets
          SET last_message = ${initialMessage.trim()}, updated_at = NOW()
          WHERE id = ${ticket.id}
        `;
      }

      return NextResponse.json({
        success: true,
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          userId: ticket.user_id || ticket.buyer_id,
          userName: ticket.user_name || ticket.buyer_name,
          userPhone: ticket.user_phone || ticket.buyer_phone,
          status: ticket.status,
          subject: ticket.subject,
        },
      });
    }

    // Create new ticket
    const ticketId = `tkt-${Date.now().toString().slice(-6)}`;
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const rows = await sql`
      INSERT INTO support_tickets (
        id, ticket_number, user_id, user_name, user_phone, buyer_id, buyer_name, buyer_phone,
        subject, status, priority, last_message, created_at, updated_at
      ) VALUES (
        ${ticketId}, ${ticketNumber}, ${userId || ticketId}, ${userName || 'ZEEDO Buyer'}, ${userPhone || ''},
        ${userId || ticketId}, ${userName || 'ZEEDO Buyer'}, ${userPhone || ''},
        ${subject}, 'open', 'normal', ${initialMessage || 'Opened chat with support'}, NOW(), NOW()
      )
      RETURNING *
    `;

    const newTicket = rows[0];

    // If initialMessage provided, record it
    if (initialMessage.trim()) {
      const msgId = `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await sql`
        INSERT INTO support_messages (id, ticket_id, sender_type, sender_id, sender_name, message, created_at)
        VALUES (${msgId}, ${ticketId}, 'user', ${userId || 'guest'}, ${userName || 'Buyer'}, ${initialMessage.trim()}, NOW())
      `;
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: newTicket.id,
        ticketNumber: newTicket.ticket_number,
        userId: newTicket.user_id,
        userName: newTicket.user_name,
        userPhone: newTicket.user_phone,
        status: newTicket.status,
        subject: newTicket.subject,
      },
    });
  } catch (error: any) {
    console.error('Support ticket POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ticket ID is required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    if (status) {
      await sql`
        UPDATE support_tickets
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    if (priority) {
      await sql`
        UPDATE support_tickets
        SET priority = ${priority}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error: any) {
    console.error('Support ticket PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
