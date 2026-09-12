// Configuration for Student DZ
const CONFIG = {
    BASE_PATH: "/student-dz",
    API: {
        UNIVERSITIES: "/data/universities.json",
        RESIDENCES: "/data/residences.json",
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
        type = 'universities'; title = 'جامعة'; dataPath = CONFIG.API.UNIVERSITIES;
    } else if (path.includes('/ecoles/')) {
        type = 'ecoles'; title = 'مدرسة / معهد'; dataPath = '/data/ecoles.json';
    } else if (path.includes('/residences/')) {
        type = 'residences'; title = 'إقامة جامعية'; dataPath = CONFIG.API.RESIDENCES;
    } else return;

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
        counter.id = 'directoryDataCounter'; counter.className = 'directory-data-counter';
        counter.setAttribute('aria-live', 'polite');
        counter.innerHTML = `<i class="fa-solid ${type === 'universities' ? 'fa-building-columns' : type === 'ecoles' ? 'fa-school' : 'fa-building'}"></i><span class="directory-counter-number" id="directoryCounterNumber">0</span><span class="directory-counter-label" id="directoryCounterLabel">${title}</span>`;
        heading.insertAdjacentElement('afterend', counter);
    }
    function addStyles() {
        if (document.getElementById('directoryCounterStyles')) return;
        const style = document.createElement('style'); style.id = 'directoryCounterStyles';
        style.textContent = `.directory-data-counter{display:flex;align-items:center;justify-content:center;gap:10px;width:fit-content;max-width:100%;margin:0 auto 22px;padding:11px 18px;border:1px solid var(--border-color);border-radius:var(--radius-lg,14px);background:var(--bg-color,var(--bg-main));color:var(--text-main,var(--text-color));box-shadow:var(--shadow);box-sizing:border-box}.directory-data-counter>i{color:var(--primary-color);font-size:1.2rem}.directory-counter-number{color:var(--primary-color);font-size:1.35rem;font-weight:800;line-height:1;min-width:1.5ch;text-align:center}.directory-counter-label{font-weight:700}@media(max-width:480px){.directory-data-counter{margin-bottom:18px;padding:10px 15px;font-size:.92rem}.directory-counter-number{font-size:1.2rem}}`;
        document.head.appendChild(style);
    }
    function setCount(count, filtered) {
        const n = document.getElementById('directoryCounterNumber'), l = document.getElementById('directoryCounterLabel');
        if (!n || !l) return; n.textContent = Number(count).toLocaleString('ar-DZ'); l.textContent = filtered ? `${title} (المعروض)` : title;
    }
    function filtered(records) {
        const search = document.getElementById('searchInput'), gender = document.getElementById('genderFilter');
        const term = normalize(search?.value), genderValue = gender?.value || '';
        if (!term && !genderValue) return records;
        return records.filter(item => {
            if (type === 'universities') { const s = Array.isArray(item.specialties) ? item.specialties : []; return normalize(item.name).includes(term) || normalize(item.wilaya).includes(term) || s.some(x => normalize(x).includes(term)) || normalize(item.description).includes(term); }
            if (type === 'ecoles') { const s = Array.isArray(item.specialties) ? item.specialties : []; return normalize(item.name).includes(term) || normalize(item.wilaya).includes(term) || s.some(x => normalize(x).includes(term)); }
            return (normalize(item.name).includes(term) || normalize(item.wilaya).includes(term)) && (!genderValue || item.gender === genderValue);
        });
    }
    async function start() {
        addStyles(); createCounter();
        try { const r = await fetch(CONFIG.getUrl(dataPath)); if (!r.ok) throw new Error(`HTTP ${r.status}`); const records = getRecords(await r.json()); const update = () => { const f = filtered(records); setCount(f.length, f.length !== records.length); }; update(); ['searchInput','genderFilter'].forEach(id => { const e=document.getElementById(id); if(e) e.addEventListener(id==='genderFilter'?'change':'input',update); }); }
        catch(e) { console.error('Directory counter error:',e); setCount(0,false); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* Global feedback: every page that loads config.js gets the floating support button. */
(function loadGlobalFeedback() {
    function load() {
        if (window.__studentDzFeedbackLoader) return;
        window.__studentDzFeedbackLoader = true;
        const src = `${CONFIG.BASE_PATH}/assets/js/feedback.js`;
        if ([...document.scripts].some(s => s.src.includes('/assets/js/feedback.js'))) return;
        const script = document.createElement('script'); script.src = src; script.defer = true; document.head.appendChild(script);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true }); else load();
})();
