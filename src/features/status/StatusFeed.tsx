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
  Briefcase,
  Check,
  Gift,
  HelpCircle,
  Home,
  Radio,
  Megaphone,
} from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { FoodOrderModal } from './components/FoodOrderModal';
import { EventTicketModal } from './components/EventTicketModal';
import { ProductPurchaseModal } from './components/ProductPurchaseModal';
import { JobApplicationModal } from './components/JobApplicationModal';
import { GiveawayModal } from './components/GiveawayModal';
import { QuizAnswerModal } from './components/QuizAnswerModal';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { LiveSpaceModal } from './components/LiveSpaceModal';
import { AdCampaignModal } from './components/AdCampaignModal';

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

    // 5. JOB STORY (Zebra Restaurant - Waiter / Waitress)
    {
      id: 'status_job_zebra',
      authorId: 'zebra_restaurant',
      authorName: 'ZEBRA RESTAURANT',
      authorUsername: 'zebra_restaurant',
      authorPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
      type: 'job',
      mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      text: 'We are looking for an experienced waiter/waitress to join our team at Zebra Restaurant, Masaki!\n\n#ZebraRestaurant #Hiring #WaiterJobs #DarJobs',
      location: 'Masaki, Dar es Salaam',
      visibility: 'public',
      likesCount: 168,
      commentsCount: 24,
      sharesCount: 38,
      createdAt: '15m ago',
      expiresAt: new Date(Date.now() + 13 * 24 * 3600 * 1000).toISOString(),
      metadata: {
        companyName: 'Zebra Restaurant',
        jobTitle: 'Waiter / Waitress',
        jobDescription: 'We are looking for an experienced waiter/waitress to join our team...',
        salaryMin: 400000,
        salaryMax: 600000,
        showSalary: true,
        isSalaryNegotiable: false,
        employmentType: 'Full Time',
        requirements: [
          'Certificate/Diploma',
          '1+ year experience',
          'Good communication',
          'Customer service skills',
        ],
        deadlineDate: '20 October 2026',
        daysRemaining: 13,
        isClosed: false,
        actionButtons: ['apply_now', 'chat_now'],
      },
    },

    // 6. GIVEAWAY STORY (Fresh KK - iPhone 15 Pro Max)
    {
      id: 'status_giveaway_iphone',
      authorId: 'fresh_kk',
      authorName: 'Fresh kk',
      authorUsername: 'fresh_kk',
      authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      type: 'giveaway',
      mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
      text: '🎁 MEGA GIVEAWAY! Shinda iPhone 15 Pro Max mpya kabisa!\n\nFuata vigezo ujiunge na bahati nasibu sasa kabla ya muda kwisha! #GiveawayDar #iPhone15Pro #FreshKK',
      location: 'Dar es Salaam, Tanzania',
      visibility: 'public',
      likesCount: 542,
      commentsCount: 189,
      sharesCount: 120,
      createdAt: '25m ago',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      metadata: {
        giveawayTitle: 'WIN IPHONE 15 PRO MAX! 🎁',
        giveawayPrizes: 'iPhone 15 Pro Max (256GB Titanium)',
        winnersCount: 3,
        giveawayDeadline: '25 October 2026',
        entrySteps: [
          'Follow @fresh_kk & Zebra Restaurant',
          'Like & Repost status hii',
          'Tag marafiki 3 kwenye comments',
        ],
        participantsCount: 428,
        actionButtons: ['join_giveaway', 'chat_now'],
      },
    },

    // 7. QUIZ STORY (Dar Trivia - General Knowledge)
    {
      id: 'status_quiz_tz',
      authorId: 'dar_trivia',
      authorName: 'Dar Trivia & Quiz',
      authorUsername: 'dar_trivia',
      authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      type: 'quiz',
      mediaUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&auto=format&fit=crop&q=80',
      text: '🧠 QUIZ YA LEO: Pima uelewa wako kuhusu historia ya Tanzania ujishindie pointi na zawadi za papo hapo!\n\n#TriviaTZ #ElimuNaBurudani',
      location: 'Tanzania',
      visibility: 'public',
      likesCount: 310,
      commentsCount: 88,
      sharesCount: 45,
      createdAt: '40m ago',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      metadata: {
        quizCategory: 'Historia & Taifa',
        quizQuestion: 'Tanzania ilipata Uhuru mwaka gani?',
        quizOptions: ['1961', '1962', '1963', '1964'],
        quizCorrectIndex: 0,
        quizTimeSeconds: 30,
        quizPoints: 50,
        actionButtons: ['submit_quiz', 'chat_now'],
      },
    },

    // 8. PROPERTY STORY (Prime Estates - Luxury Villa Masaki)
    {
      id: 'status_property_masaki',
      authorId: 'prime_estates',
      authorName: 'Prime Estates Dar',
      authorUsername: 'prime_estates',
      authorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
      type: 'property',
      mediaUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      text: '🏡 INAPANGISHWA: Luxury 3-Bedroom Villa Masaki! Swimming pool, full AC, ulinzi masaa 24. Wahi kutembelea leo!\n\n#DarRealEstate #MasakiVillas',
      location: 'Masaki Peninsula, Dar es Salaam',
      visibility: 'public',
      likesCount: 220,
      commentsCount: 35,
      sharesCount: 28,
      createdAt: '1h ago',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      metadata: {
        propertyType: 'For Rent',
        propertyTitle: 'Luxury 3-Bedroom Villa Masaki',
        propertyLocation: 'Masaki Peninsula, Dar es Salaam',
        propertyPrice: 1800000,
        propertyCurrency: 'TSh',
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 2,
        areaSqMeters: 180,
        actionButtons: ['property_details', 'chat_now'],
      },
    },

    // 9. LIVE SPACE STORY (Dar Tech & Creators)
    {
      id: 'status_live_tech',
      authorId: 'dar_tech',
      authorName: 'Dar Tech & Creators',
      authorUsername: 'dar_tech',
      authorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      type: 'live',
      mediaUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
      text: '🎙️ LIVE SPACE INAENDELEA: Fursa za Kidijitali, AI na Biashara Mtandaoni 2026! Jiunge sasa usikilize na kuchangia mawazo.',
      location: 'Online Audio Space',
      visibility: 'public',
      likesCount: 480,
      commentsCount: 156,
      sharesCount: 92,
      createdAt: 'Sasa Hivi',
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      metadata: {
        spaceTitle: 'Dar Tech & Creators Talk 2026',
        spaceSubtitle: 'Fursa za kidijitali, biashara za mtandaoni na ubunifu',
        spaceTopic: 'Technology & Startups',
        spaceDate: 'Leo (Today)',
        spaceTime: 'LIVE NOW 🔴',
        listenersCount: 1240,
        isLiveNow: true,
        hostName: 'Fresh kk',
        actionButtons: ['join_live_space'],
      },
    },

    // 10. AD CAMPAIGN STORY (Vodacom 5G)
    {
      id: 'status_ad_vodacom',
      authorId: 'vodacom_tz',
      authorName: 'Vodacom Tanzania',
      authorUsername: 'vodacom_tz',
      authorPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
      type: 'advertisement',
      mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
      text: '📢 TANGAZO RASMI: Vodacom 5G Internet — Kasi Bila Kikomo! Pata GB 50 kwa wiki nzima kwa TSh 10,000 tu. Bonyeza link kujiunga sasa!\n\n#Vodacom5G #KasiBilaKikomo',
      location: 'Tanzania Nzima',
      visibility: 'public',
      likesCount: 1450,
      commentsCount: 230,
      sharesCount: 310,
      createdAt: 'Sponsored',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      metadata: {
        adHeadline: 'Vodacom 5G Internet — Kasi Bila Kikomo! 🚀',
        adSubtitle: 'Pata GB 50 za kasi ya juu kwa wiki nzima kwa TSh 10,000 tu!',
        adBulletPoints: [
          'Kasi ya 5G popote ulipo',
          'Bila kukata wala kuchelewa',
          'Ofa ya wiki nzima',
        ],
        actionButtons: ['run_ad', 'chat_now'],
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

  // Quiz live answer state
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, { answeredIdx: number; isCorrect: boolean }>>({});

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
  const [isJobApplicationOpen, setIsJobApplicationOpen] = useState(false);
  const [isGiveawayOpen, setIsGiveawayOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isPropertyOpen, setIsPropertyOpen] = useState(false);
  const [isLiveSpaceOpen, setIsLiveSpaceOpen] = useState(false);
  const [isAdCampaignOpen, setIsAdCampaignOpen] = useState(false);

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

  const handleStartChatWithStatusAuthor = (customMsg?: string | React.MouseEvent) => {
    if (!onStartChatWithBusiness) return;
    const author = currentStatus.metadata?.companyName || currentStatus.authorName;
    const authorId = currentStatus.authorId;
    const customText = typeof customMsg === 'string' ? customMsg : undefined;
    let initialMsg = customText || `Habari ${author}!`;

    if (!customText) {
      if (currentStatus.type === 'food') {
        const foodName = currentStatus.metadata?.foodName || 'Chicken Burger';
        const offer = currentStatus.metadata?.offerPrice || 12000;
        initialMsg = `Habari ${author}! Ninaulizia kuhusu: 🍔 ${foodName} (TSh ${offer.toLocaleString()}) Ofa ya Masaki Dar es Salaam. Je, mnapokea oda sasa hivi?`;
      } else if (currentStatus.type === 'job') {
        const jobTitle = currentStatus.metadata?.jobTitle || 'kazi';
        initialMsg = `Habari ${author}! Nimeona tangazo lenu la nafasi ya kazi ya "${jobTitle}". Ningependa kupata maelezo zaidi kuhusu nafasi hii.`;
      } else if (currentStatus.type === 'product') {
        const prodName = currentStatus.metadata?.productName || 'Nike Air Max';
        const price = currentStatus.metadata?.salePrice || 175000;
        initialMsg = `Habari ${author}! Ninaulizia kuhusu bidhaa ya: 🛍️ ${prodName} (TSh ${price.toLocaleString()}). Je, bado ipo stock?`;
      } else if (currentStatus.type === 'event') {
        const evName = currentStatus.metadata?.eventName || 'Dar Food Festival 2026';
        initialMsg = `Habari waandaaji wa ${evName}! Nina swali kuhusu tiketi na maegesho ya magari.`;
      }
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
                  {item.type === 'job' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-sm">
                      💼 Job
                    </span>
                  )}
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
                  {item.type === 'giveaway' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-sm">
                      🎁 Giveaway
                    </span>
                  )}
                  {item.type === 'quiz' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[9px] shadow-sm">
                      ❓ Quiz
                    </span>
                  )}
                  {item.type === 'property' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] shadow-sm">
                      🏠 Property
                    </span>
                  )}
                  {item.type === 'live' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] shadow-sm animate-pulse">
                      🔴 Live
                    </span>
                  )}
                  {item.type === 'advertisement' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px] shadow-sm">
                      📢 Ad
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

              {/* ==================== 5. JOB STORY CONTENT ==================== */}
              {currentStatus.type === 'job' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <Briefcase className="w-5 h-5 text-amber-400" />
                        <span>{currentStatus.metadata.jobTitle || 'Waiter / Waitress'}</span>
                      </h3>
                      <p className="text-xs text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                        <span>{currentStatus.metadata.companyName || currentStatus.authorName}</span>
                        <span className="text-cyan-400">✓</span>
                        <span>•</span>
                        <span className="text-slate-400 font-normal">{currentStatus.location || 'Masaki, Dar es Salaam'}</span>
                      </p>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                      ⏱️ {currentStatus.metadata.employmentType || 'Full Time'}
                    </span>
                  </div>

                  {/* Salary & Deadline Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold text-xs">💰 Mshahara:</span>
                      <span className="text-white font-mono font-black text-sm">
                        {currentStatus.metadata.isSalaryNegotiable
                          ? 'Negotiable'
                          : currentStatus.metadata.salaryMin
                          ? `TSh ${currentStatus.metadata.salaryMin.toLocaleString()} – ${(currentStatus.metadata.salaryMax || 600000).toLocaleString()}`
                          : 'TSh 400,000 – 600,000'}
                      </span>
                    </div>

                    {/* Deadline status: ⏳ 13 days remaining OR 🔴 Applications Closed */}
                    {(currentStatus.metadata.daysRemaining ?? 13) > 0 && !currentStatus.metadata.isClosed ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black shadow-sm flex items-center gap-1">
                        <span>⏳ {currentStatus.metadata.daysRemaining ?? 13} days remaining</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black shadow-sm flex items-center gap-1">
                        <span>🔴 Applications Closed</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="p-3 rounded-2xl bg-[#12182C] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Maelezo ya Kazi
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      “{currentStatus.metadata.jobDescription || currentStatus.text || 'We are looking for an experienced waiter/waitress to join our team...'}”
                    </p>
                  </div>

                  {/* Requirements */}
                  {currentStatus.metadata.requirements && currentStatus.metadata.requirements.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#12182C] border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Requirements (Vigezo & Masharti):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {currentStatus.metadata.requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-200">
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] shrink-0" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: [📄 Apply Now] and [💬 Chat Now] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsJobApplicationOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                    >
                      <Briefcase className="w-4 h-4 stroke-[2.5]" />
                      <span>📄 Apply Now</span>
                    </button>

                    <button
                      onClick={() => {
                        const employerMsg = `Habari ${currentStatus.metadata?.companyName || currentStatus.authorName}! Nimeona tangazo lenu la kazi ya "${currentStatus.metadata?.jobTitle || 'kazi'}". Ningependa kupata maelezo zaidi kuhusu nafasi hii.`;
                        handleStartChatWithStatusAuthor(employerMsg);
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 6. GIVEAWAY STORY CONTENT ==================== */}
              {currentStatus.type === 'giveaway' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <Gift className="w-5 h-5 text-amber-400" />
                        <span>{currentStatus.metadata.giveawayTitle || 'WIN IPHONE 15 PRO MAX! 🎁'}</span>
                      </h3>
                      <p className="text-xs text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                        <span>Imeandaliwa na {currentStatus.authorName}</span>
                        <span className="text-cyan-400">✓</span>
                      </p>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                      🏆 {currentStatus.metadata.winnersCount || 3} Washindi
                    </span>
                  </div>

                  {/* Prize & Deadline Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-xs">🎁 ZAWADI KUU:</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                        ⏳ Mwisho: {currentStatus.metadata.giveawayDeadline || '25 October 2026'}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-white">
                      {currentStatus.metadata.giveawayPrizes || 'iPhone 15 Pro Max (256GB Titanium)'}
                    </p>
                    <p className="text-[11px] text-amber-200/80">
                      👥 Watu <strong>{currentStatus.metadata.participantsCount || 428}</strong> wameshiriki hadi sasa!
                    </p>
                  </div>

                  {/* Entry Steps */}
                  {currentStatus.metadata.entrySteps && currentStatus.metadata.entrySteps.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#12182C] border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Vigezo vya Kushiriki (Entry Requirements):
                      </span>
                      <div className="space-y-1.5">
                        {currentStatus.metadata.entrySteps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: [🎁 Enter Giveaway] and [💬 Chat Now] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsGiveawayOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
                    >
                      <Gift className="w-4 h-4 stroke-[2.5]" />
                      <span>🎁 Enter Giveaway</span>
                    </button>

                    <button
                      onClick={() => {
                        const giveawayMsg = `Habari ${currentStatus.authorName}! Nimeona giveaway yako ya "${currentStatus.metadata?.giveawayTitle || 'Giveaway'}". Ningependa kupata maelezo zaidi kuhusu jinsi ya kushiriki.`;
                        handleStartChatWithStatusAuthor(giveawayMsg);
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 7. QUIZ STORY CONTENT ==================== */}
              {currentStatus.type === 'quiz' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <HelpCircle className="w-5 h-5 text-teal-400" />
                        <span>{currentStatus.metadata.quizCategory || 'Quiz Challenge'}</span>
                      </h3>
                      <p className="text-[11px] text-teal-300 font-semibold">
                        {currentStatus.authorName} • Pima akili yako
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/30">
                        ⏱️ {currentStatus.metadata.quizTimeSeconds || 30}s
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black border border-amber-500/30">
                        ⭐ +{currentStatus.metadata.quizPoints || 50} pts
                      </span>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-900/30 via-slate-900 to-indigo-900/30 border border-teal-500/30">
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block mb-1">
                      Swali:
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                      “{currentStatus.metadata.quizQuestion || 'Tanzania ilipata Uhuru mwaka gani?'}”
                    </p>
                  </div>

                  {/* Interactive Options A, B, C, D (Direct In-Feed Tap!) */}
                  <div className="space-y-2">
                    {currentStatus.metadata.quizOptions?.map((opt, i) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const answered = userQuizAnswers[currentStatus.id];
                      const isChosen = answered?.answeredIdx === i;
                      const isCorrectAnswer = i === (currentStatus.metadata?.quizCorrectIndex ?? 0);

                      let btnStyle = 'bg-[#12182C] hover:bg-[#1a223e] border-white/10 text-white';
                      if (answered) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold';
                        } else if (isChosen && !isCorrectAnswer) {
                          btnStyle = 'bg-rose-500/25 border-rose-400 text-rose-200 font-bold';
                        } else {
                          btnStyle = 'bg-[#12182C]/50 border-white/5 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={!!answered}
                          onClick={() => {
                            if (answered) return;
                            const correct = i === (currentStatus.metadata?.quizCorrectIndex ?? 0);
                            setUserQuizAnswers(prev => ({
                              ...prev,
                              [currentStatus.id]: { answeredIdx: i, isCorrect: correct },
                            }));
                          }}
                          className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs sm:text-sm transition-all active:scale-98 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
                              answered && isCorrectAnswer
                                ? 'bg-emerald-400 text-slate-950'
                                : answered && isChosen
                                ? 'bg-rose-400 text-white'
                                : 'bg-white/10 text-slate-300'
                            }`}>
                              {letters[i]}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {answered && isCorrectAnswer && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Sahihi!</span>
                            </span>
                          )}

                          {answered && isChosen && !isCorrectAnswer && (
                            <span className="text-xs font-bold text-rose-400">
                              Sio sahihi
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Banner */}
                  {userQuizAnswers[currentStatus.id] && (
                    <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs animate-in zoom-in-95 ${
                      userQuizAnswers[currentStatus.id].isCorrect
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>{userQuizAnswers[currentStatus.id].isCorrect ? '🎉 Hongera sana!' : '❌ Pole sana!'}</span>
                        <span className="font-bold">
                          {userQuizAnswers[currentStatus.id].isCorrect
                            ? `Umejibu kwa usahihi! +${currentStatus.metadata.quizPoints || 50} Points zimeongezwa!`
                            : `Jibu sahihi ni ${['A', 'B', 'C', 'D'][currentStatus.metadata.quizCorrectIndex ?? 0]}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsQuizOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
                    >
                      <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>🧠 Full Quiz Mode</span>
                    </button>

                    <button
                      onClick={() => {
                        const quizMsg = `Habari ${currentStatus.authorName}! Nimejibu swali lako la quiz "${currentStatus.metadata?.quizQuestion}". Ningependa kujua matokeo ya jumla!`;
                        handleStartChatWithStatusAuthor(quizMsg);
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat na Host</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 8. PROPERTY STORY CONTENT ==================== */}
              {currentStatus.type === 'property' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <Home className="w-5 h-5 text-cyan-400" />
                        <span>{currentStatus.metadata.propertyTitle || 'Luxury 3-Bedroom Villa'}</span>
                      </h3>
                      <p className="text-xs text-cyan-300 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{currentStatus.metadata.propertyLocation || currentStatus.location || 'Masaki, Dar es Salaam'}</span>
                      </p>
                    </div>

                    <span className={`text-xs px-2.5 py-1 rounded-xl font-black ${
                      currentStatus.metadata.propertyType === 'For Rent'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {currentStatus.metadata.propertyType === 'For Rent' ? '🏠 KUPANGA' : '🏷️ KUUZA'}
                    </span>
                  </div>

                  {/* Price Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-cyan-500/15 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-300 block">BEI:</span>
                      <span className="text-base sm:text-lg font-black font-mono text-white">
                        {currentStatus.metadata.propertyCurrency || 'TSh'} {(currentStatus.metadata.propertyPrice || 1800000).toLocaleString()}
                        {currentStatus.metadata.propertyType === 'For Rent' ? <span className="text-xs text-slate-300 font-normal"> / mwezi</span> : ''}
                      </span>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 text-white font-bold">
                      ⭐ Prime Location
                    </span>
                  </div>

                  {/* Property Specs (Beds, Baths, Parking, Area) */}
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#12182C] border border-white/5 text-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Vyumba</span>
                      <strong className="text-white text-sm">🛏️ {currentStatus.metadata.bedrooms || 3}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Vyoo</span>
                      <strong className="text-white text-sm">🚿 {currentStatus.metadata.bathrooms || 2}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Parking</span>
                      <strong className="text-white text-sm">🚗 {currentStatus.metadata.parkingSpaces || 2}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Ukubwa</span>
                      <strong className="text-white text-sm">📐 {currentStatus.metadata.areaSqMeters || 180}m²</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    “{currentStatus.text || 'Nyumba ya kifahari Masaki, yenye huduma zote za kisasa.'}”
                  </p>

                  {/* Action Buttons: [📅 Book Inspection] and [💬 Chat Agent] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsPropertyOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                    >
                      <Calendar className="w-4 h-4 stroke-[2.5]" />
                      <span>📅 Book Inspection</span>
                    </button>

                    <button
                      onClick={() => {
                        const propMsg = `Habari ${currentStatus.authorName}! Nina nia ya kutembelea au kupata maelezo zaidi kuhusu nyumba hii ya "${currentStatus.metadata?.propertyTitle || 'Property'}" iliyoko ${currentStatus.metadata?.propertyLocation || 'Dar es Salaam'}.`;
                        handleStartChatWithStatusAuthor(propMsg);
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat na Agent</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 9. LIVE SPACE STORY CONTENT ==================== */}
              {currentStatus.type === 'live' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-pink-400 block">
                        {currentStatus.metadata.spaceTopic || 'TECHNOLOGY & STARTUPS'}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                        <Radio className="w-5 h-5 text-pink-400" />
                        <span>{currentStatus.metadata.spaceTitle || 'Dar Tech & Creators Talk 2026'}</span>
                      </h3>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black flex items-center gap-1.5 shadow-lg shadow-rose-500/30 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>{currentStatus.metadata.isLiveNow ? 'LIVE NOW' : 'SCHEDULED'}</span>
                    </span>
                  </div>

                  {/* Topic and Speakers Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-900/30 via-purple-900/20 to-rose-900/30 border border-pink-500/30 space-y-2">
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      “{currentStatus.metadata.spaceSubtitle || currentStatus.text || 'Fursa za kidijitali, biashara za mtandaoni na ubunifu'}”
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold text-[10px] ring-2 ring-pink-400">
                          🎙️
                        </span>
                        <span>Host: <strong className="text-white">{currentStatus.metadata.hostName || currentStatus.authorName}</strong></span>
                      </div>

                      <span className="text-[11px] font-mono text-pink-300 font-bold">
                        👥 {(currentStatus.metadata.listenersCount || 1240).toLocaleString()} listening
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: [🎙️ Join Space] and [🔔 Reminder] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsLiveSpaceOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
                    >
                      <Radio className="w-4 h-4 stroke-[2.5]" />
                      <span>🎙️ Join Space</span>
                    </button>

                    <button
                      onClick={() => {
                        const spaceMsg = `Habari ${currentStatus.authorName}! Ninafuatilia Live Space yenu ya "${currentStatus.metadata?.spaceTitle || 'Live Space'}". Mada ni nzuri sana leo!`;
                        handleStartChatWithStatusAuthor(spaceMsg);
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat na Host</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 10. AD CAMPAIGN STORY CONTENT ==================== */}
              {currentStatus.type === 'advertisement' && currentStatus.metadata && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black uppercase tracking-wider inline-flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        <span>SPONSORED / TANGAZO RASMI</span>
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white mt-1">
                        {currentStatus.metadata.adHeadline || 'Special Offer — Boost Your Life!'}
                      </h3>
                      <p className="text-[11px] text-yellow-300 font-semibold">
                        {currentStatus.authorName} ✓
                      </p>
                    </div>
                  </div>

                  {/* Ad Message Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-500/15 border border-yellow-500/30 space-y-2">
                    <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                      {currentStatus.metadata.adSubtitle || currentStatus.text}
                    </p>

                    {currentStatus.metadata.adBulletPoints && currentStatus.metadata.adBulletPoints.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        {currentStatus.metadata.adBulletPoints.map((bp, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-yellow-200/90">
                            <Check className="w-3.5 h-3.5 text-yellow-400 stroke-[3] shrink-0" />
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: [🚀 Claim Offer] and [💬 Chat Now] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => setIsAdCampaignOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/25 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      <span>🚀 Claim Offer</span>
                    </button>

                    <button
                      onClick={() => {
                        const adMsg = `Habari ${currentStatus.authorName}! Nimeona tangazo lenu la "${currentStatus.metadata?.adHeadline || 'Offer'}". Ningependa kupata maelezo na maelekezo ya jinsi ya kupata ofa hii.`;
                        handleStartChatWithStatusAuthor(adMsg);
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>💬 Chat Now</span>
                    </button>
                  </div>
                </div>
              )}
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

      {/* Job Application Modal (Direct Job Apply + Chat with Employer) */}
      <JobApplicationModal
        isOpen={isJobApplicationOpen}
        onClose={() => setIsJobApplicationOpen(false)}
        jobTitle={currentStatus.metadata?.jobTitle || 'Waiter / Waitress'}
        companyName={currentStatus.metadata?.companyName || currentStatus.authorName || 'Zebra Restaurant'}
        location={currentStatus.location || 'Masaki, Dar es Salaam'}
        salaryText={
          currentStatus.metadata?.isSalaryNegotiable
            ? 'Negotiable'
            : currentStatus.metadata?.salaryMin
            ? `TSh ${currentStatus.metadata.salaryMin.toLocaleString()} – ${(currentStatus.metadata.salaryMax || 600000).toLocaleString()}`
            : 'TSh 400,000 – 600,000'
        }
        currentUser={currentUser}
        onStartChatWithEmployer={(appMsg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(
              currentStatus.authorId || 'zebra_restaurant',
              currentStatus.metadata?.companyName || currentStatus.authorName || 'Zebra Restaurant',
              appMsg,
              currentStatus.authorPhoto || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
            );
          }
        }}
      />

      {/* Giveaway Entry Modal */}
      <GiveawayModal
        isOpen={isGiveawayOpen}
        onClose={() => setIsGiveawayOpen(false)}
        title={currentStatus.metadata?.giveawayTitle || 'WIN AMAZING PRIZES!'}
        authorName={currentStatus.authorName || 'Fresh kk'}
        currentUser={currentUser}
        prizes={currentStatus.metadata?.giveawayPrizes || 'iPhone 15 Pro Max, Apple Watch Ultra, AirPods Pro'}
        winnersCount={currentStatus.metadata?.winnersCount || 3}
        onStartChatWithAuthor={(msg) => handleStartChatWithStatusAuthor(msg)}
      />

      {/* Quiz Answer & Results Modal */}
      <QuizAnswerModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        question={currentStatus.metadata?.quizQuestion || 'Tanzania ilipata Uhuru mwaka gani?'}
        options={currentStatus.metadata?.quizOptions || ['1961', '1962', '1963', '1964']}
        correctIndex={currentStatus.metadata?.quizCorrectIndex ?? 0}
        timeSeconds={currentStatus.metadata?.quizTimeSeconds || 30}
        points={currentStatus.metadata?.quizPoints || 50}
        currentUser={currentUser}
        onAnswerSubmitted={(isCorrect, selectedIdx) => {
          setUserQuizAnswers((prev) => ({
            ...prev,
            [currentStatus.id]: { answeredIdx: selectedIdx, isCorrect },
          }));
        }}
      />

      {/* Property Details & Inspection Booking Modal */}
      <PropertyDetailsModal
        isOpen={isPropertyOpen}
        onClose={() => setIsPropertyOpen(false)}
        propertyTitle={currentStatus.metadata?.propertyTitle || 'Luxury 3-Bedroom Villa Masaki'}
        propertyType={currentStatus.metadata?.propertyType || 'For Rent'}
        location={currentStatus.metadata?.propertyLocation || currentStatus.location || 'Masaki, Dar es Salaam'}
        price={currentStatus.metadata?.propertyPrice || 1800000}
        beds={currentStatus.metadata?.bedrooms || 3}
        baths={currentStatus.metadata?.bathrooms || 2}
        parking={currentStatus.metadata?.parkingSpaces || 2}
        areaSqMeters={currentStatus.metadata?.areaSqMeters || 180}
        agentName={currentStatus.authorName || 'Prime Estates Dar'}
        onStartChatWithAgent={(msg) => handleStartChatWithStatusAuthor(msg)}
      />

      {/* Live Audio / Video Space Room Modal */}
      <LiveSpaceModal
        isOpen={isLiveSpaceOpen}
        onClose={() => setIsLiveSpaceOpen(false)}
        spaceTitle={currentStatus.metadata?.spaceTitle || 'Dar Tech & Creators Talk 2026'}
        spaceSubtitle={currentStatus.metadata?.spaceSubtitle || 'Fursa za kidijitali, biashara za mtandaoni na ubunifu'}
        hostName={currentStatus.metadata?.hostName || currentStatus.authorName || 'Fresh kk'}
        hostAvatar={currentStatus.authorPhoto}
        listenersCount={currentStatus.metadata?.listenersCount || 1240}
        currentUser={currentUser}
      />

      {/* Ad Campaign & Boost Modal */}
      <AdCampaignModal
        isOpen={isAdCampaignOpen}
        onClose={() => setIsAdCampaignOpen(false)}
        currentUser={currentUser}
        initialHeadline={currentStatus.metadata?.adHeadline || 'BOOST YOUR BUSINESS'}
        onAdCreated={() => setIsAdCampaignOpen(false)}
      />
    </div>
  );
};
