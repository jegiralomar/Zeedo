import { getDb, initDatabaseSchema } from './src/lib/db';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
  if (process.env.DATABASE_URL_UNPOOLED) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  }
}
console.log('Using DB URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');




async function clearDb() {
  const sql = getDb();
  if (!sql) {
    console.error('No database connection available. Check DATABASE_URL');
    process.exit(1);
  }

  console.log('Dropping all tables...');
  try {
    await sql`
      DROP TABLE IF EXISTS 
        support_messages,
        support_tickets,
        bids,
        won_orders,
        auctions,
        kyc_verifications,
        merchant_receipts,
        merchant_payouts_ledger,
        cms_banners,
        sellers,
        users,
        app_settings
      CASCADE;
    `;
    console.log('Tables dropped successfully.');
    
    console.log('Re-initializing schema...');
    const result = await initDatabaseSchema();
    if (result) {
      console.log('Schema initialized successfully.');
    } else {
      console.error('Failed to initialize schema.');
    }
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    process.exit(0);
  }
}

clearDb();
