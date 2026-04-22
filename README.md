# Genetic Recommendation Lab

واجهة Next.js عربية لعرض نظام توصيات منتجات مبني على الخوارزمية الجينية.

## فكرة المشروع

المشروع يعتمد على ملف [data_cleaned.xlsx](./data_cleaned.xlsx) كمصدر للبيانات، ثم يحول
الشيتات النظيفة إلى ملفات JSON داخل مجلد `data/`، وبعدها يستخدم هذه البيانات داخل الموقع
لتوليد توصيات منتجات جديدة للمستخدمين.

## تدفق البيانات

1. ملف Excel يحتوي على الشيتات:
   `users_clean`, `products_clean`, `ratings_clean`, `behavior_clean`
2. سكربت الاستخراج:
   `python scripts/extract_cleaned_workbook.py`
3. الملفات الناتجة:
   `data/users.json`
   `data/products.json`
   `data/interactions.json`
   `data/summary.json`
4. منطق التوصية على السيرفر:
   `lib/server/recommender.ts`

## التشغيل المحلي

1. ثبّت الاعتماديات:
   `npm install`
2. إذا تغيّر ملف Excel شغّل سكربت الاستخراج:
   `python scripts/extract_cleaned_workbook.py`
3. شغّل التطبيق:
   `npm run dev`

## الأوامر المهمة

- تشغيل التطوير:
  `npm run dev`
- فحص lint:
  `npm run lint`
- بناء الإنتاج:
  `npm run build`

## ملاحظات

- صفحة التوصيات تعتمد الآن على توصية منتجات جديدة غير مرئية للمستخدم قدر الإمكان.
- تم نقل الصفحات الأساسية إلى نمط `server-first` لتقليل حجم JavaScript على العميل.
- البحث العام في الهيدر يوجّه مباشرة إلى صفحة المنتجات باستخدام `q` داخل الرابط.
