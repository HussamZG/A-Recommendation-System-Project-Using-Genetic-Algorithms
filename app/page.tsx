import Link from 'next/link';
import { Package, Tags, Target, Users } from 'lucide-react';

import RecommendationUserForm from '@/components/RecommendationUserForm';
import StatsCard from '@/components/StatsCard';
import { calculateAverageRating, getCatalogSnapshot } from '@/lib/server/catalog';


export default async function Home() {
  const { summary } = await getCatalogSnapshot();
  const averageRating = calculateAverageRating(summary);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative mb-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 px-6 py-16 text-white shadow-xl md:px-10 md:py-24">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          
          <h1 className="mb-6 text-4xl font-black leading-tight md:text-6xl">
            توصيات منتجات جديدة
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
              بالخوارزمية الجينية
            </span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-blue-100 md:text-xl">
            المنصة تحلل بيانات المستخدمين والمنتجات والتفاعلات والتقييمات، ثم تولد قائمة منتجات جديدة
            تناسب كل مستخدم. وعند توفر جداول Supabase تصبح التفاعلات محدثة وواقعية بدل أن تبقى
            static فقط.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#try"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-slate-900 transition hover:bg-blue-50"
            >
              ابدأ التجربة الآن
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white transition hover:bg-white/15"
            >
              استكشف المنتجات
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">كيف يعمل النظام؟</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'حدد المستخدم',
              desc: `أدخل رقم مستخدم من 1 إلى ${summary.totalUsers} لقراءة ملفه السلوكي الحقيقي.`,
            },
            {
              step: '2',
              title: 'نبني ملف التفضيلات',
              desc: 'يتم تحليل الفئات والأسعار والتقييمات والمنتجات التي تفاعل معها المستخدم لاستخراج تفضيلاته.',
            },
            {
              step: '3',
              title: 'نولد اقتراحات جديدة',
              desc: 'الخوارزمية الجينية تختار مجموعة منتجات جديدة ومتنوعة تعظّم الملاءمة وتقلل التكرار.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-transform hover:-translate-y-1">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md">
                {item.step}
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <StatsCard title="مستخدم مسجل" value={summary.totalUsers.toLocaleString()} icon={<Users className="h-6 w-6" />} />
          <StatsCard title="منتج متاح" value={summary.totalProducts.toLocaleString()} icon={<Package className="h-6 w-6" />} />
          <StatsCard title="فئات المنتجات" value={summary.categoryDistribution.length} icon={<Tags className="h-6 w-6" />} />
          <StatsCard title="متوسط التقييم" value={`${averageRating} / 5`} icon={<Target className="h-6 w-6" />} trend={`${summary.maxFitnessScore} نقطة`} trendUp />
        </div>
      </section>

      <section className="mb-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] border border-border bg-card p-10 shadow-sm md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-foreground">قاعدة منتجات قابلة للبحث والتصفية</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              تصفح المنتجات مع تصفية حسب الفئة والسعر والتقييم، وابحث باسم المنتج أو رقمه
              أو نوعه مباشرة من الشريط العلوي أو صفحة المنتجات.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            عرض المنتجات
          </Link>
        </div>
      </section>

      <section
        id="try"
        className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card p-10 text-center shadow-sm md:p-16"
      >
        <h2 className="mb-4 text-3xl font-bold text-foreground">جرّب النظام الآن</h2>
        <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
          أدخل رقم أي مستخدم من قاعدة البيانات لنولّد له توصيات جديدة، وسنحفظ هذا المستخدم كهوية
          الجلسة الحالية حتى يتم تتبع مشاهداته ونقراته وعمليات الشراء داخل الموقع.
        </p>

        <RecommendationUserForm
          maxUserId={summary.totalUsers}
          buttonLabel="احصل على توصياتي"
          placeholder="رقم المستخدم (مثال: 42)"
        />
      </section>
    </div>
  );
}
