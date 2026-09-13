// Student DZ service worker: network-fresh content with resilient offline fallback.
// The cache name is stable; changing this file is not required for normal content updates.
const CACHE_NAME = 'student-dz-runtime';
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
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

const isPageOrJson = request => request.mode === 'navigate' || new URL(request.url).pathname.endsWith('.json');

// Stale-while-revalidate for HTML/JSON: return cached data immediately, then refresh it in the background.
const staleWhileRevalidate = async request => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);
    return cached || await network || (request.mode === 'navigate' ? await cache.match('./offline.html') : new Response('', { status: 503 }));
};

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (isPageOrJson(event.request)) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }
    // Static assets remain cache-first for fast repeat visits.
    event.respondWith(caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(response => {
            if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
            }
            return response;
        }).catch(() => new Response('', { status: 503 }))
    ));
});

self.addEventListener('message', event => {
    if (event.data?.type !== 'SHOW_PLANNER_NOTIFICATION') return;
    event.waitUntil(self.registration.showNotification(event.data.title || 'Student DZ — تذكير', {
        body: event.data.body || 'لديك تذكير جديد.', icon: './assets/images/icon.png', badge: './assets/images/icon-192.png',
        tag: event.data.tag || 'student-dz-planner', requireInteraction: true,
        data: { url: event.data.url || './tools/notes-calendar.html' }
    }));
});
