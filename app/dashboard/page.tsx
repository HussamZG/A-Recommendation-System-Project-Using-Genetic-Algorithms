import Link from 'next/link';
import { Activity, Package, ShoppingCart, Users } from 'lucide-react';

import RecommendationUserForm from '@/components/RecommendationUserForm';
import StatsCard from '@/components/StatsCard';
import { RatingDistributionChart } from '@/components/RatingDistributionChart';
import {
  calculateAverageRating,
  getCatalogSnapshot,
  getTopProductsFromProducts,
} from '@/lib/server/catalog';


export default async function DashboardPage() {
  const { summary, products } = await getCatalogSnapshot();
  const topProducts = getTopProductsFromProducts(products, 5);
  const averageRating = calculateAverageRating(summary);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">لوحة إحصائيات النظام</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="إجمالي المستخدمين" value={summary.totalUsers.toLocaleString()} icon={<Users className="h-6 w-6" />} />
        <StatsCard title="إجمالي المنتجات" value={summary.totalProducts.toLocaleString()} icon={<Package className="h-6 w-6" />} />
        <StatsCard title="عدد التقييمات" value={summary.totalRatings.toLocaleString()} icon={<ShoppingCart className="h-6 w-6" />} trend={`${averageRating} / 5`} trendUp />
        <StatsCard title="سجلات السلوك" value={summary.totalBehaviorRows.toLocaleString()} icon={<Activity className="h-6 w-6" />} trend="حيّة أو محلية" trendUp />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-bold text-foreground">توزيع المنتجات حسب الفئة</h2>
          <div className="space-y-4">
            {summary.categoryDistribution.map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{item.name}</span>
                  <span className="font-bold">{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold text-foreground">مسار سلوك المستخدمين</h2>
          <div className="space-y-6">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">المشاهدات</span>
                <span className="font-black text-muted-foreground">{summary.funnel.views.toLocaleString()}</span>
              </div>
              <div className="h-10 rounded-lg bg-secondary shadow-inner">
                <div className="h-full w-full rounded-lg bg-slate-400" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">يتم احتسابها من جدول التفاعلات الحالي.</p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">النقرات</span>
                <span className="font-black text-emerald-500">{summary.funnel.clickRate}%</span>
              </div>
              <div className="h-10 rounded-lg bg-secondary shadow-inner">
                <div className="h-full rounded-lg bg-emerald-500" style={{ width: `${summary.funnel.clickRate}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{summary.funnel.clicks.toLocaleString()} حالة تفاعل.</p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">المشتريات</span>
                <span className="font-black text-primary">{summary.funnel.purchaseRate}%</span>
              </div>
              <div className="h-10 rounded-lg bg-secondary shadow-inner">
                <div className="h-full rounded-lg bg-primary" style={{ width: `${summary.funnel.purchaseRate}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{summary.funnel.purchases.toLocaleString()} عملية مكتملة.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <section>
          <RatingDistributionChart data={summary.ratingDistribution} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">أفضل 5 منتجات مبيعًا</h2>
            <Link href="/products?sort=popular" className="text-sm font-medium text-primary hover:underline">
              عرض المزيد
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-right text-muted-foreground">
                  <th className="px-3 py-3 font-medium">رقم</th>
                  <th className="px-3 py-3 font-medium">المنتج</th>
                  <th className="px-3 py-3 font-medium">الفئة</th>
                  <th className="px-3 py-3 text-center font-medium">مرات الشراء</th>
                  <th className="px-3 py-3 font-medium">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.product_id} className="border-b border-border/60">
                    <td className="px-3 py-3 font-mono text-muted-foreground">#{product.product_id}</td>
                    <td className="px-3 py-3 font-bold text-foreground">{product.name}</td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex rounded-full border px-3 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: `${product.category.color}15`,
                          color: product.category.color,
                          borderColor: `${product.category.color}33`,
                        }}
                      >
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold">{product.purchases}</td>
                    <td className="px-3 py-3 font-bold text-amber-500">{product.rating.toFixed(1)}★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-primary p-8 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-right">
          <div className="text-white">
            <h2 className="mb-2 text-2xl font-bold">جرّب الخوارزمية الجينية الآن</h2>
            <p className="text-blue-100">
              أدخل رقم مستخدم لمشاهدة منتجات جديدة مولدة من البيانات الفعلية.
            </p>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[360px]">
            <RecommendationUserForm
              maxUserId={summary.totalUsers}
              buttonLabel="تشغيل"
              placeholder="مثال: 42"
              compact
            />
          </div>
        </div>
      </section>
    </div>
  );
}
