/* PapanMaya service worker — installable PWA, no browser push.
 * Strategy: precache + cache-first for static assets (icons/splash/css)
 * only. HTML/API/auth are network-only so login redirects and live
 * board data are never served stale from cache.
 */
const CACHE = 'papanmaya-v1';
const CORE = [
  '/favicon.ico',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStatic(path) {
  return (
    path.startsWith('/icons/') ||
    path.startsWith('/splash/') ||
    path.startsWith('/assets/') ||
    path === '/favicon.ico' ||
    path === '/manifest.webmanifest' ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.png') ||
    path.endsWith('.ico') ||
    path.endsWith('.svg') ||
    path.endsWith('.woff2')
  );
}

function isDynamic(path) {
  return (
    path.startsWith('/api/') ||
    path.startsWith('/webhook/') ||
    path.startsWith('/user/') ||
    path.startsWith('/auth/')
  );
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (isDynamic(url.pathname)) return; // network-only
  if (!isStatic(url.pathname)) return; // navigations & HTML: network-only
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
