import { FriendshipStatus, FriendRelationship } from '../../types';
import { userService } from './userService';

const FRIENDSHIPS_STORAGE_KEY = 'zenia_friend_relationships_v2';
const FRIENDSHIP_EVENT = 'zenia_friendship_updated';

// Cross-tab broadcast channel for immediate multi-window syncing
const friendshipBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('zenia_friendship_channel')
    : null;

export function normalizeUserId(id: string): string {
  if (!id) return id;
  if (id === 'user_sarah' || id === 'u_3' || id === 'sarah_m' || id === 'user_sarah_mwangi') return 'user_sarah_m';
  if (id === 'user_alex' || id === 'u_2' || id === 'alex_k' || id === 'user_alex_kanyama') return 'user_alex_k';
  if (id === 'u_1' || id === 'fresh_kk' || id === 'user_freshkk') return 'user_fresh_kk';
  if (id === 'u_4' || id === 'baraka_moto' || id === 'user_baraka') return 'user_baraka_m';
  if (id === 'user_amina_1' || id === 'user_amina_kaunga' || id === 'amina_kaunga') return 'current_user_id';
  return id;
}

function makeRelId(id1: string, id2: string): string {
  const norm1 = normalizeUserId(id1);
  const norm2 = normalizeUserId(id2);
  const [first, second] = [norm1, norm2].sort();
  return `${first}:::${second}`;
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
  }

  private loadFromStorage(): Record<string, FriendRelationship> {
    if (typeof window === 'undefined') return { ...DEFAULT_RELATIONSHIPS };
    try {
      const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse relationships from localStorage', e);
    }
    // Save defaults
    this.saveToStorage(DEFAULT_RELATIONSHIPS);
    return { ...DEFAULT_RELATIONSHIPS };
  }

  private saveToStorage(data: Record<string, FriendRelationship>) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FRIENDSHIPS_STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(FRIENDSHIP_EVENT));
      if (friendshipBroadcast) {
        friendshipBroadcast.postMessage({ type: 'SYNC' });
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

    const relId = makeRelId(currentUserId, targetUserId);
    const rel = this.relationships[relId];

    if (!rel || rel.status === 'none' || rel.status === 'declined') {
      return 'none';
    }

    if (rel.status === 'friends') {
      return 'friends';
    }

    if (rel.status === 'pending') {
      if (rel.requestedBy === currentUserId) {
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
   * Send a friend request from sender to receiver
   */
  public sendFriendRequest(
    sender: { id: string; displayName: string; photoURL?: string; username?: string },
    receiver: { id: string; displayName: string; photoURL?: string; username?: string }
  ): boolean {
    if (!sender.id || !receiver.id || sender.id === receiver.id) return false;

    const relId = makeRelId(sender.id, receiver.id);
    const existing = this.relationships[relId];

    // If already friends, no need to send
    if (existing?.status === 'friends') return true;

    // If receiver had already requested sender, auto-accept as mutual friend!
    if (existing?.status === 'pending' && existing.requestedBy === receiver.id) {
      return this.acceptFriendRequest(sender.id, receiver.id);
    }

    const updatedRel: FriendRelationship = {
      id: relId,
      userA: sender.id,
      userB: receiver.id,
      status: 'pending',
      requestedBy: sender.id,
      senderDetails: sender,
      receiverDetails: receiver,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.relationships[relId] = updatedRel;
    this.saveToStorage(this.relationships);
    this.notifyListeners();
    return true;
  }

  /**
   * Accept an incoming friend request
   */
  public acceptFriendRequest(currentUserId: string, targetUserId: string): boolean {
    const relId = makeRelId(currentUserId, targetUserId);
    const existing = this.relationships[relId];

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
    return true;
  }

  /**
   * Decline an incoming friend request
   */
  public declineFriendRequest(currentUserId: string, targetUserId: string): boolean {
    const relId = makeRelId(currentUserId, targetUserId);
    if (this.relationships[relId]) {
      this.relationships[relId] = {
        ...this.relationships[relId],
        status: 'declined',
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage(this.relationships);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Cancel a pending sent friend request
   */
  public cancelFriendRequest(currentUserId: string, targetUserId: string): boolean {
    const relId = makeRelId(currentUserId, targetUserId);
    if (this.relationships[relId]) {
      delete this.relationships[relId];
      this.saveToStorage(this.relationships);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Remove friend (Unfriend)
   */
  public unfriend(currentUserId: string, targetUserId: string): boolean {
    const relId = makeRelId(currentUserId, targetUserId);
    if (this.relationships[relId]) {
      delete this.relationships[relId];
      this.saveToStorage(this.relationships);
      this.notifyListeners();
      return true;
    }
    return false;
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
        if (normA === normUser && !userService.isIdentifierDeleted(rel.userB)) {
          friends.push(rel.userB);
        } else if (normB === normUser && !userService.isIdentifierDeleted(rel.userA)) {
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
    const normUser = normalizeUserId(userId);
    return Object.values(this.relationships).filter((rel) => {
      if (rel.status !== 'pending') return false;
      const normA = normalizeUserId(rel.userA);
      const normB = normalizeUserId(rel.userB);
      const normReq = normalizeUserId(rel.requestedBy);
      const isTarget = (normA === normUser || normB === normUser) && normReq !== normUser;
      const otherId = normA === normUser ? rel.userB : rel.userA;
      return isTarget && !userService.isIdentifierDeleted(otherId);
    });
  }

  /**
   * Get all pending sent requests by a user
   */
  public getPendingRequestsSent(userId: string): FriendRelationship[] {
    const normUser = normalizeUserId(userId);
    return Object.values(this.relationships).filter((rel) => {
      if (rel.status !== 'pending') return false;
      const isSender = normalizeUserId(rel.requestedBy) === normUser;
      const otherId = normalizeUserId(rel.userA) === normUser ? rel.userB : rel.userA;
      return isSender && !userService.isIdentifierDeleted(otherId);
    });
  }
}

export const friendshipService = new FriendshipServiceImpl();
