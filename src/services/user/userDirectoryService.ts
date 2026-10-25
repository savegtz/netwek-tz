import { collection, doc, onSnapshot, getDocs, setDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../../types';
import { userService } from './userService';
import { normalizeUserId } from './friendshipService';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';

/**
 * Intelligent User Deduplication:
 * Prevents multiple registrations, dual accounts, and conflicting IDs for the same person
 * by merging entries sharing the same email, normalized username, or normalized ID.
 */
export function deduplicateUsers(users: UserProfile[]): UserProfile[] {
  if (!Array.isArray(users)) return [];

  const result: UserProfile[] = [];

  for (const user of users) {
    if (!user || userService.isUserDeleted(user)) continue;

    const emailKey = user.email ? user.email.trim().toLowerCase() : '';
    const usernameKey = user.username
      ? user.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : '';
    const normId = normalizeUserId(user.id);

    // Look for existing profile matching this user
    const existingIndex = result.findIndex((existing) => {
      // 1. Email match (most authoritative)
      if (emailKey && existing.email && existing.email.trim().toLowerCase() === emailKey) {
        return true;
      }
      // 2. Normalized User ID match
      if (normId && normalizeUserId(existing.id) === normId) {
        return true;
      }
      // 3. Normalized Username match
      if (usernameKey && existing.username && existing.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') === usernameKey) {
        return true;
      }
      return false;
    });

    if (existingIndex >= 0) {
      // Merge: retain the richer/authoritative record
      const prev = result[existingIndex];
      const isCurrentBetter =
        (user.role === 'superadmin' && prev.role !== 'superadmin') ||
        (user.verified && !prev.verified) ||
        (!user.id.startsWith('user_') && prev.id.startsWith('user_')) ||
        (user.id.length > 20 && prev.id === 'current_user_id') ||
        ((user.walletBalance || 0) > (prev.walletBalance || 0)) ||
        ((user.followersCount || 0) > (prev.followersCount || 0));

      result[existingIndex] = {
        ...(isCurrentBetter ? prev : user),
        ...(isCurrentBetter ? user : prev),
        // Preserve rich assets
        photoURL: user.photoURL || prev.photoURL,
        bio: (user.bio && user.bio.length > (prev.bio || '').length) ? user.bio : prev.bio || user.bio,
        walletBalance: Math.max(user.walletBalance || 0, prev.walletBalance || 0),
        followersCount: Math.max(user.followersCount || 0, prev.followersCount || 0),
        postsCount: Math.max(user.postsCount || 0, prev.postsCount || 0),
        verified: Boolean(user.verified || prev.verified),
        role:
          user.role === 'superadmin' || prev.role === 'superadmin'
            ? 'superadmin'
            : user.role === 'admin' || prev.role === 'admin'
            ? 'admin'
            : 'user',
        isOnline: Boolean(user.isOnline || prev.isOnline),
        lastSeen: user.isOnline ? 'Sasa hivi' : user.lastSeen || prev.lastSeen,
      };
    } else {
      result.push(user);
    }
  }

  return result;
}

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
    displayName: 'Amytzee (Admin)',
    username: 'amytzee',
    bio: 'Msimamizi Mkuu (Super Admin) wa Zenia Network 🛡️👑',
    accountType: 'creator',
    verified: true,
    followersCount: 15400,
    followingCount: 150,
    postsCount: 52,
    isOnline: false,
    lastSeen: 'Muda mfupi uliopita',
    walletBalance: 500000,
    role: 'superadmin',
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

            this.users = deduplicateUsers(
              Array.from(combinedMap.values()).filter((u) => !userService.isUserDeleted(u))
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
            this.users = deduplicateUsers(
              FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u))
            );
            this.notifyListeners();
          }
        }
      );
    } catch (e) {
      console.warn('Failed to attach Firestore users listener:', e);
      if (this.users.length === 0) {
        this.users = deduplicateUsers(
          FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u))
        );
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
      this.users = deduplicateUsers(
        FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u))
      );
      this.notifyListeners();
    } catch (e) {
      console.warn('Notice seeding users to Firestore:', e);
      this.users = deduplicateUsers(
        FIREBASE_AUTH_USERS_SEEDS.filter((u) => !userService.isUserDeleted(u))
      );
      this.notifyListeners();
    }
  }

  /**
   * Cleans up duplicate users from Cloud Firestore and local storage.
   * Finds documents with matching emails or usernames, retains the primary authoritative account,
   * and deletes redundant duplicate documents from Firestore.
   */
  public async cleanDuplicateUsersFromFirestore(): Promise<{ cleanedCount: number; deletedIds: string[] }> {
    const deletedIds: string[] = [];
    try {
      const snap = await getDocs(collection(db, 'users'));
      const allDocs: { id: string; data: UserProfile }[] = [];
      snap.forEach((d) => {
        allDocs.push({ id: d.id, data: d.data() as UserProfile });
      });

      const emailMap = new Map<string, { id: string; data: UserProfile }[]>();
      const usernameMap = new Map<string, { id: string; data: UserProfile }[]>();

      allDocs.forEach((item) => {
        const email = (item.data.email || '').trim().toLowerCase();
        if (email) {
          if (!emailMap.has(email)) emailMap.set(email, []);
          emailMap.get(email)!.push(item);
        }
        const uname = (item.data.username || '').trim().toLowerCase();
        if (uname) {
          if (!usernameMap.has(uname)) usernameMap.set(uname, []);
          usernameMap.get(uname)!.push(item);
        }
      });

      const idsToDelete = new Set<string>();

      const checkGroup = (group: { id: string; data: UserProfile }[]) => {
        if (group.length <= 1) return;
        // Sort: best account first
        group.sort((a, b) => {
          if (a.data.role === 'superadmin' && b.data.role !== 'superadmin') return -1;
          if (b.data.role === 'superadmin' && a.data.role !== 'superadmin') return 1;
          if (a.data.verified && !b.data.verified) return -1;
          if (b.data.verified && !a.data.verified) return 1;
          const aIsUid = !a.id.startsWith('user_') && a.id !== 'current_user_id';
          const bIsUid = !b.id.startsWith('user_') && b.id !== 'current_user_id';
          if (aIsUid && !bIsUid) return -1;
          if (bIsUid && !aIsUid) return 1;
          return (b.data.walletBalance || 0) - (a.data.walletBalance || 0);
        });

        // The first one is authoritative; all others are deleted
        for (let i = 1; i < group.length; i++) {
          idsToDelete.add(group[i].id);
        }
      };

      emailMap.forEach(checkGroup);
      usernameMap.forEach(checkGroup);

      // Perform deletions in Firestore
      for (const id of idsToDelete) {
        try {
          await deleteDoc(doc(db, 'users', id));
          deletedIds.push(id);
        } catch (delErr) {
          console.warn('Could not delete duplicate user doc from Firestore:', id, delErr);
        }
      }

      // Refresh local directory state
      this.users = deduplicateUsers(this.users.filter((u) => !idsToDelete.has(u.id)));
      try {
        localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
        localStorage.removeItem('zenia_admin_users_list');
      } catch (_) {}
      this.notifyListeners();
    } catch (e) {
      console.error('Error during cleanDuplicateUsersFromFirestore:', e);
    }

    return { cleanedCount: deletedIds.length, deletedIds };
  }

  /**
   * Returns all active users, strictly deduplicated
   */
  public getAllUsers(): UserProfile[] {
    const raw = this.users.length === 0 ? FIREBASE_AUTH_USERS_SEEDS : this.users;
    return deduplicateUsers(raw.filter((u) => !userService.isUserDeleted(u)));
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
