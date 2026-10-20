import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ArrowLeft,
  Heart,
  MessageSquare,
  MessageCircle,
  Share2,
  Plus,
  Send,
  Sparkles,
  Check,
  Repeat,
  MoreHorizontal,
  ArrowUpRight,
  Bookmark,
  X,
  Image as ImageIcon,
  CheckCircle2,
  TrendingUp,
  Flame,
  Globe,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import { CommunityItem, UserProfile, AvatarShapeStyle } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { useTheme } from '../../context/ThemeContext';
import { getAvatarStyleDef, getStoredAvatarStyle } from '../profile/avatarStyles';

// Generated high-fidelity mockups & portraits matching the user's reference screenshots
import mockupFintech from '../../assets/images/design_mockup_fintech_1792443758227.jpg';
import mockupTask from '../../assets/images/design_mockup_task_1792443757863.jpg';
import mockupDashboard from '../../assets/images/design_mockup_dashboard_1792443775012.jpg';
import avatarAdam from '../../assets/images/uiux_adam_avatar_1792443796000.jpg';
import avatarSarah from '../../assets/images/sarah_portrait_1791059459448.jpg';
import avatarAlex from '../../assets/images/alex_portrait_1791059432462.jpg';
import avatarAmina from '../../assets/images/amina_avatar_1790280951312.jpg';
import avatarPolina from '../../assets/images/polina_avatar_1792447821343.jpg';

export interface RichCommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorPhoto: string;
  authorRole?: string;
  authorBadgeNumber?: string | number;
  avatarStyle?: AvatarShapeStyle;
  isVerified?: boolean;
  timeAgo: string;
  content: string;
  hashtags: string[];
  mediaImages: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  commentsList: Array<{
    id: string;
    authorName: string;
    authorHandle: string;
    authorPhoto: string;
    text: string;
    timeAgo: string;
  }>;
}

interface CommunityViewProps {
  currentUser: UserProfile;
  onBack?: () => void;
  onStartChatWithUser?: (user: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentUser,
  onBack,
  onStartChatWithUser,
}) => {
  const { isDark } = useTheme();

  // Current view mode: 'community' (Screenshot 2: Design Threads) vs 'creator' (Screenshot 1: Sarah Connor)
  const [viewMode, setViewMode] = useState<'community' | 'creator'>('community');

  // Search query for posts & topics
  const [searchQuery, setSearchQuery] = useState('');

  // Active community ID filter ('all_joined' or specific community ID like 'comm_design_threads')
  const [activeCommunityId, setActiveCommunityId] = useState('comm_design_threads');

  // Track joined communities per user with localStorage persistence
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`zenia_joined_communities_${currentUser?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['comm_design_threads'];
  });

  // Track followed creator channels (e.g. Sarah Connor) with localStorage persistence
  const [followedCreatorHandles, setFollowedCreatorHandles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`zenia_followed_creators_${currentUser?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['sarah.connor'];
  });

  // Dynamic follower counts for creators
  const [creatorFollowersCount, setCreatorFollowersCount] = useState(16600);

  // Sync memberships to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        `zenia_joined_communities_${currentUser?.id || 'guest'}`,
        JSON.stringify(joinedCommunityIds)
      );
    } catch {}
  }, [joinedCommunityIds, currentUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `zenia_followed_creators_${currentUser?.id || 'guest'}`,
        JSON.stringify(followedCreatorHandles)
      );
    } catch {}
  }, [followedCreatorHandles, currentUser?.id]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create post modal state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostTags, setNewPostTags] = useState('#uiux #design #zenia');
  const [selectedMockupAttachment, setSelectedMockupAttachment] = useState<string>(mockupTask);

  // Active post for comment drawer
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState('');

  // Lightbox preview for mockup images
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // Curated communities matching East African & global creator design hubs
  const communitiesList = [
    {
      id: 'comm_design_threads',
      name: 'Design Threads',
      description: 'Beta Community kwa ajili ya wabunifu wa UI/UX, product design, mobile apps & design systems.',
      category: 'UI/UX & Product Design',
      membersCount: 16600,
      onlineCount: 98,
      badgeTag: 'BETA COMMUNITY',
      gradient: 'from-cyan-400 via-sky-500 to-lime-300',
      createdBy: 'sarah.connor',
      isJoined: true,
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'comm_tech_tanzania',
      name: 'Tech Innovators TZ',
      description: 'Wasanidi programu, fintech builders na AI creators Dar es Salaam & East Africa.',
      category: 'Technology & AI Engineering',
      membersCount: 24500,
      onlineCount: 142,
      badgeTag: 'TECH HUB TANZANIA',
      gradient: 'from-blue-500 via-indigo-600 to-cyan-400',
      createdBy: 'alex.kimani',
      isJoined: false,
      createdAt: '2026-01-12T00:00:00Z',
    },
    {
      id: 'comm_kariakoo_biz',
      name: 'Kariakoo Digital Hub',
      description: 'Wafanyabiashara wa soko, mitindo, uagizaji mizigo na biashara za mtandaoni.',
      category: 'Commerce & Digital Market',
      membersCount: 38200,
      onlineCount: 310,
      badgeTag: 'BIASHARA & SOKO KUU',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      createdBy: 'fresh_store_dar',
      isJoined: false,
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'comm_creators_club',
      name: 'Dar Creators Club',
      description: 'Photographers, visual artists, video directors na podcasters wa Tanzania.',
      category: 'Creative Media & Visuals',
      membersCount: 19800,
      onlineCount: 85,
      badgeTag: 'CREATIVE STUDIO',
      gradient: 'from-fuchsia-500 via-purple-600 to-pink-400',
      createdBy: 'amina_kaunga',
      isJoined: false,
      createdAt: '2026-01-18T00:00:00Z',
    },
  ];

  // Active community helper
  const activeCommunity =
    communitiesList.find((c) => c.id === activeCommunityId) || communitiesList[0];

  // Membership helpers
  const isFollowingCreator = followedCreatorHandles.includes('sarah.connor');
  const isCurrentCommunityJoined =
    activeCommunityId === 'all_joined'
      ? joinedCommunityIds.length > 0
      : joinedCommunityIds.includes(activeCommunityId);

  // Toggle membership functions
  const toggleJoinCommunity = (communityId: string) => {
    const targetComm = communitiesList.find((c) => c.id === communityId);
    const commName = targetComm?.name || 'Kikundi';
    setJoinedCommunityIds((prev) => {
      const isAlready = prev.includes(communityId);
      if (isAlready) {
        showToast(`Umeondoka kwenye ${commName}`);
        return prev.filter((id) => id !== communityId);
      } else {
        showToast(`Umejiunga na ${commName}! Machapisho yamefunguliwa ✓`);
        return [...prev, communityId];
      }
    });
  };

  const toggleFollowCreator = (handle: string, name: string) => {
    setFollowedCreatorHandles((prev) => {
      const isAlready = prev.includes(handle);
      if (isAlready) {
        showToast(`Umeacha kumfuata ${name}`);
        setCreatorFollowersCount((c) => Math.max(1, c - 1));
        return prev.filter((h) => h !== handle);
      } else {
        showToast(`Umejiunga na chaneli ya ${name}! Machapisho yamefunguliwa ✓`);
        setCreatorFollowersCount((c) => c + 1);
        return [...prev, handle];
      }
    });
  };

  // Rich posts initialized matching reference screenshots
  const [posts, setPosts] = useState<RichCommunityPost[]>([
    {
      id: 'post_polina_zakharova',
      communityId: 'comm_design_threads',
      authorId: 'user_polina',
      authorName: 'Polina Zakharova',
      authorHandle: 'polina.z',
      authorRole: 'Brand Designer · VK Tech',
      authorBadgeNumber: '3',
      avatarStyle: 'squircle',
      isVerified: true,
      authorPhoto: avatarPolina,
      timeAgo: '5 min',
      content:
        "I'm the only one who noticed that everyone on Instagram is so successful and happy. And here it's like there's a smoking room at 3 a.m.",
      hashtags: [],
      mediaImages: [],
      likesCount: 10,
      commentsCount: 10,
      repostsCount: 10,
      sharesCount: 10,
      isLiked: true,
      isReposted: false,
      commentsList: [
        {
          id: 'cp1',
          authorName: 'Adom UI/UX',
          authorHandle: 'uiux.adom',
          authorPhoto: avatarAdam,
          text: 'Haha facts! Real candid discussions happen right here in communities.',
          timeAgo: '3 min',
        },
      ],
    },
    {
      id: 'post_adam_task',
      communityId: 'comm_design_threads',
      authorId: 'user_adam',
      authorName: 'Adom UI/UX',
      authorHandle: 'uiux.adom',
      authorRole: 'Lead UI/UX Designer · Dar es Salaam',
      authorBadgeNumber: '5',
      isVerified: true,
      authorPhoto: avatarAdam,
      timeAgo: '8 h.',
      content:
        'Excited to share my latest Task Manager Mobile App design, created to make productivity simple, intuitive, and enjoyable.',
      hashtags: ['#uiux', '#mobileapps', '#productdesign'],
      mediaImages: [mockupTask, mockupFintech],
      likesCount: 23,
      commentsCount: 64,
      repostsCount: 14,
      sharesCount: 8,
      isLiked: false,
      isReposted: false,
      commentsList: [
        {
          id: 'c1',
          authorName: 'Sarah Connor',
          authorHandle: 'sarah.connor',
          authorPhoto: avatarSarah,
          text: 'Love the contrast on dark mode! The micro-interaction on the progress bar is top tier. 🔥',
          timeAgo: '6 h.',
        },
        {
          id: 'c2',
          authorName: 'Alex Kimani',
          authorHandle: 'alex_k',
          authorPhoto: avatarAlex,
          text: 'Hii design iko clean sana bro. Je umeitumia Figma auto-layout au Framer components?',
          timeAgo: '4 h.',
        },
        {
          id: 'c3',
          authorName: 'Amina Kaunga',
          authorHandle: 'amina_kaunga',
          authorPhoto: avatarAmina,
          text: 'Great work! Ingekuwa vizuri kuona pia Swahili language localization kwenye navigation.',
          timeAgo: '2 h.',
        },
      ],
    },
    {
      id: 'post_sarah_veri',
      communityId: 'comm_design_threads',
      authorId: 'user_sarah_connor',
      authorName: 'Sarah Connor',
      authorHandle: 'sarah.connor',
      authorRole: 'Product & Design Systems Architect',
      authorBadgeNumber: '7',
      isVerified: true,
      authorPhoto: avatarSarah,
      timeAgo: '10 h.',
      content:
        'The business task was to restructure the Veri health platform into a single, scalable system. We centralized health data into a single dashboard, simplified core flows, and reduced patient checkout time by 42%.',
      hashtags: ['#fintech', '#healthcare', '#dashboard', '#designsystems'],
      mediaImages: [mockupDashboard, mockupFintech],
      likesCount: 142,
      commentsCount: 38,
      repostsCount: 29,
      sharesCount: 19,
      isLiked: true,
      isReposted: false,
      commentsList: [
        {
          id: 'c4',
          authorName: 'Daniel Mrosso',
          authorHandle: 'daniel_m',
          authorPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          text: 'Brilliant UX case study Sarah! The dashboard metrics card hierarchy is spot on.',
          timeAgo: '7 h.',
        },
      ],
    },
    {
      id: 'post_alex_fintech',
      communityId: 'comm_tech_tanzania',
      authorId: 'user_alex',
      authorName: 'Alex Kimani',
      authorHandle: 'alex_k',
      authorRole: 'FinTech Engineering & Mobile Dev',
      authorBadgeNumber: '4',
      isVerified: true,
      authorPhoto: avatarAlex,
      timeAgo: '14 h.',
      content:
        'Building next-generation Mobile Money checkout experiences with automated QR fallback for M-Pesa, Airtel Money & Zenia Wallet. Zero friction, instant webhook confirmations.',
      hashtags: ['#fintech', '#daressalaam', '#tanzania', '#payments'],
      mediaImages: [mockupFintech, mockupDashboard],
      likesCount: 89,
      commentsCount: 21,
      repostsCount: 16,
      sharesCount: 11,
      isLiked: false,
      isReposted: false,
      commentsList: [
        {
          id: 'c5',
          authorName: 'Adom UI/UX',
          authorHandle: 'uiux.adom',
          authorPhoto: avatarAdam,
          text: 'Crucial for East African adoption! Keep building.',
          timeAgo: '8 h.',
        },
      ],
    },
    {
      id: 'post_kariakoo_shipment',
      communityId: 'comm_kariakoo_biz',
      authorId: 'user_fresh_store',
      authorName: 'Fresh Store Dar',
      authorHandle: 'fresh_store_dar',
      authorRole: 'Meneja Mauzo & Uagizaji · Kariakoo',
      authorBadgeNumber: '8',
      isVerified: true,
      authorPhoto: avatarAdam,
      timeAgo: '2 h.',
      content:
        'Mzigo mpya wa vifaa vya kielektroniki, accessories na bidhaa za kisasa kutoka Guangzhou umewasili leo bandarini Dar! Bei zote za jumla (wholesale) kwa wanachama wa Kariakoo Digital Hub ziko tayari. Karibuni dukani Msimbazi.',
      hashtags: ['#kariakoo', '#biashara', '#agizamzigo', '#tanzania'],
      mediaImages: [mockupDashboard, mockupFintech],
      likesCount: 56,
      commentsCount: 19,
      repostsCount: 12,
      sharesCount: 15,
      isLiked: false,
      isReposted: false,
      commentsList: [
        {
          id: 'ck1',
          authorName: 'Fatma Said',
          authorHandle: 'fatma_s',
          authorPhoto: avatarAmina,
          text: 'Je mna delivery ya mizigo kwa mikoa ya Mwanza na Arusha?',
          timeAgo: '1 h.',
        },
      ],
    },
    {
      id: 'post_fatma_payments',
      communityId: 'comm_kariakoo_biz',
      authorId: 'user_fatma',
      authorName: 'Fatma Said',
      authorHandle: 'fatma_s',
      authorRole: 'Biashara ya Mtandaoni & Digital Payments',
      authorBadgeNumber: '6',
      isVerified: true,
      authorPhoto: avatarAmina,
      timeAgo: '5 h.',
      content:
        'Kidokezo cha wiki kwa wafanyabiashara wa soko: Wateja 80% wanapendelea kulipa kwa Lipa Namba au Zenia QR Checkout kuliko fedha taslimu. Hakikisha mfumo wako hauna ucheleweshaji wa SMS za uthibitisho.',
      hashtags: ['#fintech', '#biashara', '#daressalaam'],
      mediaImages: [],
      likesCount: 74,
      commentsCount: 14,
      repostsCount: 9,
      sharesCount: 7,
      isLiked: true,
      isReposted: false,
      commentsList: [],
    },
    {
      id: 'post_amina_bagamoyo',
      communityId: 'comm_creators_club',
      authorId: 'user_amina',
      authorName: 'Amina Kaunga',
      authorHandle: 'amina_kaunga',
      authorRole: 'Visual Artist & Creative Director · Dar',
      authorBadgeNumber: '9',
      isVerified: true,
      authorPhoto: avatarAmina,
      timeAgo: '3 h.',
      content:
        'Behind the scenes ya photo session yetu ya wiki hii Bagamoyo. Kutumia mwangaza wa asili (natural sunlight) asubuhi na mapema kunatoa picha zenye hisia na utulivu wa kipekee bila vifaa ghali sana.',
      hashtags: ['#photography', '#creatives', '#tanzania', '#arts'],
      mediaImages: [mockupTask, mockupDashboard],
      likesCount: 118,
      commentsCount: 27,
      repostsCount: 22,
      sharesCount: 14,
      isLiked: true,
      isReposted: false,
      commentsList: [
        {
          id: 'ca1',
          authorName: 'Sarah Connor',
          authorHandle: 'sarah.connor',
          authorPhoto: avatarSarah,
          text: 'Mwangaza kwenye framing hii uko stunning Amina! Love the natural warm tone.',
          timeAgo: '2 h.',
        },
      ],
    },
    {
      id: 'post_juma_luts',
      communityId: 'comm_creators_club',
      authorId: 'user_juma',
      authorName: 'Juma Visuals',
      authorHandle: 'juma_v',
      authorRole: 'Cinematographer & Colorist',
      authorBadgeNumber: '5',
      isVerified: true,
      authorPhoto: avatarAlex,
      timeAgo: '7 h.',
      content:
        'Nimetengeneza LUTs maalum za rangi ya ngozi ya Kiafrika kwa ajili ya Premiere Pro na DaVinci Resolve (Sony S-Log3 to Rec.709). Wanachama wote wa Dar Creators Club mnaweza kuzitumia bila malipo!',
      hashtags: ['#videoediting', '#colorgrading', '#darcreators'],
      mediaImages: [],
      likesCount: 63,
      commentsCount: 18,
      repostsCount: 31,
      sharesCount: 24,
      isLiked: false,
      isReposted: false,
      commentsList: [],
    },
  ]);

  // Filter posts based on channel membership and search:
  // "kama musika hajajiuga nachanel yamtuhusika asiweze kuonaposti yoyote kama amejiunga moja au nyingi aweze kuziona hapo"
  const visiblePosts = posts.filter((post) => {
    // 1. Channel / Creator Membership Check
    if (viewMode === 'creator') {
      // User must follow Sarah Connor's channel to see her posts
      if (!isFollowingCreator) {
        return false;
      }
      if (post.authorHandle !== 'sarah.connor' && !post.content.toLowerCase().includes('design')) {
        return false;
      }
    } else {
      if (activeCommunityId === 'all_joined') {
        // Can only see posts of communities the user has joined
        if (!joinedCommunityIds.includes(post.communityId)) {
          return false;
        }
      } else {
        // Must be joined to this specific community to see its posts
        if (!isCurrentCommunityJoined) {
          return false;
        }
        if (post.communityId !== activeCommunityId) {
          return false;
        }
      }
    }

    // 2. Search query filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.authorHandle.toLowerCase().includes(query) ||
      post.hashtags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const activePostForComments = posts.find((p) => p.id === activeCommentPostId);

  // Toggle Like with instant tactile feedback
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: p.likesCount + (nextLiked ? 1 : -1),
          };
        }
        return p;
      })
    );
  };

  // Toggle Repost with feedback
  const handleToggleRepost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextReposted = !p.isReposted;
          showToast(
            nextReposted
              ? 'Umesambaza uzi huu kwenye mtandao wako (Reposted) 🔄'
              : 'Umeondoa repost'
          );
          return {
            ...p,
            isReposted: nextReposted,
            repostsCount: p.repostsCount + (nextReposted ? 1 : -1),
          };
        }
        return p;
      })
    );
  };

  // Toggle Bookmark
  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.isSaved;
          showToast(nextSaved ? 'Uzi umehifadhiwa (Saved) 🔖' : 'Umeondoa kwenye hifadhi');
          return { ...p, isSaved: nextSaved };
        }
        return p;
      })
    );
  };

  // Handle Share action
  const handleSharePost = (post: RichCommunityPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${post.content} - Iliyopostiwa na @${post.authorHandle} kwenye Zenia Vikundi`
      );
      showToast('Kiungo cha uzi huu kimenakiliwa (Link Copied)! 📋');
    } else {
      showToast('Uzi umeshirikishwa!');
    }
  };

  // Add Comment to active post
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInputText.trim() || !activeCommentPostId) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      authorName: currentUser.displayName || 'Mimi',
      authorHandle: currentUser.username || 'mimi',
      authorPhoto:
        currentUser.photoURL ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: commentInputText.trim(),
      timeAgo: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === activeCommentPostId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [newComment, ...p.commentsList],
          };
        }
        return p;
      })
    );

    setCommentInputText('');
    showToast('Maoni yako yametumwa! 💬');
  };

  // Create new Community Post
  const handleCreateNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const parsedTags = newPostTags
      .split(' ')
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const createdPost: RichCommunityPost = {
      id: `post_${Date.now()}`,
      communityId: activeCommunityId,
      authorId: currentUser.id,
      authorName: currentUser.displayName || 'Mwanachama wa Zenia',
      authorHandle: currentUser.username || 'user',
      authorPhoto:
        currentUser.photoURL ||
        localStorage.getItem(`zenia_user_avatar_${currentUser.id}`) ||
        avatarPolina,
      authorRole: currentUser.bio?.slice(0, 35) || 'Mwanachama wa Zenia',
      authorBadgeNumber: '1',
      avatarStyle: currentUser.avatarStyle || getStoredAvatarStyle() || 'squircle',
      isVerified: currentUser.verified || false,
      timeAgo: 'Just now',
      content: newPostText.trim(),
      hashtags: parsedTags.length > 0 ? parsedTags : ['#zenia', '#design', '#threads'],
      mediaImages: selectedMockupAttachment ? [selectedMockupAttachment] : [mockupTask, mockupFintech],
      likesCount: 1,
      commentsCount: 0,
      repostsCount: 0,
      sharesCount: 0,
      isLiked: true,
      commentsList: [],
    };

    setPosts([createdPost, ...posts]);
    setNewPostText('');
    setIsCreatePostOpen(false);
    showToast('Uzi wako mpya umepostiwa kwenye Vikundi! 🚀');
  };

  // Stack of 5 participant avatars for the hero banner matching Screenshot 2
  const participantAvatars = [
    avatarSarah,
    avatarAdam,
    avatarAlex,
    avatarAmina,
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
  ];

  return (
    <div
      className={`w-full flex flex-col ${
        isDark ? 'bg-[#070A12] text-white' : 'bg-[#F8FAFC] text-slate-900'
      } flex-1 pb-36 sm:pb-24 select-none overflow-y-auto min-h-screen transition-colors`}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A]/95 text-cyan-300 border border-cyan-400/40 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-bold animate-in fade-in slide-in-from-top duration-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 px-3 sm:px-4 pt-2">
        {/* ============================================================== */}
        {/* TOP QUICK VIEW SWITCHER (Screenshot 2: Community vs Screenshot 1: Sarah Connor) */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between pb-3 pt-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/5"
                title="Rudi Nyuma"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center bg-[#0D1222] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode('community')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  viewMode === 'community'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Design Threads (Vikundi)</span>
              </button>

              <button
                onClick={() => setViewMode('creator')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  viewMode === 'creator'
                    ? 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sarah Connor (Profile)</span>
              </button>
            </div>
          </div>

          {/* Quick Create Thread Trigger button */}
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="w-9 h-9 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            title="Tengeneza Uzi Mpya (New Post)"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* HERO BANNER SECTION 1: COMMUNITY VIEW (Matching Screenshot 2 - Image aa5d5ed9.png) */}
        {/* ============================================================== */}
        {viewMode === 'community' && (
          <div
            className={`relative w-full rounded-[32px] overflow-hidden p-5 sm:p-6 mb-5 border border-white/10 shadow-2xl transition-all ${
              activeCommunityId === 'all_joined'
                ? 'bg-gradient-to-br from-indigo-500 via-sky-600 to-emerald-400 text-slate-950'
                : `bg-gradient-to-br ${activeCommunity.gradient} text-slate-950`
            }`}
          >
            {/* Subtle frosted glass overlay layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />

            {/* Top Bar: Frosted Search Pill & Round "+" Button */}
            <div className="relative z-10 flex items-center gap-2.5 mb-5">
              <div className="flex-1 relative flex items-center bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-full px-3.5 py-2 border border-white/30 transition-all text-slate-900 placeholder:text-slate-700">
                <Search className="w-4 h-4 text-slate-800 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads, #hashtags, creators..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold placeholder:text-slate-700 focus:outline-none text-slate-950"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full bg-black/10 hover:bg-black/20 text-slate-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Round + Button matching Screenshot 2 */}
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/45 backdrop-blur-md border border-white/40 text-slate-950 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-sm"
                title="Add post"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Content: Badge Tag & Dynamic Community Name */}
            <div className="relative z-10 space-y-1 mb-4">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-wide uppercase">
                {activeCommunityId === 'all_joined'
                  ? 'FEEDS ZA CHANELI ULIZOJIUNGA'
                  : activeCommunity.badgeTag || 'BETA COMMUNITY'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                {activeCommunityId === 'all_joined'
                  ? 'Chaneli Ulizojiunga'
                  : activeCommunity.name}
              </h1>
              {activeCommunityId !== 'all_joined' && activeCommunity.category && (
                <p className="text-xs font-medium text-slate-800/90 pt-0.5">
                  {activeCommunity.category}
                </p>
              )}
            </div>

            {/* Overlapping Participant Avatars Stack + Online count + Join Button */}
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2.5">
                {/* 5 Stacked Avatars with clean borders */}
                <div className="flex -space-x-2.5 overflow-hidden py-1">
                  {participantAvatars.map((av, idx) => (
                    <div
                      key={idx}
                      className="inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-white/60 overflow-hidden shadow-sm"
                    >
                      <SafeImage
                        src={av}
                        alt="Participant"
                        fallbackText="U"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Counter text */}
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  {activeCommunityId === 'all_joined' ? (
                    <>
                      <span className="font-extrabold text-slate-950">
                        {joinedCommunityIds.length}
                      </span>{' '}
                      chaneli ulizojiunga
                    </>
                  ) : (
                    <>
                      {(activeCommunity.membersCount / 1000).toFixed(1)}k participants •{' '}
                      <span className="font-extrabold text-emerald-950">
                        {activeCommunity.onlineCount} online
                      </span>
                    </>
                  )}
                </span>
              </div>

              {/* Join / Joined Pill Button */}
              {activeCommunityId === 'all_joined' ? (
                <div className="px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md bg-slate-950/80 text-cyan-300 border border-slate-900 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{joinedCommunityIds.length} Zimeunganishwa</span>
                </div>
              ) : (
                <button
                  onClick={() => toggleJoinCommunity(activeCommunity.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 shadow-sm ${
                    joinedCommunityIds.includes(activeCommunity.id)
                      ? 'bg-slate-950/80 text-cyan-300 border border-slate-900'
                      : 'bg-white text-slate-950 hover:bg-slate-100 border border-white/60'
                  }`}
                >
                  {joinedCommunityIds.includes(activeCommunity.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Umejiunga (Joined)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Jiunge (Join)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* HERO BANNER SECTION 2: CREATOR PROFILE VIEW (Matching Screenshot 1 - Image c9fc2d3f.png) */}
        {/* ============================================================== */}
        {viewMode === 'creator' && (
          <div className="relative w-full rounded-[36px] overflow-hidden p-5 sm:p-6 mb-5 border border-white/10 shadow-2xl bg-gradient-to-br from-sky-400 via-indigo-600 to-rose-500 text-white transition-all">
            {/* Background artistic lighting & portrait silhouette */}
            <div className="absolute top-0 right-0 w-3/5 h-full opacity-35 pointer-events-none">
              <SafeImage
                src={avatarSarah}
                alt="Sarah Background"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

            {/* Top Navigation Row matching Screenshot 1 */}
            <div className="relative z-10 flex items-center justify-between mb-5">
              {/* Creator Avatar circle on top left */}
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-rose-500 ring-2 ring-white/30 shadow-lg">
                <SafeImage
                  src={avatarSarah}
                  alt="Sarah Connor"
                  fallbackText="SC"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Action Buttons: "+ Follow" glass pill button and Send icon on top right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFollowCreator('sarah.connor', 'Sarah Connor')}
                  className={`px-4 py-2 rounded-full text-xs font-black backdrop-blur-xl border transition-all active:scale-95 shadow-md flex items-center gap-1.5 ${
                    isFollowingCreator
                      ? 'bg-slate-950/80 text-cyan-300 border-cyan-400/40'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                  }`}
                >
                  {isFollowingCreator ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (onStartChatWithUser) {
                      onStartChatWithUser({
                        id: 'user_sarah_connor',
                        displayName: 'Sarah Connor',
                        username: 'sarah.connor',
                        photoURL: avatarSarah,
                      });
                    } else {
                      showToast('Ujumbe umetumwa kwa Sarah Connor! ✉️');
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
                  title="Tuma Ujumbe (Message)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Creator Title & Bio matching Screenshot 1 */}
            <div className="relative z-10 space-y-1.5 mb-6 max-w-md">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-md">
                Sarah Connor
              </h1>
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed drop-shadow-sm">
                Product Designer with over 10 years of experience in Fintech, Startups, Social media. Opened for projects.
              </p>
            </div>

            {/* Two Frosted Glassmorphic Stat Cards matching Screenshot 1 */}
            <div className="relative z-10 grid grid-cols-2 gap-3 pt-1">
              {/* Stat Card 1: Followers */}
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-lg flex flex-col justify-between min-h-[82px]">
                <span className="text-[11px] font-semibold text-slate-200">Followers</span>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {(creatorFollowersCount / 1000).toFixed(1)}k
                  </span>
                  {/* Stack of small overlapping avatars inside card */}
                  <div className="flex -space-x-2 overflow-hidden mb-0.5">
                    {[avatarAdam, avatarAlex, avatarAmina].map((av, i) => (
                      <div key={i} className="w-5 h-5 rounded-full ring-1 ring-white/50 overflow-hidden">
                        <SafeImage src={av} alt="Fan" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stat Card 2: Monthly Views */}
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-lg flex flex-col justify-between min-h-[82px]">
                <span className="text-[11px] font-semibold text-slate-200">Monthly Views</span>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    808k
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white mb-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* COMMUNITY / CATEGORY FILTER PILLS */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
          {/* All Joined Feed Pill */}
          <button
            onClick={() => {
              setActiveCommunityId('all_joined');
              setViewMode('community');
            }}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border flex items-center gap-1.5 ${
              activeCommunityId === 'all_joined' && viewMode === 'community'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10 font-extrabold'
                : 'bg-[#0E1324] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zote Nilizojiunga</span>
            {joinedCommunityIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-black">
                {joinedCommunityIds.length}
              </span>
            )}
          </button>

          {/* Individual Community Pills with Joined Checkmark Badge */}
          {communitiesList.map((c) => {
            const isSel = activeCommunityId === c.id && viewMode === 'community';
            const isMember = joinedCommunityIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCommunityId(c.id);
                  setViewMode('community');
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10 font-extrabold'
                    : 'bg-[#0E1324] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                }`}
              >
                {isMember && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Umejiunga" />
                )}
                <span>{c.name}</span>
                {isMember && (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3] -ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* COMMUNITY FEED (Grounded by Channel Membership Rule) */}
        {/* ============================================================== */}
        <div className="w-full transition-colors divide-y divide-white/[0.06] dark:divide-white/[0.06]">
          {/* CASE 1: Creator View and User Has Not Joined / Followed Sarah Connor */}
          {viewMode === 'creator' && !isFollowingCreator ? (
            <div className="py-14 px-5 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500/20 to-fuchsia-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
                <Lock className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Machapisho Yamefungwa kwa Wanaofuata
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Hujajiunga na chaneli ya <span className="font-bold text-rose-300">Sarah Connor</span> bado. Bonyeza kitufe hapa chini ili kuanza kumfuata na kufungua machapisho, michoro na miradi yake yote.
                </p>
              </div>
              <button
                onClick={() => toggleFollowCreator('sarah.connor', 'Sarah Connor')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-500 hover:opacity-90 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Jiunge na Chaneli ya Sarah Connor (Follow)</span>
              </button>
            </div>
          ) : viewMode === 'community' && activeCommunityId !== 'all_joined' && !isCurrentCommunityJoined ? (
            /* CASE 2: Community View and User Has Not Joined this Specific Channel */
            <div className="py-14 px-5 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
                <Lock className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Machapisho Yamefungwa kwa Wanachama
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Hujajiunga na chaneli ya <span className="font-bold text-cyan-300">{activeCommunity.name}</span> bado. Jiunge na chaneli hii ili kuona majadiliano yote, picha, mafaili na machapisho ya wanachama.
                </p>
              </div>
              <button
                onClick={() => toggleJoinCommunity(activeCommunity.id)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Jiunge na {activeCommunity.name} (Bure)</span>
              </button>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span>👥 {(activeCommunity.membersCount / 1000).toFixed(1)}k wanachama</span>
                <span>•</span>
                <span>⚡ Upatikanaji wa papo hapo</span>
              </div>
            </div>
          ) : viewMode === 'community' && activeCommunityId === 'all_joined' && joinedCommunityIds.length === 0 ? (
            /* CASE 3: All Joined view, but User Has 0 Joined Communities */
            <div className="py-12 px-5 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <Users className="w-8 h-8 stroke-[2]" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Hujajiunga na Chaneli Yoyote Bado
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Ili kuona machapisho hapa, jiunge na chaneli au vikundi unavyovipenda hapa chini. Machapisho ya chaneli zote utakazojiunga yatatokea hapa kwa pamoja.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md pt-2 text-left">
                {communitiesList.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{comm.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {(comm.membersCount / 1000).toFixed(1)}k members
                      </p>
                    </div>
                    <button
                      onClick={() => toggleJoinCommunity(comm.id)}
                      className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shrink-0"
                    >
                      Jiunge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : visiblePosts.length === 0 ? (
            /* CASE 4: Joined, but Search or Filter Has No Results */
            <div className="text-center py-12 px-4 space-y-2">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Hakuna nyuzi zilizopatikana</p>
              <p className="text-xs text-slate-500">Jaribu neno jingine la utafutaji au weka uzi wako mpya.</p>
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Weka Uzi Mpya
              </button>
            </div>
          ) : (
            /* CASE 5: User Has Joined — Display All Visible Posts for the Joined Channels */
            visiblePosts.map((post) => {
              return (
                <article
                  key={post.id}
                  className={`py-4 sm:py-5 px-1 sm:px-2 flex items-start gap-3 transition-colors ${
                    isDark ? 'hover:bg-white/[0.015]' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left Column: Avatar with Yellow Level Badge (Uses chosen avatar photo and style) */}
                  {(() => {
                    const isCurrentAuthor =
                      post.authorId === currentUser?.id ||
                      post.authorHandle === currentUser?.username;
                    const authorAvatarImg = isCurrentAuthor
                      ? currentUser?.photoURL ||
                        localStorage.getItem(`zenia_user_avatar_${currentUser?.id}`) ||
                        post.authorPhoto ||
                        avatarPolina
                      : post.id === 'post_polina_zakharova'
                      ? avatarPolina
                      : post.authorPhoto || avatarSarah;

                    const authorAvatarStyle = isCurrentAuthor
                      ? currentUser?.avatarStyle || getStoredAvatarStyle() || 'squircle'
                      : post.avatarStyle || 'squircle';

                    const styleDef = getAvatarStyleDef(authorAvatarStyle);

                    return (
                      <div className="relative shrink-0 pt-0.5">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 ${
                            styleDef.innerRadiusClass || 'rounded-2xl'
                          } overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-slate-200 dark:bg-slate-800 shadow-xs`}
                          style={styleDef.customInnerStyle || styleDef.customStyle}
                        >
                          <SafeImage
                            src={authorAvatarImg}
                            alt={post.authorName}
                            fallbackText={post.authorName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Corner rank/level badge matching screenshot (e.g. '3') */}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-300 text-amber-950 flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-[#070A12] shadow-xs">
                          {post.authorBadgeNumber || '3'}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Right Column: Name, Subtitle, Text, Media, Engagement Icons */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Header Row: Name + Green Verified Badge + Time + Options */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate cursor-pointer hover:underline">
                            {post.authorName}
                          </span>
                          {post.isVerified !== false && (
                            <span
                              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 shadow-xs"
                              title="Verified"
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                          <span className="text-xs text-slate-400 dark:text-slate-400 font-normal shrink-0">
                            {post.timeAgo}
                          </span>
                        </div>

                        {/* Subtitle / Role (e.g. Brand Designer · VK Tech) */}
                        {post.authorRole && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium -mt-0.5 truncate">
                            {post.authorRole}
                          </p>
                        )}
                      </div>

                      {/* Three-dots menu */}
                      <button
                        onClick={() => handleToggleSave(post.id)}
                        className="p-1 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors shrink-0"
                        title="Options / Save"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Post Content Text */}
                    <div className="space-y-1 pt-0.5">
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                        {post.content}
                      </p>

                      {/* Hashtags if any */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                          {post.hashtags.map((tag, i) => (
                            <span
                              key={i}
                              onClick={() => setSearchQuery(tag)}
                              className="text-xs font-semibold text-cyan-500 dark:text-cyan-400 hover:underline cursor-pointer transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Media images if present */}
                    {post.mediaImages && post.mediaImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                        {post.mediaImages.map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => setPreviewImage(imgUrl)}
                            className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 group cursor-pointer shadow-xs hover:opacity-95 transition-all"
                          >
                            <SafeImage
                              src={imgUrl}
                              alt={`Preview ${imgIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Engagement Action Bar: Heart, Comment, Repost, Send matching Screenshot 4bcdaef3.png */}
                    <div className="flex items-center gap-7 pt-2 text-xs font-medium select-none text-slate-400">
                      {/* 1. Heart (Like) button */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors group active:scale-90 ${
                          post.isLiked ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title="Penda (Like)"
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform ${
                            post.isLiked
                              ? 'fill-rose-500 text-rose-500 scale-105'
                              : 'text-slate-400 group-hover:text-rose-500 group-hover:fill-rose-500/20'
                          }`}
                        />
                        <span>{post.likesCount}</span>
                      </button>

                      {/* 2. Comment button */}
                      <button
                        onClick={() => setActiveCommentPostId(post.id)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors group active:scale-90"
                        title="Maoni (Comments)"
                      >
                        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>{post.commentsCount}</span>
                      </button>

                      {/* 3. Repost / Retweet loop button */}
                      <button
                        onClick={() => handleToggleRepost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors group active:scale-90 ${
                          post.isReposted ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-emerald-400'
                        }`}
                        title="Sambaza (Repost)"
                      >
                        <Repeat
                          className={`w-4 h-4 transition-transform ${
                            post.isReposted
                              ? 'text-emerald-500 scale-105'
                              : 'group-hover:rotate-180 duration-300'
                          }`}
                        />
                        <span>{post.repostsCount}</span>
                      </button>

                      {/* 4. Send / Paper Airplane button */}
                      <button
                        onClick={() => handleSharePost(post)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-colors group active:scale-90"
                        title="Tuma (Share)"
                      >
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        <span>{post.sharesCount}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE COMMENTS DRAWER MODAL */}
      {/* ============================================================== */}
      {activePostForComments && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveCommentPostId(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0A0E1A] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Maoni ya Uzi ({activePostForComments.commentsList.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveCommentPostId(null)}
                className="p-1 rounded-full bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {activePostForComments.commentsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                  <p className="text-2xl">💬</p>
                  <p className="font-bold text-slate-300">Hakuna maoni bado</p>
                  <p className="text-[11px] text-slate-500">
                    Kuwa wa kwanza kutoa maoni au kutoa maoni ya kitaalamu!
                  </p>
                </div>
              ) : (
                activePostForComments.commentsList.map((cm) => (
                  <div
                    key={cm.id}
                    className="p-3 rounded-2xl bg-[#11172A] border border-white/5 space-y-1 text-xs animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <SafeImage src={cm.authorPhoto} alt={cm.authorName} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-cyan-300">{cm.authorName}</span>
                        <span className="text-[10px] text-slate-500">@{cm.authorHandle}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{cm.timeAgo}</span>
                    </div>
                    <p className="text-slate-200 text-xs pl-8 leading-relaxed">{cm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={commentInputText}
                onChange={(e) => setCommentInputText(e.target.value)}
                placeholder="Andika maoni yako hapa..."
                className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentInputText.trim()}
                className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-40 transition-all shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE NEW THREAD / POST MODAL */}
      {/* ============================================================== */}
      {isCreatePostOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsCreatePostOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0A0E1A] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white">Tengeneza Uzi Mpya (New Thread)</h3>
              </div>
              <button
                onClick={() => setIsCreatePostOpen(false)}
                className="p-1 rounded-full bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPost} className="py-4 space-y-3.5 overflow-y-auto flex-1">
              {/* Text Area */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ujumbe wako au wazo la kubuni:
                </label>
                <textarea
                  rows={3}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Eleza kuhusu kazi yako ya ubunifu, app design, au wazo kwa jamii..."
                  className="w-full bg-[#11172A] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Hashtags (zilizotengwa kwa nafasi):
                </label>
                <input
                  type="text"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="#uiux #mobileapps #productdesign"
                  className="w-full bg-[#11172A] border border-white/10 rounded-2xl px-3 py-2 text-xs text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Select Design Mockup Attachment */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ambatisha Picha ya Muundo (Mockup):</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'task', label: 'Task App', img: mockupTask },
                    { id: 'fintech', label: 'Fintech UI', img: mockupFintech },
                    { id: 'dashboard', label: 'Analytics', img: mockupDashboard },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMockupAttachment(item.img)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                        selectedMockupAttachment === item.img
                          ? 'border-cyan-400 ring-2 ring-cyan-500/20 scale-102'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover rounded-xl" />
                      <span className="absolute bottom-1 left-1 right-1 bg-black/70 backdrop-blur-sm text-[9px] font-bold text-center text-white py-0.5 rounded">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatePostOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs disabled:opacity-40 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Post Kwenye Vikundi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FULLSCREEN IMAGE LIGHTBOX PREVIEW */}
      {/* ============================================================== */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[82vh] object-contain rounded-3xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
