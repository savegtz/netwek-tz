/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase/config';
import { UserProfile, Conversation, StatusType, StatusItem, NotificationItem, isUserAdmin, ChatMessage } from './types';
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
import { StartNewChatModal } from './features/chat/components/StartNewChatModal';
import { AppLockScreen } from './features/chat/components/AppLockScreen';
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
import { FloatingCallBubble } from './features/calls/FloatingCallBubble';
import { IncomingCallNotification } from './features/calls/IncomingCallNotification';
import { webrtcService, WebRTCCallData } from './services/calls/webrtcService';
import { ChatSyncService } from './services/chat/chatSyncService';
import { NotificationsView } from './features/notifications/NotificationsView';
import { AdminDevPanel } from './features/admin/AdminDevPanel';
import { BroadcastBanner } from './components/BroadcastBanner';
import { userService } from './services/user/userService';
import { friendshipService, normalizeUserId, matchesUser } from './services/user/friendshipService';
import { presenceService, isUserOnline } from './services/user/presenceService';
import { ZeniaMiniPlayer } from './components/ZeniaMiniPlayer';
import { NotificationHeadsUpBanner } from './components/NotificationHeadsUpBanner';
import { pushNotificationService } from './services/notifications/pushNotificationService';
import { isDemoModeActive, userDirectoryService } from './services/user/userDirectoryService';
import freshKkAvatar from './assets/images/fresh_kk_avatar_1791078365294.jpg';

export default function App() {
  // Default to INITIAL_USER (Amina Kaunga) so profile and story avatars are immediately accessible and active
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('zenia_active_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id === 'user_fresh_kk') {
          return INITIAL_USER;
        }
        return u;
      } catch {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

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

  const [activeTab, setActiveTab] = useState<string>('chats');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Helper to purge any conversations with deleted users
  const filterDeletedConversations = (convList: Conversation[]) => {
    if (!Array.isArray(convList)) return [];
    return convList.filter((c) => {
      if (!c) return false;
      if (c.isGroup) return true;
      const participants = Array.isArray(c.participants) ? c.participants : [];
      const hasDeleted = participants.some((p) => userService.isIdentifierDeleted(p));
      return !hasDeleted;
    });
  };

  // User-scoped conversations: In clean mode, starts clean (empty); in demo mode, loads demo conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('zenia_active_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.id) {
          const userConvs = localStorage.getItem(`zenia_user_conversations_${user.id}`);
          if (userConvs) return filterDeletedConversations(JSON.parse(userConvs));
        }
      } catch {}
    }
    return isDemoModeActive() ? filterDeletedConversations(INITIAL_CONVERSATIONS) : [];
  });

  // Listen to global user deletion events
  useEffect(() => {
    const unsub = userService.subscribe(() => {
      setConversations((prev) => filterDeletedConversations(prev));
      setActiveConversation((curr) => {
        if (curr && !curr.isGroup && curr.participants?.some((p) => userService.isIdentifierDeleted(p))) {
          return null;
        }
        return curr;
      });
    });
    return unsub;
  }, []);

  // Sync conversations with currentUser
  useEffect(() => {
    if (!currentUser) {
      setConversations(isDemoModeActive() ? filterDeletedConversations(INITIAL_CONVERSATIONS) : []);
    } else {
      try {
        const userConvs = localStorage.getItem(`zenia_user_conversations_${currentUser.id}`);
        if (userConvs) {
          setConversations(filterDeletedConversations(JSON.parse(userConvs)));
        } else {
          const normCurrent = normalizeUserId(currentUser.id);
          const relevant = INITIAL_CONVERSATIONS.filter((c) =>
            Array.isArray(c?.participants) &&
            c.participants.some(
              (p) => p === currentUser.id || normalizeUserId(p) === normCurrent
            )
          );
          const fallback =
            relevant.length > 0
              ? relevant
              : currentUser.id === INITIAL_USER.id && isDemoModeActive()
              ? INITIAL_CONVERSATIONS
              : [];
          setConversations(filterDeletedConversations(fallback));
        }
      } catch {
        setConversations(
          currentUser.id === INITIAL_USER.id && isDemoModeActive()
            ? filterDeletedConversations(INITIAL_CONVERSATIONS)
            : []
        );
      }
    }
  }, [currentUser?.id]);

  // Live real-time listener for conversation updates across Firestore, browser tabs, and user switches
  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest_user') return;

    // 1. Subscribe to Firestore real-time conversations for this user
    const unsubFirestore = ChatSyncService.subscribeUserConversations(
      currentUser.id,
      currentUser.email,
      (remoteConvs) => {
        setConversations(filterDeletedConversations(remoteConvs));
      }
    );

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === `zenia_user_conversations_${currentUser.id}` && e.newValue) {
        try {
          setConversations(filterDeletedConversations(JSON.parse(e.newValue)));
        } catch (_) {}
      }
    };
    const handleCustomUpdate = () => {
      try {
        const userConvs = localStorage.getItem(`zenia_user_conversations_${currentUser.id}`);
        if (userConvs) {
          setConversations(filterDeletedConversations(JSON.parse(userConvs)));
        }
      } catch (_) {}
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('zenia_conversations_updated', handleCustomUpdate);
    return () => {
      unsubFirestore();
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('zenia_conversations_updated', handleCustomUpdate);
    };
  }, [currentUser?.id, currentUser?.email]);

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

  // Active presence heartbeat manager: Emits pulse every 45s while user is active
  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'guest') {
      presenceService.startHeartbeat(currentUser.id);
      return () => {
        presenceService.stopHeartbeat(currentUser.id);
      };
    }
  }, [currentUser?.id]);

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
    callId?: string;
    remoteUserId?: string;
    remoteName: string;
    remoteAvatar?: string;
    subtitle?: string;
    isIncoming?: boolean;
    incomingCallData?: WebRTCCallData;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<WebRTCCallData | null>(null);
  const [isCallMinimized, setIsCallMinimized] = useState<boolean>(false);
  const [minimizedCallMuted, setMinimizedCallMuted] = useState<boolean>(false);
  const [minimizedCallSeconds, setMinimizedCallSeconds] = useState<number>(0);

  // Timer for minimized floating call duration
  useEffect(() => {
    if (!activeCallSession) {
      setMinimizedCallSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setMinimizedCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCallSession]);

  // Subscribe to real-time incoming WebRTC calls via Firestore and BroadcastChannel
  useEffect(() => {
    if (!activeUser || !activeUser.id) return;
    const unsubscribe = webrtcService.subscribeIncomingCalls(
      activeUser,
      (callData) => {
        // Ignore if we are the caller or already on an active call
        if (callData.callerId === activeUser.id) return;
        if (activeCallSession) return;
        setIncomingCall(callData);
      },
      activeUser.email
    );
    return () => unsubscribe();
  }, [activeUser.id, activeUser.email, activeCallSession]);
  const [createStatusType, setCreateStatusType] = useState<StatusType | 'ai' | null>(null);
  const [customStatuses, setCustomStatuses] = useState<StatusItem[]>([]);
  const [isFrameMode, setIsFrameMode] = useState<boolean>(false); // Full-width responsive web view by default
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signup');
  const [appToast, setAppToast] = useState<string | null>(null);

  useEffect(() => {
    if (!appToast) return;
    const timer = setTimeout(() => setAppToast(null), 3800);
    return () => clearTimeout(timer);
  }, [appToast]);

  // Listen to interactive Push Notification action clicks (Jibu, Angalia, Kubali, Kataa)
  useEffect(() => {
    const unsub = pushNotificationService.onAction((action, payload) => {
      if (action === 'reply_sent' && payload.data?.replyText) {
        setAppToast(`Jibu limetumwa kwa ${payload.data.sender || 'mtumiaji'}: "${payload.data.replyText}"`);
      } else if (action === 'view') {
        if (payload.tag?.includes('chat') || payload.mode === 'lock_screen') {
          setActiveTab('chats');
        } else if (payload.tag?.includes('wallet')) {
          setActiveTab('wallet');
        } else if (payload.tag?.includes('market')) {
          setActiveTab('shop');
        } else {
          setIsNotificationsOpen(true);
        }
      } else if (action === 'accept') {
        setAppToast('Ombi limekubaliwa kikamilifu! ✅');
      } else if (action === 'reject') {
        setAppToast('Ombi limekataliwa.');
      }
    });

    return () => unsub();
  }, []);

  const requireAuthToChat = (
    actionDescription?: string,
    preferMode: 'signin' | 'signup' = 'signup'
  ) => {
    setAuthPromptReason(
      actionDescription ||
        'Ili uweze kuchati na kutuma ujumbe, tafadhali jisajili kama huna akaunti au ingia kama tayari unayo akaunti.'
    );
    setAuthInitialMode(preferMode);
    setIsAuthOpen(true);
  };

  const handleStartCallFromConversation = (
    type: 'video' | 'voice',
    targetConv?: Conversation
  ) => {
    const conv = targetConv || activeConversation;
    if (!conv) return;

    if (activeUser.id === 'guest' || !currentUser) {
      requireAuthToChat(
        'Ili kupiga simu ya WebRTC ya moja kwa moja, tafadhali jisajili au ingia kwanza.'
      );
      return;
    }

    const convParticipants = Array.isArray(conv.participants) ? conv.participants : [];
    let otherParticipantId =
      convParticipants.find(
        (p) =>
          p !== activeUser.id &&
          !matchesUser(activeUser.id, p) &&
          (!activeUser.email || p.toLowerCase() !== activeUser.email.toLowerCase())
      ) || '';

    let otherDetails: any = null;
    if (conv.participantDetails) {
      if (otherParticipantId && conv.participantDetails[otherParticipantId]) {
        otherDetails = conv.participantDetails[otherParticipantId];
      } else {
        const found = Object.entries(conv.participantDetails).find(([pId, details]) => {
          const d = details as any;
          if (pId === activeUser.id || matchesUser(activeUser.id, pId)) return false;
          if (activeUser.email && pId.toLowerCase() === activeUser.email.toLowerCase()) return false;
          if (d?.id && (d.id === activeUser.id || matchesUser(activeUser.id, d.id))) return false;
          if (d?.email && activeUser.email && d.email.toLowerCase() === activeUser.email.toLowerCase()) return false;
          return true;
        });
        if (found) {
          if (!otherParticipantId) otherParticipantId = found[0];
          otherDetails = found[1];
        }
      }
    }

    if (!otherParticipantId && conv.id.startsWith('conv_')) {
      const parts = conv.id.replace('conv_', '').split('_');
      const p = parts.find(
        (part) =>
          part &&
          part !== activeUser.id &&
          !matchesUser(activeUser.id, part) &&
          (!activeUser.email || part.toLowerCase() !== activeUser.email.toLowerCase())
      );
      if (p) otherParticipantId = p;
    }

    const dirUser = otherParticipantId
      ? userDirectoryService.getAllUsers().find(
          (u: UserProfile) =>
            u.id === otherParticipantId ||
            matchesUser(otherParticipantId, u.id) ||
            (u.email && (u.email.toLowerCase() === otherParticipantId.toLowerCase() || matchesUser(otherParticipantId, u.email)))
        )
      : null;

    const rName =
      (conv.isGroup
        ? conv.groupName
        : otherDetails?.displayName ||
          dirUser?.displayName ||
          (otherParticipantId.toLowerCase().includes('amytzee') ? 'Amytzee (Admin)' : null) ||
          (matchesUser(otherParticipantId, 'user_fresh_kk') ? 'Fresh kk' : null)) ||
      (conv.groupName ? conv.groupName : 'Mwanachama wa Zenia');

    const rAvatar =
      (conv.isGroup
        ? conv.groupAvatar
        : otherDetails?.photoURL || dirUser?.photoURL) || undefined;

    // Check friendship condition
    if (!conv.isGroup && otherParticipantId) {
      if (!friendshipService.areFriends(activeUser.id, otherParticipantId)) {
        friendshipService.sendFriendRequest(activeUser as any, {
          id: otherParticipantId,
          displayName: rName,
          photoURL: rAvatar,
          username: otherParticipantId.replace('user_', ''),
        });
        setAppToast(
          `Huwezi kumpigia simu ${rName} kabla hamjawa marafiki. Ombi la urafiki (Follow) limetumwa mara moja!`
        );
        return;
      }
    }

    const newCallId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setActiveCallSession({
      type,
      callId: newCallId,
      remoteUserId: otherParticipantId,
      remoteName: rName,
      remoteAvatar: rAvatar,
      subtitle: conv.isGroup
        ? 'Kikundi cha Zenia • Simu ya Pamoja'
        : 'Zenia Call • WebRTC P2P Encrypted',
      isIncoming: false,
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

  // Real-time Firestore notification stream for instant cross-device alerts
  useEffect(() => {
    const targetId = currentUser?.id || activeUser.id;
    if (!targetId || targetId === 'guest') return;

    try {
      const notifsCol = collection(db, 'notifications');
      const unsub = onSnapshot(
        notifsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteNotifs: NotificationItem[] = [];
            snapshot.forEach((snap) => {
              const data = snap.data() as NotificationItem;
              const matchesUser =
                data.userId === targetId ||
                (currentUser?.email && data.userId === currentUser.email) ||
                (targetId === 'current_user_id' && (data.userId === 'current_user_id' || data.userId === 'savegamour@gmail.com'));

              if (matchesUser) {
                remoteNotifs.push({
                  ...data,
                  id: snap.id,
                });
              }
            });

            if (remoteNotifs.length > 0) {
              setNotifications((prev) => {
                const map = new Map<string, NotificationItem>();
                // First insert remote ones
                remoteNotifs.forEach((n) => map.set(n.id, n));
                // Then local non-overwritten ones
                prev.forEach((n) => {
                  if (!map.has(n.id)) {
                    map.set(n.id, n);
                  }
                });

                // Automatically trigger Push Notification & Banner for newly arrived remote items
                const newItems = remoteNotifs.filter(
                  (rn) => !rn.read && !prev.some((p) => p.id === rn.id)
                );
                if (newItems.length > 0) {
                  const newest = newItems[0];
                  pushNotificationService.sendNotification({
                    title: newest.title || 'Taarifa Mpya ya Zenia',
                    body: newest.message || '',
                    image: newest.avatar,
                    tag: `zenia-${newest.type || 'general'}`,
                    actions: [
                      { action: 'view', title: '👁️ Angalia' },
                      { action: 'reply', title: '💬 Jibu' },
                    ],
                  });
                }

                return Array.from(map.values()).sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              });
            }
          }
        },
        (err) => {
          console.warn('Real-time notifications notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Failed to listen to Firestore notifications:', e);
    }
  }, [currentUser?.id, currentUser?.email, activeUser.id]);

  const handleSignOut = async () => {
    try {
      if (currentUser?.id) {
        presenceService.stopHeartbeat(currentUser.id);
      }
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    localStorage.removeItem('zenia_active_user');
    setCurrentUser(null);
    setConversations(INITIAL_CONVERSATIONS);
    setActiveConversation(null);
  };

  const handleSelectUserToChat = (targetUser: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => {
    if (!currentUser) {
      requireAuthToChat(`Ili uweze kuanza kuchati na ${targetUser.displayName}, tafadhali jisajili kama huna akaunti au ingia.`);
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
          isOnline: isUserOnline(targetUser, currentUser.id),
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
    ChatSyncService.saveConversation(newConv);
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
              lastActiveAt: Date.now(),
              lastSeen: 'Sasa hivi',
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
          onSwitchUser={(u) => setCurrentUser(u)}
          onTriggerSimulatedIncomingCall={() => {
            webrtcService.triggerSimulatedIncomingCall(activeUser.id, 'Fresh kk', 'video');
          }}
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
                      onStartNewChat={() => {
                        if (!currentUser) {
                          requireAuthToChat('Ili kuanzisha mazungumzo mapya, tafadhali jisajili au ingia kwanza.');
                          return;
                        }
                        setIsNewChatModalOpen(true);
                      }}
                      onStartNewChatWithUser={handleSelectUserToChat}
                      onOpenProfile={() => setActiveTab('profile')}
                      onOpenCreateStatus={() => setIsCreateMenuOpen(true)}
                      customStatuses={customStatuses}
                      onStartChatWithBusiness={handleStartChatWithBusiness}
                      onSignOut={handleSignOut}
                      onLockApp={() => setIsAppLocked(true)}
                      onOpenAuth={(mode, reason) => requireAuthToChat(reason, mode)}
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
                      onStartCall={(type, conv) => handleStartCallFromConversation(type, conv)}
                      onSimulateIncomingCall={() => {
                        webrtcService.triggerSimulatedIncomingCall(activeUser.id, 'Fresh kk', 'video');
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
                            currentUser={currentUser || activeUser}
                            onBack={() => setActiveConversation(null)}
                            onStartCall={handleStartCallFromConversation}
                            onOpenAuth={(mode, reason) => requireAuthToChat(reason, mode)}
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
                            currentUser={currentUser || activeUser}
                            onBack={() => setActiveConversation(null)}
                            onStartCall={handleStartCallFromConversation}
                            onOpenAuth={(mode, reason) => requireAuthToChat(reason, mode)}
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
                            onClick={() => {
                              if (!currentUser) {
                                requireAuthToChat('Ili kuanzisha mazungumzo mapya, tafadhali jisajili au ingia kwanza.');
                                return;
                              }
                              setIsCreateMenuOpen(true);
                            }}
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


            {/* View: Shop / Marketplace */}
            {activeTab === 'shop' && (
              <ShopMarketplace
                currentUser={currentUser}
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
                currentUser={currentUser}
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
                onStartCallWithUser={(type, u) => {
                  if (!currentUser) {
                    requireAuthToChat('Ili kupiga simu ya WebRTC, tafadhali jisajili au ingia kwanza.');
                    return;
                  }
                  if (!friendshipService.areFriends(activeUser.id, u.id)) {
                    alert(`Huwezi kumpigia simu ${u.displayName}. Mnapaswa kuwa marafiki kwanza! Tuma ombi la urafiki.`);
                    return;
                  }
                  handleStartCallFromConversation(type, {
                    id: `conv_${[activeUser.id, u.id].sort().join('_')}`,
                    participants: [activeUser.id, u.id],
                    participantDetails: {
                      [u.id]: {
                        displayName: u.displayName,
                        photoURL: u.photoURL,
                        username: u.username,
                        isOnline: true,
                      },
                    },
                    isGroup: false,
                    lastMessage: '',
                    updatedAt: 'Sasa hivi',
                  });
                }}
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
              <CommunityView currentUser={activeUser} onBack={() => setActiveTab('chats')} />
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
      <NotificationHeadsUpBanner onNavigate={(route) => setActiveTab(route)} />

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
          setActiveTab('chats');
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
                else setActiveTab('chats');
              }}
            />
          </div>
        </div>
      )}

      {/* Real-Time Incoming WebRTC Call Alert Notification */}
      {incomingCall && !activeCallSession && (
        <IncomingCallNotification
          call={incomingCall}
          onAccept={() => {
            const call = incomingCall;
            setIncomingCall(null);
            setIsCallMinimized(false);
            setActiveCallSession({
              type: call.callType,
              callId: call.id,
              remoteUserId: call.callerId,
              remoteName: call.callerName || 'Mwanachama wa Zenia',
              remoteAvatar: call.callerAvatar || freshKkAvatar,
              subtitle: 'Zenia WebRTC • Simu Iliyopokelewa P2P',
              isIncoming: true,
              incomingCallData: call,
            });
          }}
          onDecline={() => {
            if (incomingCall) {
              webrtcService.rejectCall(incomingCall.id);
            }
            setIncomingCall(null);
          }}
          onReplyWithMessage={(msg) => {
            if (incomingCall) {
              webrtcService.rejectCall(incomingCall.id);
              const conv = conversations.find(
                (c) => !c.isGroup && c.participants.includes(incomingCall.callerId)
              );
              if (conv) {
                const autoMsg: ChatMessage = {
                  id: `reply_${Date.now()}`,
                  conversationId: conv.id,
                  senderId: activeUser.id,
                  senderName: activeUser.displayName || 'Mimi',
                  text: `📞 [Jibu la Simu]: ${msg}`,
                  messageType: 'text',
                  createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                ChatSyncService.sendMessage(conv.id, autoMsg);
              }
            }
            setIncomingCall(null);
          }}
        />
      )}

      {/* Direct Voice & Video Call Modal (Full Screen) */}
      {activeCallSession && !isCallMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl">
          <VideoCallScreen
            callType={activeCallSession.type}
            callId={activeCallSession.callId}
            remoteUserId={activeCallSession.remoteUserId}
            remoteUserName={activeCallSession.remoteName}
            remoteUserAvatar={activeCallSession.remoteAvatar || freshKkAvatar}
            remoteUserSubtitle={activeCallSession.subtitle}
            isIncoming={activeCallSession.isIncoming}
            incomingCallData={activeCallSession.incomingCallData}
            currentUser={activeUser}
            onEndCall={() => {
              setActiveCallSession(null);
              setIsCallMinimized(false);
            }}
            onMinimizeCall={() => setIsCallMinimized(true)}
          />
        </div>
      )}

      {/* Minimized Floating Call Bubble (Tazama Mazungumzo Mode) */}
      {activeCallSession && isCallMinimized && (
        <FloatingCallBubble
          remoteName={activeCallSession.remoteName}
          remoteAvatar={activeCallSession.remoteAvatar || freshKkAvatar}
          callType={activeCallSession.type}
          durationSeconds={minimizedCallSeconds}
          isMuted={minimizedCallMuted}
          onToggleMute={() => {
            const next = !minimizedCallMuted;
            setMinimizedCallMuted(next);
            webrtcService.toggleMute(next);
          }}
          onExpand={() => setIsCallMinimized(false)}
          onEndCall={() => {
            webrtcService.endCall();
            setActiveCallSession(null);
            setIsCallMinimized(false);
          }}
        />
      )}

      {/* Floating Zenia Beats & Podcasts Mini-Player */}
      <ZeniaMiniPlayer />

      {/* Full Screen WhatsApp App Lock Overlay */}
      {isAppLocked && (
        <AppLockScreen onUnlock={() => setIsAppLocked(false)} />
      )}

      {/* Sleek App Toast Notification */}
      {appToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-2xl bg-[#0F172A]/95 text-white border border-cyan-400/40 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-100 flex-1">{appToast}</span>
          <button
            onClick={() => setAppToast(null)}
            className="text-slate-400 hover:text-white p-1 text-sm font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
