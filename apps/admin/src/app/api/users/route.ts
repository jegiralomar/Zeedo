import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

const SEED_USERS: any[] = [];

async function ensureUsersTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      phone VARCHAR(32) UNIQUE NOT NULL,
      name VARCHAR(128) NOT NULL,
      city VARCHAR(64) DEFAULT 'Erbil',
      kyc_status VARCHAR(32) DEFAULT 'pending',
      kyc_national_id VARCHAR(64),
      rooftop_landmark TEXT,
      total_bids INT DEFAULT 0,
      total_wins INT DEFAULT 0,
      total_spent_iqd BIGINT DEFAULT 0,
      role VARCHAR(32) DEFAULT 'buyer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

async function seedUsers(sql: any) {
  // Production: Do not seed demo users
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
      await seedUsers(sql);
      let rows;
      if (role) {
        rows = await sql`SELECT * FROM users WHERE role = ${role} ORDER BY created_at DESC`;
      } else if (kyc) {
        rows = await sql`SELECT * FROM users WHERE kyc_status = ${kyc} ORDER BY created_at DESC`;
      } else {
        rows = await sql`SELECT * FROM users ORDER BY created_at DESC`;
      }
      const users = rows.map((r: any) => ({
        id: r.id,
        phone: r.phone,
        name: r.name,
        city: r.city,
        kycStatus: r.kyc_status,
        kycNationalId: r.kyc_national_id,
        rooftopLandmark: r.rooftop_landmark,
        totalBids: r.total_bids,
        totalWins: r.total_wins,
        totalSpentIqd: Number(r.total_spent_iqd),
        role: r.role,
        createdAt: r.created_at,
      }));
      return NextResponse.json({ success: true, count: users.length, users, source: 'neon_postgres' });
    }
  } catch (error: any) {
    console.error('Users GET error:', error);
  }
  const filtered = role ? SEED_USERS.filter(u => u.role === role) : SEED_USERS;
  return NextResponse.json({ success: true, count: filtered.length, users: filtered, source: 'memory_fallback' });
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
      return NextResponse.json({ success: true, id, source: 'neon_postgres' });
    }
    return NextResponse.json({ success: true, id, source: 'memory_fallback' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
