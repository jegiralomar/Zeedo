import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth');
  const identifier = searchParams.get('identifier')?.trim() || '';
  const password = searchParams.get('password')?.trim() || '';

  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    // Authenticate merchant
    if (auth === 'true') {
      if (!identifier) {
        return NextResponse.json({ success: false, error: 'Identifier is required' }, { status: 400 });
      }

      const rows = await sql`
        SELECT * FROM sellers 
        WHERE (LOWER(username) = LOWER(${identifier}) OR REPLACE(phone, ' ', '') = REPLACE(${identifier}, ' ', ''))
        LIMIT 1
      `;

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
      }

      const seller = rows[0];
      if (seller.password && seller.password !== password) {
        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }

      let coords = seller.pickup_coordinates;
      if (typeof coords === 'string') {
        try { coords = JSON.parse(coords); } catch { coords = null; }
      }
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        coords = { lat: 36.1911, lng: 44.0092 };
      }

      return NextResponse.json({
        success: true,
        seller: {
          id: seller.id,
          storeName: seller.store_name,
          ownerName: seller.owner_name,
          phone: seller.phone,
          city: seller.city,
          commissionRate: Number(seller.commission_rate),
          auto_approve_listings: Boolean(seller.auto_approve_listings),
          pickupAddress: seller.pickup_address,
          pickupCoordinates: coords,
          status: seller.status,
          totalListings: Number(seller.total_listings),
          completedSales: Number(seller.completed_sales),
          totalCodVolumeIqd: Number(seller.total_cod_volume_iqd),
          rating: Number(seller.rating),
          username: seller.username,
          createdAt: seller.created_at,
        },
      });
    }

    // List sellers
    const rows = await sql`SELECT * FROM sellers ORDER BY created_at DESC`;
    const sellers = rows.map((s: any) => {
      let coords = s.pickup_coordinates;
      if (typeof coords === 'string') {
        try { coords = JSON.parse(coords); } catch { coords = null; }
      }
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        coords = { lat: 36.1911, lng: 44.0092 };
      }
      return {
        id: s.id,
        storeName: s.store_name,
        ownerName: s.owner_name,
        phone: s.phone,
        city: s.city,
        commissionRate: Number(s.commission_rate),
        auto_approve_listings: Boolean(s.auto_approve_listings),
        pickupAddress: s.pickup_address,
        pickupCoordinates: coords,
        status: s.status,
        totalListings: Number(s.total_listings),
        completedSales: Number(s.completed_sales),
        totalCodVolumeIqd: Number(s.total_cod_volume_iqd),
        rating: Number(s.rating),
        username: s.username,
        createdAt: s.created_at,
      };
    });

    return NextResponse.json({ success: true, sellers, count: sellers.length });
  } catch (error: any) {
    console.error('Sellers GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      storeName,
      ownerName,
      phone,
      city = 'Erbil',
      commissionRate = 0.10,
      auto_approve_listings = false,
      pickupAddress = '',
      pickupCoordinates = { lat: 36.1911, lng: 44.0092 },
      username,
      password = 'ZEEDOSeller2026',
    } = body;

    if (!storeName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Store name and phone are required' },
        { status: 400 }
      );
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const cleanUsername = (username || phone.replace(/\s+/g, '')).toLowerCase();
    const id = `sel-${Date.now().toString().slice(-6)}`;
    const coordsJson = JSON.stringify(
      pickupCoordinates?.lat != null && pickupCoordinates?.lng != null
        ? pickupCoordinates
        : { lat: 36.1911, lng: 44.0092 }
    );

    const rows = await sql`
      INSERT INTO sellers (
        id, store_name, owner_name, phone, city, commission_rate,
        auto_approve_listings, pickup_address, pickup_coordinates, status, total_listings,
        completed_sales, total_cod_volume_iqd, rating, username, password, created_at
      ) VALUES (
        ${id}, ${storeName}, ${ownerName || storeName}, ${phone},
        ${city}, ${commissionRate}, ${auto_approve_listings}, ${pickupAddress},
        ${coordsJson}::jsonb,
        'active', 0, 0, 0, 5.0, ${cleanUsername}, ${password}, NOW()
      )
      ON CONFLICT (username) DO UPDATE SET
        store_name = EXCLUDED.store_name,
        owner_name = EXCLUDED.owner_name,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        commission_rate = EXCLUDED.commission_rate,
        auto_approve_listings = EXCLUDED.auto_approve_listings,
        pickup_address = EXCLUDED.pickup_address,
        pickup_coordinates = EXCLUDED.pickup_coordinates,
        password = EXCLUDED.password
      RETURNING *;
    `;

    const s = rows[0];
    let coords = s.pickup_coordinates;
    if (typeof coords === 'string') {
      try { coords = JSON.parse(coords); } catch { coords = null; }
    }
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      coords = { lat: 36.1911, lng: 44.0092 };
    }

    const seller = {
      id: s.id,
      storeName: s.store_name,
      ownerName: s.owner_name,
      phone: s.phone,
      city: s.city,
      commissionRate: Number(s.commission_rate),
      auto_approve_listings: Boolean(s.auto_approve_listings),
      pickupAddress: s.pickup_address,
      pickupCoordinates: coords,
      status: s.status,
      totalListings: Number(s.total_listings),
      completedSales: Number(s.completed_sales),
      totalCodVolumeIqd: Number(s.total_cod_volume_iqd),
      rating: Number(s.rating),
      username: s.username,
      createdAt: s.created_at,
    };

    return NextResponse.json({ success: true, seller });
  } catch (error: any) {
    console.error('Sellers POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, commissionRate, auto_approve_listings, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Seller ID is required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    if (commissionRate !== undefined) {
      await sql`
        UPDATE sellers
        SET commission_rate = ${Number(commissionRate)}
        WHERE id = ${id}
      `;
    }

    if (auto_approve_listings !== undefined) {
      await sql`
        UPDATE sellers
        SET auto_approve_listings = ${Boolean(auto_approve_listings)}
        WHERE id = ${id}
      `;
    }

    if (status !== undefined) {
      await sql`
        UPDATE sellers
        SET status = ${status}
        WHERE id = ${id}
      `;
    }

    const rows = await sql`SELECT * FROM sellers WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    const s = rows[0];
    return NextResponse.json({
      success: true,
      seller: {
        id: s.id,
        storeName: s.store_name,
        commissionRate: Number(s.commission_rate),
        auto_approve_listings: Boolean(s.auto_approve_listings),
        status: s.status,
      },
    });
  } catch (error: any) {
    console.error('Sellers PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
