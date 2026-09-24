import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCheck,
  Edit3,
  Users,
  User,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { handleFirestoreError, OperationType } from '../../services/firebase/firestoreError';
import { Conversation, UserProfile } from '../../types';
import { INITIAL_CONVERSATIONS } from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';

interface ChatListProps {
  currentUser: UserProfile;
  onSelectConversation: (conv: Conversation) => void;
  onStartNewChat: () => void;
  onOpenProfile?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  currentUser,
  onSelectConversation,
  onStartNewChat,
  onOpenProfile,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups' | 'communities'>('all');
  const [showSearchInput, setShowSearchInput] = useState(true);

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
      console.warn('Conversations listener error:', err);
    }
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const otherId = c.participants.find((p) => p !== currentUser.id) || '';
    const other = c.participantDetails?.[otherId];
    const name = c.isGroup ? c.groupName || '' : other?.displayName || 'Chat';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return (c.unreadCount || 0) > 0;
    if (activeFilter === 'groups') return c.isGroup;
    if (activeFilter === 'communities') return false;
    return true;
  });

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 relative select-none">
      {/* Search Input Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations, friends..."
            className="w-full bg-[#121626] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Filter Tabs (All, Unread, Groups, Communities) */}
      <div className="px-4 pb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'groups', label: 'Groups' },
          { id: 'communities', label: 'Communities' },
        ].map((pill) => {
          const isActive = activeFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'bg-[#121626] border border-white/[0.06] text-slate-300 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 divide-y divide-white/[0.04] pb-28">
        {filteredConversations.map((conv) => {
          const otherUserId = conv.participants.find((p) => p !== currentUser.id);
          const otherUser = otherUserId && conv.participantDetails ? conv.participantDetails[otherUserId] : null;
          const title = conv.isGroup ? conv.groupName : otherUser?.displayName || 'Direct Chat';
          const avatar = conv.isGroup
            ? conv.groupAvatar || '/assets/images/amina_avatar_1790280951312.jpg'
            : otherUser?.photoURL || '/assets/images/amina_avatar_1790280951312.jpg';
          const isOnline = otherUser?.isOnline;

          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/[0.04] active:bg-white/[0.08] transition-all text-left group"
            >
              {/* Avatar with status dot */}
              <div className="relative shrink-0">
                <SafeImage
                  src={avatar}
                  fallbackText={title}
                  fallbackGradient={conv.isGroup ? 'from-purple-800 to-indigo-900' : 'from-cyan-800 to-blue-900'}
                  alt={title || ''}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-cyan-500/40 transition-all"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#070A12]" />
                )}
                {conv.isGroup && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                    <Users className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Chat details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-semibold text-sm text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                    {title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                    {conv.updatedAt}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
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
                  {(conv.unreadCount || 0) > 0 && (
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-[10px] font-bold text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button (FAB) at bottom right */}
      <button
        onClick={onStartNewChat}
        className="fixed sm:absolute bottom-22 right-4 p-3.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all z-30"
        title="Compose new message"
      >
        <Edit3 className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
