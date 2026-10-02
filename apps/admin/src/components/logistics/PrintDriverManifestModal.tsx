'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  Truck,
  Package,
  Calendar,
  Phone,
  Store,
  MapPin,
  CheckCircle2,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export interface ManifestOrderItem {
  id: string;
  awb: string;
  itemTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  buyerAddress: string;
  buyerGpsLat?: number;
  buyerGpsLng?: number;
  codAmountIqd: number;
  status: string;
}

interface PrintDriverManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantStoreName: string;
  merchantPhone: string;
  merchantCity: string;
  orders: ManifestOrderItem[];
}

export const PrintDriverManifestModal: React.FC<PrintDriverManifestModalProps> = ({
  isOpen,
  onClose,
  merchantStoreName,
  merchantPhone,
  merchantCity,
  orders,
}) => {
  // Carrier & Driver Configuration
  const [carrierName, setCarrierName] = useState('شركة الزاجل للنقل السريع (Al-Zajil Express)');
  const [driverName, setDriverName] = useState('حيدر الكرخي (أبو فهد)');
  const [driverPhone, setDriverPhone] = useState('0770 123 4567');
  const [vehiclePlate, setVehiclePlate] = useState('بغداد 84210 خصوصي');
  const [manifestId, setManifestId] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [qrCache, setQrCache] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate clean manifest ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setManifestId(`MNF-IQ-2026-${randomSuffix}`);
  }, [isOpen]);

  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  }, [orders]);

  // Pre-generate mini GPS QRs for each order
  useEffect(() => {
    if (!isOpen || orders.length === 0) return;

    orders.forEach((o) => {
      const lat = o.buyerGpsLat || 33.3128;
      const lng = o.buyerGpsLng || 44.3541;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      QRCode.toDataURL(mapsUrl, {
        width: 90,
        margin: 0,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
        .then((url) => {
          setQrCache((prev) => ({ ...prev, [o.id]: url }));
        })
        .catch((err) => console.warn('QR generation error:', err));
    });
  }, [isOpen, orders]);

  if (!isOpen) return null;

  const activeOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
  const totalCodAmount = activeOrders.reduce((acc, o) => acc + o.codAmountIqd, 0);

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Shell */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Controls (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#B4F105]" />
            <div>
              <h3 className="font-extrabold text-sm text-white">
                بيان تسليم ومنافيست السائق (Driver Route Manifest)
              </h3>
              <p className="text-[11px] text-slate-400">
                قائمة تسليم طرود رسمية تتضمن أسماء المشترين، المبالغ المطلوب تحصيلها، وباركود موقع GPS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={activeOrders.length === 0}
              className="px-4 py-2 bg-[#B4F105] hover:bg-[#a2db04] text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المنافيست فوراً (Print Manifest)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Courier Configuration Bar (Hidden in Print) */}
        <div className="print:hidden bg-slate-50 border-b border-slate-200 p-3.5 px-6 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              شركة الشحن / التوصيل
            </label>
            <input
              type="text"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              اسم كابتن التوصيل (Driver)
            </label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              رقم هاتف السائق
            </label>
            <input
              type="text"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              رقم لوحة المركبة
            </label>
            <input
              type="text"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/50 flex justify-center">
          <div
            id="driver-manifest-print-sheet"
            className="bg-white w-full max-w-4xl p-6 sm:p-8 border border-slate-300 shadow-sm text-slate-900 font-sans space-y-5 print:border-none print:shadow-none print:p-0 print:m-0"
            dir="rtl"
          >
            {/* Manifest Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-xl tracking-wider">
                  Z
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-950">
                    منصة زيدو للمزادات • بيان تسليم شحنات السائق
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    ZEEDO PARCEL DISPATCH &amp; COD DRIVER MANIFEST
                  </p>
                </div>
              </div>

              <div className="text-left font-mono" dir="ltr">
                <div className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 inline-block">
                  {manifestId}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {new Date().toLocaleDateString('ar-IQ')} • {new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Handover Parties Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              {/* Merchant Details */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Store className="w-3 h-3 text-slate-500" />
                  <span>جهة الإرسال (التاجر المعتمد)</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {merchantStoreName}
                </div>
                <div className="text-slate-600 font-medium">
                  المدينة: {merchantCity} • الهاتف: <span dir="ltr" className="font-mono font-bold">{merchantPhone}</span>
                </div>
              </div>

              {/* Carrier & Driver Details */}
              <div className="space-y-1 border-r border-slate-200 pr-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-500" />
                  <span>شركة النقل وكابتن التوصيل (Courier &amp; Driver)</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {carrierName}
                </div>
                <div className="text-slate-600 font-medium">
                  الكابتن: <span className="font-bold text-slate-900">{driverName}</span> • هاتف: <span dir="ltr" className="font-mono font-bold">{driverPhone}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  المركبة: {vehiclePlate}
                </div>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  عدد الطرود المسلمة للسائق
                </span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {activeOrders.length} طرود
                </span>
              </div>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3">
                <span className="text-[10px] font-bold text-amber-900 block uppercase">
                  إجمالي مبالغ الدفع عند الاستلام (COD)
                </span>
                <span className="text-xl font-black font-mono text-amber-950">
                  {totalCodAmount.toLocaleString()} <span className="text-xs font-sans font-bold">د.ع</span>
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3">
                <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                  حالة بوالص الشحن (AWB)
                </span>
                <span className="text-sm font-black text-emerald-900 flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>مطبوعة ومثبتة على الطرود</span>
                </span>
              </div>
            </div>

            {/* Itemized Table of Parcels */}
            <div className="border border-slate-900 rounded-xl overflow-hidden">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[10px]">
                    <th className="py-2.5 px-3 w-8 text-center print:hidden">تحديد</th>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">رقم البوليصة (AWB) والسلعة</th>
                    <th className="py-2.5 px-3">المشتري والهاتف</th>
                    <th className="py-2.5 px-3">عنوان التسليم</th>
                    <th className="py-2.5 px-3 text-center w-20">موقع GPS</th>
                    <th className="py-2.5 px-3 text-left">مبلغ التحصيل (COD)</th>
                    <th className="py-2.5 px-3 text-center w-24">توقيع المستلم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((ord, idx) => {
                    const isSelected = selectedOrderIds.includes(ord.id);
                    const lat = ord.buyerGpsLat || 33.3128;
                    const lng = ord.buyerGpsLng || 44.3541;

                    return (
                      <tr
                        key={ord.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-white' : 'bg-slate-50 opacity-40 print:hidden'
                        }`}
                      >
                        <td className="py-3 px-3 text-center print:hidden">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOrder(ord.id)}
                            className="rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[11px] text-slate-900" dir="ltr">
                            {ord.awb}
                          </div>
                          <div className="font-bold text-slate-800 line-clamp-1 text-[11px] mt-0.5">
                            {ord.itemTitle}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">
                            {ord.buyerName}
                          </div>
                          <div className="font-mono text-slate-600 text-[11px]" dir="ltr">
                            {ord.buyerPhone}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 text-[11px]">
                            {ord.buyerCity}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            {ord.buyerAddress}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {qrCache[ord.id] ? (
                            <div className="flex flex-col items-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={qrCache[ord.id]}
                                alt="GPS QR"
                                className="w-12 h-12 object-contain rounded border border-slate-200"
                              />
                              <span className="text-[7px] font-mono text-slate-400 mt-0.5" dir="ltr">
                                {lat.toFixed(2)},{lng.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-indigo-600 font-bold">GPS Pin</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-left font-mono font-black text-slate-900 text-sm">
                          {ord.codAmountIqd.toLocaleString()} <span className="text-[10px] font-sans">د.ع</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="h-9 border border-dashed border-slate-300 rounded bg-slate-50/50 flex items-center justify-center">
                            <span className="text-[8px] text-slate-300 print:hidden">توقيع المستلم</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td colSpan={5} className="py-2.5 px-4 text-right">
                      المجموع الكلي المطلوب تحصيله نقداً عند التسليم:
                    </td>
                    <td colSpan={3} className="py-2.5 px-4 text-left font-mono font-black text-base text-[#B4F105]">
                      {totalCodAmount.toLocaleString()} IQD
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms & Driver Handover Acknowledgment */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-[10px] text-slate-600 leading-relaxed space-y-1">
              <div className="font-bold text-slate-900">
                تعهد وإقرار كابتن التوصيل:
              </div>
              <p>
                أقر أنا السائق المذكور بياناتي أعلاه باستلام الطرود المبينة في هذا البيان بحالة سليمة ومغلقة مع ملصقات الشحن (AWB) الخاصة بكل طرد، وأتعهد بتسليمها إلى الزبائن وفق مواقع الـ GPS المرفقة واستحصال المبالغ النقدية بدقة وإعطاء الزبون حقه في معاينة السلعة قبل الدفع وفق سياسة ضمان منصة زيدو، وتوريد المبالغ المحصلة لإدارة المتجر/المنصة.
              </p>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
              {/* Merchant Signature */}
              <div className="border border-slate-300 rounded-xl p-3 text-center space-y-6">
                <span className="text-xs font-bold text-slate-700 block">
                  توقيع وختم جهة الإرسال (المتجر)
                </span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-4 text-slate-400 text-[10px]">
                  التوقيع: ____________________
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  التاريخ: {new Date().toLocaleDateString('ar-IQ')}
                </div>
              </div>

              {/* Driver Signature */}
              <div className="border border-slate-300 rounded-xl p-3 text-center space-y-6">
                <span className="text-xs font-bold text-slate-700 block">
                  توقيع واستلام كابتن التوصيل (السائق)
                </span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-4 text-slate-400 text-[10px]">
                  التوقيع: ____________________
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  الهاتف: {driverPhone}
                </div>
              </div>
            </div>

            {/* Watermark / Footer */}
            <div className="text-center font-mono text-[9px] text-slate-400 pt-2 border-t border-slate-100">
              ZEEDO LOGISTICS PLATFORM • POWERED BY ZEEDO TECH • ALL RIGHTS RESERVED 2026
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #driver-manifest-print-sheet,
          #driver-manifest-print-sheet * {
            visibility: visible;
          }
          #driver-manifest-print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
