export default function FitnessBar({ score }: { score: number }) {
  const maxScore = 23;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  let barColor = '#ef4444';
  let textColor = 'text-red-500';

  if (percentage > 70) {
    barColor = '#10b981';
    textColor = 'text-emerald-500';
  } else if (percentage > 40) {
    barColor = '#f59e0b';
    textColor = 'text-amber-500';
  } else if (percentage > 10) {
    barColor = '#f97316';
    textColor = 'text-orange-500';
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs">
        <span
          className="cursor-help font-medium text-muted-foreground underline decoration-dotted"
          title="تحسب درجة اللياقة من تفاعل المستخدم مع المنتج، مع حد أقصى يساوي 23 نقطة."
        >
          درجة اللياقة
        </span>
        <span className={`font-bold ${textColor}`}>{score} / {maxScore}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div
          className="h-2 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
