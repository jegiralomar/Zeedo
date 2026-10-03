import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = 'disconnected';
  let latencyMs = 0;

  const sql = getDb();
  if (sql) {
    const start = Date.now();
    try {
      await sql`SELECT 1 as ping`;
      latencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }
  }

  const isHealthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'zeedo-admin-api',
      timestamp,
      database: {
        status: dbStatus,
        latencyMs: isHealthy ? latencyMs : undefined,
      },
      uptime: process.uptime(),
    },
    { status: isHealthy ? 200 : 503 }
  );
}
