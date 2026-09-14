/* Student DZ — Tool structured data
 * Final structured-data stage: WebApplication for the existing tool pages.
 * Metadata is read from each tool page; no tool facts are invented.
 */
(function () {
    'use strict';

    const BASE = '/student-dz';
    const path = window.location.pathname.replace(/\/+$/, '');
    if (!path.startsWith(`${BASE}/tools/`) || !path.endsWith('.html')) return;

    const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
    const description = document.querySelector('meta[name="description"]')?.content?.trim() || '';
    const title = document.title.trim();
    const name = title.replace(/\s*[-|–—]\s*Student\s*DZ\s*$/i, '').trim() || title;
    if (!name || !canonical) return;

    const scriptId = 'studentDzToolSchema';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const websiteId = `${window.location.origin}${BASE}/#website`;
    const applicationId = `${canonical.replace(/#.*$/, '')}#webapplication`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': applicationId,
        name,
        url: canonical,
        inLanguage: 'ar-DZ',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web Browser',
        isPartOf: { '@id': websiteId },
        author: { '@id': `${window.location.origin}${BASE}/#organization` }
    };

    if (description) schema.description = description;

    const node = document.createElement('script');
    node.id = scriptId;
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify(schema);
    document.head.appendChild(node);
})();
