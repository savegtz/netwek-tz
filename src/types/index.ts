export type AccountType = 'personal' | 'creator' | 'business' | 'organization';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  accountType: AccountType;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
}

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'location'
  | 'contact'
  | 'gif'
  | 'sticker';

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
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  readBy?: string[];
  createdAt: string;
  deliveredAt?: string;
  editedAt?: string;
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
