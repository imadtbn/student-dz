/* Student DZ — real Web Push client */
(function () {
  'use strict';

  const API_URL = window.STUDENT_DZ_PUSH_API || 'https://YOUR-PUSH-SERVER.example.com';
  const CLIENT_KEY = 'studentDzPushClientId';
  const SYNC_KEY = 'studentDzPushLastSync';
  const ENTRY_KEY = 'studentDzPlannerEntries';
  const pageUrl = new URL('../sw.js', location.href).href;

  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;

  const getClientId = () => {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `${Date.now()}${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  };

  const statusEl = document.getElementById('notificationStatus');
  const button = document.getElementById('notifyBtn');
  if (!statusEl || !button) return;

  const originalText = button.innerHTML;
  const setStatus = (html) => { statusEl.innerHTML = html; };

  function addCloudButton() {
    if (document.getElementById('pushCloudBtn')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'pushCloudBtn';
    b.className = 'btn btn-outline';
    b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> تفعيل التذكير حتى بعد الإغلاق';
    b.addEventListener('click', enablePush);
    button.parentElement.appendChild(b);
  }

  async function getRegistration() {
    return navigator.serviceWorker.register(pageUrl, { scope: '../' });
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const raw = atob((base64String + padding).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  async function getPublicKey() {
    const r = await fetch(`${API_URL}/public-key`, { cache: 'no-store' });
    if (!r.ok) throw new Error('push-public-key');
    const data = await r.json();
    if (!data.publicKey) throw new Error('push-public-key-empty');
    return data.publicKey;
  }

  async function enablePush() {
    if (API_URL.includes('YOUR-PUSH-SERVER')) {
      setStatus('<i class="fa-solid fa-circle-info"></i> خدمة Push لم تُربط بعد بخادم الإشعارات.');
      return;
    }
    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('<i class="fa-solid fa-circle-xmark"></i> يجب السماح بالإشعارات من إعدادات المتصفح.');
        return;
      }
      const reg = await getRegistration();
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        const publicKey = await getPublicKey();
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }
      const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: getClientId(), subscription })
      });
      if (!response.ok) throw new Error('push-subscribe');
      setStatus('<i class="fa-solid fa-circle-check"></i> التذكير السحابي مفعّل. ستصل إشعارات Push بعد إغلاق الصفحة أيضاً.');
      await syncSchedule(true);
    } catch (error) {
      console.error('Student DZ Push:', error);
      setStatus('<i class="fa-solid fa-triangle-exclamation"></i> تعذر تفعيل التذكير السحابي. تحقق من اتصال خادم Push.');
    }
  }

  async function syncSchedule(force) {
    if (API_URL.includes('YOUR-PUSH-SERVER')) return;
    const raw = localStorage.getItem(ENTRY_KEY) || '[]';
    const signature = btoa(unescape(encodeURIComponent(raw))).slice(0, 100);
    if (!force && localStorage.getItem(SYNC_KEY) === signature) return;
    const reg = await getRegistration();
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return;
    const entries = JSON.parse(raw);
    const response = await fetch(`${API_URL}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: getClientId(), entries })
    });
    if (!response.ok) throw new Error('push-schedule');
    localStorage.setItem(SYNC_KEY, signature);
  }

  addCloudButton();
  if (Notification.permission === 'granted') {
    setStatus('<i class="fa-solid fa-bell"></i> إشعارات المتصفح مفعّلة. يمكنك أيضاً تفعيل التذكير السحابي.');
  }

  navigator.serviceWorker.ready.then(() => syncSchedule(true)).catch(() => {});
  setInterval(() => syncSchedule(false).catch(() => {}), 5000);
})();
