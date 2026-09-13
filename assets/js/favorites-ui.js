// Unified favorite-star UI for Student DZ cards.
(function () {
    'use strict';

    const ICON_OFF = 'fa-regular fa-star';
    const ICON_ON = 'fa-solid fa-star';

    function value(el, name) {
        return el.getAttribute('data-favorite-' + name) || '';
    }

    function itemFrom(el) {
        return {
            id: value(el, 'id'),
            title: value(el, 'title'),
            description: value(el, 'description'),
            url: value(el, 'url'),
            icon: value(el, 'icon') || 'fa-solid fa-star',
            type: value(el, 'type') || 'tools'
        };
    }

    function updateButton(button, active) {
        button.classList.toggle('is-favorite', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', active ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة');
        button.title = active ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
        button.innerHTML = `<i class="${active ? ICON_ON : ICON_OFF}" aria-hidden="true"></i>`;
    }

    function bindCard(card) {
        if (!card || card.dataset.favoriteBound === 'true') return;
        const item = itemFrom(card);
        if (!item.id || !item.title || !item.url) return;

        card.dataset.favoriteBound = 'true';
        card.classList.add('favorite-card');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'favorite-toggle';
        button.dataset.favoriteButton = 'true';
        updateButton(button, window.StudentFavorites.has(item.id));

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const active = window.StudentFavorites.toggle(item);
            updateButton(button, active);
            document.dispatchEvent(new CustomEvent('student-dz:favorite-change', {
                detail: { id: item.id, active: active, item: item }
            }));
        });

        card.insertBefore(button, card.firstChild);
    }

    function bindAll(root) {
        if (!window.StudentFavorites) return;
        (root || document).querySelectorAll('[data-favorite-id]').forEach(bindCard);
    }

    window.StudentFavoritesUI = { bind: bindAll, refresh: bindAll };

    document.addEventListener('DOMContentLoaded', function () {
        bindAll(document);

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.matches && node.matches('[data-favorite-id]')) bindCard(node);
                    bindAll(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
