// Unified mobile navigation for all Student DZ pages.
if (!document.querySelector('.mobile-menu-btn')) {
    const legacyMenuHook = document.createElement('span');
    legacyMenuHook.className = 'mobile-menu-btn';
    legacyMenuHook.hidden = true;
    document.documentElement.appendChild(legacyMenuHook);
}

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (!mainNav) return;

    // Accessible, dependency-free icons shared by all main navigation links.
    // Match the destination path, not the displayed label, so shortened labels work too.
    const navIconPaths = {
        '/student-dz/index.html': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M9 22V12h6v10"/>',
        '/student-dz/universities/index.html': '<path d="M3 22h18M6 18v-7m4 7v-7m4 7v-7m4 7v-7M2 10h20L12 3 2 10ZM4 22v-4m16 4v-4"/>',
        '/student-dz/ecoles/index.html': '<path d="M22 10v6M2 10l10-6 10 6-10 6-10-6ZM6 13v5c3 2.5 9 2.5 12 0v-5"/>',
        '/student-dz/residences/index.html': '<path d="M3 20v-9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9M3 15h18M3 20v2m18-2v2M7 9V6h10v3"/>',
        '/student-dz/transport/index.html': '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 15h.01M16 15h.01M8 18v3m8-3v3"/>',
        '/student-dz/tools/maps.html': '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
        '/student-dz/categories/tools.html': '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6.6 6.6a2 2 0 0 0 2.8 2.8l6.6-6.6a4 4 0 0 0 5.4-5.4l-2.7 2.7-2.8-2.8 2.7-2.7Z"/>',
        '/student-dz/categories/student-life.html': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
        '/student-dz/platforms/index.html': '<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M8 21h8m-4-3v3M2 8h20"/>',
        '/student-dz/pages/favorites.html': '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'
    };
    const homeIcon = navIconPaths['/student-dz/index.html'];
    mainNav.querySelectorAll('a.nav-link[href]').forEach(link => {
        if (link.querySelector('.nav-icon')) return;
        let path;
        try { path = new URL(link.getAttribute('href'), document.baseURI).pathname; }
        catch { return; }
        const iconPaths = path === '/student-dz/' ? homeIcon : navIconPaths[path];
        if (!iconPaths) return;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('nav-icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.9');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.innerHTML = iconPaths; // All path markup comes from the fixed map above.
        link.prepend(svg);
    });

    if (!menuToggle) return;
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
        if (event.key === 'Escape' && mainNav.classList.contains('active')) { closeMenu(); menuToggle.focus(); }
    });

    // Smart Calculator card integration. Scoped only to the homepage.
    const calculator = {
        id: 'tool:calculator.html',
        title: 'الآلة الحاسبة الذكية',
        description: 'احسب المعادلات واحفظ النتائج والمعادلات في المتصفح مع إمكانية التعديل والحذف وإعادة الاستخدام',
        icon: 'fa-solid fa-calculator'
    };

    function loadFavoritesUI() {
        if (window.StudentFavoritesUI) {
            window.StudentFavoritesUI.bind(document);
            return;
        }
        if (document.querySelector('script[data-student-favorites-ui]')) return;
        const script = document.createElement('script');
        script.src = `${window.CONFIG?.BASE_PATH || '/student-dz'}/assets/js/favorites-ui.js`;
        script.dataset.studentFavoritesUi = 'true';
        script.onload = () => window.StudentFavoritesUI?.bind(document);
        document.body.appendChild(script);
    }

    function createCard(relativeUrl) {
        const card = document.createElement('a');
        card.href = relativeUrl;
        card.className = 'card favorite-card';
        card.setAttribute('data-favorite-id', calculator.id);
        card.setAttribute('data-favorite-title', calculator.title);
        card.setAttribute('data-favorite-description', calculator.description);
        card.setAttribute('data-favorite-url', relativeUrl);
        card.setAttribute('data-favorite-type', 'tools');
        card.setAttribute('data-favorite-icon', calculator.icon);
        card.innerHTML = `<div class="card-icon"><i class="${calculator.icon}"></i></div><h3 class="card-title">${calculator.title}</h3><p class="card-desc">${calculator.description}</p>`;
        return card;
    }

    function addCalculatorCard() {
        const path = window.location.pathname;
        const isHome = path === '/student-dz/' || path.endsWith('/student-dz/index.html');
        if (!isHome) return;

        const sections = [...document.querySelectorAll('main .main-section')];
        const toolsSection = sections.find(section => section.querySelector('.section-title')?.textContent.includes('أدوات الطالب'));
        const grid = toolsSection?.querySelector('.grid');
        if (!grid || grid.querySelector('[data-favorite-id="tool:calculator.html"]')) return;
        grid.insertBefore(createCard('tools/calculator.html'), grid.firstElementChild);
        loadFavoritesUI();
    }

    addCalculatorCard();
});
