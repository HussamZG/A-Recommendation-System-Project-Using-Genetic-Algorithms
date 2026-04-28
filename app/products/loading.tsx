import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            {/* Search skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-11 w-full bg-muted rounded-xl" />
            </div>
            
            {/* Categories skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price slider skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-11 w-full bg-muted rounded-xl" />
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex gap-3">
              <div className="h-11 flex-1 bg-muted rounded-xl" />
              <div className="h-11 flex-1 bg-muted rounded-xl" />
            </div>
          </div>
        </aside>

        {/* Main content skeleton */}
        <section className="flex-1">
          {/* Header skeleton */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-1 h-8 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          </div>

          {/* Products grid skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-10 bg-muted rounded-lg" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
