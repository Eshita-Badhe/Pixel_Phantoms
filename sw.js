const CACHE_NAME = 'pixel-phantoms-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './about.html',
  './contact.html',
  './events.html',
  './pages/join-us.html',
  './pages/projects.html',
  './assets/logo_compressed.png',
  './manifest.json',
  './css/style.min.css',
  './css/back-to-top.css',
  './css/animations.css',
  './css/share-button.css',
  './css/home-gsap.min.css',
  './css/cursor-effect.css',
  './css/scroll-buttons.css',
  './css/stats-widget.css',
  './css/keyboard-shortcuts.css',
  './css/focus.css',
  './css/join-us.css',
  './css/scroll-progress.css',
  './js/navbar.js',
  './js/footer.js',
  './js/cursor-effect.js',
  './js/scroll-buttons.js',
  './js/home-gsap.min.js',
  './js/home-leaderboard.min.js',
  './js/quick-stats.js',
  './js/home-stats-enhanced.js',
  './js/share-button.js',
  './js/join-us.js',
  './js/scroll-progress.js',
  './js/theme.js',
  './js/back-to-top.js',
  './js/keyboard-shortcuts.js',
  './js/main.js',
  './footer.html',
  './data/projects.json',
  './data/events.json',
  './pages/ai-roadmap.html',
  './pages/app-roadmap.html',
  './pages/backend-roadmap.html',
  './pages/bot-roadmap.html',
  './pages/data-analytics-roadmap.html',
  './pages/game-development-roadmap.html',
  './pages/hardware-roadmap.html',
  './pages/python-road.html',
  './pages/react-road.html',
  './pages/system-design-road.html',
  './pages/ui-ux-roadmap.html',
  './pages/web-roadmap.html',
  './pages/tutorials.html',
  './css/ai-roadmap.css',
  './css/app-roadmap.css',
  './css/backend-roadmap.css',
  './css/bot-roadmap.css',
  './css/data-analytics-roadmap.css',
  './css/game-development-roadmap.css',
  './css/hardware-roadmap.css',
  './css/python-road.css',
  './css/react-road.css',
  './css/system-design-road.css',
  './css/ui-ux-roadmap.css',
  './css/web-roadmap.css',
  './js/ai-roadmap.js',
  './js/app-roadmap.js',
  './js/backend-roadmap.js',
  './js/bot-roadmap.js',
  './js/data-analytics-roadmap.js',
  './js/game-development-roadmap.js',
  './js/hardware-roadmap.js',
  './js/python-road.js',
  './js/react-road.js',
  './js/system-design-road.js',
  './js/ui-ux-roadmap.js',
  './js/web-roadmap.js',
  './js/theme-enhanced.js',
];

// Install Service Worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch assets from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request for fetch
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fallback for offline access if resource is not in cache
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
    })
  );
});
