
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { WeeklyActivityRecord } from "@/types";

const placeholderData: WeeklyActivityRecord[] = [
  { day: "Mon", steps: 8230, calories: 350 },
  { day: "Tue", steps: 11050, calories: 420 },
  { day: "Wed", steps: 7500, calories: 300 },
  { day: "Thu", steps: 9800, calories: 390 },
  { day: "Fri", steps: 12100, calories: 480 },
  { day: "Sat", steps: 15300, calories: 600 },
  { day: "Sun", steps: 6700, calories: 280 },
];

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--primary))",
  },
  calories: {
    label: "Calories",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function ActivityChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Your steps and calories burned over the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={placeholderData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="hsl(var(--primary))"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--accent))"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
              />
              <RechartsTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="steps" fill="var(--color-steps)" radius={4} />
              <Bar yAxisId="right" dataKey="calories" fill="var(--color-calories)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
