
import type { ActivityMetric } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: ActivityMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const progressValue = Math.min((metric.value / metric.goal) * 100, 100);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        <metric.icon className={cn("h-5 w-5", metric.color ? metric.color : "text-primary")} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" style={{color: metric.color ? metric.color : 'hsl(var(--foreground))'}}>
          {metric.value.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
        </div>
        <Progress value={progressValue} className="mt-2 h-2" indicatorClassName={metric.color ? `bg-[${metric.color}]` : ''} />
        <p className="text-xs text-muted-foreground mt-1">
          Goal: {metric.goal.toLocaleString()} {metric.unit}
        </p>
      </CardContent>
    </Card>
  );
}
