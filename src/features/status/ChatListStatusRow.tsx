import React, { useState } from 'react';
import { Plus, Utensils, BarChart2, ShoppingBag, Calendar, Flame } from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { StatusStoryViewerModal } from './StatusStoryViewerModal';
import { SafeImage } from '../../components/SafeImage';

// Bundled local image assets matching the user's reference
import freshKkStatus from '../../assets/images/fresh_kk_status_1791078352206.jpg';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';

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
    authorName: 'ZEBRA RESTAURANT',
    authorUsername: 'zebra_restaurant',
    authorPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    type: 'food',
    mediaUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
    text: '“Fresh, juicy & delicious 🤤”\n\n🔥 Our famous Chicken Burger is back! Fresh grilled patty, cheddar cheese, na crispy fries.\n#ZebraRestaurant #ChickenBurger #DarFood',
    location: 'Masaki, Dar es Salaam',
    visibility: 'public',
    likesCount: 245,
    commentsCount: 32,
    sharesCount: 14,
    createdAt: '10m ago',
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

  // 2. Fresh kk
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
    createdAt: '15m ago',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },

  // 3. POLL STORY (Leo tukatoke wapi? 😎)
  {
    id: 'status_card_poll_dar',
    authorId: 'user_alex',
    authorName: 'Alex Kimani',
    authorUsername: 'alex_k',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    type: 'poll',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    text: 'Mpango wa weekend hii unakaaje wana-Dar? Piga kura yako sasa tujue wapi kuna fujo ya furaha! 🌊🌴',
    location: 'Dar es Salaam, Tanzania',
    visibility: 'public',
    likesCount: 512,
    commentsCount: 89,
    sharesCount: 42,
    createdAt: '45m ago',
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

  // 4. PRODUCT STORY (Nike Air Max)
  {
    id: 'status_card_prod_nike',
    authorId: 'fresh_store_dar',
    authorName: 'Fresh Store Dar',
    authorUsername: 'fresh_store',
    authorPhoto: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    type: 'product',
    mediaUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    text: 'Nike Air Max Original Sneakers zimeingia mzigo mpya! Punguzo la 12.5% kwa oda za leo pekee. #FreshStore #SneakersDar #Streetwear',
    location: 'Kariakoo, Dar es Salaam',
    visibility: 'public',
    likesCount: 380,
    commentsCount: 45,
    sharesCount: 19,
    createdAt: '1h ago',
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    metadata: {
      productName: 'Nike Air Max',
      regularPrice: 200000,
      salePrice: 175000,
      discountBadge: '12.5% OFF — NEW ARRIVAL',
      stockRemaining: 24,
      variants: {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue'],
      },
      actionButtons: ['buy_now', 'chat_now'],
    },
  },

  // 5. EVENT STORY (Dar Food Festival 2026)
  {
    id: 'status_card_event_fest',
    authorId: 'dar_food_fest',
    authorName: 'Dar Food Festival 2026',
    authorUsername: 'darfoodfest',
    authorPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    type: 'event',
    mediaUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
    text: 'Weekend kubwa ya food, music na entertainment! Tiketi za VIP na Regular ziko sokoni sasa. Usikose live performances!',
    location: 'Mlimani City, Dar es Salaam',
    visibility: 'public',
    likesCount: 890,
    commentsCount: 112,
    sharesCount: 85,
    createdAt: '2h ago',
    expiresAt: new Date(Date.now() + 21 * 3600 * 1000).toISOString(),
    metadata: {
      eventName: 'Dar Food Festival 2026',
      eventDate: '12 October 2026',
      eventStartTime: '08:00 PM',
      eventEndTime: '02:00 AM',
      capacity: 500,
      ticketsSold: 327,
      lineup: ['Harmonize', 'DJ Fresh', 'Rayvanny', 'Food Festival', 'Games'],
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
  // Combine custom user-created statuses with initial rich statuses
  const allStatuses = [...customStatuses, ...INITIAL_CHAT_STATUSES];

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

  return (
    <div className="pt-2 pb-2.5 px-3 border-b border-white/[0.06] select-none bg-black/10">
      {/* Horizontal Carousel of Squircle Status Cards */}
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
                <SafeImage
                  src={currentUser.photoURL || aminaAvatar}
                  fallbackText="Me"
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
            <p className="text-[9px] text-cyan-300/80 truncate">Gusa kuongeza</p>
          </div>
        </div>

        {/* 2. Contact Status Cards: Zebra Restaurant, Fresh kk, Alex, Fresh Store, Event */}
        {allStatuses.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setViewerState({ isOpen: true, initialIndex: idx })}
            className="relative w-[136px] sm:w-[144px] h-[84px] sm:h-[90px] rounded-[28px] overflow-hidden shrink-0 cursor-pointer group active:scale-95 transition-all shadow-lg border border-white/10 hover:border-cyan-400/80"
            title={`Tazama status ya ${item.authorName}`}
          >
            {/* Background image wallpaper covering the full card */}
            <SafeImage
              src={item.mediaUrl}
              fallbackText={item.authorName}
              alt={item.authorName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

            {/* Top-Left Circular Avatar with Solid White Ring */}
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-900">
                <SafeImage
                  src={item.authorPhoto}
                  fallbackText={item.authorName}
                  alt={item.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Category / Offer Badge on Top-Right */}
            {item.type === 'food' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-sm z-10">
                🍕 Food
              </span>
            )}
            {item.type === 'poll' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[9px] shadow-sm z-10">
                📊 Poll
              </span>
            )}
            {item.type === 'product' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] shadow-sm z-10">
                🛍️ Shop
              </span>
            )}
            {item.type === 'event' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-bold text-[9px] shadow-sm z-10">
                🎪 Event
              </span>
            )}

            {/* Bottom info */}
            <div className="absolute bottom-2 left-3 right-2 z-10 pointer-events-none">
              <p className="text-[11px] font-bold text-white truncate drop-shadow leading-tight">
                {item.authorName}
              </p>
              {item.type === 'food' && item.metadata?.offerPrice && (
                <p className="text-[9px] text-amber-300 font-bold truncate">
                  TSh {item.metadata.offerPrice.toLocaleString()} • Ofa
                </p>
              )}
              {item.type === 'poll' && (
                <p className="text-[9px] text-blue-300 font-bold truncate">
                  Piga Kura 🗳️
                </p>
              )}
              {item.type === 'product' && item.metadata?.salePrice && (
                <p className="text-[9px] text-emerald-300 font-bold truncate">
                  TSh {item.metadata.salePrice.toLocaleString()}
                </p>
              )}
              {item.type === 'event' && (
                <p className="text-[9px] text-purple-300 font-bold truncate">
                  12 Oct • Tiketi
                </p>
              )}
              {item.type === 'photo' && (
                <p className="text-[9px] text-slate-300 truncate">
                  {item.createdAt}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
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
