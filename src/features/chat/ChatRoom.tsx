import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  CheckCheck,
  Volume2,
  VolumeX,
  Ban,
  Search,
  X,
  Copy,
  Trash2,
  CheckSquare,
  Square,
  Clock,
  Check,
  Pin,
  PinOff,
  Star,
  CornerUpLeft,
  Sparkles,
  Smile,
  Lock,
  Receipt,
  Zap,
  Award,
  UserCheck,
  Play,
  Pause,
  FileText,
  Pencil,
  Radio,
  Gift,
  Calendar,
  BarChart2,
  Globe,
  BellOff,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Coins,
  Share2,
} from 'lucide-react';
import {
  Conversation,
  ChatMessage,
  UserProfile,
  InvoiceDetails,
  CustomerCrmProfile,
  PollDetails,
  TipDetails,
} from '../../types';
import { AIService } from '../../services/ai/aiService';
import { SafeImage } from '../../components/SafeImage';
import { ChatRoomMoreMenu, CHAT_THEMES } from './components/ChatRoomMoreMenu';
import { MessageActionMenu } from './components/MessageActionMenu';
import { ContactInfoModal } from './components/ContactInfoModal';
import { INITIAL_CONVERSATIONS } from '../../services/seed/initialData';
import { InChatInvoiceModal } from './components/InChatInvoiceModal';
import { InChatInvoiceCard } from './components/InChatInvoiceCard';
import { CustomerCrmDrawer } from './components/CustomerCrmDrawer';
import { QuickRepliesMenu } from './components/QuickRepliesMenu';
import { AgentDashboardModal } from './components/AgentDashboardModal';
import { ViewOnceMediaModal } from './components/ViewOnceMediaModal';
import { SendTipModal } from './components/SendTipModal';
import { CreatePollModal } from './components/CreatePollModal';
import { ScheduleMessageModal } from './components/ScheduleMessageModal';
import { LiveAudioSpaceModal } from './components/LiveAudioSpaceModal';
import { ChatSyncService } from '../../services/chat/chatSyncService';
import { AVAILABLE_CONTACTS } from './components/StartNewChatModal';
import { ArrowLeftRight } from 'lucide-react';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface ChatRoomProps {
  conversation: Conversation;
  currentUser: UserProfile;
  onBack: () => void;
  onStartCall: (type: 'video' | 'voice') => void;
  onUpdateConversation?: (conv: Conversation) => void;
  onDeleteConversation?: (convId: string) => void;
  onSwitchUser?: (user: UserProfile) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversation,
  currentUser,
  onBack,
  onStartCall,
  onUpdateConversation,
  onDeleteConversation,
  onSwitchUser,
}) => {
  const otherUserId = conversation.participants.find((p) => p !== currentUser.id);
  const otherUser = otherUserId && conversation.participantDetails ? conversation.participantDetails[otherUserId] : null;
  const name = otherUser?.displayName || (conversation.isGroup ? conversation.groupName || 'Chat' : 'Fresh kk');
  const avatar = otherUser?.photoURL || freshKkAvatar;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Habari kiongozi! Mzigo uko tayari kutumwa 👊',
      messageType: 'text',
      createdAt: '12:20 PM',
      reactions: { '❤️': ['current_user_id'] },
    },
    {
      id: 'm_audio_1',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Ujumbe wa sauti (Voice Note)',
      messageType: 'audio',
      audioDuration: '0:18',
      transcription: 'Habari kiongozi! Mzigo wako umeshapakiwa na unakaribia kufika Dar es Salaam. Nithibitishie anuani ya kupokelea.',
      createdAt: '12:22 PM',
    },
    {
      id: 'm_poll_1',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Kura ya Maoni: Mzigo uletwe wapi?',
      messageType: 'poll',
      pollDetails: {
        id: 'poll_1',
        question: 'Mzigo uletwe wapi kiongozi?',
        options: [
          { id: 'opt_1', text: 'Kariakoo Msimbazi', votes: ['user_fresh_kk'] },
          { id: 'opt_2', text: 'Posta Mpya', votes: [] },
          { id: 'opt_3', text: 'Sinza Palestina', votes: [] },
        ],
        totalVotes: 1,
        isClosed: false,
      },
      createdAt: '12:23 PM',
    },
    {
      id: 'm_view_once_1',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Picha ya siri ya mzigo kabla ya kufungwa 🔒',
      messageType: 'view_once_media',
      isViewOnce: true,
      isViewedOnce: false,
      mediaUrl: '/src/assets/images/wireless_earbuds_1790280984496.jpg',
      createdAt: '12:24 PM',
    },
    {
      id: 'm_tip_1',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Pesa ya chai / Zawadi',
      messageType: 'tip_gift',
      tipDetails: {
        id: 'tip_demo',
        amount: 10000,
        currency: 'TZS',
        note: 'Pesa ya chai / Ahsante kwa uaminifu wako! ☕🎁',
        senderName: name,
        receiverName: 'You',
        isOpened: false,
      },
      createdAt: '12:25 PM',
    },
    {
      id: 'm_video_note_1',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Ujumbe wa Video ya Duara (Round Cam)',
      messageType: 'video_note',
      mediaUrl: '/src/assets/images/wireless_earbuds_1790280984496.jpg',
      audioDuration: '0:12',
      createdAt: '12:26 PM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isContactTyping, setIsContactTyping] = useState(false);

  // Edit Message State
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Disappearing Messages Modal State
  const [isDisappearingModalOpen, setIsDisappearingModalOpen] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState<string | null>(null);

  // Swipe-to-Reply State
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingHorizontallyRef = useRef<boolean>(false);

  // Voice Note & Audio Transcription State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [revealedTranscripts, setRevealedTranscripts] = useState<Record<string, boolean>>({
    m_audio_1: false,
  });
  const [transcribingIds, setTranscribingIds] = useState<Record<string, boolean>>({});

  // NEW FEATURES 1-8 MODALS & STATES
  // Feature 1: View Once Modal
  const [activeViewOnceMedia, setActiveViewOnceMedia] = useState<{
    msgId: string;
    url: string;
    sender: string;
  } | null>(null);

  // Feature 2: Toggle recorder mode: 'voice' | 'video_note'
  const [recorderMode, setRecorderMode] = useState<'voice' | 'video_note'>('voice');
  const [playingVideoNoteId, setPlayingVideoNoteId] = useState<string | null>(null);

  // Feature 3: Scheduled Messages
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledList, setScheduledList] = useState<{ text: string; time: string }[]>([]);

  // Feature 4: Tip / Gift Modal
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // Feature 5: In-Chat Translations
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslatingId, setIsTranslatingId] = useState<string | null>(null);

  // Feature 6: Silent Message Toggle
  const [isSilentMode, setIsSilentMode] = useState(false);

  // Feature 7: Create Poll Modal
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  // Feature 8: Live Audio Spaces (X Spaces) Modal
  const [isAudioSpaceOpen, setIsAudioSpaceOpen] = useState(false);

  // Attachments Menu Popover
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  // Invoicing & CRM State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);
  const [isAgentDashboardOpen, setIsAgentDashboardOpen] = useState(false);

  const [crmProfile, setCrmProfile] = useState<CustomerCrmProfile>({
    customerId: otherUserId || 'cust_fresh_kk',
    customerName: name,
    phone: '+255 714 892 012',
    email: 'fresh.kk@example.com',
    location: 'Dar es Salaam, Tanzania',
    joinedDate: 'Februari 2026',
    totalSpent: 485000,
    currency: 'TZS',
    tags: ['VIP Buyer', 'Dar Express', 'Tech Enthusiast'],
    ticketStatus: 'open',
    ticketPriority: 'high',
    ticketId: 'TKT-9921',
    assignedAgentName: 'Amina Kaunga',
    internalNotes: [
      {
        id: 'note_1',
        authorName: 'Amina Kaunga',
        text: 'Mteja anataka mzigo ufikishwe kabla ya saa 10 jioni. Ameshawahi kununua mara tatu.',
        createdAt: 'Leo, 11:45 AM',
      },
    ],
  });

  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('doodle-green');
  const [customLists, setCustomLists] = useState<string[]>(['Family', 'Work', 'VIP', 'Close Friends']);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);

  const [messageMenuState, setMessageMenuState] = useState<{
    isOpen: boolean;
    message: ChatMessage | null;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    message: null,
    position: { x: 0, y: 0 },
  });

  const [aiModalMessage, setAiModalMessage] = useState<ChatMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    const foundPin = messages.find((m) => m.isPinned);
    setPinnedMessage(foundPin || null);
  }, [messages]);

  // Real-time Firestore & BroadcastChannel message sync
  useEffect(() => {
    const unsub = ChatSyncService.subscribeMessages(
      conversation.id,
      messages,
      (liveMsgs) => {
        setMessages(liveMsgs);
      }
    );
    return () => unsub();
  }, [conversation.id]);

  const handleToggleSenderPersona = () => {
    if (!onSwitchUser) return;
    if (currentUser.id === otherUserId) {
      // Switch back to Amina Kaunga
      onSwitchUser({
        id: 'current_user_id',
        email: 'savegamour@gmail.com',
        displayName: 'Amina Kaunga',
        username: 'amina_kaunga',
        photoURL: '/assets/images/amina_avatar_1790280951312.jpg',
        accountType: 'creator',
        verified: true,
        followersCount: 12400,
        followingCount: 245,
        postsCount: 3200,
        isOnline: true,
      });
      showToast('Sasa unaongea kama Amina Kaunga! 👤');
    } else {
      // Switch to other contact (e.g. Fresh kk)
      const contactObj = AVAILABLE_CONTACTS.find((c) => c.id === otherUserId) || {
        id: otherUserId || 'user_fresh_kk',
        displayName: name,
        username: (otherUser?.username || name).toLowerCase().replace(/\s+/g, '_'),
        photoURL: avatar,
        accountType: 'business' as const,
        verified: true,
        followersCount: 18400,
        followingCount: 310,
        postsCount: 420,
        isOnline: true,
      };
      onSwitchUser({
        id: contactObj.id,
        email: `${contactObj.username}@zenia.app`,
        displayName: contactObj.displayName,
        username: contactObj.username,
        photoURL: contactObj.photoURL,
        accountType: 'business',
        verified: true,
        followersCount: 18400,
        followingCount: 310,
        postsCount: 420,
        isOnline: true,
      });
      showToast(`Sasa unaongea kama ${contactObj.displayName}! 👤`);
    }
  };

  const activeTheme = CHAT_THEMES.find((t) => t.id === currentThemeId) || CHAT_THEMES[0];

  // Feature 1: Open and dismiss View-Once media
  const handleOpenViewOnce = (msg: ChatMessage) => {
    if (msg.isViewedOnce) {
      showToast('Picha hii ya siri imekwisha funguliwa na kujifuta.');
      return;
    }
    setActiveViewOnceMedia({
      msgId: msg.id,
      url: msg.mediaUrl || '/src/assets/images/wireless_earbuds_1790280984496.jpg',
      sender: msg.senderName || name,
    });
  };

  const handleCloseViewOnce = () => {
    if (activeViewOnceMedia) {
      ChatSyncService.updateMessage(conversation.id, activeViewOnceMedia.msgId, {
        isViewedOnce: true,
      });
      showToast('Picha ya siri imejifuta kabisa.');
    }
    setActiveViewOnceMedia(null);
  };

  // Feature 2: Send Round Cam Video Note
  const handleSendVideoNote = () => {
    const newVideoNote: ChatMessage = {
      id: `vn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName || 'You',
      text: '⭕ Ujumbe wa Video ya Duara',
      messageType: 'video_note',
      mediaUrl: currentUser.photoURL || freshKkAvatar,
      audioDuration: '0:10',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSilent: isSilentMode,
    };
    ChatSyncService.sendMessage(conversation.id, newVideoNote);
    showToast('Video fupi ya duara imetumwa! ⭕📹');
  };

  // Feature 3: Schedule Message
  const handleScheduleMessage = (scheduleTime: string) => {
    if (!inputText.trim()) {
      showToast('Tafadhali andika ujumbe kwanza kwenye kibodi.');
      return;
    }
    setScheduledList((prev) => [...prev, { text: inputText.trim(), time: scheduleTime }]);
    showToast(`Ujumbe umepangwa: ${scheduleTime} 📅`);
    setInputText('');
  };

  // Feature 4: Send Tip / Gift
  const handleSendTip = (tip: TipDetails) => {
    const tipMsg: ChatMessage = {
      id: `msg_${tip.id}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName || 'You',
      text: `🎁 Zawadi ya TZS ${tip.amount.toLocaleString()}`,
      messageType: 'tip_gift',
      tipDetails: tip,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSilent: isSilentMode,
    };
    ChatSyncService.sendMessage(conversation.id, tipMsg);
    showToast(`Pesa ya Chai ya TZS ${tip.amount.toLocaleString()} imetumwa! 🎁`);
  };

  // Feature 4: Claim / Open Tip Gift
  const handleOpenTipGift = (msgId: string) => {
    const target = messages.find((m) => m.id === msgId);
    if (target?.tipDetails) {
      ChatSyncService.updateMessage(conversation.id, msgId, {
        tipDetails: {
          ...target.tipDetails,
          isOpened: true,
          openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      });
    }
    showToast('🎉 Zawadi imefunguliwa! TZS zimeongezwa kwenye Zenia Wallet yako.');
  };

  // Feature 5: In-Chat Instant Translation
  const handleTranslateMessage = (msgId: string, text: string) => {
    if (translations[msgId]) {
      // Toggle off
      setTranslations((prev) => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      return;
    }

    setIsTranslatingId(msgId);
    setTimeout(() => {
      setIsTranslatingId(null);
      let translated = '';
      if (text.includes('Habari')) {
        translated = 'Hello leader! Your package is ready to be dispatched 👊';
      } else if (text.includes('Mzigo')) {
        translated = 'Poll: Where should the package be delivered, leader?';
      } else if (text.includes('Picha ya siri')) {
        translated = 'Secret photo of the package before packaging 🔒';
      } else {
        translated = `Tafsiri: "${text}" -> English: "${text} (Verified Translation)"`;
      }
      setTranslations((prev) => ({ ...prev, [msgId]: translated }));
      showToast('Ujumbe umetafsiriwa! 🌐');
    }, 450);
  };

  // Feature 7: Create Poll
  const handleCreatePoll = (poll: PollDetails) => {
    const pollMsg: ChatMessage = {
      id: `msg_${poll.id}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName || 'You',
      text: `📊 Kura: ${poll.question}`,
      messageType: 'poll',
      pollDetails: poll,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSilent: isSilentMode,
    };
    ChatSyncService.sendMessage(conversation.id, pollMsg);
    showToast('Kura ya maoni imechapishwa! 📊');
  };

  // Feature 7: Vote on Poll
  const handleVoteOnPoll = (msgId: string, optionId: string) => {
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg || !targetMsg.pollDetails) return;

    const updatedOptions = targetMsg.pollDetails.options.map((opt) => {
      const hasVoted = opt.votes.includes(currentUser.id);
      if (opt.id === optionId) {
        return {
          ...opt,
          votes: hasVoted
            ? opt.votes.filter((uid) => uid !== currentUser.id)
            : [...opt.votes, currentUser.id],
        };
      } else {
        return {
          ...opt,
          votes: opt.votes.filter((uid) => uid !== currentUser.id),
        };
      }
    });

    const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes.length, 0);

    ChatSyncService.updateMessage(conversation.id, msgId, {
      pollDetails: {
        ...targetMsg.pollDetails,
        options: updatedOptions,
        totalVotes,
      },
    });
    showToast('Kura yako imerekodiwa! 🗳️');
  };

  // Audio Transcription toggle
  const handleToggleTranscription = (msgId: string) => {
    if (revealedTranscripts[msgId]) {
      setRevealedTranscripts((prev) => ({ ...prev, [msgId]: false }));
      return;
    }
    setTranscribingIds((prev) => ({ ...prev, [msgId]: true }));
    setTimeout(() => {
      setTranscribingIds((prev) => ({ ...prev, [msgId]: false }));
      setRevealedTranscripts((prev) => ({ ...prev, [msgId]: true }));
    }, 600);
  };

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMessage) {
      ChatSyncService.updateMessage(conversation.id, editingMessage.id, {
        text: inputText.trim(),
        isEdited: true,
        editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Ujumbe umehaririwa! (Edited)');
      setEditingMessage(null);
      setInputText('');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName || 'You',
      text: inputText.trim(),
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disappearingTimer: disappearingTimer || undefined,
      isSilent: isSilentMode,
      replyTo: replyingToMessage
        ? {
            id: replyingToMessage.id,
            text: replyingToMessage.text,
            senderName: replyingToMessage.senderName || 'Contact',
          }
        : undefined,
    };

    // Save and sync in real time across Firestore and all tabs/devices
    ChatSyncService.sendMessage(conversation.id, newMsg);
    setInputText('');
    setReplyingToMessage(null);
    showToast('Ujumbe umetumwa! 🚀');
  };

  // Swipe-to-reply touch handlers
  const handleMessageTouchStart = (msg: ChatMessage, e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingHorizontallyRef.current = false;
    setSwipingMessageId(msg.id);
    setSwipeOffset(0);

    isLongPressTriggeredRef.current = false;
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(45);
      }
      setMessageMenuState({
        isOpen: true,
        message: msg,
        position: { x: touchStartXRef.current, y: touchStartYRef.current },
      });
      setSwipeOffset(0);
      setSwipingMessageId(null);
    }, 450);
  };

  const handleMessageTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    if (Math.abs(deltaY) > 8) {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      if (!isSwipingHorizontallyRef.current) {
        setSwipeOffset(0);
        setSwipingMessageId(null);
        return;
      }
    }

    if (deltaX > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwipingHorizontallyRef.current = true;
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      setSwipeOffset(Math.min(deltaX, 70));
    }
  };

  const handleMessageTouchEnd = (msg: ChatMessage) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    if (swipeOffset >= 40) {
      setReplyingToMessage(msg);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(30);
      }
      showToast(`Unajibu ujumbe wa ${msg.senderName || 'Contact'}`);
    }

    setSwipeOffset(0);
    setSwipingMessageId(null);
    isSwipingHorizontallyRef.current = false;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070A12] text-white relative overflow-hidden select-none">
      {/* Toast Feedback */}
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

      {/* Header */}
      <div className="p-3 bg-[#0D1222]/95 border-b border-white/[0.08] backdrop-blur-xl flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors md:hidden text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => setIsContactInfoOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
          >
            <div className="relative shrink-0">
              <SafeImage
                src={avatar}
                fallbackText={name}
                fallbackGradient="from-cyan-800 to-indigo-900"
                alt={name}
                className="w-10 h-10 aspect-square rounded-[14px] object-cover ring-2 ring-white/10 group-hover:ring-cyan-400/80 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0D1222]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                  {name}
                </h3>
                {disappearingTimer && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ⏱️ {disappearingTimer}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online • Direct Chat</span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-300">
          {/* Feature 8: Live Audio Spaces button */}
          <button
            onClick={() => setIsAudioSpaceOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Chumba cha Sauti cha Moja kwa Moja (X Space)"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Space</span>
          </button>

          {/* Disappearing Messages Quick Button */}
          <button
            onClick={() => setIsDisappearingModalOpen(true)}
            className={`p-2 rounded-xl transition-all relative ${
              disappearingTimer
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                : 'hover:bg-white/5 text-slate-300 hover:text-white'
            }`}
            title="Ujumbe Unaojifuta"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Voice Call */}
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-200 hover:text-white transition-colors"
            title="Simu ya Sauti"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => onStartCall('video')}
            className="p-2 hover:bg-cyan-500/15 rounded-xl text-cyan-400 transition-colors"
            title="Simu ya Video"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Three Dots More Menu */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Dots Dropdown Menu */}
        <ChatRoomMoreMenu
          conversation={conversation}
          messages={messages}
          isOpen={isMoreMenuOpen}
          onClose={() => setIsMoreMenuOpen(false)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSelectMode={() => {
            setIsSelectionMode(true);
            setSelectedMsgIds([]);
          }}
          onMute={(dur) => showToast(dur ? `Taarifa zimezimwa (${dur})` : 'Taarifa zimewashwa')}
          onToggleFavorite={() => showToast('Imebadilishwa kwenye Vipendwa')}
          onAddToList={(listName) => showToast(`Orodha: ${listName}`)}
          onCloseChat={onBack}
          onStartCall={onStartCall}
          onBlock={() => showToast('Kizuizi kimesasishwa')}
          onClearChat={() => {
            setMessages([]);
            showToast('Jumbe zote zimefutwa');
          }}
          onDeleteChat={() => {
            if (onDeleteConversation) onDeleteConversation(conversation.id);
            onBack();
          }}
          currentThemeId={currentThemeId}
          onSelectTheme={(themeId) => setCurrentThemeId(themeId)}
          disappearingTimer={disappearingTimer}
          onSetDisappearingTimer={(timer) => setDisappearingTimer(timer)}
          customLists={customLists}
          onCreateCustomList={(name) => {
            if (!customLists.includes(name)) setCustomLists((c) => [...c, name]);
          }}
          onShowToast={showToast}
        />
      </div>

      {/* Real-time Multi-User Persona Switcher Banner */}
      <div className="bg-[#0A0E1C] border-b border-white/[0.08] px-3.5 py-1.5 flex items-center justify-between text-xs z-10 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] text-slate-300 truncate">
            Unaandika kama:{' '}
            <strong className="text-cyan-300 font-bold">{currentUser.displayName}</strong>{' '}
            <span className="text-slate-500 font-mono text-[10px]">(@{currentUser.username})</span>
          </span>
        </div>

        {onSwitchUser && (
          <button
            type="button"
            onClick={handleToggleSenderPersona}
            className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ml-2"
            title="Badili mtumiaji ili ujaribu kutuma na kupokea ujumbe kutoka upande wa pili"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Badili kwenda {currentUser.id === otherUserId ? 'Amina Kaunga' : name}</span>
          </button>
        )}
      </div>

      {/* Scheduled Messages Banner (Feature 3) */}
      {scheduledList.length > 0 && (
        <div className="bg-[#12192F] border-b border-cyan-500/20 px-4 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top-1 z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">
              Ujumbe {scheduledList.length} umepangwa: "{scheduledList[0].text}" ({scheduledList[0].time})
            </span>
          </div>
          <button
            onClick={() => {
              setScheduledList([]);
              showToast('Ujumbe uliopangwa umefutwa');
            }}
            className="text-[10px] text-slate-400 hover:text-white"
          >
            Futa
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-3 transition-colors duration-300 overscroll-contain ${activeTheme.wallpaperClass}`}
        style={{ ...activeTheme.wallpaperStyle, WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isSwipingThis = swipingMessageId === msg.id;
          const reactionEntries = Object.entries(msg.reactions || {});

          return (
            <div
              key={msg.id}
              className={`relative flex items-end gap-2 group/msg ${
                isMe ? 'justify-end' : 'justify-start'
              }`}
              style={{
                transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'none',
                transition: isSwipingThis ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Swipe-to-reply icon */}
              {isSwipingThis && swipeOffset > 15 && (
                <div
                  className="absolute -left-9 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow-lg flex items-center justify-center pointer-events-none"
                  style={{
                    opacity: Math.min(swipeOffset / 40, 1),
                    transform: `translateY(-50%) scale(${Math.min(swipeOffset / 40, 1)})`,
                  }}
                >
                  <CornerUpLeft className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {!isMe && (
                <SafeImage
                  src={avatar}
                  fallbackText={name}
                  fallbackGradient="from-cyan-800 to-indigo-900"
                  alt={name}
                  className="w-7 h-7 rounded-[10px] object-cover shrink-0 ring-1 ring-white/10"
                />
              )}

              {/* Message Bubble */}
              <div
                onTouchStart={(e) => handleMessageTouchStart(msg, e)}
                onTouchMove={handleMessageTouchMove}
                onTouchEnd={() => handleMessageTouchEnd(msg)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMessageMenuState({
                    isOpen: true,
                    message: msg,
                    position: { x: e.clientX, y: e.clientY },
                  });
                }}
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed transition-all cursor-pointer ${
                  isMe
                    ? `${activeTheme.userBubbleClass} rounded-br-none`
                    : `${activeTheme.otherBubbleClass} rounded-bl-none`
                }`}
              >
                {/* Quoted Reply Preview */}
                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded-xl bg-black/30 border-l-2 border-cyan-400 text-[11px] text-slate-200">
                    <span className="font-bold text-cyan-300 block">{msg.replyTo.senderName}</span>
                    <p className="truncate opacity-80">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* 1. VIEW ONCE MEDIA (Feature 1) */}
                {msg.messageType === 'view_once_media' ? (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleOpenViewOnce(msg)}
                      className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        msg.isViewedOnce
                          ? 'bg-black/30 border-white/10 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-cyan-500/40 text-cyan-200 hover:border-cyan-400 shadow-md'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${msg.isViewedOnce ? 'bg-white/5 text-slate-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {msg.isViewedOnce ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                      <div className="text-left flex-1">
                        <span className="font-bold text-xs block text-white">
                          {msg.isViewedOnce ? 'Imefunguliwa (Opened)' : 'Picha ya Siri (View Once)'}
                        </span>
                        <p className="text-[10px] text-slate-300">
                          {msg.isViewedOnce
                            ? 'Picha hii ilitazamwa na imejifuta kabisa'
                            : 'Gusa kutazama mara moja tu kabla haijajifuta'}
                        </p>
                      </div>
                    </button>
                  </div>
                ) : msg.messageType === 'video_note' ? (
                  /* 2. ROUND CAM VIDEO NOTE (Feature 2) */
                  <div className="py-1 flex flex-col items-center">
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-cyan-400 shadow-2xl bg-black ring-4 ring-cyan-500/20 group/vn">
                      <img
                        src={msg.mediaUrl || freshKkAvatar}
                        alt="Round Video Note"
                        className="w-full h-full object-cover scale-105 group-hover/vn:scale-110 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPlayingVideoNoteId(playingVideoNoteId === msg.id ? null : msg.id)
                        }
                        className="absolute inset-0 bg-black/30 flex items-center justify-center text-white backdrop-blur-[1px] hover:bg-black/20 transition-all"
                      >
                        {playingVideoNoteId === msg.id ? (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <Volume2 className="w-6 h-6 text-cyan-300" />
                          </div>
                        ) : (
                          <Play className="w-8 h-8 fill-white drop-shadow-lg" />
                        )}
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-mono text-cyan-300">
                        {msg.audioDuration || '0:12'}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-300 mt-1.5 font-medium">
                      Video ya Duara (Round Cam)
                    </span>
                  </div>
                ) : msg.messageType === 'tip_gift' && msg.tipDetails ? (
                  /* 4. P2P TIP / RED PACKET GIZMO (Feature 4) */
                  <div className="py-1">
                    <div className="bg-gradient-to-tr from-amber-600 to-rose-600 rounded-2xl p-4 text-white shadow-xl border border-amber-300/30 relative overflow-hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-black/25">
                            <Gift className="w-5 h-5 text-amber-200" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                              Zawadi ya Pesa / Red Packet
                            </span>
                            <h4 className="text-base font-extrabold text-white">
                              TZS {msg.tipDetails.amount.toLocaleString()}
                            </h4>
                          </div>
                        </div>
                        <Coins className="w-6 h-6 text-amber-200/80" />
                      </div>

                      <p className="text-xs text-amber-100 italic mb-3 bg-black/20 p-2 rounded-xl">
                        "{msg.tipDetails.note}"
                      </p>

                      <button
                        type="button"
                        onClick={() => handleOpenTipGift(msg.id)}
                        disabled={msg.tipDetails.isOpened}
                        className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                          msg.tipDetails.isOpened
                            ? 'bg-black/30 text-amber-200 cursor-default'
                            : 'bg-amber-300 text-slate-950 hover:bg-white'
                        }`}
                      >
                        {msg.tipDetails.isOpened ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Imepokelewa ({msg.tipDetails.openedAt || 'Sasa'})</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-slate-950" />
                            <span>Gusa Kufungua Zawadi (Claim Tip)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : msg.messageType === 'poll' && msg.pollDetails ? (
                  /* 7. IN-CHAT INTERACTIVE POLL (Feature 7) */
                  <div className="py-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
                      <BarChart2 className="w-4 h-4" />
                      <span>{msg.pollDetails.question}</span>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      {msg.pollDetails.options.map((opt) => {
                        const hasVoted = opt.votes.includes(currentUser.id);
                        const percentage =
                          msg.pollDetails!.totalVotes > 0
                            ? Math.round((opt.votes.length / msg.pollDetails!.totalVotes) * 100)
                            : 0;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVoteOnPoll(msg.id, opt.id)}
                            className="w-full relative overflow-hidden rounded-xl border border-white/10 p-2.5 text-left text-xs transition-all hover:border-cyan-400 group/opt"
                          >
                            {/* Vote percentage bar fill */}
                            <div
                              className={`absolute inset-0 transition-all duration-300 ${
                                hasVoted ? 'bg-cyan-500/25' : 'bg-white/[0.06]'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />

                            <div className="relative z-10 flex items-center justify-between">
                              <span className={`font-semibold ${hasVoted ? 'text-cyan-300' : 'text-slate-200'}`}>
                                {opt.text}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-mono">
                                <span>{percentage}%</span>
                                {hasVoted && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 text-right">
                      {msg.pollDetails.totalVotes} kura zimepigwa
                    </p>
                  </div>
                ) : msg.messageType === 'audio' ? (
                  /* Audio message player & transcription */
                  <div className="space-y-2 py-0.5">
                    <div className="flex items-center gap-3 bg-black/25 p-2 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                        className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-90"
                      >
                        {playingAudioId === msg.id ? (
                          <Pause className="w-3.5 h-3.5 fill-slate-950" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-slate-950 translate-x-0.5" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[35, 65, 45, 85, 55, 75, 95, 50, 70, 85, 60, 40, 80, 45].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              playingAudioId === msg.id ? 'bg-cyan-400 animate-pulse' : 'bg-white/40'
                            }`}
                            style={{ height: `${h}%`, animationDelay: `${(i % 3) * 150}ms` }}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-mono text-cyan-200 shrink-0">
                        {msg.audioDuration || '0:18'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleTranscription(msg.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-[10.5px] font-semibold transition-all active:scale-95"
                    >
                      <FileText className="w-3 h-3" />
                      <span>
                        {transcribingIds[msg.id]
                          ? 'Inachanganua sauti...'
                          : revealedTranscripts[msg.id]
                          ? 'Ficha maandishi (Hide)'
                          : '📝 Badili iwe maandishi (Soma)'}
                      </span>
                    </button>

                    {revealedTranscripts[msg.id] && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-100 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold mb-1">
                          <span>🎙️ UNUKUZI WA SAUTI (TRANSCRIPT)</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(msg.transcription || '');
                              showToast('Maandishi yamenakiliwa!');
                            }}
                            className="text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Nakili</span>
                          </button>
                        </div>
                        <p className="leading-relaxed text-slate-200 italic">
                          "{msg.transcription || 'Habari kiongozi! Mzigo uko tayari, nithibitishie anuani ya kupokelea.'}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* 5. IN-CHAT TRANSLATION (Feature 5) */}
                {msg.text && msg.messageType === 'text' && (
                  <div className="mt-1 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleTranslateMessage(msg.id, msg.text)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{translations[msg.id] ? 'Ficha Tafsiri' : 'Tafsiri (Translate)'}</span>
                    </button>

                    {translations[msg.id] && (
                      <div className="mt-1 p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-[11px] text-cyan-200 animate-in fade-in">
                        <span className="font-bold text-[9px] block text-cyan-400">ENGLISH TRANSLATION:</span>
                        <p className="italic">{translations[msg.id]}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Meta Info */}
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-white/70">
                  {/* Feature 6: Silent message indicator */}
                  {msg.isSilent && (
                    <span title="Ujumbe wa Kimya (Silent Message)">
                      <BellOff className="w-3 h-3 text-cyan-300/80 shrink-0" />
                    </span>
                  )}

                  {msg.isEdited && (
                    <span className="italic text-[9.5px] text-cyan-300 font-medium">
                      (Imehaririwa)
                    </span>
                  )}

                  {msg.disappearingTimer && (
                    <span title={`Ujumbe utatoweka (${msg.disappearingTimer})`}>
                      <Clock className="w-3 h-3 text-cyan-400/80 shrink-0" />
                    </span>
                  )}

                  {msg.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                  {msg.isPinned && <Pin className="w-3 h-3 text-cyan-300 rotate-45 shrink-0" />}

                  <span>{msg.createdAt}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-200 shrink-0" />}
                </div>

                {/* Reaction Badges */}
                {reactionEntries.length > 0 && (
                  <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-[#171C2B] border border-white/10 rounded-full px-1.5 py-0.5 shadow-md">
                    {reactionEntries.map(([emoji, userIds]) => (
                      <span key={emoji} className="text-xs">
                        {emoji} {userIds.length > 1 ? userIds.length : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isContactTyping && (
          <div className="flex items-center gap-2 text-slate-300 text-xs px-3.5 py-2 rounded-2xl bg-[#171F36] border border-white/10 w-fit animate-in fade-in shadow-md">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[11px] text-cyan-300 font-medium">{name} anaandika...</span>
          </div>
        )}
      </div>

      {/* Editing Message Banner */}
      {editingMessage && (
        <div className="bg-[#121E36] px-4 py-2 border-t border-emerald-500/30 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 min-w-0">
            <Pencil className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-emerald-300 text-[11px] block">
                Kuhariri Ujumbe (Editing Message)
              </span>
              <p className="text-slate-300 truncate">{editingMessage.text}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMessage(null);
              setInputText('');
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quoted Reply Banner */}
      {replyingToMessage && !editingMessage && (
        <div className="bg-[#101526] px-4 py-2 border-t border-cyan-500/20 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 min-w-0">
            <CornerUpLeft className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-cyan-300 text-[11px] block">
                Unajibu: {replyingToMessage.senderName || 'Contact'}
              </span>
              <p className="text-slate-300 truncate">{replyingToMessage.text}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyingToMessage(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Attach Popover Menu */}
      {isAttachMenuOpen && (
        <div className="bg-[#0D1222] border-t border-white/10 p-3 grid grid-cols-5 gap-2 animate-in slide-in-from-bottom-2 z-20">
          {/* Tip / Gift */}
          <button
            type="button"
            onClick={() => {
              setIsTipModalOpen(true);
              setIsAttachMenuOpen(false);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all active:scale-95"
          >
            <Gift className="w-5 h-5 text-amber-400" />
            <span>Pesa/Tip</span>
          </button>

          {/* Poll */}
          <button
            type="button"
            onClick={() => {
              setIsPollModalOpen(true);
              setIsAttachMenuOpen(false);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all active:scale-95"
          >
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <span>Kura</span>
          </button>

          {/* Schedule */}
          <button
            type="button"
            onClick={() => {
              setIsScheduleModalOpen(true);
              setIsAttachMenuOpen(false);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-all active:scale-95"
          >
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Panga</span>
          </button>

          {/* View Once Photo */}
          <button
            type="button"
            onClick={() => {
              const viewOnceMsg: ChatMessage = {
                id: `vo_${Date.now()}`,
                conversationId: conversation.id,
                senderId: currentUser.id,
                senderName: 'You',
                text: 'Picha ya siri ya mzigo 🔒',
                messageType: 'view_once_media',
                isViewOnce: true,
                isViewedOnce: false,
                mediaUrl: '/src/assets/images/wireless_earbuds_1790280984496.jpg',
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              setMessages((prev) => [...prev, viewOnceMsg]);
              setIsAttachMenuOpen(false);
              showToast('Picha ya kuangalia mara 1 (View Once) imetumwa!');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-all active:scale-95"
          >
            <Eye className="w-5 h-5 text-rose-400" />
            <span>Siri (1x)</span>
          </button>

          {/* Invoice */}
          <button
            type="button"
            onClick={() => {
              setIsInvoiceModalOpen(true);
              setIsAttachMenuOpen(false);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all active:scale-95"
          >
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Ankara</span>
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="relative shrink-0">
        <QuickRepliesMenu
          isOpen={isQuickRepliesOpen}
          onClose={() => setIsQuickRepliesOpen(false)}
          onSelectReply={(text) => {
            setInputText(text);
            setIsQuickRepliesOpen(false);
          }}
        />

        <form
          onSubmit={handleSend}
          className="p-2 sm:p-2.5 bg-[#0D1222] border-t border-white/[0.08] flex items-center gap-1.5 sm:gap-2"
        >
          {/* Plus / Attach Button (Expands all 8 features) */}
          <button
            type="button"
            onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
            className={`p-2 rounded-xl border transition-all shrink-0 active:scale-95 ${
              isAttachMenuOpen
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title="Vipengele vya Ziada (Zawadi, Kura, Panga, Siri)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Feature 6: Silent Message Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsSilentMode(!isSilentMode);
              showToast(!isSilentMode ? 'Ujumbe wa Kimya umewashwa 🤫' : 'Ujumbe wa kawaida umewashwa 🔔');
            }}
            className={`p-2 rounded-xl border transition-all shrink-0 active:scale-95 ${
              isSilentMode
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
            title={isSilentMode ? 'Ujumbe wa Kimya (Silent)' : 'Washa Ujumbe wa Kimya'}
          >
            {isSilentMode ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                const val = e.target.value;
                setInputText(val);
                if (val.endsWith('/') && !isQuickRepliesOpen) {
                  setIsQuickRepliesOpen(true);
                }
              }}
              placeholder={
                isSilentMode
                  ? 'Andika ujumbe wa kimya (bila mlio)...'
                  : editingMessage
                  ? 'Hariri ujumbe wako...'
                  : replyingToMessage
                  ? 'Andika jibu...'
                  : 'Andika ujumbe au gusa + kwa zawadi & kura...'
              }
              className="w-full bg-[#171F36] border border-white/[0.08] rounded-2xl pl-3.5 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Feature 2: Switch between Mic and Round Video Cam */}
          {!inputText.trim() && !editingMessage && (
            <button
              type="button"
              onClick={() => {
                const next = recorderMode === 'voice' ? 'video_note' : 'voice';
                setRecorderMode(next);
                showToast(next === 'video_note' ? 'Hali ya Video ya Duara (Round Cam) 📹' : 'Hali ya Sauti (Voice Note) 🎙️');
              }}
              className="p-1 text-[10px] text-slate-400 hover:text-cyan-300 shrink-0"
              title="Badili kati ya Sauti na Video ya Duara"
            >
              {recorderMode === 'voice' ? '🎙️' : '⭕'}
            </button>
          )}

          {/* Action Trigger: Send or Record */}
          {!inputText.trim() && !editingMessage ? (
            recorderMode === 'voice' ? (
              <button
                type="button"
                onClick={() => {
                  const audioMsg: ChatMessage = {
                    id: `msg_audio_${Date.now()}`,
                    conversationId: conversation.id,
                    senderId: currentUser.id,
                    senderName: 'You',
                    text: '🎙️ Ujumbe wa sauti (Voice Note)',
                    messageType: 'audio',
                    audioDuration: '0:14',
                    transcription: 'Habari kiongozi! Nimepokea na nakamilisha sasa hivi.',
                    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSilent: isSilentMode,
                  };
                  setMessages((prev) => [...prev, audioMsg]);
                  showToast('Ujumbe wa sauti umetumwa na kunukuliwa! 🎙️');
                }}
                className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Tuma Ujumbe wa Sauti"
              >
                <Mic className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendVideoNote}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Tuma Video ya Duara (Round Cam)"
              >
                <Camera className="w-4 h-4" />
              </button>
            )
          ) : (
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
              title={editingMessage ? 'Hifadhi Mabadiliko' : 'Tuma Ujumbe'}
            >
              {editingMessage ? <Check className="w-4 h-4 stroke-[3]" /> : <Send className="w-4 h-4" />}
            </button>
          )}
        </form>
      </div>

      {/* ALL MODALS FOR FEATURES 1-8 */}
      {/* 1. View Once Modal */}
      {activeViewOnceMedia && (
        <ViewOnceMediaModal
          isOpen={activeViewOnceMedia !== null}
          onClose={handleCloseViewOnce}
          mediaUrl={activeViewOnceMedia.url}
          senderName={activeViewOnceMedia.sender}
        />
      )}

      {/* 3. Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        messageText={inputText}
        onSchedule={handleScheduleMessage}
      />

      {/* 4. Send Tip / Gift Modal */}
      <SendTipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        onSendTip={handleSendTip}
        recipientName={name}
      />

      {/* 7. Create Poll Modal */}
      <CreatePollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* 8. Live Audio Space Modal */}
      <LiveAudioSpaceModal
        isOpen={isAudioSpaceOpen}
        onClose={() => setIsAudioSpaceOpen(false)}
        hostName={name}
        hostAvatar={avatar}
        currentUserName={currentUser.displayName || 'You'}
      />

      {/* Disappearing Messages Modal */}
      {isDisappearingModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-[#111628] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Ujumbe Unaojifuta</h3>
                  <p className="text-[11px] text-cyan-300">Disappearing Messages</p>
                </div>
              </div>
              <button
                onClick={() => setIsDisappearingModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {[
                { id: '24h', label: 'Saa 24 (24 Hours)' },
                { id: '7d', label: 'Siku 7 (7 Days)' },
                { id: '90d', label: 'Siku 90 (90 Days)' },
                { id: null, label: 'Imezimwa (Off)' },
              ].map((opt) => {
                const isSelected = disappearingTimer === opt.id;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setDisappearingTimer(opt.id);
                      setIsDisappearingModalOpen(false);
                      showToast(opt.id ? `Ujumbe utatoweka baada ya ${opt.label}` : 'Ujumbe unaojifuta umezimwa');
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400 text-white shadow-md'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border border-transparent text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Message Action Menu */}
      {messageMenuState.isOpen && messageMenuState.message && (
        <MessageActionMenu
          message={messageMenuState.message}
          position={messageMenuState.position}
          isOpen={messageMenuState.isOpen}
          onClose={() =>
            setMessageMenuState({
              isOpen: false,
              message: null,
              position: { x: 0, y: 0 },
            })
          }
          onReply={(msg) => setReplyingToMessage(msg)}
          onEdit={(msg) => {
            setEditingMessage(msg);
            setInputText(msg.text);
          }}
          onCopy={(msg) => {
            navigator.clipboard?.writeText(msg.text);
            showToast('Ujumbe umenakiliwa');
          }}
          onReact={() => {}}
          onForward={() => {}}
          onPin={() => {}}
          onAskAI={() => {}}
          onStar={() => {}}
          onReport={() => {}}
          onDelete={(msg) => {
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            showToast('Ujumbe umefutwa');
          }}
          availableConversations={INITIAL_CONVERSATIONS}
        />
      )}

      {/* Contact Profile Modal */}
      {isContactInfoOpen && (
        <ContactInfoModal
          isOpen={isContactInfoOpen}
          onClose={() => setIsContactInfoOpen(false)}
          conversation={conversation}
          currentUser={currentUser}
          messages={messages}
          onStartCall={onStartCall}
          onOpenSearch={() => setIsSearchOpen(true)}
          onUpdateConversation={onUpdateConversation}
          onDeleteConversation={onDeleteConversation}
          onClearChat={() => setMessages([])}
          currentThemeId={currentThemeId}
          onSelectTheme={(themeId) => setCurrentThemeId(themeId)}
          disappearingTimer={disappearingTimer}
          onSetDisappearingTimer={(timer) => setDisappearingTimer(timer)}
          customLists={customLists}
          onCreateCustomList={(n) => {
            if (!customLists.includes(n)) setCustomLists((c) => [...c, n]);
          }}
          onShowToast={showToast}
        />
      )}

      {/* Invoicing & CRM Modals */}
      <InChatInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSendInvoice={(inv) => {
          showToast('Ankara imetumwa');
          setIsInvoiceModalOpen(false);
        }}
        recipientName={name}
      />
      <CustomerCrmDrawer
        isOpen={isCrmDrawerOpen}
        onClose={() => setIsCrmDrawerOpen(false)}
        crmProfile={crmProfile}
        onUpdateProfile={(u) => setCrmProfile(u)}
        onOpenSendInvoice={() => setIsInvoiceModalOpen(true)}
        onTransferChat={() => {}}
      />
      <AgentDashboardModal
        isOpen={isAgentDashboardOpen}
        onClose={() => setIsAgentDashboardOpen(false)}
        agentName={currentUser.displayName || 'You'}
      />
    </div>
  );
};
