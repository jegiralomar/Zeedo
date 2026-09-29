import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

const SEED_AUCTIONS: any[] = [];

async function seedAuctions(sql: any) {
  // Production: Do not seed demo auctions
}

export async function GET() {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (sql) {
      await seedAuctions(sql);
      const rows = await sql`SELECT * FROM auctions ORDER BY created_at DESC`;
      const listings = rows.map((r: any) => ({
        id: r.id,
        sellerId: r.seller_id,
        sellerName: r.seller_name,
        titles: r.titles,
        descriptions: r.descriptions,
        category: r.category,
        condition: r.condition,
        startingPriceIqd: Number(r.starting_price_iqd),
        currentBidIqd: Number(r.current_bid_iqd),
        estimatedRetailIqd: Number(r.estimated_retail_iqd),
        status: r.status,
        imageUrls: r.image_urls,
        specifications: r.specifications,
        totalBids: r.total_bids,
        endTime: r.end_time,
        createdAt: r.created_at,
      }));
      return NextResponse.json({ success: true, count: listings.length, listings, source: 'neon_postgres' });
    }
  } catch (error: any) {
    console.error('Listings GET error:', error);
  }
  return NextResponse.json({ success: true, count: SEED_AUCTIONS.length, listings: SEED_AUCTIONS, source: 'memory_fallback' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sellerName = 'Zeedo Merchant', titles, descriptions, category, condition = 'New',
      startingPriceIqd = 100000, estimatedRetailIqd = 500000, imageUrls = [], specifications = [], endTimeHours = 24,
    } = body;

    if (!titles || !category) {
      return NextResponse.json({ success: false, error: 'titles and category are required' }, { status: 400 });
    }

    const id = `auc-${Date.now()}`;
    const endTime = new Date(Date.now() + endTimeHours * 60 * 60 * 1000).toISOString();

    await initDatabaseSchema();
    const sql = getDb();
    if (sql) {
      await sql`
        INSERT INTO auctions (id, seller_id, seller_name, titles, descriptions, category, condition,
          starting_price_iqd, current_bid_iqd, estimated_retail_iqd, status, image_urls, specifications, total_bids, end_time)
        VALUES (${id}, ${'seller-new'}, ${sellerName}, ${JSON.stringify(titles)}::jsonb, ${JSON.stringify(descriptions || {})}::jsonb,
          ${category}, ${condition}, ${startingPriceIqd}, ${startingPriceIqd}, ${estimatedRetailIqd},
          ${'draft'}, ${JSON.stringify(imageUrls)}::jsonb, ${JSON.stringify(specifications)}::jsonb, ${0}, ${endTime})
      `;
      return NextResponse.json({ success: true, id, endTime, source: 'neon_postgres' }, { status: 201 });
    }
    return NextResponse.json({ success: true, id, endTime, source: 'memory_fallback' }, { status: 201 });
  } catch (error: any) {
    console.error('Listings POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
