import { Dna } from 'lucide-react';


export default function LoadingRecommendationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
        <div className="h-1 w-full bg-muted">
          <div className="h-full w-2/3 animate-pulse bg-primary" />
        </div>
        <div className="p-12 text-center">
          <Dna className="mx-auto mb-6 h-20 w-20 animate-pulse text-primary" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">الخوارزمية الجينية تعمل الآن...</h2>
          <p className="mb-8 text-muted-foreground">
            يجري تحليل سجل السلوك والتقييمات وتوليد مجموعة منتجات جديدة للمستخدم.
          </p>

          <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-secondary p-6">
            <div className="mb-4 flex justify-between text-sm font-bold">
              <span className="text-primary">تحميل التوصيات</span>
              <span className="text-muted-foreground">45 جيل</span>
            </div>
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-primary/10" />
              <div className="h-24 animate-pulse rounded-xl bg-primary/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
