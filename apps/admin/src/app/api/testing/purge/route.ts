import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/session';

export async function POST(request: Request) {
  const adminAuth = verifyAdminRequest(request);
  if (!adminAuth.isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    // 1. Delete test bids
    await sql`DELETE FROM bids WHERE id LIKE 'test-%' OR id LIKE 'bid-test-%'`;

    // 2. Delete test auctions
    const deletedAuctions = await sql`
      DELETE FROM auctions 
      WHERE is_test = TRUE OR id LIKE 'test-%' OR id LIKE 'auc-test-%'
      RETURNING id
    `;

    // 3. Delete test merchants (never delete sel-01 default merchant)
    const deletedSellers = await sql`
      DELETE FROM sellers 
      WHERE (is_test = TRUE OR id LIKE 'test-%' OR id LIKE 'sel-test-%') AND id != 'sel-01'
      RETURNING id
    `;

    // 4. Delete test buyers
    const deletedUsers = await sql`
      DELETE FROM users 
      WHERE is_test = TRUE OR id LIKE 'test-%' OR id LIKE 'usr-test-%'
      RETURNING id
    `;

    // 5. Delete test receipts
    const deletedReceipts = await sql`
      DELETE FROM merchant_receipts 
      WHERE is_test = TRUE OR id LIKE 'test-%' OR id LIKE 'rcpt-test-%'
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: 'All test entities successfully purged from database',
      deleted: {
        auctions: deletedAuctions.length,
        merchants: deletedSellers.length,
        buyers: deletedUsers.length,
        receipts: deletedReceipts.length,
      },
    });
  } catch (err: any) {
    console.error('Error purging test data:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  return POST(request);
}
