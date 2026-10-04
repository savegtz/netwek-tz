import React, { useState } from 'react';
import { Zap, Search, Plus, X, Check, Copy } from 'lucide-react';

export interface QuickReplyItem {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category: 'malipo' | 'huduma' | 'jumla';
}

export const INITIAL_QUICK_REPLIES: QuickReplyItem[] = [
  {
    id: 'qr_1',
    shortcut: '/karibu',
    title: 'Salamu Rasmi',
    content: 'Habari! Karibu sana kwenye huduma zetu za Zenia. Ninawezaje kukuhudumia leo kwa mafanikio? 😊',
    category: 'huduma',
  },
  {
    id: 'qr_2',
    shortcut: '/bei',
    title: 'Orodha ya Bei & Vifurushi',
    content: 'Orodha ya bei zetu ni: Vifurushi vya Kawaida vinaanzia TZS 25,000, na Pro TZS 60,000. Gharama zote zinajumuisha usafirishaji wa haraka!',
    category: 'malipo',
  },
  {
    id: 'qr_3',
    shortcut: '/lipa',
    title: 'Maelekezo ya Malipo',
    content: 'Unaweza kukamilisha malipo kwa usalama kupitia M-Pesa / Tigo Pesa Lipa Namba: 5892341 (Jina: Zenia Hub), au kwa kadi yako ya benki.',
    category: 'malipo',
  },
  {
    id: 'qr_4',
    shortcut: '/usafiri',
    title: 'Muda wa Usafirishaji',
    content: 'Mzigo wako utakufikia ndani ya masaa 2 hadi 4 ndani ya mji, na masaa 24 kwa mikoa mingine yote ya Tanzania.',
    category: 'huduma',
  },
  {
    id: 'qr_5',
    shortcut: '/shukrani',
    title: 'Ujumbe wa Shukrani',
    content: 'Asante sana kwa kufanya kazi nasi! Ni furaha yetu kukuhudumia. Tafadhali usisite kuwasiliana nasi muda wowote. Uwe na siku njema! ✨',
    category: 'jumla',
  },
];

interface QuickRepliesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReply: (replyText: string) => void;
}

export const QuickRepliesMenu: React.FC<QuickRepliesMenuProps> = ({
  isOpen,
  onClose,
  onSelectReply,
}) => {
  const [replies, setReplies] = useState<QuickReplyItem[]>(INITIAL_QUICK_REPLIES);
  const [search, setSearch] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newShortcut, setNewShortcut] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  if (!isOpen) return null;

  const filtered = replies.filter(
    (r) =>
      r.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcut.trim() || !newContent.trim()) return;

    const formattedShortcut = newShortcut.startsWith('/')
      ? newShortcut.trim().toLowerCase()
      : `/${newShortcut.trim().toLowerCase()}`;

    const newItem: QuickReplyItem = {
      id: `qr_${Date.now()}`,
      shortcut: formattedShortcut,
      title: newTitle.trim() || formattedShortcut,
      content: newContent.trim(),
      category: 'jumla',
    };

    setReplies([newItem, ...replies]);
    setNewShortcut('');
    setNewTitle('');
    setNewContent('');
    setIsAddingNew(false);
  };

  return (
    <div className="absolute bottom-16 left-3 right-3 sm:left-6 sm:max-w-md bg-[#111728] border border-cyan-500/30 rounded-2xl shadow-2xl p-3 z-50 animate-in slide-in-from-bottom-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          <span>Majibu ya Haraka (Quick Replies)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Mpya
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Quick Reply Form */}
      {isAddingNew && (
        <form onSubmit={handleAddNew} className="p-2.5 rounded-xl bg-[#0D1220] border border-cyan-500/20 space-y-2 mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newShortcut}
              onChange={(e) => setNewShortcut(e.target.value)}
              placeholder="Njia ya mkato (mf. /punguzo)"
              className="w-1/3 bg-[#171F36] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-mono"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Kichwa (mf. Ofa ya Sikukuu)"
              className="flex-1 bg-[#171F36] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            />
          </div>
          <textarea
            rows={2}
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Ujumbe unaotaka kutumwa..."
            className="w-full bg-[#171F36] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-2.5 py-1 text-[11px] text-slate-400"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-[11px] rounded-lg"
            >
              Hifadhi
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tafuta jibu au andika njia ya mkato (mf. /bei)..."
          className="w-full bg-[#0D1220] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          autoFocus
        />
      </div>

      {/* Replies List */}
      <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-3">Hakuna jibu lililopatikana.</p>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectReply(item.content);
                onClose();
              }}
              className="w-full text-left p-2 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/40 transition-all flex items-start justify-between group active:scale-98"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-cyan-300">
                    {item.shortcut}
                  </span>
                  <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.content}</p>
              </div>
              <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0 mt-1">
                Tumia ↵
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
