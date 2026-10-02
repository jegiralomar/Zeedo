import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('ticketId')?.trim();

  if (!ticketId) {
    return NextResponse.json({ success: false, error: 'ticketId parameter is required' }, { status: 400 });
  }

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const rows = await sql`
      SELECT 
        id, ticket_id as "ticketId", sender_type as "senderType",
        sender_id as "senderId", sender_name as "senderName",
        message, created_at as "createdAt"
      FROM support_messages
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      success: true,
      count: rows.length,
      messages: rows,
    });
  } catch (error: any) {
    console.error('Support messages GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, senderType = 'user', senderId = 'usr-anon', senderName = 'Sender', message } = body;

    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ success: false, error: 'ticketId and non-empty message are required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const msgId = `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const rows = await sql`
      INSERT INTO support_messages (
        id, ticket_id, sender_type, sender_id, sender_name, message, created_at
      ) VALUES (
        ${msgId}, ${ticketId}, ${senderType}, ${senderId}, ${senderName}, ${message.trim()}, NOW()
      )
      RETURNING 
        id, ticket_id as "ticketId", sender_type as "senderType",
        sender_id as "senderId", sender_name as "senderName",
        message, created_at as "createdAt"
    `;

    // Also update ticket's last_message and updated_at
    await sql`
      UPDATE support_tickets
      SET last_message = ${message.trim()}, updated_at = NOW()
      WHERE id = ${ticketId}
    `;

    return NextResponse.json({
      success: true,
      message: rows[0],
    });
  } catch (error: any) {
    console.error('Support message POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
