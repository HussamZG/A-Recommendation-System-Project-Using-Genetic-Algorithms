import Link from 'next/link';
import { CheckCircle, Eye, MousePointerClick, Star } from 'lucide-react';

import ProductActionButtons from '@/components/ProductActionButtons';
import ProductCard from '@/components/ProductCard';
import ProductViewTracker from '@/components/ProductViewTracker';
import {
  getCatalogSnapshot,
  getRelatedProductsFromProducts,
} from '@/lib/server/catalog';


interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;
  const parsedProductId = Number(productId);
  const { products, productsById } = await getCatalogSnapshot();

  const product = Number.isInteger(parsedProductId)
    ? (productsById.get(parsedProductId) ?? null)
    : null;

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="mb-3 text-2xl font-bold text-foreground">المنتج غير موجود</h1>
        <p className="mb-6 text-muted-foreground">تحقق من رقم المنتج أو عد إلى قائمة المنتجات.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          العودة إلى المنتجات
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProductsFromProducts(products, product.product_id, 4);
  const clickRate = product.views ? ((product.clicks / product.views) * 100).toFixed(1) : '0.0';
  const purchaseRate = product.views ? ((product.purchases / product.views) * 100).toFixed(1) : '0.0';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductViewTracker productId={product.product_id} />

      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">المنتجات</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <section className="mb-12 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-2">
          <div
            className="relative flex min-h-[380px] items-center justify-center p-12"
            style={{ backgroundColor: `${product.category.color}15` }}
          >
            <div
              className="flex h-52 w-52 items-center justify-center rounded-full text-7xl font-black text-white shadow-xl"
              style={{ backgroundColor: product.category.color }}
            >
              {product.category.name.charAt(0)}
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex rounded-full border px-3 py-1 text-sm font-bold"
                style={{
                  backgroundColor: `${product.category.color}15`,
                  color: product.category.color,
                  borderColor: `${product.category.color}33`,
                }}
              >
                {product.category.name}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-secondary-foreground">
                #{product.product_id}
              </span>
            </div>

            <h1 className="mb-2 text-3xl font-black text-foreground md:text-4xl">{product.name}</h1>
            <p className="mb-6 text-muted-foreground">عند توفر Supabase تُقرأ هذه المؤشرات من القاعدة مباشرة وتُحدّث مع التتبع الحي.</p>

            <div className="mb-8 flex items-end gap-4">
              <span className="text-5xl font-black text-primary">${product.price}</span>
              <div className="mb-2 inline-flex items-center gap-1 text-lg font-bold text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                {product.rating.toFixed(1)}
              </div>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">عدد التقييمات</p>
                <p className="mt-1 text-2xl font-black text-foreground">{product.rating_count}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">المشتريات المسجلة</p>
                <p className="mt-1 text-2xl font-black text-foreground">{product.purchases}</p>
              </div>
            </div>

            <ProductActionButtons productId={product.product_id} productName={product.name} />
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">مؤشرات التفاعل</h2>
            <p className="text-sm text-muted-foreground">هذه القيم تأتي من مصدر البيانات النشط حاليًا سواء كان Supabase أو fallback المحلي.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              المشاهدات
            </div>
            <p className="text-3xl font-black text-foreground">{product.views}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <MousePointerClick className="h-4 w-4" />
              النقرات
            </div>
            <p className="text-3xl font-black text-foreground">{product.clicks}</p>
            <p className="mt-2 text-xs text-muted-foreground">معدل النقر من المشاهدة: {clickRate}%</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              المشتريات
            </div>
            <p className="text-3xl font-black text-foreground">{product.purchases}</p>
            <p className="mt-2 text-xs text-muted-foreground">معدل الشراء من المشاهدة: {purchaseRate}%</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-foreground">منتجات مشابهة قد تهمك</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.product_id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
