/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase/config';
import { UserProfile, Conversation, StatusType, StatusItem, NotificationItem, isUserAdmin } from './types';
import { INITIAL_USER, INITIAL_CONVERSATIONS, INITIAL_NOTIFICATIONS } from './services/seed/initialData';
import { MessageSquare, Plus, Sparkles, ShieldCheck, Lock } from 'lucide-react';

// Layout & Navigation Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CreateMenuModal } from './components/CreateMenuModal';

// Features
import { AuthModal } from './features/auth/AuthModal';
import { EditProfileModal } from './features/profile/EditProfileModal';
import { ChatList } from './features/chat/ChatList';
import { ChatRoom } from './features/chat/ChatRoom';
import { GroupChatRoom } from './features/chat/GroupChatRoom';
import { ChatGuestGateway } from './features/chat/ChatGuestGateway';
import { StartNewChatModal } from './features/chat/components/StartNewChatModal';
import { CreateStatusModal } from './features/status/CreateStatusModal';
import { StatusFeed } from './features/status/StatusFeed';
import { ShopMarketplace } from './features/shop/ShopMarketplace';
import { ProfileView } from './features/profile/ProfileView';
import { DiscoverView } from './features/discover/DiscoverView';
import { EventsView } from './features/events/EventsView';
import { JobsView } from './features/jobs/JobsView';
import { RideRequestView } from './features/transport/RideRequestView';
import { WalletView } from './features/payments/WalletView';
import { CommunityView } from './features/communities/CommunityView';
import { AIAssistantModal } from './features/ai/AIAssistantModal';
import { VideoCallScreen } from './features/calls/VideoCallScreen';
import { NotificationsView } from './features/notifications/NotificationsView';
import { AdminDevPanel } from './features/admin/AdminDevPanel';
import { BroadcastBanner } from './components/BroadcastBanner';
import { ZeniaMiniPlayer } from './components/ZeniaMiniPlayer';
import freshKkAvatar from './assets/images/fresh_kk_avatar_1791078365294.jpg';

export default function App() {
  // If user hasn't logged in or registered, currentUser is null (Guest mode)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('zenia_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('chats');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // User-scoped conversations: Starts completely empty until user starts chatting
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('zenia_active_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.id) {
          const userConvs = localStorage.getItem(`zenia_user_conversations_${user.id}`);
          if (userConvs) return JSON.parse(userConvs);
        }
      } catch {}
    }
    return [];
  });

  // Sync conversations with currentUser: if logged out or guest, no chats shown
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setActiveConversation(null);
    } else {
      try {
        const userConvs = localStorage.getItem(`zenia_user_conversations_${currentUser.id}`);
        setConversations(userConvs ? JSON.parse(userConvs) : []);
      } catch {
        setConversations([]);
      }
    }
  }, [currentUser?.id]);

  // Persist conversations for the current user
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(
          `zenia_user_conversations_${currentUser.id}`,
          JSON.stringify(conversations)
        );
      } catch {}
    }
  }, [conversations, currentUser?.id]);

  // Modals & Subscreens
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<{
    type: 'video' | 'voice';
    remoteName: string;
    remoteAvatar?: string;
    subtitle?: string;
    isIncoming?: boolean;
  } | null>(null);
  const [createStatusType, setCreateStatusType] = useState<StatusType | 'ai' | null>(null);
  const [customStatuses, setCustomStatuses] = useState<StatusItem[]>([]);
  const [isFrameMode, setIsFrameMode] = useState<boolean>(false); // Full-width responsive web view by default

  const handleStartCallFromConversation = (type: 'video' | 'voice') => {
    if (!activeConversation) return;
    const rName =
      (activeConversation.isGroup
        ? activeConversation.groupName
        : activeConversation?.participantDetails &&
          activeConversation.participants.find((p) => p !== activeUser.id)
        ? activeConversation.participantDetails[
            activeConversation.participants.find((p) => p !== activeUser.id)!
          ]?.displayName
        : 'Fresh kk') || 'Fresh kk';
    const rAvatar =
      (activeConversation.isGroup
        ? activeConversation.groupAvatar
        : activeConversation?.participantDetails &&
          activeConversation.participants.find((p) => p !== activeUser.id)
        ? activeConversation.participantDetails[
            activeConversation.participants.find((p) => p !== activeUser.id)!
          ]?.photoURL
        : freshKkAvatar) || freshKkAvatar;
    setActiveCallSession({
      type,
      remoteName: rName,
      remoteAvatar: rAvatar,
      subtitle: activeConversation.isGroup ? 'Kikundi cha Zenia • Simu ya Pamoja' : 'Zenia Call • E2E Encrypted',
    });
  };

  // Single admin security guard: Only the designated admin (savegamour@gmail.com) can open admin panel
  const handleOpenAdmin = () => {
    if (isUserAdmin(currentUser)) {
      setIsAdminOpen(true);
    }
  };

  // Notifications state with localStorage persistence
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`zenia_notifications_${currentUser?.id || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        `zenia_notifications_${currentUser?.id || 'guest'}`,
        JSON.stringify(notifications)
      );
    } catch {}
  }, [notifications, currentUser?.id]);

  // Safe fallback representation for read-only child components when browsing as guest
  const activeUser: UserProfile = currentUser || {
    id: 'guest',
    displayName: 'Mgeni (Guest)',
    username: 'guest',
    email: '',
    accountType: 'personal',
    verified: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isOnline: false,
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    localStorage.removeItem('zenia_active_user');
    setCurrentUser(null);
    setConversations([]);
    setActiveConversation(null);
  };

  const handleSelectUserToChat = (targetUser: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const convId = `conv_${[currentUser.id, targetUser.id].sort().join('_')}`;
    const existing = conversations.find((c) => c.id === convId);
    if (existing) {
      setActiveConversation(existing);
      setActiveTab('chats');
      return;
    }
    const newConv: Conversation = {
      id: convId,
      participants: [currentUser.id, targetUser.id],
      participantDetails: {
        [targetUser.id]: {
          displayName: targetUser.displayName,
          username: targetUser.username,
          photoURL: targetUser.photoURL,
          isOnline: true,
        },
        [currentUser.id]: {
          displayName: currentUser.displayName,
          username: currentUser.username,
          photoURL: currentUser.photoURL,
          isOnline: true,
        },
      },
      isGroup: false,
      lastMessage: 'Mazungumzo ya moja kwa moja yameanzishwa 💬',
      updatedAt: 'Sasa hivi',
      unreadCount: 0,
    };
    setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
    setActiveConversation(newConv);
    setActiveTab('chats');
  };

  // Firebase Auth sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setCurrentUser(profile);
            localStorage.setItem('zenia_active_user', JSON.stringify(profile));
          } else {
            const fallback: UserProfile = {
              id: user.uid,
              email: user.email || 'user@zenia.app',
              displayName: user.displayName || 'Mtumiaji wa Zenia',
              username: (user.displayName || 'user').toLowerCase().replace(/\s+/g, '_'),
              photoURL: user.photoURL || undefined,
              accountType: 'personal',
              verified: false,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isOnline: true,
            };
            await setDoc(doc(db, 'users', user.uid), fallback);
            setCurrentUser(fallback);
            localStorage.setItem('zenia_active_user', JSON.stringify(fallback));
          }
        } catch (e) {
          console.warn('User profile sync notice:', e);
        }
      } else {
        // If not authenticated in Firebase and no manual session, reset to null
        const manualSession = localStorage.getItem('zenia_active_user');
        if (!manualSession) {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectCreateOption = (
    type: StatusType | 'ai' | 'product_listing' | 'event_create' | 'job_create'
  ) => {
    if (!currentUser && type !== 'ai') {
      setIsAuthOpen(true);
      return;
    }
    if (type === 'ai') {
      setIsAIOpen(true);
    } else if (type === 'product_listing') {
      setActiveTab('shop');
    } else if (type === 'event_create') {
      setActiveTab('events');
    } else if (type === 'job_create') {
      setActiveTab('jobs');
    } else if (type === 'ride') {
      setActiveTab('transport');
    } else {
      setCreateStatusType(type as StatusType);
    }
  };

  const handleStartChatWithSeller = (sellerId: string, sellerName: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const convId = `conv_${sellerId}_${currentUser.id}`;
    const existing = conversations.find((c) => c.id === convId);
    if (existing) {
      setActiveConversation(existing);
      setActiveTab('chats');
      return;
    }
    const sellerConv: Conversation = {
      id: convId,
      participants: [currentUser.id, sellerId],
      participantDetails: {
        [sellerId]: {
          displayName: sellerName,
          photoURL: '/src/assets/images/wireless_earbuds_1790280984496.jpg',
          username: sellerName.toLowerCase().replace(/\s+/g, '_'),
          isOnline: true,
        },
        [currentUser.id]: {
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          username: currentUser.username,
          isOnline: true,
        },
      },
      isGroup: false,
      lastMessage: 'Habari! Bidhaa hii bado ipo? 🛍️',
      updatedAt: 'Sasa hivi',
    };
    setConversations((prev) => [sellerConv, ...prev.filter((c) => c.id !== sellerConv.id)]);
    setActiveConversation(sellerConv);
    setActiveTab('chats');
  };

  const handleStartChatWithBusiness = (
    businessId: string,
    businessName: string,
    initialMessage?: string,
    avatar?: string
  ) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const convId = `conv_${businessId}_${currentUser.id}`;
    const existing = conversations.find((c) => c.id === convId);
    if (existing) {
      setActiveConversation(existing);
      setActiveTab('chats');
      return;
    }
    const businessConv: Conversation = {
      id: convId,
      participants: [currentUser.id, businessId],
      participantDetails: {
        [businessId]: {
          displayName: businessName,
          photoURL:
            avatar ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
          username: businessName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          isOnline: true,
        },
        [currentUser.id]: {
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          username: currentUser.username,
          isOnline: true,
        },
      },
      isGroup: false,
      lastMessage: initialMessage || 'Habari! Nahitaji huduma / maelezo zaidi.',
      updatedAt: 'Sasa hivi',
    };
    setConversations((prev) => [businessConv, ...prev.filter((c) => c.id !== businessConv.id)]);
    setActiveConversation(businessConv);
    setActiveTab('chats');
  };

  return (
    <div className="h-[100dvh] w-full bg-[#06080F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* Top Application Header (Hidden inside active chat room on mobile, always visible on desktop) */}
      <div className={activeConversation && !isFrameMode ? 'hidden md:block' : 'block'}>
        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveConversation(null);
            setActiveTab(tab);
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdmin={handleOpenAdmin}
          isFrameMode={isFrameMode}
          onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        />
      </div>

      {/* Global Real-Time Broadcast Announcement Banner */}
      <BroadcastBanner onNavigate={(tab) => setActiveTab(tab)} />

      {/* Main View Area */}
      <main className="flex-1 flex items-stretch justify-center overflow-hidden p-0">
        <div
          className={`w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
            isFrameMode
              ? 'md:max-w-[430px] md:my-auto md:h-[880px] md:rounded-[36px] md:border md:border-white/10 md:shadow-2xl md:bg-[#0A0D18]'
              : 'w-full h-full bg-[#070A12]'
          }`}
        >
          {/* Active View Container */}
          <div className="relative flex-1 flex flex-col min-h-0 h-full overflow-hidden">
            {/* View: Chats (Responsive dual-pane on Web View, single-pane on mobile) */}
            {activeTab === 'chats' && (
              !currentUser ? (
                <ChatGuestGateway
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onLoginDemoAmina={() => {
                    setCurrentUser(INITIAL_USER);
                    localStorage.setItem('zenia_active_user', JSON.stringify(INITIAL_USER));
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-1 min-h-0 overflow-hidden">
                  {/* Left Pane: Chat List */}
                  <div
                    className={`${
                      activeConversation && !isFrameMode ? 'hidden md:flex' : 'flex'
                    } ${
                      isFrameMode
                        ? 'w-full'
                        : 'w-full md:w-80 lg:w-[380px] shrink-0 md:border-r md:border-white/[0.08]'
                    } flex-col h-full min-h-0 bg-[#070A12] overflow-hidden`}
                  >
                    <ChatList
                      currentUser={currentUser}
                      conversations={conversations}
                      onSetConversations={setConversations}
                      activeConversationId={activeConversation?.id}
                      onSelectConversation={(conv) => setActiveConversation(conv)}
                      onStartNewChat={() => setIsNewChatModalOpen(true)}
                      onStartNewChatWithUser={handleSelectUserToChat}
                      onOpenProfile={() => setActiveTab('profile')}
                      onOpenCreateStatus={() => setIsCreateMenuOpen(true)}
                      customStatuses={customStatuses}
                      onStartChatWithBusiness={handleStartChatWithBusiness}
                      onUpdateConversation={(updated) => {
                        setConversations((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        );
                        if (activeConversation?.id === updated.id) {
                          setActiveConversation(updated);
                        }
                      }}
                      onDeleteConversation={(deletedId) => {
                        setConversations((prev) => prev.filter((c) => c.id !== deletedId));
                        if (activeConversation?.id === deletedId) {
                          setActiveConversation(null);
                        }
                      }}
                      onDeleteAllConversations={() => {
                        setConversations([]);
                        setActiveConversation(null);
                        if (currentUser) {
                          try {
                            localStorage.removeItem(`zenia_user_conversations_${currentUser.id}`);
                          } catch (_) {}
                        }
                      }}
                    />
                  </div>

                  {/* Right Pane: Active Conversation or Desktop Empty State */}
                  {(!isFrameMode || activeConversation) && (
                    <div
                      className={`${
                        !activeConversation && !isFrameMode ? 'hidden md:flex' : 'flex'
                      } ${
                        isFrameMode ? 'w-full' : 'flex-1'
                      } flex-col h-full bg-[#080B16] overflow-hidden`}
                    >
                      {activeConversation ? (
                        activeConversation.isGroup ? (
                          <GroupChatRoom
                            conversation={activeConversation}
                            currentUser={currentUser}
                            onBack={() => setActiveConversation(null)}
                            onStartCall={handleStartCallFromConversation}
                            onUpdateConversation={(updated) => {
                              setConversations((prev) =>
                                prev.map((c) => (c.id === updated.id ? updated : c))
                              );
                              if (activeConversation?.id === updated.id) {
                                setActiveConversation(updated);
                              }
                            }}
                            onDeleteConversation={(deletedId) => {
                              setConversations((prev) => prev.filter((c) => c.id !== deletedId));
                              if (activeConversation?.id === deletedId) {
                                setActiveConversation(null);
                              }
                            }}
                          />
                        ) : (
                          <ChatRoom
                            conversation={activeConversation}
                            currentUser={currentUser}
                            onBack={() => setActiveConversation(null)}
                            onStartCall={handleStartCallFromConversation}
                            onSwitchUser={(u) => setCurrentUser(u)}
                            onUpdateConversation={(updated) => {
                              setConversations((prev) =>
                                prev.map((c) => (c.id === updated.id ? updated : c))
                              );
                              if (activeConversation?.id === updated.id) {
                                setActiveConversation(updated);
                              }
                            }}
                            onDeleteConversation={(deletedId) => {
                              setConversations((prev) => prev.filter((c) => c.id !== deletedId));
                              if (activeConversation?.id === deletedId) {
                                setActiveConversation(null);
                              }
                            }}
                          />
                        )
                      ) : (
                      /* Desktop Web Chat Welcome Placeholder */
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#080B16] via-[#090D1A] to-[#070A12]">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shadow-2xl shadow-cyan-500/10">
                            <MessageSquare className="w-10 h-10 text-cyan-400" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-xs">
                            ✓
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-2">
                          Zenia Web Messenger
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-6">
                          Chagua mazungumzo upande wa kushoto au anzisha mazungumzo mapya na marafiki, vikundi, au wauzaji wa sokoni.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => setIsCreateMenuOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Ujumbe Mpya (New Chat)</span>
                          </button>
                          <button
                            onClick={() => setIsAIOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 font-semibold text-xs transition-all flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>Zenia AI Assistant</span>
                          </button>
                        </div>
                        <div className="mt-12 flex items-center gap-2 text-xs text-slate-500">
                          <Lock className="w-3.5 h-3.5 text-cyan-400/80" />
                          <span>Mazungumzo yamelindwa na usalama wa mwisho hadi mwisho (End-to-end Encrypted)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}

            {/* View: Status Stories (Updates) */}
            {activeTab === 'status' && (
              <StatusFeed
                currentUser={activeUser}
                onOpenCreateMenu={() => setIsCreateMenuOpen(true)}
                onStartChatWithBusiness={handleStartChatWithBusiness}
                customStatuses={customStatuses}
              />
            )}

            {/* View: Shop / Marketplace */}
            {activeTab === 'shop' && (
              <ShopMarketplace
                onStartChatWithSeller={handleStartChatWithSeller}
                onOpenCreateProduct={() => setIsCreateMenuOpen(true)}
                onStartCallWithSeller={(name, avatar, type, subtitle) =>
                  setActiveCallSession({
                    type: type || 'voice',
                    remoteName: name,
                    remoteAvatar: avatar,
                    subtitle: subtitle || 'Muuzaji wa Sokoni • Zenia Call',
                  })
                }
              />
            )}

            {/* View: Profile */}
            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onOpenEditProfile={() => {
                  if (currentUser) {
                    setIsEditProfileOpen(true);
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                onOpenAdmin={handleOpenAdmin}
                onSelectService={(tab) => setActiveTab(tab)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onSignOut={handleSignOut}
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  localStorage.setItem('zenia_active_user', JSON.stringify(user));
                }}
                onOpenCreateStatus={() => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                  } else {
                    setIsCreateMenuOpen(true);
                  }
                }}
              />
            )}

            {/* View: Discover */}
            {activeTab === 'discover' && (
              <DiscoverView
                onSelectCategory={(cat) => {
                  if (cat === 'products') setActiveTab('shop');
                  else if (cat === 'communities') setActiveTab('community');
                  else if (cat === 'creators') setActiveTab('profile');
                  else setActiveTab('shop');
                }}
                onSelectTrendingItem={(id, type) => {
                  if (type === 'community') setActiveTab('community');
                  else if (type === 'jobs') setActiveTab('jobs');
                  else if (type === 'business') setActiveTab('shop');
                  else setActiveTab('chats');
                }}
                onStartChatWithUser={handleSelectUserToChat}
              />
            )}

            {/* Specialized Subviews (Directly accessible via top header or discover) */}
            {activeTab === 'events' && <EventsView onBack={() => setActiveTab('discover')} />}

            {activeTab === 'jobs' && <JobsView currentUser={activeUser} />}

            {activeTab === 'transport' && (
              <RideRequestView
                onBack={() => setActiveTab('chats')}
                onStartCall={(name, avatar, type, subtitle) =>
                  setActiveCallSession({
                    type,
                    remoteName: name,
                    remoteAvatar: avatar,
                    subtitle: subtitle || 'Dereva wa Zenia Mobility',
                  })
                }
              />
            )}

            {activeTab === 'wallet' && <WalletView onBack={() => setActiveTab('chats')} />}

            {activeTab === 'community' && (
              <CommunityView currentUser={activeUser} onBack={() => setActiveTab('discover')} />
            )}
          </div>

          {/* Bottom Navigation (Hidden on desktop in full web view, shown on mobile or phone canvas) */}
          {(!activeConversation || isFrameMode) && (
            <div className={!isFrameMode ? 'md:hidden' : 'block'}>
              <BottomNav
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveConversation(null);
                  setActiveTab(tab);
                }}
                onOpenCreateMenu={() => setIsCreateMenuOpen(true)}
                hasUnreadChats={!!currentUser && conversations.some((c) => (c.unreadCount || 0) > 0)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals & Overlays */}
      <CreateMenuModal
        isOpen={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
        onSelectOption={handleSelectCreateOption}
      />

      <CreateStatusModal
        isOpen={createStatusType !== null}
        onClose={() => setCreateStatusType(null)}
        statusType={createStatusType}
        currentUser={activeUser}
        onStatusCreated={(newStatus) => {
          setCustomStatuses((prev) => [newStatus, ...prev]);
          setActiveTab('status');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserUpdate={(updated) => {
          setCurrentUser(updated);
          if (updated) {
            localStorage.setItem('zenia_active_user', JSON.stringify(updated));
          } else {
            localStorage.removeItem('zenia_active_user');
          }
        }}
      />

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onUserUpdate={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('zenia_active_user', JSON.stringify(updated));
          }}
        />
      )}

      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* Admin Dev Panel - Strictly single admin only */}
      {isUserAdmin(currentUser) && (
        <AdminDevPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          currentUser={currentUser || activeUser}
        />
      )}

      <StartNewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        currentUser={activeUser}
        onSelectUserToChat={handleSelectUserToChat}
      />

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0A0D18] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <NotificationsView
              onBack={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onUpdateNotifications={setNotifications}
              currentUser={activeUser}
              onNavigate={(type) => {
                setIsNotificationsOpen(false);
                if (type === 'message') setActiveTab('chats');
                else if (type === 'event') setActiveTab('events');
                else if (type === 'order') setActiveTab('shop');
                else if (type === 'job') setActiveTab('jobs');
                else setActiveTab('status');
              }}
            />
          </div>
        </div>
      )}

      {/* Direct Voice & Video Call Modal */}
      {activeCallSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl">
          <VideoCallScreen
            callType={activeCallSession.type}
            remoteUserName={activeCallSession.remoteName}
            remoteUserAvatar={activeCallSession.remoteAvatar || freshKkAvatar}
            remoteUserSubtitle={activeCallSession.subtitle}
            isIncoming={activeCallSession.isIncoming}
            currentUser={activeUser}
            onEndCall={() => setActiveCallSession(null)}
          />
        </div>
      )}

      {/* Floating Zenia Beats & Podcasts Mini-Player */}
      <ZeniaMiniPlayer />
    </div>
  );
}
