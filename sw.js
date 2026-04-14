const CACHE = 'cadi-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/instructor-signup.html',
  '/instructor-dashboard.html',
  '/rob-stanger.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@400;500;600;700;800&display=swap'
];

// Install — cache all assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS.filter(function(url) {
        return !url.startsWith('https://fonts');
      }));
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache first, network fallback
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        // Offline fallback
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
