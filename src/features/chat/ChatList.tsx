import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCheck,
  Edit3,
  Users,
  Pin,
  BellOff,
  Heart,
  Ban,
  Archive,
  MoreVertical,
  Check,
  X,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  UserPlus,
  MessageSquarePlus,
  Sparkles,
  Trash2,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { handleFirestoreError, OperationType } from '../../services/firebase/firestoreError';
import { Conversation, UserProfile, StatusItem } from '../../types';
import { INITIAL_CONVERSATIONS } from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';
import { DirectChatContextMenu } from './components/DirectChatContextMenu';
import { ChatPinModal, PinModalMode } from './components/ChatPinModal';
import { ChatListStatusRow } from '../status/ChatListStatusRow';
import { ProfilePicturePreviewModal } from './components/ProfilePicturePreviewModal';
import { StatusIcon } from '../../components/StatusIcon';
import { AVAILABLE_CONTACTS } from './components/StartNewChatModal';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface ChatListProps {
  currentUser: UserProfile;
  conversations?: Conversation[];
  onSetConversations?: (convs: Conversation[]) => void;
  activeConversationId?: string;
  onSelectConversation: (conv: Conversation) => void;
  onStartNewChat: () => void;
  onStartNewChatWithUser?: (targetUser: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => void;
  onOpenProfile?: () => void;
  onUpdateConversation?: (conv: Conversation) => void;
  onDeleteConversation?: (convId: string) => void;
  onDeleteAllConversations?: () => void;
  onOpenCreateStatus?: () => void;
  customStatuses?: StatusItem[];
  onStartChatWithBusiness?: (
    businessId: string,
    businessName: string,
    initialMessage?: string,
    avatar?: string
  ) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  currentUser,
  conversations: propConversations,
  onSetConversations,
  activeConversationId,
  onSelectConversation,
  onStartNewChat,
  onStartNewChatWithUser,
  onOpenProfile,
  onUpdateConversation,
  onDeleteConversation,
  onDeleteAllConversations,
  onOpenCreateStatus,
  customStatuses,
  onStartChatWithBusiness,
}) => {
  const [internalConversations, setInternalConversations] = useState<Conversation[]>(() => {
    if (!currentUser || currentUser.id === 'guest_user') return [];
    try {
      const saved = localStorage.getItem(`zenia_user_conversations_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const conversations = propConversations ?? internalConversations;
  const setConversations = (action: React.SetStateAction<Conversation[]>) => {
    if (typeof action === 'function') {
      const updated = action(conversations);
      if (onSetConversations) {
        onSetConversations(updated);
      } else {
        setInternalConversations(updated);
      }
      try {
        localStorage.setItem(`zenia_user_conversations_${currentUser.id}`, JSON.stringify(updated));
      } catch (_) {}
    } else {
      if (onSetConversations) {
        onSetConversations(action);
      } else {
        setInternalConversations(action);
      }
      try {
        localStorage.setItem(`zenia_user_conversations_${currentUser.id}`, JSON.stringify(action));
      } catch (_) {}
    }
  };

  // Reload when currentUser changes if using internal state
  useEffect(() => {
    if (!propConversations && currentUser && currentUser.id !== 'guest_user') {
      try {
        const saved = localStorage.getItem(`zenia_user_conversations_${currentUser.id}`);
        setInternalConversations(saved ? JSON.parse(saved) : []);
      } catch (_) {
        setInternalConversations([]);
      }
    }
  }, [currentUser?.id, propConversations]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favorites' | 'groups' | 'archived' | 'locked'>('all');
  const [customLists, setCustomLists] = useState<string[]>(['Family', 'Work', 'VIP', 'Close Friends']);
  const [activeListFilter, setActiveListFilter] = useState<string | null>(null);

  // Unlocked conversations in the current active session
  const [unlockedConversationIds, setUnlockedConversationIds] = useState<Set<string>>(new Set());

  // PIN Modal State
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    mode: PinModalMode;
    chatTitle?: string;
    onSuccessCallback?: () => void;
  }>({
    isOpen: false,
    mode: 'verify',
  });

  // Context Menu State for 1-on-1 Person-to-Person Direct Chat
  const [contextMenuState, setContextMenuState] = useState<{
    isOpen: boolean;
    conversation: Conversation | null;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    conversation: null,
    position: { x: 0, y: 0 },
  });

  // Profile Picture Preview Modal State (WhatsApp-style avatar tap)
  const [profilePicModalState, setProfilePicModalState] = useState<{
    isOpen: boolean;
    conversation: Conversation | null;
  }>({
    isOpen: false,
    conversation: null,
  });

  // Multi-Selection Mode State (for deleting one, multiple, or all chats at once)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedConversationIds, setSelectedConversationIds] = useState<Set<string>>(new Set());

  // Options Menu dropdown state in the search row
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const listMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (listMenuRef.current && !listMenuRef.current.contains(event.target as Node)) {
        setIsListMenuOpen(false);
      }
    };
    if (isListMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isListMenuOpen]);

  // Delete Confirmation Modals States
  const [confirmDeleteSingle, setConfirmDeleteSingle] = useState<Conversation | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

  const handleUpdateAvatar = (convId: string, newAvatarUrl: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        if (c.isGroup) {
          return { ...c, groupAvatar: newAvatarUrl };
        } else {
          const otherUserId = c.participants.find((p) => p !== currentUser.id);
          const currentDetails = c.participantDetails || {};
          const otherDetails = otherUserId ? currentDetails[otherUserId] : null;
          return {
            ...c,
            participantDetails: {
              ...currentDetails,
              ...(otherUserId && otherDetails
                ? { [otherUserId]: { ...otherDetails, photoURL: newAvatarUrl } }
                : {}),
            },
          };
        }
      })
    );
    const updatedConv = conversations.find((c) => c.id === convId);
    if (updatedConv && onUpdateConversation) {
      if (updatedConv.isGroup) {
        onUpdateConversation({ ...updatedConv, groupAvatar: newAvatarUrl });
      } else {
        const otherUserId = updatedConv.participants.find((p) => p !== currentUser.id);
        const currentDetails = updatedConv.participantDetails || {};
        const otherDetails = otherUserId ? currentDetails[otherUserId] : null;
        onUpdateConversation({
          ...updatedConv,
          participantDetails: {
            ...currentDetails,
            ...(otherUserId && otherDetails
              ? { [otherUserId]: { ...otherDetails, photoURL: newAvatarUrl } }
              : {}),
          },
        });
      }
    }
    showToast('Picha ya wasifu imebadilishwa kikamilifu! ✨');
  };

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Listen for live conversation updates from Firestore and BroadcastChannel
  useEffect(() => {
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_MESSAGE') {
        const { conversationId, message } = event.data;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: message.text || (message.messageType === 'audio' ? 'Ujumbe wa sauti' : 'Ujumbe mpya'),
                  lastMessageType: message.messageType,
                  lastMessageSenderId: message.senderId,
                  updatedAt: message.createdAt || 'Sasa hivi',
                }
              : c
          )
        );
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('zenia_live_chat_sync');
      bc.addEventListener('message', handleBroadcast);
    }

    // Also subscribe to Firestore conversations collection
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = onSnapshot(collection(db, 'conversations'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteMap: Record<string, any> = {};
          snapshot.forEach((d) => {
            remoteMap[d.id] = d.data();
          });

          setConversations((prev) =>
            prev.map((c) => {
              if (remoteMap[c.id]) {
                const r = remoteMap[c.id];
                return {
                  ...c,
                  lastMessage: r.lastMessage || c.lastMessage,
                  lastMessageType: r.lastMessageType || c.lastMessageType,
                  lastMessageSenderId: r.lastMessageSenderId || c.lastMessageSenderId,
                  updatedAt: r.updatedAt || c.updatedAt,
                };
              }
              return c;
            })
          );
        }
      });
    } catch (_) {}

    return () => {
      if (bc) bc.removeEventListener('message', handleBroadcast);
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  // Long press handling for touch & mouse devices
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const handleTouchStart = (conv: Conversation, e: React.TouchEvent) => {
    isLongPressTriggeredRef.current = false;
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(45);
      }
      setContextMenuState({
        isOpen: true,
        conversation: conv,
        position: { x: touchX, y: touchY },
      });
    }, 400);
  };

  const handleTouchMove = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Mouse hold long-press handling
  const handleMouseDown = (conv: Conversation, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click
    isLongPressTriggeredRef.current = false;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setContextMenuState({
        isOpen: true,
        conversation: conv,
        position: { x: mouseX, y: mouseY },
      });
    }, 450);
  };

  const handleMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!auth.currentUser) return;
    const path = 'conversations';
    try {
      const q = query(collection(db, path));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as Conversation[];
            setConversations(fetched);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Conversations listener notice:', err);
    }
  }, []);

  // Update specific conversation
  const updateConversationState = (updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    if (onUpdateConversation) {
      onUpdateConversation(updated);
    }
  };

  // Actions Implementation
  const handleArchive = (conv: Conversation) => {
    const isNowArchived = !conv.isArchived;
    const updated: Conversation = { ...conv, isArchived: isNowArchived };
    updateConversationState(updated);
    showToast(isNowArchived ? 'Chat imewekwa kwenye kumbukumbu (Archived)' : 'Chat imerudishwa (Unarchived)');
  };

  const handleMute = (conv: Conversation, duration: '8h' | '1w' | 'always' | null) => {
    const updated: Conversation = { ...conv, mutedUntil: duration };
    updateConversationState(updated);
    if (duration) {
      const durText = duration === '8h' ? 'saa 8' : duration === '1w' ? 'wiki 1' : 'muda wote';
      showToast(`Taarifa zimezimwa kwa ${durText} (Muted)`);
    } else {
      showToast('Taarifa zimewashwa (Unmuted)');
    }
  };

  const handlePin = (conv: Conversation) => {
    const isNowPinned = !conv.isPinned;
    const updated: Conversation = { ...conv, isPinned: isNowPinned };
    updateConversationState(updated);
    showToast(isNowPinned ? 'Chat imebandikwa juu (Pinned to top)' : 'Chat imetolewa juu (Unpinned)');
  };

  const handleMarkUnread = (conv: Conversation) => {
    const currentUnread = conv.unreadCount || 0;
    const nextUnread = currentUnread > 0 ? 0 : 1;
    const updated: Conversation = { ...conv, unreadCount: nextUnread };
    updateConversationState(updated);
    showToast(nextUnread > 0 ? 'Imetiwa alama ya haijasomwa (Marked unread)' : 'Imetiwa alama ya imesomwa (Marked read)');
  };

  const handleToggleFavorite = (conv: Conversation) => {
    const isNowFav = !conv.isFavorite;
    const updated: Conversation = { ...conv, isFavorite: isNowFav };
    updateConversationState(updated);
    showToast(isNowFav ? 'Imeongezwa kwenye Vipendwa (Favorites)' : 'Imeondolewa kwenye Vipendwa');
  };

  const handleAddToList = (conv: Conversation, listName: string) => {
    const currentLists = conv.lists || [];
    const exists = currentLists.includes(listName);
    const nextLists = exists
      ? currentLists.filter((l) => l !== listName)
      : [...currentLists, listName];
    const updated: Conversation = { ...conv, lists: nextLists };
    updateConversationState(updated);
    showToast(exists ? `Imeondolewa kwenye orodha ya "${listName}"` : `Imeongezwa kwenye orodha ya "${listName}"`);
  };

  const handleCreateCustomList = (listName: string) => {
    if (!customLists.includes(listName)) {
      setCustomLists((prev) => [...prev, listName]);
    }
  };

  const handleBlock = (conv: Conversation) => {
    const isNowBlocked = !conv.isBlocked;
    const updated: Conversation = { ...conv, isBlocked: isNowBlocked };
    updateConversationState(updated);
    showToast(isNowBlocked ? 'Mtu huyu amezuiwa (Contact blocked)' : 'Mtu huyu ameruhusiwa tena (Unblocked)');
  };

  const handleClearChat = (conv: Conversation) => {
    const updated: Conversation = {
      ...conv,
      lastMessage: 'Messages cleared',
      unreadCount: 0,
      updatedAt: 'Just now',
    };
    updateConversationState(updated);
    showToast('Jumbe zote za mazungumzo haya zimefutwa (Chat cleared)');
  };

  const handleDeleteChat = (conv: Conversation) => {
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    if (onDeleteConversation) {
      onDeleteConversation(conv.id);
    }
    try {
      localStorage.removeItem(`zenia_msgs_${conv.id}`);
    } catch (_) {}
    setSelectedConversationIds((prev) => {
      const next = new Set(prev);
      next.delete(conv.id);
      return next;
    });
    showToast('Mazungumzo yamefutwa kabisa (Chat deleted)');
  };

  const toggleSelectConversation = (convId: string) => {
    setSelectedConversationIds((prev) => {
      const next = new Set(prev);
      if (next.has(convId)) next.delete(convId);
      else next.add(convId);
      return next;
    });
  };

  const handleSelectAllConversations = () => {
    const allFilteredIds = filteredConversations.map((c) => c.id);
    if (selectedConversationIds.size === allFilteredIds.length && allFilteredIds.length > 0) {
      setSelectedConversationIds(new Set());
    } else {
      setSelectedConversationIds(new Set(allFilteredIds));
    }
  };

  const handleDeleteSelectedConversations = () => {
    if (selectedConversationIds.size === 0) return;
    const idsToDelete = new Set(selectedConversationIds);
    const count = idsToDelete.size;

    setConversations((prev) => prev.filter((c) => !idsToDelete.has(c.id)));
    idsToDelete.forEach((id) => {
      if (onDeleteConversation) {
        onDeleteConversation(id);
      }
      try {
        localStorage.removeItem(`zenia_msgs_${id}`);
      } catch (_) {}
    });

    setSelectedConversationIds(new Set());
    setIsSelectionMode(false);
    setConfirmDeleteSelected(false);
    showToast(`Mazungumzo ${count} yamefutwa kabisa! 🗑️`);
  };

  const handleDeleteAllChats = () => {
    const total = conversations.length;
    setConversations([]);
    if (onDeleteAllConversations) {
      onDeleteAllConversations();
    } else {
      try {
        localStorage.removeItem(`zenia_user_conversations_${currentUser.id}`);
      } catch (_) {}
    }
    conversations.forEach((c) => {
      if (onDeleteConversation) onDeleteConversation(c.id);
      try {
        localStorage.removeItem(`zenia_msgs_${c.id}`);
      } catch (_) {}
    });

    setSelectedConversationIds(new Set());
    setIsSelectionMode(false);
    setConfirmDeleteAll(false);
    showToast(`Mazungumzo yote ${total > 0 ? `(${total}) ` : ''}yamefutwa kwapamoja! 🗑️`);
  };

  const handleExitGroup = (conv: Conversation) => {
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    if (onDeleteConversation) {
      onDeleteConversation(conv.id);
    }
    const name = conv.groupName || 'Kikundi';
    showToast(`Umetoka kwenye kikundi cha "${name}" (Exited group)`);
  };

  const handleDeleteCustomList = (listName: string) => {
    setCustomLists((prev) => prev.filter((l) => l !== listName));
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        lists: c.lists?.filter((l) => l !== listName),
      }))
    );
    if (activeListFilter === listName) {
      setActiveListFilter(null);
    }
    showToast(`Orodha ya "#${listName}" imefutwa (Deleted)`);
  };

  const handleClearAllCustomLists = () => {
    setCustomLists([]);
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        lists: [],
      }))
    );
    setActiveListFilter(null);
    showToast('Orodha zote zimefutwa (All custom lists deleted)');
  };

  const handleToggleLockChat = (conv: Conversation) => {
    const savedPin = localStorage.getItem('zenia_chat_security_pin');
    const isNowLocked = !conv.isLocked;

    if (isNowLocked && !savedPin) {
      setPinModalState({
        isOpen: true,
        mode: 'create',
        chatTitle: conv.isGroup ? conv.groupName : 'Mazungumzo',
        onSuccessCallback: () => {
          const updated: Conversation = { ...conv, isLocked: true };
          updateConversationState(updated);
          showToast(`PIN imehifadhiwa na mazungumzo yamefungwa 🔒`);
        },
      });
      return;
    }

    if (!isNowLocked && savedPin) {
      setPinModalState({
        isOpen: true,
        mode: 'verify',
        chatTitle: conv.isGroup ? conv.groupName : 'Mazungumzo',
        onSuccessCallback: () => {
          const updated: Conversation = { ...conv, isLocked: false };
          updateConversationState(updated);
          setUnlockedConversationIds((prev) => {
            const next = new Set(prev);
            next.delete(conv.id);
            return next;
          });
          showToast('Kufuli imeondolewa (Chat unlocked 🔓)');
        },
      });
      return;
    }

    const updated: Conversation = { ...conv, isLocked: isNowLocked };
    updateConversationState(updated);
    if (isNowLocked) {
      setUnlockedConversationIds((prev) => {
        const next = new Set(prev);
        next.delete(conv.id);
        return next;
      });
      showToast('Mazungumzo yamefungwa kwa PIN (Chat locked 🔒)');
    } else {
      showToast('Kufuli imeondolewa (Chat unlocked 🔓)');
    }
  };

  // Filter & Sort Conversations
  const archivedCount = conversations.filter((c) => c.isArchived).length;
  const lockedCount = conversations.filter((c) => c.isLocked).length;

  const DEMO_IDS = ['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5', 'conv_6'];

  const filteredConversations = conversations
    .filter((c) => {
      // Exclude demo conversations as requested by user
      if (DEMO_IDS.includes(c.id)) return false;

      const otherId = c.participants.find((p) => p !== currentUser.id) || '';
      const other = c.participantDetails?.[otherId];
      const name = c.isGroup ? c.groupName || '' : other?.displayName || 'Chat';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Handle custom list filter
      if (activeListFilter) {
        return c.lists?.includes(activeListFilter);
      }

      // Handle standard filters
      if (activeFilter === 'locked') return c.isLocked === true;
      if (activeFilter === 'archived') return c.isArchived === true;
      if (c.isArchived) return false; // Hide archived from normal tabs

      if (activeFilter === 'unread') return (c.unreadCount || 0) > 0;
      if (activeFilter === 'favorites') return c.isFavorite === true;
      if (activeFilter === 'groups') return c.isGroup;
      return true;
    })
    .sort((a, b) => {
      // Pinned chats appear on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const matchingContacts = searchQuery.trim()
    ? AVAILABLE_CONTACTS.filter(
        (c) =>
          c.id !== currentUser.id &&
          (c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#070A12] text-white flex-1 relative select-none overflow-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-2 left-4 right-4 z-40 bg-gradient-to-r from-cyan-900/90 to-[#121626]/95 border border-cyan-500/40 text-cyan-200 text-xs px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-cyan-400/70 hover:text-cyan-200 text-xs ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* WhatsApp Modern Status Icons Carousel (Placed ABOVE search as requested) */}
      <ChatListStatusRow
        currentUser={currentUser}
        customStatuses={customStatuses}
        onStartChatWithBusiness={onStartChatWithBusiness}
        onOpenCreateStatus={() => {
          if (onOpenCreateStatus) {
            onOpenCreateStatus();
          } else {
            showToast('Gusa kuweka Status');
          }
        }}
        onSendStatusReply={(status, reply) => {
          showToast(`Ujumbe umetumwa kwa ${status.authorName}: "${reply}"`);
        }}
      />

      {/* Search Input Bar or Selection Mode Header */}
      {isSelectionMode ? (
        <div className="px-3.5 pt-2 pb-2 flex items-center justify-between gap-2 bg-[#0E1324] border-b border-cyan-500/30 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedConversationIds(new Set());
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Ghairi uchaguzi (Cancel)"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white truncate">
              {selectedConversationIds.size}{' '}
              {selectedConversationIds.size === 1 ? 'limechaguliwa' : 'yamechaguliwa'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSelectAllConversations}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-all active:scale-95"
            >
              {selectedConversationIds.size === filteredConversations.length && filteredConversations.length > 0
                ? 'Ondoa Zote'
                : 'Chagua Zote'}
            </button>

            <button
              disabled={selectedConversationIds.size === 0}
              onClick={() => setConfirmDeleteSelected(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                selectedConversationIds.size > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Futa ({selectedConversationIds.size})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3.5 pt-2 pb-1.5 flex items-center gap-2">
          {/* Wide & clean search bar */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta mazungumzo au watu..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400/60 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-white"
                title="Futa utafutaji"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Consolidated Chat Management Menu Button */}
          <div className="relative shrink-0" ref={listMenuRef}>
            <button
              onClick={() => setIsListMenuOpen(!isListMenuOpen)}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isListMenuOpen
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title="Chaguzi za mazungumzo"
              aria-label="Chat options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isListMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0E1324] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <button
                  onClick={() => {
                    setIsListMenuOpen(false);
                    onStartNewChat();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tafuta Mtu / Chat Mpya</span>
                </button>

                {filteredConversations.length > 0 && (
                  <button
                    onClick={() => {
                      setIsListMenuOpen(false);
                      setIsSelectionMode(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Chagua Mazungumzo (Select)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsListMenuOpen(false);
                    const savedPin = localStorage.getItem('zenia_chat_security_pin');
                    setPinModalState({
                      isOpen: true,
                      mode: savedPin ? 'change' : 'create',
                      chatTitle: 'Usalama wa Meseji (Chat Security)',
                    });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Usalama wa PIN (Lock chats)</span>
                </button>

                {filteredConversations.length > 0 && (
                  <button
                    onClick={() => {
                      setIsListMenuOpen(false);
                      setConfirmDeleteAll(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors text-left border-t border-white/5 mt-1 pt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Futa Mazungumzo Yote</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs - Clean, subtle segmented design adhering to Zero-Pill discipline */}
      <div className="px-3.5 pb-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Zote' },
          { id: 'unread', label: 'Hazijasomwa' },
          { id: 'groups', label: 'Vikundi' },
          { id: 'favorites', label: 'Vipendwa' },
          ...(lockedCount > 0
            ? [{ id: 'locked', label: `Zilizofungwa (${lockedCount})` }]
            : []),
          ...(archivedCount > 0
            ? [{ id: 'archived', label: `Kumbukumbu (${archivedCount})` }]
            : []),
        ].map((tab) => {
          const isActive = activeFilter === tab.id && !activeListFilter;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveListFilter(null);
                setActiveFilter(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Custom Lists (Quiet, clean text tags) */}
        {customLists.map((list) => {
          const isActive = activeListFilter === list;
          return (
            <div
              key={list}
              className={`flex items-center gap-1 rounded-xl text-xs font-medium transition-all shrink-0 pl-2.5 pr-1 py-1 ${
                isActive
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white'
              }`}
            >
              <button
                onClick={() => {
                  setActiveListFilter(activeListFilter === list ? null : list);
                }}
                className="hover:underline truncate max-w-[90px]"
              >
                #{list}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomList(list);
                }}
                className="p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400"
                title={`Futa #${list}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Archived Banner (Quick access if not in archived tab) */}
      {archivedCount > 0 && activeFilter !== 'archived' && !activeListFilter && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setActiveFilter('archived')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Archived Chats</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              {archivedCount}
            </span>
          </button>
        </div>
      )}

      {/* Conversation List with Smooth Touch Scroll */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-2 divide-y divide-white/[0.04] pb-36 md:pb-12 overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {/* If searching, render Global Directory People results first! */}
        {searchQuery.trim().length > 0 && matchingContacts.length > 0 && (
          <div className="p-3 mb-2 bg-[#0C1122] rounded-2xl border border-cyan-500/25 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Watu Walio Patikana ({matchingContacts.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Gusa kuanza kuchat</span>
            </div>
            <div className="space-y-1.5">
              {matchingContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    if (onStartNewChatWithUser) {
                      onStartNewChatWithUser(contact);
                    } else {
                      onStartNewChat();
                    }
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <SafeImage
                        src={contact.photoURL}
                        fallbackText={contact.displayName}
                        fallbackGradient="from-cyan-800 to-indigo-900"
                        alt={contact.displayName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-cyan-400"
                      />
                      {contact.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0C1122]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 truncate">
                        {contact.displayName}
                      </h4>
                      <p className="text-[10px] text-cyan-400/80 font-mono truncate">
                        @{contact.username} • {contact.bio}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-[11px] group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shrink-0 ml-2">
                    Chat
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredConversations.length === 0 && matchingContacts.length === 0 ? (
          <div className="py-10 px-4 text-center text-slate-400 text-xs flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-purple-500/15 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/10">
              <MessageSquarePlus className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h4 className="font-bold text-sm text-white mb-1">
              {searchQuery.trim() ? 'Hakuna Matokeo Yaliyopatikana' : 'Hakuna Mazungumzo Bado'}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mb-4">
              {searchQuery.trim()
                ? `Hakuna mazungumzo wala mawasiliano yanayolingana na "${searchQuery}". Jaribu jina lingine au anza chat mpya.`
                : 'Bado hujaanza kuchati na mtu yeyote. Mazungumzo yako yataonekana hapa pindi utakapoanza kuchati.'}
            </p>
            <button
              onClick={onStartNewChat}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mb-5"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Anza Kuchati Sasa</span>
            </button>

            {/* Quick contact suggestion chips */}
            {!searchQuery.trim() && (
              <div className="w-full max-w-xs text-left bg-white/[0.03] border border-white/5 rounded-2xl p-3 shadow-inner">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Marafiki Waliopo Mtandaoni:</span>
                </p>
                <div className="space-y-2">
                  {AVAILABLE_CONTACTS.filter((c) => c.id !== currentUser.id).slice(0, 3).map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SafeImage
                          src={contact.photoURL}
                          fallbackText={contact.displayName}
                          fallbackGradient="from-cyan-800 to-indigo-900"
                          alt={contact.displayName}
                          className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{contact.displayName}</p>
                          <p className="text-[9px] text-slate-400 truncate">@{contact.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (onStartNewChatWithUser) {
                            onStartNewChatWithUser(contact);
                          } else {
                            onStartNewChat();
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-[10px] font-bold transition-all shrink-0 active:scale-95"
                      >
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUserId = conv.participants.find((p) => p !== currentUser.id);
            const otherUser = otherUserId && conv.participantDetails ? conv.participantDetails[otherUserId] : null;
            const title: string = (conv.isGroup ? conv.groupName : otherUser?.displayName) || 'Direct Chat';
            const avatar = conv.isGroup
              ? conv.groupAvatar || '/assets/images/amina_avatar_1790280951312.jpg'
              : (conv.id === 'conv_fresh_kk' || title.toLowerCase().includes('fresh'))
              ? freshKkAvatar
              : otherUser?.photoURL || freshKkAvatar;
            const isOnline = otherUser?.isOnline ?? true;
            const isSelected = activeConversationId === conv.id;
            const hasStatus = conv.id === 'conv_fresh_kk' || title.toLowerCase().includes('fresh');

            return (
              <div
                key={conv.id}
                onTouchStart={(e) => handleTouchStart(conv, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleMouseDown(conv, e)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenuState({
                    isOpen: true,
                    conversation: conv,
                    position: { x: e.clientX, y: e.clientY },
                  });
                }}
                className={`relative group w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  (isSelectionMode && selectedConversationIds.has(conv.id)) || isSelected
                    ? 'bg-cyan-500/15 border border-cyan-500/30 shadow-sm'
                    : 'hover:bg-white/[0.04] active:bg-white/[0.08] border border-transparent'
                }`}
                onClick={(e) => {
                  if (isSelectionMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSelectConversation(conv.id);
                    return;
                  }
                  if (isLongPressTriggeredRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    isLongPressTriggeredRef.current = false;
                    return;
                  }
                  // Require PIN verification if conversation is locked
                  if (conv.isLocked && !unlockedConversationIds.has(conv.id)) {
                    setPinModalState({
                      isOpen: true,
                      mode: 'verify',
                      chatTitle: title,
                      onSuccessCallback: () => {
                        setUnlockedConversationIds((prev) => new Set(prev).add(conv.id));
                        onSelectConversation(conv);
                      },
                    });
                    return;
                  }
                  onSelectConversation(conv);
                }}
              >
                {/* Selection Mode Checkbox */}
                {isSelectionMode && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectConversation(conv.id);
                    }}
                    className="shrink-0 -mr-1 animate-in zoom-in-75 duration-150"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        selectedConversationIds.has(conv.id)
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20'
                          : 'bg-white/5 border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                )}
                {/* Avatar with status dot and status icon badge */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfilePicModalState({
                      isOpen: true,
                      conversation: conv,
                    });
                  }}
                  className="relative shrink-0 cursor-pointer active:scale-90 transition-transform group/avatar"
                  title={`Gusa kuona picha ya wasifu ya ${title}`}
                >
                  <SafeImage
                    src={avatar}
                    fallbackText={title}
                    fallbackGradient={conv.isGroup ? 'from-purple-800 to-indigo-900' : 'from-cyan-800 to-blue-900'}
                    alt={title || ''}
                    className={`w-[50px] h-[50px] aspect-square rounded-[18px] object-cover ring-2 transition-all ${
                      isSelected
                        ? 'ring-cyan-400'
                        : 'ring-white/10 group-hover/avatar:ring-cyan-400/80 group-hover/avatar:scale-105'
                    }`}
                  />
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#070A12] shadow-sm" />
                  )}
                  {conv.isGroup && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-md bg-purple-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Chat details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4
                        className={`font-semibold text-sm truncate transition-colors ${
                          isSelected ? 'text-cyan-300 font-bold' : 'text-slate-100 group-hover:text-cyan-300'
                        }`}
                      >
                        {title}
                      </h4>
                      {/* Locked PIN Icon */}
                      {conv.isLocked && (
                        <span
                          className="p-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0"
                          title="Mazungumzo Yamefungwa kwa PIN"
                        >
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                      {/* Pinned Icon */}
                      {conv.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0 rotate-45" />
                      )}
                      {/* Favorite Icon */}
                      {conv.isFavorite && (
                        <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0" />
                      )}
                      {/* Blocked Badge */}
                      {conv.isBlocked && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 shrink-0">
                          Blocked
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Muted Icon */}
                      {conv.mutedUntil && (
                        <BellOff className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {conv.updatedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {conv.isLocked && !unlockedConversationIds.has(conv.id) ? (
                      <p className="text-xs text-cyan-400/90 truncate flex items-center gap-1.5 font-medium">
                        <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="italic">Ujumbe umefungwa kwa PIN</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                        {conv.lastMessageSenderId === currentUser.id && (
                          <CheckCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        {conv.lastMessage === 'Typing...' ? (
                          <span className="text-cyan-400 font-medium italic">Typing...</span>
                        ) : (
                          conv.lastMessage
                        )}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* List Tags */}
                      {conv.lists && conv.lists.length > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                          {conv.lists[0]}
                        </span>
                      )}

                      {/* Unread Count Badge */}
                      {(conv.unreadCount || 0) > 0 && (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-[10px] font-bold text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}

                      {!isSelectionMode && (
                        <div className="flex items-center gap-0.5">
                          {/* Quick Delete Single Chat Button (kufuta moja) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteSingle(conv);
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors active:scale-90 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title={`Futa mazungumzo na ${title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Options Menu Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setContextMenuState({
                                isOpen: true,
                                conversation: conv,
                                position: {
                                  x: Math.min(rect.left - 180, window.innerWidth - 250),
                                  y: Math.min(rect.bottom + 4, window.innerHeight - 360),
                                },
                              });
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Chaguzi za mazungumzo"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) at bottom right: Anza Chat Mpya */}
      {!isSelectionMode && (
        <button
          onClick={onStartNewChat}
          className="fixed sm:absolute bottom-20 md:bottom-6 right-4 w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all z-30 flex items-center justify-center group"
          title="Anza Mazungumzo Mapya (New Chat)"
          aria-label="New Chat"
        >
          <MessageSquarePlus className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Context Menu for 1-on-1 Person-to-Person Chat */}
      {contextMenuState.isOpen && contextMenuState.conversation && (
        <DirectChatContextMenu
          conversation={contextMenuState.conversation}
          position={contextMenuState.position}
          isOpen={contextMenuState.isOpen}
          onClose={() =>
            setContextMenuState({
              isOpen: false,
              conversation: null,
              position: { x: 0, y: 0 },
            })
          }
          onArchive={handleArchive}
          onMute={handleMute}
          onPin={handlePin}
          onMarkUnread={handleMarkUnread}
          onToggleFavorite={handleToggleFavorite}
          onToggleLockChat={handleToggleLockChat}
          onAddToList={handleAddToList}
          onClearChat={handleClearChat}
          onDeleteChat={handleDeleteChat}
          onExitGroup={handleExitGroup}
          customLists={customLists}
          onCreateCustomList={handleCreateCustomList}
          onDeleteCustomList={handleDeleteCustomList}
          onClearAllCustomLists={handleClearAllCustomLists}
        />
      )}

      {/* PIN Security Modal (Verification, Creation & Reset) */}
      <ChatPinModal
        isOpen={pinModalState.isOpen}
        mode={pinModalState.mode}
        chatTitle={pinModalState.chatTitle}
        onClose={() =>
          setPinModalState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        onSuccess={() => {
          if (pinModalState.onSuccessCallback) {
            pinModalState.onSuccessCallback();
          }
        }}
        onPinChanged={(_newPin) => {
          showToast('PIN mpya ya usalama imehifadhiwa kikamilifu! 🔒');
        }}
      />

      {/* Enlarged Profile Picture Preview Modal (WhatsApp Reference) */}
      <ProfilePicturePreviewModal
        isOpen={profilePicModalState.isOpen}
        onClose={() => setProfilePicModalState({ isOpen: false, conversation: null })}
        conversation={profilePicModalState.conversation}
        onOpenChat={(conv) => onSelectConversation(conv)}
        onStartCall={(_type, conv) => onSelectConversation(conv)}
        onOpenInfo={(conv) => onSelectConversation(conv)}
        onUpdateAvatar={handleUpdateAvatar}
      />

      {/* 1. Modal: Delete Single Chat Confirmation (kufuta moja) */}
      {confirmDeleteSingle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#111628] border border-rose-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Futa Mazungumzo?</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Je, una uhakika unataka kufuta mazungumzo haya na{' '}
              <strong className="text-white">
                {confirmDeleteSingle.isGroup
                  ? confirmDeleteSingle.groupName
                  : Object.values(confirmDeleteSingle.participantDetails || {})[0]?.displayName || 'Direct Chat'}
              </strong>
              ? Mazungumzo haya na jumbe zake zote zitaondolewa kabisa.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteSingle(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmDeleteSingle;
                  setConfirmDeleteSingle(null);
                  handleDeleteChat(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Futa Mazungumzo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Delete All Chats Confirmation (zote kwapamoja) */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#111628] border border-rose-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Futa Mazungumzo Yote Kwapamoja?</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Je, una uhakika unataka kufuta mazungumzo yako yote{' '}
              <span className="text-rose-400 font-bold">({conversations.length})</span>? Mazungumzo yote na jumbe zote zitaondolewa mara moja na hautakuwa na mazungumzo yoyote mpaka utakapoanza kuchat tena.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleDeleteAllChats}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Futa Yote Sasa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Delete Selected Chats Confirmation (kufuta yaliyochaguliwa kwapamoja) */}
      {confirmDeleteSelected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#111628] border border-rose-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Futa Mazungumzo {selectedConversationIds.size} Uliyochagua?
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Je, una uhakika unataka kufuta mazungumzo {selectedConversationIds.size} uliyochagua kwapamoja? Mazungumzo na jumbe zake zote zitaondolewa kabisa.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteSelected(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedConversations}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Futa ({selectedConversationIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
