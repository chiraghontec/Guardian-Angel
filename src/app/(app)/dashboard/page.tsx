
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Footprints, Flame, Milestone, Activity as ActivityIcon } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import type { ActivityMetric, CsvActivityRecord, WeeklyActivityRecord } from '@/types';
import { DEFAULT_ACTIVITY_GOALS } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { parseActivityCsv } from '@/lib/csv-utils';
import { format, subDays, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_CSV_KEY = 'guardianAngelCsvActivityData';

export default function DashboardPage() {
  const { currentUser, childNameContext } = useAuth();
  const [currentChildName, setCurrentChildName] = useState("your child");
  
  const [dashboardMetrics, setDashboardMetrics] = useState<ActivityMetric[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<WeeklyActivityRecord[]>([]);
  const [isLoadingCsvData, setIsLoadingCsvData] = useState(true);
  const [lastCsvUpdate, setLastCsvUpdate] = useState<string | null>(null);

  useEffect(() => {
    setCurrentChildName(childNameContext || "your child");
  }, [childNameContext]);

  const getDefaultMetrics = useCallback((child: string): ActivityMetric[] => [
    {
      id: 'steps',
      label: `Steps (${child})`,
      value: 0,
      goal: DEFAULT_ACTIVITY_GOALS.steps,
      unit: 'steps',
      icon: Footprints,
      color: 'hsl(var(--primary))',
    },
    {
      id: 'calories',
      label: `Calories Burned (${child})`,
      value: 0,
      goal: DEFAULT_ACTIVITY_GOALS.calories,
      unit: 'kcal',
      icon: Flame,
      color: 'hsl(var(--accent))',
    },
    {
      id: 'distance',
      label: `Distance Walked (${child})`,
      value: 0,
      goal: DEFAULT_ACTIVITY_GOALS.distance,
      unit: 'km',
      icon: Milestone,
      color: 'hsl(var(--secondary))',
    },
    {
      id: 'activeMinutes',
      label: `Active Minutes (${child})`,
      value: 0,
      goal: DEFAULT_ACTIVITY_GOALS.activeMinutes,
      unit: 'min',
      icon: ActivityIcon,
      color: 'hsl(var(--chart-4))',
    },
  ], []);

  const processAndSetData = useCallback((csvText: string | null) => {
    if (csvText) {
      const parsedData = parseActivityCsv(csvText);
      if (parsedData.length > 0) {
        // Data for Metric Cards (latest entry)
        const latestRecord = parsedData[0]; // Assumes parseActivityCsv sorts by date descending

        setDashboardMetrics([
          {
            id: 'steps', label: `Steps (${currentChildName})`, 
            value: latestRecord.Steps ?? 0, goal: DEFAULT_ACTIVITY_GOALS.steps, unit: 'steps', icon: Footprints, color: 'hsl(var(--primary))'
          },
          { 
            id: 'calories', label: `Calories Burned (${currentChildName})`, 
            value: latestRecord.Calories ?? 0, goal: DEFAULT_ACTIVITY_GOALS.calories, unit: 'kcal', icon: Flame, color: 'hsl(var(--accent))'
          },
          { 
            id: 'distance', label: `Distance Walked (${currentChildName})`, 
            value: latestRecord.Distance ?? 0, goal: DEFAULT_ACTIVITY_GOALS.distance, unit: 'km', icon: Milestone, color: 'hsl(var(--secondary))'
          },
          { 
            id: 'activeMinutes', label: `Active Minutes (${currentChildName})`, 
            value: latestRecord.ActiveMinutes ?? 0, goal: DEFAULT_ACTIVITY_GOALS.activeMinutes, unit: 'min', icon: ActivityIcon, color: 'hsl(var(--chart-4))'
          },
        ]);
        setLastCsvUpdate(`Latest CSV data from: ${latestRecord.Date}`);

        // Data for Weekly Chart (last 7 days)
        const today = new Date();
        const sevenDaysAgo = subDays(today, 6); // includes today
        const weeklyDataMap = new Map<string, WeeklyActivityRecord>();

        for (let i = 0; i < 7; i++) {
          const day = subDays(today, i);
          const formattedDay = format(day, 'yyyy-MM-dd');
          const dayShortName = format(day, 'E'); // Mon, Tue, etc.
          weeklyDataMap.set(formattedDay, { day: dayShortName, steps: 0, calories: 0, distance: 0, activeMinutes: 0 });
        }
        
        parsedData.forEach(record => {
          try {
            const recordDate = parseISO(record.Date); // parse YYYY-MM-DD string
             if (recordDate >= sevenDaysAgo && recordDate <= today) {
                const formattedDay = format(recordDate, 'yyyy-MM-dd');
                const existing = weeklyDataMap.get(formattedDay);
                if (existing) {
                    existing.steps = (existing.steps || 0) + (record.Steps || 0);
                    existing.calories = (existing.calories || 0) + (record.Calories || 0);
                    existing.distance = (existing.distance || 0) + (record.Distance || 0);
                    existing.activeMinutes = (existing.activeMinutes || 0) + (record.ActiveMinutes || 0);
                }
            }
          } catch(e) {
            console.error("Error parsing date from CSV record:", record.Date, e);
          }
        });
        
        const chartData = Array.from(weeklyDataMap.values()).sort((a,b) => 
            new Date(Object.keys(weeklyDataMap).find(key => weeklyDataMap.get(key) === a)!).getTime() - 
            new Date(Object.keys(weeklyDataMap).find(key => weeklyDataMap.get(key) === b)!).getTime()
        );
        setWeeklyChartData(chartData);
        
      } else {
        // CSV was empty or unparseable
        setDashboardMetrics(getDefaultMetrics(currentChildName));
        setWeeklyChartData(generatePlaceholderWeeklyData());
        setLastCsvUpdate("No valid data in uploaded CSV.");
      }
    } else {
      // No CSV data in localStorage
      setDashboardMetrics(getDefaultMetrics(currentChildName));
      setWeeklyChartData(generatePlaceholderWeeklyData());
      setLastCsvUpdate(null);
    }
    setIsLoadingCsvData(false);
  }, [currentChildName, getDefaultMetrics]);

  // Effect for loading data from localStorage and setting up interval
  useEffect(() => {
    const loadAndProcessData = () => {
      setIsLoadingCsvData(true);
      const csvText = localStorage.getItem(LOCAL_STORAGE_CSV_KEY);
      processAndSetData(csvText);
    };

    loadAndProcessData(); // Initial load

    const intervalId = setInterval(loadAndProcessData, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [processAndSetData]);
  
  // Update metrics if childName changes
  useEffect(() => {
    if (!localStorage.getItem(LOCAL_STORAGE_CSV_KEY)) { // Only if no CSV data, reset to default with new name
       setDashboardMetrics(getDefaultMetrics(currentChildName));
    } else {
       // If CSV data exists, re-process it to update labels with the new child name
       const csvText = localStorage.getItem(LOCAL_STORAGE_CSV_KEY);
       processAndSetData(csvText); // This will use the new currentChildName in labels
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChildName, getDefaultMetrics]);


  const generatePlaceholderWeeklyData = (): WeeklyActivityRecord[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(day => ({
      day,
      steps: Math.floor(Math.random() * 5000) + 5000, // Random steps between 5000-10000
      calories: Math.floor(Math.random() * 200) + 200, // Random calories 200-400
    }));
  };

  if (isLoadingCsvData && dashboardMetrics.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-1/3 mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2 mb-1" /><Skeleton className="h-6 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
            Welcome back, {currentUser?.displayName || currentUser?.email || 'Parent'}! 
            Here's an overview of {currentChildName}'s activity.
            </p>
            {lastCsvUpdate && (
                <p className="text-xs text-muted-foreground">Data Source: {lastCsvUpdate}</p>
            )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <ActivityChart childName={currentChildName} data={weeklyChartData} />
      </div>
    </div>
  );
}
