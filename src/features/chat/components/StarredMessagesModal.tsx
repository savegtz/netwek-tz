import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Search,
  MessageSquare,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, Conversation, UserProfile } from '../../../types';
import { SafeImage } from '../../../components/SafeImage';
import { ChatSyncService } from '../../../services/chat/chatSyncService';

interface StarredItem {
  message: ChatMessage;
  conversationId: string;
  conversationName: string;
  conversationAvatar?: string;
  isGroup?: boolean;
}

interface StarredMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  conversations: Conversation[];
  onOpenConversation: (conversationId: string) => void;
}

export const StarredMessagesModal: React.FC<StarredMessagesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  conversations,
  onOpenConversation,
}) => {
  const [starredItems, setStarredItems] = useState<StarredItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadStarredMessages = () => {
    const list: StarredItem[] = [];

    // Scan all cached messages in localStorage
    conversations.forEach((conv) => {
      try {
        const raw = localStorage.getItem(`zenia_msgs_${conv.id}`);
        if (raw) {
          const msgs: ChatMessage[] = JSON.parse(raw);
          const starred = msgs.filter((m) => m.isStarred === true);

          const otherUserId = conv.participants.find((p) => p !== currentUser.id);
          const otherUser =
            otherUserId && conv.participantDetails ? conv.participantDetails[otherUserId] : null;
          const convName = conv.isGroup
            ? conv.groupName || 'Kikundi'
            : otherUser?.displayName || 'Mazungumzo';
          const convAvatar = conv.isGroup ? conv.groupAvatar : otherUser?.photoURL;

          starred.forEach((msg) => {
            list.push({
              message: msg,
              conversationId: conv.id,
              conversationName: convName,
              conversationAvatar: convAvatar,
              isGroup: conv.isGroup,
            });
          });
        }
      } catch (_) {}
    });

    setStarredItems(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadStarredMessages();
      setSearchQuery('');
    }
  }, [isOpen, conversations]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUnstar = (item: StarredItem) => {
    ChatSyncService.updateMessage(item.conversationId, item.message.id, {
      isStarred: false,
    });
    setStarredItems((prev) => prev.filter((i) => i.message.id !== item.message.id));
  };

  const handleAddSampleStarred = () => {
    const targetConv = conversations[0];
    if (!targetConv) return;

    const sampleMsg: ChatMessage = {
      id: `msg_starred_sample_${Date.now()}`,
      conversationId: targetConv.id,
      senderId: targetConv.participants[0] || currentUser.id,
      senderName: targetConv.isGroup ? 'Mshiriki wa Kikundi' : 'Fresh kk',
      text: '⭐ Karibu sana Zenia! Huu ni ujumbe wako wa kwanza uliowekwa nyota.',
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStarred: true,
    };

    ChatSyncService.sendMessage(targetConv.id, sampleMsg);
    loadStarredMessages();
  };

  const filteredItems = starredItems.filter(
    (item) =>
      item.message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.conversationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.message.senderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0F1426] border border-amber-500/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Starred Messages (Jumbe za Nyota)</h3>
              <p className="text-[11px] text-amber-300">
                {starredItems.length} {starredItems.length === 1 ? 'ujumbe' : 'jumbe'} umehifadhiwa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {starredItems.length > 0 && (
          <div className="relative flex items-center mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta kwenye jumbe za nyota..."
              className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-400 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
        )}

        {/* Content list or Empty State */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <Star className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="max-w-xs">
                <h4 className="font-bold text-sm text-white mb-1">Huna Jumbe Zilizowekwa Nyota</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Ili kuweka nyota, bonyeza kwa muda mrefu ujumbe wowote kwenye mazungumzo na uchague Nyota (Star) kuuhifadhi hapa.
                </p>
                <button
                  type="button"
                  onClick={handleAddSampleStarred}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Weka Ujumbe wa Majaribio (Sample)</span>
                </button>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.message.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 transition-all space-y-2"
              >
                {/* Header of message */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <SafeImage
                      src={item.conversationAvatar}
                      fallbackText={item.conversationName}
                      className="w-5 h-5 rounded-md object-cover"
                    />
                    <span className="font-bold text-white truncate">{item.conversationName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 truncate">{item.message.senderName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.message.createdAt}</span>
                </div>

                {/* Body */}
                <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap pl-1 border-l-2 border-amber-400/60">
                  {item.message.text}
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 text-[11px] border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenConversation(item.conversationId);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Fungua Chat</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.message.text, item.message.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      title="Nakili ujumbe"
                    >
                      {copiedId === item.message.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Imenakiliwa</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Nakili</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUnstar(item)}
                      className="flex items-center gap-1 text-amber-400 hover:text-rose-400 transition-colors"
                      title="Ondoa nyota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Ondoa Nyota</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
