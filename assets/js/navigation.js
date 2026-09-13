// Unified mobile navigation for all Student DZ pages.
// A few legacy pages reference .mobile-menu-btn; provide a harmless compatibility node
// so their old initialization code cannot throw before the unified handler runs.
if (!document.querySelector('.mobile-menu-btn')) {
    const legacyMenuHook = document.createElement('span');
    legacyMenuHook.className = 'mobile-menu-btn';
    legacyMenuHook.hidden = true;
    document.documentElement.appendChild(legacyMenuHook);
}

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (!menuToggle || !mainNav) return;

    const closeMenu = () => {
        mainNav.classList.remove('active');
        menuToggle.textContent = '☰';
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = (event) => {
        event.stopPropagation();
        const isOpen = mainNav.classList.toggle('active');
        menuToggle.textContent = isOpen ? '✕' : '☰';
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    menuToggle.type = 'button';
    menuToggle.setAttribute('aria-controls', 'mainNav');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', toggleMenu);
    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (event) => {
        if (mainNav.classList.contains('active') && !event.target.closest('#mainNav') && !event.target.closest('#menuToggle')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMenu();
            menuToggle.focus();
        }
    });
});

/*
 * Student DZ planner notifications.
 * The planner keeps entries in localStorage. This bridge registers the site's
 * Service Worker and uses Notification Triggers when the browser supports them.
 * Scheduled notifications are owned by the browser/OS and may fire after the
 * planner tab is closed. Unsupported browsers keep the normal foreground path.
 */
(() => {
    'use strict';

    const PLANNER_PATH = '/student-dz/tools/notes-calendar.html';
    const STORAGE_KEY = 'studentDzPlannerEntries';
    const SCHEDULE_PREFIX = 'student-dz-scheduled-';
    let lastSnapshot = '';
    let scheduling = false;

    if (!location.pathname.endsWith('/tools/notes-calendar.html')) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    const readEntries = () => {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (_) { return []; }
    };

    const entryTime = (entry) => new Date(`${entry.date}T${entry.time}:00`).getTime();
    const reminderTime = (entry) => entryTime(entry) - Number(entry.reminder || 0) * 60000;
    const tagFor = (entry) => `${SCHEDULE_PREFIX}${entry.id}`;

    const updateStatus = (message) => {
        const box = document.getElementById('notificationStatus');
        if (!box || !message) return;
        if (!box.textContent.includes(message)) box.insertAdjacentHTML('beforeend', ` <span>• ${message}</span>`);
    };

    async function registerWorker() {
        try {
            return await navigator.serviceWorker.register('/student-dz/sw.js', { scope: '/student-dz/' });
        } catch (error) {
            console.warn('Student DZ Service Worker registration failed:', error);
            return null;
        }
    }

    async function cancelScheduled(registration, tag) {
        try {
            const notifications = await registration.getNotifications({ tag });
            notifications.forEach(notification => notification.close());
        } catch (_) {}
    }

    async function scheduleNotifications(registration) {
        if (scheduling || Notification.permission !== 'granted') return;
        if (typeof window.TimestampTrigger !== 'function' || typeof registration.showNotification !== 'function') {
            updateStatus('الإشعار بعد الإغلاق الكامل يحتاج دعماً من المتصفح لـ Notification Triggers.');
            return;
        }

        scheduling = true;
        try {
            const entries = readEntries();
            const future = entries.filter(entry => {
                if (!entry || (entry.type === 'task' && entry.done)) return false;
                const when = reminderTime(entry);
                return Number.isFinite(when) && when > Date.now() + 1000;
            });

            for (const entry of entries) await cancelScheduled(registration, tagFor(entry));

            for (const entry of future) {
                const minutes = Number(entry.reminder || 0);
                const label = minutes === 0 ? 'عند الموعد' : `قبل ${minutes} دقيقة`;
                try {
                    await registration.showNotification('Student DZ — تذكير', {
                        body: `${entry.title} — ${entry.time} (${label})`,
                        icon: '/student-dz/assets/images/icon.png',
                        badge: '/student-dz/assets/images/icon-192.png',
                        tag: tagFor(entry),
                        renotify: false,
                        requireInteraction: true,
                        showTrigger: new window.TimestampTrigger(reminderTime(entry)),
                        data: { url: PLANNER_PATH, entryId: entry.id }
                    });
                } catch (error) {
                    console.warn('Could not schedule planner notification:', error);
                }
            }

            lastSnapshot = JSON.stringify(entries);
            if (future.length) updateStatus(`تمت جدولة ${future.length} منبه(ات) للتذكير.`);
        } finally {
            scheduling = false;
        }
    }

    async function boot() {
        const registration = await registerWorker();
        if (!registration) return;
        await navigator.serviceWorker.ready;

        const sync = () => {
            const snapshot = JSON.stringify(readEntries());
            if (snapshot !== lastSnapshot) scheduleNotifications(registration);
        };

        const notifyButton = document.getElementById('notifyBtn');
        if (notifyButton) notifyButton.addEventListener('click', () => setTimeout(() => scheduleNotifications(registration), 500));

        sync();
        // localStorage changes made in the same tab do not emit storage events.
        // This lightweight check catches save/edit/delete operations while the page is open.
        setInterval(sync, 2000);
        window.addEventListener('focus', sync);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
    }

    if (document.readyState === 'loading') window.addEventListener('load', boot, { once: true });
    else boot();
})();
