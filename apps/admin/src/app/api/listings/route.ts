import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { ListingAuction } from '@/types';
import { verifyAdminRequest } from '@/lib/session';

function formatAuctionRow(r: any): ListingAuction {
  const titles = typeof r.titles === 'string' ? JSON.parse(r.titles) : (r.titles || {});
  const descriptions = typeof r.descriptions === 'string' ? JSON.parse(r.descriptions) : (r.descriptions || {});
  const specifications = typeof r.specifications === 'string' ? JSON.parse(r.specifications) : (r.specifications || []);
  const images = typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || (r.image_urls ? (typeof r.image_urls === 'string' ? JSON.parse(r.image_urls) : r.image_urls) : []));
  const bidsHistory = typeof r.bids_history === 'string' ? JSON.parse(r.bids_history) : (r.bids_history || []);

  let multilingual = r.multilingual ? (typeof r.multilingual === 'string' ? JSON.parse(r.multilingual) : r.multilingual) : null;
  if (!multilingual) {
    const enTitle = titles.en || titles.title || 'New Item';
    const arTitle = titles.ar || titles.title || enTitle;
    const ckbTitle = titles.ckb || titles.title || enTitle;
    const badiniTitle = titles.badini || titles.title || enTitle;

    multilingual = {
      en: { title: enTitle, description: descriptions.en || descriptions.description || '', specs: specifications },
      ar: { title: arTitle, description: descriptions.ar || descriptions.description || '', specs: specifications },
      ckb: { title: ckbTitle, description: descriptions.ckb || descriptions.description || '', specs: specifications },
      badini: { title: badiniTitle, description: descriptions.badini || descriptions.description || '', specs: specifications },
    };
  }

  const startsAt = r.auction_starts_at ? new Date(r.auction_starts_at).toISOString() : (r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString());
  const endsAt = r.auction_ends_at ? new Date(r.auction_ends_at).toISOString() : (r.end_time ? new Date(r.end_time).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString());

  return {
    id: r.id,
    sellerId: r.seller_id,
    sellerName: r.seller_name,
    sellerPhone: r.seller_phone || '+964 750 000 0000',
    sellerAutoApprove: Boolean(r.seller_auto_approve),
    status: r.status || 'moderation_pending',
    condition: r.condition || 'New',
    startingPriceIqd: 1000,
    currentBidIqd: Number(r.current_bid_iqd || 1000),
    estimatedRetailMarketPriceIqd: Number(r.estimated_retail_iqd || 150000),
    estimatedRetailPriceUsd: r.estimated_retail_usd ? Number(r.estimated_retail_usd) : undefined,
    incrementStepIqd: Number(r.increment_step_iqd || 1000),
    multilingual,
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    category: r.category || 'Consumer Electronics',
    sourceType: (r.source_type as any) || 'url',
    sourceValue: r.source_value || '',
    submittedAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    proposedDurationHours: r.proposed_duration_hours ? Number(r.proposed_duration_hours) : 24,
    auctionStartsAt: startsAt,
    auctionEndsAt: endsAt,
    isAntiSnipingActive: false,
    antiSnipingResetsCount: 0,
    totalBids: Number(r.total_bids || 0),
    bidsHistory: Array.isArray(bidsHistory) ? bidsHistory : [],
    highestBidder: r.highest_bidder ? (typeof r.highest_bidder === 'string' ? JSON.parse(r.highest_bidder) : r.highest_bidder) : undefined,
    codStatus: r.cod_status || undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');
  const status = searchParams.get('status');

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, count: 0, listings: [], source: 'memory_fallback' });
    }

    let rows;
    if (sellerId && status) {
      rows = await sql`SELECT * FROM auctions WHERE seller_id = ${sellerId} AND status = ${status} ORDER BY created_at DESC`;
    } else if (sellerId) {
      rows = await sql`SELECT * FROM auctions WHERE seller_id = ${sellerId} ORDER BY created_at DESC`;
    } else if (status) {
      rows = await sql`SELECT * FROM auctions WHERE status = ${status} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM auctions ORDER BY created_at DESC`;
    }

    const listings = rows.map(formatAuctionRow);
    return NextResponse.json({ success: true, count: listings.length, listings, source: 'neon_postgres' });
  } catch (error: any) {
    console.error('Listings GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      sellerId = 'sel-01',
      sellerName = 'Zeedo Merchant',
      sellerPhone = '+964 750 000 0000',
      sellerAutoApprove = false,
      status = 'moderation_pending',
      condition = 'New',
      startingPriceIqd = 1000,
      currentBidIqd = 1000,
      estimatedRetailMarketPriceIqd = 150000,
      estimatedRetailPriceUsd,
      incrementStepIqd = 1000,
      multilingual,
      images = [],
      category = 'Consumer Electronics',
      sourceType = 'url',
      sourceValue = '',
      proposedDurationHours = 24,
      auctionStartsAt,
      auctionEndsAt,
    } = body;

    const newId = id || `zd-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const now = new Date();
    const startsAt = auctionStartsAt || now.toISOString();
    const endsAt = auctionEndsAt || new Date(now.getTime() + proposedDurationHours * 3600 * 1000).toISOString();

    const titles = {
      en: multilingual?.en?.title || 'New Item',
      ar: multilingual?.ar?.title || multilingual?.en?.title || 'منتج جديد',
      ckb: multilingual?.ckb?.title || multilingual?.en?.title || 'کاڵای نوێ',
      badini: multilingual?.badini?.title || multilingual?.en?.title || 'کەلەپەلی نوی',
    };

    const descriptions = {
      en: multilingual?.en?.description || '',
      ar: multilingual?.ar?.description || '',
      ckb: multilingual?.ckb?.description || '',
      badini: multilingual?.badini?.description || '',
    };

    const specifications = multilingual?.en?.specs || [];

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const rows = await sql`
      INSERT INTO auctions (
        id, seller_id, seller_name, seller_phone, seller_auto_approve,
        titles, descriptions, specifications, multilingual,
        category, condition, starting_price_iqd, current_bid_iqd,
        estimated_retail_iqd, estimated_retail_usd, increment_step_iqd,
        status, image_urls, source_type, source_value,
        total_bids, proposed_duration_hours, end_time, created_at
      ) VALUES (
        ${newId}, ${sellerId}, ${sellerName}, ${sellerPhone}, ${sellerAutoApprove},
        ${JSON.stringify(titles)}::jsonb, ${JSON.stringify(descriptions)}::jsonb,
        ${JSON.stringify(specifications)}::jsonb, ${JSON.stringify(multilingual || {})}::jsonb,
        ${category}, ${condition}, ${startingPriceIqd}, ${currentBidIqd},
        ${estimatedRetailMarketPriceIqd}, ${estimatedRetailPriceUsd || null}, ${incrementStepIqd},
        ${status}, ${JSON.stringify(images)}::jsonb, ${sourceType}, ${sourceValue},
        0, ${proposedDurationHours}, ${endsAt}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        seller_name = EXCLUDED.seller_name,
        seller_phone = EXCLUDED.seller_phone,
        titles = EXCLUDED.titles,
        descriptions = EXCLUDED.descriptions,
        specifications = EXCLUDED.specifications,
        multilingual = EXCLUDED.multilingual,
        category = EXCLUDED.category,
        condition = EXCLUDED.condition,
        estimated_retail_iqd = EXCLUDED.estimated_retail_iqd,
        estimated_retail_usd = EXCLUDED.estimated_retail_usd,
        status = EXCLUDED.status,
        image_urls = EXCLUDED.image_urls
      RETURNING *;
    `;

    const formatted = formatAuctionRow(rows[0]);
    return NextResponse.json({ success: true, listing: formatted, id: newId }, { status: 201 });
  } catch (error: any) {
    console.error('Listings POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, rejectionReason, multilingual } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    if (multilingual) {
      await sql`
        UPDATE auctions SET
          status = COALESCE(${status}, status),
          multilingual = ${JSON.stringify(multilingual)}::jsonb
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE auctions SET
          status = COALESCE(${status}, status)
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    console.error('Listings PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
