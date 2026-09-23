# تشغيل أدوات AI المجانية — Student DZ

الواجهة على GitHub Pages؛ خادم AI يعمل على Cloudflare Workers AI، بلا مفتاح API في المتصفح.

1. أنشئ حساب Cloudflare مجانيًا. من مجلد `cloudflare/student-dz-ai` نفّذ `npx wrangler login` ثم `npx wrangler deploy`.
2. سيظهر عنوان مثل `https://student-dz-ai.<your-subdomain>.workers.dev`؛ انسخ **عنوانك الفعلي** فقط إلى `assets/js/ai-config.js` في `window.STUDENT_DZ_AI_API_URL`.
3. اختبر الصفحتين من نطاق `https://imadtbn.github.io/student-dz/` بعد النشر.
4. نموذج `@cf/google/gemma-4-26b-a4b-it` ضمن نماذج Workers المجانية بتاريخ سبتمبر 2026، لكن الحصص والقدرة تتغير. اضبط حدًا للمصروفات من لوحة Cloudflare ولا تفعّل الدفع التلقائي إن أردت ضمان عدم التكلفة.

## أمان الإنتاج

فحص Origin وCORS في المثال يمنع معظم استدعاءات المتصفح عبر المواقع الأخرى **لكنه ليس مصادقة ولا يمنع الطلبات المباشرة أو تزوير Origin**. قبل الإعلان العام، أضف Cloudflare Turnstile مع تحقق **خادمي**، وتحديد معدل طلبات عبر Cloudflare WAF أو Durable Objects بحدود إجمالية، وراقب إجمالي استهلاك Neurons. لا تسجّل نصوص الطلاب. يمكن أن تصبح الخدمة غير متاحة عند نفاد الحصة أو انشغال النموذج. لا تنشر مفتاح Cloudflare في GitHub أو JS.

النسخة الأولى تدعم النصوص المباشرة والنسخ والتصدير TXT. دعم PDF وWord يتطلب تطويرًا واختبارًا لاحقًا.
