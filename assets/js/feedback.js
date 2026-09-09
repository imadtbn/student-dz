// Feedback System Component (UI Only for Phase 1)
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('feedbackContainer');
    if (!container) return;

    // Inject HTML
    container.innerHTML = `
        <button class="feedback-fab" id="feedbackFab">
            <span>🛠</span> دعم Student DZ
        </button>

        <div class="feedback-modal" id="feedbackModal">
            <div class="feedback-content">
                <button class="feedback-close" id="feedbackClose">✕</button>
                <h3>كيف يمكننا تحسين الموقع؟</h3>

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
                    <input type="text" id="feedbackPage" readonly value="${window.location.pathname}">

                    <label for="feedbackDesc">وصف المشكلة / الاقتراح</label>
                    <textarea id="feedbackDesc" rows="4" required></textarea>

                    <button type="submit">إرسال البلاغ</button>
                </form>

                <div id="feedbackSuccess" class="feedback-success">
                    شكرًا لمساهمتك في تحسين Student DZ! 🎉
                </div>
            </div>
        </div>
    `;

    const fab = document.getElementById('feedbackFab');
    const modal = document.getElementById('feedbackModal');
    const closeBtn = document.getElementById('feedbackClose');
    const form = document.getElementById('feedbackForm');
    const successMsg = document.getElementById('feedbackSuccess');

    fab.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.style.display = 'block';
        successMsg.style.display = 'none';
        form.reset();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBtn.click();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Construct report object (ready for Phase 2 integration)
        const report = {
            type: document.getElementById('feedbackType').value,
            pageUrl: window.location.href,
            pageTitle: document.title,
            description: document.getElementById('feedbackDesc').value,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        console.log("Feedback Report Generated (Not sent yet):", report);

        // Show success
        form.style.display = 'none';
        successMsg.style.display = 'block';

        setTimeout(() => {
            closeBtn.click();
        }, 3000);
    });
});
