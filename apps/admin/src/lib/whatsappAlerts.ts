/**
 * Zeedo Automated WhatsApp Auction & Settlement Alert Dispatcher
 * Dispatches real-time Arabic transactional messages to Iraqi buyers & merchants
 * via Baileys WhatsApp Gateway (port 3001).
 */

const GATEWAY_URL =
  process.env.WHATSAPP_GATEWAY_URL ||
  (process.env.NODE_ENV === 'production' ? 'http://whatsapp-gateway:3001' : 'http://localhost:3001');

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isGatewayOffline?: boolean;
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<SendMessageResult> {
  if (!phone) {
    return { success: false, error: 'Phone number is required' };
  }

  // Format Iraqi phone to international format (e.g. 07701234567 -> 9647701234567)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('07')) {
    cleanPhone = '964' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('7') && cleanPhone.length === 10) {
    cleanPhone = '964' + cleanPhone;
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        message,
      }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (res.ok && data.isSuccess) {
      return { success: true, messageId: data.messageId };
    } else {
      return {
        success: false,
        isGatewayOffline: data.isGatewayOffline || false,
        error: data.message || 'Gateway rejected message',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      isGatewayOffline: true,
      error: err.message || 'WhatsApp Gateway unreachable',
    };
  }
}

/**
 * 1. Auction Won Alert: Sent to winning bidder upon auction close
 */
export async function sendAuctionWonAlert(params: {
  buyerPhone: string;
  buyerName: string;
  auctionTitle: string;
  finalPriceUsd: number;
  finalPriceIqd: number;
  city: string;
  auctionId: string;
}) {
  const message = [
    '🎉 *مبروك! لقد ربحت المزاد في منصة زيدو*',
    '━━━━━━━━━━━━━━━━━━━━',
    `عزيزنا *${params.buyerName}*، لقد انتهى المزاد بنجاح وأنت الفائز:`,
    '',
    `🏷️ *السلعة:* ${params.auctionTitle}`,
    `💰 *سعر الترسية النهائي:* $${params.finalPriceUsd.toLocaleString()} (${params.finalPriceIqd.toLocaleString()} د.ع)`,
    `📍 *وجهة الشحن:* ${params.city}`,
    '🚚 *الدفع عند الاستلام (COD):* 100% مع حق المعاينة والفحص عند الباب.',
    '',
    '📦 نقوم الآن بتجهيز شحنتك مع شركة التوصيل وسنرسل لك بوليصة الشحن (AWB) فور خروج المندوب.',
    '',
    '🌐 تفاصيل طلبك: https://zeedo.bid',
    '📞 خدمة عملاء زيدو على مدار الساعة.',
  ].join('\n');

  return sendWhatsAppMessage(params.buyerPhone, message);
}

/**
 * 2. Outbid Warning Alert: Sent when another bidder outbids current participant
 */
export async function sendOutbidAlert(params: {
  buyerPhone: string;
  buyerName: string;
  auctionTitle: string;
  newBidAmountUsd: number;
  newBidAmountIqd: number;
  auctionId: string;
}) {
  const message = [
    '⚡ *تنبيه مزاد زيدو: تم تجاوز عطائك!*',
    '━━━━━━━━━━━━━━━━━━━━',
    `مرحباً *${params.buyerName}*، تم وضع عطاء أعلى على السلعة التي تزايد عليها:`,
    '',
    `🏷️ *السلعة:* ${params.auctionTitle}`,
    `📈 *العطاء الجديد الأعلى:* $${params.newBidAmountUsd.toLocaleString()} (${params.newBidAmountIqd.toLocaleString()} د.ع)`,
    '',
    '⏱️ الوقت ينفد! أدخل الآن لرفع عطائك واستعادة الصدارة قبل إغلاق المطرقة:',
    `🔗 https://zeedo.bid/auctions?lot=${params.auctionId}`,
    '',
    'زايد. اربح. امتلك. 🚀',
  ].join('\n');

  return sendWhatsAppMessage(params.buyerPhone, message);
}

/**
 * 3. COD Shipment Dispatched Alert: Sent with courier AWB tracking
 */
export async function sendDispatchedAlert(params: {
  buyerPhone: string;
  buyerName: string;
  auctionTitle: string;
  courierName: string;
  awbNumber: string;
  codAmountIqd: number;
  city: string;
}) {
  const message = [
    '🚚 *شحنتك في الطريق إليك مع مندوب التوصيل*',
    '━━━━━━━━━━━━━━━━━━━━',
    `مرحباً *${params.buyerName}*، خرجت شحنة مزادك للتوصيل السريع:`,
    '',
    `🏷️ *السلعة:* ${params.auctionTitle}`,
    `🏢 *شركة الشحن:* ${params.courierName}`,
    `🔖 *رقم البوليصة (AWB):* ${params.awbNumber}`,
    `💵 *المبلغ المطلوب عند الاستلام:* ${params.codAmountIqd.toLocaleString()} د.ع`,
    `📍 *المحافظة:* ${params.city}`,
    '',
    '🔍 *ملاحظة هامة:* لك كامل الحق في فتح الصندوق ومعاينة السلعة وتشغيلها والتأكد من مطابقتها قبل تسليم المبلغ للمندوب.',
    '',
    '🌐 منصة زيدو — zeedo.bid',
  ].join('\n');

  return sendWhatsAppMessage(params.buyerPhone, message);
}

/**
 * 4. Merchant Auction Closed Alert: Sent to merchant with commission breakdown
 */
export async function sendMerchantSettlementAlert(params: {
  merchantPhone: string;
  merchantName: string;
  auctionTitle: string;
  closingPriceUsd: number;
  netPayableIqd: number;
  commissionIqd: number;
  destinationCity: string;
}) {
  const message = [
    '💼 *إشعار تاجر زيدو: تم بيع المزاد بنجاح!*',
    '━━━━━━━━━━━━━━━━━━━━',
    `حضرة التاجر *${params.merchantName}*، تم إغلاق المزاد على سلعتك:`,
    '',
    `🏷️ *السلعة:* ${params.auctionTitle}`,
    `💰 *سعر الإغلاق:* $${params.closingPriceUsd.toLocaleString()}`,
    `📊 *عمولة المنصة (10%):* ${params.commissionIqd.toLocaleString()} د.ع`,
    `💵 *صافي مستحقات التاجر:* ${params.netPayableIqd.toLocaleString()} د.ع`,
    `📍 *مدينة المشتري:* ${params.destinationCity}`,
    '',
    'يرجى تسليم الشحنة لمندوب التوصيل المعتمد لتوثيق التسليم وإيداع الرصيد.',
    '',
    '🌐 لوحة تحكم التجار: https://zeedo.bid/sellers',
  ].join('\n');

  return sendWhatsAppMessage(params.merchantPhone, message);
}
