import { getCatalogSnapshot } from '@/lib/server/catalog';

export default async function TestDataPage() {
  const { products, source, summary } = await getCatalogSnapshot();
  
  // Get first 5 products to check
  const sampleProducts = products.slice(0, 5);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">اختبار البيانات</h1>
      <p className="mb-4">مصدر البيانات: <strong>{source}</strong></p>
      <p className="mb-4">عدد المنتجات: {products.length}</p>
      
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">الاسم</th>
            <th className="border p-2">المشاهدات</th>
            <th className="border p-2">النقرات</th>
            <th className="border p-2">المشتريات</th>
            <th className="border p-2">التقييم</th>
          </tr>
        </thead>
        <tbody>
          {sampleProducts.map((product) => (
            <tr key={product.product_id}>
              <td className="border p-2">{product.product_id}</td>
              <td className="border p-2">{product.name}</td>
              <td className="border p-2">{product.views}</td>
              <td className="border p-2">{product.clicks}</td>
              <td className="border p-2">{product.purchases}</td>
              <td className="border p-2">{product.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2 className="text-xl font-bold mt-8 mb-4">الملخص</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(summary, null, 2)}
      </pre>
    </div>
  );
}
