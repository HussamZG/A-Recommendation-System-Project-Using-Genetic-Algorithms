import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Main product section */}
      <section className="mb-12 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Image placeholder area */}
          <div className="relative flex min-h-[380px] items-center justify-center bg-muted/30 p-12">
            <div className="flex h-52 w-52 animate-pulse items-center justify-center rounded-full bg-muted">
              <span className="text-7xl font-black text-muted-foreground/50">?</span>
            </div>
          </div>

          {/* Info area */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Title */}
            <Skeleton className="mb-2 h-10 w-3/4" />
            <Skeleton className="mb-6 h-4 w-full" />

            {/* Price and rating */}
            <div className="mb-8 flex items-end gap-4">
              <Skeleton className="h-14 w-32" />
              <Skeleton className="mb-2 h-7 w-20" />
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>

            {/* Action button */}
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Interaction stats section */}
      <section className="mb-12 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Related products section */}
      <section>
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="mb-4 h-40 w-full rounded-xl" />
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
