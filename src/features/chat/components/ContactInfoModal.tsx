import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Phone,
  Video,
  Search,
  Share2,
  Bell,
  BellOff,
  Clock,
  Palette,
  Heart,
  FolderPlus,
  Shield,
  Star,
  Ban,
  AlertOctagon,
  MinusCircle,
  Trash2,
  ChevronRight,
  Check,
  Plus,
  FileText,
  Link as LinkIcon,
  Download,
  Copy,
  Users,
  UserPlus,
  QrCode,
  Volume2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Conversation, ChatMessage, UserProfile } from '../../../types';
import { SafeImage } from '../../../components/SafeImage';
import { CHAT_THEMES } from './ChatRoomMoreMenu';

export interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  currentUser: UserProfile;
  messages: ChatMessage[];
  onStartCall: (type: 'video' | 'voice') => void;
  onOpenSearch: () => void;
  onUpdateConversation?: (conv: Conversation) => void;
  onDeleteConversation?: (convId: string) => void;
  onClearChat?: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  disappearingTimer: string | null;
  onSetDisappearingTimer: (timer: string | null) => void;
  customLists: string[];
  onCreateCustomList: (name: string) => void;
  onShowToast: (msg: string) => void;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  isOpen,
  onClose,
  conversation,
  currentUser,
  messages,
  onStartCall,
  onOpenSearch,
  onUpdateConversation,
  onDeleteConversation,
  onClearChat,
  currentThemeId,
  onSelectTheme,
  disappearingTimer,
  onSetDisappearingTimer,
  customLists,
  onCreateCustomList,
  onShowToast,
}) => {
  if (!isOpen) return null;

  // Sub-modals inside Contact Info
  const [showAvatarViewer, setShowAvatarViewer] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showStarredModal, setShowStarredModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam or commercial fraud');
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Settings state toggles
  const [customNotifications, setCustomNotifications] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(true);

  // Media, Links, Docs tab state
  const [mediaTab, setMediaTab] = useState<'media' | 'docs' | 'links'>('media');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Participant Resolution
  const isGroup = conversation.isGroup;
  const otherUserId = conversation.participants.find((p) => p !== currentUser.id);
  const otherUser = otherUserId && conversation.participantDetails ? conversation.participantDetails[otherUserId] : null;

  // Rich contact data based on contact
  const isSarah = otherUser?.displayName?.toLowerCase().includes('sarah') || (!isGroup && otherUserId === 'user_sarah');
  const isAlex = otherUser?.displayName?.toLowerCase().includes('alex') || otherUserId === 'user_alex';
  const isMarket = otherUser?.displayName?.toLowerCase().includes('market') || otherUserId === 'user_market';

  const displayName = isGroup
    ? conversation.groupName || 'Design Team'
    : otherUser?.displayName || (isSarah ? 'Sarah Mwangi' : isAlex ? 'Alex Johnson' : 'Sarah Mwangi');

  const avatarUrl = isGroup
    ? conversation.groupAvatar || '/src/assets/images/team_design_1790802245828.jpg'
    : otherUser?.photoURL ||
      (isSarah
        ? '/src/assets/images/sarah_avatar_1790802224123.jpg'
        : isAlex
        ? '/src/assets/images/alex_avatar_1790802235334.jpg'
        : '/assets/images/amina_avatar_1790280951312.jpg');

  const username = isGroup
    ? 'group/design_team_tz'
    : otherUser?.username || (isSarah ? 'sarah_m' : isAlex ? 'alex_j' : isMarket ? 'marketplace_hq' : 'sarah_m');

  const phoneNumber = isSarah
    ? '+255 712 345 678'
    : isAlex
    ? '+255 765 890 123'
    : isMarket
    ? '+255 800 123 456'
    : '+255 712 345 678';

  const bio = isGroup
    ? 'Official design collaboration group for all UI/UX reviews, system architecture, Figma components, and mobile release sprints.'
    : isSarah
    ? 'UI/UX Designer & Product Lead 🎨 | Building the future of digital experiences in East Africa ✨'
    : isAlex
    ? 'Software Engineer & Cloud Architect 💻 | Passionate about open source, distributed systems & AI'
    : isMarket
    ? 'Official Marketplace verified support desk 🛍️ | 24/7 buyer protection, order dispatch, and returns'
    : 'Living life with purpose ✨ | Available for networking and creative tech projects';

  const bioDate = isGroup ? 'Created by James on 10 Jan 2026' : 'Set on 15 Feb 2026';

  // Sample Media items with 100% verified reliable local assets
  const mediaItems = [
    { id: 'm1', url: '/src/assets/images/sarah_avatar_1790802224123.jpg', title: 'Profile' },
    { id: 'm2', url: '/assets/images/zanzibar_beach_1790280962219.jpg', title: 'Zanzibar Trip' },
    { id: 'm3', url: '/assets/images/concert_festival_1790280974630.jpg', title: 'Concert' },
    { id: 'm4', url: '/assets/images/wireless_earbuds_1790280984496.jpg', title: 'Gadgets' },
    { id: 'm5', url: '/src/assets/images/team_design_1790802245828.jpg', title: 'Team Studio' },
    { id: 'm6', url: '/src/assets/images/tech_community_1790802256885.jpg', title: 'Tech Hub' },
  ];

  const docItems = [
    { id: 'd1', name: 'UI_Design_System_v2.pdf', size: '4.2 MB', date: 'Yesterday' },
    { id: 'd2', name: 'Sprint_Roadmap_Q3.docx', size: '1.8 MB', date: '2 days ago' },
    { id: 'd3', name: 'Financial_Summary_2026.xlsx', size: '940 KB', date: '15 Mar' },
  ];

  const linkItems = [
    { id: 'l1', title: 'Figma Design Workspace', url: 'https://figma.com/@design_team_tz', preview: 'figma.com' },
    { id: 'l2', title: 'GitHub Repository - Zenia App', url: 'https://github.com/project/zenia-web', preview: 'github.com' },
    { id: 'l3', title: 'Dribbble Showcase Portfolio', url: 'https://dribbble.com/sarah_m', preview: 'dribbble.com' },
  ];

  // Group members if group
  const groupMembers = [
    { id: 'current_user_id', name: 'Amina Kaunga (You)', role: 'Admin', avatar: '/assets/images/amina_avatar_1790280951312.jpg', status: 'Online' },
    { id: 'user_sarah', name: 'Sarah Mwangi', role: 'Member', avatar: '/src/assets/images/sarah_avatar_1790802224123.jpg', status: 'Online' },
    { id: 'user_alex', name: 'Alex Johnson', role: 'Member', avatar: '/src/assets/images/alex_avatar_1790802235334.jpg', status: 'Online' },
    { id: 'user_team', name: 'James Kimani', role: 'Creator', avatar: '/src/assets/images/team_design_1790802245828.jpg', status: 'Last seen 2h ago' },
  ];

  // Mutual groups with verified local assets
  const commonGroups = [
    { id: 'cg1', name: 'Design Team', members: 12, avatar: '/src/assets/images/team_design_1790802245828.jpg' },
    { id: 'cg2', name: 'Tech Innovators TZ', members: 48, avatar: '/src/assets/images/tech_community_1790802256885.jpg' },
    { id: 'cg3', name: 'Campus Hub 2026', members: 86, avatar: '/assets/images/concert_festival_1790280974630.jpg' },
  ];

  const starredMessages = messages.filter((m) => m.isStarred);
  const activeTheme = CHAT_THEMES.find((t) => t.id === currentThemeId) || CHAT_THEMES[0];

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneNumber);
    }
    onShowToast(`Namba ya simu ${phoneNumber} imenakiliwa`);
  };

  const handleCopyShareLink = () => {
    const link = `https://zenia.chat/${username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    onShowToast(`Kiungo cha wasifu kimenakiliwa: ${link}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Slide-over / Modal container */}
      <div className="w-full sm:max-w-md h-full bg-[#080B14] text-white border-l border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Sleek Native Mobile Navigation Bar */}
        <div className="bg-[#0B0F1D]/90 backdrop-blur-md px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Rudi nyuma"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-sm sm:text-base text-white truncate">
              {isGroup ? 'Taarifa za Kikundi' : 'Taarifa za Mawasiliano'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyShareLink}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Sambaza wasifu"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Clean, unified sections like real WhatsApp / iOS */}
        <div className="flex-1 overflow-y-auto space-y-3.5 p-3.5 sm:p-4 pb-24 select-none">
          
          {/* Top Hero Profile Section */}
          <div className="flex flex-col items-center text-center pt-2 pb-3">
            {/* Avatar Circle with Zoom on Tap */}
            <div
              onClick={() => setShowAvatarViewer(true)}
              className="relative cursor-pointer group mb-3"
              title="Bonyeza kuona picha kubwa"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-cyan-500/20 group-hover:ring-cyan-400 shadow-2xl transition-all duration-300 group-hover:scale-105 bg-slate-900">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#080B14]" />
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Name, Verified & Online Pill */}
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 flex items-center justify-center gap-1.5">
              <span>{displayName}</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            </h3>
            
            <p className="text-xs text-slate-400 font-mono mb-2">@{username}</p>

            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isGroup ? `${groupMembers.length} members online` : 'Online'}</span>
            </span>

            {/* Clean, Unified 4 Action Circles (Audio, Video, Search, Share) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-sm mt-5">
              {/* Audio Call */}
              <button
                onClick={() => {
                  onClose();
                  onStartCall('voice');
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#0E1324] border border-white/[0.06] hover:border-cyan-500/40 hover:bg-white/[0.04] active:scale-95 transition-all text-slate-200 hover:text-white"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium">Audio</span>
              </button>

              {/* Video Call */}
              <button
                onClick={() => {
                  onClose();
                  onStartCall('video');
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#0E1324] border border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.04] active:scale-95 transition-all text-slate-200 hover:text-white"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium">Video</span>
              </button>

              {/* Search */}
              <button
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#0E1324] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.04] active:scale-95 transition-all text-slate-200 hover:text-white"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium">Search</span>
              </button>

              {/* Share */}
              <button
                onClick={handleCopyShareLink}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#0E1324] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-white/[0.04] active:scale-95 transition-all text-slate-200 hover:text-white"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Group 1: About / Status & Phone Number */}
          <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm divide-y divide-white/[0.06]">
            {/* Bio row */}
            <div className="p-3.5 sm:p-4">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                {isGroup ? 'Maelezo ya Kikundi' : 'About / Status'}
              </p>
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">{bio}</p>
              <p className="text-[10px] text-slate-500 mt-1">{bioDate}</p>
            </div>

            {/* Phone row */}
            {!isGroup && (
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Namba ya Simu</p>
                  <p className="text-sm font-semibold text-white font-mono">{phoneNumber}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Mobile • WhatsApp Verified</p>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-semibold border border-white/5"
                  title="Nakili namba"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: Media, Links and Docs */}
          <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] p-3.5 sm:p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Media, Links and Docs</h4>
                <p className="text-[10px] text-slate-400">{mediaItems.length + docItems.length + linkItems.length} shared items</p>
              </div>
              {/* Clean segmented pills */}
              <div className="flex bg-[#080B14] p-1 rounded-xl border border-white/[0.06] text-xs">
                <button
                  onClick={() => setMediaTab('media')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    mediaTab === 'media' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Media
                </button>
                <button
                  onClick={() => setMediaTab('docs')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    mediaTab === 'docs' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Docs
                </button>
                <button
                  onClick={() => setMediaTab('links')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    mediaTab === 'links' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Links
                </button>
              </div>
            </div>

            {/* Media Grid View */}
            {mediaTab === 'media' && (
              <div className="grid grid-cols-3 gap-2 pt-0.5 animate-in fade-in">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPreviewImage(item.url)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 group cursor-pointer border border-white/[0.06] hover:border-cyan-400 transition-all"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Docs List View */}
            {mediaTab === 'docs' && (
              <div className="space-y-1.5 pt-0.5 animate-in fade-in">
                {docItems.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onShowToast(`Faili '${doc.name}' limepakuliwa`)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer border border-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-white shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Links List View */}
            {mediaTab === 'links' && (
              <div className="space-y-1.5 pt-0.5 animate-in fade-in">
                {linkItems.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{l.title}</p>
                        <p className="text-[10px] text-cyan-400 truncate">{l.preview}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Group Participants Section (if isGroup) */}
          {isGroup && (
            <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] p-3.5 sm:p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Participants ({groupMembers.length})</h4>
                  <p className="text-[10px] text-slate-400">Washiriki wote wa kikundi</p>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Ongeza</span>
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                        />
                        {member.status === 'Online' && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0E1324]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.status}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        member.role.includes('Admin') || member.role.includes('Creator')
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Notifications & Preferences (Clean Inset Group) */}
          <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm divide-y divide-white/[0.06]">
            {/* Mute notifications */}
            <button
              onClick={() => setShowMuteModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  {conversation.mutedUntil ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Mute notifications</p>
                  <p className="text-[11px] text-slate-400">
                    {conversation.mutedUntil ? `Muted (${conversation.mutedUntil})` : 'Zima sauti za jumbe'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>

            {/* Custom notifications */}
            <div className="w-full flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Custom notifications</p>
                  <p className="text-[11px] text-slate-400">Mlango maalum wa simu na mtikisiko</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCustomNotifications(!customNotifications);
                  onShowToast(customNotifications ? 'Custom notifications zimezimwa' : 'Custom notifications zimewashwa');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  customNotifications ? 'bg-cyan-500' : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    customNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Media visibility */}
            <div className="w-full flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Media visibility</p>
                  <p className="text-[11px] text-slate-400">Hifadhi picha mpya kwenye ghala</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMediaVisibility(!mediaVisibility);
                  onShowToast(mediaVisibility ? 'Media visibility imezimwa' : 'Picha zitahifadhiwa kwenye simu');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  mediaVisibility ? 'bg-cyan-500' : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    mediaVisibility ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Group 4: Privacy & Security (Clean Inset Group) */}
          <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm divide-y divide-white/[0.06]">
            {/* Encryption */}
            <button
              onClick={() => setShowEncryptionModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-semibold text-white">Encryption</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Jumbe na simu zinalindwa kwa E2EE</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>

            {/* Disappearing messages */}
            <button
              onClick={() => setShowDisappearingModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Disappearing messages</p>
                  <p className="text-[11px] text-slate-400">
                    {disappearingTimer ? `Kila baada ya ${disappearingTimer}` : 'Imezimwa (Off)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {disappearingTimer && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {disappearingTimer}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
            </button>

            {/* Chat theme */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Chat theme</p>
                  <p className="text-[11px] text-slate-400">{activeTheme.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-full ${activeTheme.previewBubble} ring-2 ring-white/20`} />
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
            </button>

            {/* Starred messages */}
            <button
              onClick={() => setShowStarredModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Starred messages</p>
                  <p className="text-[11px] text-slate-400">{starredMessages.length} jumbe zenye nyota</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {starredMessages.length}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
            </button>
          </div>

          {/* Group 5: Groups in common (Vikundi vya Pamoja) */}
          {!isGroup && (
            <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm divide-y divide-white/[0.06]">
              <div className="p-3.5 flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-white">Vikundi vya Pamoja (Groups in common)</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {commonGroups.length}
                </span>
              </div>

              {commonGroups.map((grp) => (
                <div
                  key={grp.id}
                  onClick={() => onShowToast(`Umekwenda kwenye kikundi cha ${grp.name}`)}
                  className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={grp.avatar}
                      alt={grp.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 bg-slate-900"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{grp.name}</p>
                      <p className="text-[11px] text-slate-400">{grp.members} members</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Group 6: Favorites & Custom Lists */}
          <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm divide-y divide-white/[0.06]">
            {/* Add to Favorites */}
            <button
              onClick={() => {
                const nextFav = !conversation.isFavorite;
                if (onUpdateConversation) {
                  onUpdateConversation({ ...conversation, isFavorite: nextFav });
                }
                onShowToast(nextFav ? 'Imeongezwa kwenye Vipendwa' : 'Imeondolewa kwenye Vipendwa');
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
                  <Heart className={`w-4 h-4 ${conversation.isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {conversation.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </span>
              </div>
              {conversation.isFavorite && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold">
                  Favorite
                </span>
              )}
            </button>

            {/* Add to list */}
            <button
              onClick={() => setShowAddToListModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Add to list</p>
                  <p className="text-[11px] text-slate-400">
                    {conversation.lists && conversation.lists.length > 0
                      ? conversation.lists.join(', ')
                      : 'Panga mazungumzo kwenye folda'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>
          </div>

          {/* Group 7: Danger Zone: Block, Report, Clear, Delete */}
          <div className="bg-[#0E1324] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm divide-y divide-white/[0.06]">
            {/* Block / Unblock */}
            {!isGroup && (
              <button
                onClick={() => {
                  if (conversation.isBlocked) {
                    if (onUpdateConversation) {
                      onUpdateConversation({ ...conversation, isBlocked: false });
                    }
                    onShowToast(`Umemruhusu ${displayName} (Unblocked)`);
                  } else {
                    setShowBlockModal(true);
                  }
                }}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-amber-500/10 text-left transition-colors text-amber-400"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Ban className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  {conversation.isBlocked ? `Unblock ${displayName}` : `Block ${displayName}`}
                </span>
              </button>
            )}

            {/* Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center gap-3 p-3.5 hover:bg-amber-500/10 text-left transition-colors text-amber-400"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold">Report {displayName}</span>
            </button>

            {/* Clear chat */}
            <button
              onClick={() => setShowClearModal(true)}
              className="w-full flex items-center gap-3 p-3.5 hover:bg-white/[0.04] text-left transition-colors text-slate-300"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <MinusCircle className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">Clear chat</span>
            </button>

            {/* Delete chat */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 p-3.5 hover:bg-rose-500/10 text-left transition-colors text-rose-400"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold">Delete {isGroup ? 'group' : 'chat'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL PHOTO / AVATAR ZOOM MODAL */}
      {showAvatarViewer && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in zoom-in-95">
          <div className="w-full max-w-lg flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAvatarViewer(false)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-white text-base">{displayName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onShowToast('Picha imehifadhiwa kwenye ghala (Saved)')}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopyShareLink}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="max-w-md w-full max-h-[70vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* ENCRYPTION VERIFICATION MODAL */}
      {showEncryptionModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Verify Security Code</h3>
            <p className="text-xs text-slate-400 mb-5">
              Messages and calls with {displayName} are end-to-end encrypted. Scan the QR code or compare the 60 digits.
            </p>

            <div className="p-4 bg-white rounded-2xl mb-5 shadow-xl flex items-center justify-center">
              <QrCode className="w-36 h-36 text-slate-950" />
            </div>

            <div className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-mono text-cyan-300 grid grid-cols-3 gap-2 text-center mb-5 tracking-widest">
              <span>42890</span>
              <span>18374</span>
              <span>90214</span>
              <span>88392</span>
              <span>01928</span>
              <span>74621</span>
              <span>55319</span>
              <span>20918</span>
              <span>44910</span>
              <span>88219</span>
              <span>30192</span>
              <span>61520</span>
            </div>

            <button
              onClick={() => setShowEncryptionModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs active:scale-95 transition-all"
            >
              Imethibitishwa (Verified)
            </button>
          </div>
        </div>
      )}

      {/* MUTE NOTIFICATIONS MODAL */}
      {showMuteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BellOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mute notifications</h3>
                <p className="text-xs text-slate-400">Wengine hawatajua umeweka sauti kimya.</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {[
                { label: '8 hours', val: '8h' as const },
                { label: '1 week', val: '1w' as const },
                { label: 'Always', val: 'always' as const },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    if (onUpdateConversation) {
                      onUpdateConversation({ ...conversation, mutedUntil: opt.val });
                    }
                    onShowToast(`Taarifa zimezimwa kwa ${opt.label}`);
                    setShowMuteModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                    conversation.mutedUntil === opt.val
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-bold'
                      : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-200'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  {conversation.mutedUntil === opt.val && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}

              {conversation.mutedUntil && (
                <button
                  onClick={() => {
                    if (onUpdateConversation) {
                      onUpdateConversation({ ...conversation, mutedUntil: null });
                    }
                    onShowToast('Taarifa zimewashwa tena (Unmuted)');
                    setShowMuteModal(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold text-center"
                >
                  Washa taarifa sasa (Unmute)
                </button>
              )}
            </div>

            <button
              onClick={() => setShowMuteModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
            >
              Ghairi (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* DISAPPEARING MESSAGES MODAL */}
      {showDisappearingModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Disappearing Messages</h3>
            <p className="text-xs text-slate-400 mb-4">
              Jumbe mpya kwenye mazungumzo haya zitatoweka kiotomatiki baada ya muda uliochaguliwa.
            </p>

            <div className="space-y-2 mb-5">
              {[
                { label: 'Off', val: null },
                { label: '24 hours', val: '24h' },
                { label: '7 days', val: '7d' },
                { label: '90 days', val: '90d' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    onSetDisappearingTimer(opt.val);
                    setShowDisappearingModal(false);
                    onShowToast(opt.val ? `Jumbe zitatoweka baada ya ${opt.label}` : 'Disappearing messages imezimwa');
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                    disappearingTimer === opt.val
                      ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                      : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-300'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  {disappearingTimer === opt.val && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDisappearingModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
            >
              Ghairi (Close)
            </button>
          </div>
        </div>
      )}

      {/* THEMES MODAL */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0E1324] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white">Chat Themes</h3>
                <p className="text-xs text-slate-400">Rangi ya mandhari na mapovu ya maongezi itabadilika.</p>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto p-1 py-4 flex-1">
              {CHAT_THEMES.map((theme) => {
                const isSelected = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme.id);
                      onShowToast(`Mandhari ya "${theme.name}" imewekwa`);
                    }}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-full h-20 rounded-xl mb-2.5 overflow-hidden flex flex-col justify-center items-center p-2 relative shadow-inner ${theme.previewBg}`}
                      style={theme.wallpaperStyle}
                    >
                      <div className={`w-3/4 py-1 px-2 rounded-lg text-[9px] mb-1.5 self-end ${theme.userBubbleClass}`}>
                        Hey there! 👋
                      </div>
                      <div className={`w-3/4 py-1 px-2 rounded-lg text-[9px] self-start ${theme.otherBubbleClass}`}>
                        Mambo vipi! ✨
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-white truncate">{theme.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Imekamilika (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STARRED MESSAGES MODAL */}
      {showStarredModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0E1324] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Starred Messages</h3>
                  <p className="text-xs text-slate-400">{starredMessages.length} jumbe zilizohifadhiwa</p>
                </div>
              </div>
              <button
                onClick={() => setShowStarredModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 p-1">
              {starredMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Star className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Hakuna ujumbe wenye nyota bado</p>
                  <p className="text-xs text-slate-500">Shikilia ujumbe wowote kisha bonyeza Nyota ili kuuhifadhi hapa.</p>
                </div>
              ) : (
                starredMessages.map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-cyan-400">{m.senderName}</span>
                      <span>{m.createdAt}</span>
                    </div>
                    <p className="text-xs text-white">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowStarredModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs"
              >
                Funga (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TO LIST MODAL */}
      {showAddToListModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">Add to List</h3>
            <p className="text-xs text-slate-400 mb-4">Chagua orodha au tengeneza mpya:</p>

            <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
              {customLists.map((listName) => {
                const hasList = conversation.lists?.includes(listName);
                return (
                  <button
                    key={listName}
                    onClick={() => {
                      const cur = conversation.lists || [];
                      const next = hasList ? cur.filter((l) => l !== listName) : [...cur, listName];
                      if (onUpdateConversation) {
                        onUpdateConversation({ ...conversation, lists: next });
                      }
                      onShowToast(hasList ? `Imeondolewa kwenye ${listName}` : `Imeongezwa kwenye ${listName}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                      hasList ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold' : 'bg-white/5 border-white/5 text-slate-200'
                    }`}
                  >
                    <span>{listName}</span>
                    {hasList && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Jina la orodha mpya..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => {
                  if (newListName.trim()) {
                    onCreateCustomList(newListName.trim());
                    const cur = conversation.lists || [];
                    if (onUpdateConversation) {
                      onUpdateConversation({ ...conversation, lists: [...cur, newListName.trim()] });
                    }
                    onShowToast(`Orodha '${newListName.trim()}' imeundwa na kuongezwa`);
                    setNewListName('');
                  }
                }}
                disabled={!newListName.trim()}
                className="px-3 py-2 bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Unda</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddToListModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
            >
              Imekamilika (Done)
            </button>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL (For groups) */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">Ongeza Mshiriki Kwenye Kikundi</h3>
            <p className="text-xs text-slate-400 mb-4">Chagua mtu kutoka kwenye orodha yako:</p>

            <div className="space-y-2 mb-5">
              {[
                { name: 'Sarah Mwangi', username: '@sarah_m', avatar: '/src/assets/images/sarah_avatar_1790802224123.jpg' },
                { name: 'Alex Johnson', username: '@alex_j', avatar: '/src/assets/images/alex_avatar_1790802235334.jpg' },
                { name: 'Amina Kaunga', username: '@amina_k', avatar: '/assets/images/amina_avatar_1790280951312.jpg' },
              ].map((contact) => (
                <div key={contact.username} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{contact.name}</p>
                      <p className="text-[10px] text-slate-400">{contact.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onShowToast(`${contact.name} ameongezwa kwenye kikundi!`);
                      setShowAddMemberModal(false);
                    }}
                    className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddMemberModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
            >
              Funga (Close)
            </button>
          </div>
        </div>
      )}

      {/* BLOCK CONTACT MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-rose-500/20 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Ban className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Block {displayName}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Mawasiliano yaliyozuiwa hayataweza kukupigia simu wala kukutumia ujumbe.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  if (onUpdateConversation) {
                    onUpdateConversation({ ...conversation, isBlocked: true });
                  }
                  setShowBlockModal(false);
                  onShowToast(`Umemzuia ${displayName} (Blocked)`);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-amber-500/20 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ripoti {displayName}</h3>
                <p className="text-xs text-slate-400">Jumbe 5 za mwisho zitatumwa kwa uchunguzi.</p>
              </div>
            </div>

            <div className="space-y-1.5 mb-5 text-xs">
              {[
                'Spam or commercial fraud',
                'Harassment or hate speech',
                'Inappropriate or harmful media',
                'Pretending to be someone else',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between ${
                    reportReason === reason
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <span>{reason}</span>
                  {reportReason === reason && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  onShowToast(`Ripoti ya ${displayName} imetumwa: ${reportReason}. Asante!`);
                }}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Tuma Ripoti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR CHAT MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <MinusCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Clear this chat?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Jumbe zote kwenye mazungumzo haya zitafutwa. Mazungumzo yatabaki kwenye orodha yako.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  if (onClearChat) {
                    onClearChat();
                  } else if (onUpdateConversation) {
                    onUpdateConversation({
                      ...conversation,
                      lastMessage: 'Messages cleared',
                      unreadCount: 0,
                    });
                  }
                  setShowClearModal(false);
                  onShowToast('Jumbe zote zimefutwa (Chat cleared)');
                }}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CHAT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1324] border border-rose-500/20 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete this {isGroup ? 'group' : 'chat'}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Mazungumzo haya yatafutwa kabisa kutoka kwenye akaunti yako.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  onClose();
                  if (onDeleteConversation) {
                    onDeleteConversation(conversation.id);
                  }
                  onShowToast('Mazungumzo yamefutwa kabisa');
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW SINGLE IMAGE MODAL */}
      {selectedPreviewImage && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in zoom-in-95">
          <div className="w-full max-w-lg flex items-center justify-between mb-4 px-2">
            <button
              onClick={() => setSelectedPreviewImage(null)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                onShowToast('Picha imehifadhiwa');
                setSelectedPreviewImage(null);
              }}
              className="p-2 rounded-full bg-cyan-500 text-slate-950 font-bold active:scale-95"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-md w-full max-h-[70vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950">
            <img
              src={selectedPreviewImage}
              alt="Shared preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
