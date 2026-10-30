/* Student DZ PWA: reliable registration and a user-initiated install prompt. */
(() => {
  'use strict';

  const basePath = window.CONFIG?.BASE_PATH || '/student-dz';
  const swUrl = `${basePath}/sw.js`;
  const INSTALL_DISMISS_KEY = 'studentDzInstallDismissedAt';
  const DISMISS_DAYS = 7;
  let deferredInstallPrompt = null;
  let installCard = null;

  const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const wasDismissedRecently = () => {
    try {
      const dismissedAt = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || 0);
      return dismissedAt && (Date.now() - dismissedAt) < DISMISS_DAYS * 86400000;
    } catch (_) {
      return false;
    }
  };

  function removeInstallCard() {
    installCard?.remove();
    installCard = null;
  }

  function createInstallCard() {
    if (installCard || isStandalone() || wasDismissedRecently()) return;

    const style = document.createElement('style');
    style.id = 'studentDzInstallStyles';
    style.textContent = `
      .student-dz-install-card{position:fixed;z-index:9998;inset-inline:14px;bottom:calc(14px + env(safe-area-inset-bottom));max-width:460px;margin-inline:auto;padding:14px 16px;display:flex;align-items:center;gap:12px;background:#fff;color:#18352e;border:1px solid rgba(0,122,94,.2);border-radius:18px;box-shadow:0 10px 35px rgba(0,35,27,.2);font-family:inherit;direction:rtl}
      .student-dz-install-card[hidden]{display:none}
      .student-dz-install-icon{width:48px;height:48px;flex:0 0 48px;object-fit:contain;border-radius:13px}
      .student-dz-install-copy{min-width:0;flex:1}
      .student-dz-install-copy strong{display:block;font-size:14px;margin-bottom:3px}
      .student-dz-install-copy span{display:block;font-size:12px;line-height:1.5;color:#60736d}
      .student-dz-install-actions{display:flex;align-items:center;gap:7px}
      .student-dz-install-btn{border:0;border-radius:10px;background:#007a5e;color:#fff;padding:10px 13px;font:inherit;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer}
      .student-dz-install-close{width:32px;height:32px;border:0;border-radius:50%;background:#f0f4f2;color:#48615a;font-size:19px;cursor:pointer}
      @media(max-width:380px){.student-dz-install-card{inset-inline:9px;padding:11px;gap:9px}.student-dz-install-icon{width:40px;height:40px;flex-basis:40px}.student-dz-install-copy span{font-size:11px}.student-dz-install-btn{padding:9px 10px}}
      @media(prefers-color-scheme:dark){.student-dz-install-card{background:#172a25;color:#f3fbf7;border-color:#31584c}.student-dz-install-copy span{color:#b5c9c1}.student-dz-install-close{background:#294239;color:#e4f2ec}}
    `;
    document.head.appendChild(style);

    const card = document.createElement('aside');
    card.className = 'student-dz-install-card';
    card.setAttribute('aria-label', 'تثبيت مساعد الطالب');
    card.innerHTML = `
      <img class="student-dz-install-icon" src="${basePath}/assets/images/pwa-icon.png" alt="" width="48" height="48">
      <div class="student-dz-install-copy">
        <strong>ثبّت مساعد الطالب</strong>
        <span>أضف المنصة إلى هاتفك للوصول إليها بسرعة، حتى من الشاشة الرئيسية.</span>
      </div>
      <div class="student-dz-install-actions">
        <button class="student-dz-install-btn" type="button">تثبيت</button>
        <button class="student-dz-install-close" type="button" aria-label="إغلاق">×</button>
      </div>`;

    card.querySelector('.student-dz-install-btn').addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try {
        const choice = await deferredInstallPrompt.userChoice;
        if (choice?.outcome === 'accepted') removeInstallCard();
      } catch (_) {}
      deferredInstallPrompt = null;
      if (!installCard) return;
      if (!isStandalone()) card.querySelector('.student-dz-install-btn').disabled = true;
    });

    card.querySelector('.student-dz-install-close').addEventListener('click', () => {
      try { localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now())); } catch (_) {}
      removeInstallCard();
    });

    document.body.appendChild(card);
    installCard = card;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    if (isStandalone() || wasDismissedRecently()) return;
    deferredInstallPrompt = event;
    // Brief delay avoids covering the page while it is first rendering.
    window.setTimeout(createInstallCard, 1800);
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    removeInstallCard();
    try { localStorage.removeItem(INSTALL_DISMISS_KEY); } catch (_) {}
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: `${basePath}/`,
          updateViaCache: 'none'
        });
        registration.update().catch(() => {});
        console.info('Student DZ service worker ready:', registration.scope);
      } catch (error) {
        console.error('Student DZ service worker registration failed:', error);
      }
    }, { once: true });
  }
})();
