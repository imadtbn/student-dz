/* Student DZ — Stage 2 directory structured data
 * Scope: BreadcrumbList + CollectionPage + ItemList only.
 * Institution-specific types are intentionally deferred to the next stage.
 */
(function () {
    'use strict';

    const path = window.location.pathname.replace(/\/+$/, '');
    const BASE = '/student-dz';
    const SITE = window.location.origin + BASE;
    const pages = {
        universities: {
            match: `${BASE}/universities/index.html`,
            data: `${BASE}/data/universities.json`,
            list: 'universities',
            name: 'دليل الجامعات الجزائرية',
            description: 'دليل الجامعات الجزائرية والمعلومات المتاحة للطالب الجزائري.'
        },
        schools: {
            match: `${BASE}/ecoles/index.html`,
            data: `${BASE}/data/ecoles.json`,
            list: 'schools',
            name: 'دليل المدارس والمعاهد الجزائرية',
            description: 'دليل المدارس العليا والمعاهد الجزائرية والمعلومات المتاحة للطالب.'
        },
        residences: {
            match: `${BASE}/residences/index.html`,
            data: `${BASE}/data/residences.json`,
            list: 'residences',
            name: 'دليل الإقامات الجامعية في الجزائر',
            description: 'دليل الإقامات الجامعية في الجزائر والمعلومات المتاحة للطالب.'
        }
    };

    const current = Object.values(pages).find(p => path === p.match);
    if (!current) return;

    function addJsonLd(id, graph) {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': graph
        });
        document.head.appendChild(script);
    }

    function clean(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function absoluteUrl(value) {
        const url = clean(value);
        if (!url || url === '#') return '';
        try { return new URL(url, window.location.origin).href; } catch (_) { return ''; }
    }

    function itemSchema(item, index) {
        const name = clean(item?.name);
        if (!name) return null;

        const url = absoluteUrl(item?.officialUrl);
        const itemRef = {
            '@type': 'Thing',
            name,
            identifier: clean(item?.id)
        };

        if (!itemRef.identifier) delete itemRef.identifier;
        if (url) itemRef.url = url;

        return {
            '@type': 'ListItem',
            position: index + 1,
            item: itemRef
        };
    }

    function breadcrumb() {
        return {
            '@type': 'BreadcrumbList',
            '@id': `${SITE}${current.match}#breadcrumb`,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'الرئيسية',
                    item: `${SITE}/`
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: current.name,
                    item: `${SITE}${current.match}`
                }
            ]
        };
    }

    function build(data) {
        const records = Array.isArray(data)
            ? data
            : Array.isArray(data?.[current.list]) ? data[current.list] : [];

        const items = records.map(itemSchema).filter(Boolean);
        if (!items.length) return;

        const collectionId = `${SITE}${current.match}#collection`;
        const listId = `${SITE}${current.match}#itemlist`;

        addJsonLd('studentDzDirectorySchema', [
            {
                '@type': 'CollectionPage',
                '@id': collectionId,
                url: `${SITE}${current.match}`,
                name: current.name,
                description: current.description,
                inLanguage: 'ar-DZ',
                isPartOf: {
                    '@id': `${SITE}/#website`
                },
                breadcrumb: {
                    '@id': `${SITE}${current.match}#breadcrumb`
                },
                mainEntity: {
                    '@id': listId
                }
            },
            {
                '@type': 'ItemList',
                '@id': listId,
                name: current.name,
                numberOfItems: items.length,
                itemListOrder: 'https://schema.org/ItemListOrderAscending',
                itemListElement: items
            },
            breadcrumb()
        ]);
    }

    function init() {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(load, { timeout: 1800 });
        } else {
            window.setTimeout(load, 350);
        }
    }

    async function load() {
        try {
            const response = await fetch(current.data, { cache: 'default' });
            if (!response.ok) return;
            build(await response.json());
        } catch (error) {
            console.warn('Directory structured data unavailable:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
