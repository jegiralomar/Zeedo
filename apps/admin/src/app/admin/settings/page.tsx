'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAdminStore } from '@/store/useAdminStore';
import {
  DollarSign,
  TrendingUp,
  MessageSquare,
  QrCode,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Save,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useAdminStore();

  // Exchange Rate State
  const [marketRate, setMarketRate] = useState(1510);
  const [rateInput, setRateInput] = useState('1510');
  const [savingRate, setSavingRate] = useState(false);

  // WhatsApp Gateway State
  const [waConnected, setWaConnected] = useState<boolean | null>(null);
  const [waMessage, setWaMessage] = useState<string>('Checking gateway...');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [checkingWa, setCheckingWa] = useState(false);
  const [testPhone, setTestPhone] = useState('07701234567');
  const [sendingTest, setSendingTest] = useState(false);

  // APIs & Engine State
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');
  const [wsStatus, setWsStatus] = useState<'online' | 'offline'>('online');

  // Load initial data
  useEffect(() => {
    fetchExchangeRate();
    checkWhatsAppStatus();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      const json = await res.json();
      if (json?.data?.marketRate) {
        setMarketRate(json.data.marketRate);
        setRateInput(String(json.data.marketRate));
      }
    } catch {
      // fallback
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(rateInput);
    if (!rateNum || rateNum < 1000 || rateNum > 2500) {
      addToast('error', 'Rate must be between 1,000 and 2,500 IQD');
      return;
    }
    setSavingRate(true);
    try {
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: rateNum }),
      });
      const data = await res.json();
      if (data.success) {
        setMarketRate(rateNum);
        addToast('success', `Iraqi parallel rate updated to $1 = ${rateNum.toLocaleString()} IQD`);
      } else {
        addToast('error', data.message || 'Failed to update rate');
      }
    } catch {
      addToast('error', 'Network error updating rate');
    } finally {
      setSavingRate(false);
    }
  };

  const checkWhatsAppStatus = async () => {
    setCheckingWa(true);
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setWaConnected(!!data.isConnected);
      setWaMessage(data.message || (data.isConnected ? 'Connected & Ready' : 'Disconnected'));
      if (!data.isConnected) {
        fetchQrCode();
      } else {
        setQrCodeUrl(null);
      }
    } catch {
      setWaConnected(false);
      setWaMessage('WhatsApp gateway service unreachable');
    } finally {
      setCheckingWa(false);
    }
  };

  const fetchQrCode = async () => {
    try {
      const res = await fetch('/api/whatsapp/qr');
      if (res.ok) {
        const data = await res.json();
        if (data?.qr) {
          setQrCodeUrl(data.qr);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setSendingTest(true);
    try {
      const res = await fetch('/api/auth/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', `Test WhatsApp OTP dispatched to ${testPhone}`);
      } else {
        addToast('error', data.message || 'Failed to dispatch test message');
      }
    } catch {
      addToast('error', 'Network error sending test WhatsApp message');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <>
      <Header
        title="System Settings & Control"
        subtitle="Iraqi Parallel Exchange Rate, WhatsApp Gateway & Engine Health"
      />

      <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Section 1: Iraqi Parallel Currency Rate */}
        <div className="bg-white rounded-2xl border border-[#ECEFF3] p-6 lg:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#17223B]">Iraqi Parallel Street Exchange Rate</h2>
                <p className="text-xs text-slate-400">
                  Real-time cash conversion rate for converting USD items into Iraqi Dinars (IQD) for COD collection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Live Rate:</span>
              <span className="font-mono font-black text-lg text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                $1 = {marketRate.toLocaleString()} IQD
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateRate} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#17223B]">
                Update Street Cash Exchange Rate (IQD per $1 USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">$1 =</span>
                <input
                  type="number"
                  min="1000"
                  max="2500"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full pl-12 pr-16 py-2.5 rounded-xl border border-[#ECEFF3] bg-slate-50 text-sm font-mono font-bold text-[#17223B] focus:bg-white focus:border-[#F83758] focus:ring-2 focus:ring-[#F83758]/10 focus:outline-hidden"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-emerald-600">IQD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official CBI Peg: <strong className="text-slate-600">1,320 IQD</strong> • Current Parallel Spread: <strong className="text-amber-600">+{Number(rateInput) - 1320} IQD</strong>
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={savingRate}
                className="w-full py-2.5 px-4 rounded-xl bg-[#17223B] hover:bg-[#F83758] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingRate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Apply Exchange Rate</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: WhatsApp Gateway & Notifications */}
        <div className="bg-white rounded-2xl border border-[#ECEFF3] p-6 lg:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#17223B]">Baileys WhatsApp Notification Gateway</h2>
                <p className="text-xs text-slate-400">
                  Self-hosted automated WhatsApp engine for sending login OTPs, outbid notifications, and winner alerts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={checkWhatsAppStatus}
                disabled={checkingWa}
                className="p-1.5 rounded-lg border border-[#ECEFF3] hover:bg-slate-50 text-slate-500 hover:text-[#17223B] transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${checkingWa ? 'animate-spin' : ''}`} />
              </button>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                waConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${waConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {waConnected ? 'Gateway Connected' : 'Gateway Disconnected'}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status & Test Message */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-[#ECEFF3] space-y-1">
                <div className="text-xs font-bold text-slate-700">Gateway Status Details</div>
                <div className="text-xs text-slate-500">{waMessage}</div>
                <div className="text-[11px] font-mono text-slate-400 pt-1">Internal Endpoint: http://whatsapp-gateway:3001</div>
              </div>

              <form onSubmit={handleSendTestMessage} className="space-y-3">
                <label className="text-xs font-bold text-[#17223B] block">
                  Send Test WhatsApp OTP to Iraqi Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 07701234567"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#ECEFF3] bg-slate-50 text-xs font-mono font-bold text-[#17223B] focus:bg-white focus:border-[#F83758] focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={sendingTest || !testPhone}
                    className="px-4 py-2 rounded-xl bg-[#F83758] hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Test OTP</span>
                  </button>
                </div>
              </form>
            </div>

            {/* QR Pairing Code */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#ECEFF3] flex flex-col items-center justify-center text-center">
              {waConnected ? (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-emerald-800">Device Active & Paired</div>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Your WhatsApp session is authenticated and sending messages in real-time.
                  </p>
                </div>
              ) : qrCodeUrl ? (
                <div className="space-y-2 py-2">
                  <div className="text-xs font-bold text-slate-700">Scan QR Code with WhatsApp</div>
                  <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-44 h-44 rounded-lg border bg-white p-2 shadow-xs" />
                  <p className="text-[11px] text-slate-400">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
                </div>
              ) : (
                <div className="space-y-2 py-6">
                  <QrCode className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-600">No QR Code Required</div>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Gateway session already exists or will prompt automatically on restart.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Platform Infrastructure & Health */}
        <div className="bg-white rounded-2xl border border-[#ECEFF3] p-6 lg:p-7 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17223B]">Platform Infrastructure & Engines</h2>
              <p className="text-xs text-slate-400">
                Core database connections, WebSocket real-time engine, and automated services.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* DB */}
            <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-[#17223B]">PostgreSQL 16</div>
                  <div className="text-[10px] text-slate-400">Port 5432 (Internal)</div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>

            {/* WebSocket */}
            <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-[#17223B]">Live Bidding WS</div>
                  <div className="text-[10px] text-slate-400">Port 8080 (Sub-100ms)</div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>

            {/* AI Scraper */}
            <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-[#17223B]">Gemini AI Parser</div>
                  <div className="text-[10px] text-slate-400">Arabic & Kurdish Auto-Enrich</div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>

            {/* OCR */}
            <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#F83758]" />
                <div>
                  <div className="text-xs font-bold text-[#17223B]">Iraqi ID OCR</div>
                  <div className="text-[10px] text-slate-400">National Card Validator</div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>

          </div>
        </div>

      </main>
    </>
  );
}
