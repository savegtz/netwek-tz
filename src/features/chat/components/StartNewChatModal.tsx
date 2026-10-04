import React, { useState } from 'react';
import { X, Search, MessageSquare, Check, UserPlus, Sparkles } from 'lucide-react';
import { Conversation, UserProfile } from '../../../types';
import { SafeImage } from '../../../components/SafeImage';
import freshKkAvatar from '../../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface StartNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUserToChat: (targetUser: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => void;
}

export const AVAILABLE_CONTACTS = [
  {
    id: 'user_fresh_kk',
    displayName: 'Fresh kk',
    username: 'fresh_kk',
    photoURL: freshKkAvatar,
    bio: 'Muuzaji wa Vifaa vya Kielektroniki | Kariakoo',
    isOnline: true,
  },
  {
    id: 'user_sarah_m',
    displayName: 'Sarah Mwangi',
    username: 'sarah_m',
    photoURL: '/assets/images/sarah_avatar_1790802224123.jpg',
    bio: 'Mjasiriamali & Mbunifu wa Mitindo | Dar',
    isOnline: true,
  },
  {
    id: 'user_alex_k',
    displayName: 'Alex Kanyama',
    username: 'alex_k',
    photoURL: '/assets/images/alex_avatar_1790802235334.jpg',
    bio: 'Mhandisi wa Programu & Tech Enthusiast',
    isOnline: false,
  },
  {
    id: 'user_amina_kaunga',
    displayName: 'Amina Kaunga',
    username: 'amina_kaunga',
    photoURL: '/assets/images/amina_avatar_1790280951312.jpg',
    bio: 'Content Creator & Brand Ambassador',
    isOnline: true,
  },
  {
    id: 'user_juma_rashid',
    displayName: 'Juma Rashid',
    username: 'juma_r',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Dereva wa Zenia Ride & Courier',
    isOnline: true,
  },
];

export const StartNewChatModal: React.FC<StartNewChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUserToChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const contactsToDisplay = AVAILABLE_CONTACTS.filter((c) => c.id !== currentUser.id).filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0F1426] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Anza Mazungumzo Mapya</h3>
              <p className="text-[11px] text-cyan-300">Chagua mtu unayetaka kumtumia ujumbe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta kwa jina au @username..."
            className="w-full bg-[#171F36] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1">
          {contactsToDisplay.map((contact) => (
            <button
              key={contact.id}
              onClick={() => {
                onSelectUserToChat(contact);
                onClose();
              }}
              className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <SafeImage
                    src={contact.photoURL}
                    fallbackText={contact.displayName}
                    fallbackGradient="from-cyan-800 to-indigo-900"
                    alt={contact.displayName}
                    className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/10 group-hover:ring-cyan-400 transition-all"
                  />
                  {contact.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0F1426]" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 truncate">
                    {contact.displayName}
                  </h4>
                  <p className="text-[11px] text-cyan-400/80 font-mono truncate">
                    @{contact.username}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{contact.bio}</p>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shrink-0 ml-2">
                Tuma Ujumbe
              </span>
            </button>
          ))}

          {contactsToDisplay.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Hakuna mtumiaji aliyepatikana kwa jina hilo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
