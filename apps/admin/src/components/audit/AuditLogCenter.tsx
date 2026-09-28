'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { AuditCategory, AuditLogEntry, StaffRole } from '@/types';
import { ROLE_PERMISSIONS } from '@/utils/rbac';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Truck,
  FileSpreadsheet,
  Store,
  Users,
  KeyRound,
  Eye,
  X,
  FileCode,
} from 'lucide-react';

export const AuditLogCenter: React.FC = () => {
  const { auditLogs } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);

  const categories: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Events', icon: <ScrollText className="w-3.5 h-3.5" /> },
    { key: 'kyc', label: 'KYC Moderation', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { key: 'moderation', label: 'Listings', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { key: 'auctions', label: 'War Room', icon: <Flame className="w-3.5 h-3.5" /> },
    { key: 'logistics', label: 'Logistics 3PL', icon: <Truck className="w-3.5 h-3.5" /> },
    { key: 'sellers', label: 'Merchants', icon: <Store className="w-3.5 h-3.5" /> },
    { key: 'team', label: 'Admin Team', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'auth', label: 'Security & Auth', icon: <KeyRound className="w-3.5 h-3.5" /> },
  ];

  const filteredLogs = auditLogs.filter((entry) => {
    const matchesSearch =
      entry.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesRole = selectedRole === 'all' || entry.actorRole === selectedRole;

    return matchesSearch && matchesCategory && matchesRole;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Category', 'Action', 'Target ID', 'Description'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actorName}"`,
      l.actorRole,
      l.category,
      l.action,
      l.targetId,
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zeedo_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat: AuditCategory) => {
    const mapping: Record<AuditCategory, { bg: string; text: string }> = {
      kyc: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803d]' },
      moderation: { bg: 'bg-[#FFEDD5]', text: 'text-[#F97316]' },
      auctions: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
      logistics: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' },
      sellers: { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' },
      team: { bg: 'bg-[#FEF08A]', text: 'text-[#854D0E]' },
      auth: { bg: 'bg-slate-200', text: 'text-slate-800' },
    };
    const c = mapping[cat] || { bg: 'bg-[#F4F6F5]', text: 'text-[#6C7E75]' };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${c.bg} ${c.text}`}>
        {cat}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-bold shadow-md">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              System Audit Trail & Immutable Action Logs
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
                {auditLogs.length} Total Events
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Real-time audit recording of all administrative interventions, KYC approvals, commission adjustments, and logistics handoffs.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="btn-spark-light text-xs py-2 px-4 flex items-center gap-2 font-bold"
        >
          <Download className="w-4 h-4 text-[#072F1F]" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="spark-card !p-3 space-y-3">
        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-[#072F1F] text-white shadow-xs'
                    : 'bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] hover:bg-[#E9EFEF]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Role Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E9EFEF]">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#6C7E75]" />
            <input
              type="text"
              placeholder="Search action, actor, target ID (e.g. sel-301, usr-103)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#F4F6F5] border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6C7E75] font-bold">Filter Staff Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-[#F4F6F5] text-[#0B130F] font-semibold text-xs px-3 py-1.5 rounded-full border border-[#E9EFEF] focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="moderator">Moderator</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            <span className="text-xs font-mono text-[#6C7E75]">
              Showing {filteredLogs.length} events
            </span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="spark-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
                <th className="p-3.5">Event ID & Timestamp</th>
                <th className="p-3.5">Actor Identity</th>
                <th className="p-3.5">Action Category</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Operation Description</th>
                <th className="p-3.5 text-right">Payload Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFEF]">
              {filteredLogs.map((entry) => {
                const roleConfig = ROLE_PERMISSIONS[entry.actorRole] || {
                  roleLabel: entry.actorRole,
                  badgeBg: 'bg-slate-100',
                  badgeText: 'text-slate-700',
                };
                const hasDiff = !!entry.diff;

                return (
                  <tr key={entry.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="p-3.5 font-mono">
                      <div className="font-extrabold text-[#0B130F]">{entry.id}</div>
                      <div className="text-[11px] text-[#6C7E75] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(entry.timestamp).toLocaleTimeString()} &bull; {new Date(entry.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-[#0B130F]">{entry.actorName}</div>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold mt-0.5 inline-block ${roleConfig.badgeBg} ${roleConfig.badgeText}`}
                      >
                        {roleConfig.roleLabel}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        {getCategoryBadge(entry.category)}
                        <div className="font-mono font-bold text-[11px] text-[#072F1F]">
                          {entry.action}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#F4F6F5] border border-[#E9EFEF] text-[#072F1F] font-bold text-[11px]">
                        {entry.targetId}
                      </span>
                    </td>

                    <td className="p-3.5 max-w-md">
                      <p className="text-[#0B130F] font-medium leading-relaxed">
                        {entry.description}
                      </p>
                    </td>

                    <td className="p-3.5 text-right">
                      {hasDiff ? (
                        <button
                          onClick={() => setInspectEntry(entry)}
                          className="btn-spark-light text-xs py-1 px-2.5 inline-flex items-center gap-1 font-bold"
                          title="Inspect JSON Before/After Payload"
                        >
                          <FileCode className="w-3.5 h-3.5 text-[#072F1F]" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-[#879A91]">No Diff</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6C7E75] text-xs">
                    No audit events match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT DIFF MODAL */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E9EFEF] pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#072F1F]" />
                <h3 className="text-base font-extrabold text-[#0B130F]">
                  Audit Event Diff Inspector: <span className="font-mono text-[#072F1F]">{inspectEntry.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setInspectEntry(null)}
                className="p-1 rounded-full text-[#6C7E75] hover:bg-[#F4F6F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#6C7E75]">
                <span>
                  Actor: <strong className="text-[#0B130F]">{inspectEntry.actorName}</strong> ({inspectEntry.actorRole})
                </span>
                <span className="font-mono">{new Date(inspectEntry.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-[#0B130F] font-semibold">{inspectEntry.description}</p>
            </div>

            {/* Before / After Payloads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Before State */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#EF4444] font-mono block">
                  [-] State Before Operation:
                </span>
                <pre className="p-3 rounded-xl bg-[#051C12] text-[#F87171] font-mono text-[11px] overflow-x-auto max-h-64 border border-white/10">
                  {inspectEntry.diff?.before
                    ? JSON.stringify(inspectEntry.diff.before, null, 2)
                    : '// No prior state recorded'}
                </pre>
              </div>

              {/* After State */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#B4F105] font-mono block">
                  [+] State After Operation:
                </span>
                <pre className="p-3 rounded-xl bg-[#051C12] text-[#B4F105] font-mono text-[11px] overflow-x-auto max-h-64 border border-white/10">
                  {inspectEntry.diff?.after
                    ? JSON.stringify(inspectEntry.diff.after, null, 2)
                    : '// No state modification payload'}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E9EFEF]">
              <button
                type="button"
                onClick={() => setInspectEntry(null)}
                className="btn-spark-primary text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
