// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(CONFIG.getUrl('sw.js'))
        .then(reg => console.log('SW Registered', reg))
        .catch(err => console.log('SW Registration failed', err));
    });
}
