import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { StatusStoryViewerModal } from './StatusStoryViewerModal';

// Bundled local image assets matching the user's reference screenshot (Screenshot_20261003-232118.jpg)
import waveWallpaper from '../../assets/images/status_wave_wallpaper_1791059420542.jpg';
import alexPortrait from '../../assets/images/alex_portrait_1791059432462.jpg';
import micWallpaper from '../../assets/images/status_mic_wallpaper_1791059446504.jpg';
import sarahPortrait from '../../assets/images/sarah_portrait_1791059459448.jpg';
import freshKkStatus from '../../assets/images/fresh_kk_status_1791078352206.jpg';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import beachWallpaper from '../../assets/images/zanzibar_beach_1790280962219.jpg';

interface ChatListStatusRowProps {
  currentUser: UserProfile;
  onOpenCreateStatus: () => void;
  onSendStatusReply?: (status: StatusItem, replyText: string) => void;
}

export const INITIAL_CHAT_STATUSES: StatusItem[] = [
  {
    id: 'status_card_1',
    authorId: 'user_alex',
    authorName: 'Alex Kimani',
    authorUsername: 'alex_k',
    authorPhoto: alexPortrait,
    type: 'photo',
    mediaUrl: waveWallpaper,
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
    authorPhoto: sarahPortrait,
    type: 'photo',
    mediaUrl: micWallpaper,
    text: 'Late night studio recording session 🎙️🎶 New track coming soon!',
    location: 'Dar es Salaam, Tanzania',
    visibility: 'public',
    likesCount: 2310,
    commentsCount: 145,
    sharesCount: 78,
    createdAt: '35m ago',
    expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_fresh_kk',
    authorId: 'user_fresh_kk',
    authorName: 'Fresh kk',
    authorUsername: 'fresh_kk',
    authorPhoto: freshKkAvatar,
    type: 'photo',
    mediaUrl: freshKkStatus,
    text: 'Fresh vibes outdoor! ☀️✌️',
    location: 'Dar es Salaam, Tanzania',
    visibility: 'public',
    likesCount: 1840,
    commentsCount: 112,
    sharesCount: 46,
    createdAt: '45m ago',
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_beach',
    authorId: 'user_amina',
    authorName: 'Amina Juma',
    authorUsername: 'amina_j',
    authorPhoto: aminaAvatar,
    type: 'photo',
    mediaUrl: beachWallpaper,
    text: 'Good vibes only on the coast 💛🌊',
    location: 'Zanzibar, Tanzania',
    visibility: 'public',
    likesCount: 1200,
    commentsCount: 342,
    sharesCount: 98,
    createdAt: '2h ago',
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
  },
];

export const ChatListStatusRow: React.FC<ChatListStatusRowProps> = ({
  currentUser,
  onOpenCreateStatus,
  onSendStatusReply,
}) => {
  const [statuses] = useState<StatusItem[]>(INITIAL_CHAT_STATUSES);
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    initialIndex: number;
  }>({
    isOpen: false,
    initialIndex: 0,
  });

  return (
    <div className="pt-2 pb-2.5 px-3 border-b border-white/[0.06] select-none bg-black/10">
      {/* Horizontal Carousel of Squircle Status Cards (Exact match to Screenshot_20261003-232118.jpg) */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {/* 1. My Status Card (Hali Yangu) */}
        <div
          onClick={onOpenCreateStatus}
          className="relative w-[136px] sm:w-[144px] h-[84px] sm:h-[90px] rounded-[28px] overflow-hidden bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#334155] border border-white/15 shrink-0 cursor-pointer active:scale-95 transition-all shadow-lg hover:border-cyan-400/60 group"
          title="Weka Hali Yako (Post Status)"
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

          {/* Top-Left Circular Avatar with White Ring and + Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="relative">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-900">
                <img
                  src={currentUser.photoURL || aminaAvatar}
                  alt="My Status"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8.5px] font-black border border-[#0F172A] shadow-sm">
                <Plus className="w-2.5 h-2.5 stroke-[3.5]" />
              </span>
            </div>
          </div>

          {/* Clean Label */}
          <div className="absolute bottom-2 left-3 right-2 z-10 pointer-events-none">
            <p className="text-[11px] font-bold text-white truncate drop-shadow leading-tight">
              Hali Yangu
            </p>
          </div>
        </div>

        {/* 2. Contact Status Cards (Exact match to Screenshot_20261003-232118.jpg) */}
        {statuses.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setViewerState({ isOpen: true, initialIndex: idx })}
            className="relative w-[136px] sm:w-[144px] h-[84px] sm:h-[90px] rounded-[28px] overflow-hidden shrink-0 cursor-pointer group active:scale-95 transition-all shadow-lg border border-white/10 hover:border-cyan-400/80"
            title={`Tazama status ya ${item.authorName}`}
          >
            {/* Background image wallpaper covering the full card */}
            <img
              src={item.mediaUrl}
              alt={item.authorName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Subtle top-left vignette */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/30 pointer-events-none" />

            {/* Top-Left Circular Avatar with Solid White Ring (EXACT MATCH TO REFERENCE PHOTO) */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-900">
                <img
                  src={item.authorPhoto}
                  alt={item.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <StatusStoryViewerModal
        isOpen={viewerState.isOpen}
        statuses={statuses}
        initialIndex={viewerState.initialIndex}
        onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
        onReply={onSendStatusReply}
      />
    </div>
  );
};
