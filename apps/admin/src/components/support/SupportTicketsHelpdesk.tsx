'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { TicketStatus, SupportTicket, TicketCategory, TicketPriority } from '@/types';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const SupportTicketsHelpdesk: React.FC = () => {
  const {
    tickets,
    selectedTicketId,
    selectTicket,
    replyToTicket,
    updateTicketStatus,
    assignTicketAgent,
    createTicket,
    currentUser,
    users,
    auctions,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [replyText, setReplyText] = useState('');

  // Active selected ticket
  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Filtered tickets
  const filteredTickets = (tickets || []).filter((ticket) => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      query === '' ||
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.buyerName.toLowerCase().includes(query) ||
      ticket.buyerPhone.includes(query) ||
      ticket.subject.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  // Buyer 360 lookup
  const matchedBuyer = users.find(
    (u) => u.id === currentTicket?.buyerId || u.phone === currentTicket?.buyerPhone
  );

  const matchedAuctions = auctions.filter(
    (a) => a.highestBidder?.phone === currentTicket?.buyerPhone
  );

  const handleSendReply = () => {
    if (!replyText.trim() || !currentTicket) return;
    replyToTicket(currentTicket.id, replyText, currentUser?.name);
    setReplyText('');
  };

  const handleInsertCannedResponse = (text: string) => {
    setReplyText((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const cannedResponses = [
    {
      label: '🛡️ Open-Box Policy (Kurdish)',
      text: 'ڕێزدار، بەڵێ مافی تەواوت هەیە لە بەردەم شۆفێری گەیاندن کارتۆنەکە بکەیتەوە و کەلوپەلەکە بپشکنیت پێش پێدانی پارەی کاش. پاش ڕادەستکردنی پارەکە، فرۆشتن کۆتایی دێت.',
    },
    {
      label: '🛡️ Open-Box Policy (Arabic)',
      text: 'أهلاً بك، نعم يحق لك فتح الطرد وفحص المحتويات بحضور المندوب قبل دفع المبلغ نقداً. بعد استلام المبلغ تعتبر الصفقة نهائية.',
    },
    {
      label: '📦 Driver Phone Call (Kurdish)',
      text: 'شۆفێری کۆمپانیای گەیاندن ١٥ خولەک پێش گەیشتن بە نیشانەی سەربانەکەت پەیوەندی بە ژمارە مۆبایلەکەتەوە دەکات.',
    },
    {
      label: '⏱️ Anti-Sniping Rule (Arabic)',
      text: 'أي مزايدة تتم في آخر 30 ثانية تضيف تلقائياً +60 ثانية للعد التنازلي لإتاحة فرصة عادلة للجميع ومنع المزايدات الآلية.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#051C12]/90 border border-[#B4F105]/20 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Total Tickets
            </span>
            <Headphones className="w-4 h-4 text-[#B4F105]" />
          </div>
          <div className="text-2xl font-black text-white">{tickets.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">Cross-platform Helpdesk</div>
        </div>

        <div className="bg-[#051C12]/90 border border-red-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
              Open Queue
            </span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">
            {tickets.filter((t) => t.status === 'open').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Awaiting Agent Reply</div>
        </div>

        <div className="bg-[#051C12]/90 border border-amber-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
              In Progress
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {tickets.filter((t) => t.status === 'in_progress').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Active Discussions</div>
        </div>

        <div className="bg-[#051C12]/90 border border-[#10B981]/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#10B981] font-bold">
              Resolved
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-black text-[#10B981]">
            {tickets.filter((t) => t.status === 'resolved').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Cases Closed</div>
        </div>

        <div className="bg-[#051C12]/90 border border-[#10B981]/20 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Resolution Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-black text-white">
            {tickets.length > 0
              ? `${Math.round((tickets.filter((t) => t.status === 'resolved').length / tickets.length) * 100)}%`
              : '100%'}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">SLA Target Met</div>
        </div>
      </div>

      {/* Main 3-Column Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* ============================================================== */}
        {/* COLUMN 1: TICKET QUEUE DRAWER (4 COLS)                        */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 bg-[#051C12]/90 border border-[#B4F105]/20 rounded-3xl p-4 flex flex-col shadow-xl backdrop-blur-md">
          {/* Search & Filter Header */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, buyer name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#03120B] border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#B4F105] transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 p-1 bg-[#03120B] rounded-xl border border-gray-800">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg capitalize transition ${
                    statusFilter === status
                      ? 'bg-[#B4F105] text-[#051C12]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredTickets.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-xs">
                No support tickets found for this filter.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = currentTicket?.id === ticket.id;
                const lastMsg = ticket.messages[ticket.messages.length - 1];

                return (
                  <div
                    key={ticket.id}
                    onClick={() => selectTicket(ticket.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-[#0A2E1F] border-[#B4F105] shadow-md'
                        : 'bg-[#03120B] border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-black text-[#B4F105] tracking-wide">
                        {ticket.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            ticket.status === 'open'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : ticket.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-white mb-1 truncate">
                      {ticket.subject}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                      <span className="truncate max-w-[130px] font-medium text-gray-300">
                        👤 {ticket.buyerName}
                      </span>
                      <span className="text-[10px] bg-gray-800/80 px-1.5 py-0.5 rounded text-gray-300">
                        {ticket.buyerCity}
                      </span>
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 italic bg-[#020B07] p-2 rounded-xl border border-gray-900">
                        "{lastMsg.text}"
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                      <span>{ticket.messages.length} messages</span>
                      <span>{new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: ACTIVE CONVERSATION THREAD (5 COLS)                  */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-[#051C12]/90 border border-[#B4F105]/20 rounded-3xl p-4 flex flex-col shadow-xl backdrop-blur-md">
          {currentTicket ? (
            <>
              {/* Ticket Top Meta */}
              <div className="border-b border-gray-800 pb-3.5 mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{currentTicket.ticketNumber}</h3>
                    <span className="text-[11px] font-medium text-gray-400">
                      • {currentTicket.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-bold truncate max-w-[280px]">
                    {currentTicket.subject}
                  </p>
                </div>

                {/* Status Switcher Dropdown */}
                <select
                  value={currentTicket.status}
                  onChange={(e) => updateTicketStatus(currentTicket.id, e.target.value as TicketStatus)}
                  className="bg-[#03120B] border border-gray-700 text-xs font-bold text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#B4F105]"
                >
                  <option value="open">🔴 Open</option>
                  <option value="in_progress">🟡 In Progress</option>
                  <option value="resolved">🟢 Resolved</option>
                </select>
              </div>

              {/* Messages Chat Stream */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-3 max-h-[380px]">
                {currentTicket.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                        <span className="font-bold text-gray-300">{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow ${
                          isAgent
                            ? 'bg-[#B4F105] text-[#051C12] font-semibold rounded-tr-none'
                            : 'bg-[#03120B] border border-gray-800 text-gray-100 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1-Click Canned Responses */}
              <div className="mb-3">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B4F105]" />
                  <span>Canned Response Shortcuts (IQ Support)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cannedResponses.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertCannedResponse(item.text)}
                      className="text-[10px] font-bold bg-[#03120B] hover:bg-[#0A2E1F] border border-gray-800 hover:border-[#B4F105]/50 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <div className="pt-2 border-t border-gray-800 flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Type official response to buyer in mobile app... (Cross-synced live)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  className="flex-1 bg-[#03120B] border border-gray-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#B4F105] transition resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="bg-[#B4F105] hover:bg-[#a1d904] disabled:opacity-40 text-[#051C12] font-black px-4 rounded-xl transition flex flex-col items-center justify-center gap-1 shadow"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-[9px] uppercase">Reply</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
              Select a ticket from the left queue to open the conversation.
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: BUYER 360° INSPECTOR (3 COLS)                        */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 bg-[#051C12]/90 border border-[#B4F105]/20 rounded-3xl p-4 flex flex-col shadow-xl backdrop-blur-md space-y-4">
          <div className="border-b border-gray-800 pb-2.5">
            <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#B4F105]" />
              <span>Buyer 360° Profile</span>
            </h4>
          </div>

          {currentTicket ? (
            <>
              {/* Buyer Card */}
              <div className="bg-[#03120B] border border-gray-800 rounded-2xl p-3.5 space-y-2">
                <div className="font-black text-white text-sm">
                  {currentTicket.buyerName}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Phone className="w-3.5 h-3.5 text-[#B4F105]" />
                  <span className="font-mono">{currentTicket.buyerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    KYC: {currentTicket.kycStatus.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {currentTicket.buyerCity}
                  </span>
                </div>
              </div>

              {/* Gate 2 Delivery Landmark */}
              <div className="bg-[#03120B] border border-gray-800 rounded-2xl p-3.5 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B4F105]" />
                  <span>Gate 2 Delivery Landmark</span>
                </div>
                <p className="text-xs text-gray-200 font-semibold">
                  {currentTicket.rooftopLandmark || matchedBuyer?.rooftopPin?.landmark || 'Behind Family Mall, Street 10'}
                </p>
                <div className="text-[10px] font-mono text-gray-400">
                  GPS: 36.1911° N, 44.0092° E (±3m)
                </div>
              </div>

              {/* Associated Auction Orders */}
              <div className="bg-[#03120B] border border-gray-800 rounded-2xl p-3.5 space-y-2">
                <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#B4F105]" />
                  <span>Active COD Orders</span>
                </div>
                {matchedAuctions.length > 0 ? (
                  matchedAuctions.map((auc) => (
                    <div key={auc.id} className="text-xs text-gray-300 border-b border-gray-900 pb-1.5">
                      <div className="font-bold text-white truncate">{auc.multilingual?.en?.title || 'Item'}</div>
                      <div className="text-[10px] text-gray-400">
                        {auc.currentBidIqd.toLocaleString()} IQD • 100% COD
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-300">
                    <div className="font-bold text-white">Apple iPhone 16 Pro Max</div>
                    <div className="text-[10px] text-gray-400">
                      1,450,000 IQD • Won Auction (COD)
                    </div>
                  </div>
                )}
              </div>

              {/* Staff Assignment */}
              <div className="bg-[#03120B] border border-gray-800 rounded-2xl p-3.5 space-y-2">
                <div className="text-[10px] uppercase font-bold text-gray-400">
                  Assign Staff Specialist
                </div>
                <select
                  value={currentTicket.assignedAgent || ''}
                  onChange={(e) => assignTicketAgent(currentTicket.id, e.target.value)}
                  className="w-full bg-[#051C12] border border-gray-700 text-xs font-bold text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#B4F105]"
                >
                  <option value="">Unassigned</option>
                  <option value="Rawand Ali Barzani (SuperAdmin)">Rawand Ali (SuperAdmin)</option>
                  <option value="Miran Barzani (Logistics Ops)">Miran Barzani (Logistics Ops)</option>
                  <option value="Sardar Hameed (Customer Care)">Sardar Hameed (Customer Care)</option>
                </select>
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500 py-10 text-center">
              No ticket selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
