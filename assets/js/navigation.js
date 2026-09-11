// Unified mobile navigation for all Student DZ pages.
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

    // Close after selecting a page.
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close when tapping outside the menu/button.
    document.addEventListener('click', (event) => {
        if (mainNav.classList.contains('active') &&
            !event.target.closest('#mainNav') &&
            !event.target.closest('#menuToggle')) {
            closeMenu();
        }
    });

    // Close with Escape for keyboard accessibility.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMenu();
            menuToggle.focus();
        }
    });
});
