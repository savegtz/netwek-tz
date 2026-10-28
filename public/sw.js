/**
 * Zenia Service Worker for Push Notifications, Background Sync & PWA Offline
 */

const CACHE_NAME = 'zenia-pwa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
    })()
  );
});

// Real Web Push Event listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'Taarifa Mpya ya Zenia',
    body: 'Una ujumbe au tukio jipya kwenye akaunti yako.',
    icon: '/icon.svg',
    badge: '/icon-badge.svg',
    tag: 'zenia-general',
    data: {},
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon-badge.svg',
    image: data.image,
    tag: data.tag || 'zenia-default-group',
    renotify: data.renotify !== false,
    silent: !!data.silent,
    vibrate: data.silent ? undefined : [120, 60, 120],
    actions: data.actions || [
      { action: 'view', title: '👁️ Angalia' },
      { action: 'reply', title: '💬 Jibu' },
    ],
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Interactive Notification Click / Action buttons handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const notifData = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Notify any active clients about the action button clicked
      let targetedClient = null;
      for (const client of clientList) {
        client.postMessage({
          type: 'ZENIA_NOTIFICATION_ACTION',
          action: action || 'view',
          data: notifData,
        });
        if ('focus' in client && !targetedClient) {
          targetedClient = client;
        }
      }

      if (targetedClient) {
        return targetedClient.focus();
      }

      // If no window is open, open a new window
      if (self.clients.openWindow) {
        const destUrl = notifData.url || '/?tab=notifications';
        return self.clients.openWindow(destUrl);
      }
    })()
  );
});

self.addEventListener('notificationclose', (event) => {
  // Can be used for telemetry or logging dismissed notifications
});

// Message listener from foreground clients to trigger rich, action or progress notifications
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload || {};
    self.registration.showNotification(title || 'Zenia Alert', options || {});
  }

  if (event.data.type === 'UPDATE_PROGRESS_NOTIFICATION') {
    const { title, percent, body, tag } = event.data.payload || {};
    self.registration.showNotification(title || 'Inapakia...', {
      body: `${body || 'Inaendelea'} [${percent}%]`,
      icon: '/icon.svg',
      tag: tag || 'zenia-progress-task',
      renotify: false,
      silent: true,
      data: { percent },
    });
  }
});
