import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
  Send,
  Eye,
  Bookmark,
  Utensils,
  BarChart2,
  ShoppingBag,
  Calendar,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { FoodOrderModal } from './components/FoodOrderModal';
import { EventTicketModal } from './components/EventTicketModal';
import { ProductPurchaseModal } from './components/ProductPurchaseModal';

interface StatusFeedProps {
  currentUser: UserProfile;
  onOpenCreateMenu: () => void;
  onStartChatWithBusiness?: (
    businessId: string,
    businessName: string,
    initialMessage?: string,
    avatar?: string
  ) => void;
  customStatuses?: StatusItem[];
}

export const StatusFeed: React.FC<StatusFeedProps> = ({
  currentUser,
  onOpenCreateMenu,
  onStartChatWithBusiness,
  customStatuses = [],
}) => {
  // Rich Default Status Items matching all prompt specifications
  const initialStatuses: StatusItem[] = [
    // 1. ZEBRA RESTAURANT (Food Story)
    {
      id: 'status_food_zebra',
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

    // 2. POLL STORY (Leo tukatoke wapi? 😎)
    {
      id: 'status_poll_dar',
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

    // 3. PRODUCT STORY (Nike Air Max)
    {
      id: 'status_prod_nike',
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

    // 4. EVENT STORY (Dar Food Festival 2026)
    {
      id: 'status_event_festival',
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

  // Merge custom statuses with initial list
  const [statusCards, setStatusCards] = useState<StatusItem[]>([
    ...customStatuses,
    ...initialStatuses,
  ]);

  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [likedStatusIds, setLikedStatusIds] = useState<Record<string, boolean>>({
    status_food_zebra: true,
  });
  const [savedStatusIds, setSavedStatusIds] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState('');
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  // Poll voting state
  const [userVotedOption, setUserVotedOption] = useState<Record<string, string>>({});

  // Modals state
  const [isFoodOrderOpen, setIsFoodOrderOpen] = useState(false);
  const [selectedFoodItemForOrder, setSelectedFoodItemForOrder] = useState<{
    name: string;
    restaurant: string;
    price: number;
  }>({
    name: 'Chicken Burger',
    restaurant: 'ZEBRA RESTAURANT',
    price: 12000,
  });

  const [isProductPurchaseOpen, setIsProductPurchaseOpen] = useState(false);
  const [isEventTicketOpen, setIsEventTicketOpen] = useState(false);

  // Fresh Food Near You items
  const freshFoodsNearYou = [
    {
      id: 'food_1',
      name: 'Chicken Burger',
      restaurant: 'Zebra Restaurant',
      price: 12000,
      regPrice: 15000,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
      tag: '🔥 20% OFF',
    },
    {
      id: 'food_2',
      name: 'Grilled Chicken',
      restaurant: 'Kookoos Grill',
      price: 15000,
      regPrice: 18000,
      image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&auto=format&fit=crop&q=80',
      tag: '🍗 Popular',
    },
    {
      id: 'food_3',
      name: 'BBQ Pizza',
      restaurant: 'XYZ Restaurant',
      price: 20000,
      regPrice: 24000,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
      tag: '🍕 Cheesy',
    },
  ];

  const currentStatus = statusCards[activeStoryIndex] || statusCards[0];
  const isLiked = !!likedStatusIds[currentStatus.id];
  const isSaved = !!savedStatusIds[currentStatus.id];

  const handleToggleLike = (statusId: string) => {
    setLikedStatusIds((prev) => {
      const next = !prev[statusId];
      setStatusCards((list) =>
        list.map((st) =>
          st.id === statusId ? { ...st, likesCount: st.likesCount + (next ? 1 : -1) } : st
        )
      );
      return { ...prev, [statusId]: next };
    });
  };

  const handleToggleSave = (statusId: string) => {
    setSavedStatusIds((prev) => ({ ...prev, [statusId]: !prev[statusId] }));
  };

  const handleVotePoll = (statusId: string, optionId: string) => {
    if (userVotedOption[statusId]) return; // already voted
    setUserVotedOption((prev) => ({ ...prev, [statusId]: optionId }));

    setStatusCards((list) =>
      list.map((st) => {
        if (st.id === statusId && st.metadata?.pollOptions) {
          const updatedOptions = st.metadata.pollOptions.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...st,
            metadata: {
              ...st.metadata,
              pollOptions: updatedOptions,
            },
          };
        }
        return st;
      })
    );
  };

  const handleOpenFoodOrder = (name: string, restaurant: string, price: number) => {
    setSelectedFoodItemForOrder({ name, restaurant, price });
    setIsFoodOrderOpen(true);
  };

  const handleStartChatWithStatusAuthor = () => {
    if (!onStartChatWithBusiness) return;
    const author = currentStatus.authorName;
    const authorId = currentStatus.authorId;
    let initialMsg = `Habari ${author}!`;

    if (currentStatus.type === 'food') {
      const foodName = currentStatus.metadata?.foodName || 'Chicken Burger';
      const offer = currentStatus.metadata?.offerPrice || 12000;
      initialMsg = `Habari ${author}! Ninaulizia kuhusu: 🍔 ${foodName} (TSh ${offer.toLocaleString()}) Ofa ya Masaki Dar es Salaam. Je, mnapokea oda sasa hivi?`;
    } else if (currentStatus.type === 'product') {
      const prodName = currentStatus.metadata?.productName || 'Nike Air Max';
      const price = currentStatus.metadata?.salePrice || 175000;
      initialMsg = `Habari ${author}! Ninaulizia kuhusu bidhaa ya: 🛍️ ${prodName} (TSh ${price.toLocaleString()}). Je, bado ipo stock?`;
    } else if (currentStatus.type === 'event') {
      const evName = currentStatus.metadata?.eventName || 'Dar Food Festival 2026';
      initialMsg = `Habari waandaaji wa ${evName}! Nina swali kuhusu tiketi na maegesho ya magari.`;
    }

    onStartChatWithBusiness(authorId, author, initialMsg, currentStatus.authorPhoto);
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-24 md:pb-10 select-none overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        {/* Top Status Story Bubbles / Carousel */}
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
            {/* My Status Bubble */}
            <div
              onClick={onOpenCreateMenu}
              className="relative w-36 sm:w-44 h-22 sm:h-26 rounded-[26px] overflow-hidden bg-gradient-to-tr from-[#101426] via-[#1a213d] to-[#252f55] border border-white/10 shrink-0 cursor-pointer group active:scale-95 transition-all shadow-md hover:border-cyan-400/50"
            >
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute top-2 left-2 z-10">
                <div className="relative">
                  <SafeImage
                    src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    fallbackText="Me"
                    alt="My Status"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-[2.5px] border-white shadow-md bg-black"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-[#101426]">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
              </div>
              <div className="absolute bottom-1.5 left-2.5 right-2 z-10">
                <p className="text-[11px] font-bold text-white truncate drop-shadow">
                  Hali Yangu
                </p>
                <p className="text-[9px] text-cyan-300/80 truncate">Gusa kuongeza</p>
              </div>
            </div>

            {/* Other Status Story Bubbles */}
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
                  <SafeImage
                    src={item.mediaUrl}
                    fallbackGradient="from-purple-900 via-indigo-900 to-cyan-900"
                    alt={item.authorName}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

                  {/* Top-Left Avatar */}
                  <div className="absolute top-2 left-2 z-10">
                    <SafeImage
                      src={item.authorPhoto}
                      fallbackText={item.authorName}
                      alt={item.authorName}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-[2.5px] border-white shadow-md bg-black"
                    />
                  </div>

                  {/* Badge */}
                  {item.type === 'food' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-sm">
                      🍕 Food
                    </span>
                  )}
                  {item.type === 'poll' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[9px] shadow-sm">
                      📊 Poll
                    </span>
                  )}
                  {item.type === 'product' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] shadow-sm">
                      🛍️ Shop
                    </span>
                  )}
                  {item.type === 'event' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-bold text-[9px] shadow-sm">
                      🎪 Event
                    </span>
                  )}

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

        {/* ============================================================== */}
        {/* MAIN STATUS STORY CARD VIEWER (Matches Exact Specification) */}
        {/* ============================================================== */}
        <div className="p-3 sm:p-4 max-w-xl mx-auto w-full space-y-4">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex flex-col min-h-[460px]">
            {/* Top Author Metadata */}
            <div className="relative z-10 p-4 bg-gradient-to-b from-black/85 via-black/60 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SafeImage
                  src={currentStatus.authorPhoto}
                  fallbackText={currentStatus.authorName}
                  alt={currentStatus.authorName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md bg-black"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1 leading-tight">
                    <span>{currentStatus.authorName}</span>
                    <span className="text-cyan-400 font-bold">✓</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>{currentStatus.createdAt}</span>
                    {currentStatus.location && (
                      <>
                        <span>•</span>
                        <span className="text-amber-300 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {currentStatus.location}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleSave(currentStatus.id)}
                  className={`p-2 rounded-full backdrop-blur-md transition-all ${
                    isSaved ? 'bg-cyan-500/20 text-cyan-300' : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                  title="Save Status"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-300' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Kiungo cha status kimenakiliwa!');
                  }}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Area */}
            <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden bg-black">
              <SafeImage
                src={currentStatus.mediaUrl}
                fallbackGradient="from-cyan-900 to-indigo-950"
                alt={currentStatus.text}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>

            {/* Content Specific to Status Type */}
            <div className="p-4 sm:p-5 space-y-3.5 bg-slate-950">
              {/* ==================== 1. FOOD STORY CONTENT ==================== */}
              {currentStatus.type === 'food' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <span>🍔 {currentStatus.metadata.foodName || 'Chicken Burger'}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {currentStatus.metadata.restaurantName || 'Zebra Restaurant'} • Masaki, Dar es Salaam
                      </p>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs">
                      <span>⭐ {currentStatus.metadata.rating || 4.8}</span>
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider">
                        {currentStatus.metadata.specialOfferLabel || '🔥 TODAY ONLY'}
                      </span>
                      <span className="text-amber-300 font-black text-base font-mono">
                        TSh {(currentStatus.metadata.offerPrice || 12000).toLocaleString()}
                      </span>
                      <span className="text-slate-500 line-through text-xs font-mono">
                        TSh {(currentStatus.metadata.regularPrice || 15000).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400 font-extrabold">
                      {currentStatus.metadata.discount || '20% OFF — Today Only'}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic whitespace-pre-line">
                    {currentStatus.text}
                  </p>

                  {/* Food Rating Breakdown */}
                  {currentStatus.metadata.ratingBreakdown && (
                    <div className="p-3 rounded-2xl bg-[#10162B] border border-white/5 space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
                        ⭐ Food Rating (Mapitio ya Chakula):
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span>⭐⭐⭐⭐⭐ Taste</span>
                          <span className="font-bold text-amber-400 font-mono">5.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>⭐⭐⭐⭐⭐ Presentation</span>
                          <span className="font-bold text-amber-400 font-mono">4.8</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>⭐⭐⭐⭐ Service</span>
                          <span className="font-bold text-amber-400 font-mono">4.7</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>⭐⭐⭐⭐⭐ Value for money</span>
                          <span className="font-bold text-amber-400 font-mono">4.9</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS: [🍽️ Order Now] and [💬 Chat Now] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() =>
                        handleOpenFoodOrder(
                          currentStatus.metadata?.foodName || 'Chicken Burger',
                          currentStatus.metadata?.restaurantName || 'ZEBRA RESTAURANT',
                          currentStatus.metadata?.offerPrice || 12000
                        )
                      }
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
                    >
                      <Utensils className="w-4 h-4 stroke-[2.5]" />
                      <span>🍽️ Order Now</span>
                    </button>

                    <button
                      onClick={handleStartChatWithStatusAuthor}
                      className="py-3 px-4 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>💬 Chat Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 2. POLL STORY CONTENT ==================== */}
              {currentStatus.type === 'poll' && currentStatus.metadata && (
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-400" />
                    <span>{currentStatus.metadata.pollQuestion || 'Leo tukatoke wapi? 😎'}</span>
                  </h3>

                  <div className="space-y-2">
                    {currentStatus.metadata.pollOptions?.map((opt) => {
                      const totalVotes =
                        currentStatus.metadata?.pollOptions?.reduce((sum, o) => sum + o.votes, 0) || 1;
                      const percentage = Math.round((opt.votes / totalVotes) * 100);
                      const isVoted = userVotedOption[currentStatus.id] === opt.id;

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleVotePoll(currentStatus.id, opt.id)}
                          className={`relative w-full p-3 rounded-2xl border text-left overflow-hidden transition-all active:scale-[0.98] ${
                            isVoted
                              ? 'border-blue-400 bg-blue-500/20'
                              : 'border-white/10 bg-[#12172A] hover:border-blue-500/40'
                          }`}
                        >
                          {/* Percentage progress bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-blue-500/20 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-semibold text-white flex items-center gap-2">
                              {isVoted && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                              <span>{opt.text}</span>
                            </span>
                            <span className="font-mono font-bold text-blue-300">
                              {percentage}% ({opt.votes})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      Muda wa kura:{' '}
                      <strong className="text-blue-300">
                        {currentStatus.metadata.pollSettings?.duration || '24 hours'}
                      </strong>
                    </span>
                    <span>
                      {currentStatus.metadata.pollSettings?.anonymous ? '🔒 Anonymous voting' : '👥 Public poll'}
                    </span>
                  </div>
                </div>
              )}

              {/* ==================== 3. PRODUCT STORY CONTENT ==================== */}
              {currentStatus.type === 'product' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <span>🛍️ {currentStatus.metadata.productName || 'Nike Air Max'}</span>
                      </h3>
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        {currentStatus.authorName} ✓
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      ⭐ 4.9
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-300 font-black text-base font-mono">
                        TSh {(currentStatus.metadata.salePrice || 175000).toLocaleString()}
                      </span>
                      <span className="text-slate-500 line-through text-xs font-mono">
                        TSh {(currentStatus.metadata.regularPrice || 200000).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                      {currentStatus.metadata.discountBadge || '12.5% OFF - NEW ARRIVAL'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">{currentStatus.text}</p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsProductPurchaseOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      <span>🛍️ Buy Now</span>
                    </button>

                    <button
                      onClick={handleStartChatWithStatusAuthor}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 4. EVENT STORY CONTENT ==================== */}
              {currentStatus.type === 'event' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>🎪 {currentStatus.metadata.eventName || 'Dar Food Festival 2026'}</span>
                    </h3>
                    <p className="text-xs text-purple-300 mt-0.5">
                      📅 {currentStatus.metadata.eventDate || '12 October 2026'} • {currentStatus.metadata.eventStartTime || '08:00 PM'} - {currentStatus.metadata.eventEndTime || '02:00 AM'}
                    </p>
                  </div>

                  {/* Countdown Box */}
                  <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block">
                      EVENT STARTS IN
                    </span>
                    <div className="text-sm font-black text-white font-mono flex items-center justify-center gap-3">
                      <span>🗓️ 3 Days</span>
                      <span>⏰ 07 Hours</span>
                      <span>⏱️ 24 Minutes</span>
                    </div>
                  </div>

                  {/* Capacity Counter */}
                  <div className="p-3 rounded-2xl bg-[#12172A] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Maximum Capacity</span>
                      <strong className="text-white">{currentStatus.metadata.capacity || 500} People</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tickets Sold</span>
                      <strong className="text-white">{currentStatus.metadata.ticketsSold || 327}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block">Remaining</span>
                      <strong className="text-emerald-300 font-mono">
                        🟢 {(currentStatus.metadata.capacity || 500) - (currentStatus.metadata.ticketsSold || 327)}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{currentStatus.text}</p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsEventTicketOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                    >
                      <Ticket className="w-4 h-4 stroke-[2.5]" />
                      <span>🎟️ Get Tickets</span>
                    </button>

                    <button
                      onClick={handleStartChatWithStatusAuthor}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Interactions Bar: Like, Comment, Share, Save */}
              <div className="flex items-center justify-between text-slate-300 text-xs font-semibold border-t border-white/10 pt-3">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => handleToggleLike(currentStatus.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95"
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform ${
                        isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-300'
                      }`}
                    />
                    <span>{currentStatus.likesCount}</span>
                  </button>

                  <button
                    onClick={() => setShowCommentsFor(showCommentsFor ? null : currentStatus.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{currentStatus.commentsCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Status imeshirikishwa!');
                    }}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{currentStatus.sharesCount}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleToggleSave(currentStatus.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    isSaved ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-300' : ''}`} />
                  <span>{isSaved ? 'Imehifadhiwa' : 'Hifadhi'}</span>
                </button>
              </div>

              {/* Comments drawer */}
              {showCommentsFor === currentStatus.id && (
                <div className="mt-2 p-3 rounded-2xl bg-[#13192B] border border-white/10 space-y-2 animate-in fade-in">
                  <h5 className="text-xs font-bold text-slate-200">
                    Maoni / Comments ({currentStatus.commentsCount})
                  </h5>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Andika maoni yako hapa..."
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
                      className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. FRESH FOOD NEAR YOU (Food Statuses za Karibu) */}
          {/* ============================================================== */}
          <div className="p-4 rounded-3xl bg-[#0C1122] border border-amber-500/20 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Fresh Food Near You (Vyakula vya Karibu)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Vyakula vitamu kutoka migahawa ya Masaki, Kinondoni & Sinza
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {freshFoodsNearYou.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-2xl bg-[#141A30] border border-white/5 hover:border-amber-500/40 flex flex-col justify-between group transition-all"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                    <SafeImage
                      src={f.image}
                      fallbackText={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px]">
                      {f.tag}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-xs text-white truncate">{f.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{f.restaurant}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-amber-300 font-black text-xs font-mono">
                        TSh {f.price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 line-through text-[10px] font-mono">
                        TSh {f.regPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenFoodOrder(f.name, f.restaurant, f.price)}
                    className="mt-2.5 py-2 w-full rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Agiza Sasa</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Food Order Modal (5-step delivery, dine-in table, pickup, checkout, mobile money push & receipt) */}
      <FoodOrderModal
        isOpen={isFoodOrderOpen}
        onClose={() => setIsFoodOrderOpen(false)}
        foodName={selectedFoodItemForOrder.name}
        restaurantName={selectedFoodItemForOrder.restaurant}
        initialPrice={selectedFoodItemForOrder.price}
        onStartChatWithRestaurant={(orderMsg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(
              'zebra_restaurant',
              selectedFoodItemForOrder.restaurant,
              orderMsg,
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
            );
          }
        }}
      />

      {/* Product Purchase Modal (1-click Mobile Money checkout) */}
      <ProductPurchaseModal
        isOpen={isProductPurchaseOpen}
        onClose={() => setIsProductPurchaseOpen(false)}
        productName="Nike Air Max"
        sellerName="Fresh Store Dar"
        regularPrice={200000}
        salePrice={175000}
        onStartChatWithSeller={(msg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(
              'fresh_store_dar',
              'Fresh Store Dar',
              msg,
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80'
            );
          }
        }}
      />

      {/* Event Ticket Modal */}
      <EventTicketModal
        isOpen={isEventTicketOpen}
        onClose={() => setIsEventTicketOpen(false)}
        eventName="Dar Food Festival 2026"
        eventDate="12 October 2026"
        eventTime="08:00 PM"
        location="Mlimani City, Dar es Salaam"
        onStartChatWithOrganizer={(msg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(
              'dar_food_fest',
              'Dar Food Festival 2026',
              msg,
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
            );
          }
        }}
      />
    </div>
  );
};
