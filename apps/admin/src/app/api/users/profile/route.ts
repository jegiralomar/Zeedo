import { NextRequest } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { verifySessionToken } from '@/lib/session';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let userId: string | null = null;
    let phone: string | null = null;

    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        userId = session.userId;
        phone = session.phone;
      }
    }

    const body = await safeParseJson<{
      city?: string;
      deliveryAddress?: string;
      deliveryLat?: number;
      deliveryLng?: number;
      phone?: string;
      id?: string;
    }>(req);

    userId = userId || body.id || null;
    phone = phone || body.phone || null;

    const city = body.city || 'العراق';
    const address = body.deliveryAddress || '';
    const lat = body.deliveryLat ?? null;
    const lng = body.deliveryLng ?? null;

    const pinObj = lat && lng ? {
      latitude: lat,
      longitude: lng,
      city,
      addressText: address,
      landmark: address,
    } : null;

    const pinText = pinObj ? JSON.stringify(pinObj) : null;

    await initDatabaseSchema();
    const sql = getDb();

    if (sql) {
      try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rooftop_lat DOUBLE PRECISION;`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rooftop_lng DOUBLE PRECISION;`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rooftop_pin TEXT;`;
      } catch {}

      let rows: any[] = [];
      if (userId) {
        rows = await sql`
          UPDATE users SET
            city = COALESCE(${city}, city),
            rooftop_landmark = COALESCE(${address}, rooftop_landmark),
            rooftop_lat = COALESCE(${lat}, rooftop_lat),
            rooftop_lng = COALESCE(${lng}, rooftop_lng),
            rooftop_pin = COALESCE(${pinText}, rooftop_pin)
          WHERE id = ${userId}
          RETURNING *;
        `;
      } else if (phone) {
        rows = await sql`
          UPDATE users SET
            city = COALESCE(${city}, city),
            rooftop_landmark = COALESCE(${address}, rooftop_landmark),
            rooftop_lat = COALESCE(${lat}, rooftop_lat),
            rooftop_lng = COALESCE(${lng}, rooftop_lng),
            rooftop_pin = COALESCE(${pinText}, rooftop_pin)
          WHERE phone = ${phone}
          RETURNING *;
        `;
      }

      const u = rows[0];
      return jsonResponse({
        success: true,
        user: u ? {
          id: u.id,
          phone: u.phone,
          name: u.name,
          city: u.city,
          deliveryLocation: lat && lng ? {
            lat,
            lng,
            address,
            city,
          } : undefined,
        } : null,
        source: 'postgres',
      }, undefined, req);
    }

    return jsonResponse({
      success: true,
      user: {
        id: userId,
        phone,
        city,
        deliveryLocation: lat && lng ? { lat, lng, address, city } : undefined,
      },
      source: 'memory_fallback',
    }, undefined, req);
  } catch (error: any) {
    console.error('PATCH /api/users/profile error:', error);
    return jsonResponse({ success: false, error: error.message }, { status: 500 }, req);
  }
}
