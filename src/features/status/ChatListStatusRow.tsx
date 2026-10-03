import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { StatusStoryViewerModal } from './StatusStoryViewerModal';

// Direct bundled local imports matching reference image exactly
import waveWallpaper from '../../assets/images/status_wave_wallpaper_1791059420542.jpg';
import alexPortrait from '../../assets/images/alex_portrait_1791059432462.jpg';
import micWallpaper from '../../assets/images/status_mic_wallpaper_1791059446504.jpg';
import sarahPortrait from '../../assets/images/sarah_portrait_1791059459448.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import beachWallpaper from '../../assets/images/zanzibar_beach_1790280962219.jpg';
import concertWallpaper from '../../assets/images/concert_festival_1790280974630.jpg';
import earbudsWallpaper from '../../assets/images/wireless_earbuds_1790280984496.jpg';

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
    createdAt: '45m ago',
    expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_3',
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
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_4',
    authorId: 'user_james',
    authorName: 'James Ochieng',
    authorUsername: 'james_o',
    authorPhoto: alexPortrait,
    type: 'photo',
    mediaUrl: concertWallpaper,
    text: 'Live music and festival energy tonight! ⚡🎉',
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
    authorName: 'Tech Hub',
    authorUsername: 'techhub',
    authorPhoto: sarahPortrait,
    type: 'photo',
    mediaUrl: earbudsWallpaper,
    text: 'High-res audio earbuds just arrived! 🎧🔥',
    location: 'Mombasa, Kenya',
    visibility: 'public',
    likesCount: 610,
    commentsCount: 29,
    sharesCount: 12,
    createdAt: '5h ago',
    expiresAt: new Date(Date.now() + 19 * 3600 * 1000).toISOString(),
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
    <div className="pt-2 pb-1.5 px-3 border-b border-white/[0.06] select-none">
      {/* Horizontal Status Cards Carousel (Exact match to WhatsApp reference image) */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
        {/* 1. My Status Card (Hali Yangu) */}
        <div
          onClick={onOpenCreateStatus}
          className="relative w-[100px] sm:w-[104px] h-[58px] sm:h-[60px] rounded-[26px] overflow-hidden bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#334155] border border-white/10 shrink-0 cursor-pointer active:scale-95 transition-all shadow-md hover:border-cyan-400/60"
          title="Weka Hali Yako (Post Status)"
        >
          {/* Subtle dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Top-Left Circular Avatar with Solid White Ring (Exact match to reference photo) */}
          <div className="absolute top-2 left-2 z-10">
            <div className="relative">
              <img
                src={currentUser.photoURL || aminaAvatar}
                alt="My Status"
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-md bg-slate-900"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8.5px] font-black border border-[#0F172A] shadow-sm">
                <Plus className="w-2.5 h-2.5 stroke-[3.5]" />
              </span>
            </div>
          </div>
        </div>

        {/* 2. Contact Status Cards (Card 1: Fluid Waves + Man, Card 2: Vintage Mic + Woman) */}
        {statuses.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setViewerState({ isOpen: true, initialIndex: idx })}
            className="relative w-[100px] sm:w-[104px] h-[58px] sm:h-[60px] rounded-[26px] overflow-hidden shrink-0 cursor-pointer group active:scale-95 transition-all shadow-md border border-white/10 hover:border-cyan-400/80"
            title={`Tazama status ya ${item.authorName}`}
          >
            {/* Background cover image (Vivid waves or microphone matching screenshot) */}
            <img
              src={item.mediaUrl}
              alt={item.authorName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Top-Left Circular Avatar with Solid White Ring (EXACT MATCH TO REFERENCE PHOTO) */}
            <div className="absolute top-2 left-2 z-10">
              <img
                src={item.authorPhoto}
                alt={item.authorName}
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-md bg-slate-900"
              />
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
