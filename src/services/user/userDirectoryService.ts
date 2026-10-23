import { collection, doc, onSnapshot, getDocs, setDoc, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../../types';
import { userService } from './userService';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';

/**
 * Known Firebase Auth Users from the Firebase Authentication Console.
 * These ensure that accounts registered in Firebase Auth have corresponding
 * Firestore profiles so they appear in global search, contacts, and admin panels.
 */
export const FIREBASE_AUTH_USERS_SEEDS: UserProfile[] = [
  {
    id: 'FCXkMkn1moZ5Vd8SR1IZuXJL',
    email: 'amytzee6676767@gmail.com',
    displayName: 'Amytzee 667',
    username: 'amytzee667',
    bio: 'Mwanachama wa Zenia Network 🌟',
    accountType: 'personal',
    verified: true,
    followersCount: 15,
    followingCount: 30,
    postsCount: 2,
    isOnline: false,
    lastSeen: 'Masaa 3 yaliyopita',
    walletBalance: 25000,
    role: 'user',
  },
  {
    id: '3eysSI6sDmNNCfvkoZAuN7C',
    email: 'truckingalhushoom@gmail.com',
    displayName: 'Al-Hushoom Trucking',
    username: 'alhushoom_trucking',
    bio: 'Usafirishaji wa Mizigo na Malori | Dar es Salaam & Mikoani 🚛',
    accountType: 'business',
    verified: true,
    followersCount: 140,
    followingCount: 45,
    postsCount: 12,
    isOnline: false,
    lastSeen: '1h ago',
    walletBalance: 350000,
    role: 'user',
  },
  {
    id: 'PW9XSmSsmDhVnOmtBH82D',
    email: 'amytzee22@gmail.com',
    displayName: 'Amytzee 22',
    username: 'amytzee22',
    bio: 'Zenia Explorer • Karibu kwenye DM zangu 👋',
    accountType: 'personal',
    verified: false,
    followersCount: 28,
    followingCount: 60,
    postsCount: 5,
    isOnline: false,
    lastSeen: 'Masaa 5 yaliyopita',
    walletBalance: 10000,
    role: 'user',
  },
  {
    id: 'UkgR7gl8afU92vg6OCT3wHhA',
    email: 'savegamour@gmail.com',
    displayName: 'Amina Kaunga (Admin)',
    username: 'savegamour',
    photoURL: aminaAvatar,
    bio: 'Msimamizi Mkuu (Super Admin) wa Zenia Network • Zenia Support 👑',
    accountType: 'creator',
    verified: true,
    followersCount: 12400,
    followingCount: 245,
    postsCount: 3200,
    isOnline: false,
    lastSeen: 'Muda mfupi uliopita',
    walletBalance: 500000,
    role: 'superadmin',
  },
  {
    id: 'DCgeroYuKbyI5TIXF8CtorSS',
    email: 'savegamourmteja@gmail.com',
    displayName: 'Savegamour Mteja',
    username: 'savegamour_mteja',
    bio: 'Mteja Rasmi wa Huduma na Bidhaa Zenia 🛍️',
    accountType: 'personal',
    verified: true,
    followersCount: 42,
    followingCount: 88,
    postsCount: 8,
    isOnline: false,
    lastSeen: 'Masaa 4 yaliyopita',
    walletBalance: 85000,
    role: 'user',
  },
  {
    id: 'opTSMQtbAbW7KIwuSWeKuV',
    email: 'amytzee2@gmail.com',
    displayName: 'Amytzee Two',
    username: 'amytzee_2',
    bio: 'Teknolojia, Muziki na Mawasiliano 🎶',
    accountType: 'personal',
    verified: false,
    followersCount: 19,
    followingCount: 34,
    postsCount: 3,
    isOnline: false,
    lastSeen: 'Jana',
    walletBalance: 5000,
    role: 'user',
  },
  {
    id: 'LL4mqnX1IAPtey9eXPDxRLKO',
    email: 'savegamour22@gmail.com',
    displayName: 'Savegamour 22',
    username: 'savegamour22',
    bio: 'Zenia Community Member • Dar es Salaam 🇹🇿',
    accountType: 'personal',
    verified: true,
    followersCount: 65,
    followingCount: 110,
    postsCount: 14,
    isOnline: false,
    lastSeen: 'Masaa 2 yaliyopita',
    walletBalance: 40000,
    role: 'user',
  },
  {
    id: '7w6ldhpczBOVpimURqrpQ3C',
    email: 'amytzee@gmail.com',
    displayName: 'Amytzee Main',
    username: 'amytzee',
    bio: 'Mjasiriamali & Mtumiaji wa Huduma za Zenia 🌟',
    accountType: 'creator',
    verified: true,
    followersCount: 310,
    followingCount: 150,
    postsCount: 22,
    isOnline: false,
    lastSeen: 'Masaa 6 yaliyopita',
    walletBalance: 120000,
    role: 'user',
  },
  // Also include the original demo profiles so they have real Firestore presence
  {
    id: 'user_fresh_kk',
    email: 'fresh.kk@zenia.app',
    displayName: 'Fresh kk',
    username: 'fresh_kk',
    photoURL: freshKkAvatar,
    bio: 'Muuzaji wa Vifaa vya Kielektroniki | Kariakoo, Dar es Salaam 📱',
    accountType: 'business',
    verified: true,
    followersCount: 18400,
    followingCount: 310,
    postsCount: 420,
    isOnline: false,
    lastSeen: 'Dakika 45 zilizopita',
    walletBalance: 485000,
    role: 'user',
  },
  {
    id: 'user_sarah_m',
    email: 'sarah@soundwave.tz',
    displayName: 'Sarah Mwangi',
    username: 'sarah_m',
    photoURL: '/assets/images/sarah_avatar_1790802224123.jpg',
    bio: 'Mjasiriamali & Mbunifu wa Mitindo | Dar es Salaam ✨',
    accountType: 'creator',
    verified: true,
    followersCount: 8900,
    followingCount: 412,
    postsCount: 310,
    isOnline: false,
    lastSeen: 'Masaa 2 yaliyopita',
    walletBalance: 125000,
    role: 'user',
  },
  {
    id: 'user_alex_k',
    email: 'alex.kanyama@zenia.app',
    displayName: 'Alex Kanyama',
    username: 'alex_k',
    photoURL: '/assets/images/alex_avatar_1790802235334.jpg',
    bio: 'Mhandisi wa Programu & Tech Enthusiast 💻',
    accountType: 'personal',
    verified: false,
    followersCount: 890,
    followingCount: 140,
    postsCount: 45,
    isOnline: false,
    lastSeen: '2h ago',
    walletBalance: 15000,
    role: 'user',
  },
  {
    id: 'user_juma_rashid',
    email: 'juma.rashid@zenia.app',
    displayName: 'Juma Rashid',
    username: 'juma_r',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Dereva wa Zenia Ride & Courier | Huduma ya Haraka 🚗',
    accountType: 'personal',
    verified: true,
    followersCount: 430,
    followingCount: 85,
    postsCount: 18,
    isOnline: false,
    lastSeen: 'Jana',
    walletBalance: 92000,
    role: 'user',
  },
];

class UserDirectoryServiceImpl {
  private users: UserProfile[] = [];
  private listeners: Set<(users: UserProfile[]) => void> = new Set();
  private hasInitialized = false;
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.init();
  }

  public async init() {
    if (this.hasInitialized) return;
    this.hasInitialized = true;

    // Load from local storage cache initially
    try {
      const cached = localStorage.getItem('zenia_firestore_users_cache');
      if (cached) {
        const parsed = JSON.parse(cached) as UserProfile[];
        this.users = parsed.map((u) => ({
          ...u,
          isOnline:
            u.isOnline === true &&
            typeof u.lastActiveAt === 'number' &&
            Date.now() - u.lastActiveAt < 3 * 60 * 1000,
        }));
        this.notifyListeners();
      }
    } catch (_) {}

    // Attach real-time Firestore listener to 'users' collection
    try {
      const usersCol = collection(db, 'users');
      this.unsubscribeFirestore = onSnapshot(
        usersCol,
        async (snapshot) => {
          if (!snapshot.empty) {
            const firestoreUsers: UserProfile[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as UserProfile;
              // User is genuinely online ONLY if they sent an active heartbeat within 3 minutes
              const isActuallyOnline =
                data.isOnline === true &&
                typeof data.lastActiveAt === 'number' &&
                Date.now() - data.lastActiveAt < 3 * 60 * 1000;

              firestoreUsers.push({
                ...data,
                id: docSnap.id,
                isOnline: isActuallyOnline,
                lastSeen: isActuallyOnline
                  ? 'Sasa hivi'
                  : data.lastSeen && data.lastSeen !== 'Sasa hivi'
                  ? data.lastSeen
                  : 'Muda mfupi uliopita',
              });
            });

            // Merge with seeded users if any are missing from Firestore
            const combinedMap = new Map<string, UserProfile>();
            
            // First put the seed users
            FIREBASE_AUTH_USERS_SEEDS.forEach((u) => {
              combinedMap.set(u.email.toLowerCase(), u);
            });

            // Override / enrich with real Firestore data
            firestoreUsers.forEach((u) => {
              if (u.email) {
                combinedMap.set(u.email.toLowerCase(), u);
              } else {
                combinedMap.set(u.id, u);
              }
            });

            this.users = Array.from(combinedMap.values()).filter(
              (u) => !userService.isUserDeleted(u)
            );

            try {
              localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
            } catch (_) {}

            this.notifyListeners();
          } else {
            // Firestore collection is currently empty; seed it automatically!
            await this.seedInitialUsersToFirestore();
          }
        },
        async (error) => {
          console.warn('Firestore users collection listener notice:', error);
          // Fallback to seeds if offline or permissions issue
          if (this.users.length === 0) {
            this.users = FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u));
            this.notifyListeners();
          }
        }
      );
    } catch (e) {
      console.warn('Failed to attach Firestore users listener:', e);
      if (this.users.length === 0) {
        this.users = FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u));
        this.notifyListeners();
      }
    }
  }

  /**
   * Seeds the known Firebase Auth users and initial contacts into Cloud Firestore
   */
  public async seedInitialUsersToFirestore() {
    try {
      for (const u of FIREBASE_AUTH_USERS_SEEDS) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }
      this.users = FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u));
      this.notifyListeners();
    } catch (e) {
      console.warn('Notice seeding users to Firestore:', e);
      this.users = FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u));
      this.notifyListeners();
    }
  }

  /**
   * Returns all active users
   */
  public getAllUsers(): UserProfile[] {
    if (this.users.length === 0) {
      return FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u));
    }
    return this.users.filter((u) => !userService.isUserDeleted(u));
  }

  /**
   * Search users by display name, username, or email
   */
  public searchUsers(queryStr: string, currentUserId?: string): UserProfile[] {
    const q = queryStr.trim().toLowerCase();
    if (!q) return [];

    const all = this.getAllUsers();
    return all.filter((u) => {
      if (userService.isUserDeleted(u)) return false;
      if (currentUserId && (u.id === currentUserId || u.email?.toLowerCase() === currentUserId.toLowerCase())) {
        return false;
      }
      const matchName = (u.displayName || '').toLowerCase().includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchBio = (u.bio || '').toLowerCase().includes(q);

      return matchName || matchUsername || matchEmail || matchBio;
    });
  }

  /**
   * Subscribe to real-time changes in users
   */
  public subscribe(callback: (users: UserProfile[]) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current users
    callback(this.getAllUsers());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const active = this.getAllUsers();
    this.listeners.forEach((cb) => {
      try {
        cb(active);
      } catch (err) {
        console.error('Error in userDirectory listener:', err);
      }
    });
  }

  public cleanup() {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    this.listeners.clear();
  }
}

export const userDirectoryService = new UserDirectoryServiceImpl();
export { isUserOnline, formatUserLastSeen, presenceService } from './presenceService';
