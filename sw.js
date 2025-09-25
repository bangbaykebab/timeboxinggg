const CACHE_NAME = 'timeboxing-v1';
  const URLS = [ '/', '/index.html' ];

  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(URLS))
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  });
  -->

  <!-- Notes: 
    1) Create manifest.json and service-worker.js files using the commented content above.
    2) Add icon-192.png and icon-512.png to site root.
    3) Deploy to Netlify (drag & drop or connect GitHub). After deploy, open site in iPhone Safari and use "Add to Home Screen" to install PWA. 
    4) All data is stored in localStorage (no backend). 
    5) JS code contains comments and is kept plain for easy editing.
