import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { StatusStoryViewerModal } from './StatusStoryViewerModal';

// Bundled local image assets matching the user's reference image
import freshKkStatus from '../../assets/images/fresh_kk_status_1791078352206.jpg';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import waveWallpaper from '../../assets/images/status_wave_wallpaper_1791059420542.jpg';
import alexPortrait from '../../assets/images/alex_portrait_1791059432462.jpg';
import micWallpaper from '../../assets/images/status_mic_wallpaper_1791059446504.jpg';
import sarahPortrait from '../../assets/images/sarah_portrait_1791059459448.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import beachWallpaper from '../../assets/images/zanzibar_beach_1790280962219.jpg';
import teamDesign from '../../assets/images/team_design_1790802245828.jpg';

interface ChatListStatusRowProps {
  currentUser: UserProfile;
  onOpenCreateStatus: () => void;
  onSendStatusReply?: (status: StatusItem, replyText: string) => void;
}

export const INITIAL_CHAT_STATUSES: StatusItem[] = [
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
    createdAt: '10m ago',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_sarah',
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
    id: 'status_card_design',
    authorId: 'user_design_team',
    authorName: 'Design Team',
    authorUsername: 'design_team',
    authorPhoto: teamDesign,
    type: 'photo',
    mediaUrl: teamDesign,
    text: 'Final creative UI project ready for launch! 🚀🎨',
    location: 'Nairobi, Kenya',
    visibility: 'public',
    likesCount: 920,
    commentsCount: 54,
    sharesCount: 28,
    createdAt: '1h ago',
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_alex',
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
    createdAt: '2h ago',
    expiresAt: new Date(Date.now() + 21 * 3600 * 1000).toISOString(),
  },
  {
    id: 'status_card_amina',
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
    createdAt: '3h ago',
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
      {/* Horizontal Carousel of Vertical Status Cards (Matching WhatsApp reference screenshot) */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
        {/* 1. My Status Card (Hali Yangu) */}
        <div
          onClick={onOpenCreateStatus}
          className="relative w-[100px] sm:w-[108px] h-[134px] sm:h-[142px] rounded-[24px] overflow-hidden bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#334155] border border-white/10 shrink-0 cursor-pointer active:scale-95 transition-all shadow-md hover:border-cyan-400/60 group"
          title="Weka Hali Yako (Post Status)"
        >
          {/* Background image / subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

          {/* Top-Left Circular Avatar with Solid White Ring (WhatsApp Reference Match) */}
          <div className="absolute top-2 left-2 z-10">
            <div className="relative">
              <img
                src={currentUser.photoURL || aminaAvatar}
                alt="My Status"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-md bg-slate-900"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8.5px] font-black border border-[#0F172A] shadow-sm">
                <Plus className="w-2.5 h-2.5 stroke-[3.5]" />
              </span>
            </div>
          </div>

          {/* Bottom Contact Label */}
          <div className="absolute bottom-2.5 left-2.5 right-1.5 z-10 pointer-events-none">
            <p className="text-[11px] font-bold text-white truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-tight">
              Hali Yangu
            </p>
            <p className="text-[9px] font-medium text-cyan-300 truncate drop-shadow leading-tight mt-0.5">
              Gusa kuweka
            </p>
          </div>
        </div>

        {/* 2. Contact Status Cards (Card 1: Fresh kk with photo & name, Card 2: Sarah Mwangi, Card 3: Design Team, etc.) */}
        {statuses.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setViewerState({ isOpen: true, initialIndex: idx })}
            className="relative w-[100px] sm:w-[108px] h-[134px] sm:h-[142px] rounded-[24px] overflow-hidden shrink-0 cursor-pointer group active:scale-95 transition-all shadow-md border border-white/10 hover:border-cyan-400/80"
            title={`Tazama status ya ${item.authorName}`}
          >
            {/* Background cover image (Direct local image bundle) */}
            <img
              src={item.mediaUrl}
              alt={item.authorName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Dark gradient overlay for crystal clear text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

            {/* Top-Left Circular Avatar with Solid White Ring (EXACT MATCH TO REFERENCE PHOTO) */}
            <div className="absolute top-2 left-2 z-10">
              <img
                src={item.authorPhoto}
                alt={item.authorName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-md bg-slate-900"
              />
            </div>

            {/* Bottom Contact Name (EXACT MATCH TO "Fresh kk" ON USER'S SCREENSHOT) */}
            <div className="absolute bottom-2.5 left-2.5 right-1.5 z-10 pointer-events-none">
              <p className="text-[11px] font-bold text-white truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-tight">
                {item.authorName}
              </p>
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
