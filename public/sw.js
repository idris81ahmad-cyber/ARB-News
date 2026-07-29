/* ARB News service worker — shell + saved offline support */
const CACHE = 'arb-news-v2';
const PRECACHE = ['/saved', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Always network-only for API so “latest” is never stuck on a stale cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request)),
    );
    return;
  }

  // Homepage: network-only first (avoid stale empty shells)
  if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname === '')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match('/offline');
      }),
    );
    return;
  }

  // Other navigations: network first, fall back to cache / offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (url.pathname.startsWith('/saved')) {
            return caches.match('/saved');
          }
          return caches.match('/offline');
        }),
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return res;
      });
    }),
  );
});
