import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
  Send,
  Eye,
} from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { SafeImage } from '../../components/SafeImage';

interface StatusFeedProps {
  currentUser: UserProfile;
  onOpenCreateMenu: () => void;
  onViewProduct?: (productId: string) => void;
  onViewEvent?: (eventId: string) => void;
}

export const StatusFeed: React.FC<StatusFeedProps> = ({
  currentUser,
  onOpenCreateMenu,
}) => {
  // Status Cards matching the WhatsApp Status updates design exactly as in user's screenshot
  const [statusCards, setStatusCards] = useState<StatusItem[]>([
    {
      id: 'status_card_1',
      authorId: 'user_alex',
      authorName: 'Alex Kimani',
      authorUsername: 'alex_k',
      authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      type: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      text: 'Vibrant modern wave vibes! 🌊✨',
      location: 'Nairobi, Kenya',
      visibility: 'public',
      likesCount: 1420,
      commentsCount: 88,
      sharesCount: 35,
      createdAt: '15m ago',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'status_card_2',
      authorId: 'user_sarah',
      authorName: 'Sarah Mwangi',
      authorUsername: 'sarah_m',
      authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      type: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
      text: 'Late night studio recording session 🎙️🎶 New music dropping soon!',
      location: 'Dar es Salaam, Tanzania',
      visibility: 'public',
      likesCount: 2310,
      commentsCount: 145,
      sharesCount: 78,
      createdAt: '45m ago',
      expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
    },
    {
      id: 'status_card_3',
      authorId: 'user_amina',
      authorName: 'Amina Juma',
      authorUsername: 'amina_j',
      authorPhoto: '/assets/images/amina_avatar_1790280951312.jpg',
      type: 'photo',
      mediaUrl: '/assets/images/zanzibar_beach_1790280962219.jpg',
      text: 'Good vibes only on the coast 💛🌊',
      location: 'Zanzibar, Tanzania',
      visibility: 'public',
      likesCount: 1200,
      commentsCount: 342,
      sharesCount: 98,
      createdAt: '2h ago',
      expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    },
    {
      id: 'status_card_4',
      authorId: 'user_james',
      authorName: 'James Ochieng',
      authorUsername: 'james_o',
      authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
      type: 'photo',
      mediaUrl: '/assets/images/concert_festival_1790280974630.jpg',
      text: 'Live concert and amapiano energy tonight! ⚡🎉',
      location: 'Arusha, Tanzania',
      visibility: 'public',
      likesCount: 950,
      commentsCount: 64,
      sharesCount: 31,
      createdAt: '3h ago',
      expiresAt: new Date(Date.now() + 21 * 3600 * 1000).toISOString(),
    },
    {
      id: 'status_card_5',
      authorId: 'user_tech',
      authorName: 'Tech Gear Hub',
      authorUsername: 'techgear',
      authorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      type: 'photo',
      mediaUrl: '/assets/images/wireless_earbuds_1790280984496.jpg',
      text: 'Pro wireless audio earbuds are officially in stock! 🎧🔥',
      location: 'Mombasa, Kenya',
      visibility: 'public',
      likesCount: 610,
      commentsCount: 29,
      sharesCount: 12,
      createdAt: '5h ago',
      expiresAt: new Date(Date.now() + 19 * 3600 * 1000).toISOString(),
    },
  ]);

  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [likedStatusIds, setLikedStatusIds] = useState<Record<string, boolean>>({
    status_card_1: true,
  });
  const [commentText, setCommentText] = useState('');
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  const currentStatus = statusCards[activeStoryIndex] || statusCards[0];
  const isLiked = !!likedStatusIds[currentStatus.id];

  const handleToggleLike = (statusId: string) => {
    setLikedStatusIds((prev) => {
      const next = !prev[statusId];
      setStatusCards((sList) =>
        sList.map((st) =>
          st.id === statusId ? { ...st, likesCount: st.likesCount + (next ? 1 : -1) } : st
        )
      );
      return { ...prev, [statusId]: next };
    });
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-24 md:pb-10 select-none">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        {/* WhatsApp-Style Modern Status Cards Carousel (Matches Screenshot Exactly) */}
        <div className="px-3.5 pt-3 pb-3 border-b border-white/[0.06] bg-[#0A0D18]">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hali (Status Updates)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/20">
                {statusCards.length} Mpya
              </span>
            </div>
            <button
              onClick={onOpenCreateMenu}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Weka Status</span>
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {/* 1. My Status Card */}
            <div
              onClick={onOpenCreateMenu}
              className="relative w-36 sm:w-44 h-22 sm:h-26 rounded-[26px] overflow-hidden bg-gradient-to-tr from-[#101426] via-[#1a213d] to-[#252f55] border border-white/10 shrink-0 cursor-pointer group active:scale-95 transition-all shadow-md hover:border-cyan-400/50"
            >
              <div className="absolute inset-0 bg-black/25" />

              {/* Avatar in Top-Left with Solid White Border Ring (Exact Match to Screenshot) */}
              <div className="absolute top-2 left-2 z-10">
                <div className="relative">
                  <SafeImage
                    src={currentUser.photoURL || '/assets/images/amina_avatar_1790280951312.jpg'}
                    fallbackText="Me"
                    alt="My Status"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-[2.5px] border-white shadow-md bg-black"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-[#101426]">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-1.5 left-2.5 right-2 z-10">
                <p className="text-[11px] font-bold text-white truncate drop-shadow">
                  Hali Yangu
                </p>
                <p className="text-[9px] text-cyan-300/80 truncate">Gusa kuongeza</p>
              </div>
            </div>

            {/* 2. Contact Status Cards (Matching Card 1 & Card 2 in Screenshot Exactly) */}
            {statusCards.map((item, idx) => {
              const isSelected = activeStoryIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`relative w-36 sm:w-44 h-22 sm:h-26 rounded-[26px] overflow-hidden shrink-0 cursor-pointer group active:scale-95 transition-all shadow-md border ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-[1.02]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Full cover background wallpaper/photo */}
                  <SafeImage
                    src={item.mediaUrl}
                    fallbackGradient="from-purple-900 via-indigo-900 to-cyan-900"
                    alt={item.authorName}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Soft gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />

                  {/* Top-Left Avatar with Solid White Ring (EXACT MATCH TO SCREENSHOT) */}
                  <div className="absolute top-2 left-2 z-10">
                    <SafeImage
                      src={item.authorPhoto}
                      fallbackText={item.authorName}
                      alt={item.authorName}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-[2.5px] border-white shadow-md bg-black"
                    />
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-1.5 left-2.5 right-2 z-10">
                    <p className="text-[11px] font-bold text-white truncate drop-shadow">
                      {item.authorName}
                    </p>
                    <p className="text-[9px] text-slate-300 truncate drop-shadow">
                      {item.createdAt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Status Story Card Viewer */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col max-w-xl mx-auto w-full">
          <div className="relative flex-1 rounded-[28px] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <SafeImage
                src={currentStatus.mediaUrl}
                fallbackGradient="from-cyan-900 to-indigo-950"
                alt={currentStatus.text}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
            </div>

            {/* Top Author Metadata inside card */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SafeImage
                  src={currentStatus.authorPhoto}
                  fallbackText={currentStatus.authorName}
                  alt={currentStatus.authorName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-bold text-sm text-white drop-shadow">
                    {currentStatus.authorName}
                  </h4>
                  <p className="text-[11px] text-slate-300 drop-shadow">
                    {currentStatus.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenCreateMenu}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 active:scale-95 transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Caption & Reactions */}
            <div className="relative z-10 p-5 pt-2">
              {/* Location Pill */}
              {currentStatus.location && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-white mb-2.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentStatus.location}</span>
                </div>
              )}

              <p className="text-sm font-semibold text-white drop-shadow-md mb-3 leading-relaxed">
                {currentStatus.text}
              </p>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between text-slate-200 text-xs font-semibold border-t border-white/10 pt-3">
                <div className="flex items-center gap-6">
                  {/* Likes */}
                  <button
                    onClick={() => handleToggleLike(currentStatus.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95"
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform ${
                        isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white'
                      }`}
                    />
                    <span>{(currentStatus.likesCount / 1000).toFixed(1)}K</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={() => setShowCommentsFor(showCommentsFor ? null : currentStatus.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{currentStatus.commentsCount}</span>
                  </button>

                  {/* Views */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span>{(currentStatus.likesCount * 3.2).toFixed(0)}</span>
                  </div>
                </div>

                {/* Status Switcher Dots */}
                <div className="flex items-center gap-1.5">
                  {statusCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStoryIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStoryIndex === i ? 'w-5 bg-cyan-400' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Comments Drawer */}
          {showCommentsFor && (
            <div className="mt-3 p-4 rounded-2xl bg-[#13192B] border border-white/10 animate-in fade-in space-y-2.5 shadow-xl">
              <h5 className="text-xs font-bold text-slate-200">
                Maoni / Replies ({currentStatus.commentsCount})
              </h5>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Jibu au comment kwenye status hii..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => {
                    if (commentText.trim()) {
                      setStatusCards((sList) =>
                        sList.map((st) =>
                          st.id === currentStatus.id
                            ? { ...st, commentsCount: st.commentsCount + 1 }
                            : st
                        )
                      );
                      setCommentText('');
                    }
                  }}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
