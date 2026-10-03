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
} from 'lucide-react';
import { Conversation, ChatMessage, UserProfile } from '../../types';
import { AIService } from '../../services/ai/aiService';
import { SafeImage } from '../../components/SafeImage';
import { ChatRoomMoreMenu, CHAT_THEMES } from './components/ChatRoomMoreMenu';
import { MessageActionMenu } from './components/MessageActionMenu';
import { ContactInfoModal } from './components/ContactInfoModal';
import { INITIAL_CONVERSATIONS } from '../../services/seed/initialData';

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
  const name = otherUser?.displayName || 'Sarah Mwangi';
  const avatar = otherUser?.photoURL || (name.toLowerCase().includes('sarah') ? '/src/assets/images/sarah_avatar_1790802224123.jpg' : (name.toLowerCase().includes('alex') ? '/src/assets/images/alex_avatar_1790802235334.jpg' : '/assets/images/amina_avatar_1790280951312.jpg'));

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      conversationId: conversation.id,
      senderId: 'user_sarah',
      senderName: name,
      text: 'Hey! How are you doing? 😊',
      messageType: 'text',
      createdAt: '12:20 PM',
      reactions: { '❤️': ['current_user_id'] },
    },
    {
      id: 'm2',
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: "I am doing great! Exploring Zenia's new features.",
      messageType: 'text',
      createdAt: '12:22 PM',
      isPinned: true,
    },
    {
      id: 'm3',
      conversationId: conversation.id,
      senderId: 'user_sarah',
      senderName: name,
      text: 'The marketplace and video calls are super smooth!',
      messageType: 'text',
      createdAt: '12:24 PM',
      reactions: { '👍': ['user_sarah'] },
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 3-Dots More Menu State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('doodle-green');
  const [disappearingTimer, setDisappearingTimer] = useState<string | null>(null);
  const [customLists, setCustomLists] = useState<string[]>(['Family', 'Work', 'VIP', 'Close Friends']);

  // In-chat Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Info Profile Modal State
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);

  // Message Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);

  // Reply State
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);

  // Pinned Message state
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);

  // Message Context Menu State (on long-press or right click on bubble)
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

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: inputText.trim(),
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
  };

  const handleReadMessages = () => {
    if (isSpeaking) {
      AIService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const fullTranscript = messages.map((m) => `${m.senderName || 'User'}: ${m.text}`).join('. ');
    AIService.speakScreenText(
      fullTranscript,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Message Menu Handlers
  const handleReplyMessage = (msg: ChatMessage) => {
    setReplyingToMessage(msg);
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg.text);
    }
    showToast('Ujumbe umenakiliwa (Message copied)');
  };

  const handleReactMessage = (msg: ChatMessage, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msg.id) return m;
        const currentReactions = { ...(m.reactions || {}) };
        if (currentReactions[emoji]) {
          delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = [currentUser.id];
        }
        return { ...m, reactions: currentReactions };
      })
    );
    showToast(`Umeongeza mwitikio ${emoji}`);
  };

  const handleForwardMessage = (msg: ChatMessage, targetConvIds: string[]) => {
    showToast(`Ujumbe umetumwa kwa mazungumzo ${targetConvIds.length}`);
  };

  const handlePinMessage = (msg: ChatMessage) => {
    const isNowPinned = !msg.isPinned;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isPinned: isNowPinned } : { ...m, isPinned: false }))
    );
    showToast(isNowPinned ? 'Ujumbe umebandikwa juu (Message pinned)' : 'Ujumbe umetolewa juu (Unpinned)');
  };

  const handleStarMessage = (msg: ChatMessage) => {
    const isNowStarred = !msg.isStarred;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isStarred: isNowStarred } : m))
    );
    showToast(isNowStarred ? 'Ujumbe umetiwa nyota (Starred)' : 'Nyota imeondolewa');
  };

  const handleReportMessage = (msg: ChatMessage, reason: string) => {
    showToast(`Ujumbe umeripotiwa: ${reason}. Asante!`);
  };

  const handleDeleteMessage = (msg: ChatMessage, mode: 'me' | 'everyone') => {
    if (mode === 'everyone') {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, text: '🚫 Ujumbe huu umefutwa (Deleted message)' } : m))
      );
      showToast('Ujumbe umefutwa kwa wote');
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      showToast('Ujumbe umefutwa kwako');
    }
  };

  // Ask Zenia AI handler
  const handleOpenAskAI = async (msg: ChatMessage) => {
    setAiModalMessage(msg);
    setIsAILoading(true);
    setAiResponse('');
    try {
      const resp = await AIService.generateChatResponse([
        {
          role: 'user',
          content: `Huu ni ujumbe kutoka kwa rafiki yangu: "${msg.text}". Tafadhali fafanua maana yake kwa ufupi na unipe majibu 2 bora ya kirafiki ninayoweza kumjibu mara moja.`,
        },
      ]);
      setAiResponse(resp);
    } catch {
      setAiResponse(`Ufafanuzi: Ujumbe huu unauliza maendeleo yako.\n\nPendekezo la jibu:\n1. "Niko salama sana! Mambo yanaenda vizuri huku, vipi wewe?"\n2. "Kila kitu kiko shwari kabisa! Tuwasiliane baadaye kidogo."`);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleRunAIQuery = async (prompt: string) => {
    setIsAILoading(true);
    try {
      const resp = await AIService.generateChatResponse([{ role: 'user', content: prompt }]);
      setAiResponse(resp);
    } catch {
      setAiResponse('Niko vizuri kabisa! Kazi zinaendelea vyema.');
    } finally {
      setIsAILoading(false);
    }
  };

  // Long press tracking for message bubbles
  const messagePressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMessagePressTriggeredRef = useRef(false);

  const handleMessageTouchStart = (msg: ChatMessage, e: React.TouchEvent) => {
    isMessagePressTriggeredRef.current = false;
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    messagePressTimeoutRef.current = setTimeout(() => {
      isMessagePressTriggeredRef.current = true;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(45);
      }
      setMessageMenuState({
        isOpen: true,
        message: msg,
        position: { x, y },
      });
    }, 450);
  };

  const handleMessageTouchMove = () => {
    if (messagePressTimeoutRef.current) {
      clearTimeout(messagePressTimeoutRef.current);
      messagePressTimeoutRef.current = null;
    }
  };

  const handleMessageTouchEnd = () => {
    if (messagePressTimeoutRef.current) {
      clearTimeout(messagePressTimeoutRef.current);
      messagePressTimeoutRef.current = null;
    }
  };

  // Selection actions
  const toggleSelectMessage = (id: string) => {
    setSelectedMsgIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopySelected = () => {
    const textToCopy = messages
      .filter((m) => selectedMsgIds.includes(m.id))
      .map((m) => m.text)
      .join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    showToast(`${selectedMsgIds.length} ujumbe umenakiliwa`);
    setIsSelectionMode(false);
    setSelectedMsgIds([]);
  };

  const handleDeleteSelected = () => {
    setMessages((prev) => prev.filter((m) => !selectedMsgIds.includes(m.id)));
    showToast(`${selectedMsgIds.length} ujumbe umefutwa`);
    setIsSelectionMode(false);
    setSelectedMsgIds([]);
  };

  const matchingMessageCount = searchQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0;

  return (
    <div className="w-full h-full flex flex-col bg-[#070A12] text-white select-none relative overflow-hidden">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-gradient-to-r from-cyan-950/95 to-[#101426]/95 border border-cyan-500/40 text-cyan-200 text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-cyan-400 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Top Header Normal vs Selection Mode */}
      {isSelectionMode ? (
        <div className="bg-[#0F1426] px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between shrink-0 animate-in fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMsgIds([]);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-cyan-300">
              {selectedMsgIds.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedMsgIds.length === messages.length) {
                  setSelectedMsgIds([]);
                } else {
                  setSelectedMsgIds(messages.map((m) => m.id));
                }
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 hover:text-white"
            >
              {selectedMsgIds.length === messages.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleCopySelected}
              disabled={selectedMsgIds.length === 0}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-40"
              title="Copy selected"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedMsgIds.length === 0}
              className="p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 disabled:opacity-40"
              title="Delete selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0D1222] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors active:scale-95 md:hidden"
              title="Back to Chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsContactInfoOpen(true)}
              className="flex items-center gap-2.5 text-left group p-1 -ml-1 rounded-2xl hover:bg-white/5 active:scale-95 transition-all cursor-pointer focus:outline-none"
              title="Bonyeza kuona taarifa za mawasiliano (Contact info)"
            >
              <div className="relative">
                <SafeImage
                  src={avatar}
                  fallbackText={name}
                  fallbackGradient="from-cyan-800 to-indigo-900"
                  alt={name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-cyan-400 group-hover:scale-105 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1222]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>{name}</span>
                  {conversation.isLocked && (
                    <span
                      className="p-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                      title="Mazungumzo Yamelindwa kwa PIN"
                    >
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">Online</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            {/* Text to Speech Read Button */}
            <button
              onClick={handleReadMessages}
              className={`p-2 rounded-xl transition-colors ${
                isSpeaking ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
              title="🔊 Sikiliza: Text-to-speech reading"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-cyan-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* In-chat Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isSearchOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-300 hover:text-white'
              }`}
              title="Search in conversation"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Voice Call */}
            <button
              onClick={() => onStartCall('voice')}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Video Call */}
            <button
              onClick={() => onStartCall('video')}
              className="p-2 hover:bg-white/5 rounded-xl text-cyan-400 transition-colors"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Three Dots (⋮) Header Action Button */}
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isMoreMenuOpen
                  ? 'bg-white/15 text-white'
                  : 'hover:bg-white/5 text-slate-300 hover:text-white'
              }`}
              title="More options"
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
              showToast(nextBlocked ? 'Mtu huyu amezuiwa (Blocked)' : 'Mtu huyu ameruhusiwa (Unblocked)');
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
              showToast('Jumbe zote zimefutwa (Chat cleared)');
            }}
            onDeleteChat={() => {
              if (onDeleteConversation) {
                onDeleteConversation(conversation.id);
              }
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
            onOpenContactInfo={() => setIsContactInfoOpen(true)}
          />
        </div>
      )}

      {/* Full Contact Info & Profile View (Opens on clicking Avatar, Name, or Contact Info) */}
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
        onClearChat={() => {
          setMessages([]);
          if (onUpdateConversation) {
            onUpdateConversation({
              ...conversation,
              lastMessage: 'Messages cleared',
              unreadCount: 0,
            });
          }
          showToast('Jumbe zote zimefutwa (Chat cleared)');
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

      {/* Pinned Message Banner at top of chat */}
      {pinnedMessage && (
        <div className="bg-[#12182B] border-b border-cyan-500/20 px-4 py-2 flex items-center justify-between z-10 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0 rotate-45" />
            <div className="min-w-0">
              <span className="text-[10px] text-cyan-300 font-bold block">Pinned message</span>
              <p className="text-xs text-slate-200 truncate">{pinnedMessage.text}</p>
            </div>
          </div>
          <button
            onClick={() => handlePinMessage(pinnedMessage)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            title="Unpin message"
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
            placeholder="Search in this chat..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <span className="text-[11px] text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-500/10">
              {matchingMessageCount} found
            </span>
          )}
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

      {/* Disappearing Messages Notice Banner */}
      {disappearingTimer && (
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-1.5 text-center text-[11px] text-cyan-300 font-medium flex items-center justify-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Disappearing messages is active ({disappearingTimer}). New messages will disappear.</span>
        </div>
      )}

      {/* Messages Feed with Dynamic Theme Wallpaper */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-300 ${activeTheme.wallpaperClass}`}
        style={activeTheme.wallpaperStyle}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <p>Hakuna ujumbe. Andika ujumbe hapa chini kuanza mazungumzo.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isSelected = selectedMsgIds.includes(msg.id);
            const isHighlighted =
              searchQuery.trim() && msg.text.toLowerCase().includes(searchQuery.toLowerCase());
            const reactionEntries = Object.entries(msg.reactions || {});

            return (
              <div
                key={msg.id}
                onClick={() => {
                  if (isSelectionMode) toggleSelectMessage(msg.id);
                }}
                className={`flex items-end gap-2 group/msg ${isMe ? 'justify-end' : 'justify-start'} ${
                  isSelectionMode ? 'cursor-pointer hover:opacity-90' : ''
                }`}
              >
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
                    className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-white/10"
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
                    title="Message actions"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                )}

                {/* Message Bubble (Supports Touch Long-Press and Right-Click) */}
                <div
                  onTouchStart={(e) => handleMessageTouchStart(msg, e)}
                  onTouchMove={handleMessageTouchMove}
                  onTouchEnd={handleMessageTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMessageMenuState({
                      isOpen: true,
                      message: msg,
                      position: { x: e.clientX, y: e.clientY },
                    });
                  }}
                  className={`relative max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed transition-all cursor-pointer ${
                    isMe
                      ? `${activeTheme.userBubbleClass} rounded-br-none`
                      : `${activeTheme.otherBubbleClass} rounded-bl-none`
                  } ${
                    isHighlighted
                      ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20'
                      : ''
                  }`}
                >
                  {/* Quoted Reply Preview inside bubble */}
                  {msg.replyTo && (
                    <div className="mb-1.5 p-2 rounded-xl bg-black/25 border-l-2 border-cyan-400 text-[11px] text-slate-300">
                      <span className="font-bold text-cyan-300 block">{msg.replyTo.senderName}</span>
                      <p className="truncate opacity-80">{msg.replyTo.text}</p>
                    </div>
                  )}

                  <p>{msg.text}</p>

                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-white/70">
                    {/* Star Icon */}
                    {msg.isStarred && (
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                    )}
                    {/* Pin Icon */}
                    {msg.isPinned && (
                      <Pin className="w-3 h-3 text-cyan-300 rotate-45 shrink-0" />
                    )}
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

                {/* Other side desktop hover button */}
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
                    title="Message actions"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reply Banner above Input Box */}
      {replyingToMessage && (
        <div className="bg-[#101526] px-4 py-2 border-t border-cyan-500/20 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 min-w-0">
            <CornerUpLeft className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-cyan-300 text-[11px] block">
                Replying to {replyingToMessage.senderName || 'Contact'}
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

      {/* Input bar or Blocked Notice */}
      {conversation.isBlocked ? (
        <div className="p-3.5 bg-rose-950/40 border-t border-rose-500/20 text-center text-xs text-rose-300 font-medium flex items-center justify-center gap-2 shrink-0">
          <Ban className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Umemzuia mtu huyu (Contact is blocked). Huwezi kutuma wala kupokea ujumbe.</span>
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="p-3 bg-[#0D1222] border-t border-white/[0.08] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={replyingToMessage ? "Andika jibu lako..." : "Type a message..."}
            className="flex-1 bg-[#171F36] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* MESSAGE ACTION CONTEXT MENU (Triggered by holding/long-press or right-click) */}
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
          onCopy={handleCopyMessage}
          onReact={handleReactMessage}
          onForward={handleForwardMessage}
          onPin={handlePinMessage}
          onAskAI={handleOpenAskAI}
          onStar={handleStarMessage}
          onReport={handleReportMessage}
          onDelete={handleDeleteMessage}
          availableConversations={INITIAL_CONVERSATIONS}
        />
      )}

      {/* ASK ZENIA AI MODAL */}
      {aiModalMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121626] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Ask Zenia AI</h3>
                  <p className="text-[11px] text-cyan-300">Smart message assistance</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalMessage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 mb-3 text-xs text-slate-300 italic">
              "{aiModalMessage.text}"
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                {
                  label: '💬 Pendekeza jibu (Smart Reply)',
                  prompt: `Pendekeza majibu 2 nadhifu ya kirafiki kwa ujumbe huu: "${aiModalMessage.text}"`,
                },
                {
                  label: '💡 Fafanua (Explain)',
                  prompt: `Fafanua kwa ufupi maana ya ujumbe huu: "${aiModalMessage.text}"`,
                },
                {
                  label: '🌍 Tafsiri (Translate)',
                  prompt: `Tafsiri ujumbe huu kati ya Kiswahili na Kiingereza: "${aiModalMessage.text}"`,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleRunAIQuery(item.prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 text-slate-300 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* AI Output Card */}
            <div className="p-3.5 rounded-2xl bg-[#0B0F1C] border border-cyan-500/20 text-xs text-slate-200 min-h-[90px] mb-4 flex flex-col justify-between">
              {isAILoading ? (
                <div className="flex items-center gap-2 text-cyan-400 py-4 justify-center">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Zenia AI inachakata...</span>
                </div>
              ) : (
                <p className="whitespace-pre-line leading-relaxed">
                  {aiResponse || 'Chagua kitendo hapo juu kupata msaada wa Zenia AI papo hapo.'}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (aiResponse) {
                    setInputText(aiResponse);
                    setAiModalMessage(null);
                    showToast('Jibu limewekwa kwenye kisanduku cha ujumbe!');
                  }
                }}
                disabled={!aiResponse || isAILoading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs"
              >
                Tumia kama Jibu (Use as Reply)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
