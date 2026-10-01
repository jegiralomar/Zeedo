import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');
  const status = searchParams.get('status');

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    let rows;
    if (sellerId && status) {
      rows = await sql`
        SELECT * FROM merchant_receipts 
        WHERE seller_id = ${sellerId} AND status = ${status} 
        ORDER BY created_at DESC
      `;
    } else if (sellerId) {
      rows = await sql`
        SELECT * FROM merchant_receipts 
        WHERE seller_id = ${sellerId} 
        ORDER BY created_at DESC
      `;
    } else if (status) {
      rows = await sql`
        SELECT * FROM merchant_receipts 
        WHERE status = ${status} 
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`SELECT * FROM merchant_receipts ORDER BY created_at DESC`;
    }

    const receipts = rows.map((r: any) => ({
      id: r.id,
      sellerId: r.seller_id,
      sellerName: r.seller_name,
      amountIqd: Number(r.amount_iqd),
      paymentMethod: r.payment_method,
      receiptImageUrl: r.receipt_image_url,
      referenceNote: r.reference_note || '',
      status: r.status,
      reviewedBy: r.reviewed_by || null,
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, receipts });
  } catch (err: any) {
    console.error('Error fetching merchant receipts:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sellerId,
      sellerName,
      amountIqd,
      paymentMethod,
      receiptImageUrl,
      referenceNote,
    } = body;

    if (!sellerId || !amountIqd || !paymentMethod || !receiptImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required receipt fields (sellerId, amountIqd, paymentMethod, receiptImageUrl)' },
        { status: 400 }
      );
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const receiptId = `rcpt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await sql`
      INSERT INTO merchant_receipts (
        id, seller_id, seller_name, amount_iqd, payment_method,
        receipt_image_url, reference_note, status, created_at
      ) VALUES (
        ${receiptId}, ${sellerId}, ${sellerName || 'Merchant Partner'},
        ${Number(amountIqd)}, ${paymentMethod}, ${receiptImageUrl},
        ${referenceNote || ''}, 'pending_review', NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      message: 'Receipt submitted successfully for review',
      receiptId,
    });
  } catch (err: any) {
    console.error('Error submitting merchant receipt:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
