import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { normalizeIraqiPhone } from '@/lib/whatsapp';

async function ensureUsersTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      phone VARCHAR(32) UNIQUE NOT NULL,
      name VARCHAR(128) NOT NULL,
      gender VARCHAR(20),
      avatar TEXT,
      city VARCHAR(64) DEFAULT 'Erbil',
      kyc_status VARCHAR(32) DEFAULT 'verified',
      kyc_national_id VARCHAR(64),
      rooftop_landmark TEXT,
      rooftop_lat DOUBLE PRECISION,
      rooftop_lng DOUBLE PRECISION,
      rooftop_pin TEXT,
      total_bids INT DEFAULT 0,
      total_wins INT DEFAULT 0,
      total_spent_iqd BIGINT DEFAULT 0,
      role VARCHAR(32) DEFAULT 'buyer',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rooftop_lat DOUBLE PRECISION;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rooftop_lng DOUBLE PRECISION;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rooftop_pin TEXT;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_bids INT DEFAULT 0;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_wins INT DEFAULT 0;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent_iqd BIGINT DEFAULT 0;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'buyer';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`;
  } catch {}
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const kyc = searchParams.get('kyc');

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (sql) {
      await ensureUsersTable(sql);
      let rows;
      if (role) {
        rows = await sql`SELECT * FROM users WHERE role = ${role} ORDER BY created_at DESC`;
      } else if (kyc) {
        rows = await sql`SELECT * FROM users WHERE kyc_status = ${kyc} ORDER BY created_at DESC`;
      } else {
        rows = await sql`SELECT * FROM users ORDER BY created_at DESC`;
      }
      const users = rows.map((r: any) => {
        let parsedPin = undefined;
        if (r.rooftop_pin) {
          try {
            parsedPin = typeof r.rooftop_pin === 'string' ? JSON.parse(r.rooftop_pin) : r.rooftop_pin;
          } catch {}
        }
        return {
          id: r.id,
          phone: r.phone,
          name: r.name,
          gender: r.gender,
          avatar: r.avatar,
          avatarUrl: r.avatar,
          city: r.city,
          kycStatus: r.kyc_status || 'pending',
          kycNationalId: r.kyc_national_id,
          rooftopLandmark: r.rooftop_landmark,
          rooftopPin: parsedPin || (r.rooftop_lat ? {
            latitude: Number(r.rooftop_lat),
            longitude: Number(r.rooftop_lng),
            city: r.city,
            landmark: r.rooftop_landmark || '',
            addressText: [r.rooftop_landmark, r.city, 'Iraq'].filter(Boolean).join(', '),
            isVerified: r.kyc_status === 'verified',
          } : undefined),
          totalBids: r.total_bids || 0,
          totalWins: r.total_wins || 0,
          totalSpentIqd: Number(r.total_spent_iqd || 0),
          role: r.role || 'buyer',
          createdAt: r.created_at,
          joinedAt: r.created_at,
        };
      });
      return NextResponse.json({ success: true, count: users.length, users, source: 'postgres' });
    }
  } catch (error: any) {
    console.error('Users GET error:', error);
  }
  return NextResponse.json({ success: true, count: 0, users: [], source: 'fallback' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      phone,
      gender,
      avatar,
      city = 'Erbil',
      role = 'buyer',
      kycStatus,
      rooftopPin,
      rooftopLandmark,
    } = body;

    if (!phone || !name) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    const cleanPhone = normalizeIraqiPhone(phone);
    const userId = id || `usr-${cleanPhone.replace(/\D/g, '')}`;
    const effectiveKyc = kycStatus || 'verified';
    const lat = rooftopPin?.latitude || null;
    const lng = rooftopPin?.longitude || null;
    const landmarkText = rooftopLandmark || rooftopPin?.landmark || rooftopPin?.addressText || null;
    const pinText = rooftopPin ? JSON.stringify(rooftopPin) : null;

    await initDatabaseSchema();
    const sql = getDb();
    if (sql) {
      await ensureUsersTable(sql);
      const rows = await sql`
        INSERT INTO users (
          id, phone, name, gender, avatar, city, role, kyc_status, rooftop_landmark, rooftop_lat, rooftop_lng, rooftop_pin, created_at, updated_at
        )
        VALUES (
          ${userId}, ${cleanPhone}, ${name}, ${gender || null}, ${avatar || null}, ${city}, ${role}, ${effectiveKyc}, ${landmarkText}, ${lat}, ${lng}, ${pinText}, NOW(), NOW()
        )
        ON CONFLICT (phone) DO UPDATE SET
          name = EXCLUDED.name,
          gender = COALESCE(EXCLUDED.gender, users.gender),
          avatar = COALESCE(EXCLUDED.avatar, users.avatar),
          city = EXCLUDED.city,
          kyc_status = COALESCE(EXCLUDED.kyc_status, users.kyc_status),
          rooftop_landmark = COALESCE(EXCLUDED.rooftop_landmark, users.rooftop_landmark),
          rooftop_lat = COALESCE(EXCLUDED.rooftop_lat, users.rooftop_lat),
          rooftop_lng = COALESCE(EXCLUDED.rooftop_lng, users.rooftop_lng),
          rooftop_pin = COALESCE(EXCLUDED.rooftop_pin, users.rooftop_pin),
          updated_at = NOW()
        RETURNING *;
      `;
      const u = rows[0];
      return NextResponse.json({
        success: true,
        user: {
          id: u.id,
          phone: u.phone,
          name: u.name,
          gender: u.gender,
          avatar: u.avatar,
          city: u.city,
          kycStatus: u.kyc_status,
          rooftopLandmark: u.rooftop_landmark,
          rooftopPin: u.rooftop_pin,
          role: u.role,
          createdAt: u.created_at,
          joinedAt: u.created_at,
        },
        source: 'postgres',
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: userId, phone: cleanPhone, name, gender, avatar, city, role, kycStatus: effectiveKyc },
      source: 'memory_fallback',
    });
  } catch (error: any) {
    console.error('Users POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, kycStatus, rooftopLandmark } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });

    const sql = getDb();
    if (sql) {
      await sql`
        UPDATE users SET
          kyc_status = COALESCE(${kycStatus}, kyc_status),
          rooftop_landmark = COALESCE(${rooftopLandmark}, rooftop_landmark)
        WHERE id = ${id}
      `;
      return NextResponse.json({ success: true, id, source: 'postgres' });
    }
    return NextResponse.json({ success: true, id, source: 'memory_fallback' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
