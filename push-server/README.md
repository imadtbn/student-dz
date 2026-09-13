# Student DZ — Web Push server

هذا الخادم هو الجزء المطلوب لإرسال إشعارات Web Push الحقيقية بعد إغلاق صفحة Student DZ.

## 1) توليد VAPID

على الخادم شغّل:

```bash
npm install
npx web-push generate-vapid-keys
```

ضع المفتاحين الناتجين في متغيرات البيئة:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` مثل `mailto:admin@your-domain.com`
- `ALLOWED_ORIGIN=https://imadtbn.github.io`

لا تضع `VAPID_PRIVATE_KEY` داخل GitHub أو داخل JavaScript الخاص بالموقع.

## 2) التشغيل

```bash
npm start
```

يحتاج الخادم إلى HTTPS عند الاستخدام الإنتاجي، ويمكن تشغيله على Render أو Railway أو Fly.io أو خادم VPS يدعم Node.js.

## 3) ربط Student DZ

بعد نشر الخادم، افتح:

`assets/js/push-config.js`

وغيّر:

```js
window.STUDENT_DZ_PUSH_API = 'https://YOUR-PUSH-SERVER.example.com';
```

إلى عنوان الخادم الحقيقي.

## 4) آلية العمل

1. الطالب يمنح إذن الإشعارات.
2. المتصفح ينشئ Push Subscription.
3. الاشتراك يُرسل إلى `/subscribe`.
4. صفحة السجل ترسل المواعيد والتذكيرات إلى `/schedule`.
5. الخادم يفحص التذكيرات كل 30 ثانية.
6. عند حلول الموعد، `web-push` يرسل رسالة مشفرة إلى Push Service.
7. المتصفح يوقظ `sw.js` حتى إذا كانت الصفحة مغلقة ويعرض الإشعار.
8. الضغط على الإشعار يعيد الطالب إلى سجل المواعيد.

## ملاحظة مهمة

GitHub Pages يستضيف الواجهة فقط ولا يشغّل Node.js. لذلك لا يمكن الحصول على Push حقيقي بعد إغلاق الصفحة باستخدام GitHub Pages وحدها؛ يجب نشر هذا الخادم على خدمة تدعم تشغيل Node.js أو استخدام Backend/Push provider آخر.
