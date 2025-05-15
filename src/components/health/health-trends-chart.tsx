
"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { HealthDataPoint } from "@/types";

interface HealthTrendsChartProps {
  data: HealthDataPoint[];
  title: string;
  description: string;
  dataKey: string;
  color: string; // e.g., "hsl(var(--destructive))"
  unit: string;
}

export function HealthTrendsChart({ data, title, description, dataKey, color, unit }: HealthTrendsChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: -20, // Adjust to make Y-axis labels visible
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // tickFormatter={(value) => value.slice(0,3)} // Assuming time is like "Mon", "Tue" or HH:mm
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={4}
                domain={['dataMin - 5', 'dataMax + 5']} // Add some padding to Y-axis
                tickFormatter={(value) => `${value}${unit}`}
              />
              <RechartsTooltip 
                cursor={false}
                content={<ChartTooltipContent indicator="line" nameKey={dataKey} />}
              />
              <Line
                dataKey={dataKey}
                type="monotone"
                stroke={`var(--color-${dataKey})`}
                strokeWidth={2}
                dot={{
                  fill: `var(--color-${dataKey})`,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
