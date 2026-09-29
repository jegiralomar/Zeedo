'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { DIALECT_LABELS } from '@/i18n/translations';
import { LanguageCode } from '@/types/marketplace';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useBuyerAuthStore();

  if (!isOpen) return null;

  const dialects: { code: LanguageCode; label: string; script: string; region: string }[] = [
    { code: 'ckb', ...DIALECT_LABELS.ckb },
    { code: 'badini', ...DIALECT_LABELS.badini },
    { code: 'ar', ...DIALECT_LABELS.ar },
    { code: 'en', ...DIALECT_LABELS.en },
  ];

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900">Select Dialect / زمان / اللغة</h3>
            <p className="text-xs text-slate-500">Iraqi regional dialect and UI language</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialect Options */}
        <div className="p-4 space-y-2.5">
          {dialects.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      {item.script}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.region}</p>
                </div>
                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
