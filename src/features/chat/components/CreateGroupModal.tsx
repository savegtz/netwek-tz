import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  Check,
  Camera,
  Sparkles,
  ArrowRight,
  Shield,
  Smile,
} from 'lucide-react';
import { Conversation, UserProfile } from '../../../types';
import { AVAILABLE_CONTACTS } from './StartNewChatModal';
import { SafeImage } from '../../../components/SafeImage';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateGroup: (newGroup: Conversation) => void;
}

const PRESET_GROUP_AVATARS = [
  {
    id: 'dt',
    name: 'Design Team',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'fam',
    name: 'Family Baraza',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop&q=80',
    color: 'from-amber-500 to-rose-500',
  },
  {
    id: 'biz',
    name: 'Biashara & Masoko',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'tech',
    name: 'Tech & Code Club',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&auto=format&fit=crop&q=80',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'food',
    name: 'Foodies & Chefs',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'music',
    name: 'Bongo Beats',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    color: 'from-pink-500 to-rose-600',
  },
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_GROUP_AVATARS[0].url);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(['user_fresh_kk']);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'info' | 'members'>('info');

  if (!isOpen) return null;

  const contactsToSelect = AVAILABLE_CONTACTS.filter(
    (c) => c.id !== currentUser.id
  ).filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;

    const selectedContacts = AVAILABLE_CONTACTS.filter((c) =>
      selectedContactIds.includes(c.id)
    );

    const participantDetails: Record<string, any> = {
      [currentUser.id]: {
        displayName: currentUser.displayName,
        username: currentUser.username,
        photoURL: currentUser.photoURL,
        isOnline: true,
      },
    };

    selectedContacts.forEach((c) => {
      participantDetails[c.id] = {
        displayName: c.displayName,
        username: c.username,
        photoURL: c.photoURL,
        isOnline: c.isOnline,
      };
    });

    const newGroup: Conversation = {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isGroup: true,
      groupName: groupName.trim(),
      groupDescription: groupDesc.trim() || 'Kikundi kipya cha Zenia',
      groupAvatar: selectedAvatarUrl,
      participants: [currentUser.id, ...selectedContactIds],
      participantDetails,
      adminIds: [currentUser.id],
      lastMessage: `${currentUser.displayName || 'Wewe'} umetengeneza kikundi hiki 🎉`,
      lastMessageType: 'text',
      lastMessageSenderId: currentUser.id,
      updatedAt: 'Sasa hivi',
      unreadCount: 0,
      createdAt: 'Sasa hivi',
      isPinned: false,
      isFavorite: false,
    };

    onCreateGroup(newGroup);
    onClose();
    setGroupName('');
    setGroupDesc('');
    setSelectedContactIds(['user_fresh_kk']);
    setStep('info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0F1426] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">New Group (Kikundi Kipya)</h3>
              <p className="text-[11px] text-cyan-300">
                {step === 'info' ? 'Taarifa za Kikundi' : 'Ongeza Washiriki'}
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

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <button
            onClick={() => setStep('info')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold text-center transition-all ${
              step === 'info'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            1. Jina & Picha
          </button>
          <button
            onClick={() => {
              if (groupName.trim()) setStep('members');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold text-center transition-all ${
              step === 'members'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            2. Washiriki ({selectedContactIds.length})
          </button>
        </div>

        {/* Step 1: Info & Avatar */}
        {step === 'info' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Avatar Preview & Chooser */}
            <div className="flex flex-col items-center justify-center gap-2.5 py-1">
              <div className="relative group">
                <SafeImage
                  src={selectedAvatarUrl}
                  alt={groupName || 'Kikundi'}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-cyan-400/50 shadow-xl"
                  fallbackGradient="from-cyan-600 to-blue-700"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Chagua Picha ya Kikundi:</span>

              {/* Avatar Presets */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 no-scrollbar">
                {PRESET_GROUP_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatarUrl(preset.url)}
                    className={`relative shrink-0 rounded-xl overflow-hidden p-0.5 border-2 transition-transform active:scale-95 ${
                      selectedAvatarUrl === preset.url
                        ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={preset.name}
                  >
                    <SafeImage
                      src={preset.url}
                      alt={preset.name}
                      className="w-9 h-9 rounded-[10px] object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Group Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Jina la Kikundi (Group Name) *</span>
                <span className="text-[10px] text-slate-400">{groupName.length}/35</span>
              </label>
              <input
                type="text"
                maxLength={35}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Mfano: Safari ya Zanzibar, Tech Titans, Familia..."
                className="w-full bg-white/[0.05] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Group Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Maelezo / Madhumuni ya Kikundi (Hiari)
              </label>
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="Andika dhumuni au sheria fupi za kikundi hiki..."
                rows={2}
                className="w-full bg-white/[0.05] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!groupName.trim()}
                onClick={() => setStep('members')}
                className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  groupName.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Endelea kwa Washiriki</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Member Selection */}
        {step === 'members' && (
          <div className="space-y-3 flex flex-col flex-1 min-h-0">
            {/* Search Box */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tafuta mshiriki..."
                className="w-full bg-white/[0.05] border border-white/10 focus:border-cyan-400 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            {/* Selected Chips */}
            <div className="text-[11px] font-semibold text-cyan-300">
              Washiriki waliochaguliwa ({selectedContactIds.length}):
            </div>

            {/* Contact list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[260px]">
              {contactsToSelect.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => toggleContact(contact.id)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-400/40 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <SafeImage
                          src={contact.photoURL}
                          alt={contact.displayName}
                          fallbackText={contact.displayName}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        {contact.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F1426]" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{contact.displayName}</p>
                        <p className="text-[10px] text-slate-400 truncate">@{contact.username}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'border border-white/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Rudi Nyuma
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!groupName.trim() || selectedContactIds.length === 0}
                className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  groupName.trim() && selectedContactIds.length > 0
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tengeneza Kikundi ({selectedContactIds.length + 1} Washiriki)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
