// Mobile Navigation
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mainNav && mainNav.classList.contains('active') && !e.target.closest('.site-header')) {
            mainNav.classList.remove('active');
            menuToggle.textContent = '☰';
        }
    });
});
