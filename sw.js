const CACHE_NAME = 'student-dz-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './assets/css/main.css',
    './assets/js/config.js',
    './assets/js/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./offline.html');
                }
            });
        })
    );
});
