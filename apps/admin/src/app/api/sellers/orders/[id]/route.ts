import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { orderStatus, notes, adminName } = body;

    const allowed = ['pending_dispatch', 'dispatched', 'delivered_paid', 'cancelled_refunded'];
    if (!allowed.includes(orderStatus)) {
      return NextResponse.json({ success: false, error: `Invalid order status. Allowed: ${allowed.join(', ')}` }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const rows = await sql`SELECT * FROM auctions WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Auction order not found' }, { status: 404 });
    }

    const auction = rows[0];

    if (orderStatus === 'delivered_paid') {
      await sql`
        UPDATE auctions
        SET 
          order_status = 'delivered_paid',
          cod_status = 'delivered_collected',
          order_delivered_at = NOW(),
          order_notes = ${notes || auction.order_notes || ''}
        WHERE id = ${id}
      `;
    } else if (orderStatus === 'cancelled_refunded') {
      const alreadyRefunded = Boolean(auction.order_commission_refunded);

      await sql`
        UPDATE auctions
        SET 
          order_status = 'cancelled_refunded',
          cod_status = 'returned_to_hub',
          order_commission_refunded = TRUE,
          order_notes = ${notes || 'Order cancelled by buyer / COD refused at door'}
        WHERE id = ${id}
      `;

      // If not already refunded, insert a credit into merchant_payouts_ledger
      if (!alreadyRefunded) {
        // Calculate the commission amount that was charged
        const sellerRows = await sql`SELECT commission_rate FROM sellers WHERE id = ${auction.seller_id} LIMIT 1`;
        const rate = sellerRows[0]?.commission_rate ? Number(sellerRows[0].commission_rate) : 0.07;
        const finalPrice = Number(auction.current_bid_iqd || 0);
        const commissionFee = Math.round(finalPrice * rate);

        if (commissionFee > 0) {
          const ledgerId = `ref-${Date.now()}`;
          await sql`
            INSERT INTO merchant_payouts_ledger (
              id, seller_id, type, amount_iqd, auction_id, notes, created_by, created_at
            ) VALUES (
              ${ledgerId}, ${auction.seller_id}, 'commission_refund',
              ${commissionFee}, ${auction.id},
              ${notes || 'Commission refunded due to cancelled COD delivery'},
              ${adminName || 'Admin'}, NOW()
            )
          `;
        }
      }
    } else {
      await sql`
        UPDATE auctions
        SET 
          order_status = ${orderStatus},
          order_notes = ${notes || auction.order_notes || ''}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
    });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
