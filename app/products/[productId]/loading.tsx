import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';

// حالة التحميل لصفحة تفاصيل المنتج: تعرض هيكل عظمي بديل أثناء جلب بيانات المنتج
export default function ProductDetailLoading() {
  return <ProductDetailSkeleton />;
}
