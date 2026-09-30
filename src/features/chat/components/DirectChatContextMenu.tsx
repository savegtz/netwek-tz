import React, { useState, useEffect, useRef } from 'react';
import {
  Archive,
  BellOff,
  Bell,
  Pin,
  PinOff,
  Mail,
  MailOpen,
  Heart,
  FolderPlus,
  MinusCircle,
  LogOut,
  Trash2,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Conversation } from '../../../types';

export interface DirectChatContextMenuProps {
  conversation: Conversation;
  position: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  onArchive: (conv: Conversation) => void;
  onMute: (conv: Conversation, duration: '8h' | '1w' | 'always' | null) => void;
  onPin: (conv: Conversation) => void;
  onMarkUnread: (conv: Conversation) => void;
  onToggleFavorite: (conv: Conversation) => void;
  onAddToList: (conv: Conversation, listName: string) => void;
  onClearChat: (conv: Conversation) => void;
  onDeleteChat: (conv: Conversation) => void;
  onExitGroup?: (conv: Conversation) => void;
  customLists: string[];
  onCreateCustomList: (listName: string) => void;
  onDeleteCustomList?: (listName: string) => void;
  onClearAllCustomLists?: () => void;
}

export const DirectChatContextMenu: React.FC<DirectChatContextMenuProps> = ({
  conversation,
  position,
  isOpen,
  onClose,
  onArchive,
  onMute,
  onPin,
  onMarkUnread,
  onToggleFavorite,
  onAddToList,
  onClearChat,
  onDeleteChat,
  onExitGroup,
  customLists,
  onCreateCustomList,
  onDeleteCustomList,
  onClearAllCustomLists,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<'mute' | 'lists' | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [showClearAllListsModal, setShowClearAllListsModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  const otherUser = Object.values(conversation.participantDetails || {})[0];
  const chatName = conversation.isGroup
    ? conversation.groupName || 'Group'
    : otherUser?.displayName || 'Chat';

  // Close when pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Clamped position calculation
  const menuWidth = 230;
  const menuHeight = 410;
  const clampedX = Math.max(12, Math.min(position.x, window.innerWidth - menuWidth - 16));
  const clampedY = Math.max(12, Math.min(position.y, window.innerHeight - menuHeight - 16));

  const handleCreateListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const trimmed = newListName.trim();
    onCreateCustomList(trimmed);
    onAddToList(conversation, trimmed);
    setNewListName('');
    setShowNewListModal(false);
    onClose();
  };

  return (
    <>
      {/* Invisible backdrop to dismiss context menu */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
        onClick={() => {
          if (!showClearModal && !showExitModal && !showNewListModal) {
            onClose();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Context Menu Container (Matches Image 1 Exactly) */}
      <div
        ref={menuRef}
        style={{
          top: `${clampedY}px`,
          left: `${clampedX}px`,
        }}
        className="fixed z-50 w-56 rounded-2xl bg-[#161822] border border-white/10 shadow-2xl p-1.5 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {/* 1. Archive chat */}
          <button
            onClick={() => {
              onArchive(conversation);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <Archive className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">
              {conversation.isArchived ? 'Unarchive chat' : 'Archive chat'}
            </span>
          </button>

          {/* 2. Mute notifications (with sub-options: 8 hr, 1 wiki, always) */}
          <div className="relative">
            <button
              onClick={() => {
                if (conversation.mutedUntil) {
                  onMute(conversation, null);
                  onClose();
                } else {
                  setActiveSubmenu(activeSubmenu === 'mute' ? null : 'mute');
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
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
                activeSubmenu === 'mute' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                )
              )}
            </button>

            {/* Mute Sub-options Accordion / Dropdown */}
            {activeSubmenu === 'mute' && !conversation.mutedUntil && (
              <div className="ml-7 mr-1 my-1 p-1 rounded-xl bg-[#0D0F18] border border-white/10 flex flex-col gap-0.5 animate-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    onMute(conversation, '8h');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-white/10 text-left text-slate-300 hover:text-white transition-colors"
                >
                  <span>8 hr</span>
                </button>
                <button
                  onClick={() => {
                    onMute(conversation, '1w');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-white/10 text-left text-slate-300 hover:text-white transition-colors"
                >
                  <span>1 wiki</span>
                </button>
                <button
                  onClick={() => {
                    onMute(conversation, 'always');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-white/10 text-left text-cyan-300 font-semibold transition-colors"
                >
                  <span>always</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Pin chat */}
          <button
            onClick={() => {
              onPin(conversation);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            {conversation.isPinned ? (
              <PinOff className="w-4 h-4 text-cyan-400" />
            ) : (
              <Pin className="w-4 h-4 text-slate-300 group-hover:text-white" />
            )}
            <span className="font-medium text-white">
              {conversation.isPinned ? 'Unpin chat' : 'Pin chat'}
            </span>
          </button>

          {/* 4. Mark as unread */}
          <button
            onClick={() => {
              onMarkUnread(conversation);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            {(conversation.unreadCount || 0) > 0 ? (
              <MailOpen className="w-4 h-4 text-cyan-400" />
            ) : (
              <Mail className="w-4 h-4 text-slate-300 group-hover:text-white" />
            )}
            <span className="font-medium text-white">
              {(conversation.unreadCount || 0) > 0 ? 'Mark as read' : 'Mark as unread'}
            </span>
          </button>

          {/* 5. Add to Favorites */}
          <button
            onClick={() => {
              onToggleFavorite(conversation);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
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

          {/* 6. Add to list (with sub-options: new list, custom lists) */}
          <div className="relative">
            <button
              onClick={() => setActiveSubmenu(activeSubmenu === 'lists' ? null : 'lists')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FolderPlus className="w-4 h-4 text-slate-300 group-hover:text-white" />
                <span className="font-medium text-white">Add to list</span>
              </div>
              {activeSubmenu === 'lists' ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              )}
            </button>

            {/* List Submenu Accordion */}
            {activeSubmenu === 'lists' && (
              <div className="ml-7 mr-1 my-1 p-1 rounded-xl bg-[#0D0F18] border border-white/10 flex flex-col gap-0.5 animate-in slide-in-from-top-1">
                {/* 1. Add new list */}
                <button
                  onClick={() => setShowNewListModal(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-cyan-500/20 text-cyan-300 font-semibold text-left transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>new list</span>
                </button>

                {customLists.length > 0 && <div className="border-t border-white/10 my-0.5" />}

                {/* 2. Custom lists with delete one-by-one (kufuta moja moja) */}
                {customLists.map((list) => {
                  const isInList = conversation.lists?.includes(list);
                  return (
                    <div
                      key={list}
                      className="group/item w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {/* Click list name to toggle assignment */}
                      <button
                        onClick={() => {
                          onAddToList(conversation, list);
                        }}
                        className="flex-1 flex items-center gap-1.5 text-left text-xs text-slate-200 hover:text-white truncate py-0.5"
                        title={isInList ? `Ondoa kwenye #${list}` : `Weka kwenye #${list}`}
                      >
                        <span className="truncate">#{list}</span>
                        {isInList && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>

                      {/* Delete this single list button (Kufuta moja moja) */}
                      {onDeleteCustomList && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomList(list);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-all ml-1 shrink-0"
                          title={`Futa orodha ya #${list}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* 3. Delete all lists button (Kufuta kwapamoja) */}
                {customLists.length > 0 && onClearAllCustomLists && (
                  <>
                    <div className="border-t border-white/10 my-0.5" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowClearAllListsModal(true);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 text-left transition-colors font-medium group"
                      title="Futa orodha zote mara moja (Delete all lists)"
                    >
                      <span className="flex items-center gap-1.5">
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Futa zote (Clear all)</span>
                      </span>
                      <span className="text-[10px] text-rose-400/70">({customLists.length})</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Divider Line Matching Image 1 */}
          <div className="border-t border-white/10 my-1" />

          {/* 7. Clear chat */}
          <button
            onClick={() => setShowClearModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-white/10 text-left transition-colors group"
          >
            <MinusCircle className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span className="font-medium text-white">Clear chat</span>
          </button>

          {/* 8. Exit group (if group) OR Delete chat (if direct chat) */}
          <button
            onClick={() => setShowExitModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-rose-500/20 text-rose-400 text-left transition-colors group"
          >
            {conversation.isGroup ? (
              <LogOut className="w-4 h-4 text-rose-400" />
            ) : (
              <Trash2 className="w-4 h-4 text-rose-400" />
            )}
            <span className="font-medium text-rose-400 group-hover:text-rose-300">
              {conversation.isGroup ? 'Exit group' : 'Delete chat'}
            </span>
          </button>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <MinusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Futa jumbe zote? (Clear chat)</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Je, una uhakika unataka kufuta jumbe zote za mazungumzo haya na {chatName}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  onClearChat(conversation);
                  setShowClearModal(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30"
              >
                Futa Jumbe (Clear)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Group / Delete Chat Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              {conversation.isGroup ? (
                <LogOut className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {conversation.isGroup ? `Toka kwenye kikundi? (Exit ${chatName})` : `Futa mazungumzo na ${chatName}?`}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {conversation.isGroup
                ? `Je, una uhakika unataka kuondoka kwenye kikundi cha "${chatName}"? Hutaweza tena kupokea wala kutuma jumbe humu.`
                : `Mazungumzo yote na "${chatName}" yatafutwa kabisa kutoka kwenye orodha yako.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  if (conversation.isGroup && onExitGroup) {
                    onExitGroup(conversation);
                  } else {
                    onDeleteChat(conversation);
                  }
                  setShowExitModal(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                {conversation.isGroup ? 'Toka Kikundini (Exit)' : 'Futa (Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateListSubmit}
            className="w-full max-w-sm bg-[#121626] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                Tengeneza Orodha Mpya (New List)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewListModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Weka jina la orodha kwa ajili ya kupanga mazungumzo yako (mfano: VIP, Familia, Kazini).
            </p>

            <input
              type="text"
              autoFocus
              placeholder="Jina la orodha..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full bg-[#0A0D18] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewListModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                type="submit"
                disabled={!newListName.trim()}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Hifadhi (Create)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clear All Custom Lists Confirmation Modal */}
      {showClearAllListsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Futa orodha zote? (Clear all lists)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Je, una uhakika unataka kufuta orodha zote ({customLists.map((l) => `#${l}`).join(', ')}) kwa pamoja?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearAllListsModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  if (onClearAllCustomLists) {
                    onClearAllCustomLists();
                  }
                  setShowClearAllListsModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Futa Zote (Delete All)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
