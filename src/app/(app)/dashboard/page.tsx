
import { Footprints, Flame, Milestone, Activity as ActivityIcon } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import type { ActivityMetric } from '@/types';
import { DEFAULT_ACTIVITY_GOALS, PLACEHOLDER_USER } from '@/lib/constants';

const metrics: ActivityMetric[] = [
  {
    id: 'steps',
    label: `Steps (${PLACEHOLDER_USER.childName})`,
    value: 8230,
    goal: DEFAULT_ACTIVITY_GOALS.steps,
    unit: 'steps',
    icon: Footprints,
    color: 'hsl(var(--primary))',
  },
  {
    id: 'calories',
    label: `Calories Burned (${PLACEHOLDER_USER.childName})`,
    value: 350,
    goal: DEFAULT_ACTIVITY_GOALS.calories,
    unit: 'kcal',
    icon: Flame,
    color: 'hsl(var(--accent))',
  },
  {
    id: 'distance',
    label: `Distance Walked (${PLACEHOLDER_USER.childName})`,
    value: 6.5,
    goal: DEFAULT_ACTIVITY_GOALS.distance,
    unit: 'km',
    icon: Milestone,
    color: 'hsl(var(--secondary))',
  },
  {
    id: 'activeMinutes',
    label: `Active Minutes (${PLACEHOLDER_USER.childName})`,
    value: 45,
    goal: DEFAULT_ACTIVITY_GOALS.activeMinutes,
    unit: 'min',
    icon: ActivityIcon,
    color: 'hsl(var(--chart-4))',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {PLACEHOLDER_USER.name}! Here's an overview of {PLACEHOLDER_USER.childName}'s activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <ActivityChart />
      </div>
    </div>
  );
}
