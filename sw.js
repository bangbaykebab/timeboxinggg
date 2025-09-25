const CACHE_NAME = 'timebox-cache-v1';
const ASSETS = ['/index.html','/manifest.json','/sw.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // network first for navigation, cache-first for others
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).catch(()=>caches.match('/index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      return caches.open(CACHE_NAME).then(cache=>{ cache.put(req, res.clone()); return res; });
    })).catch(()=>{})
  );
});
