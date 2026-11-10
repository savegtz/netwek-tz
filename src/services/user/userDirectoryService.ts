import { collection, doc, onSnapshot, getDocs, setDoc, deleteDoc, query } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { UserProfile } from '../../types';
import { userService } from './userService';
import { normalizeUserId, friendshipService, SAVEGAMOUR_CANONICAL_ID } from './friendshipService';
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
      // 1. Exact Email match (most authoritative)
      if (emailKey && existing.email && existing.email.trim().toLowerCase() === emailKey) {
        return true;
      }
      // 2. Exact User ID match
      if (user.id && existing.id && user.id === existing.id) {
        return true;
      }
      // 3. Normalized User ID match (strictly for known demo aliases)
      if (normId && (normId.startsWith('user_') || normId === 'current_user_id') && normalizeUserId(existing.id) === normId) {
        return true;
      }
      // 4. Exact Normalized Username match (only if non-empty and not generic)
      if (
        usernameKey &&
        usernameKey !== 'user' &&
        usernameKey !== 'admin' &&
        existing.username &&
        existing.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') === usernameKey
      ) {
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
 * Primary Authoritative Admin Profile for Zenia Network
 */
export const PRIMARY_ADMIN_PROFILE: UserProfile = {
  id: '7w6ldhpczBOVpimURqrpQ3C',
  email: 'amytzee@gmail.com',
  displayName: 'Amytzee (Admin)',
  username: 'amytzee',
  bio: 'Msimamizi Mkuu (Super Admin) wa Zenia Network 🛡️👑',
  accountType: 'creator',
  verified: true,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isOnline: true,
  lastSeen: 'Sasa hivi',
  walletBalance: 500000,
  role: 'superadmin',
};

/**
 * Authoritative Registered User Profile for Savegamour (Firebase Auth)
 */
export const PRIMARY_SAVEGAMOUR_PROFILE: UserProfile = {
  id: SAVEGAMOUR_CANONICAL_ID,
  email: 'savegamour@gmail.com',
  displayName: 'Savegamour',
  username: 'savegamour',
  bio: 'Mwanachama wa Zenia Network 🌟',
  accountType: 'personal',
  verified: false,
  followersCount: 1,
  followingCount: 1,
  postsCount: 0,
  isOnline: true,
  lastSeen: 'Sasa hivi',
  walletBalance: 0,
  role: 'user',
};

/**
 * Check if demo/sample data mode is enabled.
 * Defaults to FALSE (Clean Production Mode) so only real users exist.
 */
export const isDemoModeActive = (): boolean => {
  try {
    return localStorage.getItem('zenia_demo_mode_active') === 'true';
  } catch {
    return false;
  }
};

export const setDemoModeActive = (active: boolean): void => {
  try {
    localStorage.setItem('zenia_demo_mode_active', active ? 'true' : 'false');
    window.dispatchEvent(new Event('zenia_demo_mode_changed'));
  } catch {}
};

/**
 * Mock demo profiles for UI testing and visual design previews.
 * Only loaded when Demo Mode is explicitly turned on by the Admin.
 */
export const DEMO_PREVIEW_USERS: UserProfile[] = [
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

/**
 * Known authoritative seeds:
 * In clean production mode, only the Admin profile is seeded.
 * When real users register via Firebase Authentication, they join dynamically.
 */
export const getActiveSeeds = (): UserProfile[] => {
  return isDemoModeActive()
    ? [PRIMARY_ADMIN_PROFILE, ...DEMO_PREVIEW_USERS]
    : [PRIMARY_ADMIN_PROFILE];
};

export const FIREBASE_AUTH_USERS_SEEDS: UserProfile[] = [PRIMARY_ADMIN_PROFILE];

export const REGISTERED_USERS_REGISTRY_KEY = 'zenia_registered_users_registry_v2';
const USERS_DIRECTORY_CHANNEL = 'zenia_users_directory_channel';

const usersDirectoryBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(USERS_DIRECTORY_CHANNEL)
    : null;

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

    // 1. Cross-tab real-time sync via BroadcastChannel
    if (usersDirectoryBroadcast) {
      usersDirectoryBroadcast.onmessage = (event) => {
        if (event.data?.type === 'USER_REGISTERED' && event.data.user) {
          const u = event.data.user as UserProfile;
          this.upsertLocalMemoryUser(u);
        }
      };
    }

    // 2. Storage event listener for multi-tab updates
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === REGISTERED_USERS_REGISTRY_KEY && e.newValue) {
          try {
            const list = JSON.parse(e.newValue) as UserProfile[];
            list.forEach((u) => this.upsertLocalMemoryUser(u));
          } catch (_) {}
        }
      });

      window.addEventListener('zenia_users_directory_updated', (e: any) => {
        if (e.detail) {
          this.upsertLocalMemoryUser(e.detail);
        }
      });
    }

    // 3. Load from local storage cache, registered registry, and active friendships
    try {
      const cached = localStorage.getItem('zenia_firestore_users_cache');
      const regRaw = localStorage.getItem(REGISTERED_USERS_REGISTRY_KEY);
      const combinedInitial: UserProfile[] = [PRIMARY_ADMIN_PROFILE, PRIMARY_SAVEGAMOUR_PROFILE];
      if (regRaw) {
        try {
          combinedInitial.push(...(JSON.parse(regRaw) as UserProfile[]));
        } catch (_) {}
      }
      if (cached) {
        try {
          combinedInitial.push(...(JSON.parse(cached) as UserProfile[]));
        } catch (_) {}
      }

      // Also harvest users from any confirmed/pending friendships (only genuine users, skip mock demo artifacts)
      try {
        const allRels = friendshipService.getAllRelationships();
        Object.values(allRels).forEach((rel) => {
          [rel.senderDetails, rel.receiverDetails].forEach((d) => {
            if (
              d &&
              d.id &&
              !userService.isIdentifierDeleted(d.id) &&
              !d.id.startsWith('user_') &&
              !d.email?.endsWith('@zenia.social') &&
              !d.email?.endsWith('@zenia.app') &&
              d.displayName !== 'Amina Kaunga'
            ) {
              combinedInitial.push({
                id: d.id,
                displayName: d.displayName || 'Mwanachama wa Zenia',
                username: d.username || d.id.replace(/[^a-z0-9_]/g, '_'),
                email: d.email || `${d.id}@zenia.app`,
                photoURL: d.photoURL,
                bio: 'Mwanachama wa Zenia Network 🌟',
                accountType: 'personal',
                verified: false,
                followersCount: 1,
                followingCount: 1,
                postsCount: 0,
                isOnline: false,
                lastSeen: 'Muda mfupi uliopita',
              });
            }
          });
        });
      } catch (_) {}

      this.users = deduplicateUsers(
        combinedInitial.map((u) => ({
          ...u,
          isOnline:
            u.isOnline === true &&
            typeof u.lastActiveAt === 'number' &&
            Date.now() - u.lastActiveAt < 3 * 60 * 1000,
        })).filter((u) => !userService.isUserDeleted(u))
      );
      this.notifyListeners();
    } catch (_) {}

    // Subscribe to ongoing friendship changes to harvest new contacts dynamically
    try {
      friendshipService.subscribe(() => {
        const rels = friendshipService.getAllRelationships();
        let added = false;
        Object.values(rels).forEach((rel) => {
          [rel.senderDetails, rel.receiverDetails].forEach((d) => {
            if (
              d &&
              d.id &&
              !userService.isIdentifierDeleted(d.id) &&
              !d.id.startsWith('user_') &&
              !d.email?.endsWith('@zenia.social') &&
              !d.email?.endsWith('@zenia.app') &&
              d.displayName !== 'Amina Kaunga'
            ) {
              const alreadyKnown = this.users.some(
                (u) =>
                  u.id === d.id ||
                  (d.email && u.email && u.email.toLowerCase() === d.email.toLowerCase())
              );
              if (!alreadyKnown) {
                const newProfile: UserProfile = {
                  id: d.id,
                  displayName: d.displayName || 'Mwanachama wa Zenia',
                  username: d.username || d.id.replace(/[^a-z0-9_]/g, '_'),
                  email: d.email || `${d.id}@zenia.app`,
                  photoURL: d.photoURL,
                  bio: 'Mwanachama wa Zenia Network 🌟',
                  accountType: 'personal',
                  verified: false,
                  followersCount: 1,
                  followingCount: 1,
                  postsCount: 0,
                  isOnline: false,
                  lastSeen: 'Muda mfupi uliopita',
                };
                this.users = deduplicateUsers([newProfile, ...this.users]);
                added = true;
              }
            }
          });
        });
        if (added) {
          try {
            localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
          } catch (_) {}
          this.notifyListeners();
        }
      });
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
              const isActuallyOnline =
                data.isOnline === true &&
                typeof data.lastActiveAt === 'number' &&
                Date.now() - data.lastActiveAt < 3 * 60 * 1000;

              const rawDisplayName = data.displayName?.trim() || '';
              const rawUsername = data.username?.trim() || '';
              const rawEmail = data.email?.trim().toLowerCase() || '';
              const emailPrefix = rawEmail ? rawEmail.split('@')[0] : '';
              const isAdmin =
                docSnap.id === PRIMARY_ADMIN_PROFILE.id ||
                rawEmail === 'amytzee@gmail.com' ||
                docSnap.id === 'current_user_id';

              // Identify if this is the second registered Firebase Auth account (savegamour@gmail.com)
              const isSavegamour =
                docSnap.id === SAVEGAMOUR_CANONICAL_ID ||
                docSnap.id === 'FCXkMkn1moZ5Vd8SR1IZuXJL' ||
                docSnap.id.includes('FCXkMkn1mo') ||
                rawEmail === 'savegamour@gmail.com' ||
                rawDisplayName.toLowerCase().includes('savegamour');

              const resolvedEmail = isSavegamour
                ? 'savegamour@gmail.com'
                : rawEmail || data.email;

              const resolvedUsername = isAdmin
                ? 'amytzee'
                : isSavegamour
                ? 'savegamour'
                : rawUsername && !rawUsername.startsWith('___')
                ? rawUsername
                : emailPrefix || `user_${docSnap.id.slice(0, 6).toLowerCase()}`;

              const resolvedDisplayName = isAdmin
                ? 'Amytzee (Admin)'
                : isSavegamour
                ? (rawDisplayName && !rawDisplayName.startsWith('___') && rawDisplayName !== 'Mwanachama wa Zenia' ? rawDisplayName : 'Savegamour')
                : rawDisplayName && rawDisplayName !== 'Mtumiaji' && rawDisplayName !== 'Mwanachama wa Zenia' && !rawDisplayName.startsWith('___')
                ? rawDisplayName
                : resolvedUsername && resolvedUsername !== 'user' && !resolvedUsername.startsWith('user_')
                ? resolvedUsername.charAt(0).toUpperCase() + resolvedUsername.slice(1)
                : emailPrefix
                ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
                : resolvedUsername
                ? resolvedUsername.charAt(0).toUpperCase() + resolvedUsername.slice(1)
                : 'Mwanachama wa Zenia';

              // If Firestore doc had missing email/name, repair it in the background
              if (isSavegamour && (!rawEmail || !rawDisplayName || rawDisplayName.startsWith('___'))) {
                setDoc(
                  doc(db, 'users', docSnap.id),
                  {
                    id: docSnap.id,
                    email: 'savegamour@gmail.com',
                    displayName: resolvedDisplayName,
                    username: resolvedUsername,
                    accountType: data.accountType || 'personal',
                    verified: false,
                    isOnline: isActuallyOnline,
                    lastSeen: 'Sasa hivi',
                  },
                  { merge: true }
                ).catch(() => {});
              }

              firestoreUsers.push({
                ...data,
                id: docSnap.id,
                displayName: resolvedDisplayName,
                username: resolvedUsername,
                email: resolvedEmail,
                role: isAdmin ? 'superadmin' : data.role || 'user',
                verified: isAdmin ? true : Boolean(data.verified),
                isOnline: isAdmin ? true : isActuallyOnline,
                lastSeen: (isAdmin || isActuallyOnline)
                  ? 'Sasa hivi'
                  : data.lastSeen && data.lastSeen !== 'Sasa hivi'
                  ? data.lastSeen
                  : 'Muda mfupi uliopita',
              });
            });

            // Merge with seeded users & registered users registry
            const combinedMap = new Map<string, UserProfile>();
            
            // First put the seed users
            FIREBASE_AUTH_USERS_SEEDS.forEach((u) => {
              const key = u.email ? u.email.toLowerCase() : u.id;
              combinedMap.set(key, u);
            });

            // Then put locally registered users
            try {
              const regRaw = localStorage.getItem(REGISTERED_USERS_REGISTRY_KEY);
              if (regRaw) {
                const regList = JSON.parse(regRaw) as UserProfile[];
                regList.forEach((u) => {
                  const key = u.email ? u.email.toLowerCase() : u.id;
                  combinedMap.set(key, u);
                });
              }
            } catch (_) {}

            // Override / enrich with real Firestore data
            firestoreUsers.forEach((u) => {
              const key = u.email ? u.email.toLowerCase() : u.id;
              combinedMap.set(key, u);
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
   * Internal helper to upsert a user into in-memory array and notify
   */
  private upsertLocalMemoryUser(u: UserProfile) {
    if (!u || !u.id || userService.isUserDeleted(u)) return;
    this.users = deduplicateUsers([u, ...this.users]);
    try {
      localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
    } catch (_) {}
    this.notifyListeners();
  }

  /**
   * Register a user dynamically:
   * 1. Writes to Firestore 'users' collection
   * 2. Saves to local persistent registry
   * 3. Unmarks deleted in userService
   * 4. Broadcasts to all open tabs and notifies all subscribers
   */
  public async registerUser(newUser: UserProfile): Promise<void> {
    if (!newUser || !newUser.id) return;

    // Unmark in deleted records if any
    userService.unmarkDeleted(newUser.id, newUser.email, newUser.username);

    // Save to persistent registry in localStorage
    try {
      const regRaw = localStorage.getItem(REGISTERED_USERS_REGISTRY_KEY);
      const registry: UserProfile[] = regRaw ? JSON.parse(regRaw) : [];
      const updatedRegistry = deduplicateUsers([newUser, ...registry]);
      localStorage.setItem(REGISTERED_USERS_REGISTRY_KEY, JSON.stringify(updatedRegistry));
    } catch (_) {}

    // Add to in-memory users list
    this.upsertLocalMemoryUser(newUser);

    // Broadcast across tabs
    if (usersDirectoryBroadcast) {
      usersDirectoryBroadcast.postMessage({ type: 'USER_REGISTERED', user: newUser });
    }
    window.dispatchEvent(new CustomEvent('zenia_users_directory_updated', { detail: newUser }));

    // Write to Firestore in real time
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser, { merge: true });
    } catch (e) {
      console.warn('Firestore write notice in registerUser:', e);
    }
  }

  /**
   * Upserts a user profile into directory (e.g. from confirmed friendship or contact interaction)
   */
  public upsertUser(user: UserProfile) {
    if (!user || !user.id || userService.isUserDeleted(user)) return;
    userService.unmarkDeleted(user.id, user.email, user.username);

    const exists = this.users.some(
      (u) =>
        u.id === user.id ||
        (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())
    );
    if (!exists) {
      this.upsertLocalMemoryUser(user);
      try {
        const regRaw = localStorage.getItem(REGISTERED_USERS_REGISTRY_KEY);
        const registry: UserProfile[] = regRaw ? JSON.parse(regRaw) : [];
        localStorage.setItem(
          REGISTERED_USERS_REGISTRY_KEY,
          JSON.stringify(deduplicateUsers([...registry, user]))
        );
      } catch (_) {}
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
   * Purges all mock/demo users from Cloud Firestore and local storage,
   * leaving ONLY the primary Admin (amytzee@gmail.com) and genuine registered users.
   */
  public async purgeDemoDataFromFirestore(): Promise<{ deletedCount: number }> {
    let deletedCount = 0;
    try {
      const snap = await getDocs(collection(db, 'users'));
      const demoUserIds = new Set([
        'user_fresh_kk',
        'user_sarah_m',
        'user_alex_k',
        'user_juma_rashid',
        'user_baraka_m',
        '3eysSI6sDmNNCfvkoZAuN7C',
        'PW9XSmSsmDhVnOmtBH82D',
        'DCgeroYuKbyI5TIXF8CtorSS',
        'opTSMQtbAbW7KIwuSWeKuV',
        'LL4mqnX1IAPtey9eXPDxRLKO',
        'UkgR7gl8afU92vg6OCT3wHhA',
      ]);

      const demoEmails = new Set([
        'fresh.kk@zenia.app',
        'sarah@soundwave.tz',
        'alex.kanyama@zenia.app',
        'juma.rashid@zenia.app',
        'user_fresh_kk@zenia.social',
      ]);

      for (const d of snap.docs) {
        const u = d.data() as UserProfile;
        const email = (u.email || '').trim().toLowerCase();
        const isProtectedUser =
          email === PRIMARY_ADMIN_PROFILE.email.toLowerCase() ||
          email === 'savegamour@gmail.com' ||
          d.id === PRIMARY_ADMIN_PROFILE.id ||
          d.id === 'FCXkMkn1moZ5Vd8SR1IZuXJL' ||
          (auth.currentUser && d.id === auth.currentUser.uid);

        const isDemo =
          !isProtectedUser &&
          (demoUserIds.has(d.id) ||
            demoEmails.has(email) ||
            email.endsWith('@zenia.social') ||
            (d.id.startsWith('user_') && email.endsWith('@zenia.app')));

        if (isDemo) {
          try {
            await deleteDoc(doc(db, 'users', d.id));
            deletedCount++;
          } catch (e) {
            console.warn('Could not delete demo doc:', d.id, e);
          }
        } else if (d.id === 'FCXkMkn1moZ5Vd8SR1IZuXJL' || email === 'savegamour@gmail.com') {
          // Ensure second real Firebase user document is properly populated
          try {
            await setDoc(
              doc(db, 'users', d.id),
              {
                id: d.id,
                email: 'savegamour@gmail.com',
                displayName: u.displayName && !u.displayName.startsWith('___') ? u.displayName : 'Savegamour',
                username: u.username && !u.username.startsWith('___') ? u.username : 'savegamour',
                accountType: u.accountType || 'personal',
                verified: false,
                role: 'user',
              },
              { merge: true }
            );
          } catch {}
        }
      }

      // Ensure Admin profile is written to Firestore
      try {
        await setDoc(doc(db, 'users', PRIMARY_ADMIN_PROFILE.id), PRIMARY_ADMIN_PROFILE, { merge: true });
      } catch {}

      // Keep Admin profile and genuine registered users
      const regRaw = localStorage.getItem(REGISTERED_USERS_REGISTRY_KEY);
      const registeredList: UserProfile[] = regRaw ? JSON.parse(regRaw) : [];
      this.users = deduplicateUsers([
        PRIMARY_ADMIN_PROFILE,
        ...registeredList.filter(
          (u) =>
            !demoUserIds.has(u.id) &&
            !demoEmails.has((u.email || '').toLowerCase()) &&
            !(u.email || '').endsWith('@zenia.social')
        ),
      ]);
      try {
        localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
        localStorage.removeItem('zenia_admin_users_list');
        localStorage.setItem('zenia_demo_mode_active', 'false');
      } catch (_) {}

      this.notifyListeners();
    } catch (e) {
      console.error('Error purging demo data:', e);
    }

    return { deletedCount };
  }

  /**
   * Reconciles Firestore users with Firebase Authentication
   * Fixes any accounts that have missing display names or missing emails.
   */
  public async syncWithFirebaseAuth(): Promise<{ syncedCount: number; message: string }> {
    let syncedCount = 0;
    try {
      const snap = await getDocs(collection(db, 'users'));
      for (const d of snap.docs) {
        const u = d.data() as UserProfile;
        const email = (u.email || '').trim().toLowerCase();
        const dName = (u.displayName || '').trim();
        const uName = (u.username || '').trim();

        // If doc is FCXkMkn1moZ5Vd8SR1IZuXJL or has missing fields
        if (d.id === 'FCXkMkn1moZ5Vd8SR1IZuXJL' || email === 'savegamour@gmail.com') {
          await setDoc(
            doc(db, 'users', d.id),
            {
              id: d.id,
              email: 'savegamour@gmail.com',
              displayName: dName && !dName.startsWith('___') ? dName : 'Savegamour',
              username: uName && !uName.startsWith('___') ? uName : 'savegamour',
              accountType: u.accountType || 'personal',
              role: 'user',
            },
            { merge: true }
          );
          syncedCount++;
        } else if (!email && auth.currentUser && auth.currentUser.uid === d.id && auth.currentUser.email) {
          await setDoc(
            doc(db, 'users', d.id),
            {
              id: d.id,
              email: auth.currentUser.email,
              displayName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
              username: auth.currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            },
            { merge: true }
          );
          syncedCount++;
        }
      }

      // Re-fetch users
      const freshSnap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      freshSnap.forEach((d) => {
        const data = d.data() as UserProfile;
        if (!data.email?.endsWith('@zenia.social') && !d.id.startsWith('user_')) {
          list.push({ ...data, id: d.id });
        }
      });

      this.users = deduplicateUsers([PRIMARY_ADMIN_PROFILE, ...list]);
      try {
        localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
        localStorage.setItem('zenia_admin_users_list', JSON.stringify(this.users));
      } catch (_) {}
      this.notifyListeners();
    } catch (err: any) {
      console.warn('Sync with Firebase Auth error:', err);
    }

    return {
      syncedCount,
      message: `Akaunti ${syncedCount} zimesawazishwa na kurekebishwa kikamilifu na Firebase!`,
    };
  }

  /**
   * Directly update a user profile in Firestore and sync in-memory & listeners
   */
  public async updateUserProfileInFirestore(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<boolean> {
    try {
      if (!userId) return false;
      const ref = doc(db, 'users', userId);
      const cleanData: any = {};
      if (updates.displayName !== undefined) cleanData.displayName = updates.displayName.trim();
      if (updates.username !== undefined) cleanData.username = updates.username.trim().replace(/^@/, '');
      if (updates.email !== undefined) cleanData.email = updates.email.trim();
      if (updates.accountType !== undefined) cleanData.accountType = updates.accountType;
      if (updates.walletBalance !== undefined) cleanData.walletBalance = Number(updates.walletBalance) || 0;
      if (updates.verified !== undefined) cleanData.verified = Boolean(updates.verified);
      if (updates.isSuspended !== undefined) cleanData.isSuspended = Boolean(updates.isSuspended);
      if (updates.bio !== undefined) cleanData.bio = updates.bio;

      await setDoc(ref, cleanData, { merge: true });

      // Update in-memory
      this.users = this.users.map((u) => {
        if (u.id === userId) {
          return { ...u, ...cleanData };
        }
        return u;
      });
      try {
        localStorage.setItem('zenia_firestore_users_cache', JSON.stringify(this.users));
        localStorage.setItem('zenia_admin_users_list', JSON.stringify(this.users));
      } catch (_) {}
      this.notifyListeners();
      return true;
    } catch (err) {
      console.error('Failed to update user profile in Firestore:', err);
      throw err;
    }
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
