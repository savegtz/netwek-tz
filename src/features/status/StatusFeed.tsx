import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
  Search,
  MoreVertical,
  Send,
  Sparkles,
} from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { INITIAL_STATUSES } from '../../services/seed/initialData';
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
  const [statuses, setStatuses] = useState<StatusItem[]>(INITIAL_STATUSES);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [likedStatusIds, setLikedStatusIds] = useState<Record<string, boolean>>({ status_1: true });
  const [commentText, setCommentText] = useState('');
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  const storyCircles = [
    {
      id: 'my_status',
      name: 'My Status',
      avatar: currentUser.photoURL || '/assets/images/amina_avatar_1790280951312.jpg',
      isMe: true,
    },
    {
      id: 'explore',
      name: 'Explore',
      avatar: '/assets/images/amina_avatar_1790280951312.jpg',
    },
    {
      id: 'business',
      name: 'Business',
      avatar: '/assets/images/wireless_earbuds_1790280984496.jpg',
    },
    {
      id: 'food',
      name: 'Food',
      avatar: '/assets/images/zanzibar_beach_1790280962219.jpg',
    },
    {
      id: 'travel',
      name: 'Travel',
      avatar: '/assets/images/concert_festival_1790280974630.jpg',
    },
  ];

  const currentStatus = statuses[activeStoryIndex] || statuses[0];
  const isLiked = !!likedStatusIds[currentStatus.id];

  const handleToggleLike = (statusId: string) => {
    setLikedStatusIds((prev) => {
      const next = !prev[statusId];
      setStatuses((sList) =>
        sList.map((st) => (st.id === statusId ? { ...st, likesCount: st.likesCount + (next ? 1 : -1) } : st))
      );
      return { ...prev, [statusId]: next };
    });
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-24 select-none">
      {/* Stories Horizontal Row */}
      <div className="px-3 pt-2 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {storyCircles.map((circle, idx) => (
            <button
              key={circle.id}
              onClick={() => {
                if (circle.isMe) {
                  onOpenCreateMenu();
                } else {
                  setActiveStoryIndex(idx % statuses.length);
                }
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-all"
            >
              <div
                className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                  circle.isMe
                    ? 'ring-2 ring-cyan-400'
                    : 'bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500'
                }`}
              >
                <SafeImage
                  src={circle.avatar}
                  fallbackText={circle.name}
                  alt={circle.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover p-0.5 bg-[#070A12]"
                />
                {circle.isMe && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#070A12]">
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate max-w-[64px]">
                {circle.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Status Story Card */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="relative flex-1 rounded-[24px] sm:rounded-[28px] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
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
                className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400"
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

            <button
              onClick={onOpenCreateMenu}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Caption & Reactions (Matching Screenshot 2: Zanzibar, Good vibes only, 1.2K, 342, 98) */}
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
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-transform ${
                      isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
                    }`}
                  />
                  <span>{(currentStatus.likesCount / 1000).toFixed(1)}K</span>
                </button>

                {/* Comments */}
                <button
                  onClick={() => setShowCommentsFor(showCommentsFor ? null : currentStatus.id)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{currentStatus.commentsCount}</span>
                </button>

                {/* Shares */}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: currentStatus.text, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Status link copied!');
                    }
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{currentStatus.sharesCount}</span>
                </button>
              </div>

              {/* Status Switcher Dots */}
              <div className="flex items-center gap-1.5">
                {statuses.map((_, i) => (
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
          <div className="mt-3 p-4 rounded-2xl bg-[#13192B] border border-white/10 animate-in fade-in space-y-2.5">
            <h5 className="text-xs font-bold text-slate-200">
              Comments ({currentStatus.commentsCount})
            </h5>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Reply to status story..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    setStatuses((sList) =>
                      sList.map((st) => (st.id === currentStatus.id ? { ...st, commentsCount: st.commentsCount + 1 } : st))
                    );
                    setCommentText('');
                  }
                }}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
