/**
 * Minimal service worker for offline support (Bundle D). Hand-rolled — no
 * workbox/vite-plugin-pwa dep. Strategy:
 *   - navigations: network-only, with a static offline message
 *   - public static assets (JS/CSS/images):
 *     stale-while-revalidate (instant from cache, refresh in the background)
 *   - cross-origin + non-GET: bypassed
 *
 * Bump CACHE to invalidate on deploy.
 */
const CACHE = 'perfectpan-blog-v2';
const APP_SHELL = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

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
          keys
            .filter(
              (key) => key.startsWith('perfectpan-blog-') && key !== CACHE,
            )
            .map((key) => caches.delete(key)),
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

  // HTML and API/RPC responses can contain session-specific data. Never
  // retain them across login, logout, or account linking.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response('You are offline. Reconnect and reload this page.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          }),
      ),
    );
    return;
  }

  if (
    !url.pathname.startsWith('/assets/') &&
    !url.pathname.startsWith('/images/') &&
    !APP_SHELL.includes(url.pathname)
  ) {
    return;
  }

  // Only public static files use stale-while-revalidate.
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
