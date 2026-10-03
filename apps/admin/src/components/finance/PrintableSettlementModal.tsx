'use client';

import React from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, Building2, Phone, Calendar, Hash } from 'lucide-react';
import { SellerMerchant } from '@/types';

interface SettlementItem {
  id: string;
  title: string;
  closingPriceUsd: number;
  closingPriceIqd: number;
  commissionUsd: number;
  commissionIqd: number;
  netPayableUsd: number;
  netPayableIqd: number;
  buyerCity: string;
  closedAt: string;
  status: string;
}

interface PrintableSettlementModalProps {
  seller: SellerMerchant;
  items: SettlementItem[];
  settledAmountIqd: number;
  onClose: () => void;
}

export const PrintableSettlementModal: React.FC<PrintableSettlementModalProps> = ({
  seller,
  items,
  settledAmountIqd,
  onClose,
}) => {
  const statementId = `ZED-STMT-${seller.id.toUpperCase()}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const grossSalesUsd = items.reduce((acc, it) => acc + it.closingPriceUsd, 0);
  const grossSalesIqd = items.reduce((acc, it) => acc + it.closingPriceIqd, 0);
  const totalCommissionUsd = items.reduce((acc, it) => acc + it.commissionUsd, 0);
  const totalCommissionIqd = items.reduce((acc, it) => acc + it.commissionIqd, 0);
  const netPayableUsd = grossSalesUsd - totalCommissionUsd;
  const netPayableIqd = grossSalesIqd - totalCommissionIqd;
  const remainingDueIqd = Math.max(0, netPayableIqd - settledAmountIqd);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Lot ID',
      'Item Title',
      'Closed Date',
      'Buyer City',
      'Gross USD',
      'Gross IQD',
      'Commission 10% USD',
      'Commission 10% IQD',
      'Net Payable USD',
      'Net Payable IQD',
      'Status',
    ];

    const rows = items.map((it) => [
      it.id,
      `"${it.title.replace(/"/g, '""')}"`,
      it.closedAt,
      it.buyerCity,
      it.closingPriceUsd,
      it.closingPriceIqd,
      it.commissionUsd,
      it.commissionIqd,
      it.netPayableUsd,
      it.netPayableIqd,
      it.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `"ZEEDO MERCHANT SETTLEMENT STATEMENT - ${seller.storeName || seller.ownerName}"`,
        `"Statement ID: ${statementId}"`,
        `"Date: ${currentDate}"`,
        `"Currency: Iraqi Dinar (IQD)"`,
        '',
        headers.join(','),
        ...rows.map((e) => e.join(',')),
        '',
        `"TOTALS",,,,"${grossSalesUsd}","${grossSalesIqd}","${totalCommissionUsd}","${totalCommissionIqd}","${netPayableUsd}","${netPayableIqd}"`,
        `"SETTLED ADVANCES (IQD)",,,,,,,,,"${settledAmountIqd}"`,
        `"NET BALANCE DUE (IQD)",,,,,,,,,"${remainingDueIqd}"`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zeedo_Settlement_${seller.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Top Controls Bar (hidden during printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[#F83758] px-2 py-0.5 rounded text-white">OFFICIAL</span>
            <span className="text-sm font-semibold">Merchant Settlement Statement — {seller.storeName || seller.ownerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B4F105] text-[#051C12] hover:bg-[#a3db04] text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 text-[#17223B] space-y-8 bg-white print:p-6" id="printable-statement">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl font-['Montserrat']">
                Z
              </div>
              <div>
                <h1 className="text-2xl font-black font-['Montserrat'] tracking-tight text-slate-900">ZEEDO</h1>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Live Auctions & COD Settlement Services • Iraq
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900 text-sm">{statementId}</p>
              <p>Issued: <span className="font-semibold text-slate-800">{currentDate}</span></p>
              <p>Currency: <span className="font-semibold text-emerald-700">Iraqi Dinar (IQD)</span></p>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">SETTLEMENT PAYEE (MERCHANT)</p>
              <h2 className="text-base font-bold text-slate-900">{seller.storeName || seller.ownerName}</h2>
              <p className="text-slate-600 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Store ID: <span className="font-mono font-semibold">{seller.id}</span>
              </p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone: <span className="font-mono">{seller.phone}</span>
              </p>
              <p className="text-slate-600">
                Region: <span className="font-medium text-slate-800">{seller.city || 'Baghdad, Iraq'}</span>
              </p>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">PLATFORM OPERATOR</p>
              <h2 className="text-base font-bold text-slate-900">Zeedo Marketplace LLC</h2>
              <p className="text-slate-600 mt-1">Karrada Commercial District, Baghdad, Iraq</p>
              <p className="text-slate-600">Official Portal: <span className="text-[#F83758] font-medium">https://zeedo.bid</span></p>
              <p className="text-slate-600">
                Commission Structure: <span className="font-bold text-slate-900">{seller.commissionRate || 10}% Flat Closing Fee</span>
              </p>
            </div>
          </div>

          {/* Itemized Sold Lots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Itemized Auction Transactions ({items.length} lots)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">100% Doorstep COD Verified</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Lot ID</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Buyer City</th>
                    <th className="py-2.5 px-3 text-right">Gross Sold ($)</th>
                    <th className="py-2.5 px-3 text-right">Gross (IQD)</th>
                    <th className="py-2.5 px-3 text-right">Zeedo Fee (10%)</th>
                    <th className="py-2.5 px-3 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                        No closed auction lots found for this statement period.
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{it.id.slice(0, 10)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-[200px] truncate">{it.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{it.buyerCity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${it.closingPriceUsd.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {it.closingPriceIqd.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                          -{it.commissionIqd.toLocaleString()} د.ع
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {it.netPayableIqd.toLocaleString()} د.ع
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Calculation Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-3 text-xs text-slate-500">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">COD Settlement Guarantee</p>
                  <p className="text-[11px] mt-0.5 text-emerald-800 leading-relaxed">
                    Platform commission is debited upon auction close. If a buyer refuses doorstep COD inspection, the full commission is automatically refunded back to your merchant ledger.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 leading-relaxed">
                Bank transfers are dispatched via ZainCash, FIB (First Iraqi Bank), or QiCard to the registered merchant IBAN within 24 hours of settlement generation.
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Gross Merchandise Value:</span>
                <span className="font-bold text-white">${grossSalesUsd.toLocaleString()} ({grossSalesIqd.toLocaleString()} IQD)</span>
              </div>
              <div className="flex justify-between items-center text-rose-400">
                <span>Platform Commission (10%):</span>
                <span>-{totalCommissionIqd.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
                <span>Total Net Merchant Revenue:</span>
                <span className="font-bold text-white">{netPayableIqd.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Settled Receipts & Payouts:</span>
                <span>-{settledAmountIqd.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#B4F105] pt-3 border-t-2 border-slate-700">
                <span>REMAINING BALANCE DUE:</span>
                <span className="text-base">{remainingDueIqd.toLocaleString()} IQD</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">AUTHORIZED PLATFORM SIGNATURE</p>
              <div className="border-b border-slate-400 w-48 mb-1" />
              <p className="font-semibold text-slate-900">Zeedo Financial Officer</p>
              <p className="text-[11px] text-slate-400">Merchant Settlements Department</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">MERCHANT ACKNOWLEDGEMENT</p>
              <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
              <p className="font-semibold text-slate-900">{seller.storeName || seller.ownerName}</p>
              <p className="text-[11px] text-slate-400">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
