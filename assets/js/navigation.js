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
});
