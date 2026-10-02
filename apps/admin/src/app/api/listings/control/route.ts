import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { broadcastLiveEvent } from '@/lib/realtime';
import { sendAuctionWonAlert, sendMerchantSettlementAlert } from '@/lib/whatsappAlerts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      auctionId,
      action,
      additionalMinutes = 5,
      bidId,
      voidReason = 'Administrative Moderation',
      operatorName = 'Staff Moderator',
    } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action is required' },
        { status: 400 }
      );
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable' },
        { status: 503 }
      );
    }

    const now = new Date();

    // 0. Auto-Conclude Expired Auctions (Continuous Background Worker Action)
    if (action === 'auto_conclude_expired') {
      const expiredAuctions = await sql`
        SELECT * FROM auctions
        WHERE status = 'live'
          AND end_time IS NOT NULL
          AND end_time <= ${now.toISOString()}
      `;

      const results: any[] = [];
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

      for (const auc of expiredAuctions) {
        const cleanId = (auc.id || '').replace(/^auc-/, '');

        // Parse multilingual titles JSONB to get real item name
        const titlesObj = auc.titles
          ? (typeof auc.titles === 'string' ? JSON.parse(auc.titles) : auc.titles)
          : {};
        const itemTitle = titlesObj.ar || titlesObj.en || titlesObj.ckb || 'سلعة المزاد';
        const packageAwbId = `AWB-IQ-${dateStr}-${cleanId}`;

        let highestBidderObj: any = null;
        try {
          highestBidderObj =
            typeof auc.highest_bidder === 'string'
              ? JSON.parse(auc.highest_bidder)
              : auc.highest_bidder;
        } catch {
          highestBidderObj = null;
        }

        const finalBidIqd = Number(auc.current_bid_iqd || auc.starting_price_iqd || 1000);

        await sql`
          UPDATE auctions SET
            status = 'completed',
            cod_status = 'ready_for_dispatch',
            package_awb_id = ${packageAwbId}
          WHERE id = ${auc.id}
        `;

        const endData = {
          auctionId: auc.id,
          status: 'completed',
          highestBidder: highestBidderObj,
          currentBidIqd: finalBidIqd,
          packageAwbId,
          concludedAt: now.toISOString(),
          operatorName: operatorName || 'Zeedo Background Auto-Conclude Daemon',
        };

        // Broadcast to specific auction room and global feed
        await broadcastLiveEvent({
          channels: [`auction:${auc.id}`, 'global'],
          event: 'AUCTION_ENDED',
          data: endData,
        }).catch(() => {});

        // If winner exists, dispatch winning notification and persist won_orders record
        if (highestBidderObj && highestBidderObj.id) {
          try {
            let itemImg = '';
            if (Array.isArray(auc.image_urls)) itemImg = auc.image_urls[0] || '';
            else if (typeof auc.image_urls === 'string') {
              try { itemImg = JSON.parse(auc.image_urls)[0] || ''; } catch { itemImg = auc.image_urls; }
            }

            // Try to fetch delivery address from users table
            let deliveryAddress = '';
            let deliveryCity = highestBidderObj.city || 'Erbil';
            try {
              const userRows = await sql`
                SELECT rooftop_landmark, city FROM users
                WHERE id = ${highestBidderObj.id} OR phone = ${highestBidderObj.phone || ''}
                LIMIT 1
              `;
              if (userRows[0]) {
                deliveryAddress = userRows[0].rooftop_landmark || '';
                deliveryCity = userRows[0].city || deliveryCity;
              }
            } catch {}

            await sql`
              INSERT INTO won_orders (
                id, auction_id, winner_id, seller_id, winning_bid_iqd,
                item_title, item_image, delivery_address, delivery_city,
                delivery_phone, awb_number, cod_status, created_at, updated_at
              ) VALUES (
                ${'ord-' + auc.id}, ${auc.id}, ${highestBidderObj.id}, ${auc.seller_id || 'sel-01'},
                ${finalBidIqd}, ${itemTitle}, ${itemImg || ''},
                ${deliveryAddress}, ${deliveryCity},
                ${highestBidderObj.phone || ''}, ${packageAwbId}, 'ready_for_dispatch', NOW(), NOW()
              ) ON CONFLICT (id) DO UPDATE SET cod_status = EXCLUDED.cod_status
            `;
          } catch (orderErr) {
            console.warn('Could not persist won_orders row:', orderErr);
          }

          await broadcastLiveEvent({
            channel: `user:${highestBidderObj.id}`,
            event: 'OUTBID_ALERT',
            data: {
              auctionId: auc.id,
              auctionTitle: auc.title || 'Auction Lot',
              isWinner: true,
              wonPriceIqd: finalBidIqd,
              packageAwbId,
            },
          }).catch(() => {});

          if (highestBidderObj.phone) {
            sendAuctionWonAlert({
              buyerPhone: highestBidderObj.phone,
              buyerName: highestBidderObj.name || 'الفائز الكريم',
              auctionTitle: itemTitle,
              finalPriceUsd: Math.round(finalBidIqd / 1510),
              finalPriceIqd: finalBidIqd,
              city: highestBidderObj.city || 'بغداد',
              auctionId: auc.id,
            }).catch(() => {});
          }
        }

        results.push({
          id: auc.id,
          title: itemTitle,
          packageAwbId,
          finalBidIqd,
          winner: highestBidderObj?.name || 'No bids',
        });
      }

      return NextResponse.json({
        success: true,
        action: 'auto_conclude_expired',
        concludedCount: results.length,
        concludedAuctions: results,
      });
    }

    if (!auctionId) {
      return NextResponse.json(
        { success: false, error: 'auctionId is required for this action' },
        { status: 400 }
      );
    }

    // 1. Fetch auction row
    const rows = await sql`SELECT * FROM auctions WHERE id = ${auctionId} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Auction not found' },
        { status: 404 }
      );
    }

    const auction = rows[0];

    // 2. Action Handlers

    // A. Extend Timer
    if (action === 'extend_timer') {
      const addMins = Math.max(1, Number(additionalMinutes) || 5);
      const currentEnd = new Date(
        auction.end_time || auction.auction_ends_at || now.getTime() + 24 * 3600 * 1000
      );
      const baseTime = currentEnd.getTime() > now.getTime() ? currentEnd.getTime() : now.getTime();
      const newEndTime = new Date(baseTime + addMins * 60 * 1000);

      await sql`
        UPDATE auctions SET
          end_time = ${newEndTime.toISOString()},
          status = 'live'
        WHERE id = ${auctionId}
      `;

      const broadcastData = {
        auctionId,
        auctionEndsAt: newEndTime.toISOString(),
        additionalMinutes: addMins,
        status: 'live',
        operatorName,
      };

      // Broadcast to specific auction room and global feed
      await broadcastLiveEvent({
        channels: [`auction:${auctionId}`, 'global'],
        event: 'TIMER_EXTENDED',
        data: broadcastData,
      }).catch(() => {});

      // Backward compatibility for any listeners expecting TIMER_RESET
      await broadcastLiveEvent({
        channels: [`auction:${auctionId}`, 'global'],
        event: 'TIMER_RESET',
        data: broadcastData,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        auctionId,
        action: 'extend_timer',
        auctionEndsAt: newEndTime.toISOString(),
        status: 'live',
      });
    }

    // B. Toggle Pause / Pause / Resume
    if (action === 'toggle_pause' || action === 'pause' || action === 'resume') {
      const isCurrentlyPaused =
        auction.status === 'cancelled' || auction.status === 'paused';
      let newStatus: string;
      if (action === 'pause') {
        newStatus = 'cancelled';
      } else if (action === 'resume') {
        newStatus = 'live';
      } else {
        newStatus = isCurrentlyPaused ? 'live' : 'cancelled';
      }

      await sql`
        UPDATE auctions SET status = ${newStatus} WHERE id = ${auctionId}
      `;

      const eventName = newStatus === 'live' ? 'AUCTION_RESUMED' : 'AUCTION_PAUSED';

      await broadcastLiveEvent({
        channels: [`auction:${auctionId}`, 'global'],
        event: eventName,
        data: {
          auctionId,
          status: newStatus,
          isPaused: newStatus !== 'live',
          operatorName,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        auctionId,
        action,
        status: newStatus,
      });
    }

    // C. Force End / Conclude & Dispatch to Courier
    if (action === 'force_end') {
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const cleanId = auctionId.replace(/^auc-/, '');
      const packageAwbId = `AWB-IQ-${dateStr}-${cleanId}`;

      let highestBidderObj: any = null;
      try {
        highestBidderObj =
          typeof auction.highest_bidder === 'string'
            ? JSON.parse(auction.highest_bidder)
            : auction.highest_bidder;
      } catch {
        highestBidderObj = null;
      }

      // Parse real item title from multilingual JSONB
      const titlesObj = auction.titles
        ? (typeof auction.titles === 'string' ? JSON.parse(auction.titles) : auction.titles)
        : {};
      const itemTitle = titlesObj.ar || titlesObj.en || titlesObj.ckb || 'سلعة المزاد';

      const finalBidIqd = Number(auction.current_bid_iqd || 1000);

      await sql`
        UPDATE auctions SET
          status = 'completed',
          end_time = ${now.toISOString()},
          cod_status = 'ready_for_dispatch',
          package_awb_id = ${packageAwbId}
        WHERE id = ${auctionId}
      `;

      const endData = {
        auctionId,
        status: 'completed',
        highestBidder: highestBidderObj,
        currentBidIqd: finalBidIqd,
        packageAwbId,
        concludedAt: now.toISOString(),
        operatorName,
      };

      // Broadcast auction concluded to all clients
      await broadcastLiveEvent({
        channels: [`auction:${auctionId}`, 'global'],
        event: 'AUCTION_ENDED',
        data: endData,
      }).catch(() => {});

      // If there is a winner, dispatch personal notification to their user channel
      if (highestBidderObj && highestBidderObj.id) {
        await broadcastLiveEvent({
          channel: `user:${highestBidderObj.id}`,
          event: 'OUTBID_ALERT',
          data: {
            auctionId,
            auctionTitle: auction.title || 'Auction Lot',
            isWinner: true,
            wonPriceIqd: finalBidIqd,
            packageAwbId,
          },
        }).catch(() => {});

        if (highestBidderObj.phone) {
          sendAuctionWonAlert({
            buyerPhone: highestBidderObj.phone,
            buyerName: highestBidderObj.name || 'الفائز الكريم',
            auctionTitle: itemTitle,
            finalPriceUsd: Math.round(finalBidIqd / 1510),
            finalPriceIqd: finalBidIqd,
            city: highestBidderObj.city || 'بغداد',
            auctionId,
          }).catch(() => {});
        }
      }

      return NextResponse.json({
        success: true,
        auctionId,
        action: 'force_end',
        status: 'completed',
        packageAwbId,
        finalBidIqd,
        highestBidder: highestBidderObj,
      });
    }

    // D. Void Bid & Recalculate Winning Amount
    if (action === 'void_bid') {
      if (!bidId) {
        return NextResponse.json(
          { success: false, error: 'bidId is required to void a bid' },
          { status: 400 }
        );
      }

      // 1. Mark in bids table if exists
      try {
        await sql`
          UPDATE bids SET
            is_voided = TRUE,
            void_reason = ${voidReason},
            voided_at = NOW(),
            voided_by = ${operatorName}
          WHERE id = ${bidId} OR auction_id = ${auctionId} AND id = ${bidId}
        `;
      } catch (err) {
        console.warn('Could not update bids row for voided bid:', err);
      }

      // 2. Parse and update bids_history in auctions table
      let existingHistory: any[] = [];
      try {
        existingHistory =
          typeof auction.bids_history === 'string'
            ? JSON.parse(auction.bids_history)
            : auction.bids_history || [];
      } catch {
        existingHistory = [];
      }

      const updatedHistory = existingHistory.map((b: any) => {
        const idMatch = b.id === bidId || b.bidId === bidId;
        if (idMatch) {
          return {
            ...b,
            isVoided: true,
            voidReason,
            voidedAt: now.toISOString(),
            voidedBy: operatorName,
          };
        }
        return b;
      });

      // Filter valid remaining bids
      const validBids = updatedHistory.filter((b: any) => !b.isVoided);
      let newCurrentBid = Number(auction.starting_price_iqd || 1000);
      let newHighestBidder: any = null;

      if (validBids.length > 0) {
        const sorted = [...validBids].sort((a: any, b: any) => {
          const amountA = Number(a.amountIqd || a.amount_iqd || 0);
          const amountB = Number(b.amountIqd || b.amount_iqd || 0);
          return amountB - amountA;
        });

        const topBid = sorted[0];
        newCurrentBid = Number(topBid.amountIqd || topBid.amount_iqd || 1000);
        newHighestBidder = {
          id: topBid.bidderId || topBid.bidder_id,
          name: topBid.bidderName || topBid.bidder_name || 'Buyer',
          phone: topBid.bidderPhone || topBid.bidder_phone || '+964 750 000 0000',
          city: topBid.bidderCity || topBid.bidder_city || 'Erbil',
        };
      }

      // Update auctions table
      await sql`
        UPDATE auctions SET
          bids_history = ${JSON.stringify(updatedHistory)}::jsonb,
          current_bid_iqd = ${newCurrentBid},
          highest_bidder = ${newHighestBidder ? JSON.stringify(newHighestBidder) : null}::jsonb,
          total_bids = ${validBids.length}
        WHERE id = ${auctionId}
      `;

      const voidBroadcastData = {
        auctionId,
        voidedBidId: bidId,
        voidReason,
        currentBidIqd: newCurrentBid,
        highestBidder: newHighestBidder,
        totalBids: validBids.length,
        operatorName,
      };

      // Broadcast bid voided to all clients
      await broadcastLiveEvent({
        channels: [`auction:${auctionId}`, 'global'],
        event: 'BID_VOIDED',
        data: voidBroadcastData,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        auctionId,
        action: 'void_bid',
        voidedBidId: bidId,
        currentBidIqd: newCurrentBid,
        highestBidder: newHighestBidder,
        totalBids: validBids.length,
      });
    }

    // E. Anti-Sniping Reset (<= 60s soft close)
    if (action === 'anti_sniping_reset') {
      const newEndTime = new Date(now.getTime() + 60 * 1000);
      const resetCount = Number(auction.anti_sniping_resets_count || 0) + 1;

      await sql`
        UPDATE auctions SET
          end_time = ${newEndTime.toISOString()},
          is_anti_sniping_active = TRUE,
          anti_sniping_resets_count = ${resetCount}
        WHERE id = ${auctionId}
      `;

      const resetData = {
        auctionId,
        auctionEndsAt: newEndTime.toISOString(),
        isAntiSnipingActive: true,
        antiSnipingResetsCount: resetCount,
      };

      await broadcastLiveEvent({
        channels: [`auction:${auctionId}`, 'global'],
        event: 'TIMER_RESET',
        data: resetData,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        auctionId,
        action: 'anti_sniping_reset',
        auctionEndsAt: newEndTime.toISOString(),
        antiSnipingResetsCount: resetCount,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Listings Control POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
