import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';

const SEED_AUCTIONS = [
  {
    id: 'auc-001',
    seller_id: 'seller-001',
    seller_name: 'Zeedo Verified Merchant — Erbil',
    titles: JSON.stringify({
      en: 'Apple iPhone 16 Pro Max 256GB — Natural Titanium',
      ar: 'آبل آيفون 16 برو ماكس 256 جيجابايت — تيتانيوم طبيعي',
      ckb: 'ئەپڵ ئایفۆن 16 پرۆ ماکس 256 گێگابایت — تیتانیۆمی سروشتی',
      badini: 'ئەپڵ ئایفۆن 16 پرۆ ماکس 256 گێگابایت — تیتانیۆمێ سروشتی',
    }),
    descriptions: JSON.stringify({
      en: 'Brand new factory sealed iPhone 16 Pro Max with official Iraqi dealer warranty. 100% Cash-on-Delivery with 5-minute doorstep inspection.',
      ar: 'آيفون 16 برو ماكس جديد ومختوم مع ضمان الوكيل الرسمي في العراق. دفع عند الاستلام مع فحص مجاني.',
      ckb: 'ئایفۆن 16 پرۆ ماکس نوێ لەگەڵ گرێنتی فەرمی. دانی پارە لە کاتی وەرگرتن.',
      badini: 'ئایفۆن 16 پرۆ ماکس نووی دگەل گرەنتیا فەرمی. پارەدان دەمێ وەرگرتنێ.',
    }),
    category: 'Smartphones',
    condition: 'New',
    starting_price_iqd: 1200000,
    current_bid_iqd: 1380000,
    estimated_retail_iqd: 1750000,
    status: 'live',
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
    ]),
    specifications: JSON.stringify(['A18 Pro Chip', '256GB NVMe Storage', '6.9" Super Retina XDR OLED', 'Titanium Frame', '1 Year Iraqi Dealer Warranty']),
    total_bids: 14,
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'auc-002',
    seller_id: 'seller-002',
    seller_name: 'Zeedo Verified Merchant — Baghdad',
    titles: JSON.stringify({
      en: 'Sony PlayStation 5 Slim 1TB — Middle East Specs',
      ar: 'سوني بلايستيشن 5 سليم 1 تيرابايت — المواصفات الشرق أوسطية',
      ckb: 'سۆنی پلەیستەیشن 5 سلیم 1 تێرابایت — مۆدێلی ڕۆژهەڵاتی ناوەڕاست',
      badini: 'سۆنی پلەیستەیشن 5 سلیم 1 تێرابایت — مۆدێلێ رۆژهەلاتێ ناڤین',
    }),
    descriptions: JSON.stringify({
      en: 'Original Sony PS5 Slim with DualSense Controller and 1TB ultra-fast SSD. Direct cash on delivery with doorstep serial verification.',
      ar: 'بلايستيشن 5 أصلي مع يدة تحكم DualSense. دفع نقدي عند الباب مع التحقق من الرقم التسلسلي.',
      ckb: 'پلەیستەیشن 5 سلیم ئەسڵی لەگەڵ کۆنتڕۆڵی دوواڵسێنس. پارەدان کاش لەبەر ماڵ.',
      badini: 'پلەیستەیشن 5 سلیم ئەسلی دگەل کۆنترۆلا دوال سێنس. پارەدان کاش ل بەر دەرگەهی.',
    }),
    category: 'Gaming & Consoles',
    condition: 'New',
    starting_price_iqd: 600000,
    current_bid_iqd: 680000,
    estimated_retail_iqd: 750000,
    status: 'live',
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
    ]),
    specifications: JSON.stringify(['1TB Custom NVMe SSD', 'AMD Zen 2 8-Core CPU', 'DualSense Haptic Controller Included', '4K 120Hz Output', 'ME Official Warranty']),
    total_bids: 8,
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'auc-003',
    seller_id: 'seller-001',
    seller_name: 'Zeedo Verified Merchant — Erbil',
    titles: JSON.stringify({
      en: 'Rolex Submariner 116610LN Black Dial — Sapphire Crystal',
      ar: 'رولكس سابمارينر 116610LN — زجاج الياقوت الأزرق الأسود',
      ckb: 'رۆلیکس سابمارینەر 116610LN — کریستاڵی یاقووتی دژە ڕووشان',
      badini: 'رۆلیکس سابمارینەر 116610LN — شیشێ یاقووتێ دژە خورین',
    }),
    descriptions: JSON.stringify({
      en: 'Certified Rolex with full box and papers. International authenticity card included. Zero deposit, 100% Cash-on-Delivery with 5-minute unboxing inspection.',
      ar: 'ساعة رولكس مع العلبة الكاملة وشهادة الأصالة الدولية. بدون دفعة مسبقة، دفع عند الاستلام.',
      ckb: 'رۆلیکسی دڵنیاکراو لەگەڵ سندووقی ئەسڵی و گرێنتی نێودەوڵەتی. بەبێ پێشەکی.',
      badini: 'رۆلیکسێ دگەل سندوقا ئەسلی و گرەنتیا نێڤدەولەتی. بێ پێشەکی.',
    }),
    category: 'Watches & Luxury',
    condition: 'New Open Box',
    starting_price_iqd: 1500000,
    current_bid_iqd: 1650000,
    estimated_retail_iqd: 2100000,
    status: 'live',
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    ]),
    specifications: JSON.stringify(['Scratch-Resistant Sapphire Crystal', 'Automatic Self-Winding Movement', 'Solid 316L Stainless Steel', 'Water Resistant 100m', 'Full Box & Papers']),
    total_bids: 21,
    end_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
  },
];

async function seedAuctions(sql: any) {
  const count = await sql`SELECT COUNT(*) FROM auctions`;
  if (parseInt(count[0].count) > 0) return;
  for (const a of SEED_AUCTIONS) {
    await sql`
      INSERT INTO auctions (id, seller_id, seller_name, titles, descriptions, category, condition,
        starting_price_iqd, current_bid_iqd, estimated_retail_iqd, status, image_urls, specifications, total_bids, end_time)
      VALUES (${a.id}, ${a.seller_id}, ${a.seller_name}, ${a.titles}::jsonb, ${a.descriptions}::jsonb,
        ${a.category}, ${a.condition}, ${a.starting_price_iqd}, ${a.current_bid_iqd}, ${a.estimated_retail_iqd},
        ${a.status}, ${a.image_urls}::jsonb, ${a.specifications}::jsonb, ${a.total_bids}, ${a.end_time})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function GET() {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (sql) {
      await seedAuctions(sql);
      const rows = await sql`SELECT * FROM auctions ORDER BY created_at DESC`;
      const listings = rows.map((r: any) => ({
        id: r.id,
        sellerId: r.seller_id,
        sellerName: r.seller_name,
        titles: r.titles,
        descriptions: r.descriptions,
        category: r.category,
        condition: r.condition,
        startingPriceIqd: Number(r.starting_price_iqd),
        currentBidIqd: Number(r.current_bid_iqd),
        estimatedRetailIqd: Number(r.estimated_retail_iqd),
        status: r.status,
        imageUrls: r.image_urls,
        specifications: r.specifications,
        totalBids: r.total_bids,
        endTime: r.end_time,
        createdAt: r.created_at,
      }));
      return NextResponse.json({ success: true, count: listings.length, listings, source: 'neon_postgres' });
    }
  } catch (error: any) {
    console.error('Listings GET error:', error);
  }
  return NextResponse.json({ success: true, count: SEED_AUCTIONS.length, listings: SEED_AUCTIONS, source: 'memory_fallback' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sellerName = 'Zeedo Merchant', titles, descriptions, category, condition = 'New',
      startingPriceIqd = 100000, estimatedRetailIqd = 500000, imageUrls = [], specifications = [], endTimeHours = 24,
    } = body;

    if (!titles || !category) {
      return NextResponse.json({ success: false, error: 'titles and category are required' }, { status: 400 });
    }

    const id = `auc-${Date.now()}`;
    const endTime = new Date(Date.now() + endTimeHours * 60 * 60 * 1000).toISOString();

    await initDatabaseSchema();
    const sql = getDb();
    if (sql) {
      await sql`
        INSERT INTO auctions (id, seller_id, seller_name, titles, descriptions, category, condition,
          starting_price_iqd, current_bid_iqd, estimated_retail_iqd, status, image_urls, specifications, total_bids, end_time)
        VALUES (${id}, ${'seller-new'}, ${sellerName}, ${JSON.stringify(titles)}::jsonb, ${JSON.stringify(descriptions || {})}::jsonb,
          ${category}, ${condition}, ${startingPriceIqd}, ${startingPriceIqd}, ${estimatedRetailIqd},
          ${'draft'}, ${JSON.stringify(imageUrls)}::jsonb, ${JSON.stringify(specifications)}::jsonb, ${0}, ${endTime})
      `;
      return NextResponse.json({ success: true, id, endTime, source: 'neon_postgres' }, { status: 201 });
    }
    return NextResponse.json({ success: true, id, endTime, source: 'memory_fallback' }, { status: 201 });
  } catch (error: any) {
    console.error('Listings POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
