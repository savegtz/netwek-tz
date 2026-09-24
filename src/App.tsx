/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase/config';
import { UserProfile, Conversation, StatusType } from './types';
import { INITIAL_USER, INITIAL_CONVERSATIONS } from './services/seed/initialData';
import { MessageSquare, Plus, Sparkles, ShieldCheck, Lock } from 'lucide-react';

// Layout & Navigation Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CreateMenuModal } from './components/CreateMenuModal';

// Features
import { AuthModal } from './features/auth/AuthModal';
import { ChatList } from './features/chat/ChatList';
import { ChatRoom } from './features/chat/ChatRoom';
import { GroupChatRoom } from './features/chat/GroupChatRoom';
import { StatusFeed } from './features/status/StatusFeed';
import { CreateStatusModal } from './features/status/CreateStatusModal';
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<string>('chats');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Modals & Subscreens
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'video' | 'voice' | null>(null);
  const [createStatusType, setCreateStatusType] = useState<StatusType | 'ai' | null>(null);
  const [isFrameMode, setIsFrameMode] = useState<boolean>(false); // Full-width responsive web view by default

  // Firebase Auth sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as UserProfile);
          } else {
            const fallback: UserProfile = {
              id: user.uid,
              email: user.email || 'user@zenia.app',
              displayName: user.displayName || 'Zenia User',
              username: (user.displayName || 'user').toLowerCase().replace(/\s+/g, '_'),
              photoURL: user.photoURL || '/src/assets/images/amina_avatar_1790280951312.jpg',
              accountType: 'personal',
              verified: false,
              followersCount: 1,
              followingCount: 0,
              postsCount: 0,
              isOnline: true,
            };
            await setDoc(doc(db, 'users', user.uid), fallback);
            setCurrentUser(fallback);
          }
        } catch (e) {
          console.warn('User profile sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectCreateOption = (
    type: StatusType | 'ai' | 'product_listing' | 'event_create' | 'job_create'
  ) => {
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
    const sellerConv: Conversation = {
      id: `conv_${sellerId}`,
      participants: [currentUser.id, sellerId],
      participantDetails: {
        [sellerId]: {
          displayName: sellerName,
          photoURL: '/src/assets/images/wireless_earbuds_1790280984496.jpg',
          username: sellerName.toLowerCase().replace(/\s+/g, '_'),
          isOnline: true,
        },
      },
      isGroup: false,
      lastMessage: 'Hi! Is this item still available?',
      updatedAt: 'Just now',
    };
    setActiveConversation(sellerConv);
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
          onOpenAdmin={() => setIsAdminOpen(true)}
          isFrameMode={isFrameMode}
          onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
          unreadNotificationsCount={2}
        />
      </div>

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
          <div className="relative flex-1 flex flex-col overflow-y-auto overscroll-contain">
            {/* View: Chats (Responsive dual-pane on Web View, single-pane on mobile) */}
            {activeTab === 'chats' && (
              <div className="w-full h-full flex flex-1 overflow-hidden">
                {/* Left Pane: Chat List */}
                <div
                  className={`${
                    activeConversation && !isFrameMode ? 'hidden md:flex' : 'flex'
                  } ${
                    isFrameMode
                      ? 'w-full'
                      : 'w-full md:w-80 lg:w-[380px] shrink-0 md:border-r md:border-white/[0.08]'
                  } flex-col h-full bg-[#070A12] overflow-hidden`}
                >
                  <ChatList
                    currentUser={currentUser}
                    activeConversationId={activeConversation?.id}
                    onSelectConversation={(conv) => setActiveConversation(conv)}
                    onStartNewChat={() => setIsCreateMenuOpen(true)}
                    onOpenProfile={() => setActiveTab('profile')}
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
                          onStartCall={(type) => setActiveCallType(type)}
                        />
                      ) : (
                        <ChatRoom
                          conversation={activeConversation}
                          currentUser={currentUser}
                          onBack={() => setActiveConversation(null)}
                          onStartCall={(type) => setActiveCallType(type)}
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
            )}

            {/* View: Status Stories */}
            {activeTab === 'status' && (
              <StatusFeed
                currentUser={currentUser}
                onOpenCreateMenu={() => setIsCreateMenuOpen(true)}
                onViewProduct={() => setActiveTab('shop')}
                onViewEvent={() => setActiveTab('events')}
              />
            )}

            {/* View: Shop / Marketplace */}
            {activeTab === 'shop' && (
              <ShopMarketplace
                onStartChatWithSeller={handleStartChatWithSeller}
                onOpenCreateProduct={() => setIsCreateMenuOpen(true)}
              />
            )}

            {/* View: Profile */}
            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onOpenEditProfile={() => setIsAuthOpen(true)}
                onOpenAdmin={() => setIsAdminOpen(true)}
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
              />
            )}

            {/* Specialized Subviews (Directly accessible via top header or discover) */}
            {activeTab === 'events' && <EventsView onBack={() => setActiveTab('discover')} />}

            {activeTab === 'jobs' && <JobsView currentUser={currentUser} />}

            {activeTab === 'transport' && <RideRequestView onBack={() => setActiveTab('chats')} />}

            {activeTab === 'wallet' && <WalletView onBack={() => setActiveTab('chats')} />}

            {activeTab === 'community' && (
              <CommunityView currentUser={currentUser} onBack={() => setActiveTab('discover')} />
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
        currentUser={currentUser}
        onStatusCreated={() => {
          setActiveTab('status');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserUpdate={(updated) => setCurrentUser(updated)}
      />

      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <AdminDevPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
      />

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0A0D18] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <NotificationsView
              onBack={() => setIsNotificationsOpen(false)}
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

      {/* Fullscreen Video Call Screen */}
      {activeCallType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <VideoCallScreen
            remoteUserName="Sarah Mwangi"
            remoteUserAvatar="/src/assets/images/amina_avatar_1790280951312.jpg"
            currentUser={currentUser}
            onEndCall={() => setActiveCallType(null)}
          />
        </div>
      )}
    </div>
  );
}
