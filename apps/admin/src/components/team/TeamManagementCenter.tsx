'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { StaffRole, StaffUser } from '@/types';
import { ROLE_PERMISSIONS } from '@/utils/rbac';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  Phone,
  Calendar,
  Lock,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const TeamManagementCenter: React.FC = () => {
  const { staffUsers, currentUser, createStaffUser, updateStaffUser, deleteStaffUser, addToast } =
    useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | StaffRole>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Form State for new staff
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+964 750 ');
  const [role, setRole] = useState<StaffRole>('moderator');
  const [password, setPassword] = useState('');

  // Form State for editing
  const [editRole, setEditRole] = useState<StaffRole>('moderator');
  const [editPassword, setEditPassword] = useState('');

  const filteredStaff = staffUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('error', 'Please fill in all required fields');
      return;
    }

    createStaffUser({
      name,
      email,
      phone,
      password,
      role,
    });

    setIsCreateModalOpen(false);
    setName('');
    setEmail('');
    setPhone('+964 750 ');
    setPassword('');
    setRole('moderator');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const updates: Partial<StaffUser> = {
      role: editRole,
    };
    if (editPassword.trim()) {
      updates.password = editPassword.trim();
    }

    updateStaffUser(selectedStaff.id, updates);
    setIsEditModalOpen(false);
    setSelectedStaff(null);
    setEditPassword('');
  };

  const handleToggleStatus = (staff: StaffUser) => {
    if (staff.id === currentUser?.id) {
      addToast('error', 'You cannot suspend your own active session');
      return;
    }
    const newStatus = staff.status === 'active' ? 'suspended' : 'active';
    updateStaffUser(staff.id, { status: newStatus });
  };

  const handleDeleteStaff = (staff: StaffUser) => {
    if (staff.id === currentUser?.id) {
      addToast('error', 'You cannot delete your own account');
      return;
    }
    if (window.confirm(`Are you sure you want to revoke access for ${staff.name}?`)) {
      deleteStaffUser(staff.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#072F1F] text-[#B4F105] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              Admin Team & Role-Based Access Control (RBAC)
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803d] font-mono font-bold">
                {staffUsers.length} Staff Accounts
              </span>
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Provision administrative staff members, set access credentials, and enforce least-privilege route permissions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            handleGeneratePassword();
            setIsCreateModalOpen(true);
          }}
          className="btn-spark-lime text-xs"
        >
          <UserPlus className="w-4 h-4 text-[#072F1F]" />
          <span>+ Provision Staff User</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="spark-card !p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#6C7E75]" />
          <input
            type="text"
            placeholder="Search staff name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#F4F6F5] border border-[#E9EFEF] text-[#0B130F] placeholder-[#879A91] focus:outline-hidden focus:border-[#072F1F]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6C7E75] font-bold">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-[#F4F6F5] text-[#0B130F] font-semibold text-xs px-3 py-1.5 rounded-full border border-[#E9EFEF] focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Roles ({staffUsers.length})</option>
            <option value="super_admin">Super Admin</option>
            <option value="moderator">Moderator</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="spark-card !p-0 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-[#F8FAF9] border-b border-[#E9EFEF] text-[#6C7E75] uppercase font-mono text-[10px]">
              <th className="p-4">Staff Member</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Security & Credentials</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Last Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9EFEF]">
            {filteredStaff.map((staff) => {
              const roleConfig = ROLE_PERMISSIONS[staff.role];
              const isSelf = staff.id === currentUser?.id;

              return (
                <tr key={staff.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="p-4">
                    <div className="font-extrabold text-[#0B130F] text-sm flex items-center gap-2">
                      <span>{staff.name}</span>
                      {isSelf && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#DCFCE7] text-[#15803d] font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[#6C7E75] text-xs mt-0.5">{staff.email}</div>
                    <div className="font-mono text-[#879A91] text-[11px] mt-0.5">{staff.phone}</div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold inline-flex items-center gap-1.5 ${roleConfig.badgeBg} ${roleConfig.badgeText}`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{roleConfig.roleLabel}</span>
                    </span>
                    <p className="text-[10px] text-[#6C7E75] mt-1 max-w-xs">
                      {roleConfig.description}
                    </p>
                  </td>

                  <td className="p-4 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-[#0B130F]">
                      <KeyRound className="w-3.5 h-3.5 text-[#6C7E75]" />
                      <span>Password Configured</span>
                    </div>
                    <span className="text-[10px] text-[#6C7E75] block mt-0.5">
                      Credential status: <strong className="text-[#072F1F]">Protected</strong>
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(staff)}
                      disabled={isSelf}
                      className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold inline-flex items-center gap-1.5 transition-all ${
                        staff.status === 'active'
                          ? 'bg-[#DCFCE7] text-[#15803d]'
                          : 'bg-[#FEE2E2] text-[#EF4444]'
                      } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {staff.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>SUSPENDED</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="p-4 text-xs font-mono text-[#6C7E75]">
                    <div>{staff.lastLogin === 'Never' ? 'Never' : new Date(staff.lastLogin).toLocaleDateString()}</div>
                    <div className="text-[10px] text-[#879A91]">
                      {staff.lastLogin !== 'Never' && new Date(staff.lastLogin).toLocaleTimeString()}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStaff(staff);
                          setEditRole(staff.role);
                          setIsEditModalOpen(true);
                        }}
                        className="btn-spark-light text-xs py-1 px-2.5 flex items-center gap-1 font-bold"
                        title="Edit Role or Reset Password"
                      >
                        <Edit2 className="w-3 h-3 text-[#072F1F]" />
                        <span>Edit</span>
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteStaff(staff)}
                          className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                          title="Revoke and delete staff user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Permission Matrix Explainer Card */}
      <div className="spark-card space-y-4">
        <h3 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#072F1F]" />
          Platform RBAC Role Permission Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(ROLE_PERMISSIONS).map(([rKey, conf]) => (
            <div
              key={rKey}
              className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${conf.badgeBg} ${conf.badgeText}`}>
                  {conf.roleLabel}
                </span>
                <span className="text-[10px] font-mono text-[#6C7E75]">
                  Hub: {conf.defaultHub}
                </span>
              </div>
              <p className="text-[11px] text-[#6C7E75] leading-relaxed">
                {conf.description}
              </p>
              <div className="pt-2 border-t border-[#E9EFEF]">
                <span className="text-[10px] font-bold text-[#0B130F] uppercase tracking-wider block mb-1">
                  Permitted Modules:
                </span>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {conf.allowedRoutes.map((route) => (
                    <span
                      key={route}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#E9EFEF] text-[#072F1F] font-bold"
                    >
                      {route === '/' ? 'overview' : route.replace('/', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#072F1F]" />
              Provision New Staff User
            </h3>
            <p className="text-xs text-[#6C7E75]">
              Create an administrative user, assign an operational role, and set their sign-in credentials.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sardar Mohammed"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@zeedo.iq"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Iraqi Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 750 000 0000"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Assigned Operational Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['super_admin', 'moderator', 'dispatcher', 'auditor'] as StaffRole[]).map((r) => {
                    const conf = ROLE_PERMISSIONS[r];
                    const isSelected = role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#072F1F] text-white border-[#072F1F] shadow-sm'
                            : 'bg-[#F8FAF9] border-[#E9EFEF] text-[#0B130F] hover:border-slate-300'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{conf.roleLabel}</div>
                        <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-[#B4F105]' : 'text-[#6C7E75]'}`}>
                          {conf.defaultHub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password Setting */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#6C7E75] font-bold block">Password *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[#15803d] hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9EFEF]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-spark-primary text-xs">
                  Confirm Staff Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#072F1F]" />
              Modify Staff Account: {selectedStaff.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Role Permission</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as StaffRole)}
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Listing & KYC Moderator</option>
                  <option value="dispatcher">Logistics Dispatcher</option>
                  <option value="auditor">Financial & Compliance Auditor</option>
                </select>
              </div>

              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">
                  Reset Password (Leave blank to keep existing)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password to reset"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9EFEF]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-spark-primary text-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
