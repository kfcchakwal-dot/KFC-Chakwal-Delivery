const CACHE_NAME = 'kfc-chakwal-v7';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable-192.png',
  '/pwa-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/seller', self.location.origin).href;
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Never let the service worker cache API, manifest or itself.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/sw.js'
  ) {
    return;
  }

  // HTML/navigation is network-first so Chrome always sees the latest
  // manifest/app metadata after a deployment. Fall back to cached shell offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkRequest = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || networkRequest;
    })
  );
});