import { StatusItem } from '../../types';

export interface BusinessPromotionRecord {
  id: string;
  statusId: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorPhoto?: string;
  mediaUrl?: string;
  text?: string;
  type: string;
  plan: 'standard_24h' | 'boost_3d' | 'sponsor_7d';
  amount: number;
  paymentMethod: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa' | 'Wallet';
  phoneNumber: string;
  transactionRef: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  reviewedBy?: string;
}

const STORAGE_KEY_PROMOTIONS = 'zenia_business_status_promotions_v1';
const STORAGE_KEY_VERIFIED_AUTHORS = 'zenia_verified_business_authors_v1';
const EVENT_BUSINESS_STATUS_UPDATED = 'zenia_business_status_updated';

// Cross-tab broadcast channel for immediate multi-window syncing
const businessBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('zenia_business_status_channel')
    : null;

// Initial verified businesses (e.g. established brands)
const DEFAULT_VERIFIED_AUTHORS: string[] = [
  'zebra_restaurant',
  'fresh_store_dar',
  'dar_food_fest',
  'travelvibes',
  'explore_af',
  'vodacom_tz',
];

// Initial mock promotions for admin demonstration
const DEFAULT_PROMOTIONS: BusinessPromotionRecord[] = [
  {
    id: 'promo_zebra_01',
    statusId: 'status_card_zebra_food',
    authorId: 'zebra_restaurant',
    authorName: 'Zebra Restaurant',
    authorUsername: 'zebra_restaurant',
    authorPhoto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80',
    text: '🔥 Chicken Burger Deluxe yetu maarufu imerejea! Masaki Dar es Salaam.',
    type: 'food',
    plan: 'boost_3d',
    amount: 15000,
    paymentMethod: 'M-Pesa',
    phoneNumber: '0754123456',
    transactionRef: 'MP2610178829',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    reviewedBy: 'savegamour@gmail.com',
  },
  {
    id: 'promo_kuku_grill_02',
    statusId: 'status_kuku_grill_promo',
    authorId: 'user_kookoos_grill',
    authorName: 'Kookoos Grill Masaki',
    authorUsername: 'kookoos_grill',
    authorPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1200&auto=format&fit=crop&q=80',
    text: '🍗 Flame Grilled BBQ Chicken nusu na nzima kwa bei ya punguzo leo Masaki!',
    type: 'food',
    plan: 'standard_24h',
    amount: 5000,
    paymentMethod: 'Tigo Pesa',
    phoneNumber: '0712987654',
    transactionRef: 'TG991048201',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'promo_dar_events_03',
    statusId: 'status_card_dar_concert',
    authorId: 'events_dar',
    authorName: 'Dar Events',
    authorUsername: 'dar_events',
    authorPhoto: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    text: 'Usiku wa Burudani Mlimani City Hall! Tiketi za VIP zinapatikana.',
    type: 'event',
    plan: 'sponsor_7d',
    amount: 25000,
    paymentMethod: 'M-Pesa',
    phoneNumber: '0765998877',
    transactionRef: 'MP2610173301',
    status: 'pending',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

class BusinessStatusServiceImpl {
  private listeners: Set<() => void> = new Set();
  private promotions: BusinessPromotionRecord[] = [];
  private verifiedAuthors: Set<string> = new Set();

  constructor() {
    this.promotions = this.loadPromotions();
    this.verifiedAuthors = this.loadVerifiedAuthors();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_PROMOTIONS || e.key === STORAGE_KEY_VERIFIED_AUTHORS) {
          this.promotions = this.loadPromotions();
          this.verifiedAuthors = this.loadVerifiedAuthors();
          this.notifyListeners();
        }
      });

      if (businessBroadcast) {
        businessBroadcast.addEventListener('message', () => {
          this.promotions = this.loadPromotions();
          this.verifiedAuthors = this.loadVerifiedAuthors();
          this.notifyListeners();
        });
      }

      window.addEventListener(EVENT_BUSINESS_STATUS_UPDATED, () => {
        this.promotions = this.loadPromotions();
        this.verifiedAuthors = this.loadVerifiedAuthors();
        this.notifyListeners();
      });
    }
  }

  private loadPromotions(): BusinessPromotionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROMOTIONS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return DEFAULT_PROMOTIONS;
  }

  private savePromotions() {
    try {
      localStorage.setItem(STORAGE_KEY_PROMOTIONS, JSON.stringify(this.promotions));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(EVENT_BUSINESS_STATUS_UPDATED));
        businessBroadcast?.postMessage({ type: 'UPDATE' });
      }
    } catch (e) {
      console.warn('Failed to save promotions:', e);
    }
  }

  private loadVerifiedAuthors(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VERIFIED_AUTHORS);
      if (raw) {
        const arr = JSON.parse(raw);
        return new Set(arr);
      }
    } catch {}
    return new Set(DEFAULT_VERIFIED_AUTHORS);
  }

  private saveVerifiedAuthors() {
    try {
      localStorage.setItem(
        STORAGE_KEY_VERIFIED_AUTHORS,
        JSON.stringify(Array.from(this.verifiedAuthors))
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(EVENT_BUSINESS_STATUS_UPDATED));
        businessBroadcast?.postMessage({ type: 'UPDATE' });
      }
    } catch (e) {
      console.warn('Failed to save verified authors:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error(err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getPromotions(): BusinessPromotionRecord[] {
    return [...this.promotions];
  }

  public getPendingPromotions(): BusinessPromotionRecord[] {
    return this.promotions.filter((p) => p.status === 'pending');
  }

  public isAuthorVerifiedBusiness(authorId?: string): boolean {
    if (!authorId) return false;
    return this.verifiedAuthors.has(authorId);
  }

  public setAuthorVerifiedBusiness(authorId: string, verified: boolean): void {
    if (!authorId) return;
    if (verified) {
      this.verifiedAuthors.add(authorId);
    } else {
      this.verifiedAuthors.delete(authorId);
    }
    this.saveVerifiedAuthors();
    this.notifyListeners();
  }

  /**
   * Core rule requested by user:
   * "Kurasa zilizothibitishwa za kibiashara yani nataka mtu alipie ili waone watuwote Status yake
   * kama hajalipia admin haja komfemu basi Status yake waone marafikizaketu"
   *
   * Returns TRUE only if:
   * 1. Status is explicitly marked isPaidBusiness === true AND adminApproved === true
   * 2. OR the author is an approved verified business in the verified registry
   * 3. OR there is an approved promotion record for this status
   *
   * Otherwise returns FALSE (which means it's restricted to friends only!).
   */
  public isStatusApprovedForPublic(status?: {
    id?: string;
    authorId?: string;
    isPaidBusiness?: boolean;
    adminApproved?: boolean;
    boostStatus?: string;
  }): boolean {
    if (!status) return false;

    // Direct property check
    if (status.isPaidBusiness && status.adminApproved) {
      return true;
    }

    // Check author verification
    if (status.authorId && this.isAuthorVerifiedBusiness(status.authorId)) {
      return true;
    }

    // Check promotion records
    if (status.id) {
      const promo = this.promotions.find((p) => p.statusId === status.id);
      if (promo && promo.status === 'approved') {
        return true;
      }
    }

    return false;
  }

  /**
   * Submit a new paid business status promotion
   */
  public requestBusinessPromotion(data: {
    statusId: string;
    authorId: string;
    authorName: string;
    authorUsername?: string;
    authorPhoto?: string;
    mediaUrl?: string;
    text?: string;
    type: string;
    plan: 'standard_24h' | 'boost_3d' | 'sponsor_7d';
    amount: number;
    paymentMethod: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa' | 'Wallet';
    phoneNumber: string;
    transactionRef?: string;
  }): BusinessPromotionRecord {
    const record: BusinessPromotionRecord = {
      ...data,
      id: `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      transactionRef:
        data.transactionRef ||
        `ZN${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.promotions.unshift(record);
    this.savePromotions();
    this.notifyListeners();
    return record;
  }

  /**
   * Admin confirms / approves a paid business status promotion ("komfemu")
   */
  public approvePromotion(promotionId: string, reviewedBy: string = 'savegamour@gmail.com'): boolean {
    const promo = this.promotions.find((p) => p.id === promotionId);
    if (!promo) return false;

    promo.status = 'approved';
    promo.approvedAt = new Date().toISOString();
    promo.reviewedBy = reviewedBy;

    // Also auto-verify the author if needed
    if (promo.authorId) {
      this.verifiedAuthors.add(promo.authorId);
      this.saveVerifiedAuthors();
    }

    this.savePromotions();
    this.notifyListeners();
    return true;
  }

  /**
   * Admin rejects or revokes approval
   */
  public rejectPromotion(promotionId: string): boolean {
    const promo = this.promotions.find((p) => p.id === promotionId);
    if (!promo) return false;

    promo.status = 'rejected';
    this.savePromotions();
    this.notifyListeners();
    return true;
  }

  public deletePromotion(promotionId: string): boolean {
    const index = this.promotions.findIndex((p) => p.id === promotionId);
    if (index === -1) return false;

    this.promotions.splice(index, 1);
    this.savePromotions();
    this.notifyListeners();
    return true;
  }
}

export const businessStatusService = new BusinessStatusServiceImpl();
