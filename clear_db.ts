import { getDb, initDatabaseSchema } from './apps/admin/src/lib/db.ts';
import * as dotenv from 'dotenv';
dotenv.config();

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
