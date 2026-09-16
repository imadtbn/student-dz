/* Student DZ contact form sender */
(function () {
    'use strict';
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submit = document.getElementById('contactSubmit');
    const status = document.getElementById('contactStatus');
    const field = id => document.getElementById(id);

    function pageKey() {
        return window.location.pathname
            .replace(/^\/student-dz\/?/, '')
            .replace(/\//g, '__')
            .replace(/\.html$/, '') || 'home';
    }

    function setStatus(message, isError) {
        status.textContent = message;
        status.style.color = isError ? '#b42318' : '#087443';
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const name = field('contactName').value.trim();
        const email = field('contactEmail').value.trim();
        const subject = field('contactSubject').value.trim();
        const message = field('contactMessage').value.trim();
        if (!name || !email || !subject || !message) return;

        submit.disabled = true;
        submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جارٍ الإرسال...';
        setStatus('', false);

        try {
            const settingsUrl = window.CONFIG?.getUrl
                ? CONFIG.getUrl(CONFIG.API.FEEDBACK_SETTINGS)
                : '../data/feedback-settings.json';
            const settingsResponse = await fetch(settingsUrl, { cache: 'no-store' });
            const settings = settingsResponse.ok ? await settingsResponse.json() : {};
            if (!settings.enabled || !settings.endpoint) throw new Error('FEEDBACK_ENDPOINT_NOT_CONFIGURED');

            const report = {
                pageKey: pageKey(),
                pagePath: window.location.pathname,
                pageUrl: window.location.href,
                pageTitle: document.title || 'اتصل بنا | Student DZ',
                type: 'contact',
                name,
                email,
                subject,
                description: message,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                submissionId: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
            };

            await fetch(settings.endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(report)
            });

            form.reset();
            setStatus('تم إرسال رسالتك بنجاح. شكرًا لتواصلك معنا.', false);
        } catch (error) {
            console.error('Contact form submission error:', error);
            setStatus('تعذر إرسال الرسالة حاليًا. يرجى المحاولة لاحقًا.', true);
        } finally {
            submit.disabled = false;
            submit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> إرسال';
        }
    });
})();
