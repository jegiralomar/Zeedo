import postgres from 'postgres';

let sqlClient: any = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    return null;
  }
  if (!sqlClient) {
    const isSsl = databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech');
    sqlClient = postgres(databaseUrl, {
      ssl: isSsl ? 'require' : false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
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

    // Ensure all extended columns exist for full ListingAuction fidelity
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(32);`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS seller_auto_approve BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS estimated_retail_usd NUMERIC(10, 2);`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS increment_step_iqd INT DEFAULT 1000;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS multilingual JSONB;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS source_type VARCHAR(32) DEFAULT 'url';`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS source_value TEXT;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS bids_history JSONB DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS highest_bidder JSONB;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS cod_status VARCHAR(32);`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS proposed_duration_hours INT DEFAULT 24;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS package_awb_id VARCHAR(64);`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS is_anti_sniping_active BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS anti_sniping_resets_count INT DEFAULT 0;`;

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

    await sql`ALTER TABLE bids ADD COLUMN IF NOT EXISTS is_voided BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE bids ADD COLUMN IF NOT EXISTS void_reason TEXT;`;
    await sql`ALTER TABLE bids ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;`;
    await sql`ALTER TABLE bids ADD COLUMN IF NOT EXISTS voided_by VARCHAR(128);`;

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

    // 6. Sellers / Merchants Table
    await sql`
      CREATE TABLE IF NOT EXISTS sellers (
        id VARCHAR(64) PRIMARY KEY,
        store_name VARCHAR(128) NOT NULL,
        owner_name VARCHAR(128) NOT NULL,
        phone VARCHAR(32) UNIQUE NOT NULL,
        city VARCHAR(64) DEFAULT 'Erbil',
        commission_rate NUMERIC(4, 2) DEFAULT 0.07,
        auto_approve_listings BOOLEAN DEFAULT FALSE,
        pickup_address TEXT,
        status VARCHAR(32) DEFAULT 'active',
        total_listings INT DEFAULT 0,
        completed_sales INT DEFAULT 0,
        total_cod_volume_iqd BIGINT DEFAULT 0,
        rating NUMERIC(3, 1) DEFAULT 5.0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ensure pickup_coordinates column exists
    await sql`ALTER TABLE sellers ADD COLUMN IF NOT EXISTS pickup_coordinates JSONB DEFAULT '{"lat": 36.1911, "lng": 44.0092}'::jsonb;`;

    // Ensure order tracking columns exist on auctions table
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS order_status VARCHAR(32) DEFAULT 'pending_dispatch';`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS order_delivered_at TIMESTAMPTZ;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS order_commission_refunded BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS order_notes TEXT;`;
    await sql`ALTER TABLE auctions ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE sellers ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;

    // 7. Merchant Payment & Settlement Receipts Table
    await sql`
      CREATE TABLE IF NOT EXISTS merchant_receipts (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL,
        seller_name VARCHAR(128) NOT NULL,
        amount_iqd BIGINT NOT NULL,
        payment_method VARCHAR(32) NOT NULL,
        receipt_image_url TEXT NOT NULL,
        reference_note TEXT,
        status VARCHAR(32) DEFAULT 'pending_review',
        is_test BOOLEAN DEFAULT FALSE,
        reviewed_by VARCHAR(128),
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 8. Merchant Commission & Financial Ledger Table
    await sql`
      CREATE TABLE IF NOT EXISTS merchant_payouts_ledger (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL,
        type VARCHAR(32) NOT NULL,
        amount_iqd BIGINT NOT NULL,
        auction_id VARCHAR(64),
        receipt_id VARCHAR(64),
        payment_method VARCHAR(32),
        notes TEXT,
        created_by VARCHAR(128) DEFAULT 'system',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 9. CMS Banners Table
    await sql`
      CREATE TABLE IF NOT EXISTS cms_banners (
        id VARCHAR(64) PRIMARY KEY,
        title_ar VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        title_ckb VARCHAR(255),
        title_badini VARCHAR(255),
        subtitle_ar VARCHAR(255),
        subtitle_en VARCHAR(255),
        subtitle_ckb VARCHAR(255),
        subtitle_badini VARCHAR(255),
        image_url TEXT NOT NULL,
        tap_action VARCHAR(32) DEFAULT 'none',
        action_target TEXT,
        position VARCHAR(32) DEFAULT 'hero',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 10. Won Orders Table (COD Fulfillment for Auction Winners)
    await sql`
      CREATE TABLE IF NOT EXISTS won_orders (
        id VARCHAR(64) PRIMARY KEY,
        auction_id VARCHAR(64) NOT NULL,
        winner_id VARCHAR(64) NOT NULL,
        seller_id VARCHAR(64) NOT NULL,
        winning_bid_iqd BIGINT NOT NULL,
        item_title VARCHAR(255) NOT NULL,
        item_image TEXT NOT NULL,
        delivery_address TEXT,
        delivery_city VARCHAR(64) DEFAULT 'Erbil',
        delivery_lat DOUBLE PRECISION,
        delivery_lng DOUBLE PRECISION,
        delivery_phone VARCHAR(32),
        awb_number VARCHAR(64) UNIQUE,
        cod_status VARCHAR(32) DEFAULT 'ready_for_dispatch',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 11. Users & Buyers Table (Synced across Mobile App and Admin Directory)
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
        is_test BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ensure all columns exist on users table
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
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;

    // 12. Support Helpdesk Tickets and Real-Time Chat Messages
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(64) PRIMARY KEY,
        ticket_number VARCHAR(64),
        user_id VARCHAR(64),
        user_name VARCHAR(128),
        user_phone VARCHAR(32),
        buyer_id VARCHAR(64),
        buyer_name VARCHAR(128),
        buyer_phone VARCHAR(32),
        buyer_city VARCHAR(64) DEFAULT 'Erbil',
        subject VARCHAR(255) DEFAULT 'Customer Inquiry',
        category VARCHAR(64) DEFAULT 'general',
        status VARCHAR(32) DEFAULT 'open',
        priority VARCHAR(32) DEFAULT 'normal',
        last_message TEXT,
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(64);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS user_name VARCHAR(128);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS user_phone VARCHAR(32);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS buyer_id VARCHAR(64);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS buyer_name VARCHAR(128);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(32);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS buyer_city VARCHAR(64);`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS last_message TEXT;`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;`;

    await sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id VARCHAR(64) PRIMARY KEY,
        ticket_id VARCHAR(64) NOT NULL,
        sender_type VARCHAR(16) NOT NULL,
        sender_id VARCHAR(64) NOT NULL,
        sender_name VARCHAR(128) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);`;

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
