'use client';

import { Sparkles, TrendingUp, Star, Users, Tag, DollarSign } from 'lucide-react';

interface RecommendationReasonProps {
  productId: number;
  categoryName: string;
  categoryColor: string;
  price: number;
  rating: number;
  views: number;
  clicks: number;
  purchases: number;
}

export default function RecommendationReason({
  categoryName,
  categoryColor,
  price,
  rating,
  views,
  clicks,
  purchases,
}: RecommendationReasonProps) {
  const clickRate = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0';
  const purchaseRate = views > 0 ? ((purchases / views) * 100).toFixed(1) : '0';

  // Calculate popularity score
  const getPopularityLevel = () => {
    if (purchases > 20) return { label: 'الأكثر مبيعاً', icon: TrendingUp, color: 'text-emerald-500' };
    if (purchases > 10) return { label: 'مبيعات جيدة', icon: TrendingUp, color: 'text-blue-500' };
    if (clicks > 50) return { label: 'الأكثر مشاهدة', icon: Users, color: 'text-amber-500' };
    return { label: 'جديد', icon: Sparkles, color: 'text-purple-500' };
  };

  // Calculate rating level
  const getRatingLevel = () => {
    if (rating >= 4.5) return { label: 'ممتاز', color: 'text-emerald-500' };
    if (rating >= 4.0) return { label: 'جيد جداً', color: 'text-blue-500' };
    if (rating >= 3.5) return { label: 'جيد', color: 'text-amber-500' };
    return { label: 'مقبول', color: 'text-gray-500' };
  };

  const popularity = getPopularityLevel();
  const ratingLevel = getRatingLevel();
  const PopularityIcon = popularity.icon;

  const reasons = [
    {
      icon: Tag,
      title: 'الفئة',
      description: `منتج من فئة ${categoryName}`,
      color: categoryColor,
    },
    {
      icon: DollarSign,
      title: 'السعر',
      description: `السعر $${price} - مناسب للفئة`,
      color: '#3b82f6',
    },
    {
      icon: Star,
      title: 'التقييم',
      description: `تقييم ${rating.toFixed(1)}/5 - ${ratingLevel.label}`,
      color: '#f59e0b',
    },
    {
      icon: Users,
      title: 'الشعبية',
      description: `${views} مشاهدة، ${clickRate}% نقر، ${purchaseRate}% شراء`,
      color: '#8b5cf6',
    },
    {
      icon: PopularityIcon,
      title: 'الأداء',
      description: popularity.label,
      color: popularity.color.replace('text-', '').replace('emerald', '#10b981').replace('blue', '#3b82f6').replace('amber', '#f59e0b').replace('purple', '#8b5cf6'),
    },
  ];

  return (
    <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card to-muted/30 p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">لماذا هذا المنتج؟</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${reason.color}15` }}
            >
              <reason.icon className="h-5 w-5" style={{ color: reason.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{reason.title}</p>
              <p className="text-xs text-muted-foreground">{reason.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border/50 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">الخلاصة:</span>{' '}
          هذا المنتج يجمع بين {ratingLevel.label} التقييم والشعبية بين المستخدمين. 
          نسبة الشراء {purchaseRate}% تدل على رضا العملاء.
        </p>
      </div>
    </section>
  );
}
