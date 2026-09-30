import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Users,
  Search,
  CheckSquare,
  BellOff,
  Bell,
  Clock,
  Palette,
  Heart,
  FolderPlus,
  Download,
  X,
  Link2,
  Video,
  AlertOctagon,
  Ban,
  MinusCircle,
  Trash2,
  ChevronRight,
  Check,
  Plus,
  Share2,
  Copy,
  Phone,
} from 'lucide-react';
import { Conversation, ChatMessage } from '../../../types';

export interface ChatTheme {
  id: string;
  name: string;
  wallpaperClass: string;
  wallpaperStyle?: React.CSSProperties;
  userBubbleClass: string;
  otherBubbleClass: string;
  previewBg: string;
  previewBubble: string;
  doodle?: boolean;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: 'doodle-green',
    name: 'Classic Doodle Green',
    wallpaperClass: 'bg-[#0b1014]',
    wallpaperStyle: {
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)`,
      backgroundSize: '24px 24px',
    },
    userBubbleClass: 'bg-[#005c4b] text-white shadow-sm',
    otherBubbleClass: 'bg-[#202c33] text-slate-100 shadow-sm',
    previewBg: 'bg-[#0b1014]',
    previewBubble: 'bg-[#005c4b]',
    doodle: true,
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    wallpaperClass: 'bg-gradient-to-b from-[#090d1f] via-[#060914] to-[#04060d]',
    userBubbleClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/20',
    otherBubbleClass: 'bg-[#182032] text-slate-100 shadow-sm',
    previewBg: 'bg-[#090d1f]',
    previewBubble: 'bg-blue-600',
  },
  {
    id: 'graphite-dark',
    name: 'Graphite Minimal',
    wallpaperClass: 'bg-[#0e1118]',
    userBubbleClass: 'bg-slate-700 text-white shadow-sm',
    otherBubbleClass: 'bg-[#1c212d] text-slate-100 shadow-sm',
    previewBg: 'bg-[#0e1118]',
    previewBubble: 'bg-slate-700',
  },
  {
    id: 'cyber-sunset',
    name: 'Cyber Sunset',
    wallpaperClass: 'bg-gradient-to-tr from-[#1f0b2e] via-[#120822] to-[#090514]',
    userBubbleClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20',
    otherBubbleClass: 'bg-[#221438] text-slate-100 border border-purple-500/20 shadow-sm',
    previewBg: 'bg-gradient-to-tr from-[#381352] to-[#120822]',
    previewBubble: 'bg-purple-600',
  },
  {
    id: 'blush-rose',
    name: 'Blush Floral',
    wallpaperClass: 'bg-gradient-to-b from-[#2a0e1b] via-[#170810] to-[#0a0307]',
    userBubbleClass: 'bg-[#9d174d] text-white shadow-md shadow-pink-900/30',
    otherBubbleClass: 'bg-[#2d1220] text-rose-100 shadow-sm',
    previewBg: 'bg-gradient-to-b from-[#4a182f] to-[#170810]',
    previewBubble: 'bg-[#9d174d]',
  },
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    wallpaperClass: 'bg-gradient-to-b from-[#2e1808] via-[#170b03] to-[#0a0501]',
    userBubbleClass: 'bg-[#c2410c] text-white shadow-md shadow-orange-950/40',
    otherBubbleClass: 'bg-[#331c0d] text-amber-100 shadow-sm',
    previewBg: 'bg-gradient-to-b from-[#522b0f] to-[#170b03]',
    previewBubble: 'bg-[#c2410c]',
  },
  {
    id: 'tropical-ocean',
    name: 'Tropical Ocean',
    wallpaperClass: 'bg-gradient-to-b from-[#05292b] via-[#041718] to-[#020b0c]',
    userBubbleClass: 'bg-[#0891b2] text-white shadow-md shadow-cyan-900/30',
    otherBubbleClass: 'bg-[#0f2d30] text-teal-100 shadow-sm',
    previewBg: 'bg-gradient-to-b from-[#0e484c] to-[#041718]',
    previewBubble: 'bg-[#0891b2]',
  },
  {
    id: 'pine-forest',
    name: 'Pine Forest',
    wallpaperClass: 'bg-gradient-to-b from-[#082914] via-[#05170b] to-[#020c06]',
    userBubbleClass: 'bg-[#15803d] text-white shadow-md shadow-emerald-950/40',
    otherBubbleClass: 'bg-[#122b19] text-emerald-100 shadow-sm',
    previewBg: 'bg-gradient-to-b from-[#104724] to-[#05170b]',
    previewBubble: 'bg-[#15803d]',
  },
  {
    id: 'desert-sand',
    name: 'Desert Dunes',
    wallpaperClass: 'bg-gradient-to-b from-[#1f1e1c] via-[#121110] to-[#080807]',
    userBubbleClass: 'bg-[#44403c] text-white shadow-sm',
    otherBubbleClass: 'bg-[#292524] text-stone-200 shadow-sm',
    previewBg: 'bg-[#292524]',
    previewBubble: 'bg-[#57534e]',
  },
  {
    id: 'obsidian-silk',
    name: 'Obsidian Silk',
    wallpaperClass: 'bg-[#08090d]',
    wallpaperStyle: {
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
      backgroundSize: '16px 16px',
    },
    userBubbleClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20',
    otherBubbleClass: 'bg-[#13192B] text-slate-100 border border-white/5 shadow-md',
    previewBg: 'bg-[#13192B]',
    previewBubble: 'bg-cyan-500',
  },
];

interface ChatRoomMoreMenuProps {
  conversation: Conversation;
  messages: ChatMessage[];
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onToggleSelectMode: () => void;
  onMute: (duration: '8h' | '1w' | 'always' | null) => void;
  onToggleFavorite: () => void;
  onAddToList: (listName: string) => void;
  onCloseChat: () => void;
  onStartCall: (type: 'video' | 'voice') => void;
  onBlock: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  disappearingTimer: string | null;
  onSetDisappearingTimer: (timer: string | null) => void;
  customLists: string[];
  onCreateCustomList: (name: string) => void;
  onShowToast: (msg: string) => void;
  onOpenContactInfo?: () => void;
}

export const ChatRoomMoreMenu: React.FC<ChatRoomMoreMenuProps> = ({
  conversation,
  messages,
  isOpen,
  onClose,
  onOpenSearch,
  onToggleSelectMode,
  onMute,
  onToggleFavorite,
  onAddToList,
  onCloseChat,
  onStartCall,
  onBlock,
  onClearChat,
  onDeleteChat,
  currentThemeId,
  onSelectTheme,
  disappearingTimer,
  onSetDisappearingTimer,
  customLists,
  onCreateCustomList,
  onShowToast,
  onOpenContactInfo,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<'mute' | 'lists' | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [reportReason, setReportReason] = useState('Spam');

  const otherUser = Object.values(conversation.participantDetails || {})[0];
  const chatName = conversation.isGroup
    ? conversation.groupName || 'Design Team'
    : otherUser?.displayName || 'Sarah Mwangi';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Export chat function (.txt download)
  const handleExportChat = () => {
    const header = `=== Zenia Chat Export: ${chatName} ===\nExported: ${new Date().toLocaleString()}\n\n`;
    const body = messages
      .map((m) => `[${m.createdAt}] ${m.senderName || 'User'}: ${m.text}`)
      .join('\n');
    const fullText = header + body;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Zenia_Chat_${chatName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Mazungumzo yamepakuliwa (Chat exported to .txt)');
    onClose();
  };

  // Send call link
  const handleSendCallLink = () => {
    const callLink = `https://zenia.app/call/${conversation.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(callLink);
    }
    onShowToast(`Link ya simu imenakiliwa: ${callLink}`);
    onClose();
  };

  return (
    <>
      {/* Invisible backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={() => {
          if (
            !showThemeModal &&
            !showDisappearingModal &&
            !showInfoDrawer &&
            !showReportModal &&
            !showBlockModal &&
            !showClearModal &&
            !showDeleteModal &&
            !showNewListModal
          ) {
            onClose();
          }
        }}
      />

      {/* 3-Dots Dropdown Menu */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-3 top-14 z-50 w-60 max-h-[82vh] overflow-y-auto rounded-2xl bg-[#131622] border border-white/10 shadow-2xl p-1.5 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex flex-col gap-0.5 text-xs">
          {/* 1. Contact info / Group info */}
          <button
            onClick={() => {
              onClose();
              if (onOpenContactInfo) {
                onOpenContactInfo();
              } else {
                setShowInfoDrawer(true);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            {conversation.isGroup ? (
              <Users className="w-4 h-4 text-slate-300 group-hover:text-white" />
            ) : (
              <User className="w-4 h-4 text-slate-300 group-hover:text-white" />
            )}
            <span className="font-medium text-white">
              {conversation.isGroup ? 'Group info' : 'Contact info'}
            </span>
          </button>

          {/* 2. Search */}
          <button
            onClick={() => {
              onOpenSearch();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Search className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Search</span>
          </button>

          {/* 3. Select messages */}
          <button
            onClick={() => {
              onToggleSelectMode();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <CheckSquare className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Select messages</span>
          </button>

          {/* 4. Mute notifications (with sub-options: 8 hr, 1 wiki, always) */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu('mute')}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button
              onClick={() => {
                if (conversation.mutedUntil) {
                  onMute(null);
                  onClose();
                } else {
                  setActiveSubmenu(activeSubmenu === 'mute' ? null : 'mute');
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                {conversation.mutedUntil ? (
                  <Bell className="w-4 h-4 text-amber-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-300 group-hover:text-white" />
                )}
                <span className="font-medium text-white">
                  {conversation.mutedUntil ? 'Unmute notifications' : 'Mute notifications'}
                </span>
              </div>
              {!conversation.mutedUntil && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              )}
            </button>

            {/* Mute Submenu */}
            {activeSubmenu === 'mute' && !conversation.mutedUntil && (
              <div className="absolute right-full top-0 mr-1 w-36 rounded-2xl bg-[#171B2A] border border-white/10 shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    onMute('8h');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-white"
                >
                  <span>8 hr</span>
                </button>
                <button
                  onClick={() => {
                    onMute('1w');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-white"
                >
                  <span>1 wiki</span>
                </button>
                <button
                  onClick={() => {
                    onMute('always');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors font-medium text-cyan-300"
                >
                  <span>always</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Disappearing messages */}
          <button
            onClick={() => setShowDisappearingModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-300 group-hover:text-white" />
              <span className="font-medium text-white">Disappearing messages</span>
            </div>
            {disappearingTimer && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                {disappearingTimer}
              </span>
            )}
          </button>

          {/* 6. Chat theme (Matches Screenshot Themes Picker!) */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Palette className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
            <span className="font-medium text-white">Chat theme</span>
          </button>

          {/* 7. Add to Favorites */}
          <button
            onClick={() => {
              onToggleFavorite();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Heart
              className={`w-4 h-4 ${
                conversation.isFavorite
                  ? 'text-pink-500 fill-pink-500'
                  : 'text-slate-300 group-hover:text-white'
              }`}
            />
            <span className="font-medium text-white">
              {conversation.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </span>
          </button>

          {/* 8. Add to list (with sub-options: new list, custom lists) */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu('lists')}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button
              onClick={() => setActiveSubmenu(activeSubmenu === 'lists' ? null : 'lists')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FolderPlus className="w-4 h-4 text-slate-300 group-hover:text-white" />
                <span className="font-medium text-white">Add to list</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>

            {/* List Submenu */}
            {activeSubmenu === 'lists' && (
              <div className="absolute right-full top-0 mr-1 w-44 rounded-2xl bg-[#171B2A] border border-white/10 shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => setShowNewListModal(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-cyan-500/20 text-cyan-300 font-semibold text-left transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>new list</span>
                </button>
                <div className="border-t border-white/10 my-0.5" />
                {customLists.map((list) => {
                  const isInList = conversation.lists?.includes(list);
                  return (
                    <button
                      key={list}
                      onClick={() => onAddToList(list)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-slate-200"
                    >
                      <span className="truncate">{list}</span>
                      {isInList && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 9. Export chat */}
          <button
            onClick={handleExportChat}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Download className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Export chat</span>
          </button>

          {/* 10. Close chat */}
          <button
            onClick={() => {
              onClose();
              onCloseChat();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <X className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Close chat</span>
          </button>

          {/* 11. Send call link */}
          <button
            onClick={handleSendCallLink}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span className="font-medium text-white">Send call link</span>
          </button>

          {/* 12. New group call */}
          <button
            onClick={() => {
              onStartCall('video');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Video className="w-4 h-4 text-cyan-400" />
            <span className="font-medium text-white">New group call</span>
          </button>

          {/* Divider */}
          <div className="border-t border-white/10 my-1" />

          {/* 13. Report */}
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group text-amber-400"
          >
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Report</span>
          </button>

          {/* 14. Block */}
          {!conversation.isGroup && (
            <button
              onClick={() => {
                if (conversation.isBlocked) {
                  onBlock();
                  onClose();
                } else {
                  setShowBlockModal(true);
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
            >
              <Ban
                className={`w-4 h-4 ${
                  conversation.isBlocked ? 'text-amber-400' : 'text-slate-300 group-hover:text-white'
                }`}
              />
              <span className="font-medium text-white">
                {conversation.isBlocked ? 'Unblock' : 'Block'}
              </span>
            </button>
          )}

          {/* 15. Clear chat */}
          <button
            onClick={() => setShowClearModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <MinusCircle className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Clear chat</span>
          </button>

          {/* 16. Delete chat */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 text-left transition-colors group"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="font-medium text-rose-400 group-hover:text-rose-300">Delete chat</span>
          </button>
        </div>
      </div>

      {/* THEMES MODAL (Matching User Screenshots 1, 2, 3, 4) */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#121626] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-white">Themes</h3>
                <p className="text-xs text-slate-400">
                  The chat color and wallpaper will both change.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold cursor-pointer">
                  See all
                </span>
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto p-1 py-4 flex-1">
              {CHAT_THEMES.map((theme) => {
                const isSelected = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme.id);
                      onShowToast(`Mandhari imebadilishwa kuwa: ${theme.name}`);
                    }}
                    className={`relative rounded-2xl p-2.5 text-left border transition-all flex flex-col justify-between h-28 overflow-hidden group ${
                      isSelected
                        ? 'border-2 border-white shadow-xl ring-2 ring-emerald-500/40'
                        : 'border-white/10 hover:border-white/30'
                    } ${theme.previewBg}`}
                    style={theme.wallpaperStyle}
                  >
                    {/* Simulated Bubbles */}
                    <div className="w-full flex flex-col gap-2">
                      <div className="w-16 h-4 rounded-xl bg-slate-800/80 self-start" />
                      <div className={`w-20 h-5 rounded-xl ${theme.previewBubble} self-end shadow-sm`} />
                    </div>

                    {/* Bottom label and checkmark */}
                    <div className="flex items-center justify-between mt-auto z-10">
                      <span className="text-[10px] font-semibold text-white/90 drop-shadow truncate pr-1">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setShowThemeModal(false);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Imekamilika (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISAPPEARING MESSAGES MODAL */}
      {showDisappearingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Disappearing Messages</h3>
            <p className="text-xs text-slate-400 mb-4">
              Jumbe mpya zitatoweka baada ya muda uliochaguliwa.
            </p>

            <div className="space-y-2 mb-5">
              {[
                { label: 'Off', val: null },
                { label: '24 hours', val: '24h' },
                { label: '7 days', val: '7d' },
                { label: '90 days', val: '90d' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    onSetDisappearingTimer(opt.val);
                    setShowDisappearingModal(false);
                    onShowToast(
                      opt.val
                        ? `Jumbe zitatoweka baada ya ${opt.label}`
                        : 'Disappearing messages imezimwa'
                    );
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                    disappearingTimer === opt.val
                      ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                      : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-300'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  {disappearingTimer === opt.val && (
                    <Check className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDisappearingModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
            >
              Ghairi (Close)
            </button>
          </div>
        </div>
      )}

      {/* CONTACT / GROUP INFO DRAWER */}
      {showInfoDrawer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#111524] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {conversation.isGroup ? 'Group Information' : 'Contact Information'}
              </h3>
              <button
                onClick={() => setShowInfoDrawer(false)}
                className="p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="w-20 h-20 rounded-full mx-auto overflow-hidden ring-4 ring-cyan-500/30 mb-3 shadow-xl">
                <img
                  src={
                    conversation.isGroup
                      ? conversation.groupAvatar || '/assets/images/amina_avatar_1790280951312.jpg'
                      : otherUser?.photoURL || '/assets/images/amina_avatar_1790280951312.jpg'
                  }
                  alt={chatName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-white">{chatName}</h4>
              <p className="text-xs text-slate-400">
                {conversation.isGroup ? '12 members • Created by James' : '@' + (otherUser?.username || 'sarah_m')}
              </p>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">About / Bio</p>
                <p className="text-white">Exploring ideas, tech, and collaborations in Dar es Salaam ✨</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">End-to-End Encryption</p>
                  <p className="text-slate-400 text-[11px]">Messages and calls are encrypted.</p>
                </div>
                <span className="text-emerald-400 text-base">🔒</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowInfoDrawer(false);
                  onStartCall('voice');
                }}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-cyan-400" />
                Voice Call
              </button>
              <button
                onClick={() => {
                  setShowInfoDrawer(false);
                  onStartCall('video');
                }}
                className="py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Video className="w-4 h-4" />
                Video Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Report {chatName}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Chagua sababu ya kuripoti mazungumzo haya:
            </p>

            <div className="space-y-1.5 mb-5 text-xs">
              {['Spam or commercial fraud', 'Harassment or hate speech', 'Inappropriate or harmful media', 'Pretending to be someone else'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between ${
                    reportReason === reason
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <span>{reason}</span>
                  {reportReason === reason && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  onClose();
                  onShowToast('Ripoti imetumwa kwa timu ya usalama ya Zenia. Asante!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Wasilisha (Report)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK CONFIRMATION MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Ban className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Zuia {chatName}?</h3>
            <p className="text-xs text-slate-300 mb-5">
              Mawasiliano yaliyozuiwa hayataweza kukupigia simu wala kukutumia ujumbe.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  onBlock();
                  setShowBlockModal(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Zuia (Block)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR CHAT CONFIRMATION MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <MinusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Futa jumbe zote?</h3>
            <p className="text-xs text-slate-300 mb-5">
              Je, una uhakika unataka kufuta jumbe zote za mazungumzo haya na {chatName}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  onClearChat();
                  setShowClearModal(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Futa (Clear)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CHAT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Futa mazungumzo?</h3>
            <p className="text-xs text-slate-300 mb-5">
              Mazungumzo yote na {chatName} yatafutwa kabisa kutoka kwenye orodha yako.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  onDeleteChat();
                  setShowDeleteModal(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Futa (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW LIST MODAL */}
      {showNewListModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newListName.trim()) {
                onCreateCustomList(newListName.trim());
                onAddToList(newListName.trim());
                setNewListName('');
                setShowNewListModal(false);
                onClose();
              }
            }}
            className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              Tengeneza Orodha Mpya (New List)
            </h3>
            <input
              type="text"
              autoFocus
              placeholder="Jina la orodha (mfano: VIP, Wateja)..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full bg-[#0A0D18] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewListModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                type="submit"
                disabled={!newListName.trim()}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
              >
                Hifadhi
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
