// Simple Service Worker for basic offline + PWA caching
const CACHE_NAME = 'tb-checklist-v1';
const ASSETS = [
  '/', // index
  '/manifest.json'
  // Note: index.html inline contains CSS/JS, so no other files required.
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err=>{
        // ignore individual failures
        console.warn('SW: cache add error', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if(k !== CACHE_NAME) return caches.delete(k);
      })
    ))
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate strategy for app shell
self.addEventListener('fetch', event => {
  const req = event.request;
  // Only handle GET
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkResponse => {
        // update cache for same-origin GET requests (non opaque)
        if(networkResponse && networkResponse.status === 200 && req.url.startsWith(self.location.origin)){
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(()=> null);
      // return cached if exist, otherwise network
      return cached || fetchPromise || new Response('', {status: 503, statusText: 'Service Unavailable'});
    })
  );
});
