import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden border border-border/70 bg-card">
      {/* Image placeholder */}
      <div className="relative flex h-56 w-full items-center justify-center overflow-hidden border-b border-border/50 bg-muted/30">
        <div className="flex h-28 w-28 animate-pulse items-center justify-center rounded-2xl bg-muted">
          <span className="text-5xl font-black text-muted-foreground/50">?</span>
        </div>
      </div>

      <CardHeader className="p-5 pb-3">
        {/* Badge and rating */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        {/* Product name */}
        <Skeleton className="mb-2 h-6 w-3/4" />
        {/* Product ID */}
        <Skeleton className="h-3 w-16" />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-end p-5 pt-0">
        {/* Price */}
        <Skeleton className="mb-4 h-8 w-24" />
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <Skeleton className="mb-1 h-3 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <Skeleton className="mb-1 h-3 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t bg-muted/20 p-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </CardFooter>
    </Card>
  );
}
