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
} from 'lucide-react';
import { Conversation, ChatMessage, UserProfile, InvoiceDetails, CustomerCrmProfile } from '../../types';
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
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface ChatRoomProps {
  conversation: Conversation;
  currentUser: UserProfile;
  onBack: () => void;
  onStartCall: (type: 'video' | 'voice') => void;
  onUpdateConversation?: (conv: Conversation) => void;
  onDeleteConversation?: (convId: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversation,
  currentUser,
  onBack,
  onStartCall,
  onUpdateConversation,
  onDeleteConversation,
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
      id: 'm2',
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: "Safi sana! Nipo Kariakoo, nitalipa mara moja.",
      messageType: 'text',
      createdAt: '12:23 PM',
      isPinned: true,
    },
    {
      id: 'm3',
      conversationId: conversation.id,
      senderId: otherUserId || 'user_fresh_kk',
      senderName: name,
      text: 'Karibu sana ndugu yangu! Nitakutumia ankara ya malipo hapa chini.',
      messageType: 'text',
      createdAt: '12:24 PM',
      reactions: { '👍': ['user_fresh_kk'] },
    },
    {
      id: 'm_invoice_1',
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: 'Tafadhali kamilisha malipo ya Wireless Earbuds Pro ili tukuletee mzigo wako sasa hivi.',
      messageType: 'invoice',
      invoiceDetails: {
        invoiceNumber: 'INV-849201',
        title: 'Wireless Earbuds Pro + Usafirishaji',
        amount: 45000,
        currency: 'TZS',
        description: 'Bidhaa asilia ya sauti ya hali ya juu yenye udhamini wa mwaka 1.',
        status: 'pending',
        dueDate: 'Siku 3 zijazo',
        acceptedMethods: ['M-Pesa', 'Airtel Money', 'Tigo Pesa', 'Kadi'],
      },
      createdAt: '12:26 PM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isContactTyping, setIsContactTyping] = useState(false);

  // Edit Message State (Feature 1)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Disappearing Messages Modal State (Feature 3)
  const [isDisappearingModalOpen, setIsDisappearingModalOpen] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState<string | null>(null);

  // Swipe-to-Reply State (Feature 4)
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingHorizontallyRef = useRef<boolean>(false);

  // Voice Note & Audio Transcription State (Feature 5)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [revealedTranscripts, setRevealedTranscripts] = useState<Record<string, boolean>>({
    m_audio_1: false,
  });
  const [transcribingIds, setTranscribingIds] = useState<Record<string, boolean>>({});

  // Mobijet Agent & Invoicing State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);
  const [isAgentDashboardOpen, setIsAgentDashboardOpen] = useState(false);

  // Customer CRM Profile State
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

  // Long press handling for context menu
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // 3-Dots More Menu State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('doodle-green');
  const [customLists, setCustomLists] = useState<string[]>(['Family', 'Work', 'VIP', 'Close Friends']);

  // In-chat Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Info Profile Modal State
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);

  // Message Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);

  // Pinned Message state
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);

  // Message Context Menu State
  const [messageMenuState, setMessageMenuState] = useState<{
    isOpen: boolean;
    message: ChatMessage | null;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    message: null,
    position: { x: 0, y: 0 },
  });

  // Ask Zenia AI Modal State
  const [aiModalMessage, setAiModalMessage] = useState<ChatMessage | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState<boolean>(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync pinned message
  useEffect(() => {
    const foundPin = messages.find((m) => m.isPinned);
    setPinnedMessage(foundPin || null);
  }, [messages]);

  useEffect(() => {
    if (conversation.lastMessage === 'Messages cleared') {
      setMessages([]);
    }
  }, [conversation.lastMessage]);

  const activeTheme = CHAT_THEMES.find((t) => t.id === currentThemeId) || CHAT_THEMES[0];

  // Feature 1: Start Editing Message
  const handleStartEditMessage = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setInputText(msg.text);
    setReplyingToMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputText('');
  };

  // Feature 5: Toggle Audio Transcription
  const handleToggleTranscription = (msgId: string) => {
    if (revealedTranscripts[msgId]) {
      setRevealedTranscripts((prev) => ({ ...prev, [msgId]: false }));
      return;
    }
    setTranscribingIds((prev) => ({ ...prev, [msgId]: true }));
    setTimeout(() => {
      setTranscribingIds((prev) => ({ ...prev, [msgId]: false }));
      setRevealedTranscripts((prev) => ({ ...prev, [msgId]: true }));
    }, 650);
  };

  // Feature 5: Record & Send Voice Note
  const handleRecordVoiceNote = () => {
    const audioMsg: ChatMessage = {
      id: `msg_audio_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: '🎙️ Ujumbe wa sauti (Voice Note)',
      messageType: 'audio',
      audioDuration: '0:14',
      transcription: 'Habari, nimepokea ankara na nakamilisha malipo sasa hivi kupitia M-Pesa.',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disappearingTimer: disappearingTimer || undefined,
    };
    setMessages((prev) => [...prev, audioMsg]);
    if (onUpdateConversation) {
      onUpdateConversation({
        ...conversation,
        lastMessage: '🎙️ Ujumbe wa sauti',
        updatedAt: 'Just now',
      });
    }
    showToast('Ujumbe wa sauti umetumwa na kunukuliwa! 🎙️');
  };

  // Feature 3: Select Disappearing Duration
  const handleSelectDisappearingDuration = (dur: string | null) => {
    setDisappearingTimer(dur);
    setIsDisappearingModalOpen(false);

    const announcement: ChatMessage = {
      id: `sys_${Date.now()}`,
      conversationId: conversation.id,
      senderId: 'system',
      senderName: 'Mfumo',
      text: dur
        ? `⏱️ Ujumbe unaojifuta umewashwa (${dur}). Ujumbe wote mpya utatoweka kiotomatiki.`
        : `⏱️ Ujumbe unaojifuta umezimwa na wewe.`,
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, announcement]);
    showToast(dur ? `Ujumbe unaojifuta umewashwa (${dur})` : 'Ujumbe unaojifuta umezimwa');
  };

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // If in edit mode, save edited message
    if (editingMessage) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessage.id
            ? {
                ...m,
                text: inputText.trim(),
                isEdited: true,
                editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : m
        )
      );
      if (onUpdateConversation) {
        onUpdateConversation({
          ...conversation,
          lastMessage: inputText.trim(),
          updatedAt: 'Just now',
        });
      }
      showToast('Ujumbe umehaririwa kikamilifu! (Edited)');
      setEditingMessage(null);
      setInputText('');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: inputText.trim(),
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disappearingTimer: disappearingTimer || undefined,
      replyTo: replyingToMessage
        ? {
            id: replyingToMessage.id,
            text: replyingToMessage.text,
            senderName: replyingToMessage.senderName || 'Contact',
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setReplyingToMessage(null);

    if (onUpdateConversation) {
      onUpdateConversation({
        ...conversation,
        lastMessage: newMsg.text,
        updatedAt: 'Just now',
      });
    }

    // Realistic Contact Auto-reply Simulation
    setTimeout(() => {
      setIsContactTyping(true);
      setTimeout(() => {
        setIsContactTyping(false);
        const contactReplies = [
          `Nimekupata vizuri kabisa kiongozi! 👍`,
          `Sawa kabisa, mzigo uko tayari kutumwa mara moja.`,
          `Asante sana kwa ushirikiano mzuri! ✨`,
          `Niko hapa kama unahitaji kitu kingine chochote.`,
          `Bila shaka! Tupo pamoja sana. 🙌`,
        ];
        const randomReply = contactReplies[Math.floor(Math.random() * contactReplies.length)];
        const replyMsg: ChatMessage = {
          id: `reply_${Date.now()}`,
          conversationId: conversation.id,
          senderId: otherUserId || 'user_fresh_kk',
          senderName: name,
          text: randomReply,
          messageType: 'text',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          disappearingTimer: disappearingTimer || undefined,
        };
        setMessages((prev) => [...prev, replyMsg]);
        if (onUpdateConversation) {
          onUpdateConversation({
            ...conversation,
            lastMessage: randomReply,
            updatedAt: 'Just now',
          });
        }
      }, 1400);
    }, 600);
  };

  // Touch Swipe-to-Reply & Long Press Handlers (Feature 4)
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

    // Swipe right for reply
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

  // Message Menu Handlers
  const handleReplyMessage = (msg: ChatMessage) => {
    setReplyingToMessage(msg);
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard?.writeText(msg.text);
    showToast('Ujumbe umenakiliwa (Copied to clipboard)');
  };

  const handleReactMessage = (msg: ChatMessage, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msg.id) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const existingUsers = currentReactions[emoji] || [];
        const hasReacted = existingUsers.includes(currentUser.id);

        if (hasReacted) {
          currentReactions[emoji] = existingUsers.filter((id) => id !== currentUser.id);
          if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = [...existingUsers, currentUser.id];
        }
        return { ...m, reactions: currentReactions };
      })
    );
  };

  const handlePinMessage = (msg: ChatMessage) => {
    const willPin = !msg.isPinned;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isPinned: willPin } : { ...m, isPinned: false }))
    );
    showToast(willPin ? 'Ujumbe umebandikwa juu (Pinned)' : 'Ujumbe umetolewa juu (Unpinned)');
  };

  const handleStarMessage = (msg: ChatMessage) => {
    const willStar = !msg.isStarred;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isStarred: willStar } : m))
    );
    showToast(willStar ? 'Ujumbe umewekwa kwenye nyota ⭐' : 'Ujumbe umetolewa kwenye nyota');
  };

  const handleDeleteMessage = (msg: ChatMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    showToast('Ujumbe umefutwa (Deleted)');
  };

  const handleOpenAskAI = (msg: ChatMessage) => {
    setAiModalMessage(msg);
    setAiResponse('');
  };

  const handleSendInvoice = (inv: InvoiceDetails) => {
    const invoiceMsg: ChatMessage = {
      id: `inv_msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: `Ankara mpya ya TZS ${inv.amount.toLocaleString()}: ${inv.title}`,
      messageType: 'invoice',
      invoiceDetails: inv,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, invoiceMsg]);
    setIsInvoiceModalOpen(false);
    showToast(`Ankara ya TZS ${inv.amount.toLocaleString()} imetumwa!`);
  };

  const handlePayInvoice = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.invoiceDetails) {
          return {
            ...m,
            invoiceDetails: {
              ...m.invoiceDetails,
              status: 'paid',
              paidAt: new Date().toLocaleTimeString(),
              paidBy: currentUser.displayName,
              paymentMethod: 'M-Pesa Express',
            },
          };
        }
        return m;
      })
    );
    showToast('Malipo yamethibitishwa kupitia M-Pesa!');
  };

  const handleTransferChat = (agentName: string) => {
    showToast(`Mazungumzo yamehamishiwa kwa wakala "${agentName}"`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070A12] text-white relative overflow-hidden select-none">
      {/* Toast Feedback Banner */}
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

      {/* Chat Room Top Navigation Header */}
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
            title="Tazama Wasifu wa Mteja"
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

        {/* Header Action Buttons (Features 3, 6) */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-300">
          {/* Feature 3: Disappearing Messages Quick Action */}
          <button
            onClick={() => setIsDisappearingModalOpen(true)}
            className={`p-2 rounded-xl transition-all relative ${
              disappearingTimer
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                : 'hover:bg-white/5 text-slate-300 hover:text-white'
            }`}
            title={disappearingTimer ? `Ujumbe Unaojifuta: ${disappearingTimer}` : 'Washa Ujumbe Unaojifuta (Disappearing Messages)'}
          >
            <Clock className="w-4 h-4" />
            {disappearingTimer && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* CRM Drawer Trigger */}
          <button
            onClick={() => setIsCrmDrawerOpen(true)}
            className="p-2 hover:bg-white/5 rounded-xl text-cyan-400 hover:text-cyan-200 transition-colors hidden sm:block"
            title="Fungua CRM ya Mteja, Lebo na Dokezo la Ndani"
          >
            <UserCheck className="w-4 h-4" />
          </button>

          {/* In-chat Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isSearchOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-300 hover:text-white'
            }`}
            title="Tafuta ndani ya mazungumzo"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Feature 6: Voice Call (Simu ya Sauti bila nambari) */}
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-200 hover:text-white transition-colors"
            title="Piga Simu ya Sauti (Voice Call)"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Feature 6: Video Call (Simu ya Video) */}
          <button
            onClick={() => onStartCall('video')}
            className="p-2 hover:bg-cyan-500/15 rounded-xl text-cyan-400 transition-colors"
            title="Piga Simu ya Video (Video Call)"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Three Dots More Menu */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isMoreMenuOpen ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-slate-300 hover:text-white'
            }`}
            title="Chaguo zaidi"
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
          onMute={(dur) => {
            if (onUpdateConversation) {
              onUpdateConversation({ ...conversation, mutedUntil: dur });
            }
            showToast(dur ? `Taarifa zimezimwa (${dur})` : 'Taarifa zimewashwa (Unmuted)');
          }}
          onToggleFavorite={() => {
            const nextFav = !conversation.isFavorite;
            if (onUpdateConversation) {
              onUpdateConversation({ ...conversation, isFavorite: nextFav });
            }
            showToast(nextFav ? 'Imeongezwa kwenye Vipendwa' : 'Imeondolewa kwenye Vipendwa');
          }}
          onAddToList={(listName) => {
            const currentLists = conversation.lists || [];
            const exists = currentLists.includes(listName);
            const nextLists = exists
              ? currentLists.filter((l) => l !== listName)
              : [...currentLists, listName];
            if (onUpdateConversation) {
              onUpdateConversation({ ...conversation, lists: nextLists });
            }
            showToast(exists ? `Imeondolewa kwenye ${listName}` : `Imeongezwa kwenye ${listName}`);
          }}
          onCloseChat={onBack}
          onStartCall={onStartCall}
          onBlock={() => {
            const nextBlocked = !conversation.isBlocked;
            if (onUpdateConversation) {
              onUpdateConversation({ ...conversation, isBlocked: nextBlocked });
            }
            showToast(nextBlocked ? 'Mtu huyu amezuiwa' : 'Kizuizi kimeondolewa');
          }}
          onClearChat={() => {
            setMessages([]);
            if (onUpdateConversation) {
              onUpdateConversation({
                ...conversation,
                lastMessage: 'Messages cleared',
                unreadCount: 0,
              });
            }
            showToast('Jumbe zote zimefutwa');
          }}
          onDeleteChat={() => {
            if (onDeleteConversation) onDeleteConversation(conversation.id);
            onBack();
            showToast('Mazungumzo yamefutwa');
          }}
          currentThemeId={currentThemeId}
          onSelectTheme={(themeId) => setCurrentThemeId(themeId)}
          disappearingTimer={disappearingTimer}
          onSetDisappearingTimer={(timer) => handleSelectDisappearingDuration(timer)}
          customLists={customLists}
          onCreateCustomList={(name) => {
            if (!customLists.includes(name)) setCustomLists((c) => [...c, name]);
          }}
          onShowToast={showToast}
        />
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="bg-[#12182B] border-b border-cyan-500/20 px-4 py-2 flex items-center justify-between z-10 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0 rotate-45" />
            <div className="min-w-0">
              <span className="text-[10px] text-cyan-300 font-bold block">Ujumbe uliobandikwa</span>
              <p className="text-xs text-slate-200 truncate">{pinnedMessage.text}</p>
            </div>
          </div>
          <button
            onClick={() => handlePinMessage(pinnedMessage)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* In-Chat Search Bar */}
      {isSearchOpen && (
        <div className="bg-[#101424] px-4 py-2 border-b border-white/[0.08] flex items-center gap-2 animate-in slide-in-from-top-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta kwenye mazungumzo haya..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Disappearing Messages Active Banner */}
      {disappearingTimer && (
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-1.5 text-center text-[11px] text-cyan-300 font-medium flex items-center justify-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ujumbe unaojifuta umewashwa ({disappearingTimer}). Ujumbe wote mpya utatoweka.</span>
        </div>
      )}

      {/* Messages Feed */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-3 transition-colors duration-300 overscroll-contain ${activeTheme.wallpaperClass}`}
        style={{ ...activeTheme.wallpaperStyle, WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <p>Hakuna ujumbe. Andika ujumbe hapa chini kuanza mazungumzo.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isSystem = msg.senderId === 'system';
            const isSelected = selectedMsgIds.includes(msg.id);
            const isHighlighted =
              searchQuery.trim() && msg.text.toLowerCase().includes(searchQuery.toLowerCase());
            const reactionEntries = Object.entries(msg.reactions || {});
            const isSwipingThis = swipingMessageId === msg.id;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/20 text-[11px] text-cyan-300 font-medium text-center shadow-sm">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`relative flex items-end gap-2 group/msg ${
                  isMe ? 'justify-end' : 'justify-start'
                } ${isSelectionMode ? 'cursor-pointer hover:opacity-90' : ''}`}
                style={{
                  transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'none',
                  transition: isSwipingThis ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                {/* Swipe-to-Reply Curved Icon Indicator (Feature 4) */}
                {isSwipingThis && swipeOffset > 15 && (
                  <div
                    className="absolute -left-9 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow-lg flex items-center justify-center pointer-events-none transition-all"
                    style={{
                      opacity: Math.min(swipeOffset / 40, 1),
                      transform: `translateY(-50%) scale(${Math.min(swipeOffset / 40, 1)})`,
                    }}
                  >
                    <CornerUpLeft className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Checkbox in selection mode */}
                {isSelectionMode && (
                  <div className="self-center pr-1">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
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

                {/* Desktop hover action trigger for message */}
                {isMe && !isSelectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMessageMenuState({
                        isOpen: true,
                        message: msg,
                        position: { x: rect.left - 180, y: rect.top },
                      });
                    }}
                    className="opacity-0 group-hover/msg:opacity-100 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-opacity self-center"
                    title="Chaguo la ujumbe"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                )}

                {/* Message Bubble (Supports Touch Swipe-to-Reply and Right-Click) */}
                <div
                  onTouchStart={(e) => handleMessageTouchStart(msg, e)}
                  onTouchMove={handleMessageTouchMove}
                  onTouchEnd={() => handleMessageTouchEnd(msg)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
                  } ${
                    isHighlighted
                      ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20'
                      : ''
                  }`}
                >
                  {/* Quoted Reply Preview inside bubble (Feature 4) */}
                  {msg.replyTo && (
                    <div className="mb-2 p-2 rounded-xl bg-black/30 border-l-2 border-cyan-400 text-[11px] text-slate-200">
                      <span className="font-bold text-cyan-300 block">{msg.replyTo.senderName}</span>
                      <p className="truncate opacity-80">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Feature 5: Audio Message & Audio Transcription */}
                  {msg.messageType === 'audio' ? (
                    <div className="space-y-2 py-0.5">
                      {/* Audio Player Card */}
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

                        {/* Waveform Equalizer */}
                        <div className="flex-1 flex items-center gap-0.5 h-6">
                          {[35, 65, 45, 85, 55, 75, 95, 50, 70, 85, 60, 40, 80, 45].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                playingAudioId === msg.id
                                  ? 'bg-cyan-400 animate-pulse'
                                  : 'bg-white/40'
                              }`}
                              style={{
                                height: `${h}%`,
                                animationDelay: `${(i % 3) * 150}ms`,
                              }}
                            />
                          ))}
                        </div>

                        <span className="text-[10px] font-mono text-cyan-200 shrink-0">
                          {msg.audioDuration || '0:18'}
                        </span>
                      </div>

                      {/* Transcribe Button */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
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
                      </div>

                      {/* Revealed Audio Transcript */}
                      {revealedTranscripts[msg.id] && (
                        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-100 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold mb-1">
                            <span>🎙️ UNUKUZI WA SAUTI (TRANSCRIPT)</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(msg.transcription || '');
                                showToast('Maandishi yamenakiliwa! (Copied)');
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
                  ) : msg.messageType === 'invoice' && msg.invoiceDetails ? (
                    <div>
                      {msg.text && <p className="mb-2 text-slate-200">{msg.text}</p>}
                      <InChatInvoiceCard
                        message={msg}
                        invoice={msg.invoiceDetails}
                        isMe={isMe}
                        onPayInvoice={handlePayInvoice}
                      />
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  {/* Message Bottom Metadata */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-white/70">
                    {/* Feature 1: Edited indicator */}
                    {msg.isEdited && (
                      <span className="italic text-[9.5px] text-cyan-300 font-medium">
                        (Imehaririwa)
                      </span>
                    )}

                    {/* Feature 3: Disappearing Timer Icon */}
                    {msg.disappearingTimer && (
                      <span title={`Ujumbe utatoweka (${msg.disappearingTimer})`}>
                        <Clock className="w-3 h-3 text-cyan-400/80 shrink-0" />
                      </span>
                    )}

                    {/* Star & Pin Icons */}
                    {msg.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                    {msg.isPinned && <Pin className="w-3 h-3 text-cyan-300 rotate-45 shrink-0" />}

                    <span>{msg.createdAt}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-200 shrink-0" />}
                  </div>

                  {/* Reaction Badges on Bottom Corner */}
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

                {/* Other side desktop hover action */}
                {!isMe && !isSelectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMessageMenuState({
                        isOpen: true,
                        message: msg,
                        position: { x: rect.right + 10, y: rect.top },
                      });
                    }}
                    className="opacity-0 group-hover/msg:opacity-100 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-opacity self-center"
                    title="Chaguo la ujumbe"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Contact Typing Indicator */}
        {isContactTyping && (
          <div className="flex items-center gap-2 text-slate-300 text-xs px-3.5 py-2 rounded-2xl bg-[#171F36] border border-white/10 w-fit animate-in fade-in slide-in-from-bottom-1 shadow-md">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[11px] text-cyan-300 font-medium">{name} anaandika...</span>
          </div>
        )}
      </div>

      {/* Feature 1: Editing Message Banner */}
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
            onClick={handleCancelEdit}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            title="Ghairi kuhariri"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Feature 4: Quoted Reply Banner above Input */}
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

      {/* Bottom Input bar */}
      {conversation.isBlocked ? (
        <div className="p-3.5 bg-rose-950/40 border-t border-rose-500/20 text-center text-xs text-rose-300 font-medium flex items-center justify-center gap-2 shrink-0">
          <Ban className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Umemzuia mtu huyu. Huwezi kutuma wala kupokea ujumbe.</span>
        </div>
      ) : (
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
            className="p-2.5 sm:p-3 bg-[#0D1222] border-t border-white/[0.08] flex items-center gap-1.5 sm:gap-2"
          >
            {/* Invoice Button */}
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all shrink-0 active:scale-95 shadow-sm"
              title="Tuma Ankara / Ombi la Malipo (Send Invoice)"
            >
              <Receipt className="w-4 h-4" />
            </button>

            {/* Quick Replies Button */}
            <button
              type="button"
              onClick={() => setIsQuickRepliesOpen(!isQuickRepliesOpen)}
              className={`p-2 rounded-xl border transition-all shrink-0 active:scale-95 shadow-sm ${
                isQuickRepliesOpen
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-amber-300 border-white/5'
              }`}
              title="Majibu ya Haraka (andika /)"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Input field */}
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
                  editingMessage
                    ? 'Rekebisha ujumbe wako hapa...'
                    : replyingToMessage
                    ? 'Andika jibu lako hapa...'
                    : 'Andika ujumbe au / kwa majibu ya haraka...'
                }
                className="w-full bg-[#171F36] border border-white/[0.08] rounded-2xl pl-4 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Send or Voice Note Button (Feature 5) */}
            {!inputText.trim() && !editingMessage ? (
              <button
                type="button"
                onClick={handleRecordVoiceNote}
                className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Tuma Ujumbe wa Sauti (Voice Note)"
              >
                <Mic className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                title={editingMessage ? 'Hifadhi Mabadiliko (Save)' : 'Tuma Ujumbe'}
              >
                {editingMessage ? <Check className="w-4 h-4 stroke-[3]" /> : <Send className="w-4 h-4" />}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Feature 3: Disappearing Messages Selection Modal */}
      {isDisappearingModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
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

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Ukiwasha kipengele hiki, ujumbe wote mpya uliotumwa kwenye mazungumzo haya utatoweka kiotomatiki baada ya muda uliochaguliwa.
            </p>

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
                    onClick={() => handleSelectDisappearingDuration(opt.id)}
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

            <button
              onClick={() => setIsDisappearingModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Funga (Close)
            </button>
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
          onReply={handleReplyMessage}
          onEdit={handleStartEditMessage}
          onCopy={handleCopyMessage}
          onReact={handleReactMessage}
          onForward={() => {}}
          onPin={handlePinMessage}
          onAskAI={handleOpenAskAI}
          onStar={handleStarMessage}
          onReport={() => {}}
          onDelete={handleDeleteMessage}
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
          onSetDisappearingTimer={(timer) => handleSelectDisappearingDuration(timer)}
          customLists={customLists}
          onCreateCustomList={(n) => {
            if (!customLists.includes(n)) setCustomLists((c) => [...c, n]);
          }}
          onShowToast={showToast}
        />
      )}

      {/* Mobijet In-Chat Invoice Modal */}
      <InChatInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSendInvoice={handleSendInvoice}
        recipientName={name}
      />

      {/* Customer CRM Drawer */}
      <CustomerCrmDrawer
        isOpen={isCrmDrawerOpen}
        onClose={() => setIsCrmDrawerOpen(false)}
        crmProfile={crmProfile}
        onUpdateProfile={(updated) => setCrmProfile(updated)}
        onOpenSendInvoice={() => setIsInvoiceModalOpen(true)}
        onTransferChat={handleTransferChat}
      />

      {/* Agent Dashboard Modal */}
      <AgentDashboardModal
        isOpen={isAgentDashboardOpen}
        onClose={() => setIsAgentDashboardOpen(false)}
        agentName={currentUser.displayName || 'You'}
      />
    </div>
  );
};
