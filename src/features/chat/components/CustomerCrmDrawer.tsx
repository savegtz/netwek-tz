import React, { useState } from 'react';
import {
  X,
  User,
  Tag,
  Plus,
  FileText,
  Clock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  ShieldAlert,
  Send,
  Trash2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { CustomerCrmProfile, TicketStatus, TicketPriority } from '../../../types';

interface CustomerCrmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  crmProfile: CustomerCrmProfile;
  onUpdateProfile: (updated: CustomerCrmProfile) => void;
  onOpenSendInvoice: () => void;
  onTransferChat: (targetAgent: string) => void;
}

export const CustomerCrmDrawer: React.FC<CustomerCrmDrawerProps> = ({
  isOpen,
  onClose,
  crmProfile,
  onUpdateProfile,
  onOpenSendInvoice,
  onTransferChat,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!crmProfile.tags.includes(tag)) {
      onUpdateProfile({
        ...crmProfile,
        tags: [...crmProfile.tags, tag],
      });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateProfile({
      ...crmProfile,
      tags: crmProfile.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    const newNote = {
      id: `note_${Date.now()}`,
      authorName: 'Agent You',
      text: newNoteInput.trim(),
      createdAt: 'Sasa hivi',
    };
    onUpdateProfile({
      ...crmProfile,
      internalNotes: [newNote, ...crmProfile.internalNotes],
    });
    setNewNoteInput('');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateProfile({
      ...crmProfile,
      internalNotes: crmProfile.internalNotes.filter((n) => n.id !== noteId),
    });
  };

  return (
    <div className="fixed inset-0 z-[75] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0F1424] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#141B2F] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Wasifu wa Mteja & CRM
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal">
                  Mobijet Hub
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Taarifa za wakala & kumbukumbu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Customer Card */}
          <div className="p-4 rounded-2xl bg-[#151D33] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-white">{crmProfile.customerName}</h4>
                <p className="text-xs text-slate-400 font-mono">ID: {crmProfile.customerId}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Jumla ya Manunuzi</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {crmProfile.currency || 'TZS'} {(crmProfile.totalSpent || 240000).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{crmProfile.phone || '+255 712 345 678'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{crmProfile.location || 'Dar es Salaam, Tanzania'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mteja tangu: {crmProfile.joinedDate || 'Januari 2026'}</span>
              </div>
            </div>
          </div>

          {/* Ticket Status & Priority */}
          <div className="p-3.5 rounded-2xl bg-[#151D33] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                Tiketi ya Huduma: #{crmProfile.ticketId || 'TK-4821'}
              </span>
              <select
                value={crmProfile.ticketStatus}
                onChange={(e) =>
                  onUpdateProfile({
                    ...crmProfile,
                    ticketStatus: e.target.value as TicketStatus,
                  })
                }
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none ${
                  crmProfile.ticketStatus === 'resolved'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : crmProfile.ticketStatus === 'in_progress'
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                }`}
              >
                <option value="open">🟢 Wazi (Open)</option>
                <option value="in_progress">🟡 Inashughulikiwa</option>
                <option value="resolved">✅ Imekamilika (Resolved)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
              <span className="text-slate-400">Kipaumbele (Priority):</span>
              <select
                value={crmProfile.ticketPriority}
                onChange={(e) =>
                  onUpdateProfile({
                    ...crmProfile,
                    ticketPriority: e.target.value as TicketPriority,
                  })
                }
                className="bg-[#0D1220] border border-white/10 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="low">Kawaida (Low)</option>
                <option value="normal">Kawaida (Normal)</option>
                <option value="high">Kipaumbele cha Juu (High)</option>
                <option value="urgent">Haraka Sana (Urgent)</option>
              </select>
            </div>

            {/* Transfer Chat */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400">Wakala: {crmProfile.assignedAgentName || 'Sarah M.'}</span>
              <button
                onClick={() => {
                  const target = prompt('Ingiza jina au idara ya wakala mpya (mf. Alex Kimani, Finance Desk, Technical Support):', 'Alex Kimani');
                  if (target) onTransferChat(target);
                }}
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
              >
                Hamisha Chat
              </button>
            </div>
          </div>

          {/* Customer Tags */}
          <div className="p-3.5 rounded-2xl bg-[#151D33] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Lebo za Mteja (Tags)
              </span>
              <button
                onClick={() => setIsAddingTag(!isAddingTag)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Weka Lebo
              </button>
            </div>

            {isAddingTag && (
              <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Lebo mpya (mf. VIP, Mteja wa Jumla)..."
                  className="flex-1 bg-[#0D1220] border border-cyan-400/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-500 rounded-xl text-slate-950 font-bold text-xs"
                >
                  Weka
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {crmProfile.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/10 border border-cyan-400/30 text-cyan-200"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 transition-colors ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Internal Notes (Kumbukumbu za Siri za Wakala) */}
          <div className="p-3.5 rounded-2xl bg-[#151D33] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Kumbukumbu za Siri (Wakala Tu)
              </span>
              <span className="text-[10px] text-slate-400 italic">Mteja hazioni</span>
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-1">
              <textarea
                rows={2}
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Andika dokezo la siri la wakala hapa..."
                className="w-full bg-[#0D1220] border border-white/10 focus:border-amber-400/70 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={!newNoteInput.trim()}
                className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1 disabled:opacity-50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Hifadhi Kumbukumbu
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2 pt-2">
              {crmProfile.internalNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-2">
                  Hakuna dokezo lolote kwa sasa.
                </p>
              ) : (
                crmProfile.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-xl bg-[#0E1322] border border-white/5 relative group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-amber-300/80">{note.authorName}</span>
                      <span>{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-200 pr-5">{note.text}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      title="Futa dokezo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#141B2F] border-t border-white/10 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenSendInvoice();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            Tuma Ankara / Ombi la Malipo
          </button>
        </div>
      </div>
    </div>
  );
};
