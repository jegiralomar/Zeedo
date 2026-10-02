import { NextResponse, NextRequest } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { handleCorsOptions, corsHeaders } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json([], { headers: corsHeaders(request) });
    }

    const rows = await sql`
      SELECT * FROM auctions 
      WHERE status = 'live'
        AND (end_time IS NULL OR end_time > NOW())
      ORDER BY created_at DESC
    `;

    const formatted = rows.map((r: any) => {
      const titles = typeof r.titles === 'string' ? JSON.parse(r.titles) : (r.titles || {});
      const descriptions = typeof r.descriptions === 'string' ? JSON.parse(r.descriptions) : (r.descriptions || {});
      const images = typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || (r.image_urls ? (typeof r.image_urls === 'string' ? JSON.parse(r.image_urls) : r.image_urls) : []));
      const bidsHistory = typeof r.bids_history === 'string' ? JSON.parse(r.bids_history) : (r.bids_history || []);

      const endsAt = r.auction_ends_at
        ? new Date(r.auction_ends_at).toISOString()
        : r.end_time
        ? new Date(r.end_time).toISOString()
        : new Date(Date.now() + 24 * 3600 * 1000).toISOString();

      const photos = Array.isArray(images) && images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];

      return {
        id: r.id,
        title: titles.ar || titles.ckb || titles.en || r.title || 'Zeedo Auction Lot',
        category: r.category || 'general',
        currentBid: Number(r.current_bid_iqd || 1000),
        startingPrice: 1000,
        bidIncrement: Number(r.increment_step_iqd || 1000),
        endsAt,
        photos,
        totalBids: Number(r.total_bids || 0),
        condition: r.condition || 'Brand New',
        sellerName: r.seller_name || 'عادل عدنان',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        isAntiSnipingActive: Boolean(r.is_anti_sniping_active),
        antiSnipingResetsCount: Number(r.anti_sniping_resets_count || 0),
        bidsHistory: Array.isArray(bidsHistory) ? bidsHistory : [],
      };
    });

    return NextResponse.json(formatted, { headers: corsHeaders(request) });
  } catch (error: any) {
    console.error('Error fetching live auctions:', error);
    return NextResponse.json([], { status: 500, headers: corsHeaders(request) });
  }
}
