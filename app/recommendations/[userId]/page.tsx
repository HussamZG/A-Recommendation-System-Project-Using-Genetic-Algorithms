import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BarChart2, History, Sparkles } from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import RecommendationCard from '@/components/RecommendationCard';
import ScoreChart from '@/components/ScoreChart';
import { getRecommendationPayload } from '@/lib/server/recommender';


interface RecommendationsPageProps {
  params: Promise<{ userId: string }>;
}

export default async function RecommendationsPage({ params }: RecommendationsPageProps) {
  const { userId } = await params;
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    notFound();
  }

  const data = await getRecommendationPayload(parsedUserId);
  if (!data) {
    notFound();
  }

  const chartMax = Math.max(1, ...data.scoreHistory);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        الرجوع
      </Link>

      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xl font-bold text-primary">
              U{data.user.user_id}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">ملف المستخدم</h1>
              <p className="text-sm text-muted-foreground">
                تم تحليل عمره ودولته وسجل تفاعلاته لتوليد قائمة منتجات جديدة.
              </p>
            </div>
          </div>

          <div className="flex gap-6 rounded-xl border border-border/60 bg-secondary/70 px-6 py-3">
            <div className="text-center">
              <p className="mb-1 text-xs font-medium text-muted-foreground">العمر</p>
              <p className="font-bold text-foreground">{data.user.age} سنة</p>
            </div>
            <div className="h-auto w-px bg-border" />
            <div className="text-center">
              <p className="mb-1 text-xs font-medium text-muted-foreground">الدولة</p>
              <p className="font-bold text-foreground">{data.user.country}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-6 w-6" />
          <h2 className="text-lg font-bold">
            هذه أفضل 5 منتجات جديدة موصى بها للمستخدم #{data.user.user_id}
          </h2>
        </div>

        <div className="space-y-4">
          {data.recommendations.map((item, index) => (
            <RecommendationCard
              key={item.product.product_id}
              item={item}
              isFirst={index === 0}
            />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">سجل التفاعل الأقوى</h2>
        </div>

        {data.history.length > 0 ? (
          <div className="space-y-4">
            {data.history.map((item) => (
              <div key={item.product.product_id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.product.category.name} • #{item.product.product_id}
                    </p>
                  </div>
                  <div className="text-xl font-black text-primary">{item.fitness} / 23</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div className="rounded-xl bg-secondary px-3 py-2">
                    <span className="text-muted-foreground">المشاهدة</span>
                    <p className="font-bold text-foreground">{item.viewed}</p>
                  </div>
                  <div className="rounded-xl bg-secondary px-3 py-2">
                    <span className="text-muted-foreground">النقر</span>
                    <p className="font-bold text-foreground">{item.clicked}</p>
                  </div>
                  <div className="rounded-xl bg-secondary px-3 py-2">
                    <span className="text-muted-foreground">الشراء</span>
                    <p className="font-bold text-foreground">{item.purchased}</p>
                  </div>
                  <div className="rounded-xl bg-secondary px-3 py-2">
                    <span className="text-muted-foreground">التقييم</span>
                    <p className="font-bold text-foreground">
                      {item.rating > 0 ? `${item.rating} / 5` : 'لم يقيّم'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-sm">
            لا يوجد سجل تفاعل متاح لهذا المستخدم.
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">إحصائيات التوليد</h2>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">أفضل مجموع</p>
            <p className="mt-1 text-3xl font-black text-primary">{data.stats.bestScore}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">عدد التفاعلات</p>
            <p className="mt-1 text-3xl font-black text-foreground">{data.stats.interactionsCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">النقرات</p>
            <p className="mt-1 text-3xl font-black text-foreground">{data.stats.clickedCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">المشتريات</p>
            <p className="mt-1 text-3xl font-black text-foreground">{data.stats.purchasedCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">مصدر البيانات</p>
            <p className="mt-1 text-xl font-black text-foreground">
              {data.stats.dataSource === 'supabase' ? 'Supabase' : 'محلي'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">بداية التحسين</p>
              <p className="text-xl font-bold text-foreground">{data.stats.initialScore}</p>
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">النهاية</p>
              <p className="text-xl font-bold text-foreground">{data.stats.finalScore}</p>
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">التحسن</p>
              <p className="text-xl font-bold text-foreground">
                {data.stats.improvement >= 0 ? '+' : ''}
                {data.stats.improvement}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">عدد الأجيال</p>
              <p className="text-xl font-bold text-foreground">{data.stats.generations}</p>
            </div>
          </div>

          <h3 className="mb-4 font-bold text-foreground">تطور أفضل درجة عبر الأجيال</h3>
          <ScoreChart scoreHistory={data.scoreHistory} />
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-foreground">منتجات قد تعجبك أيضًا</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {data.otherProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
