import React, { useState } from 'react';
import {
  X,
  Camera,
  Image,
  Video,
  MapPin,
  Sparkles,
  BarChart2,
  Utensils,
  ShoppingBag,
  Calendar,
  Car,
  Clock,
  Check,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Navigation,
  Flame,
  Users,
  MessageCircle,
  Tag,
  Search,
  Bookmark,
  Share2,
  Heart,
  Ticket,
} from 'lucide-react';
import { StatusItem, StatusType, UserProfile } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { SafeImage } from '../../components/SafeImage';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusType: StatusType | 'ai' | null;
  currentUser: UserProfile;
  onStatusCreated: (status: StatusItem) => void;
}

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
  statusType = 'food',
  currentUser,
  onStatusCreated,
}) => {
  // Current active mode (food, poll, product, event, ride, etc.)
  const [activeType, setActiveType] = useState<StatusType>(
    statusType === 'ai' ? 'ai_generated' : (statusType || 'food')
  );

  // Common Fields
  const [caption, setCaption] = useState(
    '🔥 Our famous Chicken Burger is back!\nFresh • Juicy • Delicious 🤤\n#ZebraRestaurant #ChickenBurger #DarFood'
  );
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80'
  );
  const [mediaCount, setMediaCount] = useState(1);
  const [locationName, setLocationName] = useState('Masaki, Dar es Salaam');
  const [isLocating, setIsLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Scheduling & Audience
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('06 Oct 2026');
  const [scheduleTime, setScheduleTime] = useState('18:30');
  const [durationOption, setDurationOption] = useState<'24h' | 'day' | 'week' | 'month' | 'year' | 'custom'>('24h');
  const [audience, setAudience] = useState<'everyone' | 'followers' | 'nearby' | 'all'>('everyone');

  // ==================== FOOD STATUS SPECIFIC ====================
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState('Chicken Burger');
  const [customFoodCategory, setCustomFoodCategory] = useState('');
  const [foodRegularPrice, setFoodRegularPrice] = useState(15000);
  const [foodOfferPrice, setFoodOfferPrice] = useState(12000);
  const [isSpecialOffer, setIsSpecialOffer] = useState(true);
  const [offerValidPeriod, setOfferValidPeriod] = useState('Today');
  const [offerValidUntil, setOfferValidUntil] = useState('10:00 PM');
  const [foodActionButtons, setFoodActionButtons] = useState<{ order: boolean; chat: boolean }>({
    order: true,
    chat: true,
  });

  const popularFoods = [
    { name: 'Chicken Burger', reg: 15000, offer: 12000, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80', caption: '🔥 Our famous Chicken Burger is back!\nFresh • Juicy • Delicious 🤤\n#ZebraRestaurant #ChickenBurger #DarFood' },
    { name: 'Beef Burger', reg: 18000, offer: 14000, img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80', caption: '🍔 Double Beef Smash Burger na cheddar cheese iliyoyeyuka! Karibu Zebra Masaki.\n#ZebraRestaurant #BeefBurger' },
    { name: 'Grilled Chicken', reg: 22000, offer: 18000, img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1200&auto=format&fit=crop&q=80', caption: '🍗 Peri-peri Flame Grilled Chicken nusu kuku na chips kukaanga. Agiza sasa!\n#GrilledChicken #DarFood' },
    { name: 'French Fries', reg: 6000, offer: 5000, img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=1200&auto=format&fit=crop&q=80', caption: '🍟 Crispy Masala French Fries na sosi ya mayonesi! #FrenchFries #Snacks' },
    { name: 'Pizza', reg: 25000, offer: 20000, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80', caption: '🍕 Wood-fired BBQ Beef & Cheese Pizza kubwa! Ofa ya leo pekee.\n#PizzaDar #DarFood' },
  ];

  // Auto-fill presets when food is chosen
  const handleSelectFoodItem = (foodName: string) => {
    setSelectedFoodCategory(foodName);
    const found = popularFoods.find((f) => f.name.toLowerCase() === foodName.toLowerCase());
    if (found) {
      setFoodRegularPrice(found.reg);
      setFoodOfferPrice(found.offer);
      setCaption(found.caption);
      setMediaUrl(found.img);
    }
  };

  // ==================== POLL STATUS SPECIFIC ====================
  const [pollQuestion, setPollQuestion] = useState('Leo tukatoke wapi? 😎');
  const [pollOptions, setPollOptions] = useState<string[]>([
    'Coco Beach 🌊',
    'Mlimani City 🛍️',
    'Masaki 🍹',
    'Sinza 🍗',
  ]);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);
  const [pollDuration, setPollDuration] = useState('24 hours');

  // ==================== PRODUCT STATUS SPECIFIC ====================
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productName, setProductName] = useState('Nike Air Max');
  const [productCategory, setProductCategory] = useState('');
  const [productRegularPrice, setProductRegularPrice] = useState(200000);
  const [productSalePrice, setProductSalePrice] = useState(175000);
  const [productStock, setProductStock] = useState(24);
  const [productSku, setProductSku] = useState('SKU-NK-082');
  const [productBadge, setProductBadge] = useState('New Arrival');
  const [selectedSize, setSelectedSize] = useState('M');
  const [customSize, setCustomSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [customColor, setCustomColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [customStorage, setCustomStorage] = useState('');
  const [productActionButtons, setProductActionButtons] = useState<{ buy: boolean; chat: boolean }>({
    buy: true,
    chat: true,
  });

  const popularProducts = [
    { name: 'Nike Air Max', reg: 200000, sale: 175000, stock: 24, sku: 'SKU-NK-082', badge: 'New Arrival', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80', desc: 'Nike Air Max - Original Sneakers. Limited Stock! #FreshStore #SneakersDar' },
    { name: 'Samsung Galaxy', reg: 1200000, sale: 980000, stock: 8, sku: 'SKU-SM-920', badge: 'Flash Sale', img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&auto=format&fit=crop&q=80', desc: 'Samsung Galaxy 256GB - 1 Year Warranty & Free Delivery in Dar es Salaam! #Samsung #PhonesDar' },
    { name: 'T-Shirt Black', reg: 35000, sale: 28000, stock: 50, sku: 'SKU-TS-012', badge: 'Discount', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80', desc: '100% Cotton Premium Heavyweight Black T-Shirt. Super comfortable! #Streetwear' },
    { name: 'Backpack', reg: 75000, sale: 60000, stock: 15, sku: 'SKU-BP-440', badge: 'Limited Offer', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=80', desc: 'Waterproof Laptop Travel Backpack na USB port. #TravelBag #DarBags' },
  ];

  const handleSelectProductItem = (prodName: string) => {
    setProductName(prodName);
    const found = popularProducts.find((p) => p.name.toLowerCase() === prodName.toLowerCase());
    if (found) {
      setProductRegularPrice(found.reg);
      setProductSalePrice(found.sale);
      setProductStock(found.stock);
      setProductSku(found.sku);
      setProductBadge(found.badge);
      setMediaUrl(found.img);
      setCaption(found.desc);
    }
  };

  // ==================== EVENT STATUS SPECIFIC ====================
  const [eventName, setEventName] = useState('Dar Food Festival 2026');
  const [eventDescription, setEventDescription] = useState(
    'Weekend kubwa ya food, music na entertainment! Njoo ufurahie ladha bora za vyakula jijini Dar es Salaam.'
  );
  const [eventDate, setEventDate] = useState('12 October 2026');
  const [eventStartTime, setEventStartTime] = useState('08:00 PM');
  const [eventEndTime, setEventEndTime] = useState('02:00 AM');
  const [eventRecurring, setEventRecurring] = useState('None');
  const [isPaidEvent, setIsPaidEvent] = useState(true);
  const [eventRegularTicket, setEventRegularTicket] = useState(20000);
  const [eventVipTicket, setEventVipTicket] = useState(50000);
  const [eventVvipTicket, setEventVvipTicket] = useState(100000);
  const [eventMaxCapacity, setEventMaxCapacity] = useState(500);
  const [eventTicketsSold, setEventTicketsSold] = useState(327);
  const [eventLineup, setEventLineup] = useState('🎤 Harmonize, 🎧 DJ Fresh, 🎤 Rayvanny, 🍔 Food Festival, 🎮 Games');

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setLocationName('Masaki Peninsula, Dar es Salaam (GPS Accurate)');
      setIsLocating(false);
    }, 500);
  };

  const calculatedDiscountPercent =
    foodRegularPrice > foodOfferPrice
      ? Math.round(((foodRegularPrice - foodOfferPrice) / foodRegularPrice) * 100)
      : 0;

  const calculatedProductDiscountPercent =
    productRegularPrice > productSalePrice
      ? Math.round(((productRegularPrice - productSalePrice) / productRegularPrice) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newStatus: StatusItem = {
      id: `status_${Date.now()}`,
      authorId: currentUser.id,
      authorName: activeType === 'food' ? 'Zebra Restaurant' : currentUser.displayName,
      authorUsername: activeType === 'food' ? 'zebra_restaurant' : currentUser.username,
      authorPhoto:
        activeType === 'food'
          ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'
          : currentUser.photoURL || freshKkAvatar,
      type: activeType,
      mediaUrl,
      text: caption,
      location: locationName,
      visibility: 'public',
      likesCount: 245,
      commentsCount: 32,
      sharesCount: 14,
      createdAt: 'Just now',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      metadata: {
        // Food metadata
        foodName: selectedFoodCategory,
        restaurantName: 'Zebra Restaurant',
        regularPrice: activeType === 'food' ? foodRegularPrice : activeType === 'product' ? productRegularPrice : undefined,
        offerPrice: foodOfferPrice,
        discount: `${calculatedDiscountPercent}% OFF`,
        specialOfferLabel: isSpecialOffer ? '🔥 TODAY ONLY' : undefined,
        validUntil: offerValidUntil,
        rating: 4.8,
        ratingBreakdown: { taste: 5.0, presentation: 4.8, service: 4.7, value: 4.9 },
        actionButtons: [
          ...(foodActionButtons.order ? (['order_now'] as const) : []),
          ...(foodActionButtons.chat ? (['chat_now'] as const) : []),
        ],

        // Poll metadata
        pollQuestion: activeType === 'poll' ? pollQuestion : undefined,
        pollOptions:
          activeType === 'poll'
            ? pollOptions.map((opt, i) => ({ id: `opt_${i}`, text: opt, votes: i === 0 ? 14 : i === 1 ? 8 : 4 }))
            : undefined,
        pollSettings: {
          allowMultiple: allowMultipleVotes,
          anonymous: anonymousVoting,
          duration: pollDuration,
        },

        // Product metadata
        productName: activeType === 'product' ? productName : undefined,
        salePrice: activeType === 'product' ? productSalePrice : undefined,
        stockRemaining: activeType === 'product' ? productStock : undefined,
        discountBadge: activeType === 'product' ? `${calculatedProductDiscountPercent}% OFF — ${productBadge}` : undefined,
        variants: {
          sizes: [selectedSize, 'S', 'M', 'L', 'XL'],
          colors: [selectedColor, 'Black', 'White', 'Blue'],
          storages: [selectedStorage, '128GB', '256GB', '512GB'],
        },

        // Event metadata
        eventName: activeType === 'event' ? eventName : undefined,
        eventDate: activeType === 'event' ? eventDate : undefined,
        eventStartTime: activeType === 'event' ? eventStartTime : undefined,
        eventEndTime: activeType === 'event' ? eventEndTime : undefined,
        ticketTiers:
          activeType === 'event'
            ? [
                { name: 'REGULAR', price: eventRegularTicket, color: 'bg-blue-600' },
                { name: 'VIP', price: eventVipTicket, color: 'bg-purple-600' },
                { name: 'VVIP', price: eventVvipTicket, color: 'bg-amber-500' },
              ]
            : undefined,
        capacity: eventMaxCapacity,
        ticketsSold: eventTicketsSold,
        lineup: eventLineup.split(',').map((s) => s.trim()),
      },
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'statuses', newStatus.id), newStatus);
      }
      onStatusCreated(newStatus);
      onClose();
    } catch (err) {
      console.warn('Fallback status creation:', err);
      onStatusCreated(newStatus);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-[#090D18] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95">
        {/* Top Header */}
        <div className="p-4 bg-[#0E1528] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              {activeType === 'food' && <Utensils className="w-5 h-5 text-amber-400" />}
              {activeType === 'poll' && <BarChart2 className="w-5 h-5 text-blue-400" />}
              {activeType === 'product' && <ShoppingBag className="w-5 h-5 text-emerald-400" />}
              {activeType === 'event' && <Calendar className="w-5 h-5 text-purple-400" />}
              {!['food', 'poll', 'product', 'event'].includes(activeType) && <Camera className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white capitalize">
                Weka {activeType === 'food' ? '🍕 Food' : activeType === 'poll' ? '📊 Poll' : activeType === 'product' ? '🛍️ Product' : '🎪 Event'} Status
              </h3>
              <p className="text-[11px] text-slate-400">
                Picha, Bei, Ofa, Countdown & Vitufe vya Action
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                showLivePreview
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showLivePreview ? 'Ficha Preview' : '👀 Preview'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2 bg-[#0B1020] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'food', label: '🍕 Food Status', color: 'text-amber-400' },
            { id: 'poll', label: '📊 Create Poll', color: 'text-blue-400' },
            { id: 'product', label: '🛍️ Product Status', color: 'text-emerald-400' },
            { id: 'event', label: '🎪 Event Status', color: 'text-purple-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeType === tab.id
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* SECTION 1: MEDIA UPLOAD BUTTONS */}
          <div className="p-4 rounded-2xl bg-[#12192F] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Add {activeType === 'food' ? 'Food' : activeType === 'poll' ? 'Poll' : activeType === 'product' ? 'Product' : 'Event'} Media</span>
              </span>
              <span className="text-[10px] text-slate-400">
                • Photos: Max 10 • Video: Max 1
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMediaUrl(
                    activeType === 'food'
                      ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80'
                      : activeType === 'product'
                      ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'
                  );
                  setMediaCount((prev) => Math.min(10, prev + 1));
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>📷 Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaUrl(
                    activeType === 'food'
                      ? 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80'
                      : activeType === 'product'
                      ? 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80'
                  );
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Image className="w-5 h-5 text-cyan-400" />
                <span>🖼️ Choose from Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaUrl('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80');
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Video className="w-5 h-5 text-purple-400" />
                <span>🎥 Add Video</span>
              </button>
            </div>

            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Media URL..."
              className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
            />
          </div>

          {/* ============================================================== */}
          {/* FOOD FORM */}
          {/* ============================================================== */}
          {activeType === 'food' && (
            <div className="space-y-4">
              {/* Select Food: Search & Popular chips */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Select Food
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold">🔥 Popular</span>
                </div>

                {/* Search Food */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={foodSearchQuery}
                    onChange={(e) => setFoodSearchQuery(e.target.value)}
                    placeholder="🔍 Search food..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                {/* Popular Food Items */}
                <div className="flex items-center gap-2 flex-wrap">
                  {popularFoods
                    .filter((f) => f.name.toLowerCase().includes(foodSearchQuery.toLowerCase()))
                    .map((food) => {
                      const isSelected = selectedFoodCategory === food.name;
                      return (
                        <button
                          type="button"
                          key={food.name}
                          onClick={() => handleSelectFoodItem(food.name)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/30'
                              : 'bg-white/5 text-slate-300 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span>{isSelected ? '☑' : '☐'}</span>
                          <span>{food.name}</span>
                        </button>
                      );
                    })}
                </div>

                {/* Write custom category if not listed */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Andika category kama hakuna unayotaka:
                  </span>
                  <input
                    type="text"
                    value={customFoodCategory}
                    onChange={(e) => {
                      setCustomFoodCategory(e.target.value);
                      setSelectedFoodCategory(e.target.value);
                    }}
                    placeholder="Mfano: Shawarma, Biryani, Sambusa..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Add Promotion: Special Offer, Regular Price, Offer Price */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Add Promotion</span>
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSpecialOffer}
                      onChange={(e) => setIsSpecialOffer(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>☑ Special Offer</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                      Regular Price
                    </span>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">TSh</span>
                      <input
                        type="number"
                        value={foodRegularPrice}
                        onChange={(e) => setFoodRegularPrice(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#182038] border border-white/10 rounded-xl pl-12 pr-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-amber-300 block font-semibold mb-1">
                      Offer Price (Special Price)
                    </span>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-amber-400 font-mono">TSh</span>
                      <input
                        type="number"
                        value={foodOfferPrice}
                        onChange={(e) => setFoodOfferPrice(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#182038] border border-amber-500/40 rounded-xl pl-12 pr-3 py-2 text-xs text-amber-300 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Valid and Until */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Valid:</span>
                    <input
                      type="text"
                      value={offerValidPeriod}
                      onChange={(e) => setOfferValidPeriod(e.target.value)}
                      placeholder="Today"
                      className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Until:</span>
                    <input
                      type="text"
                      value={offerValidUntil}
                      onChange={(e) => setOfferValidUntil(e.target.value)}
                      placeholder="10:00 PM"
                      className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Status displays badge */}
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between">
                  <span>Status ionyeshe: 🔥 {calculatedDiscountPercent}% OFF — Today Only</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">
                    TODAY ONLY
                  </span>
                </div>
              </div>

              {/* Action Buttons: Order Now & Chat Now */}
              <div className="p-3.5 rounded-2xl bg-[#12192F] border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Chagua Vitufe vya Status:</span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={foodActionButtons.order}
                      onChange={(e) => setFoodActionButtons({ ...foodActionButtons, order: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>[🍽️ Order Now]</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={foodActionButtons.chat}
                      onChange={(e) => setFoodActionButtons({ ...foodActionButtons, chat: e.target.checked })}
                      className="accent-cyan-500"
                    />
                    <span>[💬 Chat Now]</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* POLL FORM */}
          {/* ============================================================== */}
          {activeType === 'poll' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-blue-500/20 space-y-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                  Question (Swali la Kura)
                </span>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Leo tukatoke wapi? 😎 au andika anachotaka"
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />

                <span className="text-xs font-bold text-slate-300 block pt-1">
                  Options (Chaguzi):
                </span>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...pollOptions];
                          copy[idx] = e.target.value;
                          setPollOptions(copy);
                        }}
                        className="flex-1 bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/15 text-blue-300 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    <span>[ + Add Option ]</span>
                  </button>
                </div>

                {/* Multiple answers & Anonymous */}
                <div className="pt-2 border-t border-white/5 flex items-center gap-4 text-xs text-slate-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultipleVotes}
                      onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                      className="accent-blue-500"
                    />
                    <span>☐ Allow multiple answers</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={anonymousVoting}
                      onChange={(e) => setAnonymousVoting(e.target.checked)}
                      className="accent-blue-500"
                    />
                    <span>☐ Anonymous voting</span>
                  </label>
                </div>

                {/* Poll Duration */}
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block">Poll duration:</span>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {['1 hour', '6 hours', '24 hours', '3 days', '7 days'].map((dur) => (
                      <button
                        type="button"
                        key={dur}
                        onClick={() => setPollDuration(dur)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          pollDuration === dur
                            ? 'bg-blue-500 text-slate-950 font-bold'
                            : 'bg-white/5 text-slate-300 border border-white/5'
                        }`}
                      >
                        {pollDuration === dur ? '● ' : '○ '}
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PRODUCT FORM */}
          {/* ============================================================== */}
          {activeType === 'product' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-emerald-500/20 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Product Catalog
                </span>

                {/* Search Product */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="🔍 Search product..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                {/* Popular Product Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {popularProducts
                    .filter((p) => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                    .map((prod) => {
                      const isSelected = productName === prod.name;
                      return (
                        <button
                          type="button"
                          key={prod.name}
                          onClick={() => handleSelectProductItem(prod.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                              : 'bg-white/5 text-slate-300 border border-white/10'
                          }`}
                        >
                          {isSelected ? '☑ ' : '☐ '}
                          {prod.name}
                        </button>
                      );
                    })}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Andika category kama hakuna unayotaka:
                  </span>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="Category (e.g. Viatu, Nguo, Simu, Vifaa vya Nyumbani)..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Price & Offer */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                      Regular Price (TSh)
                    </span>
                    <input
                      type="number"
                      value={productRegularPrice}
                      onChange={(e) => setProductRegularPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-semibold mb-1">
                      Sale Price (TSh)
                    </span>
                    <input
                      type="number"
                      value={productSalePrice}
                      onChange={(e) => setProductSalePrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span>🔥 {calculatedProductDiscountPercent}% OFF</span>
                  <span className="text-[11px] font-mono">Stock: {productStock}</span>
                </div>

                {/* Offer Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-300 block font-semibold">Chagua Badge ya Ofa:</span>
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                    {['Discount', 'Flash Sale', 'Buy 1 Get 1', 'Limited Offer', 'New Arrival'].map((badge) => (
                      <button
                        type="button"
                        key={badge}
                        onClick={() => setProductBadge(badge)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          productBadge === badge
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-white/5 text-slate-300 border border-white/10'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🎨 VARIANTS (Size, Color, Storage) */}
                <div className="p-3 rounded-xl bg-[#141B30] border border-white/5 space-y-2.5 text-xs">
                  <span className="font-bold text-slate-200 block">🎨 Variants:</span>

                  {/* Size */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Size (Kwa bidhaa kama nguo/viatu):</span>
                    <div className="flex items-center gap-2">
                      {['S', 'M', 'L', 'XL'].map((sz) => (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`w-7 h-7 rounded-lg font-bold ${
                            selectedSize === sz ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={customSize}
                        onChange={(e) => {
                          setCustomSize(e.target.value);
                          setSelectedSize(e.target.value);
                        }}
                        placeholder="au andika..."
                        className="flex-1 bg-[#182038] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Color (Rangi):</span>
                    <div className="flex items-center gap-2">
                      {['Black', 'White', 'Blue'].map((clr) => (
                        <button
                          type="button"
                          key={clr}
                          onClick={() => setSelectedColor(clr)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            selectedColor === clr ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          {clr}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedColor(e.target.value);
                        }}
                        placeholder="au weka rangi nyingine..."
                        className="flex-1 bg-[#182038] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Storage (Kwa simu/vifaa):</span>
                    <div className="flex items-center gap-2">
                      {['128GB', '256GB', '512GB'].map((st) => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setSelectedStorage(st)}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                            selectedStorage === st ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={customStorage}
                        onChange={(e) => {
                          setCustomStorage(e.target.value);
                          setSelectedStorage(e.target.value);
                        }}
                        placeholder="au andika..."
                        className="flex-1 bg-[#182038] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Action Buttons */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-white">Vitufe vya Action:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-emerald-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={productActionButtons.buy}
                        onChange={(e) => setProductActionButtons({ ...productActionButtons, buy: e.target.checked })}
                        className="accent-emerald-500"
                      />
                      <span>[🛍️ Buy Now]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={productActionButtons.chat}
                        onChange={(e) => setProductActionButtons({ ...productActionButtons, chat: e.target.checked })}
                        className="accent-cyan-500"
                      />
                      <span>[💬 Chat Now]</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* EVENT FORM */}
          {/* ============================================================== */}
          {activeType === 'event' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-purple-500/20 space-y-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Event Details & Tickets
                </span>

                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Event Name [ Dar Food Festival 2026 ]"
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />

                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Tell people about your event..."
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />

                {/* Date & Time */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">📅 Event Date</span>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">🕐 Start Time</span>
                    <input
                      type="text"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">🕐 End Time</span>
                    <input
                      type="text"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Recurring Event */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Recurring Event:</span>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    {['None', 'Every Friday', 'Every Saturday', 'Weekly', 'Monthly'].map((rec) => (
                      <button
                        type="button"
                        key={rec}
                        onClick={() => setEventRecurring(rec)}
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          eventRecurring === rec ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-300'
                        }`}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free vs Paid Event */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">🎟️ Ticket Type</span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsPaidEvent(false)}
                        className={`px-2.5 py-1 rounded-lg font-bold ${!isPaidEvent ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                      >
                        FREE EVENT
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaidEvent(true)}
                        className={`px-2.5 py-1 rounded-lg font-bold ${isPaidEvent ? 'bg-purple-500 text-white' : 'text-slate-400'}`}
                      >
                        YAKULIPIA
                      </button>
                    </div>
                  </div>

                  {isPaidEvent && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-blue-400 block font-bold mb-1">Regular (TSh)</span>
                        <input
                          type="number"
                          value={eventRegularTicket}
                          onChange={(e) => setEventRegularTicket(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-400 block font-bold mb-1">VIP (TSh)</span>
                        <input
                          type="number"
                          value={eventVipTicket}
                          onChange={(e) => setEventVipTicket(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-400 block font-bold mb-1">VVIP (TSh)</span>
                        <input
                          type="number"
                          value={eventVvipTicket}
                          onChange={(e) => setEventVvipTicket(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Guest / Capacity */}
                <div className="p-3 rounded-xl bg-[#141B30] border border-white/5 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-200 block">Guest / Capacity:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Max Capacity</span>
                      <input
                        type="number"
                        value={eventMaxCapacity}
                        onChange={(e) => setEventMaxCapacity(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tickets Sold</span>
                      <input
                        type="number"
                        value={eventTicketsSold}
                        onChange={(e) => setEventTicketsSold(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-bold">Remaining</span>
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs">
                        🟢 {Math.max(0, eventMaxCapacity - eventTicketsSold)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details: Artists, DJs, Speakers */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">
                    Event Details (Artists, DJs, Food vendors, Activities):
                  </span>
                  <input
                    type="text"
                    value={eventLineup}
                    onChange={(e) => setEventLineup(e.target.value)}
                    placeholder="🎤 Harmonize, 🎧 DJ Fresh, 🍔 Food Festival..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Countdown banner */}
                <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-between">
                  <span>EVENT STARTS IN:</span>
                  <span className="font-mono">🗓️ 3 Days • ⏰ 07 Hours • ⏱️ 24 Minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: CAPTION & LOCATION */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1">
                Caption & Maelezo (Emojis, Hashtags na Mentions):
              </span>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Andika ujumbe, emojis, hashtags na mentions mfano #ZebraRestaurant #ChickenBurger #DarFood..."
                className="w-full bg-[#12192F] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Eneo la biashara au select kwenye maps..."
                  className="w-full bg-[#12192F] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLocating ? 'GPS...' : 'Current Location'}</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: SCHEDULE & AUDIENCE */}
          {/* ============================================================== */}
          <div className="p-3.5 rounded-2xl bg-[#12192F] border border-white/5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Publish Status:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPublishMode('now')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    publishMode === 'now' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  ● Post Now
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('schedule')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    publishMode === 'schedule' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  ○ Schedule
                </button>
              </div>
            </div>

            {publishMode === 'schedule' && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Date:</span>
                  <input
                    type="text"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Time:</span>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="font-bold text-white">Muda wa kukaa (Duration):</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: '24h', label: '24h' },
                  { id: 'day', label: 'Siku Nzima' },
                  { id: 'week', label: 'Wiki' },
                  { id: 'month', label: 'Mwezi' },
                  { id: 'year', label: 'Mwaka' },
                ].map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setDurationOption(dur.id as any)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      durationOption === dur.id ? 'bg-white/20 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="font-bold text-white">👀 Audience (Who can see this?):</span>
              <div className="flex items-center gap-2">
                {[
                  { id: 'everyone', label: 'Everyone' },
                  { id: 'followers', label: 'Followers' },
                  { id: 'nearby', label: 'Nearby Customers' },
                  { id: 'all', label: 'Kwazote' },
                ].map((aud) => (
                  <button
                    type="button"
                    key={aud.id}
                    onClick={() => setAudience(aud.id as any)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      audience === aud.id ? 'text-cyan-300 font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {audience === aud.id ? '● ' : '○ '}
                    {aud.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 5: 👀 PREVIEW KABLA YA POST (Matches Exact User ASCII Box) */}
          {/* ============================================================== */}
          {showLivePreview && (
            <div className="p-4 rounded-3xl bg-black/60 border-2 border-cyan-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                <span>👀 PREVIEW Kabla ya Post</span>
                <span className="text-[10px] text-slate-400">Mwonekano kamili</span>
              </div>

              {/* Box container representing user ASCII specification */}
              <div className="max-w-md mx-auto rounded-3xl overflow-hidden bg-[#0A0E1A] border-2 border-white/15 p-4 shadow-2xl space-y-3">
                {/* Header: Author + Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-400">
                      {activeType === 'food' ? 'ZR' : 'ZK'}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-white flex items-center gap-1">
                        <span>{activeType === 'food' ? 'ZEBRA RESTAURANT' : currentUser.displayName}</span>
                        <span className="text-cyan-400 text-xs">✓</span>
                      </h5>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>10m ago</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Media Image */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden relative bg-black/40">
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>

                {/* Food Details */}
                {activeType === 'food' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                        <span>🍔 {selectedFoodCategory}</span>
                      </h4>
                      <span className="text-amber-400 text-xs font-bold">⭐ 4.8</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black">
                        🔥 TODAY ONLY
                      </span>
                      <span className="text-amber-300 font-black font-mono">
                        TSh {foodOfferPrice.toLocaleString()}
                      </span>
                      <span className="line-through text-slate-500 font-mono text-[11px]">
                        TSh {foodRegularPrice.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 italic whitespace-pre-line leading-relaxed">
                      “{caption}”
                    </p>

                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>📍 {locationName}</span>
                    </p>

                    <div className="flex items-center justify-between text-slate-400 text-xs pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1">❤️ 245</span>
                      <span className="flex items-center gap-1">💬 32</span>
                      <span className="flex items-center gap-1">📤 14</span>
                      <span className="flex items-center gap-1">🔖</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {foodActionButtons.order && (
                        <div className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs text-center">
                          🍽️ Order Now
                        </div>
                      )}
                      {foodActionButtons.chat && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Now
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Poll Details */}
                {activeType === 'poll' && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-white">📊 {pollQuestion}</h4>
                    <div className="space-y-1.5">
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-semibold">
                          {opt}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-blue-300 block">Duration: {pollDuration}</span>
                  </div>
                )}

                {/* Product Details */}
                {activeType === 'product' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-white">🛍️ {productName}</h4>
                      <span className="text-emerald-400 text-xs font-bold">⭐ 4.9</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-300 font-bold font-mono">
                        TSh {productSalePrice.toLocaleString()}
                      </span>
                      <span className="line-through text-slate-500 font-mono text-[11px]">
                        TSh {productRegularPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        🔥 {calculatedProductDiscountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{caption}</p>
                    <div className="pt-1 flex items-center gap-2">
                      {productActionButtons.buy && (
                        <div className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs text-center">
                          Buy Now
                        </div>
                      )}
                      {productActionButtons.chat && (
                        <div className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Now
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Event Details */}
                {activeType === 'event' && (
                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-white">🎪 {eventName}</h4>
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold font-mono text-center">
                      EVENT STARTS IN: 🗓️ 3 Days • ⏰ 07 Hours • ⏱️ 24 Minutes
                    </div>
                    <p className="text-xs text-slate-300">{eventDescription}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Regular: TSh {eventRegularTicket.toLocaleString()}</span>
                      <span className="text-purple-300">VIP: TSh {eventVipTicket.toLocaleString()}</span>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <div className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs text-center">
                        🎟️ Get Tickets
                      </div>
                      <div className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                        💬 Chat Now
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
          >
            <span>{submitting ? 'Inachapisha...' : '🚀 POST STATUS'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
