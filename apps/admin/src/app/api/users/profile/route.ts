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
      name?: string;
      gender?: 'male' | 'female';
      avatar?: string;
      city?: string;
      deliveryAddress?: string;
      deliveryLat?: number;
      deliveryLng?: number;
      phone?: string;
      id?: string;
    }>(req);

    userId = userId || body.id || null;
    phone = phone || body.phone || null;

    const name = body.name || null;
    const gender = body.gender || null;
    const avatar = body.avatar || null;
    const city = body.city || null;
    const address = body.deliveryAddress || '';
    const lat = body.deliveryLat ?? null;
    const lng = body.deliveryLng ?? null;

    const pinObj = lat && lng ? {
      latitude: lat,
      longitude: lng,
      city: city || 'العراق',
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
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`;
      } catch {}

      let rows: any[] = [];
      if (userId) {
        rows = await sql`
          UPDATE users SET
            name = COALESCE(${name}, name),
            gender = COALESCE(${gender}, gender),
            avatar = COALESCE(${avatar}, avatar),
            city = COALESCE(${city}, city),
            rooftop_landmark = COALESCE(${address ? address : null}, rooftop_landmark),
            rooftop_lat = COALESCE(${lat}, rooftop_lat),
            rooftop_lng = COALESCE(${lng}, rooftop_lng),
            rooftop_pin = COALESCE(${pinText}, rooftop_pin)
          WHERE id = ${userId}
          RETURNING *;
        `;
      } else if (phone) {
        rows = await sql`
          UPDATE users SET
            name = COALESCE(${name}, name),
            gender = COALESCE(${gender}, gender),
            avatar = COALESCE(${avatar}, avatar),
            city = COALESCE(${city}, city),
            rooftop_landmark = COALESCE(${address ? address : null}, rooftop_landmark),
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
          gender: u.gender,
          avatar: u.avatar,
          city: u.city,
          deliveryLocation: lat && lng ? {
            lat,
            lng,
            address,
            city: u.city,
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
        name: name || undefined,
        gender: gender || undefined,
        avatar: avatar || undefined,
        city: city || 'العراق',
        deliveryLocation: lat && lng ? { lat, lng, address, city: city || 'العراق' } : undefined,
      },
      source: 'memory_fallback',
    }, undefined, req);
  } catch (error: any) {
    console.error('PATCH /api/users/profile error:', error);
    return jsonResponse({ success: false, error: error.message }, { status: 500 }, req);
  }
}
