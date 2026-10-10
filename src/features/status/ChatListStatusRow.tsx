import React, { useState, useRef } from 'react';
import {
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShoppingBag,
  BarChart2,
  Calendar,
  Utensils,
  Shapes,
} from 'lucide-react';
import { StatusItem, UserProfile, AvatarShapeStyle } from '../../types';
import { StatusStoryViewerModal } from './StatusStoryViewerModal';
import { SafeImage } from '../../components/SafeImage';
import { DynamicAvatar } from '../../components/DynamicAvatar';
import { AvatarStyleSelectorModal } from '../../components/AvatarStyleSelectorModal';
import { Palette, Layers } from 'lucide-react';
import {
  AVATAR_STYLES_LIST,
  getStoredAvatarStyle,
  setStoredAvatarStyle,
} from '../profile/avatarStyles';

// Bundled local image assets matching the app's visual identity
import freshKkStatus from '../../assets/images/fresh_kk_status_1791078352206.jpg';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import alexPortrait from '../../assets/images/alex_portrait_1791059432462.jpg';
import alexAvatar from '../../assets/images/alex_avatar_1790802235334.jpg';
import sarahPortrait from '../../assets/images/sarah_portrait_1791059459448.jpg';
import sarahAvatar from '../../assets/images/sarah_avatar_1790802224123.jpg';
import concertFestival from '../../assets/images/concert_festival_1790280974630.jpg';

interface ChatListStatusRowProps {
  currentUser: UserProfile;
  onOpenCreateStatus: () => void;
  onSendStatusReply?: (status: StatusItem, replyText: string) => void;
  customStatuses?: StatusItem[];
  onStartChatWithBusiness?: (
    businessId: string,
    businessName: string,
    initialMessage?: string,
    avatar?: string
  ) => void;
}

export const INITIAL_CHAT_STATUSES: StatusItem[] = [
  // 1. ZEBRA RESTAURANT (Food Story)
  {
    id: 'status_card_zebra_food',
    authorId: 'zebra_restaurant',
    authorName: 'Zebra Rest.',
    authorUsername: 'zebra_restaurant',
    authorPhoto:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
    avatarStyle: 'squircle',
    type: 'food',
    mediaUrl:
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80',
    text: '🔥 Chicken Burger Deluxe yetu maarufu imerejea!\n• Nyama ya kuku iliyochomwa kwenye moto mwororo (Flame-grilled)\n• Jibini ya Cheddar iliyoyeyuka vizuri na chipsi za dhahabu\nKaribu Zebra Restaurant Masaki ujionee ladha halisi! 🤤✨',
    location: 'Masaki, Dar es Salaam',
    visibility: 'public',
    likesCount: 245,
    commentsCount: 32,
    sharesCount: 14,
    createdAt: '10m',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    metadata: {
      foodName: 'Chicken Burger Deluxe',
      restaurantName: 'ZEBRA RESTAURANT',
      regularPrice: 15000,
      offerPrice: 12000,
      discount: '20% OFF — Today Only',
      specialOfferLabel: '🔥 TODAY ONLY',
      validUntil: '10:00 PM',
      rating: 4.8,
      ratingBreakdown: {
        taste: 5.0,
        presentation: 4.8,
        service: 4.7,
        value: 4.9,
      },
      actionButtons: ['order_now', 'chat_now'],
    },
  },

  // 1b. Zebra Restaurant (Story 2 - Tropical Passion Mocktail)
  {
    id: 'status_card_zebra_mocktail',
    authorId: 'zebra_restaurant',
    authorName: 'Zebra Rest.',
    authorUsername: 'zebra_restaurant',
    authorPhoto:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
    avatarStyle: 'squircle',
    type: 'food',
    mediaUrl:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&auto=format&fit=crop&q=80',
    text: '🍹 Tropical Passion Fruit Mocktail! Karibu ujipatie vinywaji baridi vya matunda asilia leo Masaki. Happy Hour kuanzia saa 11 jioni.',
    location: 'Masaki, Dar es Salaam',
    visibility: 'public',
    likesCount: 310,
    commentsCount: 42,
    sharesCount: 19,
    createdAt: '8m',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    metadata: {
      foodName: 'Passion Mocktail',
      restaurantName: 'ZEBRA RESTAURANT',
      regularPrice: 8000,
      offerPrice: 5000,
      discount: '37% OFF — Happy Hour',
      specialOfferLabel: '🍹 HAPPY HOUR',
      validUntil: '8:00 PM',
      rating: 4.9,
      actionButtons: ['order_now', 'chat_now'],
    },
  },

  // 2. Fresh kk (Outdoor Vibes - Story 1)
  {
    id: 'status_card_fresh_kk',
    authorId: 'user_fresh_kk',
    authorName: 'Fresh kk',
    authorUsername: 'fresh_kk',
    authorPhoto: freshKkAvatar,
    avatarStyle: 'organic-blob',
    type: 'photo',
    mediaUrl: freshKkStatus,
    text: 'Fresh vibes outdoor! ☀️✌️ Dar es Salaam living.',
    location: 'Dar es Salaam, Tanzania',
    visibility: 'public',
    likesCount: 1840,
    commentsCount: 112,
    sharesCount: 46,
    createdAt: '15m',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },

  // 2b. Fresh kk (Story 2 - Masaki Beach Sunset)
  {
    id: 'status_card_fresh_kk_sunset',
    authorId: 'user_fresh_kk',
    authorName: 'Fresh kk',
    authorUsername: 'fresh_kk',
    authorPhoto: freshKkAvatar,
    avatarStyle: 'organic-blob',
    type: 'photo',
    mediaUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    text: 'Sunset chill Masaki beach baada ya ratiba za mchana 🌅✨ Dar es Salaam is full of good vibes!',
    location: 'Masaki, Dar es Salaam',
    visibility: 'public',
    likesCount: 1420,
    commentsCount: 88,
    sharesCount: 32,
    createdAt: '5m',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },

  // 3. POLL STORY (Alex Kimani - Leo tukatoke wapi? 😎)
  {
    id: 'status_card_poll_dar',
    authorId: 'user_alex',
    authorName: 'Alex Kimani',
    authorUsername: 'alex_k',
    authorPhoto: alexAvatar,
    avatarStyle: 'rounded-rectangle',
    type: 'poll',
    mediaUrl: alexPortrait,
    text: 'Mpango wa weekend hii unakaaje wana-Dar? Piga kura yako sasa tujue wapi kuna fujo ya furaha! 🌊🌴',
    location: 'Dar es Salaam, Tanzania',
    visibility: 'public',
    likesCount: 512,
    commentsCount: 89,
    sharesCount: 42,
    createdAt: '45m',
    expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
    metadata: {
      pollQuestion: 'Leo tukatoke wapi? 😎',
      pollOptions: [
        { id: 'opt_1', text: 'Coco Beach 🌊', votes: 48 },
        { id: 'opt_2', text: 'Mlimani City 🛍️', votes: 31 },
        { id: 'opt_3', text: 'Masaki 🍹', votes: 64 },
        { id: 'opt_4', text: 'Sinza 🍗', votes: 22 },
      ],
      pollSettings: {
        allowMultiple: false,
        anonymous: false,
        duration: '24 hours',
      },
    },
  },

  // 4. PRODUCT STORY (Nike Air Max - Fresh Store)
  {
    id: 'status_card_prod_nike',
    authorId: 'fresh_store_dar',
    authorName: 'Fresh Store',
    authorUsername: 'fresh_store',
    authorPhoto:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    avatarStyle: 'rounded-square',
    type: 'product',
    mediaUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    text: 'Nike Air Max Original Sneakers zimeingia mzigo mpya! Punguzo la 12.5% kwa oda za leo pekee.',
    location: 'Kariakoo, Dar es Salaam',
    visibility: 'public',
    likesCount: 380,
    commentsCount: 45,
    sharesCount: 19,
    createdAt: '1h',
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    metadata: {
      productName: 'Nike Air Max',
      regularPrice: 200000,
      salePrice: 175000,
      discountBadge: '12.5% OFF',
      stockRemaining: 24,
      actionButtons: ['buy_now', 'chat_now'],
    },
  },

  // 5. Sarah M. (Sunset & Lifestyle)
  {
    id: 'status_card_sarah_sunset',
    authorId: 'user_sarah_m',
    authorName: 'Sarah M.',
    authorUsername: 'sarah_m',
    authorPhoto: sarahAvatar,
    avatarStyle: 'shield',
    type: 'photo',
    mediaUrl: sarahPortrait,
    text: 'Mapumziko ya jioni Masaki beach 🍹🌅 Furaha ya upepo wa bahari.',
    location: 'Masaki, Dar es Salaam',
    visibility: 'public',
    likesCount: 940,
    commentsCount: 68,
    sharesCount: 28,
    createdAt: '2h',
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
  },

  // 6. EVENT STORY (Dar Live Music Festival)
  {
    id: 'status_card_dar_concert',
    authorId: 'events_dar',
    authorName: 'Dar Events',
    authorUsername: 'dar_events',
    authorPhoto:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    avatarStyle: 'gradient-ring',
    type: 'event',
    mediaUrl: concertFestival,
    text: 'Usiku wa Burudani Mlimani City Hall! Wasanii wote wakali jukwaa moja Jumamosi hii. Tiketi za VIP zinapatikana sasa.',
    location: 'Mlimani City, Dar',
    visibility: 'public',
    likesCount: 1420,
    commentsCount: 198,
    sharesCount: 76,
    createdAt: '3h',
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    metadata: {
      eventName: 'Dar Music Festival 2026',
      eventDate: 'Jumamosi hii',
      eventStartTime: '7:00 PM',
      ticketTiers: [
        { name: 'VIP', price: 30000 },
        { name: 'Regular', price: 15000 },
      ],
      actionButtons: ['get_ticket', 'chat_now'],
    },
  },
];

export const ChatListStatusRow: React.FC<ChatListStatusRowProps> = ({
  currentUser,
  onOpenCreateStatus,
  onSendStatusReply,
  customStatuses = [],
  onStartChatWithBusiness,
}) => {
  const allStatuses = [...customStatuses, ...INITIAL_CHAT_STATUSES];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [currentAvatarStyle, setCurrentAvatarStyle] = useState<AvatarShapeStyle>(() =>
    getStoredAvatarStyle()
  );

  React.useEffect(() => {
    const handleStyleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ style: AvatarShapeStyle }>;
      if (customEvent.detail?.style) {
        setCurrentAvatarStyle(customEvent.detail.style);
      }
    };
    window.addEventListener('zenia_avatar_style_changed', handleStyleChange);
    return () => {
      window.removeEventListener('zenia_avatar_style_changed', handleStyleChange);
    };
  }, []);

  // Group stories by author to support multi-story status accounts
  const groupedAuthors = React.useMemo(() => {
    const map = new Map<
      string,
      {
        authorId: string;
        authorName: string;
        authorUsername: string;
        authorPhoto: string;
        type: string;
        stories: StatusItem[];
        firstIndex: number;
      }
    >();

    allStatuses.forEach((st, idx) => {
      const key = st.authorId || st.authorUsername || st.authorName;
      if (!map.has(key)) {
        map.set(key, {
          authorId: st.authorId,
          authorName: st.authorName,
          authorUsername: st.authorUsername || '',
          authorPhoto: st.authorPhoto || '',
          type: st.type,
          stories: [st],
          firstIndex: idx,
        });
      } else {
        map.get(key)!.stories.push(st);
      }
    });

    return Array.from(map.values());
  }, [allStatuses]);

  // Check if current user has any status posted
  const myStories = customStatuses.filter(
    (s) => s.authorId === currentUser?.id || s.authorUsername === currentUser?.username
  );

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    initialIndex: number;
  }>({
    isOpen: false,
    initialIndex: 0,
  });

  const handleCloseViewer = React.useCallback(() => {
    setViewerState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-2 pb-2.5 px-3 border-b border-white/[0.06] select-none bg-[#080B16]">
      {/* Clean & Orderly Header with Studio Button */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            Hali (Story Status)
          </span>
          <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/25">
            {allStatuses.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsStyleModalOpen(true)}
          className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 whitespace-nowrap shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
          title="Badili mtindo wa Avatar & Story (Organic Blob, Squircle, Rounded Rectangle n.k.)"
        >
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mtindo wa Avatar (10)</span>
        </button>
      </div>

      {/* Stories Carousel with smooth touch scrolling */}
      <div className="relative group/carousel">
        {/* Left Scroll Arrow (Desktop only) */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute -left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#0A0F1E]/90 hover:bg-[#121B33] text-white items-center justify-center border border-white/10 shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Right Scroll Arrow (Desktop only) */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute -right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#0A0F1E]/90 hover:bg-[#121B33] text-white items-center justify-center border border-white/10 shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Stories Row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* ============================================================== */}
          {/* 1. MY STORY AVATAR (Hali Yangu / Weka Mpya)                     */}
          {/* Supports dynamic active style & multi-story stacked effect!   */}
          {/* ============================================================== */}
          <div className="flex flex-col items-center gap-2 shrink-0 group">
            <div className="relative">
              <button
                onClick={
                  myStories.length > 0
                    ? () => setViewerState({ isOpen: true, initialIndex: 0 })
                    : onOpenCreateStatus
                }
                className="focus:outline-none block active:scale-95 transition-transform"
                title={myStories.length > 0 ? 'Tazama Hali Yangu' : 'Weka Hali Yako Mpya'}
              >
                <DynamicAvatar
                  src={currentUser?.photoURL || aminaAvatar}
                  fallbackText="Me"
                  alt="My Status"
                  size="story"
                  styleVariant={myStories[0]?.avatarStyle || currentUser?.avatarStyle}
                  hasStory={myStories.length > 0}
                  storyCount={myStories.length > 0 ? myStories.length : 1}
                  showStoryBadge={myStories.length > 1}
                  ringGradient="from-cyan-400 via-blue-500 to-indigo-600"
                />
              </button>

              {/* Plus Badge at bottom-right for adding new story */}
              <button
                onClick={onOpenCreateStatus}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-[8px] bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-lg ring-2 ring-[#080B16] hover:scale-110 active:scale-95 transition-transform z-30"
                title="Weka Story Mpya"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <button
              onClick={
                myStories.length > 0
                  ? () => setViewerState({ isOpen: true, initialIndex: 0 })
                  : onOpenCreateStatus
              }
              className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-[78px] sm:max-w-[88px] text-center leading-tight focus:outline-none"
            >
              Hali Yangu
            </button>
          </div>

          {/* ============================================================== */}
          {/* 2. CONTACT / COMMUNITY STORY AVATARS                           */}
          {/* Grouped by Author: Uses exact chosen avatarStyle shape!        */}
          {/* ============================================================== */}
          {groupedAuthors.map((group) => {
            const firstName = group.authorName.split(' ')[0];
            const isFood = group.type === 'food';
            const isPoll = group.type === 'poll';
            const isProduct = group.type === 'product';
            const isEvent = group.type === 'event';
            const isMulti = group.stories.length > 1;
            const groupShape = group.stories[0]?.avatarStyle;

            // Distinct gradient ring based on story category
            let ringGradient = 'from-cyan-400 via-blue-500 to-indigo-500';
            let microEmoji = '✨';

            if (isFood) {
              ringGradient = 'from-amber-400 via-orange-500 to-rose-500';
              microEmoji = '🍔';
            } else if (isPoll) {
              ringGradient = 'from-blue-400 via-indigo-500 to-cyan-400';
              microEmoji = '📊';
            } else if (isProduct) {
              ringGradient = 'from-emerald-400 via-teal-500 to-cyan-400';
              microEmoji = '🛍️';
            } else if (isEvent) {
              ringGradient = 'from-purple-400 via-fuchsia-500 to-pink-500';
              microEmoji = '🎟️';
            }

            return (
              <button
                key={group.authorId}
                onClick={() => setViewerState({ isOpen: true, initialIndex: group.firstIndex })}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
                title={`Tazama ${group.stories.length} ${
                  group.stories.length > 1 ? 'stori za' : 'story ya'
                } ${group.authorName}`}
              >
                <div className="relative">
                  {/* Dynamic Avatar with exact shape chosen for this story */}
                  <DynamicAvatar
                    src={group.authorPhoto}
                    fallbackText={group.authorName}
                    alt={group.authorName}
                    size="story"
                    styleVariant={groupShape}
                    hasStory={true}
                    storyCount={group.stories.length}
                    showStoryBadge={isMulti}
                    ringGradient={ringGradient}
                  />

                  {/* Micro Category Tag at bottom-right */}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-[8px] bg-[#0D1224] border border-white/25 flex items-center justify-center text-[10px] shadow-sm ring-2 ring-[#080B16] z-20">
                    {microEmoji}
                  </span>
                </div>

                {/* Author Name & Story Count indication */}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-[78px] sm:max-w-[88px] text-center leading-tight">
                  {firstName}
                  {isMulti && (
                    <span className="ml-1 text-[10px] text-cyan-400 font-black">
                      ({group.stories.length})
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Avatar Style Chooser Modal */}
      {isStyleModalOpen && (
        <AvatarStyleSelectorModal
          isOpen={isStyleModalOpen}
          onClose={() => setIsStyleModalOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* Full-Screen Story Viewer Modal */}
      {viewerState.isOpen && (
        <StatusStoryViewerModal
          isOpen={viewerState.isOpen}
          statuses={allStatuses}
          initialIndex={viewerState.initialIndex}
          onClose={handleCloseViewer}
          onReply={onSendStatusReply}
          onStartChatWithBusiness={onStartChatWithBusiness}
        />
      )}
    </div>
  );
};
