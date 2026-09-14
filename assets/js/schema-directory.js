/* Student DZ — Directory structured data
 * Stages: BreadcrumbList + CollectionPage + ItemList + institution types.
 * Records are read only from the existing JSON data; no institutional data is invented.
 */
(function () {
    'use strict';

    const path = window.location.pathname.replace(/\/+$/, '');
    const BASE = '/student-dz';
    const SITE = window.location.origin + BASE;
    const pages = {
        universities: { match: `${BASE}/universities`, url: `${BASE}/universities/`, data: `${BASE}/data/universities.json`, list: 'universities', name: 'دليل الجامعات الجزائرية', description: 'دليل الجامعات الجزائرية والمعلومات المتاحة للطالب الجزائري.', type: 'CollegeOrUniversity' },
        schools: { match: `${BASE}/ecoles`, url: `${BASE}/ecoles/`, data: `${BASE}/data/ecoles.json`, list: 'schools', name: 'دليل المدارس والمعاهد الجزائرية', description: 'دليل المدارس العليا والمعاهد الجزائرية والمعلومات المتاحة للطالب.', type: 'EducationalOrganization' },
        residences: { match: `${BASE}/residences`, url: `${BASE}/residences/`, data: `${BASE}/data/residences.json`, list: 'residences', name: 'دليل الإقامات الجامعية في الجزائر', description: 'دليل الإقامات الجامعية في الجزائر والمعلومات المتاحة للطالب.', type: 'Accommodation' }
    };
    const current = Object.values(pages).find(p => path === p.match);
    if (!current) return;

    const clean = v => typeof v === 'string' ? v.trim() : '';
    const absoluteUrl = v => { const u = clean(v); if (!u || u === '#') return ''; try { return new URL(u, location.origin).href; } catch (_) { return ''; } };

    function itemSchema(item, index) {
        const name = clean(item?.name);
        if (!name) return null;
        const schema = { '@type': current.type, name, identifier: clean(item?.id) };
        const url = absoluteUrl(item?.officialUrl);
        if (!schema.identifier) delete schema.identifier;
        if (url) schema.url = url;
        if (clean(item?.wilaya)) schema.address = { '@type': 'PostalAddress', addressLocality: clean(item.wilaya), addressCountry: 'DZ' };
        const point = item?.coordinates || item?.position;
        if (point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng))) schema.geo = { '@type': 'GeoCoordinates', latitude: Number(point.lat), longitude: Number(point.lng) };
        return { '@type': 'ListItem', position: index + 1, item: schema };
    }

    const breadcrumb = () => ({ '@type': 'BreadcrumbList', '@id': `${SITE}${current.url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: current.name, item: `${SITE}${current.url}` }
    ] });

    function build(data) {
        const records = Array.isArray(data) ? data : Array.isArray(data?.[current.list]) ? data[current.list] : [];
        const items = records.map(itemSchema).filter(Boolean);
        if (!items.length) return;
        const collectionId = `${SITE}${current.url}#collection`;
        const listId = `${SITE}${current.url}#itemlist`;
        const script = document.getElementById('studentDzDirectorySchema');
        if (script) script.remove();
        const node = document.createElement('script');
        node.id = 'studentDzDirectorySchema';
        node.type = 'application/ld+json';
        node.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
            { '@type': 'CollectionPage', '@id': collectionId, url: `${SITE}${current.url}`, name: current.name, description: current.description, inLanguage: 'ar-DZ', isPartOf: { '@id': `${SITE}/#website` }, breadcrumb: { '@id': `${SITE}${current.url}#breadcrumb` }, mainEntity: { '@id': listId } },
            { '@type': 'ItemList', '@id': listId, name: current.name, numberOfItems: items.length, itemListOrder: 'https://schema.org/ItemListOrderAscending', itemListElement: items },
            breadcrumb()
        ] });
        document.head.appendChild(node);
    }

    async function load() {
        try { const r = await fetch(current.data, { cache: 'default' }); if (r.ok) build(await r.json()); }
        catch (e) { console.warn('Directory structured data unavailable:', e); }
    }
    const init = () => 'requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 1800 }) : setTimeout(load, 350);
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
})();