import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../../types';

/**
 * Presence Service for accurate, real-time online/offline status.
 * Eliminates "ghost online" indicators so users only appear online
 * when actively present in the app.
 */

// Max threshold for an active session (3 minutes)
const ONLINE_THRESHOLD_MS = 3 * 60 * 1000;

class PresenceServiceImpl {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentActiveUserId: string | null = null;

  /**
   * Evaluates if a user is genuinely online right now.
   * 1. The currently logged-in user in this browser tab is always online.
   * 2. Other users are online ONLY if explicitly marked isOnline === true
   *    AND have sent an active heartbeat within the last 3 minutes.
   * 3. Seed users or accounts without a recent heartbeat are offline.
   */
  public isUserOnline(
    user?: UserProfile | { id?: string; email?: string; isOnline?: boolean; lastActiveAt?: number } | null,
    currentUserId?: string
  ): boolean {
    if (!user) return false;

    // The user running this active browser session is online
    if (
      currentUserId &&
      (user.id === currentUserId ||
        (user.email && currentUserId.includes('@') && user.email.toLowerCase() === currentUserId.toLowerCase()) ||
        (currentUserId === 'current_user_id' && user.id === 'current_user_id'))
    ) {
      return true;
    }

    // Remote user check: Requires valid recent heartbeat
    if (user.isOnline && typeof user.lastActiveAt === 'number') {
      const timeSinceHeartbeat = Date.now() - user.lastActiveAt;
      return timeSinceHeartbeat >= 0 && timeSinceHeartbeat < ONLINE_THRESHOLD_MS;
    }

    // Default to false (no ghost green dots)
    return false;
  }

  /**
   * Formats a user-friendly last seen description in Swahili.
   */
  public formatLastSeen(
    user?: UserProfile | { isOnline?: boolean; lastActiveAt?: number; lastSeen?: string } | null,
    isOnline = false
  ): string {
    if (isOnline) {
      return 'Online sasa hivi';
    }

    if (user?.lastActiveAt && typeof user.lastActiveAt === 'number') {
      const diffMs = Date.now() - user.lastActiveAt;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 2) return 'Muda mfupi uliopita';
      if (diffMins < 60) return `Dakika ${diffMins} zilizopita`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Masaa ${diffHours} yaliyopita`;
      if (diffHours < 48) return 'Jana';
      return 'Siku kadhaa zilizopita';
    }

    if (user?.lastSeen && user.lastSeen !== 'Sasa hivi') {
      return user.lastSeen;
    }

    return 'Hayupo mtandaoni';
  }

  /**
   * Starts sending real-time heartbeats to Firestore for the currently logged in user.
   */
  public startHeartbeat(userId: string) {
    if (!userId || userId === 'guest') return;

    if (this.currentActiveUserId === userId && this.heartbeatInterval) {
      return;
    }

    this.stopHeartbeat();
    this.currentActiveUserId = userId;

    const ping = async () => {
      try {
        await setDoc(
          doc(db, 'users', userId),
          {
            isOnline: true,
            lastActiveAt: Date.now(),
            lastSeen: 'Sasa hivi',
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Heartbeat notice:', err);
      }
    };

    // Initial ping
    ping();

    // Pulse every 45 seconds while active
    this.heartbeatInterval = setInterval(ping, 45000);

    // Set offline on tab close or navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private handleBeforeUnload = () => {
    if (this.currentActiveUserId) {
      try {
        setDoc(
          doc(db, 'users', this.currentActiveUserId),
          {
            isOnline: false,
            lastActiveAt: Date.now(),
            lastSeen: 'Muda mfupi uliopita',
          },
          { merge: true }
        );
      } catch (_) {}
    }
  };

  /**
   * Stops heartbeats and sets user status to offline.
   */
  public stopHeartbeat(userId?: string) {
    const idToStop = userId || this.currentActiveUserId;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (idToStop && idToStop !== 'guest') {
      try {
        setDoc(
          doc(db, 'users', idToStop),
          {
            isOnline: false,
            lastActiveAt: Date.now(),
            lastSeen: 'Muda mfupi uliopita',
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Stop heartbeat notice:', err);
      }
    }

    this.currentActiveUserId = null;
  }
}

export const presenceService = new PresenceServiceImpl();
export const isUserOnline = (user: any, currentUserId?: string) =>
  presenceService.isUserOnline(user, currentUserId);
export const formatUserLastSeen = (user: any, isOnline = false) =>
  presenceService.formatLastSeen(user, isOnline);
