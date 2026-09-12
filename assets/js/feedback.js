/* Student DZ global feedback component */
(function () {
    if (window.__studentDzFeedbackLoaded) return;
    window.__studentDzFeedbackLoaded = true;

    function pageKey() {
        return window.location.pathname.replace(/^\/student-dz\/?/, '').replace(/\//g, '__').replace(/\.html$/, '') || 'home';
    }

    function ensureCss() {
        if (document.querySelector('link[data-feedback-css]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = (window.CONFIG?.BASE_PATH || '/student-dz') + '/assets/css/feedback.css';
        link.dataset.feedbackCss = 'true';
        document.head.appendChild(link);
    }

    function init() {
        ensureCss();
        let container = document.getElementById('feedbackContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'feedbackContainer';
            document.body.appendChild(container);
        }
        if (document.getElementById('feedbackFab')) return;

        const path = window.location.pathname;
        const key = pageKey();
        const title = document.title || 'Student DZ';
        container.innerHTML = `
            <button class="feedback-fab" id="feedbackFab" type="button" aria-label="دعم Student DZ">
                <i class="fa-solid fa-wrench" aria-hidden="true"></i> دعم Student DZ
            </button>
            <div class="feedback-modal" id="feedbackModal" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
                <div class="feedback-content">
                    <button class="feedback-close" id="feedbackClose" type="button" aria-label="إغلاق">✕</button>
                    <h3 id="feedbackTitle">كيف يمكننا تحسين الموقع؟</h3>
                    <form id="feedbackForm" class="feedback-form">
                        <label for="feedbackType">نوع البلاغ</label>
                        <select id="feedbackType" required>
                            <option value="">-- اختر --</option>
                            <option value="bug">الإبلاغ عن خطأ</option>
                            <option value="feature">اقتراح ميزة</option>
                            <option value="broken_link">رابط لا يعمل</option>
                            <option value="update_info">معلومة تحتاج تحديثًا</option>
                            <option value="tool_issue">مشكلة في أداة</option>
                            <option value="other">أخرى</option>
                        </select>
                        <label for="feedbackPage">الصفحة الحالية</label>
                        <input type="text" id="feedbackPage" readonly value="${path}">
                        <label for="feedbackDesc">وصف المشكلة / الاقتراح</label>
                        <textarea id="feedbackDesc" rows="4" required></textarea>
                        <button type="submit" id="feedbackSubmit">إرسال البلاغ</button>
                    </form>
                    <div id="feedbackSuccess" class="feedback-success" role="status" aria-live="polite"></div>
                </div>
            </div>`;

        const fab = document.getElementById('feedbackFab');
        const modal = document.getElementById('feedbackModal');
        const closeBtn = document.getElementById('feedbackClose');
        const form = document.getElementById('feedbackForm');
        const success = document.getElementById('feedbackSuccess');
        const submit = document.getElementById('feedbackSubmit');

        const close = () => {
            modal.classList.remove('active');
            form.reset();
            form.style.display = 'block';
            success.style.display = 'none';
        };
        fab.addEventListener('click', () => modal.classList.add('active'));
        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', e => { if (e.target === modal) close(); });

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const report = {
                pageKey: key,
                pagePath: path,
                pageUrl: window.location.href,
                pageTitle: title,
                type: document.getElementById('feedbackType').value,
                description: document.getElementById('feedbackDesc').value.trim(),
                timestamp: new Date().toISOString()
            };

            submit.disabled = true;
            submit.textContent = 'جارٍ الإرسال...';

            try {
                const settingsUrl = window.CONFIG?.getUrl
                    ? CONFIG.getUrl(CONFIG.API.FEEDBACK_SETTINGS)
                    : '/student-dz/data/feedback-settings.json';
                const settingsResponse = await fetch(settingsUrl, { cache: 'no-store' });
                const settings = settingsResponse.ok ? await settingsResponse.json() : {};

                if (!settings.endpoint) {
                    throw new Error('FEEDBACK_ENDPOINT_NOT_CONFIGURED');
                }

                const response = await fetch(settings.endpoint, {
                    method: settings.method || 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                success.textContent = 'تم إرسال البلاغ بنجاح. شكرًا لمساهمتك في تحسين Student DZ.';
                form.style.display = 'none';
                success.style.display = 'block';
            } catch (error) {
                console.error('Feedback submission error:', error);
                success.textContent = 'تعذر إرسال البلاغ حاليًا. يرجى المحاولة لاحقًا.';
                success.style.display = 'block';
            } finally {
                submit.disabled = false;
                submit.textContent = 'إرسال البلاغ';
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
