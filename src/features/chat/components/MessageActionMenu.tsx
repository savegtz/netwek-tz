import React, { useState, useEffect, useRef } from 'react';
import {
  CornerUpLeft,
  Copy,
  Smile,
  CornerUpRight,
  Pin,
  Sparkles,
  Star,
  ThumbsDown,
  Trash2,
  Plus,
  X,
  Check,
  Search,
  Bot,
  Send,
  PinOff,
} from 'lucide-react';
import { ChatMessage, Conversation } from '../../../types';
import { SafeImage } from '../../../components/SafeImage';

export interface MessageActionMenuProps {
  message: ChatMessage;
  position: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  onReply: (msg: ChatMessage) => void;
  onCopy: (msg: ChatMessage) => void;
  onReact: (msg: ChatMessage, emoji: string) => void;
  onForward: (msg: ChatMessage, targetConvIds: string[]) => void;
  onPin: (msg: ChatMessage) => void;
  onAskAI: (msg: ChatMessage) => void;
  onStar: (msg: ChatMessage) => void;
  onReport: (msg: ChatMessage, reason: string) => void;
  onDelete: (msg: ChatMessage, mode: 'me' | 'everyone') => void;
  availableConversations: Conversation[];
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const EXTENDED_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '🙏',
  '🔥', '🎉', '👏', '💯', '✨', '😍',
  '🙌', '🤝', '🚀', '💡', '✅', '👀',
];

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  message,
  position,
  isOpen,
  onClose,
  onReply,
  onCopy,
  onReact,
  onForward,
  onPin,
  onAskAI,
  onStar,
  onReport,
  onDelete,
  availableConversations,
}) => {
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedForwardConvIds, setSelectedForwardConvIds] = useState<string[]>([]);
  const [forwardSearch, setForwardSearch] = useState('');
  const [reportReason, setReportReason] = useState('Inappropriate content');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Clamping position
  const menuWidth = 230;
  const menuHeight = 440;
  const clampedX = Math.max(12, Math.min(position.x - 30, window.innerWidth - menuWidth - 16));
  const clampedY = Math.max(16, Math.min(position.y - 70, window.innerHeight - menuHeight - 16));

  const handleForwardSubmit = () => {
    if (selectedForwardConvIds.length === 0) return;
    onForward(message, selectedForwardConvIds);
    setShowForwardModal(false);
    onClose();
  };

  const filteredConversations = availableConversations.filter((c) => {
    const title = c.isGroup
      ? c.groupName || 'Group'
      : Object.values(c.participantDetails || {})[0]?.displayName || 'Chat';
    return title.toLowerCase().includes(forwardSearch.toLowerCase());
  });

  return (
    <>
      {/* Invisible backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
        onClick={() => {
          if (!showForwardModal && !showDeleteModal && !showReportModal) {
            onClose();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Menu Container (Matching Screenshot Image 1) */}
      <div
        ref={menuRef}
        style={{
          top: `${clampedY}px`,
          left: `${clampedX}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-50 flex flex-col gap-2 select-none animate-in fade-in zoom-in-95 duration-100"
      >
        {/* 1. Emoji Reaction Bar (Matching Top Pill in Image 1) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181C2B] border border-white/15 shadow-2xl backdrop-blur-xl">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message, emoji);
                onClose();
              }}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowFullEmojiPicker(!showFullEmojiPicker)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="More reactions"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Extended Emoji Picker if Plus clicked */}
        {showFullEmojiPicker && (
          <div className="p-2 rounded-2xl bg-[#141828] border border-white/10 shadow-2xl grid grid-cols-6 gap-1 w-56 animate-in fade-in">
            {EXTENDED_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(message, emoji);
                  setShowFullEmojiPicker(false);
                  onClose();
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-base hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* 2. Message Actions Menu (Matching List in Image 1) */}
        <div className="w-56 rounded-2xl bg-[#131622] border border-white/10 shadow-2xl p-1.5 flex flex-col gap-0.5 text-xs text-slate-200">
          {/* Reply */}
          <button
            onClick={() => {
              onReply(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <CornerUpLeft className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Reply</span>
          </button>

          {/* Copy */}
          <button
            onClick={() => {
              onCopy(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Copy className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Copy</span>
          </button>

          {/* React */}
          <button
            onClick={() => setShowFullEmojiPicker(!showFullEmojiPicker)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Smile className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">React</span>
          </button>

          {/* Forward */}
          <button
            onClick={() => setShowForwardModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <CornerUpRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Forward</span>
          </button>

          {/* Pin */}
          <button
            onClick={() => {
              onPin(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            {message.isPinned ? (
              <PinOff className="w-4 h-4 text-cyan-400" />
            ) : (
              <Pin className="w-4 h-4 text-slate-300 group-hover:text-white" />
            )}
            <span className="font-medium text-white">
              {message.isPinned ? 'Unpin' : 'Pin'}
            </span>
          </button>

          {/* Ask Zenia AI */}
          <button
            onClick={() => {
              onAskAI(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-indigo-500/20 text-left transition-colors group text-cyan-300"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-cyan-300 group-hover:text-white">Ask Zenia AI</span>
          </button>

          {/* Star */}
          <button
            onClick={() => {
              onStar(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Star
              className={`w-4 h-4 ${
                message.isStarred
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-300 group-hover:text-white'
              }`}
            />
            <span className="font-medium text-white">
              {message.isStarred ? 'Unstar' : 'Star'}
            </span>
          </button>

          {/* Divider */}
          <div className="border-t border-white/10 my-0.5" />

          {/* Report */}
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors group text-amber-400"
          >
            <ThumbsDown className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Report</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 text-left transition-colors group"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="font-medium text-rose-400 group-hover:text-rose-300">Delete</span>
          </button>
        </div>
      </div>

      {/* FORWARD MESSAGE MODAL */}
      {showForwardModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CornerUpRight className="w-4 h-4 text-cyan-400" />
                Sambaza Ujumbe (Forward to...)
              </h3>
              <button
                onClick={() => setShowForwardModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quoted Preview */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 mb-3 text-xs text-slate-300 truncate italic">
              "{message.text}"
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={forwardSearch}
                onChange={(e) => setForwardSearch(e.target.value)}
                placeholder="Tafuta mtu au kikundi..."
                className="w-full bg-[#0A0D18] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Contacts list */}
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {filteredConversations.map((c) => {
                const title = c.isGroup
                  ? c.groupName || 'Group'
                  : Object.values(c.participantDetails || {})[0]?.displayName || 'Contact';
                const avatar = c.isGroup
                  ? c.groupAvatar
                  : Object.values(c.participantDetails || {})[0]?.photoURL;
                const isSelected = selectedForwardConvIds.includes(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedForwardConvIds((prev) =>
                        prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                      );
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border border-transparent text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <SafeImage
                        src={avatar}
                        fallbackText={title}
                        fallbackGradient="from-cyan-800 to-indigo-900"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        alt={title}
                      />
                      <span className="text-xs font-semibold truncate">{title}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-cyan-400 border-cyan-400 text-slate-950'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/5 flex gap-2 mt-3">
              <button
                onClick={() => setShowForwardModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={handleForwardSubmit}
                disabled={selectedForwardConvIds.length === 0}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                Tuma ({selectedForwardConvIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MESSAGE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Futa ujumbe? (Delete message)</h3>
            <p className="text-xs text-slate-400 mb-5">
              Chagua jinsi ya kufuta ujumbe huu:
            </p>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  onDelete(message, 'everyone');
                  setShowDeleteModal(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Futa kwa wote (Delete for everyone)
              </button>
              <button
                onClick={() => {
                  onDelete(message, 'me');
                  setShowDeleteModal(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold"
              >
                Futa kwangu tu (Delete for me)
              </button>
            </div>

            <button
              onClick={() => setShowDeleteModal(false)}
              className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs"
            >
              Ghairi
            </button>
          </div>
        </div>
      )}

      {/* REPORT MESSAGE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <ThumbsDown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Ripoti ujumbe huu</h3>
            <p className="text-xs text-slate-400 mb-4">
              Chagua sababu inayofaa kuripoti:
            </p>

            <div className="space-y-1.5 mb-5 text-xs">
              {['Spam or unauthorized ads', 'Harassment or threat', 'Inappropriate or harmful content', 'Scam or fraud'].map((reason) => (
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
                  onReport(message, reportReason);
                  setShowReportModal(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Wasilisha Ripoti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
