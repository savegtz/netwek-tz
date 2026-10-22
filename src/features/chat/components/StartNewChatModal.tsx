import React, { useState, useEffect } from 'react';
import { X, Search, MessageSquare, Trash2, AlertTriangle, Check, UserPlus, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import { UserProfile } from '../../../types';
import { SafeImage } from '../../../components/SafeImage';
import { userService } from '../../../services/user/userService';
import { friendshipService } from '../../../services/user/friendshipService';
import { userDirectoryService, FIREBASE_AUTH_USERS_SEEDS } from '../../../services/user/userDirectoryService';
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

// Export dynamic AVAILABLE_CONTACTS backed by real Firebase/Firestore user directory
export const AVAILABLE_CONTACTS: UserProfile[] = FIREBASE_AUTH_USERS_SEEDS;

export const StartNewChatModal: React.FC<StartNewChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUserToChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<UserProfile[]>(() =>
    userDirectoryService.getAllUsers()
  );
  const [confirmDeleteContact, setConfirmDeleteContact] = useState<UserProfile | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    const unsubDir = userDirectoryService.subscribe((users) => {
      setDirectoryUsers(users);
    });
    const unsubUser = userService.subscribe(() => {
      setRefreshTick((t) => t + 1);
    });
    return () => {
      unsubDir();
      unsubUser();
    };
  }, []);

  if (!isOpen) return null;

  // Filter out current user and deleted users across the application
  const contactsToDisplay = searchQuery.trim()
    ? userDirectoryService.searchUsers(searchQuery, currentUser?.id)
    : directoryUsers.filter(
        (c) => c.id !== currentUser?.id && !userService.isUserDeleted(c)
      );

  const handleDeleteContact = (contact: UserProfile) => {
    userService.deleteUser(contact.id, contact.username, contact.displayName);
    setConfirmDeleteContact(null);
    setDeleteToast(`Mawasiliano na @${contact.username} (${contact.displayName}) yamefutwa kabisa!`);
    setTimeout(() => setDeleteToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0F1426] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 relative">
        {/* Toast Alert */}
        {deleteToast && (
          <div className="absolute top-3 left-4 right-4 z-50 bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs px-3 py-2 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{deleteToast}</span>
            </div>
            <button onClick={() => setDeleteToast(null)} className="text-rose-400 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Anza Mazungumzo Mapya</h3>
              <p className="text-[11px] text-cyan-300">Chagua mtu wa kuchati naye au kumfuta</p>
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
          {contactsToDisplay.map((contact) => {
            const relStatus = friendshipService.getFriendshipStatus(currentUser.id, contact.id);
            const isFriend = relStatus === 'friends';
            const isPendingReceived = relStatus === 'pending_received';
            const isPendingSent = relStatus === 'pending_sent';

            return (
              <div
                key={contact.id}
                className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between text-left transition-all group"
              >
                <div
                  onClick={() => {
                    if (isFriend) {
                      onSelectUserToChat(contact);
                      onClose();
                    } else if (isPendingReceived) {
                      friendshipService.acceptFriendRequest(currentUser.id, contact.id);
                      onSelectUserToChat(contact);
                      onClose();
                    } else if (isPendingSent) {
                      setDeleteToast(`Umemtumia ombi la urafiki @${contact.username}. Subiri akubali kabla hamjaanza kuchat.`);
                    } else {
                      friendshipService.sendFriendRequest(currentUser, contact);
                      setDeleteToast(`Ombi la urafiki limetumwa kwa ${contact.displayName}!`);
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
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
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 truncate">
                        {contact.displayName}
                      </h4>
                      {isFriend ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400 font-medium">
                          {isPendingReceived ? 'Amekuomba' : isPendingSent ? 'Ombi limetumwa' : 'Si Rafiki'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-400/80 font-mono truncate">
                      @{contact.username} {contact.email ? `• ${contact.email}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{contact.bio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isFriend ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectUserToChat(contact);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs hover:bg-cyan-500 hover:text-slate-950 transition-all shrink-0 active:scale-95"
                    >
                      Tuma Ujumbe
                    </button>
                  ) : isPendingReceived ? (
                    <button
                      type="button"
                      onClick={() => {
                        friendshipService.acceptFriendRequest(currentUser.id, contact.id);
                        onSelectUserToChat(contact);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                      title="Kubali urafiki na anza kuchat"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Kubali</span>
                    </button>
                  ) : isPendingSent ? (
                    <span className="text-[10px] px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-medium border border-amber-400/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Inasubiri</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        friendshipService.sendFriendRequest(currentUser, contact);
                        setDeleteToast(`Ombi la urafiki limetumwa kwa ${contact.displayName}!`);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/30 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                      title="Omba urafiki ili muanze kuchat"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Omba Urafiki</span>
                    </button>
                  )}

                  {/* Permanent Delete Contact Button (Futa Mawasiliano) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteContact(contact);
                    }}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all active:scale-90"
                    title={`Futa mawasiliano na ${contact.displayName} kabisa`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {contactsToDisplay.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Hakuna mtumiaji aliyepatikana kwa jina hilo au wote wamefutwa.
            </div>
          )}
        </div>

        {/* Delete Contact Confirmation Modal */}
        {confirmDeleteContact && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#111628] border border-rose-500/40 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Futa Mawasiliano Kabisa?</h3>
              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                Una uhakika unataka kumfuta kabisa mtumiaji{' '}
                <strong className="text-white font-bold">{confirmDeleteContact.displayName}</strong>{' '}
                (<span className="text-cyan-400 font-mono">@{confirmDeleteContact.username}</span>)?
                Hataonekana tena kwenye orodha ya mawasiliano, utafutaji, wala mazungumzo mapya.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteContact(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteContact(confirmDeleteContact)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ndio, Mfute Kabisa</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
