import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  MapPin,
  Users,
  Briefcase,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  UserCheck,
  UserX,
  Phone,
  Video,
  Trash2,
  Heart,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { SafeImage } from '../../components/SafeImage';
import { AVAILABLE_CONTACTS } from '../chat/components/StartNewChatModal';
import { userDirectoryService } from '../../services/user/userDirectoryService';
import { userService } from '../../services/user/userService';
import { friendshipService } from '../../services/user/friendshipService';
import { UserProfile } from '../../types';

interface DiscoverViewProps {
  currentUser?: UserProfile | null;
  onSelectCategory: (category: string) => void;
  onSelectTrendingItem: (id: string, type: string) => void;
  onStartChatWithUser?: (user: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => void;
  onStartCallWithUser?: (
    type: 'video' | 'voice',
    user: {
      id: string;
      displayName: string;
      username: string;
      photoURL?: string;
    }
  ) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentUser,
  onSelectCategory,
  onSelectTrendingItem,
  onStartChatWithUser,
  onStartCallWithUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'people' | 'trending' | 'nearby'>('people');
  const [peopleFilter, setPeopleFilter] = useState<'all' | 'friends' | 'requests'>('all');
  const [, setRefreshTick] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [directoryUsers, setDirectoryUsers] = useState<UserProfile[]>(() =>
    userDirectoryService.getAllUsers()
  );

  const effectiveCurrentUserId = currentUser?.id || 'current_user_id';

  useEffect(() => {
    const unsubDir = userDirectoryService.subscribe((users) => {
      setDirectoryUsers(users);
    });
    const unsubUser = userService.subscribe(() => {
      setRefreshTick((t) => t + 1);
    });
    const unsubFriendship = friendshipService.subscribe(() => {
      setRefreshTick((t) => t + 1);
    });
    return () => {
      unsubDir();
      unsubUser();
      unsubFriendship();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const pendingReceived = friendshipService.getPendingRequestsReceived(effectiveCurrentUserId);
  const friendsList = friendshipService.getFriendsList(effectiveCurrentUserId);

  const categories = [
    { id: 'creators', title: 'Creators', count: '14.2K Active', icon: Users, gradient: 'from-rose-500/25 to-pink-600/30 border-rose-500/40 text-rose-400' },
    { id: 'businesses', title: 'Businesses', count: '8.9K Verified', icon: Briefcase, gradient: 'from-amber-500/25 to-orange-600/30 border-amber-500/40 text-amber-400' },
    { id: 'communities', title: 'Communities', count: '3.4K Hubs', icon: Zap, gradient: 'from-cyan-500/25 to-blue-600/30 border-cyan-500/40 text-cyan-400' },
    { id: 'products', title: 'Products', count: '45K Items', icon: ShoppingBag, gradient: 'from-emerald-500/25 to-teal-600/30 border-emerald-500/40 text-emerald-400' },
  ];

  const trendingItems = [
    {
      id: 'tech_world',
      title: 'Tech World',
      subtitle: 'Community • 125K members',
      type: 'community',
      icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100',
    },
    {
      id: 'local_food',
      title: 'Local Food',
      subtitle: 'Business • 45K followers',
      type: 'business',
      icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100',
    },
    {
      id: 'job_opportunities',
      title: 'Job Opportunities',
      subtitle: 'Jobs • 32K following',
      type: 'jobs',
      icon: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    },
    {
      id: 'travel_adventure',
      title: 'Travel & Adventure',
      subtitle: 'Community • 78K members',
      type: 'community',
      icon: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100',
    },
  ];

  // Filter people list based on active subfilter and search query
  const allActivePeople = directoryUsers.filter(
    (p) => !userService.isUserDeleted(p) && p.id !== effectiveCurrentUserId
  );

  const filteredPeople = allActivePeople.filter((p) => {
    // 1. Subfilter condition
    const relStatus = friendshipService.getFriendshipStatus(effectiveCurrentUserId, p.id);
    if (peopleFilter === 'friends' && relStatus !== 'friends') {
      return false;
    }
    if (peopleFilter === 'requests' && relStatus !== 'pending_received') {
      return false;
    }

    // 2. Search condition
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.displayName || '').toLowerCase().includes(q) ||
      (p.username || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.bio || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 md:pb-12 select-none overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sticky top-2 z-50 mx-4 p-3 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-400/50 rounded-2xl shadow-2xl text-xs text-cyan-200 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-cyan-400 hover:text-white font-bold ml-2 p-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        {/* Search Bar */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta watu (@username), marafiki, au kurasa..."
              className="w-full bg-[#161B2E] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Filter Chips: People, Trending, Nearby */}
          <div className="flex items-center gap-2 mt-3">
            {[
              { id: 'people', label: 'Watu & Marafiki (People)', icon: Users },
              { id: 'trending', label: 'Trending', icon: Zap },
              { id: 'nearby', label: 'Nearby', icon: MapPin },
            ].map((chip) => {
              const Icon = chip.icon;
              const isSelected = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveChip(chip.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Category Tiles (Creators, Businesses, Communities, Products) */}
        <div className="px-4 py-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-3 rounded-2xl bg-gradient-to-br ${cat.gradient} border flex items-center justify-between text-left transition-all hover:scale-[1.02] active:scale-95 group shadow-sm`}
              >
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-cyan-200">
                    {cat.title}
                  </h4>
                  <p className="text-[10px] text-slate-300 font-medium">{cat.count}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* People Directory with Friendship Controls */}
        {activeChip === 'people' && (
          <div className="p-4 flex flex-col gap-3">
            {/* Friendship Header & Subtabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Mtandao wa Marafiki (Friendship & Follow System)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Omba urafiki ili muanze kuchat, kupigiana simu, na kuona status za kila siku.
                </p>
              </div>

              {/* Subtabs: All, Friends, Requests Received */}
              <div className="flex items-center gap-1.5 bg-[#12172A] p-1 rounded-2xl border border-white/5 self-start sm:self-auto">
                <button
                  onClick={() => setPeopleFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    peopleFilter === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Wote ({allActivePeople.length})
                </button>

                <button
                  onClick={() => setPeopleFilter('friends')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    peopleFilter === 'friends'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Marafiki</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-300 font-bold">
                    {friendsList.length}
                  </span>
                </button>

                <button
                  onClick={() => setPeopleFilter('requests')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
                    peopleFilter === 'requests'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Maombi</span>
                  {pendingReceived.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                      {pendingReceived.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Empty States */}
            {filteredPeople.length === 0 && (
              <div className="p-8 text-center bg-[#0D1222] border border-white/5 rounded-3xl flex flex-col items-center justify-center my-4">
                <Users className="w-10 h-10 text-slate-500 mb-2 opacity-50" />
                <h5 className="font-bold text-sm text-white">
                  {peopleFilter === 'friends'
                    ? 'Bado huna marafiki walioidhinishwa'
                    : peopleFilter === 'requests'
                    ? 'Huna ombi la urafiki lililosubiri'
                    : 'Hakuna watu waliopatikana'}
                </h5>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {peopleFilter === 'friends'
                    ? 'Bofya "Wote" na umtumie mtu ombi la urafiki ili muanze kuchat na kupigiana simu.'
                    : 'Tumia orodha ya "Wote" kuomba urafiki na marafiki wapya.'}
                </p>
                {peopleFilter !== 'all' && (
                  <button
                    onClick={() => setPeopleFilter('all')}
                    className="mt-3 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                  >
                    Tazama Watu Wote
                  </button>
                )}
              </div>
            )}

            {/* People Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPeople.map((person) => {
                const relStatus = friendshipService.getFriendshipStatus(
                  effectiveCurrentUserId,
                  person.id
                );
                const isFriend = relStatus === 'friends';
                const isPendingSent = relStatus === 'pending_sent';
                const isPendingReceived = relStatus === 'pending_received';

                return (
                  <div
                    key={person.id}
                    className={`p-4 rounded-3xl border flex flex-col justify-between transition-all group shadow-sm ${
                      isFriend
                        ? 'bg-gradient-to-b from-[#0F172E] to-[#0A0E1F] border-cyan-500/30 ring-1 ring-cyan-500/20'
                        : isPendingReceived
                        ? 'bg-gradient-to-b from-[#181A32] to-[#0D1022] border-indigo-500/40'
                        : 'bg-[#0E1324] border-white/5 hover:border-cyan-500/25'
                    }`}
                  >
                    <div>
                      {/* Top Row: Avatar & Status Pill */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative shrink-0">
                          <SafeImage
                            src={person.photoURL}
                            fallbackText={person.displayName}
                            fallbackGradient="from-cyan-800 to-indigo-900"
                            alt={person.displayName}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-cyan-400"
                          />
                          {person.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0E1324]" />
                          )}
                        </div>

                        {/* Relationship Pill */}
                        <div className="shrink-0">
                          {isFriend ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Marafiki (Friends)</span>
                            </span>
                          ) : isPendingSent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Ombi Limetumwa</span>
                            </span>
                          ) : isPendingReceived ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold animate-pulse">
                              <Heart className="w-3 h-3 text-blue-400 fill-blue-400" />
                              <span>Amekuomba Urafiki!</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px] font-medium border border-white/5">
                              <span>Si Rafiki Bado</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mt-3">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-sm text-white group-hover:text-cyan-300 truncate">
                            {person.displayName}
                          </h5>
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-400/20" />
                        </div>
                        <p className="text-[11px] text-cyan-400/80 font-mono truncate">
                          @{person.username}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {person.bio}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions based on Friendship State */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                      {/* State 1: Mutual Friends -> Chat & Call Buttons */}
                      {isFriend ? (
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-1">
                            <button
                              onClick={() => {
                                if (onStartChatWithUser) {
                                  onStartChatWithUser(person);
                                }
                              }}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                              title="Anza kuchati na rafiki huyu"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onStartCallWithUser) {
                                  onStartCallWithUser('voice', person);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-400/30 transition-all active:scale-95"
                              title="Piga simu ya sauti"
                            >
                              <Phone className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (onStartCallWithUser) {
                                  onStartCallWithUser('video', person);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 border border-purple-400/30 transition-all active:scale-95"
                              title="Piga simu ya video"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              friendshipService.unfriend(effectiveCurrentUserId, person.id);
                              showToast(`Umesitisha urafiki na ${person.displayName}.`);
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-white/5 transition-all active:scale-90"
                            title="Ondoa Urafiki (Unfriend)"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isPendingReceived ? (
                        /* State 2: Received Friend Request -> Accept / Decline */
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              friendshipService.acceptFriendRequest(
                                effectiveCurrentUserId,
                                person.id
                              );
                              showToast(`Umethibitisha urafiki na ${person.displayName}! Sasa mnaweza kuchat na kupigiana simu.`);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Kubali Urafiki</span>
                          </button>

                          <button
                            onClick={() => {
                              friendshipService.declineFriendRequest(
                                effectiveCurrentUserId,
                                person.id
                              );
                              showToast(`Ombi la ${person.displayName} limekataliwa.`);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-semibold active:scale-95 transition-all"
                          >
                            <span>Kataa</span>
                          </button>
                        </div>
                      ) : isPendingSent ? (
                        /* State 3: Sent Request -> Pending cancel option */
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Inasubiri jibu...</span>
                          </span>

                          <button
                            onClick={() => {
                              friendshipService.cancelFriendRequest(
                                effectiveCurrentUserId,
                                person.id
                              );
                              showToast(`Umeghairi ombi la urafiki kwa ${person.displayName}.`);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
                          >
                            Ghairi Ombi
                          </button>
                        </div>
                      ) : (
                        /* State 4: Not Friends -> Send Friend Request (Follow) */
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              const me = currentUser || {
                                id: effectiveCurrentUserId,
                                displayName: 'Amina Kaunga',
                                username: 'amina_kaunga',
                                photoURL: '/assets/images/amina_avatar_1790280951312.jpg',
                              };
                              friendshipService.sendFriendRequest(me as any, person);
                              showToast(`Ombi la urafiki limetumwa kwa ${person.displayName}! Atakapokubali mtaanza kuchati na kupigiana simu.`);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Omba Urafiki (Follow)</span>
                          </button>

                          {/* Delete Contact Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Una uhakika unataka kumfuta kabisa @${person.username} (${person.displayName}) kwenye mfumo?`)) {
                                userService.deleteUser(person.id, person.username, person.displayName);
                                showToast(`Mtumiaji @${person.username} amefutwa kabisa.`);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all active:scale-90"
                            title={`Futa mtumiaji huyu kabisa`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: TRENDING COMMUNITIES & BUSINESSES */}
        {activeChip !== 'people' && (
          <>
            <div className="px-4 pt-2 flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Trending Communities & Hubs
              </h4>
              <button className="text-xs text-cyan-400 hover:underline font-medium">
                See All
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTrendingItem(item.id, item.type)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#14192B] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={item.icon}
                      fallbackText={item.title}
                      fallbackGradient="from-indigo-900 to-purple-950"
                      alt={item.title}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-white group-hover:text-cyan-300">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
