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
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true); // Clean smartphone preview vs responsive full-width

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
      {/* Top Application Header (Hidden inside active chat room for immersive full screen) */}
      {!activeConversation && (
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
      )}

      {/* Main View Area */}
      <main className="flex-1 flex items-stretch justify-center overflow-hidden p-0 md:p-3">
        <div
          className={`w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
            isFrameMode
              ? 'md:max-w-[430px] md:rounded-[32px] md:border md:border-white/10 md:shadow-2xl md:bg-[#0A0D18]'
              : 'md:max-w-5xl md:rounded-2xl md:border md:border-white/10 md:shadow-xl md:bg-[#0A0D18]'
          } bg-[#070A12]`}
        >
          {/* Active View Container */}
          <div className="relative flex-1 flex flex-col overflow-y-auto overscroll-contain">
            {/* View: Chats */}
            {activeTab === 'chats' && (
              <>
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
                  <ChatList
                    currentUser={currentUser}
                    onSelectConversation={(conv) => setActiveConversation(conv)}
                    onStartNewChat={() => setIsCreateMenuOpen(true)}
                    onOpenProfile={() => setActiveTab('profile')}
                  />
                )}
              </>
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

          {/* Bottom Navigation (Hidden when chatting inside room to give maximum message space) */}
          {!activeConversation && (
            <BottomNav
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveConversation(null);
                setActiveTab(tab);
              }}
              onOpenCreateMenu={() => setIsCreateMenuOpen(true)}
            />
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
