// Theme Management
(function() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    let currentTheme = storedTheme ? storedTheme : 'light';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    applyTheme(currentTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            applyTheme(currentTheme);
        });
    }

    // Study schedule enhancement: load only on its own page.
    if (window.location.pathname.endsWith('/tools/study-schedule.html')) {
        const script = document.createElement('script');
        script.src = '../assets/js/study-schedule.js';
        script.defer = true;
        document.head.appendChild(script);
    }
})();
