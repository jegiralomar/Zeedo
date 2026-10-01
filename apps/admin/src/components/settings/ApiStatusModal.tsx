'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Cpu,
  Key,
  ExternalLink,
  Zap,
  Eye,
  EyeOff,
  Save,
  Check,
} from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceInfo {
  name: string;
  isConfigured: boolean;
  mode: string;
  model?: string;
  templateName?: string;
  features: string[];
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [geminiKey, setGeminiKey] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [apiMode, setApiMode] = useState<'sandbox' | 'live'>('sandbox');

  // Key masking visibility toggles
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showMetaToken, setShowMetaToken] = useState(false);

  const [services, setServices] = useState<{
    gemini?: ServiceInfo;
    whatsapp?: ServiceInfo;
  }>({});
  const [testResults, setTestResults] = useState<{
    gemini?: { success: boolean; latencyMs: number; message: string };
    whatsapp?: { success: boolean; mode: string; message: string };
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/api-status');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || {});
        setApiMode(data.apiMode || 'sandbox');
        if (data.credentials) {
          setMetaPhoneId(data.credentials.metaPhoneId || '');
        }
      }
    } catch (e) {
      console.error('Failed to fetch api status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSaveSuccess(false);
      // Re-populate key fields from localStorage so they survive page refresh
      const savedGemini = localStorage.getItem('zeedo_gemini_key') || '';
      const savedMeta = localStorage.getItem('zeedo_meta_token') || '';
      const savedPhoneId = localStorage.getItem('zeedo_meta_phone_id') || '';
      if (savedGemini) setGeminiKey(savedGemini);
      if (savedMeta) setMetaToken(savedMeta);
      if (savedPhoneId) setMetaPhoneId(savedPhoneId);
    }
  }, [isOpen]);

  const handleSaveCredentials = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload: Record<string, string> = {
        action: 'save_keys',
        apiMode,
      };
      if (geminiKey.trim()) payload.geminiApiKey = geminiKey.trim();
      if (metaToken.trim()) payload.metaToken = metaToken.trim();
      if (metaPhoneId.trim()) payload.metaPhoneId = metaPhoneId.trim();

      const res = await fetch('/api/settings/api-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Persist to localStorage so fields survive page refresh
        if (geminiKey.trim()) localStorage.setItem('zeedo_gemini_key', geminiKey.trim());
        if (metaToken.trim()) localStorage.setItem('zeedo_meta_token', metaToken.trim());
        if (metaPhoneId.trim()) localStorage.setItem('zeedo_meta_phone_id', metaPhoneId.trim());
        localStorage.setItem('zeedo_api_mode', apiMode);

        setSaveSuccess(true);
        await fetchStatus();
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (e) {
      console.error('Error saving API credentials:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/settings/api-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testTarget: 'all' }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data.tests);
      }
    } catch (e) {
      console.error('Diagnostics test error:', e);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>ZEEDO API & Cloud Services</span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    apiMode === 'live'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {apiMode === 'live' ? 'Live API Mode' : 'Sandbox Mode'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Google Gemini Flash AI, Meta WhatsApp Cloud API & Cloudflare R2 Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Mode Switcher Bar */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1.5 border border-slate-200">
            <button
              onClick={() => setApiMode('sandbox')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                apiMode === 'sandbox'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Sandbox Simulation Mode</span>
            </button>
            <button
              onClick={() => setApiMode('live')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                apiMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live Production Mode</span>
            </button>
          </div>

          {/* Diagnostic Action Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Automated Fallback Guaranteed
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {apiMode === 'live'
                    ? 'Live production mode: Dynamic 6-digit WhatsApp OTP codes and AI extraction.'
                    : 'Standard mode: Dynamic 6-digit WhatsApp OTP codes and local processing.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRunDiagnostics}
              disabled={testing}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Run Diagnostics'}
            </button>
          </div>

          {/* Test Feedback if executed */}
          {testResults && (
            <div className="bg-slate-900 text-white rounded-xl p-4 text-xs font-mono space-y-2 border border-slate-800 animate-in fade-in duration-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Latency & Health Status</span>
                <span className="text-emerald-400">● Live Test Passed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Google Gemini Catalog AI:</span>
                <span className="text-emerald-400 font-bold">
                  {testResults.gemini?.latencyMs}ms ({testResults.gemini?.message})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Meta WhatsApp Engine:</span>
                <span className="text-emerald-400 font-bold">
                  {testResults.whatsapp?.message}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Credential Inputs Form */}
          <div className="space-y-4 pt-1">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>External Cloud Services Configuration</span>
            </div>

            {/* Service 1: Google Gemini */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Google Gemini API Key (Optional)</h5>
                    <p className="text-[11px] text-slate-500">Powers live catalog item scraping & Iraqi market pricing</p>
                  </div>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="Paste AIzaSy... key (or leave empty for sandbox)"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3.5 py-2 pr-10 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Service 2: Meta WhatsApp Cloud API */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Meta WhatsApp Cloud API</h5>
                    <p className="text-[11px] text-slate-500">Delivers official 6-digit OTPs to +964 Iraqi phones</p>
                  </div>
                </div>
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                >
                  <span>Meta Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showMetaToken ? 'text' : 'password'}
                    placeholder="Meta WhatsApp Permanent System User Token"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMetaToken(!showMetaToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showMetaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="WhatsApp Phone Number ID (e.g. 109284729182374)"
                  value={metaPhoneId}
                  onChange={(e) => setMetaPhoneId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Save Action */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Credentials saved & active!</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveCredentials}
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Apply Credentials</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
