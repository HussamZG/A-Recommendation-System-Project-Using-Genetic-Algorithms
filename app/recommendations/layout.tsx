// تخطيط صفحات التوصيات: يمرر الأبناء كما هم بدون تغليف إضافي (Simple Pass-through Layout)
export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
