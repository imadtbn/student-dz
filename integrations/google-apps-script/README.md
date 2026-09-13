# استقبال بلاغات Student DZ عبر Google Sheets

يحتوي هذا المجلد على خدمة Google Apps Script تستقبل JSON من زر **دعم Student DZ**. يجب ربط مشروع Apps Script بجدول Google Sheets؛ عند وصول البلاغ تُنشأ ورقة باسم `pageKey` تلقائيًا، ثم يُضاف البلاغ كسطر جديد مع المحافظة على عناوين الأعمدة.

## الملفات

- `Code.gs`: دوال `doGet` و`doPost`، إنشاء الأوراق، وتسجيل البلاغات.
- `appsscript.json`: إعداد Web App للتنفيذ بحساب مالك النشر والسماح بالوصول المجهول.

## النشر اليدوي عند الحاجة

1. افتح جدول البلاغات: [Student DZ - Feedback Reports](https://docs.google.com/spreadsheets/d/16_WMIL0CE5-Azhc78Ql7pqmqLzKksTYd8xd4DRNa4Dk/edit).
2. من **Extensions → Apps Script** أنشئ/الصق محتوى `Code.gs` و`appsscript.json`.
3. اختر **Deploy → New deployment**، والنوع **Web app**.
4. اجعل **Execute as** حسابك، و**Who has access** هو **Anyone**، ثم وافق على الصلاحيات.
5. انسخ رابط `/exec` الناتج وضعه في `data/feedback-settings.json` في الحقل `endpoint`.

لا تضع رابط `/dev` في إعدادات الموقع؛ رابط `/exec` هو رابط النشر الثابت الذي يستخدمه الموقع.

## التوجيه حسب الصفحة

يحوّل الموقع المسار إلى `pageKey`، مثل `tools__average-calculator` أو `home`. يستقبل Apps Script هذا المفتاح وينشئ ورقة مستقلة بالاسم نفسه. تُحمى قيم المستخدم من التحول إلى صيغ Google Sheets، ويُستخدم `LockService` لمنع تعارض الإضافات المتزامنة.
