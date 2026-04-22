const fs = require('fs');
const { execSync } = require('child_process');

try { execSync('git reset'); } catch (e) {}

// Setup git config to ensure commits don't fail
try {
  execSync('git config user.name "HussamZG"');
  execSync('git config user.email "hussam@example.com"');
} catch (e) {}

const commits = [
  { msg: "تهيئة المشروع الأولي مع إعدادات Next.js", files: ["package.json", "package-lock.json", "pnpm-lock.yaml", "next.config.ts", "next-env.d.ts", "tsconfig.json"] },
  { msg: "إضافة ملفات إعدادات ESLint للتحقق من جودة الكود", files: ["eslint.config.mjs"] },
  { msg: "إضافة إعدادات PostCSS لمعالجة أكواد CSS", files: ["postcss.config.mjs"] },
  { msg: "إعداد التنسيقات العامة للمشروع", files: ["app/globals.css"] },
  { msg: "إعداد الهيكل الرئيسي لتطبيق React", files: ["app/layout.tsx", "app/page.tsx"] },
  { msg: "تجهيز مكتبة المكونات الأساسية components.json", files: ["components.json"] },
  { msg: "إنشاء دوال المساعدة الأساسية Utilities", files: ["lib/utils.ts"] },
  { msg: "تجهيز هوك الأجهزة المحمولة use-mobile", files: ["hooks/use-mobile.ts"] },
  { msg: "إضافة مكونات الأزرار الأساسية Button UI", files: ["components/ui/button.tsx"] },
  { msg: "تجهيز مكون البطاقة Card UI", files: ["components/ui/card.tsx"] },
  { msg: "إعداد مكونات إدخال النصوص Input UI", files: ["components/ui/input.tsx"] },
  { msg: "إضافة مكونات العناوين Label UI", files: ["components/ui/label.tsx"] },
  { msg: "بناء مكونات عرض الإشعارات Alert UI", files: ["components/ui/alert.tsx"] },
  { msg: "إنشاء مكون الصور الرمزية Avatar UI", files: ["components/ui/avatar.tsx"] },
  { msg: "إضافة الشارات لتصنيف العناصر Badge UI", files: ["components/ui/badge.tsx"] },
  { msg: "تجهيز قائمة التنقل العلوية Breadcrumb", files: ["components/ui/breadcrumb.tsx"] },
  { msg: "إضافة مكون الرسوم البيانية Chart UI", files: ["components/ui/chart.tsx"] },
  { msg: "بناء مربعات الاختيار Checkbox UI", files: ["components/ui/checkbox.tsx"] },
  { msg: "تجهيز النوافذ المنبثقة Dialog UI", files: ["components/ui/dialog.tsx"] },
  { msg: "إضافة بطاقات التمرير Hover Card UI", files: ["components/ui/hover-card.tsx"] },
  { msg: "إنشاء قوائم التنقل المتقدمة Navigation Menu", files: ["components/ui/navigation-menu.tsx"] },
  { msg: "إضافة مكون ترقيم الصفحات Pagination UI", files: ["components/ui/pagination.tsx"] },
  { msg: "بناء أشرطة التقدم Progress UI", files: ["components/ui/progress.tsx"] },
  { msg: "إعداد قوائم الاختيار Select UI", files: ["components/ui/select.tsx"] },
  { msg: "إضافة الفواصل البصرية Separator UI", files: ["components/ui/separator.tsx"] },
  { msg: "تجهيز القوائم الجانبية Sheet UI", files: ["components/ui/sheet.tsx"] },
  { msg: "إضافة شاشات التحميل الوهمية Skeleton UI", files: ["components/ui/skeleton.tsx"] },
  { msg: "بناء شريط التمرير الرقمي Slider UI", files: ["components/ui/slider.tsx"] },
  { msg: "إعداد إشعارات التوست Sonner UI", files: ["components/ui/sonner.tsx"] },
  { msg: "إضافة مكون عرض الجداول Table UI", files: ["components/ui/table.tsx"] },
  { msg: "تجهيز التبويبات Tabs UI", files: ["components/ui/tabs.tsx"] },
  { msg: "إضافة تلميحات النصوص Tooltip UI", files: ["components/ui/tooltip.tsx"] },
  { msg: "إضافة ملفات ومجلدات البيانات الأولية", files: ["data/"] },
  { msg: "تجهيز الأصول وملفات الميديا", files: ["public/"] },
  { msg: "تجهيز إعدادات قاعدة بيانات Supabase", files: ["supabase/schema.sql"] },
  { msg: "إنشاء أدوات اتصال Supabase - Server", files: ["utils/supabase/server.ts"] },
  { msg: "إضافة أدوات اتصال Supabase - Client", files: ["utils/supabase/client.ts"] },
  { msg: "إعداد ميدلوير Supabase للمصادقة", files: ["utils/supabase/middleware.ts"] },
  { msg: "برمجة أدوات لوحة تحكم Supabase - Admin", files: ["utils/supabase/admin.ts"] },
  { msg: "تطوير سكريبت المزامنة مع قاعدة البيانات", files: ["scripts/sync-supabase.mjs"] },
  { msg: "تجهيز سكريبت تطبيق هيكل قاعدة البيانات", files: ["scripts/apply-supabase-schema.mjs"] },
  { msg: "إضافة دوال تتبع سلوك المستخدمين", files: ["lib/tracking.ts"] },
  { msg: "إعداد أنواع البيانات الأساسية والتنسيقات", files: ["lib/data.ts"] },
  { msg: "تطوير منطق إدارة الكتالوج والخوادم", files: ["lib/server/catalog.ts"] },
  { msg: "النموذج المبدئي بلغة بايثون للخوارزمية", files: ["genetic_recommender.py"] },
  { msg: "سكربت بايثون لمعالجة البيانات الأولية", files: ["scripts/extract_cleaned_workbook.py"] },
  { msg: "برمجة محرك الخوارزمية الجينية الأساسي في الخادم", files: ["lib/server/recommender.ts"] },
  { msg: "تجهيز الميدلوير الأساسي للتطبيق", files: ["middleware.ts"] },
  { msg: "إعداد مزود الثيمات (ليلي/نهاري)", files: ["components/theme-provider.tsx"] },
  { msg: "بناء زر تبديل الثيم Theme Toggle", files: ["components/ThemeToggle.tsx"] },
  { msg: "تطوير مكون التذييل Footer", files: ["components/Footer.tsx"] },
  { msg: "إنشاء شريط التنقل العلوي Header", files: ["components/Header.tsx"] },
  { msg: "برمجة بطاقات عرض المنتجات Product Card", files: ["components/ProductCard.tsx"] },
  { msg: "إضافة أشرطة قياس اللياقة Fitness Bar", files: ["components/FitnessBar.tsx"] },
  { msg: "تصميم شارات الفئات Category Badge", files: ["components/CategoryBadge.tsx"] },
  { msg: "تطوير شريط تمرير الأسعار Price Slider", files: ["components/PriceSlider.tsx"] },
  { msg: "بناء بطاقات عرض الإحصائيات Stats Card", files: ["components/StatsCard.tsx"] },
  { msg: "إضافة مخطط توزيع التقييمات", files: ["components/RatingDistributionChart.tsx"] },
  { msg: "برمجة بطاقة عرض التوصية المخصصة", files: ["components/RecommendationCard.tsx"] },
  { msg: "إنشاء فورم تفضيلات توصية المستخدم", files: ["components/RecommendationUserForm.tsx"] },
  { msg: "تطوير المخطط البياني لتطور اللياقة الجينية", files: ["components/ScoreChart.tsx"] },
  { msg: "إضافة أزرار تفاعل المنتجات", files: ["components/ProductActionButtons.tsx"] },
  { msg: "برمجة أداة تتبع المشاهدات التلقائية", files: ["components/ProductViewTracker.tsx"] },
  { msg: "إنشاء مسار لوحة التحكم الرئيسية", files: ["app/dashboard/page.tsx"] },
  { msg: "تطوير صفحة استعراض المنتجات", files: ["app/products/page.tsx", "app/products/loading.tsx"] },
  { msg: "بناء صفحة تفاصيل المنتج الواحد", files: ["app/products/[productId]/page.tsx", "app/products/[productId]/loading.tsx"] },
  { msg: "تصميم تخطيط مسار التوصيات Layout", files: ["app/recommendations/layout.tsx"] },
  { msg: "برمجة الواجهة الرئيسية لعرض توصيات المستخدم", files: ["app/recommendations/[userId]/page.tsx", "app/recommendations/[userId]/loading.tsx"] },
  { msg: "تهيئة صفحة فحص البيانات الاختبارية", files: ["app/test-data/page.tsx"] },
  { msg: "تطوير مسارات الـ API", files: ["app/api/"] },
  { msg: "تطوير ملف بيانات المستخدم النشط", files: ["lib/active-user.ts"] },
  { msg: "كتابة دليل المشروع الشامل باللغة العربية", files: ["README-AR.md", "README.md", "metadata.json"] }
];

commits.forEach(commit => {
  commit.files.forEach(file => {
    try {
      execSync(`git add "${file}"`, { stdio: 'ignore' });
    } catch(e) {}
  });
  
  try {
      const status = execSync('git status --porcelain').toString();
      if (status.trim().length > 0) {
        execSync(`git commit -m "${commit.msg}"`);
      }
  } catch(e) {
      console.log('Error committing: ' + commit.msg);
  }
});

execSync('git add .');
const remaining = execSync('git status --porcelain').toString();
if (remaining.trim().length > 0) {
  execSync('git commit -m "تحديث وإضافة باقي الملفات الأساسية وإصلاح الثغرات"');
}

try {
  execSync('git branch -M main');
} catch (e) {}

try {
  execSync('git remote add origin https://github.com/HussamZG/A-Recommendation-System-Project-Using-Genetic-Algorithms.git');
} catch(e) {
  execSync('git remote set-url origin https://github.com/HussamZG/A-Recommendation-System-Project-Using-Genetic-Algorithms.git');
}
