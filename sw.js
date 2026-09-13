const CACHE_NAME = 'student-dz-v4';
const ASSETS_TO_CACHE = [
    './', './index.html', './offline.html',
    './assets/css/main.css', './assets/css/responsive.css',
    './assets/js/config.js', './assets/js/app.js', './assets/js/navigation.js',
    './assets/images/icon.png', './assets/images/icon-192.png', './assets/images/icon-512.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
        for (const asset of ASSETS_TO_CACHE) {
            try { await cache.add(asset); } catch (e) { console.warn('Cache skip:', asset); }
        }
    }));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE_NAME ? null : caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(caches.match(event.request).then(cached =>
        cached || fetch(event.request).catch(() =>
            event.request.mode === 'navigate' ? caches.match('./offline.html') : new Response('', { status: 503 })
        )
    ));
});

// Local browser notifications from the planner while the site is active.
self.addEventListener('message', event => {
    if (event.data?.type !== 'SHOW_PLANNER_NOTIFICATION') return;
    event.waitUntil(self.registration.showNotification(event.data.title || 'Student DZ — تذكير', {
        body: event.data.body || 'لديك تذكير جديد.',
        icon: './assets/images/icon.png', badge: './assets/images/icon-192.png',
        tag: event.data.tag || 'student-dz-planner', requireInteraction: true,
        data: { url: event.data.url || './tools/notes-calendar.html' }
    }));
});
