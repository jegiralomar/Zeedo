'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { ROLE_PERMISSIONS } from '@/utils/rbac';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginStaff, staffUsers } = useAdminStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = loginStaff(identifier, password);
      setLoading(false);
      if (success) {
        // Redirect to admin operations hub
        const staff = staffUsers.find(
          (s) =>
            s.email.toLowerCase() === identifier.trim().toLowerCase() ||
            s.phone.replace(/\s+/g, '') === identifier.replace(/\s+/g, '')
        );
        const targetHub = staff ? ROLE_PERMISSIONS[staff.role]?.defaultHub || '/admin' : '/admin';
        router.push(targetHub === '/' ? '/admin' : targetHub);
      }
    }, 400);
  };

  const handleFillDefaultAdmin = () => {
    setIdentifier('ZAdmin9898');
    setPassword('ZEEDOA98');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#072F1F]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B4F105]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#072F1F] text-[#B4F105] shadow-xl mb-1 border border-white/10">
            <svg className="w-8 h-8 fill-[#B4F105]" viewBox="0 0 100 100">
              <g transform="translate(50,50)">
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" />
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" transform="rotate(60)" />
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#B4F105" transform="rotate(120)" />
              </g>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#0B130F] tracking-tight">
            ZEEDO <span className="text-[#072F1F]">ADMIN CONSOLE</span>
          </h1>
          <p className="text-xs text-[#6C7E75] font-medium">
            Administrative Operations &bull; 100% Cash on Delivery
          </p>
        </div>

        {/* Login Card */}
        <div className="spark-card !p-8 shadow-xl border border-[#E9EFEF] space-y-6 bg-white">
          <div>
            <h2 className="text-base font-extrabold text-[#0B130F]">Staff Sign In</h2>
            <p className="text-xs text-[#6C7E75] mt-0.5">
              Enter your authorized staff credentials to access operations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="text-[#6C7E75] font-bold block">
                Staff Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#6C7E75]" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ZAdmin9898"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold focus:outline-hidden focus:border-[#072F1F]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[#6C7E75] font-bold block">
                  Security Password
                </label>
                <span className="text-[11px] text-[#072F1F] font-mono font-semibold">
                  RBAC Protected
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#6C7E75]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. ZEEDOA98"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono focus:outline-hidden focus:border-[#072F1F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#6C7E75] hover:text-[#0B130F]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-spark-primary py-3 justify-center text-xs font-bold shadow-md mt-2"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4 text-[#B4F105]" />
                </>
              )}
            </button>
          </form>

          {/* Default Admin Credentials Notice */}
          <div className="p-4 rounded-2xl bg-[#072F1F]/5 border border-[#072F1F]/15 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#072F1F] text-xs">
                <KeyRound className="w-3.5 h-3.5 text-[#072F1F]" />
                <span>Default Master Admin</span>
              </div>
              <button
                type="button"
                onClick={handleFillDefaultAdmin}
                className="text-[11px] font-bold text-[#072F1F] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#15803d]" />
                <span>Auto-Fill</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-700 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="font-bold text-[#0B130F]">ZAdmin9898</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="font-bold text-[#0B130F]">ZEEDOA98</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#6C7E75]">
          <ShieldCheck className="w-4 h-4 text-[#15803d]" />
          <span>Internal Access Only &bull; All administrative actions are logged</span>
        </div>
      </div>
    </div>
  );
}
