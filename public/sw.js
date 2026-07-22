/**
 * Minimal service worker for offline support (Bundle D). Hand-rolled — no
 * workbox/vite-plugin-pwa dep. Strategy:
 *   - navigations: network-first, fall back to the cached app shell offline
 *   - other same-origin GETs (JS/CSS/images, incl. /api/asset media):
 *     stale-while-revalidate (instant from cache, refresh in the background)
 *   - cross-origin + non-GET: bypassed
 *
 * Bump CACHE to invalidate on deploy.
 */
const CACHE = 'perfectpan-blog-v1';
const APP_SHELL = ['/', '/blog', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Don't fail install if a precache target 404s.
      }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return; // cross-origin (e.g. external images) — let the network handle it
  }

  // Navigations: network-first with offline fallback to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then((cached) => cached || caches.match('/blog')),
      ),
    );
    return;
  }

  // Everything else same-origin: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
