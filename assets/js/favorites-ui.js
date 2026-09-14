// Unified favorite-star UI + verification badge for Student DZ directory cards.
(function () {
    'use strict';

    const ICON_OFF = 'fa-regular fa-star';
    const ICON_ON = 'fa-solid fa-star';
    let verificationRegistry = { universities: {}, ecoles: {}, residences: {} };

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

    function getVerificationStatus(card) {
        const type = value(card, 'type');
        const id = value(card, 'id').replace(/^(university|school|ecole|residence):/, '');

        // The cards use "schools" for favorites, while the central registry
        // stores school/institute records under the Arabic directory key "ecoles".
        const registryKey = type === 'schools' ? 'ecoles' : type;
        const collection = verificationRegistry[registryKey];

        // The central verification registry is the source of truth when available.
        if (collection && collection[id]) return collection[id];

        const explicit = (card.getAttribute('data-verification-status') || '').toLowerCase();
        if (explicit === 'verified' || explicit === 'review' || explicit === 'pending') return explicit;
        return 'pending';
    }

    function addVerificationBadge(card) {
        // Verification has meaning only for university, school/institute and residence records.
        const type = value(card, 'type');
        if (!['universities', 'schools', 'ecoles', 'residences'].includes(type)) return;

        let badge = card.querySelector('.data-verification-badge');
        const status = getVerificationStatus(card);
        card.setAttribute('data-verification-status', status);

        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'data-verification-badge';
            badge.setAttribute('role', 'img');
            card.insertBefore(badge, card.firstChild);
        }

        badge.className = 'data-verification-badge verification-' + status;
        if (status === 'verified') {
            badge.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
            badge.setAttribute('aria-label', 'بيانات مؤكدة');
            badge.title = 'بيانات مؤكدة — تم التحقق من المعلومات';
        } else if (status === 'review') {
            badge.innerHTML = '<i class="fa-solid fa-clock" aria-hidden="true"></i>';
            badge.setAttribute('aria-label', 'البيانات قيد المراجعة');
            badge.title = 'البيانات قيد المراجعة — تحتاج إلى مراجعة يدوية';
        } else {
            badge.innerHTML = '<i class="fa-solid fa-circle-question" aria-hidden="true"></i>';
            badge.setAttribute('aria-label', 'البيانات غير مؤكدة');
            badge.title = 'البيانات غير مؤكدة — لم تتم مراجعتها بعد';
        }
    }

    function bindCard(card) {
        if (!card) return;
        const item = itemFrom(card);
        if (!item.id || !item.title || !item.url) return;

        card.classList.add('favorite-card');
        addVerificationBadge(card);

        if (card.dataset.favoriteBound === 'true') {
            const button = card.querySelector('.favorite-toggle');
            if (button) updateButton(button, window.StudentFavorites.has(item.id));
            return;
        }

        card.dataset.favoriteBound = 'true';
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

    async function loadVerificationRegistry() {
        try {
            const base = window.CONFIG?.BASE_PATH || '/student-dz';
            const response = await fetch(`${base}/data/verification-status.json?updated=${Date.now()}`, {
                cache: 'no-store'
            });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            verificationRegistry = await response.json();
        } catch (error) {
            console.warn('Student DZ verification registry unavailable:', error);
        }

        // Re-apply the registry after it loads so cards already rendered with the
        // fallback status immediately receive the latest manual verification state.
        document.querySelectorAll('[data-favorite-id]').forEach(addVerificationBadge);
        bindAll(document);
    }

    window.StudentFavoritesUI = { bind: bindAll, refresh: bindAll };

    document.addEventListener('DOMContentLoaded', function () {
        bindAll(document);
        loadVerificationRegistry();

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