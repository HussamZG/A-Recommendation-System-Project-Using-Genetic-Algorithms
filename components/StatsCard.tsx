import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  tooltipText?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  tooltipText,
}: StatsCardProps) {
  return (
    <Card
      className="transition-transform duration-300 hover:-translate-y-1"
      title={tooltipText}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        {trend ? (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${trendUp ? 'bg-emerald-500 text-white' : 'bg-destructive/10 text-destructive'}`}
          >
            {trend}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-1 text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <p className="text-3xl font-black text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
