const CACHE_NAME = 'student-dz-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './assets/css/main.css',
    './assets/css/responsive.css',
    './assets/js/config.js',
    './assets/js/app.js',
    './assets/js/navigation.js',
    './assets/images/icon.png',
    './assets/images/icon-192.png',
    './assets/images/icon-512.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Return cached version or fetch from network
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./offline.html');
                }
            });
        })
    );
});
