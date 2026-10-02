'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  MapPin,
  Phone,
  Store,
  ShieldCheck,
  Package,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export interface ShippingSlipData {
  awbNumber: string;
  auctionId: string;
  itemTitle: string;
  itemCategory?: string;
  itemCondition?: string;
  codAmountIqd: number;
  sellerStoreName: string;
  sellerOwnerName?: string;
  sellerPhone: string;
  sellerCity: string;
  sellerAddress?: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  buyerDistrict?: string;
  buyerAddress: string;
  buyerGpsLat?: number;
  buyerGpsLng?: number;
  orderDate?: string;
}

interface PrintShippingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShippingSlipData | null;
}

export const PrintShippingSlipModal: React.FC<PrintShippingSlipModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [labelSize, setLabelSize] = useState<'thermal_4x6' | 'standard_a4'>('thermal_4x6');

  // Compute the Google Maps link pointing directly to the buyer's rooftop GPS pin
  const lat = data?.buyerGpsLat || 33.3128;
  const lng = data?.buyerGpsLng || 44.3541;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(mapsUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.warn('Failed to generate GPS QR code:', err));
  }, [data, mapsUrl]);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Control & Preview Shell */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#B4F105]" />
            <div>
              <h3 className="font-extrabold text-sm text-white">
                طباعة ملصق الشحن وبوليصة الطرد (AWB Shipping Slip)
              </h3>
              <p className="text-[11px] text-slate-400">
                وصل حراري 4&quot;&times;6&quot; يلصق على الطرد مع باركود و QR لموقع الزبون
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setLabelSize('thermal_4x6')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  labelSize === 'thermal_4x6' ? 'bg-[#B4F105] text-[#072F1F] font-bold' : 'text-slate-300'
                }`}
              >
                حراري (4&quot;&times;6&quot;)
              </button>
              <button
                onClick={() => setLabelSize('standard_a4')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  labelSize === 'standard_a4' ? 'bg-[#B4F105] text-[#072F1F] font-bold' : 'text-slate-300'
                }`}
              >
                A4 ربع صفحة
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#B4F105] hover:bg-[#a3db04] text-[#072F1F] font-black text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Slip Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {/* THE ACTUAL PRINTABLE THERMAL SLIP */}
          <div
            id="zeedo-shipping-slip"
            dir="rtl"
            className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-lg w-full max-w-[440px] text-slate-900 space-y-4 print:border-2 print:border-black print:shadow-none print:w-full print:max-w-none print:m-0 print:p-4"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Header: ZEEDO LOGISTICS + 100% COD */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-2xl tracking-tighter text-[#072F1F]">ZEEDO</span>
                  <span className="font-black text-lg text-emerald-700">| زيدو</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  خدمة الشحن السريع والدفع عند الاستلام (COD)
                </div>
              </div>

              <div className="text-left" dir="ltr">
                <span className="inline-block bg-slate-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-md tracking-wider">
                  DOORSTEP COD
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">IRAQ EXPRESS</div>
              </div>
            </div>

            {/* AWB Tracking Box */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-900 rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-500 block uppercase">رقم بوليصة الشحن والتتبع</span>
                <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                  {data.awbNumber}
                </span>
              </div>
              <div className="text-left font-mono text-[10px] text-slate-600" dir="ltr">
                <div>LOT: #{data.auctionId.replace(/^auc-/, '').toUpperCase()}</div>
                <div>DATE: {data.orderDate || new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>

            {/* TWO-COLUMN SECTION: DESTINATION BUYER & QR GPS CODE */}
            <div className="grid grid-cols-5 gap-3 border-b-2 border-slate-900 pb-4">
              {/* Left 3 Columns: Consignee / Buyer Details */}
              <div className="col-span-3 space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>المستلم (الزبون الفائز):</span>
                </div>

                <div className="font-black text-base text-slate-900 leading-snug">
                  {data.buyerName}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900" dir="ltr">
                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{data.buyerPhone}</span>
                </div>

                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 pt-1">
                  <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>الوجهة: {data.buyerCity} {data.buyerDistrict ? `• ${data.buyerDistrict}` : ''}</span>
                </div>

                <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 leading-relaxed font-medium">
                  {data.buyerAddress}
                </div>
              </div>

              {/* Right 2 Columns: QR Code directly to Buyer GPS */}
              <div className="col-span-2 flex flex-col items-center justify-center text-center p-1 bg-slate-50 rounded-lg border border-slate-300">
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt="GPS QR"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-200 animate-pulse rounded" />
                )}
                <span className="text-[9px] font-black text-slate-900 mt-1 leading-tight block">
                  امسح لفتح موقع الزبون 📍
                </span>
                <span className="text-[8px] font-mono text-slate-500 block" dir="ltr">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Cash Collection (COD) Box — Prominent & Bold */}
            <div className="border-4 border-slate-900 rounded-xl p-3 bg-amber-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-900 uppercase block tracking-wide">
                  المبلغ الإجمالي المطلوب تحصيله نقداً عند الباب (COD):
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {data.codAmountIqd.toLocaleString()} <span className="text-base font-sans font-bold">د.ع</span>
                </span>
              </div>
              <div className="text-left font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded" dir="ltr">
                CASH ONLY
              </div>
            </div>

            {/* Item Summary & Sender Info */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b-2 border-slate-900 pb-3">
              {/* Item Info */}
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">تفاصيل السلعة</span>
                <div className="font-bold text-slate-900 line-clamp-2 text-xs leading-tight">
                  {data.itemTitle}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  الحالة: {data.itemCondition || 'جديد مختوم'}
                </div>
              </div>

              {/* Sender Store */}
              <div className="space-y-0.5 border-r border-slate-200 pr-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">المرسل (التاجر المعتمد)</span>
                <div className="font-bold text-slate-900 text-xs">
                  {data.sellerStoreName}
                </div>
                <div className="text-[10px] font-mono text-slate-600" dir="ltr">
                  {data.sellerPhone}
                </div>
                <div className="text-[10px] text-slate-500">
                  {data.sellerCity}
                </div>
              </div>
            </div>

            {/* Inspection Guarantee Notice (Customer Rights) */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-emerald-900 leading-snug">
                ضمان فحص زيدو: يحق للزبون فتح الطرد ومعاينة السلعة والتأكد من مطابقتها للمواصفات بحضور مندوب شركة التوصيل قبل دفع المبلغ نقداً.
              </p>
            </div>

            {/* Bottom Courier Barcode Simulated Line */}
            <div className="pt-1 text-center font-mono text-[9px] text-slate-400">
              * ZEEDO LOGISTICS * {data.awbNumber} * PARCEL DISPATCH *
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
