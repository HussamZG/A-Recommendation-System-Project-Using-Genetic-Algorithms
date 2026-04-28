import Link from 'next/link';
import { CheckCircle, Eye, MousePointerClick, Package, Star, Truck, Shield, User, EyeIcon, MousePointerClick as ClickIcon, ShoppingBag, Star as StarIcon } from 'lucide-react';

import ProductActionButtons from '@/components/ProductActionButtons';
import ProductCard from '@/components/ProductCard';
import ProductViewTracker from '@/components/ProductViewTracker';
import RecommendationReason from '@/components/RecommendationReason';
import {
  getCatalogSnapshot,
  getRelatedProductsFromProducts,
} from '@/lib/server/catalog';
import { getUserInteractions } from '@/lib/server/user-products';


interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { productId } = await params;
  const searchParamsData = await searchParams;
  const parsedProductId = Number(productId);
  const { products, productsById, summary } = await getCatalogSnapshot();

  const userIdParam = readSingleParam(searchParamsData.user).trim();
  const activeUserId = userIdParam ? Number(userIdParam) : null;
  const isValidUser = activeUserId && activeUserId >= 1 && activeUserId <= summary.totalUsers;

  // Fetch user interaction for this product if user is specified
  const userInteractions = isValidUser ? await getUserInteractions(activeUserId) : null;
  const userProductInteraction = userInteractions?.interactions.get(parsedProductId) ?? null;

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

      {/* User Context Banner */}
      {isValidUser && userProductInteraction ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">تفاعلك مع هذا المنتج كمستخدم #{activeUserId}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {userProductInteraction.viewed > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
                <EyeIcon className="h-4 w-4 text-amber-500" />
                <span className="text-sm">شاهدته {userProductInteraction.viewed} مرة</span>
              </div>
            )}
            {userProductInteraction.clicked > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
                <ClickIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm">نقر {userProductInteraction.clicked} مرة</span>
              </div>
            )}
            {userProductInteraction.purchased > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2">
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">اشتريته!</span>
              </div>
            )}
            {userProductInteraction.rating > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 px-3 py-2">
                <StarIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm">قيّمته {userProductInteraction.rating}/5</span>
              </div>
            )}
          </div>
        </div>
      ) : isValidUser && !userProductInteraction ? (
        <div className="mb-6 rounded-2xl border border-muted bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                أنت تتصفح كمستخدم #{activeUserId}. لم تتفاعل مع هذا المنتج بعد.
              </p>
            </div>
          </div>
        </div>
      ) : null}

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
            <p className="mb-6 text-muted-foreground">
              {product.name} من فئة {product.category.name} - منتج مميز بجودة عالية وتقييم {product.rating.toFixed(1)}/5 من {product.rating_count} عملاء.
            </p>

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

      <RecommendationReason
        productId={product.product_id}
        categoryName={product.category.name}
        categoryColor={product.category.color}
        price={product.price}
        rating={product.rating}
        views={product.views}
        clicks={product.clicks}
        purchases={product.purchases}
      />

      <section className="mb-12 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
          <Package className="h-5 w-5 text-primary" />
          مواصفات المنتج
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">رقم المنتج</p>
              <p className="text-xs text-muted-foreground">#{product.product_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">الشحن</p>
              <p className="text-xs text-muted-foreground">توصيل خلال 3-5 أيام</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">الضمان</p>
              <p className="text-xs text-muted-foreground">ضمان 14 يوم استبدال</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">التقييم</p>
              <p className="text-xs text-muted-foreground">{product.rating.toFixed(1)}/5 ({product.rating_count} تقييم)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
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
