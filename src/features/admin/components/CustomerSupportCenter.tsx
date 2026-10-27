import React, { useState } from 'react';
import {
  Headphones,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Filter,
  Search,
} from 'lucide-react';
import { SupportTicket } from '../types';

interface CustomerSupportCenterProps {
  tickets: SupportTicket[];
  onUpdateTicket: (updated: SupportTicket) => void;
}

export const CustomerSupportCenter: React.FC<CustomerSupportCenterProps> = ({ tickets, onUpdateTicket }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg = {
      sender: 'admin' as const,
      senderName: 'Amytzee Admin',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated: SupportTicket = {
      ...selectedTicket,
      lastUpdate: 'Sasa hivi',
      status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status,
      messages: [...selectedTicket.messages, newMsg],
    };

    onUpdateTicket(updated);
    setReplyText('');
  };

  const handleStatusChange = (newStatus: SupportTicket['status']) => {
    if (!selectedTicket) return;
    const updated: SupportTicket = {
      ...selectedTicket,
      status: newStatus,
      lastUpdate: 'Sasa hivi',
    };
    onUpdateTicket(updated);
  };

  return (
    <div className="space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#0F1426] border border-white/10">
        <div>
          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <span>Kituo cha Msaada & Huduma kwa Wateja (Support Center)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Shughulikia malalamiko ya watumiaji kuhusu pochi, akaunti na usalama
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-[#14192E] p-1 rounded-2xl border border-white/5 text-xs">
          {[
            { id: 'all', label: 'Zote' },
            { id: 'open', label: 'Wazi (Open)' },
            { id: 'in_progress', label: 'Inashughulikiwa' },
            { id: 'resolved', label: 'Zilizotatuliwa' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filterStatus === f.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Tickets List (Left) + Detail Thread (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Tickets Queue */}
        <div className="space-y-2 lg:col-span-1 max-h-[600px] overflow-y-auto pr-1">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Hakuna tiketi za msaada zilizopatikana.
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/40 shadow-sm'
                      : 'bg-[#0F1326] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{t.id}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        t.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : t.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-white mt-1 line-clamp-1">{t.subject}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">Mteja: {t.userName}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-500">
                    <span className="capitalize">{t.category}</span>
                    <span
                      className={`font-bold ${
                        t.status === 'resolved'
                          ? 'text-emerald-400'
                          : t.status === 'in_progress'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {t.status === 'resolved' ? '✓ Imetatuliwa' : t.status === 'in_progress' ? 'Inafanyiwa kazi' : '● Mpya'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Ticket Conversation */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-[#0F1426] border border-white/10 flex flex-col h-[600px] shadow-xl">
          {selectedTicket ? (
            <>
              {/* Ticket Top Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{selectedTicket.id}</span>
                    <h5 className="font-extrabold text-sm text-white">{selectedTicket.subject}</h5>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mteja: <strong className="text-white">{selectedTicket.userName}</strong> ({selectedTicket.userEmail}) • {selectedTicket.createdAt}
                  </p>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('in_progress')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTicket.status === 'in_progress'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Inafanyiwa kazi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('resolved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    ✓ Tatua (Resolve)
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {selectedTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === 'admin' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'admin'
                          ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-xs'
                          : 'bg-[#181F38] text-slate-200 border border-white/5 rounded-tl-xs'
                      }`}
                    >
                      <span className="block text-[10px] font-bold opacity-75 mb-1 font-mono">
                        {m.senderName} • {m.timestamp}
                      </span>
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-3 border-t border-white/10 shrink-0">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Andika jibu rasmi kwa mteja..."
                  className="flex-1 bg-[#131930] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Tuma Jibu</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Chagua tiketi kushoto kuona maelezo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
