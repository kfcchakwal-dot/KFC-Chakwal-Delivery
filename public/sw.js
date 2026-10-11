// KFC Chakwal Delivery Progressive Web App Service Worker
// Version: 13.0.0 - Reliable PWA Updates & Rich Customer Push Notifications

const CACHE_NAME = 'kfc-chakwal-v13';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable-192.png',
  '/pwa-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
];

// Firebase Background Push Messaging
try {
  importScripts(
    'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js'
  );

  firebase.initializeApp({
    apiKey: 'AIzaSyBa5832EUW-67-jlgM37kaS6zhCu4PLilw',
    authDomain: 'gen-lang-client-0313861453.firebaseapp.com',
    projectId: 'gen-lang-client-0313861453',
    storageBucket: 'gen-lang-client-0313861453.firebasestorage.app',
    messagingSenderId: '909205564375',
    appId: '1:909205564375:web:46603629d1b11823de7992',
  });

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const notif = payload.notification || {};
    const data = payload.data || {};

    const title = notif.title || data.title || '🍗 KFC Chakwal Delivery';
    const body = notif.body || data.body || 'New announcement from KFC Chakwal';
    const icon = notif.icon || '/pwa-192.png';
    const image = notif.image || data.imageUrl || undefined;
    const targetUrl = data.url || payload.fcmOptions?.link || '/';
    const tag = data.tag || data.orderId ? `kfc-order-${data.orderId}` : `kfc-notice-${Date.now()}`;

    const options = {
      body,
      icon,
      badge: '/pwa-192.png',
      image,
      tag,
      requireInteraction: true,
      data: { url: targetUrl },
    };

    return self.registration.showNotification(title, options);
  });
} catch (error) {
  console.warn('Firebase background messaging initialization notice:', error);
}

// Fallback Standard Web Push Event (for direct Web Push APIs)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    const notif = payload.notification || payload;
    const data = payload.data || {};

    const title = notif.title || data.title || '🍗 KFC Chakwal Delivery';
    const body = notif.body || data.body || 'Special deal or menu update!';
    const icon = notif.icon || '/pwa-192.png';
    const image = notif.image || data.imageUrl;
    const url = data.url || payload.fcmOptions?.link || '/';

    const options = {
      body,
      icon,
      badge: '/pwa-192.png',
      image,
      tag: data.tag || `kfc-push-${Date.now()}`,
      requireInteraction: true,
      data: { url },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const rawText = event.data.text();
    event.waitUntil(
      self.registration.showNotification('🍗 KFC Chakwal Delivery', {
        body: rawText,
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        data: { url: '/' },
      })
    );
  }
});

// Notification Click Handler: Opens or focuses app at the target screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
      if (existing) {
        return existing.navigate(targetUrl).then(() => existing.focus());
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Service Worker Update Listener: allows client to trigger immediate activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install: Precache shell assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
});

// Activate: Invalidate and purge obsolete service worker caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart network-first routing with reliable offline support
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // 1. NEVER cache APIs, manifest, service worker or external Auth/Firestore endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/sw.js' ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('fcm.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  // 2. Navigation & Code requests: Network-First so deployed updates load immediately
  const isNavigation = event.request.mode === 'navigate';
  const isCodeOrMarkup =
    isNavigation ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.mjs') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('/@');

  if (isCodeOrMarkup) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (isNavigation) return caches.match('/index.html');
            return null;
          });
        })
    );
    return;
  }

  // 3. Static Media Assets (images, icons, fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});