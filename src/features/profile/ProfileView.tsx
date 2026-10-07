import React, { useState } from 'react';
import {
  CheckCircle2,
  Share2,
  Edit,
  Grid,
  Sparkles,
  Video,
  ShoppingBag,
  Users,
  Shield,
  CreditCard,
  ChevronRight,
  Heart,
  Sun,
  Moon,
  MapPin,
  Link as LinkIcon,
  Play,
  Eye,
  MessageCircle,
  X,
  Plus,
  Bookmark,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { useTheme } from '../../context/ThemeContext';

// Import local image assets
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import zanzibarBeach from '../../assets/images/zanzibar_beach_1790280962219.jpg';
import concertFestival from '../../assets/images/concert_festival_1790280974630.jpg';
import wirelessEarbuds from '../../assets/images/wireless_earbuds_1790280984496.jpg';
import techCommunity from '../../assets/images/tech_community_1790802256885.jpg';
import teamDesign from '../../assets/images/team_design_1790802245828.jpg';
import sarahPortrait from '../../assets/images/sarah_portrait_1791059459448.jpg';
import alexPortrait from '../../assets/images/alex_portrait_1791059432462.jpg';

interface ProfileViewProps {
  currentUser: UserProfile;
  onOpenEditProfile: () => void;
  onOpenAdmin: () => void;
  onSelectService?: (service: string) => void;
}

interface PostItem {
  id: string;
  url: string;
  caption: string;
  likes: string;
  comments: string;
  type: 'image' | 'video' | 'carousel';
  gradient: string;
  date: string;
}

interface HighlightItem {
  id: string;
  title: string;
  cover: string;
  gradient: string;
  emoji: string;
}

interface ShopItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  tag: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenEditProfile,
  onOpenAdmin,
  onSelectService,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'posts' | 'status' | 'videos' | 'shop'>('posts');
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // 1. Posts Catalog
  const profilePosts: PostItem[] = [
    {
      id: 'post_1',
      url: aminaAvatar,
      caption: '✨ New season, new energy! Asante kwa wote mnaosapoti safari yangu ya urembo na fashion. #ZeniaCreator #FashionDar',
      likes: '1,420',
      comments: '142',
      type: 'image',
      gradient: 'from-purple-800 to-indigo-900',
      date: 'Masaa 2 yaliyopita',
    },
    {
      id: 'post_2',
      url: zanzibarBeach,
      caption: '🏖️ Weekend getaway in Nungwi, Zanzibar. Hakuna sehemu tulivu kama hapa baharini! 🌊☀️',
      likes: '2,890',
      comments: '310',
      type: 'image',
      gradient: 'from-cyan-800 to-blue-900',
      date: 'Jana',
    },
    {
      id: 'post_3',
      url: concertFestival,
      caption: '🔥 Dar Live Fest vibes jana usiku! Nishati ilikuwa moto sana jukwaani! 🎶🕺',
      likes: '3,210',
      comments: '428',
      type: 'video',
      gradient: 'from-pink-800 to-rose-900',
      date: 'Siku 2 zilizopita',
    },
    {
      id: 'post_4',
      url: wirelessEarbuds,
      caption: '🎧 My daily tech essential: High-fidelity earbuds. Sound quality is unreal! Zinapatikana dukani kwangu kwenye tab ya Shop. 🛍️',
      likes: '1,780',
      comments: '95',
      type: 'image',
      gradient: 'from-emerald-800 to-teal-900',
      date: 'Siku 3 zilizopita',
    },
    {
      id: 'post_5',
      url: techCommunity,
      caption: '💡 Kuungana na wabunifu wenzangu wa kidijitali Dar es Salaam. Networking is key in 2026! 🚀',
      likes: '2,450',
      comments: '180',
      type: 'image',
      gradient: 'from-amber-800 to-orange-900',
      date: 'Siku 5 zilizopita',
    },
    {
      id: 'post_6',
      url: teamDesign,
      caption: '🎨 Behind the scenes ya kampeni yetu mpya ya mavazi na vifaa vya kisasa. Stay tuned! ✨',
      likes: '1,920',
      comments: '124',
      type: 'video',
      gradient: 'from-violet-800 to-purple-900',
      date: 'Wiki iliyopita',
    },
    {
      id: 'post_7',
      url: sarahPortrait,
      caption: '📸 Studio shoot na Sarah. Natural lighting + minimalist aesthetic. Nini maoni yako? 💭',
      likes: '3,110',
      comments: '280',
      type: 'image',
      gradient: 'from-rose-800 to-pink-900',
      date: 'Wiki iliyopita',
    },
    {
      id: 'post_8',
      url: alexPortrait,
      caption: '💼 Business casual shoot for @ZeniaStyle. Dressing well is a form of self-respect.',
      likes: '2,040',
      comments: '115',
      type: 'image',
      gradient: 'from-slate-800 to-zinc-900',
      date: 'Wiki 2 zilizopita',
    },
    {
      id: 'post_9',
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
      caption: '👗 Summer collection drop 1! Nguo za kitambaa chepesi kwa joto la Dar.',
      likes: '4,520',
      comments: '490',
      type: 'carousel',
      gradient: 'from-cyan-800 to-indigo-900',
      date: 'Mwezi uliopita',
    },
    {
      id: 'post_10',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      caption: '🌟 Golden hour in Masaki. Furahia kila sekunde ya siku yako!',
      likes: '1,670',
      comments: '88',
      type: 'image',
      gradient: 'from-amber-700 to-red-800',
      date: 'Mwezi uliopita',
    },
    {
      id: 'post_11',
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
      caption: '🎉 Night out with amazing souls! Happy vibes only. 🥂',
      likes: '2,980',
      comments: '215',
      type: 'video',
      gradient: 'from-purple-800 to-pink-800',
      date: 'Mwezi uliopita',
    },
    {
      id: 'post_12',
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
      caption: '🛍️ Shopping day spree! Msimu wa punguzo la bei umefika.',
      likes: '3,840',
      comments: '330',
      type: 'image',
      gradient: 'from-emerald-800 to-teal-800',
      date: 'Mwezi uliopita',
    },
  ];

  // 2. Story Highlights
  const highlights: HighlightItem[] = [
    {
      id: 'hl_1',
      title: 'Zanzibar 🏖️',
      cover: zanzibarBeach,
      gradient: 'from-cyan-500 to-blue-600',
      emoji: '🏖️',
    },
    {
      id: 'hl_2',
      title: 'Fashion 👗',
      cover: aminaAvatar,
      gradient: 'from-purple-500 to-pink-600',
      emoji: '👗',
    },
    {
      id: 'hl_3',
      title: 'Concerts 🎶',
      cover: concertFestival,
      gradient: 'from-rose-500 to-orange-500',
      emoji: '🎶',
    },
    {
      id: 'hl_4',
      title: 'Tech & Gadgets',
      cover: wirelessEarbuds,
      gradient: 'from-emerald-500 to-teal-600',
      emoji: '🎧',
    },
    {
      id: 'hl_5',
      title: 'Community 💡',
      cover: techCommunity,
      gradient: 'from-amber-500 to-yellow-600',
      emoji: '💡',
    },
  ];

  // 3. Shop Items
  const shopItems: ShopItem[] = [
    {
      id: 'shop_1',
      title: 'Pro Wireless Earbuds Gen 2',
      price: 175000,
      image: wirelessEarbuds,
      category: 'Electronics',
      tag: '🔥 15% OFF',
    },
    {
      id: 'shop_2',
      title: 'Silk Summer Dress (Dar Edition)',
      price: 65000,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=80',
      category: 'Fashion',
      tag: '⭐ Bestseller',
    },
    {
      id: 'shop_3',
      title: 'Vintage Leather Handbag',
      price: 90000,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
      category: 'Accessories',
      tag: '👜 Exclusive',
    },
    {
      id: 'shop_4',
      title: 'Minimalist Gold Watch',
      price: 130000,
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
      category: 'Watches',
      tag: '✨ Luxury',
    },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: currentUser.displayName, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Kiunganishi cha wasifu kimenakiliwa (Profile link copied)!');
    }
  };

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070A14] text-white overflow-y-auto overscroll-contain scroll-smooth pb-28 md:pb-16 select-text">
      {/* ============================================================== */}
      {/* 1. TOP HERO COVER BANNER & ACTIONS */}
      {/* ============================================================== */}
      <div className="relative w-full">
        {/* Cover Image / Gradient */}
        <div className="w-full h-44 sm:h-56 md:h-64 relative overflow-hidden bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950">
          <SafeImage
            src={zanzibarBeach}
            fallbackGradient="from-cyan-900 via-indigo-950 to-purple-950"
            fallbackText="Zenia Cover"
            className="w-full h-full object-cover opacity-75 blur-[0.5px] scale-105 hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A14] via-[#070A14]/40 to-transparent" />

          {/* Top Quick Header Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>@zenia_network</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdmin}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/10 flex items-center justify-center text-cyan-400 transition-colors shadow-lg active:scale-95"
                title="Super Admin Panel"
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-colors shadow-lg active:scale-95"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card Container Overlapping Banner */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 z-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-2xl shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                  <SafeImage
                    src={currentUser.photoURL || aminaAvatar}
                    fallbackText={currentUser.displayName}
                    fallbackGradient="from-cyan-700 via-indigo-700 to-purple-800"
                    alt={currentUser.displayName}
                    className="w-full h-full rounded-full object-cover p-1 bg-[#070A14]"
                  />
                </div>
                {/* Online Indicator */}
                <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#070A14] flex items-center justify-center shadow-md" title="Mtumiaji yupo mtandaoni sasa">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-start pt-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentUser.displayName || 'Amina Kaunga'}
                  </h1>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400 shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-cyan-300 font-mono font-medium">
                  @{currentUser.username || 'amina_kaunga'}
                </p>

                {/* Badges Pill */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    🎨 Top Creator
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                    👗 Fashion & Style
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Dar es Salaam, TZ</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
              <button
                onClick={onOpenEditProfile}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border border-white/10 transition-all shadow-sm"
              >
                <Edit className="w-4 h-4 text-cyan-400" />
                <span>Hariri Wasifu</span>
              </button>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 sm:flex-initial py-2.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg ${
                  isFollowing
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/25'
                }`}
              >
                <span>{isFollowing ? '✓ Unaemfuata' : '+ Fuata (Follow)'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 active:scale-95 transition-all"
                title="Sambaza Wasifu"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bio & Links */}
          <div className="mt-3.5 sm:mt-4 text-center sm:text-left max-w-2xl">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {currentUser.bio ||
                '✨ Content Creator | Fashion & Lifestyle Inspo\n💡 Kuchochea ubunifu na maisha ya kisasa Afrika Mashariki.\n📍 Dar es Salaam • Zanzibar • Nairobi\n📩 Collabs: amina@zenia.social'}
            </p>

            <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start text-xs text-slate-400">
              <a
                href="#shop"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('shop');
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>zenia.social/amina/store</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Amejiunga Machi 2024</span>
              </span>
            </div>
          </div>

          {/* Key Stats Bar (Following, Followers, Posts, Likes) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 my-4 sm:my-5 py-3 px-2 sm:px-6 rounded-2xl bg-[#0E1528] border border-white/10 shadow-lg text-center">
            <div>
              <p className="text-base sm:text-lg font-black text-white font-mono">
                {currentUser.followingCount || 245}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Following</p>
            </div>
            <div className="border-x border-white/5">
              <p className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                {((currentUser.followersCount || 12400) / 1000).toFixed(1)}K
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Followers</p>
            </div>
            <div className="border-r border-white/5">
              <p className="text-base sm:text-lg font-black text-white font-mono">
                {currentUser.postsCount || profilePosts.length}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Posts</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-pink-400 font-mono">
                48.9K
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Likes</p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. THREE QUICK ACCESS FEATURE TILES (WALLET, ADMIN, NIGHT/LIGHT MODE) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
            {/* Tile 1: Zenia Wallet */}
            <button
              onClick={() => onSelectService && onSelectService('wallet')}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#0F182F] to-[#0A1020] border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all text-left group active:scale-98 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                    Zenia Wallet
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono font-extrabold truncate">
                    TSh 120,000
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Tile 2: Super Admin Panel */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#0F182F] to-[#0A1020] border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all text-left group active:scale-98 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-cyan-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                    Super Admin
                  </p>
                  <p className="text-[10px] text-cyan-400/80 truncate">
                    Usimamizi & Watumiaji
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Tile 3: Night Mode & Light Mode (Night Mood / Liht Mood) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group active:scale-98 shadow-sm ${
                isDark
                  ? 'bg-gradient-to-br from-[#12182F] to-[#0B0F20] border-indigo-500/40 hover:border-indigo-400'
                  : 'bg-gradient-to-br from-amber-50 to-white border-amber-300 hover:border-amber-400 shadow-md'
              }`}
              title={isDark ? 'Badili kwenda Light Mode' : 'Badili kwenda Night Mode'}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md ${
                    isDark
                      ? 'bg-indigo-500/20 text-indigo-300 shadow-indigo-500/20'
                      : 'bg-amber-500/20 text-amber-600 shadow-amber-500/20'
                  }`}
                >
                  {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {isDark ? 'Night Mode 🌙' : 'Light Mode ☀️'}
                  </p>
                  <p className={`text-[10px] truncate ${isDark ? 'text-indigo-300/80' : 'text-amber-800'}`}>
                    {isDark ? 'Hali ya Usiku (Giza)' : 'Hali ya Mchana (Mwangaza)'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                  isDark ? 'bg-indigo-600 justify-end' : 'bg-amber-400 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                  {isDark ? <Moon className="w-3 h-3 text-indigo-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
                </div>
              </div>
            </button>
          </div>

          {/* ============================================================== */}
          {/* 3. STORY HIGHLIGHTS (VIPENDWA VYA AMINA) */}
          {/* ============================================================== */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Story Highlights (Vipendwa)
              </h3>
              <span className="text-[10px] text-cyan-400 font-semibold">
                Tazama Zote ({highlights.length})
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
              {highlights.map((hl) => (
                <div
                  key={hl.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 group-hover:scale-105 transition-transform shadow-md">
                    <div className="w-full h-full rounded-full p-0.5 bg-[#070A14] overflow-hidden relative">
                      <SafeImage
                        src={hl.cover}
                        fallbackGradient={hl.gradient}
                        fallbackText={hl.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-[72px] text-center">
                    {hl.title}
                  </span>
                </div>
              ))}

              {/* Add New Highlight Button */}
              <button
                onClick={() => alert('Ongeza Story Highlight mpya kutoka kwenye kumbukumbu zako!')}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-white/20 hover:border-cyan-400 flex items-center justify-center bg-white/5 transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                  Mpya +
                </span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. TABS NAVIGATION (POSTS, STATUS, VIDEOS, SHOP) */}
          {/* ============================================================== */}
          <div className="sticky top-0 z-30 bg-[#070A14]/95 backdrop-blur-md border-y border-white/10 px-2 flex items-center justify-around">
            {[
              { id: 'posts', label: 'Posts', count: profilePosts.length, icon: Grid },
              { id: 'status', label: 'Status', count: 4, icon: Sparkles },
              { id: 'videos', label: 'Videos', count: 8, icon: Video },
              { id: 'shop', label: 'Shop', count: shopItems.length, icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs sm:text-sm font-bold transition-all relative ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* 5. TAB CONTENTS & GRID (SCROLLABLE DOWN) */}
          {/* ============================================================== */}
          <div className="py-4">
            {/* TAB: POSTS */}
            {activeTab === 'posts' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3">
                {profilePosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-[#0F1528] group cursor-pointer border border-white/5 shadow-md active:scale-98 transition-all"
                  >
                    <SafeImage
                      src={post.url}
                      fallbackGradient={post.gradient}
                      fallbackText="Zenia Post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Type badge */}
                    {post.type === 'video' && (
                      <span className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white shadow-md">
                        <Video className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {post.type === 'carousel' && (
                      <span className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white shadow-md">
                        <Layers className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {/* Hover Overlay with engagement numbers */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-2 text-center">
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-white text-white" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-2 px-1">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: STATUS STORIES */}
            {activeTab === 'status' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#0E1528] border border-cyan-500/30 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                      <SafeImage src={aminaAvatar} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Behind the Scenes ✨</h4>
                      <p className="text-xs text-cyan-400 font-medium">Masaa 4 yaliyopita • 1.2K Views</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectService && onSelectService('status')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 active:scale-95 transition-all"
                  >
                    Tazama
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E1528] border border-white/10 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                      <SafeImage src={zanzibarBeach} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Nungwi Sunset Moments 🌅</h4>
                      <p className="text-xs text-slate-400 font-medium">Masaa 8 yaliyopita • 890 Views</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectService && onSelectService('status')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Tazama
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E1528] border border-white/10 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                      <SafeImage src={wirelessEarbuds} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">New Earbuds Unboxing 🎧</h4>
                      <p className="text-xs text-slate-400 font-medium">Masaa 18 yaliyopita • 2.4K Views</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectService && onSelectService('status')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Tazama
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E1528] border border-white/10 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                      <SafeImage src={concertFestival} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Dar Live Fest Highlights 🎶</h4>
                      <p className="text-xs text-slate-400 font-medium">Jana • 3.5K Views</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectService && onSelectService('status')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Tazama
                  </button>
                </div>
              </div>
            )}

            {/* TAB: VIDEOS / REELS */}
            {activeTab === 'videos' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {profilePosts
                  .filter((p) => p.type === 'video' || p.id === 'post_1' || p.id === 'post_2' || p.id === 'post_7')
                  .map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedPost(vid)}
                      className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#0F1528] group cursor-pointer border border-white/5 shadow-lg active:scale-98 transition-all"
                    >
                      <SafeImage
                        src={vid.url}
                        fallbackGradient={vid.gradient}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                        <div className="flex items-center gap-1.5 text-white mb-1">
                          <Play className="w-4 h-4 fill-white" />
                          <span className="text-xs font-bold font-mono">{vid.likes}</span>
                        </div>
                        <p className="text-[11px] text-slate-200 line-clamp-2 leading-tight">
                          {vid.caption}
                        </p>
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
                        0:45
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* TAB: SHOP ITEMS */}
            {activeTab === 'shop' && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#0E1528] border border-white/10 overflow-hidden shadow-lg flex flex-col group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-900">
                      <SafeImage
                        src={item.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-black text-[10px]">
                        {item.tag}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          {item.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm font-extrabold text-cyan-300 font-mono mt-1">
                          TSh {item.price.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (onSelectService) onSelectService('shop');
                          alert(`Umefungua agizo la: ${item.title}`);
                        }}
                        className="mt-3 py-2 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Agiza Sasa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. POST DETAIL MODAL (LIGHTBOX VIEWER) */}
      {/* ============================================================== */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0E1528] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#0A0F1D]">
              <div className="flex items-center gap-2.5">
                <SafeImage
                  src={currentUser.photoURL || aminaAvatar}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{currentUser.displayName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  </h4>
                  <p className="text-[10px] text-slate-400">{selectedPost.date}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image / Media */}
            <div className="relative w-full aspect-square max-h-[380px] bg-black overflow-hidden flex items-center justify-center">
              <SafeImage
                src={selectedPost.url}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Actions & Caption */}
            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePostLike(selectedPost.id)}
                    className="flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        likedPosts[selectedPost.id] ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                    <span className="text-xs font-bold">
                      {likedPosts[selectedPost.id]
                        ? `${parseInt(selectedPost.likes.replace(/,/g, '')) + 1}`
                        : selectedPost.likes}
                    </span>
                  </button>

                  <button className="flex items-center gap-1.5">
                    <MessageCircle className="w-6 h-6 text-white" />
                    <span className="text-xs font-bold">{selectedPost.comments}</span>
                  </button>

                  <button onClick={handleShare} className="text-white hover:text-cyan-400">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <button className="text-slate-400 hover:text-white">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-white mr-1.5">@{currentUser.username}</strong>
                {selectedPost.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
