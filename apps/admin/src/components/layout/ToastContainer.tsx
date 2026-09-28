'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdminStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full no-print">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-100',
          warning: 'border-amber-500/40 bg-amber-950/80 text-amber-100',
          info: 'border-sky-500/40 bg-sky-950/80 text-sky-100',
          error: 'border-rose-500/40 bg-rose-950/80 text-rose-100',
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${borders[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              {icons[toast.type]}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
