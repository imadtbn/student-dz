const CACHE_NAME = 'student-dz-v3';
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
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of ASSETS_TO_CACHE) {
                try { await cache.add(asset); } catch (error) { console.warn('Cache skip:', asset, error); }
            }
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cache) => cache === CACHE_NAME ? null : caches.delete(cache))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') return caches.match('./offline.html');
                return new Response('', { status: 503, statusText: 'Offline' });
            });
        })
    );
});

// Display notifications requested by the planner page.
self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type !== 'SHOW_PLANNER_NOTIFICATION') return;

    const title = data.title || 'Student DZ — تذكير';
    const options = {
        body: data.body || 'لديك موعد أو مهمة قادمة.',
        icon: data.icon || './assets/images/icon.png',
        badge: data.badge || './assets/images/icon-192.png',
        tag: data.tag || 'student-dz-planner',
        renotify: false,
        requireInteraction: true,
        data: { url: data.url || './tools/notes-calendar.html' }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click: return the student to the planner and focus an existing tab when possible.
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = new URL(
        event.notification.data?.url || './tools/notes-calendar.html',
        self.registration.scope
    ).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    if (client.url !== targetUrl && 'navigate' in client) client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});

// Best-effort background wake-up for browsers that support Periodic Background Sync.
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'student-dz-reminders') {
        event.waitUntil(self.registration.showNotification('Student DZ — تذكيراتك', {
            body: 'افتح سجل المواعيد والمهام للتحقق من التذكيرات القادمة.',
            icon: './assets/images/icon.png',
            badge: './assets/images/icon-192.png',
            tag: 'student-dz-background-check',
            data: { url: './tools/notes-calendar.html' }
        }));
    }
});
