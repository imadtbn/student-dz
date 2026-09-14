/* Student DZ — Lightweight directory structured data
 * Runs only on universities, schools/institutes and residences index pages.
 * Builds ItemList + BreadcrumbList from the existing JSON data without inventing records.
 */
(function () {
    'use strict';

    const path = window.location.pathname.replace(/\/+$/, '');
    const BASE = '/student-dz';
    const pages = {
        universities: {
            match: `${BASE}/universities/index.html`,
            data: `${BASE}/data/universities.json`,
            list: 'universities',
            name: 'دليل الجامعات الجزائرية',
            itemType: 'CollegeOrUniversity',
            icon: 'university'
        },
        schools: {
            match: `${BASE}/ecoles/index.html`,
            data: `${BASE}/data/ecoles.json`,
            list: 'schools',
            name: 'دليل المدارس والمعاهد',
            itemType: 'EducationalOrganization',
            icon: 'school'
        },
        residences: {
            match: `${BASE}/residences/index.html`,
            data: `${BASE}/data/residences.json`,
            list: 'residences',
            name: 'دليل الإقامات الجامعية',
            itemType: 'LodgingBusiness',
            icon: 'residence'
        }
    };

    const current = Object.values(pages).find(p => path === p.match);
    if (!current) return;

    function addJsonLd(id, graph) {
        if (document.getElementById(id)) return;
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

    function coordinates(item) {
        const point = item?.coordinates || item?.position;
        if (!point || point.lat == null || point.lng == null) return null;
        const lat = Number(point.lat), lng = Number(point.lng);
        return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    }

    function itemSchema(item, index) {
        const name = clean(item?.name);
        if (!name) return null;
        const url = absoluteUrl(item?.officialUrl);
        const point = coordinates(item);
        const schema = {
            '@type': current.itemType,
            name,
            identifier: clean(item?.id),
            address: {
                '@type': 'PostalAddress',
                addressLocality: clean(item?.wilaya),
                addressCountry: 'DZ'
            }
        };
        if (!schema.identifier) delete schema.identifier;
        if (!schema.address.addressLocality) delete schema.address;
        if (url) schema.url = url;
        if (point) schema.geo = {
            '@type': 'GeoCoordinates',
            latitude: point.lat,
            longitude: point.lng
        };
        if (current.icon === 'university') {
            const description = clean(item?.description);
            if (description) schema.description = description;
        }
        if (current.icon === 'residence' && clean(item?.gender)) {
            schema.additionalType = item.gender === 'male' ? 'https://schema.org/Accommodation' : 'https://schema.org/Accommodation';
        }
        return {
            '@type': 'ListItem',
            position: index + 1,
            item: schema
        };
    }

    function breadcrumb() {
        return {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${window.location.origin}${BASE}/` },
                { '@type': 'ListItem', position: 2, name: current.name, item: `${window.location.origin}${current.match}` }
            ]
        };
    }

    function build(data) {
        const records = Array.isArray(data) ? data : Array.isArray(data?.[current.list]) ? data[current.list] : [];
        const items = records.map(itemSchema).filter(Boolean);
        if (!items.length) return;

        addJsonLd('studentDzDirectorySchema', [
            {
                '@type': 'ItemList',
                '@id': `${window.location.origin}${current.match}#directory`,
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
