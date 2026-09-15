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
        if (event.key === 'Escape' && mainNav.classList.contains('active')) { closeMenu(); menuToggle.focus(); }
    });

    // Smart Calculator card integration. Scoped only to the homepage and tools category.
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
        const isCategory = path.includes('/categories/tools.html');
        const isHome = path === '/student-dz/' || path.endsWith('/student-dz/index.html');
        if (!isCategory && !isHome) return;

        if (isCategory) {
            const grid = document.getElementById('toolsGrid');
            if (!grid || grid.querySelector('[data-favorite-id="tool:calculator.html"]')) return;
            grid.insertBefore(createCard('../tools/calculator.html'), grid.firstElementChild);
            loadFavoritesUI();
            return;
        }

        const sections = [...document.querySelectorAll('main .main-section')];
        const toolsSection = sections.find(section => section.querySelector('.section-title')?.textContent.includes('أدوات الطالب'));
        const grid = toolsSection?.querySelector('.grid');
        if (!grid || grid.querySelector('[data-favorite-id="tool:calculator.html"]')) return;
        grid.insertBefore(createCard('tools/calculator.html'), grid.firstElementChild);
        loadFavoritesUI();
    }

    addCalculatorCard();
});
