import React, { useState, useEffect } from 'react';
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
  Ticket,
  Briefcase,
  Building2,
  Gift,
  HelpCircle,
  Home,
  Radio,
  Megaphone,
  Bed,
  Bath,
  Trophy,
  Lightbulb,
  Zap,
  ArrowLeft,
  Palette,
  Layers,
} from 'lucide-react';
import { StatusItem, StatusType, UserProfile, AvatarShapeStyle } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { SafeImage } from '../../components/SafeImage';
import { DynamicAvatar } from '../../components/DynamicAvatar';
import { AVATAR_STYLES_LIST, getStoredAvatarStyle } from '../profile/avatarStyles';
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

  useEffect(() => {
    if (statusType) {
      const targetType = statusType === 'ai' ? 'ai_generated' : statusType;
      setActiveType(targetType);
      if (targetType === 'giveaway') {
        setMediaUrl('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80');
        setCaption('🎁 MEGA GIVEAWAY! Shinda iPhone 15 Pro Max mpya kabisa!\nFuata maelekezo hapo chini kujiunga na bahati nasibu sasa! 🔥✨\n#GiveawayDar #WinBig #FreshKK');
      } else if (targetType === 'quiz') {
        setMediaUrl('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&auto=format&fit=crop&q=80');
        setCaption('🧠 QUIZ TIME! Pima uelewa wako na ushinde pointi & zawadi papo hapo!\n#TriviaTanzania #QuizChallenge #ElimuNaBurudani');
      } else if (targetType === 'property') {
        setMediaUrl('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80');
        setCaption('🏡 INAPANGISHWA: Luxury 3-Bedroom Villa Masaki!\nIna swimming pool, full AC, na ulinzi wa masaa 24. Wahi sasa!\n#DarRealEstate #MasakiApartments #NyumbaZaKifahari');
      } else if (targetType === 'live') {
        setMediaUrl('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80');
        setCaption('🎙️ LIVE SPACE: Dar Tech & Creators Talk 2026!\nTujumuike pamoja kujadili fursa za mtandaoni na ubunifu wa kidijitali. Usikose!');
      } else if (targetType === 'advertisement') {
        setMediaUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80');
        setCaption('📢 TANGAZO RASMI: Vodacom 5G Internet — Kasi Bila Kikomo!\nTumia mtandao wenye kasi ya ajabu ukiwa popote nchini. Bonyeza link hapa chini kuanza!');
      }
    }
  }, [statusType]);

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

  // 2-Step Flow: 'details' (Hatua 1: Weka Taarifa) -> 'shape_preview' (Hatua 2: Hakiki & Chagua Umbo)
  const [creationStep, setCreationStep] = useState<'details' | 'shape_preview'>('details');
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<AvatarShapeStyle>(
    currentUser?.avatarStyle || getStoredAvatarStyle() || 'organic-blob'
  );
  const [previewStackMode, setPreviewStackMode] = useState<'single' | 'multi'>('single');

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
    { name: 'Chicken Burger', reg: 15000, offer: 12000, img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80', caption: '🔥 Chicken Burger Deluxe yetu maarufu imerejea!\nFresh grilled patty, cheddar cheese & crispy fries. 🤤✨ #ZebraRestaurant #ChickenBurger' },
    { name: 'Beef Burger', reg: 18000, offer: 14000, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80', caption: '🍔 Double Beef Smash Burger na cheddar cheese iliyoyeyuka vizuri! Karibu Zebra Masaki. #ZebraRestaurant #BeefBurger' },
    { name: 'Grilled Chicken', reg: 22000, offer: 18000, img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1200&auto=format&fit=crop&q=80', caption: '🍗 Flame-grilled Peri-peri Chicken nusu kuku na chips za kukaanga. Ladha safi & moto! #GrilledChicken #DarFood' },
    { name: 'French Fries', reg: 6000, offer: 5000, img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=1200&auto=format&fit=crop&q=80', caption: '🍟 Crispy Masala French Fries na sosi ya mayonesi! #FrenchFries #Snacks' },
    { name: 'Pizza', reg: 25000, offer: 20000, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80', caption: '🍕 Wood-fired BBQ Beef & Mozzarella Pizza kubwa! Ofa ya leo pekee. #PizzaDar #DarFood' },
    { name: 'Passion Mocktail', reg: 8000, offer: 5000, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&auto=format&fit=crop&q=80', caption: '🍹 Tropical Passion Fruit Mocktail! Juisi baridi ya matunda asilia na barafu. #HappyHour #Mocktails' },
    { name: 'Zanzibar Biryani', reg: 16000, offer: 13000, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80', caption: '🍛 Zanzibar Mutton Biryani ya viungo asilia na kachumbari safi! #BiryaniDar #Ladha' },
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

  // ==================== JOB STATUS SPECIFIC ====================
  const [jobCompanyName, setJobCompanyName] = useState('Zebra Restaurant');
  const [jobTitle, setJobTitle] = useState('Waiter / Waitress');
  const [jobDescription, setJobDescription] = useState(
    'We are looking for an experienced waiter/waitress to join our team...'
  );
  const [jobLocation, setJobLocation] = useState('Masaki, Dar es Salaam');
  const [jobSalaryMin, setJobSalaryMin] = useState(400000);
  const [jobSalaryMax, setJobSalaryMax] = useState(600000);
  const [jobShowSalary, setJobShowSalary] = useState(true);
  const [jobIsSalaryNegotiable, setJobIsSalaryNegotiable] = useState(false);
  const [jobEmploymentType, setJobEmploymentType] = useState<
    'Full Time' | 'Part Time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance'
  >('Full Time');
  const [jobRequirements, setJobRequirements] = useState<string[]>([
    'Certificate/Diploma',
    '1+ year experience',
    'Good communication',
    'Customer service skills',
  ]);
  const [newRequirementText, setNewRequirementText] = useState('');
  const [jobDeadline, setJobDeadline] = useState('20 October 2026');
  const [jobActionButtons, setJobActionButtons] = useState<{ apply: boolean; chat: boolean }>({
    apply: true,
    chat: true,
  });

  const popularJobTitles = [
    {
      title: 'Waiter / Waitress',
      company: 'Zebra Restaurant',
      desc: 'We are looking for an experienced waiter/waitress to join our team...',
      loc: 'Masaki, Dar es Salaam',
      min: 400000,
      max: 600000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Certificate/Diploma', '1+ year experience', 'Good communication', 'Customer service skills'],
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      deadline: '20 October 2026',
    },
    {
      title: 'Chef',
      company: 'Zebra Restaurant',
      desc: 'Looking for an experienced, passionate Chef to prepare high-quality grilled dishes, burgers & continental specialties.',
      loc: 'Masaki, Dar es Salaam',
      min: 800000,
      max: 1200000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Culinary Certificate/Diploma', '2+ years kitchen experience', 'HACCP food hygiene', 'Fast kitchen prep'],
      img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&auto=format&fit=crop&q=80',
      deadline: '25 October 2026',
    },
    {
      title: 'Driver',
      company: 'Zebra Logistics',
      desc: 'Reliable and punctual professional driver needed for executive trips and delivery transport across Dar es Salaam.',
      loc: 'Mikocheni, Dar es Salaam',
      min: 500000,
      max: 700000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Class C driving license', '3+ years driving experience', 'Knowledge of Dar routes', 'Defensive driving certificate'],
      img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=80',
      deadline: '18 October 2026',
    },
    {
      title: 'Accountant',
      company: 'Zebra Group',
      desc: 'Experienced accountant to manage financial records, daily reconciliations, and TRA tax compliance.',
      loc: 'Posta, Dar es Salaam',
      min: 900000,
      max: 1500000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Degree in Accounting/Finance', 'CPA / Tally / QuickBooks', '2+ years experience', 'Tax compliance knowledge'],
      img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
      deadline: '22 October 2026',
    },
    {
      title: 'Sales Representative',
      company: 'Zebra Foods & Distribution',
      desc: 'Dynamic sales representative to generate corporate orders, liaise with retail partners, and hit revenue targets.',
      loc: 'Kariakoo, Dar es Salaam',
      min: 450000,
      max: 800000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Diploma in Marketing/Business', 'Strong negotiation skills', 'Customer relationship building', 'Target driven'],
      img: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
      deadline: '24 October 2026',
    },
    {
      title: 'Software Developer',
      company: 'Swahili Tech Labs',
      desc: 'Full-stack software developer proficient in React, TypeScript, Node.js and REST APIs to build modern mobile web applications.',
      loc: 'Oysterbay, Dar es Salaam',
      min: 1200000,
      max: 2000000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['BSc in Computer Science or equivalent', '2+ years experience in React/Node', 'Git & Cloud deployment', 'Team player'],
      img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      deadline: '30 October 2026',
    },
    {
      title: 'Security Guard',
      company: 'Apex Security Dar',
      desc: 'Dedicated security officer for premise surveillance, visitor registration, and 24/7 security patrol.',
      loc: 'Sinza, Dar es Salaam',
      min: 350000,
      max: 500000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Form 4 certificate', 'Security training certificate', 'Physically fit', 'Good discipline & integrity'],
      img: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1200&auto=format&fit=crop&q=80',
      deadline: '19 October 2026',
    },
    {
      title: 'Manager',
      company: 'Zebra Restaurant & Lounge',
      desc: 'Operations Manager to supervise hospitality staff, oversee guest satisfaction, manage inventory, and lead daily operations.',
      loc: 'Masaki, Dar es Salaam',
      min: 1200000,
      max: 1800000,
      negotiable: false,
      type: 'Full Time' as const,
      reqs: ['Degree in Hospitality or Business', '3+ years supervisory experience', 'Leadership & problem solving', 'Staff mentoring'],
      img: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&auto=format&fit=crop&q=80',
      deadline: '28 October 2026',
    },
  ];

  const handleSelectJobTitle = (title: string) => {
    setJobTitle(title);
    const found = popularJobTitles.find((j) => j.title.toLowerCase() === title.toLowerCase());
    if (found) {
      setJobCompanyName(found.company);
      setJobDescription(found.desc);
      setJobLocation(found.loc);
      setJobSalaryMin(found.min);
      setJobSalaryMax(found.max);
      setJobEmploymentType(found.type);
      setJobRequirements(found.reqs);
      setMediaUrl(found.img);
      setJobDeadline(found.deadline);
      setCaption(found.desc);
    }
  };

  const calculateDaysRemaining = (deadlineStr: string) => {
    const deadlineDate = new Date(deadlineStr);
    if (!isNaN(deadlineDate.getTime())) {
      const diffTime = deadlineDate.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    return 13;
  };

  // ==================== 1. GIVEAWAY SPECIFIC ====================
  const [giveawayTitle, setGiveawayTitle] = useState('WIN IPHONE 15 PRO MAX! 🎁');
  const [giveawayPrizes, setGiveawayPrizes] = useState('iPhone 15 Pro Max, Apple Watch Ultra, AirPods Pro 2');
  const [giveawayWinnersCount, setGiveawayWinnersCount] = useState(3);
  const [giveawayDeadline, setGiveawayDeadline] = useState('25 October 2026');
  const [giveawayRequirements, setGiveawayRequirements] = useState<string[]>([
    'Follow account hii',
    'Like & Repost status hii',
    'Tag marafiki 3 kwenye comments',
  ]);
  const [giveawayActionButtons, setGiveawayActionButtons] = useState({ enter: true, chat: true });

  const popularGiveaways = [
    {
      title: 'WIN IPHONE 15 PRO MAX! 🎁',
      prizes: 'iPhone 15 Pro Max (256GB Titanium)',
      winners: 1,
      deadline: '25 October 2026',
      img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
      caption: '🎁 MEGA GIVEAWAY! Shinda iPhone 15 Pro Max mpya kabisa!\nFuata vigezo hapo chini kujiunga na bahati nasibu sasa! 🔥✨\n#GiveawayDar #iPhone15Pro #FreshKK',
    },
    {
      title: 'TSh 500,000 CASH GIVEAWAY 💰',
      prizes: 'TSh 500,000 Cash kupitia M-Pesa / Mixx',
      winners: 5,
      deadline: '20 October 2026',
      img: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&auto=format&fit=crop&q=80',
      caption: '💰 ZAWADI YA PESA TASLIMU! Washindi 5 watajishindia TSh 100,000 kila mmoja leo!\nJiunge sasa papo hapo.\n#CashGiveaway #DarEsSalaam',
    },
    {
      title: 'PLAYSTATION 5 SLIM EDITION 🎮',
      prizes: 'PS5 Slim + 2 Controllers + EA FC 26',
      winners: 1,
      deadline: '30 October 2026',
      img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80',
      caption: '🎮 GAMERS GIVEAWAY! Shinda PlayStation 5 mpya kabisa na michezo 2!\nBonyeza [Enter Giveaway] hapa chini kujiandikisha.\n#PS5Giveaway #GamingTZ',
    },
    {
      title: 'FREE DINNER FOR 2 AT ZEBRA 🍽️',
      prizes: 'VIP 3-Course Dinner for 2 + Drinks at Zebra Restaurant Masaki',
      winners: 2,
      deadline: '18 October 2026',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      caption: '🍽️ CHAKULA CHA BURE ZEBRA MASAKI! Washindi 2 wataenda na wapenzi/marafiki zao kula bure!\n#ZebraRestaurant #FreeDinner #FoodieTZ',
    },
  ];

  // ==================== 2. QUIZ SPECIFIC ====================
  const [quizCategory, setQuizCategory] = useState('General Knowledge');
  const [quizQuestion, setQuizQuestion] = useState('Tanzania ilipata Uhuru mwaka gani?');
  const [quizOptions, setQuizOptions] = useState<string[]>(['1961', '1962', '1963', '1964']);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizTimeSeconds, setQuizTimeSeconds] = useState(30);
  const [quizPoints, setQuizPoints] = useState(50);
  const [quizActionButtons, setQuizActionButtons] = useState({ play: true, chat: true });

  const popularQuizzes = [
    {
      category: 'Historia & Taifa',
      q: 'Tanzania ilipata Uhuru mwaka gani?',
      opts: ['1961', '1962', '1963', '1964'],
      correct: 0,
      time: 30,
      pts: 50,
      img: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&auto=format&fit=crop&q=80',
    },
    {
      category: 'Michezo & Soka',
      q: 'Nani mfungaji bora wa muda wote wa Taifa Stars?',
      opts: ['Mbwana Samatta', 'Mrisho Ngassa', 'Simon Msuva', 'John Bocco'],
      correct: 1,
      time: 20,
      pts: 100,
      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    },
    {
      category: 'Jiografia',
      q: 'Mlima mrefu zaidi barani Afrika unapatikana nchi gani?',
      opts: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia'],
      correct: 1,
      time: 15,
      pts: 50,
      img: 'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?w=1200&auto=format&fit=crop&q=80',
    },
    {
      category: 'Teknolojia & AI',
      q: 'Lugha gani rasmi inayotumika kuunda Android Apps za kisasa?',
      opts: ['Kotlin', 'Swift', 'PHP', 'Ruby'],
      correct: 0,
      time: 20,
      pts: 75,
      img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    },
  ];

  // ==================== 3. PROPERTY SPECIFIC ====================
  const [propertyListingType, setPropertyListingType] = useState<'For Rent' | 'For Sale'>('For Rent');
  const [propertyTitle, setPropertyTitle] = useState('Luxury 3-Bedroom Apartment in Masaki');
  const [propertyPrice, setPropertyPrice] = useState(1800000);
  const [propertyCurrency, setPropertyCurrency] = useState('TSh');
  const [propertyLocation, setPropertyLocation] = useState('Masaki Peninsula, Dar es Salaam');
  const [propertyBeds, setPropertyBeds] = useState(3);
  const [propertyBaths, setPropertyBaths] = useState(2);
  const [propertyParking, setPropertyParking] = useState(2);
  const [propertyArea, setPropertyArea] = useState(180);
  const [propertyAmenities, setPropertyAmenities] = useState<string[]>([
    'Air Conditioning (AC)',
    'Swimming Pool',
    '24/7 Security & CCTV',
    'Standby Generator',
    'Ocean View Balcony',
  ]);
  const [propertyActionButtons, setPropertyActionButtons] = useState({ book: true, chat: true });

  const popularProperties = [
    {
      type: 'For Rent' as const,
      title: 'Luxury 3-Bedroom Apartment in Masaki',
      price: 1800000,
      beds: 3,
      baths: 2,
      parking: 2,
      area: 180,
      loc: 'Masaki, Dar es Salaam',
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      caption: '🏡 INAPANGISHWA: Luxury 3-Bedroom Villa Masaki!\nIna swimming pool, full AC, na ulinzi wa masaa 24. Karibu kutembelea leo!',
    },
    {
      type: 'For Sale' as const,
      title: 'Modern Beachfront Villa Mbezi Beach',
      price: 450000000,
      beds: 4,
      baths: 3,
      parking: 4,
      area: 350,
      loc: 'Mbezi Beach, Dar es Salaam',
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      caption: '🏖️ INAUZWA: Nyumba ya kifahari yenye bustani na beach view Mbezi Beach! Hati miliki ipo safi.',
    },
    {
      type: 'For Rent' as const,
      title: 'Prime Office Space CBD Posta',
      price: 2500000,
      beds: 1,
      baths: 2,
      parking: 5,
      area: 220,
      loc: 'Posta Mpya, Dar es Salaam',
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
      caption: '🏢 INAPANGISHWA: Ofisi ya kisasa katikati ya jiji Posta! Generator, elevators, na fiber internet.',
    },
    {
      type: 'For Sale' as const,
      title: 'Kiwanja Kilichopimwa Kigamboni 1000sqm',
      price: 35000000,
      beds: 0,
      baths: 0,
      parking: 0,
      area: 1000,
      loc: 'Kigamboni, Dar es Salaam',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
      caption: '📐 KIWANJA KINAUZWA: Kigamboni karibu na barabara kuu, umeme na maji yapo tayari!',
    },
  ];

  // ==================== 4. LIVE SPACE SPECIFIC ====================
  const [spaceTopic, setSpaceTopic] = useState('Dar Tech & Creators Talk 2026');
  const [spaceSubtitle, setSpaceSubtitle] = useState('Fursa za kidijitali, biashara za mtandaoni na ubunifu');
  const [spaceCategory, setSpaceCategory] = useState('Technology & Business');
  const [spaceScheduleType, setSpaceScheduleType] = useState<'now' | 'schedule'>('now');
  const [spaceDate, setSpaceDate] = useState('Today');
  const [spaceTime, setSpaceTime] = useState('8:30 PM');
  const [spaceSpeakers, setSpaceSpeakers] = useState('Host: Fresh KK, Jane Mollel, DJ Fresh');
  const [spaceListenersCount, setSpaceListenersCount] = useState(1240);
  const [spaceActionButtons, setSpaceActionButtons] = useState({ join: true, remind: true });

  const popularLiveSpaces = [
    {
      topic: 'Dar Tech & Creators Talk 2026',
      sub: 'Fursa za kidijitali, biashara za mtandaoni na ubunifu',
      cat: 'Tech & Business',
      schedule: 'now' as const,
      time: 'LIVE NOW 🔴',
      img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
      caption: '🎙️ LIVE SPACE: Tujumuike pamoja live sasa kujadili fursa za AI na biashara za mtandaoni!',
    },
    {
      topic: 'Zebra Acoustic & Saxophone Vibes 🎷',
      sub: 'Live music jam session na mazungumzo ya muziki',
      cat: 'Music & Vibes',
      schedule: 'now' as const,
      time: 'LIVE NOW 🔴',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
      caption: '🎶 Karibu kwenye Live Space yetu ya leo jioni! Muziki mzuri wa acoustic na maongezi live.',
    },
    {
      topic: 'Afya ya Akili & Uongozi wa Biashara',
      sub: 'Mbinu za kupunguza stress na kujenga tija kazini',
      cat: 'Health & Wellness',
      schedule: 'schedule' as const,
      time: 'Kesho 7:00 PM',
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80',
      caption: '🧠 Kesho saa 1 jioni tutakuwa live na wataalamu wa afya. Weka reminder yako sasa!',
    },
  ];

  // ==================== 5. AD CAMPAIGN SPECIFIC ====================
  const [adHeadline, setAdHeadline] = useState('Vodacom 5G Internet — Kasi Bila Kikomo! 🚀');
  const [adSubtitle, setAdSubtitle] = useState('Pata GB 50 za kasi ya juu kwa wiki nzima kwa TSh 10,000 tu!');
  const [adGoal, setAdGoal] = useState<'visit' | 'shop' | 'install' | 'call' | 'coupon'>('visit');
  const [adCtaText, setAdCtaText] = useState('🌐 Visit Website');
  const [adTargetLocation, setAdTargetLocation] = useState('Dar es Salaam, Arusha & Mwanza');
  const [adDailyBudget, setAdDailyBudget] = useState(25000);
  const [adDurationDays, setAdDurationDays] = useState(7);
  const [adActionButtons, setAdActionButtons] = useState({ cta: true, chat: true });

  const popularAdCampaigns = [
    {
      headline: 'Vodacom 5G Internet — Kasi Bila Kikomo! 🚀',
      sub: 'Pata GB 50 za kasi ya 5G kwa wiki nzima kwa TSh 10,000 tu!',
      goal: 'visit' as const,
      cta: '🌐 Visit Website',
      budget: 25000,
      days: 7,
      img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
      caption: '📢 TANGAZO: Furahia kasi ya 5G popote Tanzania! Jiunge sasa kwa ofa maalum ya wiki.',
    },
    {
      headline: 'Zebra Special Weekend 30% OFF 🍔',
      sub: 'Punguzo la 30% kwenye vyakula vyote vya jioni wikendi hii!',
      goal: 'coupon' as const,
      cta: '🎟️ Claim 30% Coupon',
      budget: 15000,
      days: 3,
      img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      caption: '🔥 OFA MAALUM: Weekend hii kula burgers na grilled chicken kwa 30% discount Masaki!',
    },
    {
      headline: 'Samsung Galaxy S24 Ultra Official Launch 📱',
      sub: 'Oda leo upate bure Galaxy Buds na Wireless Charger!',
      goal: 'shop' as const,
      cta: '🛍️ Shop Now',
      budget: 50000,
      days: 7,
      img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&auto=format&fit=crop&q=80',
      caption: '📱 Pata Galaxy S24 Ultra yenye Galaxy AI sasa kutoka maduka rasmi ya Samsung Dar.',
    },
  ];

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

  const handleProceedToShapeSelection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreationStep('shape_preview');
  };

  const handleSubmitFinal = async () => {
    setSubmitting(true);

    const newStatus: StatusItem = {
      id: `status_${Date.now()}`,
      authorId: currentUser.id,
      authorName:
        activeType === 'food'
          ? 'Zebra Restaurant'
          : activeType === 'job'
          ? jobCompanyName
          : currentUser.displayName,
      authorUsername:
        activeType === 'food'
          ? 'zebra_restaurant'
          : activeType === 'job'
          ? jobCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '_')
          : currentUser.username,
      authorPhoto:
        activeType === 'food'
          ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'
          : activeType === 'job'
          ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'
          : currentUser.photoURL || freshKkAvatar,
      avatarStyle: selectedAvatarStyle,
      type: activeType,
      mediaUrl,
      text: caption,
      location: activeType === 'job' ? jobLocation : locationName,
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
          ...(activeType === 'food' && foodActionButtons.order ? (['order_now'] as const) : []),
          ...(activeType === 'food' && foodActionButtons.chat ? (['chat_now'] as const) : []),
          ...(activeType === 'job' && jobActionButtons.apply ? (['apply_now'] as const) : []),
          ...(activeType === 'job' && jobActionButtons.chat ? (['chat_now'] as const) : []),
          ...(activeType === 'giveaway' && giveawayActionButtons.enter ? (['join_giveaway'] as const) : []),
          ...(activeType === 'giveaway' && giveawayActionButtons.chat ? (['chat_now'] as const) : []),
          ...(activeType === 'quiz' && quizActionButtons.play ? (['submit_quiz'] as const) : []),
          ...(activeType === 'quiz' && quizActionButtons.chat ? (['chat_now'] as const) : []),
          ...(activeType === 'property' && propertyActionButtons.book ? (['property_details'] as const) : []),
          ...(activeType === 'property' && propertyActionButtons.chat ? (['chat_now'] as const) : []),
          ...(activeType === 'live' && spaceActionButtons.join ? (['join_live_space'] as const) : []),
          ...(activeType === 'advertisement' && adActionButtons.cta ? (['run_ad'] as const) : []),
          ...(activeType === 'advertisement' && adActionButtons.chat ? (['chat_now'] as const) : []),
        ],

        // Job metadata
        companyName: activeType === 'job' ? jobCompanyName : undefined,
        jobTitle: activeType === 'job' ? jobTitle : undefined,
        jobDescription: activeType === 'job' ? jobDescription : undefined,
        salaryMin: activeType === 'job' && jobShowSalary && !jobIsSalaryNegotiable ? jobSalaryMin : undefined,
        salaryMax: activeType === 'job' && jobShowSalary && !jobIsSalaryNegotiable ? jobSalaryMax : undefined,
        showSalary: activeType === 'job' ? jobShowSalary : undefined,
        isSalaryNegotiable: activeType === 'job' ? jobIsSalaryNegotiable : undefined,
        employmentType: activeType === 'job' ? jobEmploymentType : undefined,
        requirements: activeType === 'job' ? jobRequirements : undefined,
        deadlineDate: activeType === 'job' ? jobDeadline : undefined,
        daysRemaining: activeType === 'job' ? calculateDaysRemaining(jobDeadline) : undefined,
        isClosed: activeType === 'job' ? calculateDaysRemaining(jobDeadline) <= 0 : undefined,

        // Giveaway metadata
        giveawayTitle: activeType === 'giveaway' ? giveawayTitle : undefined,
        giveawayPrizes: activeType === 'giveaway' ? giveawayPrizes : undefined,
        winnersCount: activeType === 'giveaway' ? giveawayWinnersCount : undefined,
        giveawayDeadline: activeType === 'giveaway' ? giveawayDeadline : undefined,
        entrySteps: activeType === 'giveaway' ? giveawayRequirements : undefined,
        participantsCount: activeType === 'giveaway' ? 428 : undefined,

        // Quiz metadata
        quizQuestion: activeType === 'quiz' ? quizQuestion : undefined,
        quizOptions: activeType === 'quiz' ? quizOptions : undefined,
        quizCorrectIndex: activeType === 'quiz' ? quizCorrectIndex : undefined,
        quizTimeSeconds: activeType === 'quiz' ? quizTimeSeconds : undefined,
        quizPoints: activeType === 'quiz' ? quizPoints : undefined,

        // Property metadata
        propertyType: activeType === 'property' ? propertyListingType : undefined,
        propertyTitle: activeType === 'property' ? propertyTitle : undefined,
        propertyLocation: activeType === 'property' ? propertyLocation : undefined,
        propertyPrice: activeType === 'property' ? propertyPrice : undefined,
        propertyCurrency: activeType === 'property' ? propertyCurrency : undefined,
        bedrooms: activeType === 'property' ? propertyBeds : undefined,
        bathrooms: activeType === 'property' ? propertyBaths : undefined,
        parkingSpaces: activeType === 'property' ? propertyParking : undefined,
        areaSqMeters: activeType === 'property' ? propertyArea : undefined,

        // Live Space metadata
        spaceTitle: activeType === 'live' ? spaceTopic : undefined,
        spaceSubtitle: activeType === 'live' ? spaceSubtitle : undefined,
        spaceTopic: activeType === 'live' ? spaceCategory : undefined,
        spaceDate: activeType === 'live' ? (spaceScheduleType === 'now' ? 'Leo (Today)' : spaceDate) : undefined,
        spaceTime: activeType === 'live' ? (spaceScheduleType === 'now' ? 'LIVE NOW 🔴' : spaceTime) : undefined,
        listenersCount: activeType === 'live' ? spaceListenersCount : undefined,
        isLiveNow: activeType === 'live' ? spaceScheduleType === 'now' : undefined,
        hostName: activeType === 'live' ? currentUser.displayName : undefined,
        hostAvatar: activeType === 'live' ? (currentUser.photoURL || freshKkAvatar) : undefined,

        // Ad Campaign metadata
        adHeadline: activeType === 'advertisement' ? adHeadline : undefined,
        adSubtitle: activeType === 'advertisement' ? adSubtitle : undefined,
        adBulletPoints: activeType === 'advertisement' ? [adCtaText, adTargetLocation, `Bajeti: TSh ${adDailyBudget.toLocaleString()}/siku`] : undefined,

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
            {creationStep === 'shape_preview' ? (
              <button
                type="button"
                onClick={() => setCreationStep('details')}
                className="w-9 h-9 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition-colors active:scale-95"
                title="Rudi Kwenye Taarifa za Story"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                {activeType === 'job' && <Briefcase className="w-5 h-5 text-amber-400" />}
                {activeType === 'food' && <Utensils className="w-5 h-5 text-amber-400" />}
                {activeType === 'poll' && <BarChart2 className="w-5 h-5 text-blue-400" />}
                {activeType === 'product' && <ShoppingBag className="w-5 h-5 text-emerald-400" />}
                {activeType === 'event' && <Calendar className="w-5 h-5 text-purple-400" />}
                {activeType === 'giveaway' && <Gift className="w-5 h-5 text-amber-400" />}
                {activeType === 'quiz' && <HelpCircle className="w-5 h-5 text-teal-400" />}
                {activeType === 'property' && <Home className="w-5 h-5 text-cyan-400" />}
                {activeType === 'live' && <Radio className="w-5 h-5 text-pink-400" />}
                {activeType === 'advertisement' && <Megaphone className="w-5 h-5 text-yellow-400" />}
                {!['food', 'poll', 'product', 'event', 'job', 'giveaway', 'quiz', 'property', 'live', 'advertisement'].includes(activeType) && <Camera className="w-5 h-5" />}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white capitalize">
                {creationStep === 'shape_preview' ? (
                  <span className="flex items-center gap-1.5">
                    <span>🎨 Hakiki & Chagua Umbo la Story</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                      Hatua 2 ya 2
                    </span>
                  </span>
                ) : (
                  `Weka ${
                    activeType === 'job' ? '💼 Job Listing' :
                    activeType === 'food' ? '🍕 Food Status' :
                    activeType === 'poll' ? '📊 Poll Status' :
                    activeType === 'product' ? '🛍️ Product Status' :
                    activeType === 'event' ? '🎪 Event Status' :
                    activeType === 'giveaway' ? '🎁 Giveaway Status' :
                    activeType === 'quiz' ? '❓ Quiz Status' :
                    activeType === 'property' ? '🏠 Property Status' :
                    activeType === 'live' ? '🎙️ Live Space Status' :
                    activeType === 'advertisement' ? '📢 Ad Campaign' : 'Status'
                  }`
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {creationStep === 'shape_preview'
                  ? 'Chagua umbo 1 kati ya 10 — wewe na watu wote mtakaoona stori hii mtaiona na umbo hili!'
                  : activeType === 'job' ? 'Kampuni, Job Title, Mshahara, Masharti & Apply Now' :
                    activeType === 'giveaway' ? 'Zawadi, Washindi, Masharti ya Kujiunga & Tiketi' :
                    activeType === 'quiz' ? 'Maswali, Chaguzi A-D, Jibu Sahihi & Pointi' :
                    activeType === 'property' ? 'Kupanga / Kuuza, Bei, Vyumba & Book Inspection' :
                    activeType === 'live' ? 'Mada, Wasemaji, Muda & Jiunge Live Audio' :
                    activeType === 'advertisement' ? 'Tangazo Rasmi, Lengo, Bajeti & Call To Action' :
                    'Picha, Bei, Ofa, Countdown & Vitufe vya Action'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {creationStep === 'details' && (
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
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher (Visible only in Step 1) */}
        {creationStep === 'details' && (
          <div className="px-4 py-2 bg-[#0B1020] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: 'job', label: '💼 Job Listing', color: 'text-amber-400' },
              { id: 'food', label: '🍕 Food Status', color: 'text-amber-400' },
              { id: 'poll', label: '📊 Poll', color: 'text-blue-400' },
              { id: 'product', label: '🛍️ Product', color: 'text-emerald-400' },
              { id: 'event', label: '🎪 Event', color: 'text-purple-400' },
              { id: 'giveaway', label: '🎁 Giveaway', color: 'text-amber-400' },
              { id: 'quiz', label: '❓ Quiz', color: 'text-teal-400' },
              { id: 'property', label: '🏠 Property', color: 'text-cyan-400' },
              { id: 'live', label: '🎙️ Live Space', color: 'text-pink-400' },
              { id: 'advertisement', label: '📢 Ad Campaign', color: 'text-yellow-400' },
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
        )}

        {/* Form Body (Step 1) or Shape Selection Studio (Step 2) */}
        {creationStep === 'details' ? (
          <form onSubmit={handleProceedToShapeSelection} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* SECTION 1: MEDIA UPLOAD BUTTONS */}
          <div className="p-4 rounded-2xl bg-[#12192F] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Add {activeType === 'job' ? 'Job / Company' : activeType === 'food' ? 'Food' : activeType === 'poll' ? 'Poll' : activeType === 'product' ? 'Product' : 'Event'} Media</span>
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
          {/* JOB LISTING FORM */}
          {/* ============================================================== */}
          {activeType === 'job' && (
            <div className="space-y-4">
              {/* 1. Jina Kampuni / Biashara */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Jina la Kampuni / Biashara</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Employer / Business Name</span>
                </div>
                <input
                  type="text"
                  required
                  value={jobCompanyName}
                  onChange={(e) => setJobCompanyName(e.target.value)}
                  placeholder="Mfano: Zebra Restaurant"
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 2. Job Title & Presets */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>Job Title</span>
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold">Mfano wa Kazi</span>
                </div>

                {/* Job Title Input */}
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="[ Waiter / Waitress ]"
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:border-amber-400"
                />

                {/* Preset Chips from user prompt:
                    Chef, Driver, Accountant, Sales Representative, Software Developer, Security Guard, Manager */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Chagua haraka (Popular Job Titles):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {popularJobTitles.map((item) => (
                      <button
                        type="button"
                        key={item.title}
                        onClick={() => handleSelectJobTitle(item.title)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                          jobTitle.toLowerCase() === item.title.toLowerCase()
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                        }`}
                      >
                        {jobTitle.toLowerCase() === item.title.toLowerCase() && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Job Description */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Job Description (Maelezo ya Kazi)
                </span>
                <textarea
                  rows={3}
                  required
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setCaption(e.target.value);
                  }}
                  placeholder="We are looking for an experienced waiter/waitress to join our team..."
                  className="w-full bg-[#182038] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 4. 📍 Job Location */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>📍 Job Location</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Eneo la Kazi</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Masaki, Dar es Salaam"
                    className="flex-1 bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setJobLocation('Masaki, Dar es Salaam (Selected on Map)')}
                    className="px-3 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>[📍 Select on Map]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocating(true);
                      setTimeout(() => {
                        setJobLocation('Masaki, Dar es Salaam (GPS Current Location)');
                        setIsLocating(false);
                      }, 400);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                    title="Current GPS location"
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 5. 💰 Salary */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    💰 Salary (Mshahara)
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobShowSalary}
                        onChange={(e) => setJobShowSalary(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>☑ Show salary</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setJobIsSalaryNegotiable(!jobIsSalaryNegotiable)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        jobIsSalaryNegotiable
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Au: Salary: Negotiable
                    </button>
                  </div>
                </div>

                {!jobIsSalaryNegotiable ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">From: (Kuanzia)</span>
                      <div className="flex items-center bg-[#182038] border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-slate-400 text-[10px] mr-1">TSh</span>
                        <input
                          type="number"
                          value={jobSalaryMin}
                          onChange={(e) => setJobSalaryMin(parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-white font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">To: (Hadi)</span>
                      <div className="flex items-center bg-[#182038] border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-slate-400 text-[10px] mr-1">TSh</span>
                        <input
                          type="number"
                          value={jobSalaryMax}
                          onChange={(e) => setJobSalaryMax(parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-amber-300 font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center">
                    🤝 Mshahara: Negotiable (Maelewano wakati wa usaili)
                  </div>
                )}
              </div>

              {/* 6. Employment Type */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Employment Type (Aina ya Ajira)
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    'Full Time',
                    'Part Time',
                    'Contract',
                    'Temporary',
                    'Internship',
                    'Freelance',
                  ].map((emp) => (
                    <button
                      type="button"
                      key={emp}
                      onClick={() => setJobEmploymentType(emp as any)}
                      className={`p-2.5 rounded-xl text-left font-bold transition-all flex items-center gap-2 ${
                        jobEmploymentType === emp
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      <span>{jobEmploymentType === emp ? '●' : '○'}</span>
                      <span className="truncate">{emp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Requirements */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Requirements (Vigezo na Masharti)
                  </span>
                  <span className="text-[10px] text-slate-400">{jobRequirements.length} vigezo</span>
                </div>

                <div className="space-y-2">
                  {jobRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#182038] border border-white/5 flex items-center justify-between text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        <span>{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setJobRequirements(jobRequirements.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add requirement input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newRequirementText}
                    onChange={(e) => setNewRequirementText(e.target.value)}
                    placeholder="Weka kigezo kingine..."
                    className="flex-1 bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newRequirementText.trim()) {
                          setJobRequirements([...jobRequirements, newRequirementText.trim()]);
                          setNewRequirementText('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRequirementText.trim()) {
                        setJobRequirements([...jobRequirements, newRequirementText.trim()]);
                        setNewRequirementText('');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-95 transition-all text-xs flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Weka</span>
                  </button>
                </div>
              </div>

              {/* 8. 📅 Application Deadline & Status Indicator */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>📅 Application Deadline</span>
                  </span>
                  {/* Status Indicator: ⏳ 13 days remaining OR 🔴 Applications Closed */}
                  {calculateDaysRemaining(jobDeadline) > 0 ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
                      ⏳ {calculateDaysRemaining(jobDeadline)} days remaining
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black">
                      🔴 Applications Closed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    placeholder="20 October 2026"
                    className="flex-1 bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setJobDeadline('20 October 2026')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    20 Oct
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobDeadline('Expired')}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold"
                  >
                    Funga (Close)
                  </button>
                </div>
              </div>

              {/* 9. Action Buttons Checkboxes */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Vitufe vya Status (Action Buttons)
                </span>
                <div className="flex items-center gap-4 text-xs text-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobActionButtons.apply}
                      onChange={(e) =>
                        setJobActionButtons({ ...jobActionButtons, apply: e.target.checked })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span className="font-bold text-emerald-400">📄 [Apply Now] Form</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobActionButtons.chat}
                      onChange={(e) =>
                        setJobActionButtons({ ...jobActionButtons, chat: e.target.checked })
                      }
                      className="rounded accent-cyan-500"
                    />
                    <span className="font-bold text-cyan-400">💬 [Chat Now] Button</span>
                  </label>
                </div>
              </div>
            </div>
          )}

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
          {/* 1. GIVEAWAY FORM */}
          {/* ============================================================== */}
          {activeType === 'giveaway' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Giveaway & Zawadi (Mega Promo)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    🎁 Viral Boost
                  </span>
                </div>

                {/* Popular Giveaway Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    Chagua Zawadi Maarufu (Presets):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {popularGiveaways.map((gw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGiveawayTitle(gw.title);
                          setGiveawayPrizes(gw.prizes);
                          setGiveawayWinnersCount(gw.winners);
                          setGiveawayDeadline(gw.deadline);
                          setMediaUrl(gw.img);
                          setCaption(gw.caption);
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all ${
                          giveawayTitle === gw.title
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-bold text-[11px] truncate">{gw.title.replace(/[🎁💰🎮🍽️]/g, '')}</p>
                        <p className="text-[9px] text-amber-300 font-mono mt-0.5">🏆 {gw.winners} {gw.winners === 1 ? 'Mshindi' : 'Washindi'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Kichwa cha Giveaway (Title):</span>
                  <input
                    type="text"
                    value={giveawayTitle}
                    onChange={(e) => setGiveawayTitle(e.target.value)}
                    placeholder="Kichwa cha Giveaway mfano [ WIN IPHONE 15 PRO MAX! 🎁 ]"
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Prizes Description */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Zawadi Zitakazotolewa (Prizes):</span>
                  <input
                    type="text"
                    value={giveawayPrizes}
                    onChange={(e) => setGiveawayPrizes(e.target.value)}
                    placeholder="Zawadi: mfano iPhone 15 Pro Max, AirPods Pro 2, TSh 500,000 Cash"
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Winners count and Deadline */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Idadi ya Washindi</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGiveawayWinnersCount(num)}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                            giveawayWinnersCount === num ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Tarehe ya Kutoa Zawadi</span>
                    <input
                      type="text"
                      value={giveawayDeadline}
                      onChange={(e) => setGiveawayDeadline(e.target.value)}
                      placeholder="25 October 2026"
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Requirements / Entry Steps */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Masharti ya Kujiunga (Entry Steps):</span>
                  <div className="space-y-1">
                    {giveawayRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-[#141B30] border border-white/5 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="flex-1">{req}</span>
                        <button
                          type="button"
                          onClick={() => setGiveawayRequirements(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Vitufe vya Action:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-bold">
                      <input
                        type="checkbox"
                        checked={giveawayActionButtons.enter}
                        onChange={(e) => setGiveawayActionButtons(prev => ({ ...prev, enter: e.target.checked }))}
                        className="rounded accent-amber-500"
                      />
                      <span>[🎁 Enter Giveaway]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={giveawayActionButtons.chat}
                        onChange={(e) => setGiveawayActionButtons(prev => ({ ...prev, chat: e.target.checked }))}
                        className="rounded accent-amber-500"
                      />
                      <span>[💬 Chat Now]</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. QUIZ FORM */}
          {/* ============================================================== */}
          {activeType === 'quiz' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-teal-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-teal-400" />
                    <span>Tengeneza Quiz & Maswali ya Akili</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                    🧠 Interactive Challenge
                  </span>
                </div>

                {/* Popular Quiz Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    Mada Maarufu (Presets):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {popularQuizzes.map((qz, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuizCategory(qz.category);
                          setQuizQuestion(qz.q);
                          setQuizOptions(qz.opts);
                          setQuizCorrectIndex(qz.correct);
                          setQuizTimeSeconds(qz.time);
                          setQuizPoints(qz.pts);
                          setMediaUrl(qz.img);
                          setCaption(`🧠 QUIZ: ${qz.q}\nJibu kwa usahihi ujishindie +${qz.pts} Points! #QuizTZ`);
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all ${
                          quizQuestion === qz.q
                            ? 'bg-teal-500/20 border-teal-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-bold text-[11px] truncate">{qz.category}</p>
                        <p className="text-[9px] text-teal-300 font-mono mt-0.5">⏱️ {qz.time}s • ⭐ +{qz.pts}pts</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Question */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Category:</span>
                    <input
                      type="text"
                      value={quizCategory}
                      onChange={(e) => setQuizCategory(e.target.value)}
                      className="w-full bg-[#182038] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Swali (Question):</span>
                    <input
                      type="text"
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      placeholder="Andika swali lako hapa..."
                      className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                {/* 4 Options with Correct Answer Selector */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Chaguzi 4 (Weka alama ya kijani kwenye JIBU SAHIHI):
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Jibu Sahihi: {['A', 'B', 'C', 'D'][quizCorrectIndex]}
                    </span>
                  </div>

                  {quizOptions.map((opt, i) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isCorrect = quizCorrectIndex === i;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuizCorrectIndex(i)}
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                              : 'bg-white/10 text-slate-400 hover:text-white'
                          }`}
                          title="Gusa hapa kulifanya hili liwe jibu sahihi"
                        >
                          {letters[i]}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...quizOptions];
                            newOpts[i] = e.target.value;
                            setQuizOptions(newOpts);
                          }}
                          placeholder={`Chaguo ${letters[i]}`}
                          className={`flex-1 bg-[#182038] border rounded-xl px-3 py-1.5 text-xs text-white ${
                            isCorrect ? 'border-emerald-500/60 font-bold text-emerald-200' : 'border-white/10'
                          }`}
                        />
                        {isCorrect && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            ✓ SAHIHI
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Timer & Points */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Muda kwa Kila Swali</span>
                    <div className="flex items-center gap-1.5">
                      {[15, 20, 30, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setQuizTimeSeconds(sec)}
                          className={`flex-1 py-1 rounded-lg font-bold text-xs ${
                            quizTimeSeconds === sec ? 'bg-teal-500 text-slate-950' : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Pointi za Ushindi</span>
                    <div className="flex items-center gap-1.5">
                      {[25, 50, 75, 100].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setQuizPoints(pts)}
                          className={`flex-1 py-1 rounded-lg font-bold text-xs ${
                            quizPoints === pts ? 'bg-teal-500 text-slate-950' : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          +{pts}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Vitufe vya Action:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-teal-300 font-bold">
                      <input
                        type="checkbox"
                        checked={quizActionButtons.play}
                        onChange={(e) => setQuizActionButtons(prev => ({ ...prev, play: e.target.checked }))}
                        className="rounded accent-teal-500"
                      />
                      <span>[🧠 Play Quiz]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={quizActionButtons.chat}
                        onChange={(e) => setQuizActionButtons(prev => ({ ...prev, chat: e.target.checked }))}
                        className="rounded accent-teal-500"
                      />
                      <span>[💬 Chat Now]</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. PROPERTY FORM */}
          {/* ============================================================== */}
          {activeType === 'property' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-cyan-400" />
                    <span>Real Estate (Nyumba, Viwanja & Ofisi)</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPropertyListingType('For Rent')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        propertyListingType === 'For Rent' ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      Kupanga (Rent)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPropertyListingType('For Sale')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        propertyListingType === 'For Sale' ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      Kuuza (Sale)
                    </button>
                  </div>
                </div>

                {/* Popular Property Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    Mifano Maarufu (Presets):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {popularProperties.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPropertyListingType(pr.type);
                          setPropertyTitle(pr.title);
                          setPropertyPrice(pr.price);
                          setPropertyBeds(pr.beds);
                          setPropertyBaths(pr.baths);
                          setPropertyParking(pr.parking);
                          setPropertyArea(pr.area);
                          setPropertyLocation(pr.loc);
                          setMediaUrl(pr.img);
                          setCaption(pr.caption);
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all ${
                          propertyTitle === pr.title
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-bold text-[11px] truncate">{pr.title}</p>
                        <p className="text-[9px] text-cyan-300 font-mono mt-0.5">TSh {pr.price.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Jina la Nyumba / Eneo (Title):</span>
                  <input
                    type="text"
                    value={propertyTitle}
                    onChange={(e) => setPropertyTitle(e.target.value)}
                    placeholder="mfano Luxury 3-Bedroom Villa Masaki..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                      Bei ({propertyListingType === 'For Rent' ? 'Kwa Mwezi' : 'Bei ya Kuuza'}):
                    </span>
                    <input
                      type="number"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Sarafu:</span>
                    <select
                      value={propertyCurrency}
                      onChange={(e) => setPropertyCurrency(e.target.value)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="TSh">TSh</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">📍 Eneo la Nyumba (Location):</span>
                  <input
                    type="text"
                    value={propertyLocation}
                    onChange={(e) => setPropertyLocation(e.target.value)}
                    placeholder="Masaki Peninsula, Dar es Salaam"
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Specs: Beds, Baths, Parking, Area */}
                <div className="grid grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold">🛏️ Vyumba</span>
                    <input
                      type="number"
                      value={propertyBeds}
                      onChange={(e) => setPropertyBeds(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold">🚿 Vyoo</span>
                    <input
                      type="number"
                      value={propertyBaths}
                      onChange={(e) => setPropertyBaths(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold">🚗 Maegesho</span>
                    <input
                      type="number"
                      value={propertyParking}
                      onChange={(e) => setPropertyParking(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold">📐 Sqm</span>
                    <input
                      type="number"
                      value={propertyArea}
                      onChange={(e) => setPropertyArea(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Vitufe vya Action:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300 font-bold">
                      <input
                        type="checkbox"
                        checked={propertyActionButtons.book}
                        onChange={(e) => setPropertyActionButtons(prev => ({ ...prev, book: e.target.checked }))}
                        className="rounded accent-cyan-500"
                      />
                      <span>[📅 Book Inspection]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={propertyActionButtons.chat}
                        onChange={(e) => setPropertyActionButtons(prev => ({ ...prev, chat: e.target.checked }))}
                        className="rounded accent-cyan-500"
                      />
                      <span>[💬 Chat with Agent]</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. LIVE SPACE FORM */}
          {/* ============================================================== */}
          {activeType === 'live' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-pink-400" />
                    <span>Live Space (Audio Room & Matangazo Live)</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSpaceScheduleType('now')}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                        spaceScheduleType === 'now' ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>LIVE NOW</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpaceScheduleType('schedule')}
                      className={`px-2.5 py-1 rounded-lg font-bold ${
                        spaceScheduleType === 'schedule' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      🗓️ Schedule
                    </button>
                  </div>
                </div>

                {/* Popular Live Space Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    Mada Zinazovuma (Presets):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {popularLiveSpaces.map((ls, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSpaceTopic(ls.topic);
                          setSpaceSubtitle(ls.sub);
                          setSpaceCategory(ls.cat);
                          setSpaceScheduleType(ls.schedule);
                          setMediaUrl(ls.img);
                          setCaption(ls.caption);
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all ${
                          spaceTopic === ls.topic
                            ? 'bg-pink-500/20 border-pink-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-bold text-[11px] truncate">{ls.topic}</p>
                        <p className="text-[9px] text-pink-300 font-mono mt-0.5">{ls.time} • {ls.cat}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic and Subtitle */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Mada Kuu (Space Topic):</span>
                  <input
                    type="text"
                    value={spaceTopic}
                    onChange={(e) => setSpaceTopic(e.target.value)}
                    placeholder="mfano Dar Tech & Creators Talk 2026..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Maelezo Fupi (Subtitle / Agenda):</span>
                  <textarea
                    rows={2}
                    value={spaceSubtitle}
                    onChange={(e) => setSpaceSubtitle(e.target.value)}
                    placeholder="Nini kitajadiliwa kwenye Live Space hii..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Speakers and Date/Time */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Wasemaji (Speakers)</span>
                    <input
                      type="text"
                      value={spaceSpeakers}
                      onChange={(e) => setSpaceSpeakers(e.target.value)}
                      placeholder="Host: Fresh KK, DJ Fresh..."
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Muda / Ratiba</span>
                    <input
                      type="text"
                      value={spaceScheduleType === 'now' ? '🔴 INAENDELEA SASA (Live Now)' : `${spaceDate} ${spaceTime}`}
                      onChange={(e) => setSpaceTime(e.target.value)}
                      disabled={spaceScheduleType === 'now'}
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Vitufe vya Action:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-pink-300 font-bold">
                      <input
                        type="checkbox"
                        checked={spaceActionButtons.join}
                        onChange={(e) => setSpaceActionButtons(prev => ({ ...prev, join: e.target.checked }))}
                        className="rounded accent-pink-500"
                      />
                      <span>[🎙️ Join Space]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={spaceActionButtons.remind}
                        onChange={(e) => setSpaceActionButtons(prev => ({ ...prev, remind: e.target.checked }))}
                        className="rounded accent-pink-500"
                      />
                      <span>[🔔 Reminder]</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. AD CAMPAIGN FORM */}
          {/* ============================================================== */}
          {activeType === 'advertisement' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#12192F] border border-yellow-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-yellow-400" />
                    <span>Tangazo Rasmi (Sponsored Ad Campaign)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                    📢 Reach 50k+
                  </span>
                </div>

                {/* Popular Ad Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    Mifano ya Kampeni (Presets):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {popularAdCampaigns.map((ad, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAdHeadline(ad.headline);
                          setAdSubtitle(ad.sub);
                          setAdGoal(ad.goal);
                          setAdCtaText(ad.cta);
                          setAdDailyBudget(ad.budget);
                          setAdDurationDays(ad.days);
                          setMediaUrl(ad.img);
                          setCaption(ad.caption);
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all ${
                          adHeadline === ad.headline
                            ? 'bg-yellow-500/20 border-yellow-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-bold text-[11px] truncate">{ad.headline}</p>
                        <p className="text-[9px] text-yellow-300 font-mono mt-0.5">{ad.cta} • {ad.days} Siku</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headline & Subtitle */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Headline (Kichwa cha Tangazo):</span>
                  <input
                    type="text"
                    value={adHeadline}
                    onChange={(e) => setAdHeadline(e.target.value)}
                    placeholder="Kichwa cha Tangazo..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Maelezo ya Ofa (Ad Copy):</span>
                  <textarea
                    rows={2}
                    value={adSubtitle}
                    onChange={(e) => setAdSubtitle(e.target.value)}
                    placeholder="Eleza ofa au faida kwa mtumiaji..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Campaign Goal and CTA Text */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Call-To-Action (Kitufe)</span>
                    <input
                      type="text"
                      value={adCtaText}
                      onChange={(e) => setAdCtaText(e.target.value)}
                      placeholder="🌐 Visit Website au 🛍️ Shop Now"
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Eneo Linalolengwa (Target)</span>
                    <input
                      type="text"
                      value={adTargetLocation}
                      onChange={(e) => setAdTargetLocation(e.target.value)}
                      placeholder="Dar es Salaam, Arusha, Mwanza"
                      className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Budget & Estimated Reach */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/15 via-amber-500/15 to-yellow-500/15 border border-yellow-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-yellow-300 font-bold block">Bajeti ya Siku: TSh {adDailyBudget.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Muda: Siku {adDurationDays} ({adDailyBudget * adDurationDays > 0 ? `Jumla: TSh ${(adDailyBudget * adDurationDays).toLocaleString()}` : ''})</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-950 font-black">
                    🚀 ~{(adDailyBudget / 1000 * 1800).toLocaleString()} Views
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Vitufe vya Action:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-yellow-300 font-bold">
                      <input
                        type="checkbox"
                        checked={adActionButtons.cta}
                        onChange={(e) => setAdActionButtons(prev => ({ ...prev, cta: e.target.checked }))}
                        className="rounded accent-yellow-500"
                      />
                      <span>[{adCtaText}]</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={adActionButtons.chat}
                        onChange={(e) => setAdActionButtons(prev => ({ ...prev, chat: e.target.checked }))}
                        className="rounded accent-yellow-500"
                      />
                      <span>[💬 Chat Now]</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                      {activeType === 'food' || activeType === 'job' ? 'ZR' : 'ZK'}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-white flex items-center gap-1">
                        <span>
                          {activeType === 'food'
                            ? 'ZEBRA RESTAURANT'
                            : activeType === 'job'
                            ? jobCompanyName || 'ZEBRA RESTAURANT'
                            : currentUser.displayName}
                        </span>
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

                {/* Job Details */}
                {activeType === 'job' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        <span>{jobTitle}</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                        ⏱️ {jobEmploymentType}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">💰 Mshahara:</span>
                        <span className="text-white font-mono font-extrabold">
                          {jobIsSalaryNegotiable
                            ? 'Negotiable'
                            : jobShowSalary
                            ? `TSh ${jobSalaryMin.toLocaleString()} – ${jobSalaryMax.toLocaleString()}`
                            : 'Maelewano'}
                        </span>
                      </div>
                      {calculateDaysRemaining(jobDeadline) > 0 ? (
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                          ⏳ {calculateDaysRemaining(jobDeadline)} days remaining
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded">
                          🔴 Applications Closed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 italic whitespace-pre-line leading-relaxed">
                      “{jobDescription}”
                    </p>

                    {/* Requirements list */}
                    {jobRequirements.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Requirements:
                        </span>
                        <div className="space-y-1">
                          {jobRequirements.map((req, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                              <Check className="w-3 h-3 text-emerald-400 stroke-[3] shrink-0" />
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>📍 {jobLocation}</span>
                    </p>

                    <div className="flex items-center justify-between text-slate-400 text-xs pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1">❤️ 168</span>
                      <span className="flex items-center gap-1">💬 24</span>
                      <span className="flex items-center gap-1">📤 38</span>
                      <span className="flex items-center gap-1">🔖</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {jobActionButtons.apply && (
                        <div className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs text-center shadow-md shadow-emerald-500/25">
                          📄 Apply Now
                        </div>
                      )}
                      {jobActionButtons.chat && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Now
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Food Details */}
                {activeType === 'food' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-white flex items-center gap-1.5 truncate">
                          <span>🍔 {selectedFoodCategory}</span>
                        </h4>
                        <p className="text-[11px] text-amber-300 font-bold truncate">
                          Zebra Restaurant • {locationName || 'Masaki, Dar es Salaam'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30 shrink-0">
                        ⭐ 4.8 / 5.0
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                          {isSpecialOffer ? '🔥 OFA MAALUMU' : 'SPECIAL'}
                        </span>
                        <span className="text-amber-300 font-black font-mono text-sm">
                          TSh {foodOfferPrice.toLocaleString()}
                        </span>
                        <span className="line-through text-slate-500 font-mono text-[11px]">
                          TSh {foodRegularPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-amber-400 font-black text-[10px]">
                        {calculatedDiscountPercent}% OFF
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0F1426] border border-white/5">
                      <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                        {caption}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px] px-1">
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>{locationName || 'Dar es Salaam'}</span>
                      </span>
                      <span>Muda: {offerValidPeriod} mpaka {offerValidUntil}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {foodActionButtons.order && (
                        <div className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs text-center shadow-lg shadow-amber-500/25">
                          🍽️ Agiza Sasa
                        </div>
                      )}
                      {foodActionButtons.chat && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center border border-white/10">
                          💬 Chat Mgahawa
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

                {/* Giveaway Details Preview */}
                {activeType === 'giveaway' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>{giveawayTitle}</span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                        🏆 {giveawayWinnersCount} {giveawayWinnersCount === 1 ? 'WINNER' : 'WINNERS'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-amber-400 font-bold block text-[10px]">ZAWADI:</span>
                        <span className="text-white font-bold text-xs">{giveawayPrizes}</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-1 rounded">
                        ⏳ Mwisho: {giveawayDeadline}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic whitespace-pre-line">{caption}</p>

                    <div className="pt-1 flex items-center gap-2">
                      {giveawayActionButtons.enter && (
                        <div className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs text-center shadow-md shadow-amber-500/25">
                          🎁 Enter Giveaway
                        </div>
                      )}
                      {giveawayActionButtons.chat && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Now
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quiz Details Preview */}
                {activeType === 'quiz' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        🧠 {quizCategory}
                      </span>
                      <span className="text-[10px] text-teal-300 font-mono bg-teal-500/20 px-2 py-0.5 rounded">
                        ⏱️ {quizTimeSeconds}s • ⭐ +{quizPoints}pts
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-white">{quizQuestion}</h4>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {quizOptions.map((opt, i) => {
                        const isCorrect = quizCorrectIndex === i;
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                                : 'bg-white/5 border-white/5 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{['A', 'B', 'C', 'D'][i]}. {opt}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {quizActionButtons.play && (
                        <div className="flex-1 py-2 rounded-xl bg-teal-500 text-slate-950 font-black text-xs text-center">
                          🧠 Play Quiz
                        </div>
                      )}
                      {quizActionButtons.chat && (
                        <div className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Now
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Property Details Preview */}
                {activeType === 'property' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-cyan-400" />
                        <span>{propertyTitle}</span>
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                        propertyListingType === 'For Rent' ? 'bg-cyan-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {propertyListingType === 'For Rent' ? 'KUPANGA' : 'KUUZA'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-cyan-400 font-bold block text-[10px]">BEI:</span>
                        <span className="text-white font-mono font-black text-sm">
                          {propertyCurrency} {propertyPrice.toLocaleString()} {propertyListingType === 'For Rent' ? '/ mwezi' : ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{propertyLocation}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#141B30] text-center text-xs">
                      <div><span className="text-slate-400 text-[10px] block">Vyumba</span><strong className="text-white">🛏️ {propertyBeds}</strong></div>
                      <div><span className="text-slate-400 text-[10px] block">Vyoo</span><strong className="text-white">🚿 {propertyBaths}</strong></div>
                      <div><span className="text-slate-400 text-[10px] block">Parking</span><strong className="text-white">🚗 {propertyParking}</strong></div>
                      <div><span className="text-slate-400 text-[10px] block">Eneo</span><strong className="text-white">📐 {propertyArea}m²</strong></div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {propertyActionButtons.book && (
                        <div className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs text-center shadow-md shadow-cyan-500/25">
                          📅 Book Inspection
                        </div>
                      )}
                      {propertyActionButtons.chat && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Agent
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Space Details Preview */}
                {activeType === 'live' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-black flex items-center gap-1.5 border border-rose-500/30">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>{spaceScheduleType === 'now' ? '🔴 LIVE NOW' : `🗓️ ${spaceDate} ${spaceTime}`}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        👥 {spaceListenersCount.toLocaleString()} listening
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-pink-400" />
                      <span>{spaceTopic}</span>
                    </h4>

                    <p className="text-xs text-slate-300 italic">{spaceSubtitle}</p>
                    <p className="text-[11px] text-slate-400 font-mono">🎙️ {spaceSpeakers}</p>

                    <div className="pt-1 flex items-center gap-2">
                      {spaceActionButtons.join && (
                        <div className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs text-center shadow-md shadow-pink-500/25">
                          🎙️ Join Space
                        </div>
                      )}
                      {spaceActionButtons.remind && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          🔔 Reminder
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ad Campaign Details Preview */}
                {activeType === 'advertisement' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        <span>SPONSORED / TANGAZO RASMI</span>
                      </span>
                      <span className="text-[10px] text-slate-400">📍 {adTargetLocation}</span>
                    </div>

                    <h4 className="font-black text-sm text-white">{adHeadline}</h4>
                    <p className="text-xs text-slate-200">{adSubtitle}</p>

                    <div className="pt-1 flex items-center gap-2">
                      {adActionButtons.cta && (
                        <div className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs text-center shadow-md shadow-yellow-500/25">
                          {adCtaText}
                        </div>
                      )}
                      {adActionButtons.chat && (
                        <div className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center">
                          💬 Chat Now
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: PROCEED TO PREVIEW & SHAPE SELECTION */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Hakiki & Chagua Umbo la Story (Hatua 2/2) ➔</span>
          </button>
        </form>
      ) : (
        /* STEP 2: LIVE PREVIEW & 10 AVATAR SHAPES SELECTION STUDIO */
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 animate-in fade-in duration-200">
          {/* 1. Step 2 Explanatory Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-indigo-950/60 border border-cyan-500/30 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5 flex-wrap">
                  <span>Hatua 2 ya 2: Chagua Umbo la Story</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
                    10 Maumbo
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-1 sm:line-clamp-none">
                  Wewe na kila mtu mtakaoangalia stori hii mtaiona na umbo ulilolichagua hapa chini!
                </p>
              </div>
            </div>

            {/* Multi-story stacking preview toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-white/10 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPreviewStackMode('single')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  previewStackMode === 'single'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Stori 1 tu
              </button>
              <button
                type="button"
                onClick={() => setPreviewStackMode('multi')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  previewStackMode === 'multi'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ona mwonekano wa kadi zilizopishana (stacked depth) kama una stori zaidi ya 1"
              >
                Stacked (3)
              </button>
            </div>
          </div>

          {/* 2. Big Live Interactive Story Preview Hero Card */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col min-h-[350px]">
            {/* Background Image / Media */}
            <div className="absolute inset-0 z-0 bg-black">
              <SafeImage
                src={mediaUrl}
                fallbackGradient="from-cyan-900 via-slate-900 to-indigo-950"
                alt={caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-black/85" />
            </div>

            {/* Top Bar with Live Avatar in the Selected Shape */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DynamicAvatar
                  src={currentUser.photoURL || freshKkAvatar}
                  fallbackText={currentUser.displayName}
                  alt={currentUser.displayName}
                  size="story"
                  styleVariant={selectedAvatarStyle}
                  hasStory={true}
                  storyCount={previewStackMode === 'multi' ? 3 : 1}
                  showStoryBadge={previewStackMode === 'multi'}
                  ringGradient="from-cyan-400 via-blue-500 to-indigo-500"
                />
                <div>
                  <h4 className="font-black text-sm text-white drop-shadow flex items-center gap-1.5">
                    <span>
                      {activeType === 'food'
                        ? 'Zebra Restaurant'
                        : activeType === 'job'
                        ? jobCompanyName
                        : currentUser.displayName}
                    </span>
                    <span className="text-cyan-400 font-bold">✓</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 drop-shadow flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span>Sasa hivi (Just now)</span>
                    <span>•</span>
                    <span className="text-amber-300 font-medium">
                      📍 {activeType === 'job' ? jobLocation : locationName}
                    </span>
                  </p>
                </div>
              </div>

              {/* Active Shape Badge */}
              <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[10px] text-cyan-300 font-bold flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>
                  {AVATAR_STYLES_LIST.find((s) => s.id === selectedAvatarStyle)?.name || selectedAvatarStyle}
                </span>
              </div>
            </div>

            {/* Center / Bottom Content Preview */}
            <div className="relative z-10 mt-auto p-4 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 inline-block shadow-sm">
                {activeType === 'food'
                  ? '🍕 Food Special'
                  : activeType === 'job'
                  ? '💼 Job Vacancy'
                  : activeType === 'poll'
                  ? '📊 Interactive Poll'
                  : activeType === 'product'
                  ? '🛍️ Featured Product'
                  : activeType === 'event'
                  ? '🎪 Event Ticket'
                  : activeType === 'giveaway'
                  ? '🎁 Giveaway'
                  : activeType === 'quiz'
                  ? '❓ Quiz Challenge'
                  : activeType === 'property'
                  ? '🏠 Real Estate'
                  : activeType === 'live'
                  ? '🎙️ Live Audio Space'
                  : '📢 Tangazo'}
              </span>

              <p className="text-xs sm:text-sm text-white drop-shadow font-medium line-clamp-2 leading-relaxed whitespace-pre-line">
                {caption}
              </p>

              {/* Micro meta preview */}
              {activeType === 'food' && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                  <span>TSh {foodOfferPrice.toLocaleString()}</span>
                  <span className="line-through text-slate-400 text-[11px]">
                    TSh {foodRegularPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                    {calculatedDiscountPercent}% OFF
                  </span>
                </div>
              )}
              {activeType === 'poll' && (
                <div className="text-xs text-blue-300 font-bold">
                  📊 Swali: {pollQuestion || 'Leo tukatoke wapi?'}
                </div>
              )}
              {activeType === 'job' && (
                <div className="text-xs text-amber-300 font-bold">
                  💼 Nafasi: {jobTitle || 'Kazi'} • {jobCompanyName}
                </div>
              )}
            </div>
          </div>

          {/* 3. The 10 Avatar & Story Shapes Selection Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chagua Umbo Moja Kati ya Haya 10:</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-bold">
                Gusa kuona mara moja
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {AVATAR_STYLES_LIST.map((styleItem) => {
                const isSelected = selectedAvatarStyle === styleItem.id;
                return (
                  <button
                    key={styleItem.id}
                    type="button"
                    onClick={() => setSelectedAvatarStyle(styleItem.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 relative group focus:outline-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/70 via-[#0F1735] to-[#0A0F24] border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                        : 'bg-[#0B0F20] hover:bg-[#111733] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <DynamicAvatar
                        src={currentUser.photoURL || freshKkAvatar}
                        fallbackText={currentUser.displayName}
                        alt={styleItem.name}
                        size="md"
                        styleVariant={styleItem.id}
                        hasStory={true}
                        storyCount={previewStackMode === 'multi' ? 3 : 1}
                        showStoryBadge={previewStackMode === 'multi'}
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs text-white truncate">
                          {styleItem.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${styleItem.badgeColor}`}>
                          {styleItem.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-cyan-300 truncate">
                        {styleItem.swahiliTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight mt-0.5">
                        {styleItem.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                          : 'border-slate-600 bg-black/40 group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Action Buttons: [ ← Badili Taarifa ] & [ 🚀 Chapisha Story ] */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCreationStep('details')}
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Rudi Kwenye Taarifa</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitFinal}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>
                {submitting
                  ? 'Inachapisha Story...'
                  : `Chapisha Story na Umbo la ${
                      AVATAR_STYLES_LIST.find((s) => s.id === selectedAvatarStyle)?.name || selectedAvatarStyle
                    } 🚀`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};
