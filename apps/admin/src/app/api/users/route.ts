import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

const SEED_USERS = [
  {
    id: 'usr-101',
    phone: '+964 750 341 8821',
    name: 'Karwan Ahmed Salih',
    city: 'Erbil',
    kyc_status: 'verified',
    kyc_national_id: 'IQ-19920815-11234',
    rooftop_landmark: 'Near Italian Village Villa 42B',
    total_bids: 47,
    total_wins: 3,
    total_spent_iqd: 4250000,
    role: 'buyer',
    created_at: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'usr-102',
    phone: '+964 770 192 4433',
    name: 'Zaid Mustafa Al-Kinani',
    city: 'Baghdad',
    kyc_status: 'pending',
    kyc_national_id: null,
    rooftop_landmark: 'Behind Al-Mansour Mall, Street 14',
    total_bids: 12,
    total_wins: 0,
    total_spent_iqd: 0,
    role: 'buyer',
    created_at: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'usr-buyer-88',
    phone: '+964 750 192 8844',
    name: 'Rebaz Farhad Salih',
    city: 'Erbil',
    kyc_status: 'verified',
    kyc_national_id: 'IQ-19960412-99182',
    rooftop_landmark: 'Behind Family Mall, Street 10',
    total_bids: 88,
    total_wins: 7,
    total_spent_iqd: 11200000,
    role: 'buyer',
    created_at: '2026-08-20T14:00:00.000Z',
  },
  {
    id: 'seller-001',
    phone: '+964 750 111 2233',
    name: 'Soran Tech — Erbil Branch',
    city: 'Erbil',
    kyc_status: 'verified',
    kyc_national_id: 'IQ-MERCHANT-001',
    rooftop_landmark: 'Qaysari Bazaar, Shop #44',
    total_bids: 0,
    total_wins: 0,
    total_spent_iqd: 0,
    role: 'seller',
    created_at: '2026-07-15T09:00:00.000Z',
  },
  {
    id: 'seller-002',
    phone: '+964 770 555 6677',
    name: 'Karada Electronics — Baghdad',
    city: 'Baghdad',
    kyc_status: 'verified',
    kyc_national_id: 'IQ-MERCHANT-002',
    rooftop_landmark: 'Al-Karada District, Al-Mansour St',
    total_bids: 0,
    total_wins: 0,
    total_spent_iqd: 0,
    role: 'seller',
    created_at: '2026-07-20T11:00:00.000Z',
  },
];

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
  const count = await sql`SELECT COUNT(*) FROM users`;
  if (parseInt(count[0].count) > 0) return;
  for (const u of SEED_USERS) {
    await sql`
      INSERT INTO users (id, phone, name, city, kyc_status, kyc_national_id, rooftop_landmark, total_bids, total_wins, total_spent_iqd, role, created_at)
      VALUES (${u.id}, ${u.phone}, ${u.name}, ${u.city}, ${u.kyc_status}, ${u.kyc_national_id},
        ${u.rooftop_landmark}, ${u.total_bids}, ${u.total_wins}, ${u.total_spent_iqd}, ${u.role}, ${u.created_at})
      ON CONFLICT (id) DO NOTHING
    `;
  }
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
