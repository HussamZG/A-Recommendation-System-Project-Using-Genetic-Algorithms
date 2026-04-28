import Link from 'next/link';
import { ExternalLink, ShoppingBag, Star } from 'lucide-react';

import type { Product } from '@/lib/data';
import CategoryBadge from './CategoryBadge';
import { UserInteractionBadges } from './UserSelector';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
  interaction?: {
    viewed: number;
    clicked: number;
    purchased: number;
    rating: number;
    fitness?: number;
  } | null;
  showFitness?: boolean;
}

export default function ProductCard({ product, interaction = null, showFitness = false }: ProductCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/products/${product.product_id}`}
        className="relative flex h-56 w-full items-center justify-center overflow-hidden border-b border-border/50 bg-muted/30"
      >
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: `radial-gradient(circle at center, ${product.category.color}, transparent 70%)` }}
        />
        {interaction && (
          <UserInteractionBadges
            viewed={interaction.viewed}
            clicked={interaction.clicked}
            purchased={interaction.purchased}
            rating={interaction.rating}
          />
        )}
        <div
          className="flex h-28 w-28 items-center justify-center rounded-2xl text-5xl font-black text-white shadow-lg transition-transform duration-500 group-hover:rotate-0"
          style={{
            backgroundColor: product.category.color,
            backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(0,0,0,0.1))',
            transform: 'rotate(3deg)',
          }}
        >
          {product.category.name.charAt(0)}
        </div>
      </Link>

      <CardHeader className="p-5 pb-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <CategoryBadge name={product.category.name} color={product.category.color} />
          <div className="rounded-md bg-amber-500/10 px-2 py-0.5 text-sm font-bold text-amber-500">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <Link href={`/products/${product.product_id}`} className="line-clamp-1 text-lg font-bold text-foreground transition-colors hover:text-primary">
          {product.name}
        </Link>
        <p className="text-xs font-mono text-muted-foreground">#{product.product_id}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-end p-5 pt-0">
        <div className="mb-4 flex items-baseline gap-1">
          <span className="text-2xl font-black text-primary">${product.price}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <p>التقييمات</p>
            <p className="mt-1 font-bold text-foreground">{product.rating_count}</p>
          </div>
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <p>المشتريات</p>
            <p className="mt-1 font-bold text-foreground">{product.purchases}</p>
          </div>
        </div>
        {showFitness && interaction?.fitness !== undefined && (
          <div className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">درجة الملاءمة</p>
            <p className="mt-1 text-sm font-bold text-primary">{interaction.fitness} / 23</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t bg-muted/20 p-5">
        <span className="inline-flex items-center text-xs font-medium text-muted-foreground">
          <ShoppingBag className="ml-1 h-3.5 w-3.5" />
          {product.views} مشاهدة
        </span>
        <Link
          href={`/products/${product.product_id}`}
          className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <ExternalLink className="ml-2 h-4 w-4" />
          التفاصيل
        </Link>
      </CardFooter>
    </Card>
  );
}
