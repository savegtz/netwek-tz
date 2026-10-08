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
    <div className="pt-2.5 pb-3 px-3.5 border-b border-white/[0.06] select-none bg-gradient-to-b from-[#090D1A]/80 to-[#070A14]">
      {/* Top Header Row: Title & Action */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200 tracking-tight">
            Stories
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold font-mono">
            {allStatuses.length} mpya
          </span>
        </div>

        <button
          onClick={onOpenCreateStatus}
          className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          title="Weka Hali Yako"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:scale-110 transition-transform" />
          <span>Weka Story</span>
        </button>
      </div>

      {/* Stories Carousel with smooth touch scrolling and desktop navigation arrows */}
      <div className="relative group/carousel">
        {/* Left Scroll Arrow (Desktop) */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#0A0F1E]/90 hover:bg-[#121B33] text-white items-center justify-center border border-white/10 shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Scroll Arrow (Desktop) */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#0A0F1E]/90 hover:bg-[#121B33] text-white items-center justify-center border border-white/10 shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Story Cards List */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5 overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* ============================================================== */}
          {/* 1. MY STORY CARD (Hali Yangu / Weka Mpya)                       */}
          {/* ============================================================== */}
          <button
            onClick={onOpenCreateStatus}
            className="group relative w-[100px] min-w-[100px] h-[100px] sm:w-[108px] sm:min-w-[108px] sm:h-[108px] aspect-square rounded-[30px] overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:border-cyan-300 hover:shadow-cyan-400/45 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex flex-col justify-between text-left focus:outline-none shrink-0 bg-[#0E1428]"
            title="Weka Hali Yako (Post Status)"
          >
            {/* Background User Avatar with smooth overlay */}
            <div className="absolute inset-0 z-0 bg-slate-900">
              <SafeImage
                src={currentUser?.photoURL || aminaAvatar}
                fallbackText="Me"
                alt="My Status"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A14] via-black/40 to-transparent" />
            </div>

            {/* Top-Right Badge: Plus icon inside glowing ring */}
            <div className="relative z-10 pt-2.5 px-2.5 pb-1 flex items-center justify-between w-full">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                + Story
              </span>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/40 ring-2 ring-black/40 group-hover:scale-110 group-hover:rotate-90 transition-all">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Bottom Row: Text */}
            <div className="relative z-10 pb-2.5 px-2.5 pt-0 w-full text-left">
              <p className="text-[11px] font-extrabold text-white tracking-tight leading-tight drop-shadow-md truncate">
                Hali Yangu
              </p>
              <p className="text-[9px] font-medium text-cyan-300/90 tracking-tight leading-none mt-0.5 drop-shadow">
                Weka Mpya
              </p>
            </div>
          </button>

          {/* ============================================================== */}
          {/* 2. CONTACT / COMMUNITY STORY CARDS                             */}
          {/* ============================================================== */}
          {allStatuses.map((item, idx) => {
            const firstName = item.authorName.split(' ')[0];
            const isFood = item.type === 'food';
            const isPoll = item.type === 'poll';
            const isProduct = item.type === 'product';
            const isEvent = item.type === 'event';

            // Distinct badge icon and label
            let badgeIcon = null;
            let badgeLabel = item.createdAt;
            let badgeClass = 'bg-black/60 text-slate-200 border-white/10';

            if (isFood) {
              badgeIcon = <Utensils className="w-2.5 h-2.5 mr-0.5 text-amber-300" />;
              badgeLabel = item.metadata?.specialOfferLabel || 'Ofa';
              badgeClass = 'bg-amber-500/90 text-slate-950 font-black border-amber-400';
            } else if (isPoll) {
              badgeIcon = <BarChart2 className="w-2.5 h-2.5 mr-0.5 text-blue-200" />;
              badgeLabel = 'Kura';
              badgeClass = 'bg-blue-500/90 text-white font-bold border-blue-400';
            } else if (isProduct) {
              badgeIcon = <ShoppingBag className="w-2.5 h-2.5 mr-0.5 text-emerald-200" />;
              badgeLabel = item.metadata?.discountBadge || 'Duka';
              badgeClass = 'bg-emerald-500/90 text-slate-950 font-black border-emerald-400';
            } else if (isEvent) {
              badgeIcon = <Calendar className="w-2.5 h-2.5 mr-0.5 text-purple-200" />;
              badgeLabel = 'Tukio';
              badgeClass = 'bg-purple-500/90 text-white font-bold border-purple-400';
            }

            return (
              <button
                key={item.id}
                onClick={() => setViewerState({ isOpen: true, initialIndex: idx })}
                className="group relative w-[100px] min-w-[100px] h-[100px] sm:w-[108px] sm:min-w-[108px] sm:h-[108px] aspect-square rounded-[30px] overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.28)] hover:border-cyan-300 hover:shadow-cyan-400/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex flex-col justify-between text-left focus:outline-none shrink-0 bg-slate-950"
                title={`Tazama story ya ${item.authorName}`}
              >
                {/* Background Image Preview with Zoom effect */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                  <SafeImage
                    src={item.mediaUrl}
                    fallbackGradient="from-cyan-950 via-slate-900 to-indigo-950"
                    alt={item.text}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Top scrim for avatar and badge */}
                  <div className="absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-black/85 via-black/30 to-transparent" />
                  {/* Bottom scrim for author name and snippet */}
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                </div>

                {/* Top Row: Creator Avatar & Story Badge */}
                <div className="relative z-10 pt-2.5 px-2.5 pb-1 flex items-center justify-between w-full">
                  {/* Creator Avatar with Glowing Gradient Ring */}
                  <div className="w-6 h-6 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-400 shadow-md ring-1 ring-black/60 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                      <SafeImage
                        src={item.authorPhoto}
                        fallbackText={item.authorName}
                        alt={item.authorName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Story Badge */}
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] backdrop-blur-md shadow-sm border ${badgeClass} truncate max-w-[48px]`}
                  >
                    {badgeIcon}
                    <span className="truncate">{badgeLabel}</span>
                  </span>
                </div>

                {/* Bottom Row: Creator Name & Story Snippet/Price */}
                <div className="relative z-10 pb-2.5 px-2.5 pt-0 w-full">
                  <h4 className="text-[10.5px] font-bold text-white tracking-tight leading-tight truncate drop-shadow-md">
                    {firstName}
                  </h4>
                  <div className="text-[9px] font-medium leading-tight truncate mt-0.5 drop-shadow-sm">
                    {isFood && (
                      <span className="text-amber-300 font-bold">
                        TSh {(item.metadata?.offerPrice || 12000).toLocaleString()}
                      </span>
                    )}
                    {isProduct && (
                      <span className="text-emerald-300 font-bold">
                        TSh {(item.metadata?.salePrice || 175000).toLocaleString()}
                      </span>
                    )}
                    {isPoll && (
                      <span className="text-cyan-300 font-medium">
                        {item.metadata?.pollQuestion?.split(' ')[0] || 'Kura'}?
                      </span>
                    )}
                    {isEvent && (
                      <span className="text-purple-300 font-medium">
                        {item.metadata?.eventName?.split(' ')[0] || 'Tukio'}
                      </span>
                    )}
                    {!isFood && !isProduct && !isPoll && !isEvent && (
                      <span className="text-slate-300/90 font-normal">
                        {item.location ? item.location.split(',')[0] : 'Vibes ☀️'}
                      </span>
                    )}
                  </div>
                </div>
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
