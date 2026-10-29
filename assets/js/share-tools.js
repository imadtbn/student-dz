(function () {
  'use strict';
  if (window.__studentDzShareToolsInitialized) return;
  window.__studentDzShareToolsInitialized = true;

  const BASE = '/student-dz';
  const shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"></path></svg>';

  function findAnchor(main) {
    return main.querySelector('.page-intro, .tool-header, .page-hero, .hero') ||
      main.querySelector(':scope > .container > h1, :scope > h1') ||
      main.querySelector('h1');
  }

  function placeTools() {
    if (document.querySelector('.student-share-tools')) return;
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path.endsWith('/offline.html') || path.endsWith('/404.html')) return;
    const main = document.querySelector('main');
    if (!main) return;

    const tools = document.createElement('div');
    tools.className = 'student-share-tools';
    tools.setAttribute('role', 'group');
    tools.setAttribute('aria-label', 'مشاركة الصفحة والمساعدة');
    tools.innerHTML =
      '<button type="button" class="student-share-button" aria-label="مشاركة الصفحة الحالية">' +
        shareIcon + '<span>شارك الصفحة</span>' +
      '</button>' +
      '<span class="student-share-help-wrap">' +
        '<button type="button" class="student-share-help" aria-label="لماذا أشارك هذه الصفحة؟" aria-expanded="false" aria-controls="studentShareTip">?</button>' +
        '<span class="student-share-tip" id="studentShareTip" role="tooltip">' +
          '<strong>انشر الفائدة</strong>أعجبتك هذه الصفحة أو الأداة؟ شاركها مع زملائك ليستفيدوا منها أيضًا.' +
        '</span>' +
      '</span>' +
      '<span class="student-share-status" aria-live="polite" aria-atomic="true"></span>';

    const anchor = findAnchor(main);
    if (anchor) {
      anchor.insertAdjacentElement('afterend', tools);
    } else {
      const firstSection = main.querySelector(':scope > section, :scope > .container');
      if (firstSection) firstSection.insertAdjacentElement('beforebegin', tools);
      else main.prepend(tools);
    }

    const shareButton = tools.querySelector('.student-share-button');
    const helpButton = tools.querySelector('.student-share-help');
    const tip = tools.querySelector('.student-share-tip');
    const status = tools.querySelector('.student-share-status');
    let hideTimer;

    function setTip(open) {
      clearTimeout(hideTimer);
      tip.classList.toggle('is-visible', open);
      helpButton.setAttribute('aria-expanded', String(open));
      if (open) hideTimer = setTimeout(() => setTip(false), 5200);
    }
    helpButton.addEventListener('click', () => setTip(helpButton.getAttribute('aria-expanded') !== 'true'));
    tools.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setTip(false);
        helpButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!tools.contains(event.target)) setTip(false);
    });

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      field.style.insetInlineStart = '-9999px';
      document.body.appendChild(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) {}
      field.remove();
      if (!copied) throw new Error('clipboard-unavailable');
      return true;
    }

    shareButton.addEventListener('click', async () => {
      const shareData = { title: document.title || 'Student DZ', url: location.href };
      shareButton.disabled = true;
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          status.textContent = 'تم فتح خيارات المشاركة.';
        } else {
          await copyText(shareData.url);
          status.textContent = 'تم نسخ رابط الصفحة.';
          shareButton.querySelector('span').textContent = 'تم نسخ الرابط';
          setTimeout(() => { shareButton.querySelector('span').textContent = 'شارك الصفحة'; }, 2200);
        }
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        try {
          await copyText(shareData.url);
          status.textContent = 'تم نسخ رابط الصفحة.';
          shareButton.querySelector('span').textContent = 'تم نسخ الرابط';
          setTimeout(() => { shareButton.querySelector('span').textContent = 'شارك الصفحة'; }, 2200);
        } catch (_) {
          status.textContent = 'تعذر نسخ الرابط تلقائيًا. يمكنك نسخ الرابط من شريط العنوان.';
        }
      } finally {
        shareButton.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', placeTools, { once: true });
  else placeTools();
})();