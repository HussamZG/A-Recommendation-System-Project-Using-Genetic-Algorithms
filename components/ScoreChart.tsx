'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export default function ScoreChart({ scoreHistory }: { scoreHistory: number[] }) {
  const data = scoreHistory.map((score, index) => ({
    generation: `جيل ${index + 1}`,
    value: score,
  }));

  const chartMax = Math.max(10, ...scoreHistory) + 2;
  const chartMin = Math.max(0, Math.min(...scoreHistory) - 5);

  const chartConfig = {
    value: {
      label: "أفضل درجة",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="generation" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} hide />
          <YAxis domain={[chartMin, chartMax]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} hide />
          <Bar dataKey="value" name="أفضل درجة" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            wrapperStyle={{ zIndex: 9999 }}
            useTranslate3d={false}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid hsl(var(--border))', 
              background: 'hsl(var(--background))', 
              color: 'hsl(var(--foreground))', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              direction: 'rtl'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
