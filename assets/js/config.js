// Configuration for Student DZ
const CONFIG = {
    BASE_PATH: "/student-dz",
    API: {
        UNIVERSITIES: "/data/universities.json",
        ECOLES: "/data/ecoles.json",
        RESIDENCES: "/data/residences.json",
        VERIFICATION_STATUS: "/data/verification-status.json",
        PLATFORMS: "/data/platforms.json",
        SETTINGS: "/data/settings.json",
        FEEDBACK_SETTINGS: "/data/feedback-settings.json"
    },
    getUrl: function(path) {
        if (!path) return this.BASE_PATH + "/";
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${this.BASE_PATH}/${cleanPath}`;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

/* Dynamic counters for universities, schools/institutes and residences. */
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
        dataPath = CONFIG.API.ECOLES;
    } else if (path.includes('/residences/')) {
        type = 'residences';
        title = 'إقامة جامعية';
        dataPath = CONFIG.API.RESIDENCES;
    } else {
        return;
    }

    const normalize = value => String(value ?? '').toLowerCase().trim();

    function getRecords(data) {
        if (type === 'universities') return Array.isArray(data?.universities) ? data.universities : [];
        if (type === 'residences') return Array.isArray(data?.residences) ? data.residences : [];
        return Array.isArray(data) ? data : [];
    }

    function createCounter() {
        if (document.getElementById('directoryDataCounter')) return;
        const heading = document.querySelector('main h1.section-title');
        if (!heading) return;

        const counter = document.createElement('div');
        counter.id = 'directoryDataCounter';
        counter.className = 'directory-data-counter';
        counter.setAttribute('aria-live', 'polite');
        counter.innerHTML = `<i class="fa-solid ${type === 'universities' ? 'fa-building-columns' : type === 'ecoles' ? 'fa-school' : 'fa-building'}"></i><span class="directory-counter-number" id="directoryCounterNumber">0</span><span class="directory-counter-label" id="directoryCounterLabel">${title}</span>`;
        heading.insertAdjacentElement('afterend', counter);
    }

    function addStyles() {
        if (document.getElementById('directoryCounterStyles')) return;
        const style = document.createElement('style');
        style.id = 'directoryCounterStyles';
        style.textContent = `.directory-data-counter{display:flex;align-items:center;justify-content:center;gap:10px;width:fit-content;max-width:100%;margin:0 auto 22px;padding:11px 18px;border:1px solid var(--border-color);border-radius:var(--radius-lg,14px);background:var(--bg-color,var(--bg-main));color:var(--text-main,var(--text-color));box-shadow:var(--shadow);box-sizing:border-box}.directory-data-counter>i{color:var(--primary-color);font-size:1.2rem}.directory-counter-number{color:var(--primary-color);font-size:1.35rem;font-weight:800;line-height:1;min-width:1.5ch;text-align:center}.directory-counter-label{font-weight:700}@media(max-width:480px){.directory-data-counter{margin-bottom:18px;padding:10px 15px;font-size:.92rem}.directory-counter-number{font-size:1.2rem}}`;
        document.head.appendChild(style);
    }

    function setCount(count, filtered) {
        const number = document.getElementById('directoryCounterNumber');
        const label = document.getElementById('directoryCounterLabel');
        if (!number || !label) return;
        number.textContent = Number(count).toLocaleString('ar-DZ');
        label.textContent = filtered ? `${title} (المعروض)` : title;
    }

    function filterRecords(records) {
        const search = document.getElementById('searchInput');
        const gender = document.getElementById('genderFilter');
        const term = normalize(search?.value);
        const genderValue = gender?.value || '';

        if (!term && !genderValue) return records;

        return records.filter(item => {
            if (type === 'universities') {
                const specialties = Array.isArray(item.specialties) ? item.specialties : [];
                return normalize(item.name).includes(term) || normalize(item.wilaya).includes(term) || specialties.some(x => normalize(x).includes(term)) || normalize(item.description).includes(term);
            }
            if (type === 'ecoles') {
                const specialties = Array.isArray(item.specialties) ? item.specialties : [];
                return normalize(item.name).includes(term) || normalize(item.wilaya).includes(term) || specialties.some(x => normalize(x).includes(term));
            }
            return (normalize(item.name).includes(term) || normalize(item.wilaya).includes(term)) && (!genderValue || item.gender === genderValue);
        });
    }

    async function start() {
        addStyles();
        createCounter();
        try {
            const response = await fetch(CONFIG.getUrl(dataPath));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const records = getRecords(await response.json());
            const update = () => {
                const filtered = filterRecords(records);
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();

/* Global feedback. */
(function loadGlobalFeedback() {
    function load() {
        if (window.__studentDzFeedbackLoader) return;
        window.__studentDzFeedbackLoader = true;
        const src = `${CONFIG.BASE_PATH}/assets/js/feedback.js`;
        if ([...document.scripts].some(script => script.src.includes('/assets/js/feedback.js'))) return;
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        document.head.appendChild(script);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
    else load();
})();

/* Shared AdSense: one clearly separated unit on each eligible page. */
(function loadGlobalAds() {
    const EXCLUDED = ['/pages/about.html', '/pages/contact.html', '/pages/privacy.html', '/pages/cookies.html', '/pages/terms.html', '/pages/disclaimer.html', '/404.html', '/offline.html'];

    function addStylesheet() {
        if (document.getElementById('studentDzAdsCss')) return;
        const link = document.createElement('link');
        link.id = 'studentDzAdsCss';
        link.rel = 'stylesheet';
        link.href = `${CONFIG.BASE_PATH}/assets/css/ads.css`;
        document.head.appendChild(link);
    }

    function isEligible() {
        const path = window.location.pathname;
        return !EXCLUDED.some(item => path.endsWith(item));
    }

    function getAdType() {
        const path = window.location.pathname.replace(/\/+$/, '');
        if (path === CONFIG.BASE_PATH || path === `${CONFIG.BASE_PATH}/index.html`) return 'homepage';
        if (path.includes(`${CONFIG.BASE_PATH}/tools/`)) return 'tool';
        return 'content';
    }

    function findPlacement(type) {
        const main = document.querySelector('main');
        if (!main) return null;
        if (type === 'homepage') return main.querySelector('.hero') || main.firstElementChild;
        if (type === 'tool') {
            const container = main.querySelector('.tool-container') || main;
            const heading = container.querySelector('h1, h2.section-title, .section-title');
            return heading?.nextElementSibling || heading || container.firstElementChild;
        }
        return main.querySelector('h1.section-title, h1, .section-title')?.nextElementSibling || main.firstElementChild;
    }

    function createAd(settings) {
        if (document.querySelector('.student-dz-ad')) return;
        const adType = getAdType();
        const unit = settings?.ads?.slots?.[adType];
        const publisherId = settings?.ads?.publisherId;
        if (!settings?.ads?.enabled || !publisherId || !unit?.id) return;
        const anchor = findPlacement(adType);
        if (!anchor?.parentNode) return;

        const wrapper = document.createElement('section');
        wrapper.className = 'ad-container student-dz-ad';
        wrapper.setAttribute('aria-label', 'إعلان');
        const label = document.createElement('span');
        label.className = 'ad-label';
        label.textContent = 'إعلان';
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle ad-placeholder';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', publisherId);
        ins.setAttribute('data-ad-slot', unit.id);

        if (unit.format === 'fluid') {
            ins.setAttribute('data-ad-format', 'fluid');
            if (unit.layoutKey) ins.setAttribute('data-ad-layout-key', unit.layoutKey);
        } else {
            ins.setAttribute('data-ad-format', 'auto');
            if (unit.fullWidthResponsive !== false) ins.setAttribute('data-full-width-responsive', 'true');
        }

        wrapper.append(label, ins);
        anchor.parentNode.insertBefore(wrapper, anchor.nextSibling);
        loadAdSense(publisherId);
    }

    function pushAd() {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.warn('AdSense push skipped:', error);
        }
    }

    function loadAdSense(publisherId) {
        if (window.__studentDzAdSenseLoaded) {
            pushAd();
            return;
        }
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
        script.onload = () => {
            window.__studentDzAdSenseLoaded = true;
            pushAd();
        };
        script.onerror = () => console.warn('AdSense script failed to load.');
        document.head.appendChild(script);
    }

    async function init() {
        if (!isEligible()) return;
        addStylesheet();
        try {
            const response = await fetch(CONFIG.getUrl(CONFIG.API.SETTINGS), { cache: 'no-store' });
            if (!response.ok) return;
            createAd(await response.json());
        } catch (error) {
            console.warn('AdSense configuration unavailable.');
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
