import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function POST() {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const now = new Date();

    // 1. Seed 3 Mock Merchants
    const mockSellers = [
      {
        id: 'sel-test-01',
        store_name: 'Baghdad Digital Hub (Test)',
        owner_name: 'Ali Al-Husseini',
        phone: '+964 770 111 9988',
        city: 'Baghdad',
        commission_rate: 0.07,
        auto_approve_listings: true,
        pickup_address: 'Karrada Dakhil, Near Babylon Square, Baghdad',
        username: 'test_baghdad_hub',
        password: 'ZeedoTest98',
        status: 'active',
      },
      {
        id: 'sel-test-02',
        store_name: 'Erbil Tech & Gaming (Test)',
        owner_name: 'Rebin Sorani',
        phone: '+964 750 222 3344',
        city: 'Erbil',
        commission_rate: 0.05,
        auto_approve_listings: false,
        pickup_address: 'Gulan St, Empire World Tower 4, Erbil',
        username: 'test_erbil_gaming',
        password: 'ZeedoTest98',
        status: 'active',
      },
      {
        id: 'sel-test-03',
        store_name: 'Basra Fragrance & Watches (Test)',
        owner_name: 'Karrar Al-Mansouri',
        phone: '+964 780 444 5566',
        city: 'Basra',
        commission_rate: 0.08,
        auto_approve_listings: true,
        pickup_address: 'Al-Jazair Street, Basra',
        username: 'test_basra_luxe',
        password: 'ZeedoTest98',
        status: 'active',
      },
    ];

    for (const s of mockSellers) {
      await sql`
        INSERT INTO sellers (
          id, store_name, owner_name, phone, city, commission_rate,
          auto_approve_listings, pickup_address, status, total_listings,
          completed_sales, total_cod_volume_iqd, rating, username, password, is_test, created_at
        ) VALUES (
          ${s.id}, ${s.store_name}, ${s.owner_name}, ${s.phone}, ${s.city},
          ${s.commission_rate}, ${s.auto_approve_listings}, ${s.pickup_address},
          ${s.status}, 4, 3, 4200000, 4.9, ${s.username}, ${s.password}, TRUE, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          store_name = EXCLUDED.store_name,
          phone = EXCLUDED.phone,
          is_test = TRUE
      `;
    }

    // 2. Seed 5 Mock Verified Buyers
    const mockBuyers = [
      {
        id: 'usr-test-01',
        name: 'Omar Farooq Al-Ani',
        phone: '+964 770 999 1234',
        city: 'Baghdad',
        rooftop_pin: JSON.stringify({
          latitude: 33.3152,
          longitude: 44.3661,
          city: 'Baghdad',
          district: 'Al-Mansour',
          landmark: 'Al-Mansour 14th Ramadan, Near Baghdad Mall',
        }),
      },
      {
        id: 'usr-test-02',
        name: 'Dler Mohammed',
        phone: '+964 750 888 2345',
        city: 'Erbil',
        rooftop_pin: JSON.stringify({
          latitude: 36.1911,
          longitude: 44.0092,
          city: 'Erbil',
          district: 'Dream City',
          landmark: 'Dream City Villa 88, Erbil',
        }),
      },
      {
        id: 'usr-test-03',
        name: 'Hassan Jabbar',
        phone: '+964 780 777 3456',
        city: 'Basra',
        rooftop_pin: JSON.stringify({
          latitude: 30.5081,
          longitude: 47.8182,
          city: 'Basra',
          district: 'Al-Ashar',
          landmark: 'Corniche Rd, Near Basra International Hotel',
        }),
      },
      {
        id: 'usr-test-04',
        name: 'Sara Kawa Aziz',
        phone: '+964 750 666 4567',
        city: 'Sulaymaniyah',
        rooftop_pin: JSON.stringify({
          latitude: 35.5558,
          longitude: 45.4351,
          city: 'Sulaymaniyah',
          district: 'Salim St',
          landmark: 'Salim St, Near Chavy Land',
        }),
      },
      {
        id: 'usr-test-05',
        name: 'Zainab Hussein Al-Musawi',
        phone: '+964 780 555 5678',
        city: 'Najaf',
        rooftop_pin: JSON.stringify({
          latitude: 32.0002,
          longitude: 44.3331,
          city: 'Najaf',
          district: 'Al-Ghadeer',
          landmark: 'Near Al-Kufa University',
        }),
      },
    ];

    for (const b of mockBuyers) {
      await sql`
        INSERT INTO users (
          id, phone, name, city, kyc_status, rooftop_landmark, rooftop_pin,
          total_bids, total_wins, total_spent_iqd, role, is_test, created_at
        ) VALUES (
          ${b.id}, ${b.phone}, ${b.name}, ${b.city}, 'verified',
          ${'Verified Rooftop Location'}, ${b.rooftop_pin}, 8, 2, 1850000, 'buyer', TRUE, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          is_test = TRUE
      `;
    }

    // 3. Seed 4 Mock Live Auctions
    const mockAuctions = [
      {
        id: 'auc-test-01',
        seller_id: 'sel-test-01',
        seller_name: 'Baghdad Digital Hub (Test)',
        seller_phone: '+964 770 111 9988',
        titles: JSON.stringify({ en: 'Apple iPhone 16 Pro Max 256GB Desert Titanium (Test Lot)' }),
        descriptions: JSON.stringify({ en: 'Brand new, sealed Apple iPhone 16 Pro Max with authentic Iraqi warranty.' }),
        category: 'Smartphones',
        condition: 'New',
        starting_price_iqd: 1000,
        current_bid_iqd: 1650000,
        estimated_retail_iqd: 1850000,
        status: 'live',
        image_urls: JSON.stringify([
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        ]),
        total_bids: 14,
        end_time: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), // 10 minutes
      },
      {
        id: 'auc-test-02',
        seller_id: 'sel-test-02',
        seller_name: 'Erbil Tech & Gaming (Test)',
        seller_phone: '+964 750 222 3344',
        titles: JSON.stringify({ en: 'Sony PlayStation 5 Pro Edition 2TB (Test Lot - 45s Sniping)' }),
        descriptions: JSON.stringify({ en: 'Sony PS5 Pro Console Japanese Model with 2 DualSense Wireless Controllers.' }),
        category: 'Gaming & Consoles',
        condition: 'New',
        starting_price_iqd: 1000,
        current_bid_iqd: 920000,
        estimated_retail_iqd: 1100000,
        status: 'live',
        image_urls: JSON.stringify([
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
        ]),
        total_bids: 28,
        end_time: new Date(now.getTime() + 45 * 1000).toISOString(), // 45 seconds (for anti-sniping testing!)
      },
      {
        id: 'auc-test-03',
        seller_id: 'sel-test-01',
        seller_name: 'Baghdad Digital Hub (Test)',
        seller_phone: '+964 770 111 9988',
        titles: JSON.stringify({ en: 'eufy Clean L50 SES Robot Vacuum (Test Lot)' }),
        descriptions: JSON.stringify({ en: 'eufy Clean L50 SES with Auto-Empty Station and LiDAR navigation.' }),
        category: 'Home & Lifestyle',
        condition: 'New Open Box',
        starting_price_iqd: 1000,
        current_bid_iqd: 215000,
        estimated_retail_iqd: 260000,
        status: 'live',
        image_urls: JSON.stringify([
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
        ]),
        total_bids: 9,
        end_time: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(), // 2 hours
      },
      {
        id: 'auc-test-04',
        seller_id: 'sel-test-03',
        seller_name: 'Basra Fragrance & Watches (Test)',
        seller_phone: '+964 780 444 5566',
        titles: JSON.stringify({ en: 'Rolex Submariner Date Ceramic Bezel 41mm (Completed Order Test)' }),
        descriptions: JSON.stringify({ en: 'Sold lot awaiting COD delivery fulfillment.' }),
        category: 'Watches & Luxury',
        condition: 'New',
        starting_price_iqd: 1000,
        current_bid_iqd: 14500000,
        estimated_retail_iqd: 16000000,
        status: 'completed',
        image_urls: JSON.stringify([
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        ]),
        total_bids: 41,
        end_time: new Date(now.getTime() - 1000).toISOString(),
      },
    ];

    for (const a of mockAuctions) {
      await sql`
        INSERT INTO auctions (
          id, seller_id, seller_name, seller_phone, titles, descriptions,
          category, condition, starting_price_iqd, current_bid_iqd,
          estimated_retail_iqd, status, image_urls, total_bids, end_time,
          order_status, is_test, created_at
        ) VALUES (
          ${a.id}, ${a.seller_id}, ${a.seller_name}, ${a.seller_phone},
          ${a.titles}, ${a.descriptions}, ${a.category}, ${a.condition},
          ${a.starting_price_iqd}, ${a.current_bid_iqd}, ${a.estimated_retail_iqd},
          ${a.status}, ${a.image_urls}, ${a.total_bids}, ${a.end_time},
          ${a.status === 'completed' ? 'pending_dispatch' : 'pending_dispatch'}, TRUE, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          current_bid_iqd = EXCLUDED.current_bid_iqd,
          status = EXCLUDED.status,
          end_time = EXCLUDED.end_time,
          is_test = TRUE
      `;
    }

    // 4. Seed 2 Mock Settlement Receipts
    const mockReceipts = [
      {
        id: 'rcpt-test-01',
        seller_id: 'sel-test-01',
        seller_name: 'Baghdad Digital Hub (Test)',
        amount_iqd: 350000,
        payment_method: 'fib',
        receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        reference_note: 'FIB Transfer Ref #FIB-TEST-8819',
        status: 'pending_review',
      },
      {
        id: 'rcpt-test-02',
        seller_id: 'sel-test-02',
        seller_name: 'Erbil Tech & Gaming (Test)',
        amount_iqd: 550000,
        payment_method: 'zaincash',
        receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        reference_note: 'ZainCash Merchant Payment Ref #ZC-99214',
        status: 'pending_review',
      },
    ];

    for (const r of mockReceipts) {
      await sql`
        INSERT INTO merchant_receipts (
          id, seller_id, seller_name, amount_iqd, payment_method,
          receipt_image_url, reference_note, status, is_test, created_at
        ) VALUES (
          ${r.id}, ${r.seller_id}, ${r.seller_name}, ${r.amount_iqd},
          ${r.payment_method}, ${r.receipt_image_url}, ${r.reference_note},
          ${r.status}, TRUE, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          amount_iqd = EXCLUDED.amount_iqd,
          status = EXCLUDED.status,
          is_test = TRUE
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Demo marketplace dataset successfully seeded into database',
      seeded: {
        merchants: mockSellers.length,
        buyers: mockBuyers.length,
        auctions: mockAuctions.length,
        receipts: mockReceipts.length,
      },
    });
  } catch (err: any) {
    console.error('Error seeding test data:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
