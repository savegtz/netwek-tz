/**
 * Zenia Push Notification Engine
 * Supports all 9 appearance modes:
 * 1. 🔔 Lock Screen Notification
 * 2. 📱 Notification Banner (Heads-Up)
 * 3. 📥 Notification Panel (System Drawer)
 * 4. 🔴 App Badge (Icon Counter)
 * 5. 🖼️ Rich Notification (Images & Thumbnails)
 * 6. ⚡ Action Notification (Jibu, Angalia, Kubali, Kataa)
 * 7. 📚 Grouped Notification (Bundled by sender/category)
 * 8. 🤫 Silent Notification (Discreet background update)
 * 9. ⏳ Progress Notification (Live 0% - 100% task updates)
 */

export type NotificationMode =
  | 'lock_screen'
  | 'banner'
  | 'panel'
  | 'badge'
  | 'rich'
  | 'action'
  | 'grouped'
  | 'silent'
  | 'progress';

export interface NotificationActionItem {
  action: 'reply' | 'view' | 'accept' | 'reject' | string;
  title: string;
  icon?: string;
}

export interface ZeniaPushPayload {
  id?: string;
  title: string;
  body: string;
  mode?: NotificationMode;
  icon?: string;
  badge?: string;
  image?: string; // Rich media image
  actions?: NotificationActionItem[]; // Quick action buttons
  tag?: string; // Grouping identifier
  renotify?: boolean;
  silent?: boolean;
  progressPercent?: number; // 0 - 100 for Progress notification
  url?: string;
  data?: Record<string, any>;
  timestamp?: number;
}

export interface PushSettings {
  enabled: boolean;
  lockScreenEnabled: boolean;
  bannersEnabled: boolean;
  badgesEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  groupingEnabled: boolean;
  categories: {
    chats: boolean;
    wallet: boolean;
    shop: boolean;
    social: boolean;
    system: boolean;
  };
}

const DEFAULT_SETTINGS: PushSettings = {
  enabled: true,
  lockScreenEnabled: true,
  bannersEnabled: true,
  badgesEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  groupingEnabled: true,
  categories: {
    chats: true,
    wallet: true,
    shop: true,
    social: true,
    system: true,
  },
};

const STORAGE_KEY_SETTINGS = 'zenia_push_settings_v1';
const STORAGE_KEY_UNREAD_COUNT = 'zenia_badge_unread_count';

type ActionCallback = (action: string, payload: ZeniaPushPayload) => void;
type BannerCallback = (payload: ZeniaPushPayload) => void;

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private actionListeners: Set<ActionCallback> = new Set();
  private bannerListeners: Set<BannerCallback> = new Set();
  private progressIntervalMap: Map<string, any> = new Map();

  constructor() {
    this.initServiceWorker();
    this.listenToSwMessages();
  }

  /**
   * Check if the browser supports Notification and ServiceWorker APIs
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Check if Badging API is supported
   */
  public isBadgeSupported(): boolean {
    return typeof navigator !== 'undefined' && ('setAppBadge' in navigator || 'setExperimentalAppBadge' in navigator);
  }

  /**
   * Get current notification permission state
   */
  public getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request native browser push notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.initServiceWorker();
      }
      return permission;
    } catch (e) {
      console.warn('Failed to request notification permission:', e);
      return Notification.permission;
    }
  }

  /**
   * Register service worker at /sw.js
   */
  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;
      return reg;
    } catch (err) {
      console.warn('Service Worker registration skipped or failed:', err);
      return null;
    }
  }

  /**
   * Load stored push preferences
   */
  public getSettings(): PushSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  }

  /**
   * Save user push preferences
   */
  public saveSettings(settings: PushSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (_) {}
  }

  /**
   * Subscribe to in-app Heads-Up Notification banner events
   */
  public onBanner(callback: BannerCallback): () => void {
    this.bannerListeners.add(callback);
    return () => {
      this.bannerListeners.delete(callback);
    };
  }

  /**
   * Subscribe to interactive notification action events (e.g. 'reply', 'view', 'accept', 'reject')
   */
  public onAction(callback: ActionCallback): () => void {
    this.actionListeners.add(callback);
    return () => {
      this.actionListeners.delete(callback);
    };
  }

  /**
   * Listen to postMessages from Service Worker
   */
  private listenToSwMessages(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'ZENIA_NOTIFICATION_ACTION') {
        const { action, data } = event.data;
        this.notifyAction(action, data || {});
      }
    });
  }

  public notifyAction(action: string, payload: ZeniaPushPayload): void {
    this.actionListeners.forEach((cb) => {
      try {
        cb(action, payload);
      } catch (err) {
        console.error('Error in notification action listener:', err);
      }
    });
  }

  /**
   * Play dynamic notification sound chime using Web Audio API synthesis
   */
  public playChime(silent?: boolean): void {
    if (silent) return;
    const settings = this.getSettings();
    if (!settings.soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Create gentle two-tone notification chord (C5 -> G5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.16); // C6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (_) {}
  }

  /**
   * 🔴 4. App Badge Management: Set or clear app icon unread badge
   */
  public async setAppBadge(count: number): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY_UNREAD_COUNT, String(Math.max(0, count)));
      if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      }
      // Emit event for in-app badge synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zenia_app_badge_changed', { detail: { count } }));
      }
    } catch (e) {
      console.warn('Unable to set App Badge:', e);
    }
  }

  public async clearAppBadge(): Promise<void> {
    await this.setAppBadge(0);
  }

  public getAppBadgeCount(): number {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_UNREAD_COUNT) || '0', 10);
    } catch {
      return 0;
    }
  }

  /**
   * Main unified dispatch method for Push Notifications
   */
  public async sendNotification(payload: ZeniaPushPayload): Promise<boolean> {
    const settings = this.getSettings();
    if (!settings.enabled) return false;

    const notifId = payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullPayload: ZeniaPushPayload = {
      ...payload,
      id: notifId,
      timestamp: Date.now(),
      icon: payload.icon || '/icon.svg',
      badge: payload.badge || '/icon-badge.svg',
    };

    // 1. Trigger in-app Heads-Up Notification Banner
    if (settings.bannersEnabled) {
      this.bannerListeners.forEach((cb) => {
        try {
          cb(fullPayload);
        } catch (e) {
          console.error(e);
        }
      });
    }

    // Play chime sound unless silent
    if (!fullPayload.silent) {
      this.playChime(false);
    }

    // 2. Dispatch native OS system notification if permitted
    const permission = this.getPermission();
    if (permission === 'granted') {
      try {
        const sw = this.swRegistration || (await this.initServiceWorker());

        const notifOptions: NotificationOptions & {
          image?: string;
          actions?: { action: string; title: string }[];
          vibrate?: number[];
          renotify?: boolean;
        } = {
          body: fullPayload.body,
          icon: fullPayload.icon,
          badge: fullPayload.badge,
          image: fullPayload.image,
          tag: fullPayload.tag || 'zenia-general',
          renotify: fullPayload.renotify !== false,
          silent: !!fullPayload.silent,
          data: fullPayload,
        };

        // Actions support (Chromium/Android Web Push)
        if (fullPayload.actions && fullPayload.actions.length > 0) {
          (notifOptions as any).actions = fullPayload.actions.map((act) => ({
            action: act.action,
            title: act.title,
          }));
        }

        // Vibrate
        if (settings.vibrationEnabled && !fullPayload.silent) {
          (notifOptions as any).vibrate = [150, 75, 150];
        }

        if (sw && sw.showNotification) {
          await sw.showNotification(fullPayload.title, notifOptions);
          return true;
        } else if (typeof Notification !== 'undefined') {
          // Standard browser fallback
          new Notification(fullPayload.title, notifOptions);
          return true;
        }
      } catch (err) {
        console.warn('Native system notification error:', err);
      }
    }

    return true;
  }

  // =========================================================================
  // SPECIFIC PRESET DEMOS FOR THE 9 MODES REQUESTED BY THE USER:
  // =========================================================================

  /**
   * 1. 🔔 Lock Screen Notification (Simu ikiwa imefungwa)
   */
  public async triggerLockScreenDemo(): Promise<void> {
    await this.sendNotification({
      title: '🔔 Ujumbe Mpya (Lock Screen)',
      body: 'Sarah Mwangi: "Mambo! Nimepokea oda ya nguo, nakuja kuchukua saa 11 jioni."',
      mode: 'lock_screen',
      tag: 'zenia-lockscreen-chat',
      image: '/assets/images/sarah_avatar_1790802224123.jpg',
      actions: [
        { action: 'reply', title: '💬 Jibu' },
        { action: 'view', title: '👁️ Angalia' },
      ],
      data: { sender: 'Sarah Mwangi', screen: 'lock_screen' },
    });
  }

  /**
   * 2. 📱 Notification Banner (Bango la juu ya skrini)
   */
  public async triggerBannerDemo(): Promise<void> {
    await this.sendNotification({
      title: '📱 Pochi ya Zenia: Malipo Yamepokelewa',
      body: 'Umetumiwa TZS 85,000 kutoka kwa Alex Kanyama kupitia P2P Transfer.',
      mode: 'banner',
      tag: 'zenia-wallet-banner',
      image: '/assets/images/alex_avatar_1790802235334.jpg',
      actions: [
        { action: 'view', title: '💰 Fungua Pochi' },
        { action: 'reply', title: '🙏 Mshukuru' },
      ],
      data: { amount: 85000, type: 'wallet_transfer' },
    });
  }

  /**
   * 3. 📥 Notification Panel (Droo ya juu ya simu)
   */
  public async triggerPanelDemo(): Promise<void> {
    await this.sendNotification({
      title: '📥 Droo ya Taarifa: Tangazo la Soko',
      body: 'iPhone 15 Pro Max imepunguzwa bei kwa 15% na Fresh kk! Bofya kuona ofa.',
      mode: 'panel',
      tag: 'zenia-market-panel',
      image: '/assets/images/wireless_earbuds_1790280984496.jpg',
      actions: [
        { action: 'view', title: '🛒 Nunua Sasa' },
        { action: 'reject', title: 'Ondoa' },
      ],
      data: { itemId: 'prod_iphone15', screen: 'shop' },
    });
  }

  /**
   * 4. 🔴 App Badge (Alama ya idadi kwenye icon ya app)
   */
  public async triggerBadgeDemo(customCount?: number): Promise<number> {
    const current = this.getAppBadgeCount();
    const nextCount = customCount !== undefined ? customCount : (current % 9) + 3;
    await this.setAppBadge(nextCount);

    await this.sendNotification({
      title: `🔴 Alama ya Idadi: Jumla ya Taarifa (${nextCount})`,
      body: `Icon ya Zenia sasa inaonyesha badge ya namba "${nextCount}" juu yake.`,
      mode: 'badge',
      tag: 'zenia-badge-alert',
      data: { badgeCount: nextCount },
    });

    return nextCount;
  }

  /**
   * 5. 🖼️ Rich Notification (Picha kubwa, thumbnail ya video, avatar)
   */
  public async triggerRichNotificationDemo(): Promise<void> {
    await this.sendNotification({
      title: '🖼️ Rich Notification: Tamasha la Serengeti Live',
      body: 'Sarah Mwangi ameanza kurusha video mubashara kutoka Serengeti Music Festival!',
      mode: 'rich',
      tag: 'zenia-rich-event',
      image: '/assets/images/concert_festival_1790280974630.jpg',
      actions: [
        { action: 'view', title: '▶️ Tazama Live' },
        { action: 'reply', title: '❤️ Weka Like' },
      ],
      data: { streamId: 'event_serengeti_live' },
    });
  }

  /**
   * 6. ⚡ Action Notification (Vitufe vya Jibu, Angalia, Kubali, Kataa)
   */
  public async triggerActionDemo(type: 'order' | 'chat' = 'order'): Promise<void> {
    if (type === 'order') {
      await this.sendNotification({
        title: '⚡ Ombi Jipya la Usafiri (Ride Request)',
        body: 'Mteja Juma Selemani anahitaji usafiri kutoka Posta kwenda Masaki. Nauli: TZS 14,000.',
        mode: 'action',
        tag: 'zenia-ride-request',
        image: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
        actions: [
          { action: 'accept', title: '✅ Kubali Safari' },
          { action: 'reject', title: '❌ Kataa' },
        ],
        data: { requestId: 'ride_982', fee: 14000 },
      });
    } else {
      await this.sendNotification({
        title: '⚡ Ujumbe wa Haraka: Amina Kaunga',
        body: '"Habari, je mzigo ule uko tayari kwa ajili ya safari kesho asubuhi?"',
        mode: 'action',
        tag: 'zenia-quick-chat',
        image: '/assets/images/amina_avatar_1790280951312.jpg',
        actions: [
          { action: 'reply', title: '💬 Jibu Papo Hapo' },
          { action: 'view', title: '👁️ Angalia Chat' },
        ],
        data: { sender: 'Amina Kaunga' },
      });
    }
  }

  /**
   * 7. 📚 Grouped Notification (Kukusanya ujumbe wa mtumaji mmoja bila kujaza panel)
   */
  public async triggerGroupedDemo(): Promise<void> {
    const sender = 'Fresh kk';
    const tag = 'zenia-group-freshkk';

    // Step 1: Send Message 1
    await this.sendNotification({
      title: `${sender} (Ujumbe 1/3)`,
      body: 'Habari kiongozi! Mzigo wa simu umefika Kariakoo.',
      mode: 'grouped',
      tag,
      renotify: true,
      image: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
      actions: [{ action: 'view', title: 'Fungua Kikundi' }],
    });

    // Step 2: Send Message 2 (Groups into the same tag)
    setTimeout(async () => {
      await this.sendNotification({
        title: `${sender} (Ujumbe 2/3)`,
        body: 'Pia nimepokea vifurushi vya headphones na smartwatches.',
        mode: 'grouped',
        tag,
        renotify: true,
        image: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
        actions: [{ action: 'view', title: 'Fungua Kikundi' }],
      });
    }, 1200);

    // Step 3: Send Bundled Summary
    setTimeout(async () => {
      await this.sendNotification({
        title: `📚 ${sender} (Ujumbe 3 Mpya - Grouped)`,
        body: '3 ujumbe mpya kutoka kwa Fresh kk: Mzigo wa simu, headphones na risiti.',
        mode: 'grouped',
        tag,
        renotify: true,
        image: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
        actions: [
          { action: 'reply', title: '💬 Jibu Zote' },
          { action: 'view', title: '👁️ Fungua Mazungumzo' },
        ],
      });
    }, 2500);
  }

  /**
   * 8. 🤫 Silent Notification (Kimyakimya bila sauti au banner intrusive)
   */
  public async triggerSilentDemo(): Promise<void> {
    await this.sendNotification({
      title: '🤫 Taarifa ya Kimyakimya (Silent Sync)',
      body: 'Hifadhidata ya mazungumzo na soko imesawazishwa bila sauti wala mtetemo.',
      mode: 'silent',
      silent: true,
      tag: 'zenia-silent-sync',
      data: { syncTime: new Date().toLocaleTimeString() },
    });
  }

  /**
   * 9. ⏳ Progress Notification (Maendeleo ya upakuaji au kupakia faili 0% - 100%)
   */
  public startProgressDemo(
    taskName: string = 'Kupakua Video ya Muziki (Bongo Flava 4K)'
  ): void {
    const tag = 'zenia-progress-download';
    // Clear any previous running simulation
    if (this.progressIntervalMap.has(tag)) {
      clearInterval(this.progressIntervalMap.get(tag));
    }

    let progress = 5;

    // Send initial 5%
    this.sendNotification({
      title: `⏳ Inapakua: ${taskName}`,
      body: `Maendeleo: 5% yamekamilika... [MB 2.4 / 48 MB]`,
      mode: 'progress',
      tag,
      renotify: false,
      progressPercent: progress,
      actions: [{ action: 'reject', title: '🛑 Ghairi Kupakua' }],
    });

    const interval = setInterval(async () => {
      progress += Math.floor(Math.random() * 15) + 12;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.progressIntervalMap.delete(tag);

        await this.sendNotification({
          title: `✅ Upakuaji Umekamilika (100%)!`,
          body: `${taskName} ipo tayari kwenye ghala ya simu yako.`,
          mode: 'progress',
          tag,
          renotify: true,
          progressPercent: 100,
          image: '/assets/images/concert_festival_1790280974630.jpg',
          actions: [
            { action: 'view', title: '▶️ Cheza Video' },
            { action: 'reply', title: '📤 Shiriki' },
          ],
        });
        return;
      }

      await this.sendNotification({
        title: `⏳ Inapakua: ${taskName} (${progress}%)`,
        body: `Maendeleo: ${progress}% • Inatuma data salama kwenda kwenye akiba.`,
        mode: 'progress',
        tag,
        renotify: false,
        silent: true,
        progressPercent: progress,
        actions: [{ action: 'reject', title: '🛑 Ghairi Kupakua' }],
      });
    }, 1100);

    this.progressIntervalMap.set(tag, interval);
  }

  public cancelProgressDemo(): void {
    const tag = 'zenia-progress-download';
    if (this.progressIntervalMap.has(tag)) {
      clearInterval(this.progressIntervalMap.get(tag));
      this.progressIntervalMap.delete(tag);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
