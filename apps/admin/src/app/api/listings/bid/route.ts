import { getDb, initDatabaseSchema } from '@/lib/db';
import { broadcastLiveEvent } from '@/lib/realtime';
import { normalizeIraqiPhone } from '@/lib/whatsapp';
import { handleCorsOptions, jsonResponse } from '@/lib/cors';
import { verifySessionToken } from '@/lib/session';

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  const respond = (data: any, init?: ResponseInit) => jsonResponse(data, init, request);
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const body = await request.json();
    const auctionId = body.auctionId || body.id;

    let bidderId = body.bidderId || body.userId;
    let bidderPhone = body.bidderPhone || body.phone;
    let bidderName = body.bidderName || body.userName || 'Authorized Buyer';
    let bidderCity = body.bidderCity || body.city || 'العراق';

    // Verify session token if provided
    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        bidderId = session.userId || bidderId;
        bidderPhone = session.phone || bidderPhone;
      }
    }

    bidderId = bidderId || `usr-${Date.now()}`;
    bidderPhone = bidderPhone || '+964 750 000 0000';

    if (!auctionId) {
      return respond({ success: false, error: 'auctionId is required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return respond({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    // 1. Fetch live auction
    const rows = await sql`SELECT * FROM auctions WHERE id = ${auctionId} LIMIT 1`;
    if (rows.length === 0) {
      return respond({ success: false, error: 'Auction not found' }, { status: 404 });
    }

    const auction = rows[0];
    if (auction.status !== 'live') {
      return respond({ success: false, error: 'Auction is not live' }, { status: 400 });
    }

    // Anti-Shill Bidding Protection: Merchants are strictly prohibited from bidding on their own listings
    const cleanBidderPhone = (bidderPhone || '').replace(/\D/g, '');
    const cleanSellerPhone = (auction.seller_phone || '').replace(/\D/g, '');
    if (
      auction.seller_id === bidderId ||
      (cleanSellerPhone && cleanBidderPhone && cleanSellerPhone === cleanBidderPhone)
    ) {
      return respond(
        { success: false, error: 'Anti-Shill Protection: Merchants are strictly prohibited from bidding on their own listings.' },
        { status: 403 }
      );
    }

    // Track previous highest bidder for outbid alerts
    let previousHighestBidder: any = null;
    try {
      previousHighestBidder = typeof auction.highest_bidder === 'string'
        ? JSON.parse(auction.highest_bidder)
        : auction.highest_bidder;
    } catch {
      previousHighestBidder = null;
    }

    const currentBid = Number(auction.current_bid_iqd || 1000);
    const now = new Date();
    const currentEnd = new Date(auction.end_time || auction.auction_ends_at || now.getTime() + 24 * 3600 * 1000);
    const diffSecs = (currentEnd.getTime() - now.getTime()) / 1000;

    // Check if auction already concluded
    if (diffSecs <= 0) {
      return respond(
        { success: false, error: 'Auction has already ended' },
        { status: 400 }
      );
    }

    // Dynamic minimum increment step based on price tier
    let minStep = Number(auction.increment_step_iqd || 1000);
    if (currentBid >= 200000 && minStep < 3000) minStep = 3000;
    else if (currentBid >= 100000 && minStep < 2000) minStep = 2000;

    let newBid = currentBid + minStep;
    const requestedAmount = Number(body.amountIqd || body.amount || 0);

    // Support client chosen increment amount (e.g. +10,000 chip)
    if (requestedAmount > 0) {
      if (requestedAmount <= currentBid) {
        return respond(
          { success: false, error: `Bid must be strictly higher than current bid of ${currentBid.toLocaleString()} IQD` },
          { status: 400 }
        );
      }
      if (requestedAmount < currentBid + minStep) {
        return respond(
          { success: false, error: `Minimum increment is ${minStep.toLocaleString()} IQD. Next minimum bid is ${(currentBid + minStep).toLocaleString()} IQD` },
          { status: 400 }
        );
      }
      newBid = requestedAmount;
    }

    // Anti-Sniping Soft-Close (≤ 60s resets by 60 seconds)
    let newEndTime = currentEnd;
    let isAntiSnipingActive = Boolean(auction.is_anti_sniping_active);
    let resetsCount = Number(auction.anti_sniping_resets_count || 0);

    if (diffSecs <= 60 && diffSecs > 0) {
      isAntiSnipingActive = true;
      resetsCount += 1;
      newEndTime = new Date(now.getTime() + 60 * 1000);
    }

    const bidId = `bid-${Date.now().toString().slice(-6)}`;
    const newRecord = {
      bidId,
      bidderId,
      bidderName,
      bidderPhone,
      amountIqd: newBid,
      timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    };

    let existingHistory = [];
    try {
      existingHistory = typeof auction.bids_history === 'string'
        ? JSON.parse(auction.bids_history)
        : (auction.bids_history || []);
    } catch {
      existingHistory = [];
    }
    const updatedHistory = [newRecord, ...existingHistory].slice(0, 50); // retain last 50 bids

    const highestBidderObj = {
      id: newRecord.bidderId,
      name: bidderName,
      phone: bidderPhone,
      city: bidderCity,
    };

    // 2. Atomic Optimistic Concurrency Update on auctions table:
    // Guarantees no two simultaneous bids can overwrite each other at the same price
    const updateResult = await sql`
      UPDATE auctions SET
        current_bid_iqd = ${newBid},
        total_bids = COALESCE(total_bids, 0) + 1,
        end_time = ${newEndTime.toISOString()},
        auction_ends_at = ${newEndTime.toISOString()},
        highest_bidder = ${JSON.stringify(highestBidderObj)}::jsonb,
        bids_history = ${JSON.stringify(updatedHistory)}::jsonb
      WHERE id = ${auctionId} AND current_bid_iqd = ${currentBid}
      RETURNING id;
    `;

    if (updateResult.length === 0) {
      return respond(
        { success: false, error: 'Outbid! Another buyer placed a bid just before you. Please refresh and try again.' },
        { status: 409 }
      );
    }

    // Persist to bids audit table after successful atomic auction update
    await sql`
      INSERT INTO bids (id, auction_id, bidder_id, bidder_name, bidder_city, amount_iqd, is_anti_sniping_extension, created_at)
      VALUES (${bidId}, ${auctionId}, ${newRecord.bidderId}, ${bidderName}, ${bidderCity}, ${newBid}, ${diffSecs <= 60}, NOW())
    `;

    // 2.5 Update or Upsert bidder in users table so total_bids increments and bidder shows in Admin directory
    try {
      const cleanPhone = normalizeIraqiPhone(bidderPhone);
      const effectiveBidderId = bidderId || `usr-${cleanPhone.replace(/\D/g, '')}`;
      await sql`
        INSERT INTO users (
          id, phone, name, city, role, kyc_status, total_bids, created_at, updated_at
        ) VALUES (
          ${effectiveBidderId}, ${cleanPhone}, ${bidderName}, ${bidderCity}, 'buyer', 'verified', 1, NOW(), NOW()
        )
        ON CONFLICT (phone) DO UPDATE SET
          total_bids = COALESCE(users.total_bids, 0) + 1,
          name = CASE WHEN users.name = 'مشترك زيدو' OR users.name IS NULL THEN EXCLUDED.name ELSE users.name END,
          city = COALESCE(users.city, EXCLUDED.city),
          updated_at = NOW();
      `;
    } catch (uErr: any) {
      console.warn('Could not update user bid count in users table:', uErr?.message);
    }

    // 3. Broadcast to Real-Time WebSocket Gateway in < 5ms
    const broadcastPayload = {
      auctionId,
      currentBidIqd: newBid,
      highestBidder: highestBidderObj,
      totalBids: Number(auction.total_bids || 0) + 1,
      auctionEndsAt: newEndTime.toISOString(),
      isAntiSnipingActive,
      antiSnipingResetsCount: resetsCount,
      newBidRecord: newRecord,
    };

    // Broadcast live bid to both specific auction room and global marketplace feed
    broadcastLiveEvent({
      channels: [`auction:${auctionId}`, 'global'],
      event: 'NEW_BID',
      data: broadcastPayload,
    }).catch(() => {});

    // If there was a previous leader, dispatch in-app real-time outbid alert
    if (
      previousHighestBidder &&
      previousHighestBidder.id &&
      previousHighestBidder.id !== bidderId
    ) {
      broadcastLiveEvent({
        channel: `user:${previousHighestBidder.id}`,
        event: 'OUTBID_ALERT',
        data: {
          auctionId,
          auctionTitle: auction.title || 'Auction Item',
          newBidIqd: newBid,
          outbidAt: now.toISOString(),
        },
      }).catch(() => {});
    }

    return respond({
      success: true,
      bid: newRecord,
      auction: {
        id: auctionId,
        currentBidIqd: newBid,
        incrementStepIqd: minStep,
        totalBids: broadcastPayload.totalBids,
        auctionEndsAt: newEndTime.toISOString(),
        highestBidder: highestBidderObj,
      },
    });
  } catch (error: any) {
    console.error('Bidding POST error:', error);
    return respond({ success: false, error: error.message }, { status: 500 });
  }
}
