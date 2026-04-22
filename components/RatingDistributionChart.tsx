"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface RatingDistributionChartProps {
  data: Array<{
    score: number
    count: number
    percentage: number
  }>
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    stars: `${item.score}★`,
    percentage: item.percentage,
    score: item.score,
  }))

  // Sort by score descending (5 to 1)
  chartData.sort((a, b) => b.score - a.score)

  const chartConfig = {
    percentage: {
      label: "النسبة المئوية",
      color: "#10b981", // emerald-500
    },
  }

  // Colors for each bar based on rating
  const getBarColor = (score: number) => {
    const colors: Record<number, string> = {
      5: "#22c55e", // green-500
      4: "#84cc16", // lime-500
      3: "#eab308", // yellow-500
      2: "#f97316", // orange-500
      1: "#ef4444", // red-500
    }
    return colors[score] || "#6b7280"
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full p-4">
      <h3 className="mb-4 text-center text-lg font-bold text-foreground">توزيع التقييمات</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis
            dataKey="stars"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
          />
          <YAxis hide />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-around text-xs text-muted-foreground">
        {chartData.map((item) => (
          <span key={item.score} className="font-medium">
            {item.percentage}%
          </span>
        ))}
      </div>
    </ChartContainer>
  )
}
