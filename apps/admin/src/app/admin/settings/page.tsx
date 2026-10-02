'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAdminStore, getAdminAuthHeaders } from '@/store/useAdminStore';
import { TestingSandboxTab } from '@/components/settings/TestingSandboxTab';
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
  Sliders,
  FlaskConical,
  Wrench,
} from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const { addToast } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'general' | 'sandbox'>(
    urlTab === 'sandbox' ? 'sandbox' : 'general'
  );

  useEffect(() => {
    if (urlTab === 'sandbox') {
      setActiveTab('sandbox');
    }
  }, [urlTab]);

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

  const [clearingWaSessions, setClearingWaSessions] = useState(false);

  const handleClearSessions = async () => {
    if (!confirm('Clear stale session & pre-key encryption files? Your linked phone login (creds.json) will be safely preserved, and fresh Signal encryption handshakes will be negotiated to resolve "Waiting for message" errors.')) {
      return;
    }
    setClearingWaSessions(true);
    try {
      const res = await fetch('/api/whatsapp/clear-sessions', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (data.isSuccess) {
        addToast('success', data.message || 'Corrupted session keys cleared successfully.');
        setTimeout(checkWhatsAppStatus, 2000);
      } else {
        addToast('error', data.message || 'Failed to clear session files');
      }
    } catch {
      addToast('error', 'Network error clearing session files');
    } finally {
      setClearingWaSessions(false);
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
        title="System Settings & Testing Control"
        subtitle="Parallel Exchange Rate, WhatsApp Gateway, Engine Health & Sandbox Lab"
      />

      <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Navigation Tabs: General vs Testing Sandbox */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'general'
                ? 'bg-[#17223B] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>General System & Gateways</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sandbox'
                ? 'bg-[#17223B] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span>Testing Lab & Mock Sandbox</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 font-bold border border-amber-500/30">
              SANDBOX
            </span>
          </button>
        </div>

        {activeTab === 'sandbox' ? (
          <TestingSandboxTab />
        ) : (
          <div className="space-y-8">
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
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-[#ECEFF3] rounded-xl text-xs font-mono font-bold text-[#17223B] focus:outline-emerald-500 transition-colors"
                      placeholder="1510"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Default: 1,510 IQD per USD. Used across product scraper and mobile auction rooms.
                  </span>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={savingRate}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingRate ? 'Saving Rate...' : 'Update Platform Rate'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Baileys WhatsApp OTP Gateway */}
            <div className="bg-white rounded-2xl border border-[#ECEFF3] p-6 lg:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#17223B]">Self-Hosted Baileys WhatsApp Gateway</h2>
                    <p className="text-xs text-slate-400">
                      Dispatches 100% free dynamic 6-digit WhatsApp OTP verification codes to Iraqi numbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearSessions}
                    disabled={clearingWaSessions}
                    className="px-2.5 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Repair 'Waiting for this message' encryption errors by clearing stale pre-keys while preserving linked device login"
                  >
                    <Wrench className={`w-3.5 h-3.5 ${clearingWaSessions ? 'animate-spin' : ''}`} />
                    <span>{clearingWaSessions ? 'Repairing...' : 'Fix Decryption'}</span>
                  </button>
                  <button
                    onClick={checkWhatsAppStatus}
                    disabled={checkingWa}
                    className="p-2 rounded-xl bg-slate-50 border border-[#ECEFF3] hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Refresh connection status"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingWa ? 'animate-spin' : ''}`} />
                  </button>
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                      waConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${waConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
                    />
                    {waMessage}
                  </span>
                </div>
              </div>

              {!waConnected && qrCodeUrl && (
                <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <QrCode className="w-4 h-4" />
                      <span>Scan to Link Device</span>
                    </div>
                    <h3 className="text-base font-bold">Link Zeedo WhatsApp Phone</h3>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                      <li>Open <strong>WhatsApp</strong> on your phone</li>
                      <li>Go to <strong>Settings</strong> &rarr; <strong>Linked Devices</strong></li>
                      <li>Tap <strong>Link a Device</strong> and point your camera here</li>
                    </ol>
                  </div>

                  <div className="bg-white p-3 rounded-2xl shrink-0 shadow-md">
                    <img src={qrCodeUrl} alt="WhatsApp Pairing QR" className="w-44 h-44 object-contain" />
                  </div>
                </div>
              )}

              {/* Test Phone Dispatch Form */}
              <form onSubmit={handleSendTestMessage} className="pt-2 flex flex-col sm:flex-row items-end gap-3 text-xs">
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="font-bold text-[#17223B]">Test Iraqi Mobile Number (+964 7XX...)</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="0770 123 4567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#ECEFF3] rounded-xl font-mono text-xs font-bold text-[#17223B] focus:outline-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingTest || !testPhone}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingTest ? 'Sending...' : 'Send Test OTP'}</span>
                </button>
              </form>
            </div>

            {/* Section 3: Core Engine & Database Status */}
            <div className="bg-white rounded-2xl border border-[#ECEFF3] p-6 lg:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#17223B]">Core Infrastructure & Gateways</h2>
                  <p className="text-xs text-slate-400">Microservice connectivity and database health</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Postgres */}
                <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-[#17223B]">PostgreSQL DB</div>
                      <div className="text-[10px] text-slate-400">Persistent NVMe DB</div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                </div>

                {/* WebSocket */}
                <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-[#17223B]">WebSocket Gateway</div>
                      <div className="text-[10px] text-slate-400">Port 8080 Live Bids</div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                </div>

                {/* AI Scraper */}
                <div className="p-4 rounded-xl border border-[#ECEFF3] bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-[#17223B]">Universal Scraper</div>
                      <div className="text-[10px] text-slate-400">Multi-Platform Engine</div>
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
          </div>
        )}
      </main>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
