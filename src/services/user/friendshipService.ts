import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FriendshipStatus, FriendRelationship } from '../../types';
import { userService } from './userService';

const FRIENDSHIPS_STORAGE_KEY = 'zenia_friend_relationships_v3';
const FRIENDSHIP_EVENT = 'zenia_friendship_updated';

// Cross-tab broadcast channel for immediate multi-window syncing
const friendshipBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('zenia_friendship_channel')
    : null;

export function normalizeUserId(id?: string | null): string {
  if (!id || typeof id !== 'string') return '';
  const clean = id.trim();
  if (clean === 'user_sarah' || clean === 'u_3' || clean === 'sarah_m' || clean === 'user_sarah_mwangi' || clean === 'sarah@soundwave.tz') return 'user_sarah_m';
  if (clean === 'user_alex' || clean === 'u_2' || clean === 'alex_k' || clean === 'user_alex_kanyama' || clean === 'alex.kanyama@zenia.app') return 'user_alex_k';
  if (clean === 'u_1' || clean === 'fresh_kk' || clean === 'user_freshkk' || clean === 'fresh.kk@zenia.app') return 'user_fresh_kk';
  if (clean === 'u_4' || clean === 'baraka_moto' || clean === 'user_baraka') return 'user_baraka_m';
  if (
    clean === 'user_amina_1' ||
    clean === 'user_amina_kaunga' ||
    clean === 'amina_kaunga' ||
    clean === 'savegamour@gmail.com' ||
    clean === 'UkgR7gl8afU92vg6OCT3wHhA' ||
    clean === 'savegamour' ||
    clean === 'admin'
  ) {
    return 'current_user_id';
  }
  return clean;
}

export function matchesUser(
  query?: string | null,
  fieldId?: string | null,
  details?: { id?: string; email?: string; username?: string; displayName?: string } | null
): boolean {
  if (!query || typeof query !== 'string') return false;
  const q = query.trim().toLowerCase();
  const normQ = normalizeUserId(query);

  if (fieldId && typeof fieldId === 'string') {
    const fId = fieldId.trim().toLowerCase();
    if (fId === q) return true;
    if (normQ && normalizeUserId(fieldId) === normQ) return true;
  }

  if (details && typeof details === 'object') {
    if (details.id && typeof details.id === 'string') {
      const dId = details.id.trim().toLowerCase();
      if (dId === q) return true;
      if (normQ && normalizeUserId(details.id) === normQ) return true;
    }
    if (details.email && typeof details.email === 'string' && details.email.trim().toLowerCase() === q) return true;
    if (details.username && typeof details.username === 'string' && details.username.trim().toLowerCase() === q) return true;
  }

  return false;
}

export function makeRelId(id1: string, id2: string): string {
  const norm1 = normalizeUserId(id1).replace(/[\/\\\s]/g, '_');
  const norm2 = normalizeUserId(id2).replace(/[\/\\\s]/g, '_');
  const [first, second] = [norm1, norm2].sort();
  return `${first}___${second}`;
}

const DEFAULT_RELATIONSHIPS: Record<string, FriendRelationship> = {
  // Fresh kk & Amina Kaunga (Current User) are friends initially
  [makeRelId('current_user_id', 'user_fresh_kk')]: {
    id: makeRelId('current_user_id', 'user_fresh_kk'),
    userA: 'current_user_id',
    userB: 'user_fresh_kk',
    status: 'friends',
    requestedBy: 'user_fresh_kk',
    senderDetails: {
      id: 'user_fresh_kk',
      displayName: 'Fresh kk',
      photoURL: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
      username: 'fresh_kk',
    },
    receiverDetails: {
      id: 'current_user_id',
      displayName: 'Amina Kaunga',
      photoURL: '/assets/images/amina_avatar_1790280951312.jpg',
      username: 'amina_kaunga',
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  // Sarah Mwangi sent a friend request to current_user_id (pending received!)
  [makeRelId('current_user_id', 'user_sarah_m')]: {
    id: makeRelId('current_user_id', 'user_sarah_m'),
    userA: 'current_user_id',
    userB: 'user_sarah_m',
    status: 'pending',
    requestedBy: 'user_sarah_m',
    senderDetails: {
      id: 'user_sarah_m',
      displayName: 'Sarah Mwangi',
      photoURL: '/assets/images/sarah_avatar_1790802224123.jpg',
      username: 'sarah_m',
    },
    receiverDetails: {
      id: 'current_user_id',
      displayName: 'Amina Kaunga',
      photoURL: '/assets/images/amina_avatar_1790280951312.jpg',
      username: 'amina_kaunga',
    },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
};

class FriendshipServiceImpl {
  private listeners: Set<() => void> = new Set();
  private relationships: Record<string, FriendRelationship> = {};
  private unsubscribeFirestore: (() => void) | null = null;
  private hasInitializedFirestore = false;

  constructor() {
    this.relationships = this.loadFromStorage();

    // Listen for storage changes from other browser tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === FRIENDSHIPS_STORAGE_KEY) {
          this.relationships = this.loadFromStorage();
          this.notifyListeners();
        }
      });

      if (friendshipBroadcast) {
        friendshipBroadcast.addEventListener('message', () => {
          this.relationships = this.loadFromStorage();
          this.notifyListeners();
        });
      }

      window.addEventListener(FRIENDSHIP_EVENT, () => {
        this.relationships = this.loadFromStorage();
        this.notifyListeners();
      });
    }

    // Initialize real-time Cloud Firestore sync
    this.initFirestoreSync();
  }

  /**
   * Real-time Cloud Firestore synchronizer
   * Automatically streams all friendships and friend requests from the shared Firestore
   * database across devices, accounts, and browsers.
   */
  public initFirestoreSync() {
    if (this.hasInitializedFirestore) return;
    this.hasInitializedFirestore = true;

    try {
      const friendshipsCol = collection(db, 'friendships');
      this.unsubscribeFirestore = onSnapshot(
        friendshipsCol,
        (snapshot) => {
          let hasChanges = false;

          snapshot.docChanges().forEach((change) => {
            const docId = change.doc.id;
            if (change.type === 'removed') {
              if (this.relationships[docId]) {
                delete this.relationships[docId];
                hasChanges = true;
              }
            } else {
              const data = change.doc.data() as FriendRelationship;
              this.relationships[docId] = {
                ...data,
                id: docId,
              };
              hasChanges = true;
            }
          });

          if (hasChanges) {
            this.saveToStorage(this.relationships, false);
            this.notifyListeners();
          }
        },
        (error) => {
          console.warn('Firestore friendships real-time sync notice:', error);
        }
      );
    } catch (err) {
      console.warn('Could not initialize Firestore friendships listener:', err);
    }
  }

  private loadFromStorage(): Record<string, FriendRelationship> {
    if (typeof window === 'undefined') return { ...DEFAULT_RELATIONSHIPS };
    try {
      const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_RELATIONSHIPS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse relationships from localStorage', e);
    }
    this.saveToStorage(DEFAULT_RELATIONSHIPS, false);
    return { ...DEFAULT_RELATIONSHIPS };
  }

  private saveToStorage(data: Record<string, FriendRelationship>, broadcast = true) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FRIENDSHIPS_STORAGE_KEY, JSON.stringify(data));
      if (broadcast) {
        window.dispatchEvent(new CustomEvent(FRIENDSHIP_EVENT));
        if (friendshipBroadcast) {
          friendshipBroadcast.postMessage({ type: 'SYNC' });
        }
      }
    } catch (e) {
      console.warn('Failed to save relationships to localStorage', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in friendship listener:', err);
      }
    });
  }

  /**
   * Subscribe to friendship state updates
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Helper to check if a relationship matches two target users
   */
  private findRelationship(user1: string, user2: string): FriendRelationship | null {
    if (!user1 || !user2) return null;
    const relIdModern = makeRelId(user1, user2);
    if (this.relationships[relIdModern]) {
      return this.relationships[relIdModern];
    }

    // Try legacy format with ':::'
    const norm1 = normalizeUserId(user1);
    const norm2 = normalizeUserId(user2);
    const [first, second] = [norm1, norm2].sort();
    const legacyKey = `${first}:::${second}`;
    if (this.relationships[legacyKey]) {
      return this.relationships[legacyKey];
    }

    // Search across all relationships with robust fuzzy identification using matchesUser
    const allRels = Object.values(this.relationships);
    for (const rel of allRels) {
      const u1A = matchesUser(user1, rel.userA, rel.senderDetails) || matchesUser(user1, rel.userA, rel.receiverDetails);
      const u1B = matchesUser(user1, rel.userB, rel.senderDetails) || matchesUser(user1, rel.userB, rel.receiverDetails);
      const u2A = matchesUser(user2, rel.userA, rel.senderDetails) || matchesUser(user2, rel.userA, rel.receiverDetails);
      const u2B = matchesUser(user2, rel.userB, rel.senderDetails) || matchesUser(user2, rel.userB, rel.receiverDetails);

      if ((u1A && u2B) || (u1B && u2A)) {
        return rel;
      }
    }

    return null;
  }

  /**
   * Determine exact friendship status between two users
   */
  public getFriendshipStatus(currentUserId: string, targetUserId: string): FriendshipStatus {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return 'friends'; // Same user always has full access to own items
    }

    // Guest users have no friends until signed in
    if (currentUserId === 'guest') {
      return 'none';
    }

    // Check if target user is deleted
    if (userService.isIdentifierDeleted(targetUserId)) {
      return 'none';
    }

    const rel = this.findRelationship(currentUserId, targetUserId);

    if (!rel || rel.status === 'none' || rel.status === 'declined') {
      return 'none';
    }

    if (rel.status === 'friends') {
      return 'friends';
    }

    if (rel.status === 'pending') {
      const isRequestedByMe =
        matchesUser(currentUserId, rel.requestedBy, rel.senderDetails);

      if (isRequestedByMe) {
        return 'pending_sent';
      } else {
        return 'pending_received';
      }
    }

    return 'none';
  }

  /**
   * Simple boolean: Are user A and user B mutual friends?
   */
  public areFriends(userAId: string, userBId: string): boolean {
    return this.getFriendshipStatus(userAId, userBId) === 'friends';
  }

  /**
   * Send a friend request from sender to receiver.
   * Writes in real time to Cloud Firestore and posts a notification.
   */
  public async sendFriendRequest(
    sender: { id: string; displayName: string; photoURL?: string; username?: string; email?: string },
    receiver: { id: string; displayName: string; photoURL?: string; username?: string; email?: string }
  ): Promise<boolean> {
    if (!sender.id || !receiver.id || sender.id === receiver.id) return false;

    const existing = this.findRelationship(sender.id, receiver.id);

    // If already friends, no need to send again
    if (existing?.status === 'friends') return true;

    // If receiver had already requested sender, auto-accept as mutual friend!
    if (existing?.status === 'pending' && existing.requestedBy === receiver.id) {
      return this.acceptFriendRequest(sender.id, receiver.id);
    }

    const relId = makeRelId(sender.id, receiver.id);

    const updatedRel: FriendRelationship = {
      id: relId,
      userA: sender.id,
      userB: receiver.id,
      status: 'pending',
      requestedBy: sender.id,
      senderDetails: {
        id: sender.id,
        displayName: sender.displayName || 'Mwanachama wa Zenia',
        photoURL: sender.photoURL || '',
        username: sender.username || '',
        email: sender.email,
      },
      receiverDetails: {
        id: receiver.id,
        displayName: receiver.displayName || 'Mwanachama wa Zenia',
        photoURL: receiver.photoURL || '',
        username: receiver.username || '',
        email: receiver.email,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Instant local UI state update
    this.relationships[relId] = updatedRel;
    this.saveToStorage(this.relationships);
    this.notifyListeners();

    // Write to Firestore in real time
    try {
      await setDoc(doc(db, 'friendships', relId), updatedRel, { merge: true });

      // Create a notification for the receiver so they get alerted in real time
      const notifId = `notif_friend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: receiver.id,
        title: 'Ombi Jipya la Urafiki 👥',
        message: `${sender.displayName} (@${sender.username || 'user'}) amekutumia ombi la urafiki kwenye Zenia!`,
        type: 'follow',
        read: false,
        avatar: sender.photoURL || '',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore write warning in sendFriendRequest:', err);
    }

    return true;
  }

  /**
   * Accept an incoming friend request.
   * Syncs to Cloud Firestore and notifies the requester.
   */
  public async acceptFriendRequest(currentUserId: string, targetUserId: string): Promise<boolean> {
    let existing = this.findRelationship(currentUserId, targetUserId);
    if (!existing) {
      const pending = this.getPendingRequestsReceived(currentUserId);
      existing =
        pending.find(
          (p) =>
            matchesUser(targetUserId, p.requestedBy, p.senderDetails) ||
            matchesUser(targetUserId, p.userA, p.senderDetails) ||
            matchesUser(targetUserId, p.userB, p.senderDetails)
        ) || null;
    }
    const relId = existing?.id || makeRelId(currentUserId, targetUserId);

    const updatedRel: FriendRelationship = {
      ...(existing || {
        id: relId,
        userA: currentUserId,
        userB: targetUserId,
        requestedBy: targetUserId,
        createdAt: new Date().toISOString(),
      }),
      status: 'friends',
      updatedAt: new Date().toISOString(),
    };

    this.relationships[relId] = updatedRel;
    this.saveToStorage(this.relationships);
    this.notifyListeners();

    try {
      await setDoc(
        doc(db, 'friendships', relId),
        {
          ...updatedRel,
          status: 'friends',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Create notification for the requester that their request was accepted
      const requesterId = existing?.requestedBy || targetUserId;
      const notifId = `notif_acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: requesterId,
        title: 'Ombi la Urafiki Limekubaliwa! 🎉',
        message: `Mwanachama amekubali ombi lako la urafiki. Sasa mnaweza kuchati na kupigiana simu bila kikwazo!`,
        type: 'follow',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore write warning in acceptFriendRequest:', err);
    }

    return true;
  }

  /**
   * Decline an incoming friend request
   */
  public async declineFriendRequest(currentUserId: string, targetUserId: string): Promise<boolean> {
    let existing = this.findRelationship(currentUserId, targetUserId);
    if (!existing) {
      const pending = this.getPendingRequestsReceived(currentUserId);
      existing =
        pending.find(
          (p) =>
            matchesUser(targetUserId, p.requestedBy, p.senderDetails) ||
            matchesUser(targetUserId, p.userA, p.senderDetails) ||
            matchesUser(targetUserId, p.userB, p.senderDetails)
        ) || null;
    }
    const relId = existing?.id || makeRelId(currentUserId, targetUserId);

    if (this.relationships[relId]) {
      this.relationships[relId] = {
        ...this.relationships[relId],
        status: 'declined',
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage(this.relationships);
      this.notifyListeners();
    }

    try {
      await setDoc(
        doc(db, 'friendships', relId),
        {
          status: 'declined',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore write warning in declineFriendRequest:', err);
    }

    return true;
  }

  /**
   * Cancel a pending sent friend request
   */
  public async cancelFriendRequest(currentUserId: string, targetUserId: string): Promise<boolean> {
    const existing = this.findRelationship(currentUserId, targetUserId);
    const relId = existing?.id || makeRelId(currentUserId, targetUserId);

    if (this.relationships[relId]) {
      delete this.relationships[relId];
      this.saveToStorage(this.relationships);
      this.notifyListeners();
    }

    try {
      await deleteDoc(doc(db, 'friendships', relId));
    } catch (err) {
      console.warn('Firestore delete warning in cancelFriendRequest:', err);
    }

    return true;
  }

  /**
   * Remove friend (Unfriend)
   */
  public async unfriend(currentUserId: string, targetUserId: string): Promise<boolean> {
    const existing = this.findRelationship(currentUserId, targetUserId);
    const relId = existing?.id || makeRelId(currentUserId, targetUserId);

    if (this.relationships[relId]) {
      delete this.relationships[relId];
      this.saveToStorage(this.relationships);
      this.notifyListeners();
    }

    try {
      await deleteDoc(doc(db, 'friendships', relId));
    } catch (err) {
      console.warn('Firestore delete warning in unfriend:', err);
    }

    return true;
  }

  /**
   * Get list of friend user IDs for a given user
   */
  public getFriendsList(userId: string): string[] {
    const normUser = normalizeUserId(userId);
    const friends: string[] = [];

    Object.values(this.relationships).forEach((rel) => {
      if (rel.status === 'friends') {
        const normA = normalizeUserId(rel.userA);
        const normB = normalizeUserId(rel.userB);

        const isUserInA =
          normA === normUser ||
          rel.userA === userId ||
          rel.senderDetails?.id === userId ||
          rel.receiverDetails?.id === userId;
        const isUserInB =
          normB === normUser ||
          rel.userB === userId ||
          rel.senderDetails?.id === userId ||
          rel.receiverDetails?.id === userId;

        if (isUserInA && !userService.isIdentifierDeleted(rel.userB)) {
          friends.push(rel.userB);
        } else if (isUserInB && !userService.isIdentifierDeleted(rel.userA)) {
          friends.push(rel.userA);
        }
      }
    });

    return Array.from(new Set(friends));
  }

  /**
   * Get number of friends
   */
  public getFriendsCount(userId: string): number {
    return this.getFriendsList(userId).length;
  }

  /**
   * Get all pending received requests for a user
   */
  public getPendingRequestsReceived(userId: string): FriendRelationship[] {
    if (!userId || userId === 'guest') return [];

    return Object.values(this.relationships).filter((rel) => {
      if (rel.status !== 'pending') return false;

      // If requested by this user, it is not a received request
      const isRequestedByMe = matchesUser(userId, rel.requestedBy, rel.senderDetails);
      if (isRequestedByMe) {
        return false;
      }

      const isTarget =
        matchesUser(userId, rel.userA, rel.receiverDetails) ||
        matchesUser(userId, rel.userB, rel.receiverDetails) ||
        (rel.receiverDetails?.email && userId.includes('@') && rel.receiverDetails.email.toLowerCase() === userId.toLowerCase()) ||
        (normalizeUserId(userId) === 'current_user_id' && (rel.userA === 'current_user_id' || rel.userB === 'current_user_id' || rel.receiverDetails?.id === 'current_user_id'));

      if (!isTarget) return false;

      const otherId = matchesUser(userId, rel.userA) ? rel.userB : rel.userA;
      return !userService.isIdentifierDeleted(otherId);
    });
  }

  /**
   * Get all pending sent requests by a user
   */
  public getPendingRequestsSent(userId: string): FriendRelationship[] {
    if (!userId || userId === 'guest') return [];

    return Object.values(this.relationships).filter((rel) => {
      if (rel.status !== 'pending') return false;

      const isSender = matchesUser(userId, rel.requestedBy, rel.senderDetails);
      if (!isSender) return false;

      const otherId = matchesUser(userId, rel.userA) ? rel.userB : rel.userA;
      return !userService.isIdentifierDeleted(otherId);
    });
  }
}

export const friendshipService = new FriendshipServiceImpl();
