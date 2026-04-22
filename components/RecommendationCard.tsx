import Link from 'next/link';
import { Eye, Sparkles, Star } from 'lucide-react';

import type { Product } from '@/lib/data';
import CategoryBadge from './CategoryBadge';
import FitnessBar from './FitnessBar';
import { Card, CardContent } from '@/components/ui/card';


interface RecommendationCardProps {
  item: {
    product: Product;
    behavior: {
      viewed: number;
      clicked: number;
      purchased: number;
      rating: number;
      fitness: number;
    };
    fitness: number;
  };
  isFirst?: boolean;
}

export default function RecommendationCard({ item, isFirst }: RecommendationCardProps) {
  const { product, behavior, fitness } = item;
  const isNewProduct = behavior.viewed === 0 && behavior.clicked === 0 && behavior.purchased === 0;

  return (
    <Card className={`relative overflow-hidden border border-border/70 transition-all duration-500 hover:shadow-xl ${isFirst ? 'ring-1 ring-primary/20' : ''}`}>
      {isFirst ? (
        <div className="absolute right-0 top-0 z-20 inline-flex items-center gap-1.5 rounded-bl-xl bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          الأنسب لك
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row">
        <div className="relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden border-b border-border/50 bg-muted/20 p-4 md:h-auto md:w-56 md:border-b-0 md:border-l">
          <div
            className="absolute inset-0 opacity-20 transition-opacity duration-500 hover:opacity-30"
            style={{ background: `radial-gradient(circle at center, ${product.category.color}, transparent 70%)` }}
          />
          <div
            className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black text-white shadow-lg"
            style={{
              backgroundColor: product.category.color,
              backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(0,0,0,0.1))',
            }}
          >
            {product.category.name.charAt(0)}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col bg-card p-6 md:p-8">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <CategoryBadge name={product.category.name} color={product.category.color} />
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-500">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {product.rating.toFixed(1)}
                  </span>
                </span>
                {isNewProduct ? (
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    جديد على المستخدم
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1 line-clamp-1 text-2xl font-bold text-foreground">{product.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                كود المنتج: <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/70">#{product.product_id}</span>
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2">
              <span className="text-3xl font-black text-primary">${product.price}</span>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-5 pt-6">
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <FitnessBar score={fitness} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p>المشاهدات</p>
                <p className="mt-1 font-bold text-foreground">{product.views}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p>النقرات</p>
                <p className="mt-1 font-bold text-foreground">{product.clicks}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p>المشتريات</p>
                <p className="mt-1 font-bold text-foreground">{product.purchases}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={`/products/${product.product_id}`}
                className={`inline-flex items-center rounded-xl px-8 py-3 text-sm font-semibold transition ${isFirst ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
              >
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </Link>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
