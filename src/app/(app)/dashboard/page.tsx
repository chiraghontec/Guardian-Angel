
"use client";

import { Footprints, Flame, Milestone, Activity as ActivityIcon } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import type { ActivityMetric } from '@/types';
import { DEFAULT_ACTIVITY_GOALS } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context'; // Use auth context

export default function DashboardPage() {
  const { currentUser, childNameContext } = useAuth(); // Get user and childName from context

  // Use childName from context if available, otherwise fallback, or handle if not set
  const currentChildName = childNameContext || "your child"; // Fallback if childNameContext is null

  const metrics: ActivityMetric[] = [
    {
      id: 'steps',
      label: `Steps (${currentChildName})`,
      value: 8230, // These values would ideally come from a data source
      goal: DEFAULT_ACTIVITY_GOALS.steps,
      unit: 'steps',
      icon: Footprints,
      color: 'hsl(var(--primary))',
    },
    {
      id: 'calories',
      label: `Calories Burned (${currentChildName})`,
      value: 350,
      goal: DEFAULT_ACTIVITY_GOALS.calories,
      unit: 'kcal',
      icon: Flame,
      color: 'hsl(var(--accent))',
    },
    {
      id: 'distance',
      label: `Distance Walked (${currentChildName})`,
      value: 6.5,
      goal: DEFAULT_ACTIVITY_GOALS.distance,
      unit: 'km',
      icon: Milestone,
      color: 'hsl(var(--secondary))',
    },
    {
      id: 'activeMinutes',
      label: `Active Minutes (${currentChildName})`,
      value: 45,
      goal: DEFAULT_ACTIVITY_GOALS.activeMinutes,
      unit: 'min',
      icon: ActivityIcon,
      color: 'hsl(var(--chart-4))',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.displayName || currentUser?.email || 'Parent'}! 
          Here's an overview of {currentChildName}'s activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <ActivityChart childName={currentChildName} />
      </div>
    </div>
  );
}
