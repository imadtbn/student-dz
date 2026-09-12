// Configuration for Student DZ
const CONFIG = {
    // Base path for GitHub Pages deployment.
    // Set to "/student-dz" for production on GitHub Pages, or "" for local development if served from root.
    BASE_PATH: "/student-dz",

    // API/Data paths
    API: {
        UNIVERSITIES: "/data/universities.json",
        RESIDENCES: "/data/residences.json",
        PLATFORMS: "/data/platforms.json",
        SETTINGS: "/data/settings.json",
        FEEDBACK_SETTINGS: "/data/feedback-settings.json"
    },

    // Get a URL ensuring BASE_PATH is prefixed
    getUrl: function(path) {
        if (!path) return this.BASE_PATH + "/";
        if (path.startsWith('http')) return path; // External links

        // Remove leading slash from path to prevent double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${this.BASE_PATH}/${cleanPath}`;
    }
};

// Export if using modules, otherwise it's global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

/*
 * Dynamic counters for universities, higher schools/institutes and residences.
 * The counters are injected into the existing pages, so adding a new data item
 * automatically changes the total without requiring a hard-coded number.
 * Search/gender filters also update the visible result count in real time.
 */
(function initDirectoryCounter() {
    const path = window.location.pathname;
    let type = null;
    let title = '';
    let dataPath = '';

    if (path.includes('/universities/')) {
        type = 'universities';
        title = 'جامعة';
        dataPath = CONFIG.API.UNIVERSITIES;
    } else if (path.includes('/ecoles/')) {
        type = 'ecoles';
        title = 'مدرسة / معهد';
        dataPath = '/data/ecoles.json';
    } else if (path.includes('/residences/')) {
        type = 'residences';
        title = 'إقامة جامعية';
        dataPath = CONFIG.API.RESIDENCES;
    } else {
        return;
    }

    function normalize(value) {
        return String(value ?? '').toLowerCase().trim();
    }

    function getRecords(data) {
        if (type === 'universities') return Array.isArray(data?.universities) ? data.universities : [];
        if (type === 'residences') return Array.isArray(data?.residences) ? data.residences : [];
        return Array.isArray(data) ? data : [];
    }

    function createCounter() {
        if (document.getElementById('directoryDataCounter')) return document.getElementById('directoryDataCounter');
        const heading = document.querySelector('main h1.section-title');
        if (!heading) return null;

        const counter = document.createElement('div');
        counter.id = 'directoryDataCounter';
        counter.className = 'directory-data-counter';
        counter.setAttribute('aria-live', 'polite');
        counter.innerHTML = `
            <i class="fa-solid ${type === 'universities' ? 'fa-building-columns' : type === 'ecoles' ? 'fa-school' : 'fa-building'}"></i>
            <span class="directory-counter-number" id="directoryCounterNumber">0</span>
            <span class="directory-counter-label" id="directoryCounterLabel">${title}</span>
        `;
        heading.insertAdjacentElement('afterend', counter);
        return counter;
    }

    function addStyles() {
        if (document.getElementById('directoryCounterStyles')) return;
        const style = document.createElement('style');
        style.id = 'directoryCounterStyles';
        style.textContent = `
            .directory-data-counter {
                display:flex;
                align-items:center;
                justify-content:center;
                gap:10px;
                width:fit-content;
                max-width:100%;
                margin:0 auto 22px;
                padding:11px 18px;
                border:1px solid var(--border-color);
                border-radius:var(--radius-lg, 14px);
                background:var(--bg-color, var(--bg-main));
                color:var(--text-main, var(--text-color));
                box-shadow:var(--shadow);
                box-sizing:border-box;
            }
            .directory-data-counter > i { color:var(--primary-color); font-size:1.2rem; }
            .directory-counter-number { color:var(--primary-color); font-size:1.35rem; font-weight:800; line-height:1; min-width:1.5ch; text-align:center; }
            .directory-counter-label { font-weight:700; }
            @media (max-width:480px) {
                .directory-data-counter { margin-bottom:18px; padding:10px 15px; font-size:.92rem; }
                .directory-counter-number { font-size:1.2rem; }
            }
        `;
        document.head.appendChild(style);
    }

    function setCount(count, filtered) {
        const number = document.getElementById('directoryCounterNumber');
        const label = document.getElementById('directoryCounterLabel');
        if (!number || !label) return;
        number.textContent = Number(count).toLocaleString('ar-DZ');
        label.textContent = filtered ? `${title} (المعروض)` : title;
    }

    function getFilteredRecords(records) {
        const search = document.getElementById('searchInput');
        const gender = document.getElementById('genderFilter');
        const term = normalize(search?.value);
        const genderValue = gender?.value || '';

        if (!term && !genderValue) return records;

        return records.filter(item => {
            if (type === 'universities') {
                const specialties = Array.isArray(item.specialties) ? item.specialties : [];
                return normalize(item.name).includes(term) || normalize(item.wilaya).includes(term) ||
                    specialties.some(s => normalize(s).includes(term)) || normalize(item.description).includes(term);
            }
            if (type === 'ecoles') {
                const specialties = Array.isArray(item.specialties) ? item.specialties : [];
                return normalize(item.name).includes(term) || normalize(item.wilaya).includes(term) ||
                    specialties.some(s => normalize(s).includes(term));
            }
            const matchesTerm = normalize(item.name).includes(term) || normalize(item.wilaya).includes(term);
            const matchesGender = !genderValue || item.gender === genderValue;
            return matchesTerm && matchesGender;
        });
    }

    async function start() {
        addStyles();
        createCounter();
        try {
            const response = await fetch(CONFIG.getUrl(dataPath));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const records = getRecords(data);
            const update = () => {
                const filtered = getFilteredRecords(records);
                setCount(filtered.length, filtered.length !== records.length);
            };
            update();

            ['searchInput', 'genderFilter'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.addEventListener(id === 'genderFilter' ? 'change' : 'input', update);
            });
        } catch (error) {
            console.error('Directory counter error:', error);
            setCount(0, false);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
