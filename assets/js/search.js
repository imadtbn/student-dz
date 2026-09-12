// Unified live search for Student DZ.
// Searches the portal's local data plus the available student tools.
document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('mainSearch');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    const tools = [
        ['حاسبة الميزانية', 'احسب مصاريفك الشهرية والسنوية', 'tools/budget-calculator.html', 'أداة'],
        ['أدوات النصوص', 'عداد الكلمات وتنسيق النصوص للبحوث', 'tools/text-tools.html', 'أداة'],
        ['حاسبة المعدل', 'احسب معدل السداسي بدقة', 'tools/average-calculator.html', 'أداة'],
        ['المعدل السنوي', 'احسب المعدل السنوي', 'tools/semester-calculator.html', 'أداة'],
        ['حساب النسبة', 'حساب النسبة المئوية', 'tools/percentage-calculator.html', 'أداة'],
        ['مؤقت بومودورو', 'نظم وقت دراستك', 'tools/pomodoro.html', 'أداة'],
        ['إنشاء CV', 'أنشئ سيرتك الذاتية', 'tools/cv-builder.html', 'أداة'],
        ['إنشاء QR Code', 'تحويل نص أو رابط إلى رمز استجابة سريعة', 'tools/qr-generator.html', 'أداة'],
        ['أدوات PDF', 'أدوات للتعامل مع ملفات PDF', 'tools/pdf-tools.html', 'أداة'],
        ['ضغط الصور', 'تصغير حجم الصور', 'tools/image-compressor.html', 'أداة'],
        ['الخريطة الجامعية', 'الجامعات والإقامات والمدارس على الخريطة', 'tools/maps.html', 'أداة'],
        ['محول الوحدات', 'تحويل الطول والوزن والحجم والحرارة والزمن', 'tools/unit-converter.html', 'أداة'],
        ['مولد جدول الدراسة', 'أنشئ جدولك الأسبوعي ونظم حصصك', 'tools/study-schedule.html', 'أداة'],
        ['حساب الأيام بين تاريخين', 'احسب المدة بالأيام والأسابيع', 'tools/date-difference.html', 'أداة'],
        ['حاسبة الترتيب والنقاط', 'احسب مجموع النقاط والمتوسط الموزون', 'tools/points-ranking.html', 'أداة']
    ].map(([name, description, url, type]) => ({ name, description, url, type }));

    let index = [...tools];

    const normalize = (value) => String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .trim();

    const addItems = (items, type, mapper) => {
        if (!Array.isArray(items)) return;
        items.forEach(item => {
            const mapped = mapper(item);
            if (mapped && mapped.name) index.push({ ...mapped, type });
        });
    };

    try {
        const base = CONFIG.getUrl('data/');
        const [universitiesRes, residencesRes, ecolesRes, platformsRes] = await Promise.all([
            fetch(`${base}universities.json`),
            fetch(`${base}residences.json`),
            fetch(`${base}ecoles.json`),
            fetch(`${base}platforms.json`)
        ]);

        const [universities, residences, ecoles, platforms] = await Promise.all([
            universitiesRes.ok ? universitiesRes.json() : null,
            residencesRes.ok ? residencesRes.json() : null,
            ecolesRes.ok ? ecolesRes.json() : null,
            platformsRes.ok ? platformsRes.json() : null
        ]);

        addItems(universities?.universities, 'جامعة', u => ({
            name: u.name,
            description: [u.wilaya, ...(u.specialties || []), u.description].filter(Boolean).join(' • '),
            url: u.officialUrl || 'universities/index.html'
        }));

        addItems(residences?.residences, 'إقامة', r => ({
            name: r.name,
            description: [r.wilaya, r.gender === 'female' ? 'إناث' : r.gender === 'male' ? 'ذكور' : ''].filter(Boolean).join(' • '),
            url: 'residences/index.html'
        }));

        addItems(ecoles, 'كلية / مدرسة', e => ({
            name: e.name,
            description: [e.wilaya, ...(e.specialties || []), ...(e.services || [])].filter(Boolean).join(' • '),
            url: e.officialUrl || 'ecoles/index.html'
        }));

        addItems(platforms?.platforms, 'خدمة', p => ({
            name: p.name,
            description: p.description,
            url: p.officialUrl || 'platforms/index.html'
        }));
    } catch (error) {
        console.warn('Unified search data loading failed:', error);
    }

    const uniqueIndex = Array.from(
        new Map(index.map(item => [`${item.type}|${item.name}|${item.url}`, item])).values()
    );

    const renderResults = (query) => {
        const normalizedQuery = normalize(query);
        if (normalizedQuery.length < 2) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        const terms = normalizedQuery.split(/\s+/).filter(Boolean);
        const matches = uniqueIndex
            .map(item => {
                const haystack = normalize(`${item.name} ${item.description}`);
                const matchedTerms = terms.filter(term => haystack.includes(term)).length;
                const nameMatch = normalize(item.name).includes(normalizedQuery);
                return { item, score: matchedTerms * 10 + (nameMatch ? 20 : 0) };
            })
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'ar'))
            .slice(0, 8);

        searchResults.style.display = 'block';

        if (!matches.length) {
            searchResults.innerHTML = '<div class="search-result-empty"><i class="fa-solid fa-magnifying-glass"></i> لا توجد نتائج مطابقة</div>';
            return;
        }

        searchResults.innerHTML = matches.map(({ item }) => `
            <a class="search-result-item" href="${CONFIG.getUrl(item.url)}">
                <span class="search-result-icon"><i class="fa-solid ${getIcon(item.type)}"></i></span>
                <span class="search-result-content">
                    <strong>${escapeHtml(item.name)}</strong>
                    <small><span class="search-result-type">${escapeHtml(item.type)}</span>${item.description ? ` · ${escapeHtml(item.description).slice(0, 110)}` : ''}</small>
                </span>
                <i class="fa-solid fa-arrow-left search-result-arrow"></i>
            </a>
        `).join('');
    };

    const getIcon = (type) => ({
        'جامعة': 'fa-building-columns',
        'كلية / مدرسة': 'fa-school',
        'إقامة': 'fa-building',
        'خدمة': 'fa-globe',
        'أداة': 'fa-wand-magic-sparkles'
    }[type] || 'fa-magnifying-glass');

    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));

    searchInput.addEventListener('input', (event) => renderResults(event.target.value));

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-box')) {
            searchResults.style.display = 'none';
        }
    });
});
