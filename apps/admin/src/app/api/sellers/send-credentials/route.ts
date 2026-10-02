import { NextResponse } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { sendWhatsAppCustomMessage } from '@/lib/whatsapp';
import { verifyAdminRequest } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const { sellerId, phone } = body;

    if (!sellerId && !phone) {
      return NextResponse.json({ success: false, error: 'Seller ID or phone is required' }, { status: 400 });
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    let rows;
    if (sellerId) {
      rows = await sql`SELECT * FROM sellers WHERE id = ${sellerId} LIMIT 1`;
    } else {
      rows = await sql`SELECT * FROM sellers WHERE phone = ${phone} LIMIT 1`;
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
    }

    const seller = rows[0];
    const targetPhone = seller.phone;

    const messageText = [
      `👋 مرحباً بك شريكنا العزيز في *منصة زيدو للمزادات*!`,
      ``,
      `تم تفعيل حساب متجرك بنجاح: *${seller.store_name}*`,
      ``,
      `🔑 *بيانات تسجيل الدخول لتطبيق المتجر:*`,
      `• اسم المستخدم: *${seller.username}*`,
      `• كلمة المرور: *${seller.password || 'ZEEDOMerchant98'}*`,
      `• نسبة عمولة المنصة: *${Number(seller.commission_rate) * 100}%*`,
      ``,
      `📲 يمكنك تسجيل الدخول مباشرة عبر تطبيق زيدو واختيار بوابة التجار:`,
      `🌐 https://zeedo.bid`,
      ``,
      `⚠️ يُرجى الحفاظ على سرية بيانات حسابك لتأمين مبيعاتك.`,
      `فريق دعم شركاء زيدو — العراق 🇮🇶`,
    ].join('\n');

    const result = await sendWhatsAppCustomMessage(targetPhone, messageText);

    return NextResponse.json({
      success: true,
      message: result.isSuccess
        ? `Credentials successfully sent to WhatsApp (${targetPhone})`
        : `Simulated dispatch to WhatsApp (${targetPhone})`,
      gatewayMessage: result.message,
    });
  } catch (err: any) {
    console.error('Error sending merchant credentials:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
