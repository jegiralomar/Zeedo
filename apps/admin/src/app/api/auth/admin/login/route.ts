import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { createSessionToken } from '@/lib/session';

async function ensureAdminTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(128) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) DEFAULT 'super_admin',
      name VARCHAR(128) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Seed default admin from environment variables on first boot
  const adminUsername = process.env.ADMIN_USERNAME || 'ZAdmin9898';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ZEEDOA98';
  const adminName = process.env.ADMIN_NAME || 'ZEEDO Master Admin';

  const existing = await sql`SELECT id FROM admin_users LIMIT 1`;
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await sql`
      INSERT INTO admin_users (id, username, password_hash, role, name)
      VALUES ('stf-admin-master', ${adminUsername}, ${hash}, 'super_admin', ${adminName})
      ON CONFLICT (username) DO NOTHING;
    `;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json(
        { success: false, message: 'Database not available' },
        { status: 503 }
      );
    }

    await ensureAdminTable(sql);

    const rows = await sql`
      SELECT id, username, password_hash, role, name
      FROM admin_users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a signed session token
    const sessionToken = createSessionToken({
      id: admin.id,
      phone: '+964000000000', // Admin doesn't need a phone
      role: admin.role,
      name: admin.name,
    });

    return NextResponse.json({
      success: true,
      sessionToken,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
