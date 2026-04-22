import Link from 'next/link';
import { ArrowUpDown, Filter, Search } from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import { PriceSlider } from "@/components/PriceSlider";
import {
  CATEGORIES,
  paginateProducts,
  type ProductSort,
} from '@/lib/data';
import { filterProductsList, getCatalogSnapshot } from '@/lib/server/catalog';


interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function readArrayParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function clampNumber(value: string, fallback: number, min: number, max: number) {
  // Handle empty string or whitespace-only strings
  if (!value || value.trim() === '') {
    return fallback;
  }
  
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(Math.max(parsedValue, min), max);
}

function buildProductsHref(
  current: {
    q: string;
    categories: string[];
    minPrice: number;
    maxPrice: number;
    minRating: number;
    sort: ProductSort;
    minAllowedPrice: number;
    maxAllowedPrice: number;
  },
  page: number,
) {
  const params = new URLSearchParams();

  if (current.q) {
    params.set('q', current.q);
  }

  for (const category of current.categories) {
    params.append('category', category);
  }

  // Only add minPrice if it's different from the default (minAllowedPrice)
  if (current.minPrice > current.minAllowedPrice) {
    params.set('minPrice', String(current.minPrice));
  }

  // Only add maxPrice if it's different from the default (maxAllowedPrice)
  if (current.maxPrice < current.maxAllowedPrice) {
    params.set('maxPrice', String(current.maxPrice));
  }

  if (current.minRating) {
    params.set('minRating', String(current.minRating));
  }

  if (current.sort !== 'default') {
    params.set('sort', current.sort);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : '/products';
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { products, summary } = await getCatalogSnapshot();
  const maxAllowedPrice = Math.ceil(summary.pricing.max);
  const minAllowedPrice = Math.floor(summary.pricing.min);

  const q = readSingleParam(params.q).trim();
  const categories = readArrayParam(params.category).filter((categoryId) =>
    CATEGORIES.some((category) => category.id === categoryId),
  );
  const minPrice = clampNumber(
    readSingleParam(params.minPrice),
    minAllowedPrice,
    minAllowedPrice,
    maxAllowedPrice,
  );
  const maxPrice = clampNumber(
    readSingleParam(params.maxPrice),
    maxAllowedPrice,
    minAllowedPrice,
    maxAllowedPrice,
  );
  const minRating = clampNumber(readSingleParam(params.minRating), 0, 0, 5);
  const sort = (readSingleParam(params.sort) || 'default') as ProductSort;
  const page = clampNumber(readSingleParam(params.page), 1, 1, 10_000);

  const filteredProducts = filterProductsList(products, {
    query: q,
    categories,
    minPrice,
    maxPrice,
    minRating,
    sortBy: sort,
  });

  const pagination = paginateProducts(filteredProducts, page, 12);
  const currentFilters = {
    q,
    categories,
    minPrice,
    maxPrice,
    minRating,
    sort,
    minAllowedPrice,
    maxAllowedPrice,
  };

  const pageWindow = Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
    .filter((pageNumber) =>
      pageNumber === 1 ||
      pageNumber === pagination.totalPages ||
      Math.abs(pageNumber - pagination.currentPage) <= 1,
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-72">
          <form action="/products" className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Filter className="h-5 w-5" />
              الفلاتر
            </div>

            <div>
              <label htmlFor="products-search" className="mb-2 block text-sm font-semibold text-foreground">
                البحث
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="products-search"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="اسم المنتج أو رقمه أو الفئة"
                  className="h-11 w-full rounded-xl border border-input bg-background pr-10 pl-4 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">الفئة</p>
              <div className="space-y-3">
                {CATEGORIES.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="category"
                      value={category.id}
                      defaultChecked={categories.includes(category.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <PriceSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              maxAllowedPrice={maxAllowedPrice}
              minAllowedPrice={minAllowedPrice}
            />

            <div>
              <label htmlFor="min-rating" className="mb-2 block text-sm font-semibold text-foreground">
                التقييم الأدنى
              </label>
              <select
                id="min-rating"
                name="minRating"
                defaultValue={String(minRating)}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary"
              >
                <option value="0">الكل</option>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم فأعلى</option>
                <option value="3">3 نجوم فأعلى</option>
                <option value="2">2 نجوم فأعلى</option>
                <option value="1">1 نجمة فأعلى</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="mb-2 block text-sm font-semibold text-foreground">
                الترتيب
              </label>
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  className="h-11 w-full rounded-xl border border-input bg-background pr-10 pl-4 text-sm text-foreground outline-none transition focus:border-primary"
                >
                  <option value="default">الترتيب الافتراضي</option>
                  <option value="popular">الأكثر شعبية</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                  <option value="rating-desc">التقييم: الأعلى أولًا</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                تطبيق
              </button>
              <Link
                href="/products"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                إعادة ضبط
              </Link>
            </div>
          </form>
        </aside>

        <section className="flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">جميع المنتجات</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                عرض {pagination.data.length} من أصل {pagination.total} نتيجة
              </p>
            </div>

            {(q || categories.length > 0 || minRating > 0 || maxPrice < maxAllowedPrice || sort !== 'default') ? (
              <div className="flex flex-wrap gap-2">
                {q ? (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    بحث: {q}
                  </span>
                ) : null}
                {categories.map((categoryId) => {
                  const category = CATEGORIES.find((item) => item.id === categoryId);
                  return category ? (
                    <span key={category.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {category.name}
                    </span>
                  ) : null;
                })}
                {minRating > 0 ? (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {minRating}+ نجوم
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {pagination.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pagination.data.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <div className="mb-3 text-4xl">🔍</div>
              <h2 className="mb-1 text-xl font-bold text-foreground">لا توجد نتائج مطابقة</h2>
              <p className="text-muted-foreground">
                جرّب تقليل القيود أو إزالة بعض الفلاتر للوصول إلى المزيد من المنتجات.
              </p>
            </div>
          )}

          {pagination.totalPages > 1 ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {pagination.currentPage > 1 ? (
                <Link
                  href={buildProductsHref(currentFilters, pagination.currentPage - 1)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  السابق
                </Link>
              ) : null}

              {pageWindow.map((pageNumber, index) => {
                const previousPage = pageWindow[index - 1];
                const showGap = previousPage && pageNumber - previousPage > 1;

                return (
                  <div key={pageNumber} className="flex items-center gap-2">
                    {showGap ? (
                      <span className="px-2 text-sm text-muted-foreground">…</span>
                    ) : null}
                    <Link
                      href={buildProductsHref(currentFilters, pageNumber)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                        pageNumber === pagination.currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  </div>
                );
              })}

              {pagination.currentPage < pagination.totalPages ? (
                <Link
                  href={buildProductsHref(currentFilters, pagination.currentPage + 1)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  التالي
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
