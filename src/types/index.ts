export type AccountType = 'personal' | 'creator' | 'business' | 'organization';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  phone?: string;
  phoneNumber?: string;
  accountType: AccountType;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
  isSuspended?: boolean;
  isBanned?: boolean;
  walletBalance?: number;
  role?: 'user' | 'admin' | 'superadmin';
}

export const PRIMARY_ADMIN_EMAIL = 'savegamour@gmail.com';

/**
 * Strict single-admin check: Admin anatakiwa kuwa mmoja tu (savegamour@gmail.com)
 */
export const isUserAdmin = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  if (user.id === 'guest') return false;
  const email = (user.email || '').trim().toLowerCase();
  if (email === PRIMARY_ADMIN_EMAIL.toLowerCase()) return true;
  if (user.role === 'superadmin' && user.id === 'current_user_id') return true;
  return false;
};

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'location'
  | 'contact'
  | 'gif'
  | 'sticker'
  | 'invoice'
  | 'payment_receipt'
  | 'video_note'
  | 'poll'
  | 'tip_gift'
  | 'view_once_media';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // userIds
}

export interface PollDetails {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  isClosed?: boolean;
}

export interface TipDetails {
  id: string;
  amount: number;
  currency: string;
  note?: string;
  senderName: string;
  receiverName: string;
  isOpened?: boolean;
  openedAt?: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  title: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate?: string;
  paidAt?: string;
  paymentMethod?: string;
  paidBy?: string;
  acceptedMethods?: string[];
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CustomerInternalNote {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface CustomerCrmProfile {
  customerId: string;
  customerName: string;
  phone?: string;
  email?: string;
  location?: string;
  joinedDate?: string;
  totalSpent?: number;
  currency?: string;
  tags: string[];
  internalNotes: CustomerInternalNote[];
  ticketStatus: TicketStatus;
  ticketPriority: TicketPriority;
  ticketId?: string;
  assignedAgentName?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId?: string;
  text: string;
  messageType: MessageType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: string;
  invoiceDetails?: InvoiceDetails;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  readBy?: string[];
  createdAt: string;
  editedAt?: string;
  isEdited?: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  transcription?: string;
  audioDuration?: string;
  isTranscribing?: boolean;
  disappearingTimer?: string;
  isViewOnce?: boolean;
  isViewedOnce?: boolean;
  pollDetails?: PollDetails;
  tipDetails?: TipDetails;
  isSilent?: boolean;
  scheduledFor?: string;
  translation?: {
    originalText: string;
    translatedText: string;
    targetLang: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails?: Record<string, { displayName: string; photoURL?: string; username?: string; isOnline?: boolean }>;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageType?: MessageType;
  updatedAt: string;
  unreadCount?: number;
  isArchived?: boolean;
  mutedUntil?: '8h' | '1w' | 'always' | null;
  isPinned?: boolean;
  isFavorite?: boolean;
  lists?: string[];
  isBlocked?: boolean;
  isLocked?: boolean;
}

export type StatusType =
  | 'photo'
  | 'video'
  | 'text'
  | 'voice'
  | 'link'
  | 'gif'
  | 'sticker'
  | 'music'
  | 'location'
  | 'product'
  | 'food'
  | 'business'
  | 'event'
  | 'ride'
  | 'property'
  | 'job'
  | 'advertisement'
  | 'poll'
  | 'quiz'
  | 'giveaway'
  | 'live'
  | 'paid'
  | 'premium'
  | 'tip'
  | 'promoted'
  | 'sponsored'
  | 'question'
  | 'challenge'
  | 'ai_generated';

export interface StatusItem {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorPhoto?: string;
  type: StatusType;
  mediaUrl?: string;
  text?: string;
  location?: string;
  visibility: 'public' | 'contacts' | 'close_friends';
  viewers?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  expiresAt: string;
  metadata?: {
    pollQuestion?: string;
    pollOptions?: { id: string; text: string; votes: number }[];
    pollSettings?: { allowMultiple?: boolean; anonymous?: boolean; duration?: string };
    quizQuestion?: string;
    quizOptions?: string[];
    quizCorrectIndex?: number;
    price?: number;
    currency?: string;
    linkUrl?: string;
    linkTitle?: string;
    ticketUrl?: string;
    audioUrl?: string;
    trackTitle?: string;
    discount?: string;

    // Food Story & Ordering
    foodName?: string;
    restaurantName?: string;
    regularPrice?: number;
    offerPrice?: number;
    rating?: number;
    ratingBreakdown?: {
      taste: number;
      presentation: number;
      service: number;
      value: number;
    };
    specialOfferLabel?: string;
    validUntil?: string;
    actionButtons?: (
      | 'order_now'
      | 'chat_now'
      | 'buy_now'
      | 'get_ticket'
      | 'join_ride'
      | 'apply_now'
      | 'join_giveaway'
      | 'submit_quiz'
      | 'property_details'
      | 'join_live_space'
      | 'run_ad'
    )[];

    // Job Story
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    salaryMin?: number;
    salaryMax?: number;
    isSalaryNegotiable?: boolean;
    showSalary?: boolean;
    employmentType?: 'Full Time' | 'Part Time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance';
    locationType?: 'On-site' | 'Remote' | 'Hybrid';
    requirements?: string[];
    deadlineDate?: string;
    daysRemaining?: number;
    isClosed?: boolean;

    // Giveaway Story
    giveawayTitle?: string;
    giveawayPrizes?: string;
    entrySteps?: string[];
    winnersCount?: number;
    bannerTag?: string;
    giveawayDeadline?: string;
    participantsCount?: number;

    // Quiz Story
    quizCategory?: string;
    quizTimeSeconds?: number;
    quizPoints?: number;

    // Property Story
    propertyType?: 'For Sale' | 'For Rent';
    propertyTitle?: string;
    propertyLocation?: string;
    propertyPrice?: number;
    propertyCurrency?: string;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    areaSqMeters?: number;
    propertyImages?: string[];

    // Live Space Story
    spaceTitle?: string;
    spaceTopic?: string;
    spaceSubtitle?: string;
    spaceDate?: string;
    spaceTime?: string;
    listenersCount?: number;
    hostName?: string;
    hostAvatar?: string;
    guests?: { name: string; role: string; avatar: string }[];
    isLiveNow?: boolean;

    // Ad Campaign Story
    adHeadline?: string;
    adSubtitle?: string;
    adBulletPoints?: string[];
    adCallToAction?: string;
    adBadge?: string;
    adTargetUrl?: string;
    sponsorName?: string;

    // Product Story
    productName?: string;
    productCategory?: string;
    salePrice?: number;
    discountBadge?: string;
    stockRemaining?: number;
    variants?: {
      sizes?: string[];
      colors?: string[];
      storages?: string[];
    };

    // Event Story
    eventName?: string;
    eventDate?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    isRecurring?: boolean;
    ticketTiers?: {
      name: string;
      price: number;
      color?: string;
    }[];
    capacity?: number;
    ticketsSold?: number;
    lineup?: string[];

    // Ride Story
    vehicleType?: string;
    numberPlate?: string;
    vehicleColor?: string;
    pickupLocation?: string;
    destination?: string;
    distanceKm?: number;
    departureTime?: string;
    availableSeats?: number;
    contributionPerPerson?: number;
    isFreeRide?: boolean;
    driverRating?: number;
    driverRidesCount?: number;
  };
}

export interface ProductItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
  category: 'Electronics' | 'Fashion' | 'Home' | 'Beauty' | 'Sports' | 'Other';
  location?: string;
  rating: number;
  reviewsCount: number;
  status: 'active' | 'sold_out' | 'draft';
  createdAt: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  buyerId: string;
  sellerId: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
  totalAmount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  deliveryAddress: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  bannerUrl: string;
  date: string;
  time: string;
  location: string;
  generalAdmissionPrice: number;
  vipPrice: number;
  currency: string;
  categories: string[];
  attendeesCount?: number;
  createdAt: string;
}

export interface JobItem {
  id: string;
  posterId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Remote' | 'Contract';
  salaryRange: string;
  currency: string;
  description: string;
  requirements?: string[];
  tags: string[];
  createdAt: string;
  applicantsCount?: number;
}

export interface RideOption {
  tier: 'Economy' | 'Comfort' | 'XL';
  name: string;
  seats: string;
  etaMinutes: number;
  price: number;
  currency: string;
  icon: string;
}

export interface CommunityItem {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  category: string;
  membersCount: number;
  createdBy: string;
  rules?: string[];
  isJoined?: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'receive' | 'send' | 'purchase' | 'airtime' | 'withdraw';
  amount: number;
  currency: string;
  title: string;
  counterparty?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'message'
    | 'reaction'
    | 'follow'
    | 'comment'
    | 'status'
    | 'order'
    | 'event'
    | 'job'
    | 'system';
  read: boolean;
  avatar?: string;
  createdAt: string;
}

export interface CallSession {
  id: string;
  remoteUserName: string;
  remoteUserAvatar: string;
  type: 'video' | 'voice';
  duration: number;
  status: 'connecting' | 'connected' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
}
