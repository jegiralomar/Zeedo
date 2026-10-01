import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reviewedBy, notes } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status must be approved or rejected' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const rows = await sql`SELECT * FROM merchant_receipts WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Receipt not found' }, { status: 404 });
    }

    const receipt = rows[0];

    // Update receipt status
    await sql`
      UPDATE merchant_receipts
      SET 
        status = ${status},
        reviewed_by = ${reviewedBy || 'Admin'},
        reviewed_at = NOW()
      WHERE id = ${id}
    `;

    // If approved, record in merchant_payouts_ledger
    if (status === 'approved') {
      const ledgerId = `ledg-${Date.now()}`;
      await sql`
        INSERT INTO merchant_payouts_ledger (
          id, seller_id, type, amount_iqd, receipt_id, payment_method, notes, created_by, created_at
        ) VALUES (
          ${ledgerId}, ${receipt.seller_id}, 'payment_received',
          ${receipt.amount_iqd}, ${receipt.id}, ${receipt.payment_method},
          ${notes || receipt.reference_note || 'Approved settlement receipt'},
          ${reviewedBy || 'Admin'}, NOW()
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Receipt ${id} has been ${status}`,
    });
  } catch (err: any) {
    console.error('Error reviewing receipt:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
