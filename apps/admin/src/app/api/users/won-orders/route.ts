import { NextRequest } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { normalizeIraqiPhone } from '@/lib/whatsapp';
import { jsonResponse, handleCorsOptions, safeParseJson } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sellerId = searchParams.get('sellerId');

    let rows;
    if (userId) {
      rows = await sql`
        SELECT * FROM won_orders
        WHERE winner_id = ${userId}
        ORDER BY created_at DESC
      `;
    } else if (sellerId) {
      rows = await sql`
        SELECT * FROM won_orders
        WHERE seller_id = ${sellerId}
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM won_orders
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

    const wonOrders = rows.map((r: any) => ({
      orderId: r.id,
      auctionId: r.auction_id,
      title: r.item_title,
      image: r.item_image,
      winningBidIqd: Number(r.winning_bid_iqd),
      deliveryCity: r.delivery_city || 'Erbil',
      addressText: r.delivery_address || '',
      awbNumber: r.awb_number || `ZEEDO-${r.id.slice(-6).toUpperCase()}`,
      codStatus: r.cod_status || 'ready_for_dispatch',
      placedAt: r.created_at,
    }));

    return jsonResponse({ success: true, wonOrders }, {}, request);
  } catch (err: any) {
    console.error('Error fetching won orders:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const body = await safeParseJson<any>(request);
    const id = body.id || `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const auctionId = body.auctionId || '';
    const winnerId = body.winnerId || body.userId || '';
    const sellerId = body.sellerId || 'sel-01';
    const winningBidIqd = Number(body.winningBidIqd || body.amountIqd || 0);
    const itemTitle = body.itemTitle || body.title || 'Auction Lot';
    const itemImage = body.itemImage || body.image || '';
    const deliveryAddress = body.deliveryAddress || body.address || '';
    const deliveryCity = body.deliveryCity || body.city || 'Erbil';
    const deliveryPhone = body.deliveryPhone || body.phone || '';
    const awbNumber = body.awbNumber || `ZED-${Math.floor(100000 + Math.random() * 900000)}`;
    const codStatus = body.codStatus || 'ready_for_dispatch';

    await sql`
      INSERT INTO won_orders (
        id, auction_id, winner_id, seller_id, winning_bid_iqd,
        item_title, item_image, delivery_address, delivery_city,
        delivery_phone, awb_number, cod_status, created_at, updated_at
      ) VALUES (
        ${id}, ${auctionId}, ${winnerId}, ${sellerId}, ${winningBidIqd},
        ${itemTitle}, ${itemImage}, ${deliveryAddress}, ${deliveryCity},
        ${deliveryPhone}, ${awbNumber}, ${codStatus}, NOW(), NOW()
      )
    `;

    // Update user stats (total_wins, total_spent_iqd) in users table
    try {
      const cleanPhone = deliveryPhone ? normalizeIraqiPhone(deliveryPhone) : '';
      if (winnerId && cleanPhone) {
        await sql`
          UPDATE users SET
            total_wins = COALESCE(total_wins, 0) + 1,
            total_spent_iqd = COALESCE(total_spent_iqd, 0) + ${winningBidIqd},
            updated_at = NOW()
          WHERE id = ${winnerId} OR phone = ${cleanPhone};
        `;
      } else if (winnerId) {
        await sql`
          UPDATE users SET
            total_wins = COALESCE(total_wins, 0) + 1,
            total_spent_iqd = COALESCE(total_spent_iqd, 0) + ${winningBidIqd},
            updated_at = NOW()
          WHERE id = ${winnerId};
        `;
      } else if (cleanPhone) {
        await sql`
          UPDATE users SET
            total_wins = COALESCE(total_wins, 0) + 1,
            total_spent_iqd = COALESCE(total_spent_iqd, 0) + ${winningBidIqd},
            updated_at = NOW()
          WHERE phone = ${cleanPhone};
        `;
      }
    } catch (uErr: any) {
      console.error('Could not update user won orders stats:', uErr);
    }

    return jsonResponse({
      success: true,
      order: {
        orderId: id,
        auctionId,
        title: itemTitle,
        image: itemImage,
        winningBidIqd,
        deliveryCity,
        addressText: deliveryAddress,
        awbNumber,
        codStatus,
      },
    }, { status: 201 }, request);
  } catch (err: any) {
    console.error('Error creating won order:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const body = await safeParseJson<any>(request);
    const { orderId, codStatus, deliveryAddress } = body;
    if (!orderId) {
      return jsonResponse({ success: false, error: 'orderId is required' }, { status: 400 }, request);
    }

    await sql`
      UPDATE won_orders SET
        cod_status = COALESCE(${codStatus ?? null}, cod_status),
        delivery_address = COALESCE(${deliveryAddress ?? null}, delivery_address),
        updated_at = NOW()
      WHERE id = ${orderId}
    `;

    return jsonResponse({ success: true, updated: orderId }, {}, request);
  } catch (err: any) {
    console.error('Error updating won order:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}
