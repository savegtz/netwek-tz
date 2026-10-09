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
} from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { StatusStoryViewerModal } from './StatusStoryViewerModal';
import { SafeImage } from '../../components/SafeImage';

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
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    type: 'food',
    mediaUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
    text: '“Fresh, juicy & delicious 🤤”\n\n🔥 Our famous Chicken Burger is back! Fresh grilled patty, cheddar cheese, na crispy fries.\n#ZebraRestaurant #ChickenBurger #DarFood',
    location: 'Masaki, Dar es Salaam',
    visibility: 'public',
    likesCount: 245,
    commentsCount: 32,
    sharesCount: 14,
    createdAt: '10m',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    metadata: {
      foodName: 'Chicken Burger',
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

  // 2. Fresh kk (Outdoor Vibes)
  {
    id: 'status_card_fresh_kk',
    authorId: 'user_fresh_kk',
    authorName: 'Fresh kk',
    authorUsername: 'fresh_kk',
    authorPhoto: freshKkAvatar,
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

  // 3. POLL STORY (Alex Kimani - Leo tukatoke wapi? 😎)
  {
    id: 'status_card_poll_dar',
    authorId: 'user_alex',
    authorName: 'Alex Kimani',
    authorUsername: 'alex_k',
    authorPhoto: alexAvatar,
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

        {/* Circular Stories Row (Ultra-clean WhatsApp/Instagram Style) */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5 overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* ============================================================== */}
          {/* 1. MY STORY SQUIRCLE (Hali Yangu / Weka Mpya)                   */}
          {/* ============================================================== */}
          <button
            onClick={onOpenCreateStatus}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            title="Weka Hali Yako (Post Status)"
          >
            <div className="relative">
              {/* Outer Ring: 1:1 Square with Large Rounded Corners (Squircle) */}
              <div className="w-[56px] h-[56px] aspect-square rounded-[20px] p-[2.5px] bg-slate-800 ring-2 ring-white/10 group-hover:ring-cyan-400 group-hover:scale-105 transition-all shadow-md">
                <div className="w-full h-full rounded-[17.5px] overflow-hidden bg-slate-900">
                  <SafeImage
                    src={currentUser?.photoURL || aminaAvatar}
                    fallbackText="Me"
                    alt="My Status"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              {/* Plus Badge at bottom-right */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-[8px] bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md ring-2 ring-[#080B16] group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors truncate max-w-[62px] text-center leading-tight">
              Hali Yangu
            </span>
          </button>

          {/* ============================================================== */}
          {/* 2. CONTACT / COMMUNITY STORY SQUIRCLES (1:1 Rounded Rect)       */}
          {/* ============================================================== */}
          {allStatuses.map((item, idx) => {
            const firstName = item.authorName.split(' ')[0];
            const isFood = item.type === 'food';
            const isPoll = item.type === 'poll';
            const isProduct = item.type === 'product';
            const isEvent = item.type === 'event';

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
                key={item.id}
                onClick={() => setViewerState({ isOpen: true, initialIndex: idx })}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                title={`Tazama story ya ${item.authorName}`}
              >
                <div className="relative">
                  {/* Glowing Story Gradient Ring: 1:1 Square with Large Rounded Corners */}
                  <div className={`w-[56px] h-[56px] aspect-square rounded-[20px] p-[2.5px] bg-gradient-to-tr ${ringGradient} shadow-md group-hover:scale-105 active:scale-95 transition-transform duration-200`}>
                    <div className="w-full h-full rounded-[17.5px] overflow-hidden bg-[#080B16] p-[1.5px]">
                      <div className="w-full h-full rounded-[16px] overflow-hidden">
                        <SafeImage
                          src={item.authorPhoto}
                          fallbackText={item.authorName}
                          alt={item.authorName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Micro Category Tag at bottom-right */}
                  <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-[7px] bg-[#0D1224] border border-white/25 flex items-center justify-center text-[9px] shadow-sm ring-2 ring-[#080B16]">
                    {microEmoji}
                  </span>
                </div>

                {/* Author Name */}
                <span className="text-[10px] font-medium text-slate-300 group-hover:text-cyan-300 transition-colors truncate max-w-[62px] text-center leading-tight">
                  {firstName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
