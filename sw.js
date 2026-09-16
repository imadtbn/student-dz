// Student DZ service worker: fresh navigation/data with fast static assets and resilient offline fallback.
const CACHE_NAME = 'student-dz-runtime-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './assets/css/main.css',
    './assets/css/responsive.css',
    './assets/css/ads.css',
    './assets/js/config.js',
    './assets/js/app.js',
    './assets/js/navigation.js',
    './assets/images/icon.png',
    './assets/images/icon-192.png',
    './assets/images/icon-512.png'
];

const isSameOrigin = request => new URL(request.url).origin === self.location.origin;
const isNavigation = request => request.mode === 'navigate';
const isJson = request => new URL(request.url).pathname.endsWith('.json');

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            await Promise.all(ASSETS_TO_CACHE.map(async asset => {
                try {
                    await cache.add(asset);
                } catch (error) {
                    console.warn('Cache skip:', asset);
                }
            }));
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Keep query-string cache busters (e.g. ?updated=...) from creating unlimited entries.
const cacheKey = request => {
    const url = new URL(request.url);
    url.search = '';
    url.hash = '';
    return new Request(url.toString(), { method: 'GET' });
};

const networkFirst = async request => {
    const cache = await caches.open(CACHE_NAME);
    const key = cacheKey(request);

    try {
        const response = await fetch(request);
        if (response && response.ok && isSameOrigin(request)) {
            await cache.put(key, response.clone());
        }
        return response;
    } catch (error) {
        return cache.match(key);
    }
};

const staticFirst = async request => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.ok && isSameOrigin(request)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('', { status: 503 });
    }
};

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || !isSameOrigin(request)) return;

    if (isNavigation(request) || isJson(request)) {
        event.respondWith(
            networkFirst(request).then(response =>
                response || (isNavigation(request)
                    ? caches.match('./offline.html')
                    : new Response('', { status: 503 }))
            )
        );
        return;
    }

    event.respondWith(staticFirst(request));
});

self.addEventListener('message', event => {
    if (event.data?.type !== 'SHOW_PLANNER_NOTIFICATION') return;

    event.waitUntil(
        self.registration.showNotification(event.data.title || 'Student DZ — تذكير', {
            body: event.data.body || 'لديك تذكير جديد.',
            icon: './assets/images/icon.png',
            badge: './assets/images/icon-192.png',
            tag: event.data.tag || 'student-dz-planner',
            requireInteraction: true,
            data: { url: event.data.url || './tools/notes-calendar.html' }
        })
    );
});
