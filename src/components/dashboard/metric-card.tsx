
import type { ActivityMetric } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: ActivityMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const progressValue = (typeof metric.value === 'number' && metric.goal) 
    ? Math.min((metric.value / metric.goal) * 100, 100) 
    : undefined;

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
          {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
        </div>
        {progressValue !== undefined && metric.goal && (
          <>
            <Progress value={progressValue} className="mt-2 h-2" indicatorClassName={metric.color ? `bg-[${metric.color}]` : ''} />
            <p className="text-xs text-muted-foreground mt-1">
              Goal: {metric.goal.toLocaleString()} {metric.unit}
            </p>
          </>
        )}
         {progressValue === undefined && !metric.goal && ( // If no goal, don't show progress bar or goal text
            <p className="text-xs text-muted-foreground mt-1 h-[calc(0.5rem+0.25rem+theme(fontSize.xs))]"> {/* Placeholder for height consistency */}
              {/* Can add specific text here if needed, e.g. "Daily average" */}
            </p>
        )}
      </CardContent>
    </Card>
  );
}
