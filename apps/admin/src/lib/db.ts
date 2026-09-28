import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(databaseUrl);
  }
  return sqlClient;
}

/**
 * Initializes persistent PostgreSQL tables for ZEEDO Bid App
 */
export async function initDatabaseSchema() {
  const sql = getDb();
  if (!sql) return false;

  try {
    // 1. Support Tickets Table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(64) PRIMARY KEY,
        ticket_number VARCHAR(32) UNIQUE NOT NULL,
        buyer_id VARCHAR(64) NOT NULL,
        buyer_name VARCHAR(128) NOT NULL,
        buyer_phone VARCHAR(32) NOT NULL,
        buyer_city VARCHAR(64) DEFAULT 'Erbil',
        kyc_status VARCHAR(32) DEFAULT 'verified',
        rooftop_landmark TEXT,
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(64) DEFAULT 'general',
        status VARCHAR(32) DEFAULT 'open',
        priority VARCHAR(32) DEFAULT 'normal',
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Auctions & Listings Table
    await sql`
      CREATE TABLE IF NOT EXISTS auctions (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL,
        seller_name VARCHAR(128) NOT NULL,
        titles JSONB NOT NULL,
        descriptions JSONB NOT NULL,
        category VARCHAR(64) NOT NULL,
        condition VARCHAR(32) DEFAULT 'New',
        starting_price_iqd BIGINT DEFAULT 1000,
        current_bid_iqd BIGINT DEFAULT 1000,
        estimated_retail_iqd BIGINT NOT NULL,
        status VARCHAR(32) DEFAULT 'live',
        image_urls JSONB DEFAULT '[]'::jsonb,
        specifications JSONB DEFAULT '[]'::jsonb,
        total_bids INT DEFAULT 0,
        end_time TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Live Bids Table
    await sql`
      CREATE TABLE IF NOT EXISTS bids (
        id VARCHAR(64) PRIMARY KEY,
        auction_id VARCHAR(64) REFERENCES auctions(id) ON DELETE CASCADE,
        bidder_id VARCHAR(64) NOT NULL,
        bidder_name VARCHAR(128) NOT NULL,
        bidder_city VARCHAR(64) NOT NULL,
        amount_iqd BIGINT NOT NULL,
        is_anti_sniping_extension BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 4. KYC Verifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS kyc_verifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        document_type VARCHAR(128) NOT NULL,
        full_name_arabic VARCHAR(128),
        full_name_english VARCHAR(128),
        national_id_number VARCHAR(64) NOT NULL,
        date_of_birth VARCHAR(32),
        governorate VARCHAR(64),
        confidence NUMERIC(5, 4) DEFAULT 0.9940,
        status VARCHAR(32) DEFAULT 'verified',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 5. App Settings Table (key-value store for API keys etc.)
    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(128) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    return true;
  } catch (error) {
    console.error('Database schema initialization error:', error);
    return false;
  }
}

/**
 * Read a setting value from the persistent DB settings table.
 * Falls back to the given defaultValue if not found.
 */
export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  try {
    const sql = getDb();
    if (!sql) return defaultValue;
    const rows = await sql`SELECT value FROM app_settings WHERE key = ${key} LIMIT 1`;
    return rows[0]?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Persist a setting value to the DB settings table (upsert).
 */
export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const sql = getDb();
    if (!sql) return;
    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  } catch (err) {
    console.error('setSetting error:', err);
  }
}
