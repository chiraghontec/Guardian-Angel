
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { WeeklyActivityRecord } from "@/types";

const defaultPlaceholderData: WeeklyActivityRecord[] = [
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
  // Optional: if you decide to include these in the chart from CSV
  distance: {
    label: "Distance (km)",
    color: "hsl(var(--secondary))",
  },
  activeMinutes: {
    label: "Active Mins",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig;

interface ActivityChartProps {
  childName?: string;
  data?: WeeklyActivityRecord[]; // Allow passing data
}

export function ActivityChart({ childName, data }: ActivityChartProps) {
  const chartData = data && data.length > 0 ? data : defaultPlaceholderData;
  const descriptionText = childName 
    ? `${childName}'s steps and calories burned over the last week.`
    : "Steps and calories burned over the last week.";
  
  // Determine which data keys are present in the actual data to display them in the chart
  const availableDataKeys = new Set<string>();
  if (chartData.some(d => d.steps !== undefined && d.steps !== null)) availableDataKeys.add('steps');
  if (chartData.some(d => d.calories !== undefined && d.calories !== null)) availableDataKeys.add('calories');
  // Add more if you plan to chart distance or activeMinutes from CSV
  // if (chartData.some(d => d.distance !== undefined && d.distance !== null)) availableDataKeys.add('distance');
  // if (chartData.some(d => d.activeMinutes !== undefined && d.activeMinutes !== null)) availableDataKeys.add('activeMinutes');


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>{descriptionText}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : ''}
              />
              
              {availableDataKeys.has('steps') && (
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="hsl(var(--primary))"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  domain={[0, 'dataMax + 1000']}
                />
              )}
              {availableDataKeys.has('calories') && (
                 <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--accent))"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  domain={[0, 'dataMax + 100']}
                />
              )}
             
              <RechartsTooltip content={<ChartTooltipContent />} />
              <Legend />
              
              {availableDataKeys.has('steps') && (
                <Bar yAxisId="left" dataKey="steps" fill="var(--color-steps)" radius={4} name="Steps" />
              )}
              {availableDataKeys.has('calories') && (
                <Bar yAxisId="right" dataKey="calories" fill="var(--color-calories)" radius={4} name="Calories" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
