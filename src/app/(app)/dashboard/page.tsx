
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Footprints, Flame, Milestone, Activity as ActivityIcon, TrendingUp, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import type { ActivityMetric, WeeklyActivityRecord, FitbitDeviceData, AppAlert } from '@/types';
import { DEFAULT_ACTIVITY_GOALS } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { format, subDays, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';


export default function DashboardPage() {
  const { currentUser, childNameContext } = useAuth();
  const [currentChildName, setCurrentChildName] = useState("your child");
  
  const [dashboardMetrics, setDashboardMetrics] = useState<ActivityMetric[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<WeeklyActivityRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [lastFitbitUpdate, setLastFitbitUpdate] = useState<string | null>(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [fitbitData, setFitbitData] = useState<FitbitDeviceData | null>(null); // Store fetched fitbit data

  useEffect(() => {
    setCurrentChildName(childNameContext || "your child");
  }, [childNameContext]);

  const getDefaultMetrics = useCallback((child: string): ActivityMetric[] => [
    { id: 'steps', label: `Steps (${child})`, value: 0, goal: DEFAULT_ACTIVITY_GOALS.steps, unit: 'steps', icon: Footprints, color: 'hsl(var(--primary))' },
    { id: 'calories', label: `Calories Burned (${child})`, value: 0, goal: DEFAULT_ACTIVITY_GOALS.calories, unit: 'kcal', icon: Flame, color: 'hsl(var(--accent))' },
    { id: 'distance', label: `Distance Walked (${child})`, value: 0, goal: DEFAULT_ACTIVITY_GOALS.distance, unit: 'km', icon: Milestone, color: 'hsl(var(--secondary))' },
    { id: 'activeMinutes', label: `Active Minutes (${child})`, value: 0, goal: DEFAULT_ACTIVITY_GOALS.activeMinutes, unit: 'min', icon: ActivityIcon, color: 'hsl(var(--chart-4))' },
    { id: 'restingHeartRate', label: `Resting HR (${child})`, value: '--', unit: 'BPM', icon: TrendingUp, color: 'hsl(var(--chart-2))' },
  ], []);

  const processAndSetFitbitData = useCallback((data: FitbitDeviceData | null) => {
    if (data) {
      setFitbitData(data); // Store fetched data
      setDashboardMetrics([
        { id: 'steps', label: `Steps (${currentChildName})`, value: data.dailySteps, goal: DEFAULT_ACTIVITY_GOALS.steps, unit: 'steps', icon: Footprints, color: 'hsl(var(--primary))' },
        { id: 'calories', label: `Calories Burned (${currentChildName})`, value: Math.floor(data.dailySteps * 0.045), goal: DEFAULT_ACTIVITY_GOALS.calories, unit: 'kcal', icon: Flame, color: 'hsl(var(--accent))' },
        { id: 'distance', label: `Distance Walked (${currentChildName})`, value: parseFloat((data.dailySteps * 0.000762).toFixed(1)), goal: DEFAULT_ACTIVITY_GOALS.distance, unit: 'km', icon: Milestone, color: 'hsl(var(--secondary))' },
        { id: 'activeMinutes', label: `Active Minutes (${currentChildName})`, value: Math.floor(data.dailySteps / 100), goal: DEFAULT_ACTIVITY_GOALS.activeMinutes, unit: 'min', icon: ActivityIcon, color: 'hsl(var(--chart-4))' },
        { id: 'restingHeartRate', label: `Resting HR (${currentChildName})`, value: data.restingHeartRate ? `${data.restingHeartRate}` : '--', unit: 'BPM', icon: TrendingUp, color: 'hsl(var(--chart-2))' },
      ]);
      setLastFitbitUpdate(`Fitbit data from: ${format(new Date(data.lastUpdated), 'MMM d, h:mm a')}`);

      // Placeholder for weekly chart data
      const placeholderWeekly: WeeklyActivityRecord[] = Array.from({length: 7}).map((_, i) => {
        const day = subDays(new Date(), 6 - i);
        return {
          day: format(day, 'E'),
          steps: Math.floor(Math.random() * 7000) + 3000,
          calories: Math.floor(Math.random() * 300) + 200,
        };
      });
      setWeeklyChartData(placeholderWeekly);
      
    } else {
      setDashboardMetrics(getDefaultMetrics(currentChildName));
      setWeeklyChartData(generatePlaceholderWeeklyData());
      setLastFitbitUpdate("Could not fetch Fitbit data.");
    }
    setIsLoadingData(false);
  }, [currentChildName, getDefaultMetrics]);
  
  const fetchAlertsData = useCallback(() => {
    const storedAlertsRaw = localStorage.getItem('guardianAngelAlerts');
    if (storedAlertsRaw) {
      try {
        const allAlerts: AppAlert[] = JSON.parse(storedAlertsRaw);
        setActiveAlertsCount(allAlerts.filter(a => a.status === 'active').length);
      } catch (e) { console.error("Error parsing alerts for dashboard", e); setActiveAlertsCount(0); }
    } else {
      setActiveAlertsCount(0);
    }
  }, []);


  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch('/api/health-data');
        if (!response.ok) throw new Error('Failed to fetch health data');
        const data: FitbitDeviceData = await response.json();
        processAndSetFitbitData(data);
      } catch (error) {
        console.error(error);
        processAndSetFitbitData(null);
      }
      fetchAlertsData();
    };

    loadInitialData();
    const intervalId = setInterval(async () => {
       try {
        const response = await fetch('/api/health-data');
        if (!response.ok) throw new Error('Failed to fetch health data periodically');
        const data: FitbitDeviceData = await response.json();
        processAndSetFitbitData(data);
      } catch (error) {
        console.error(error);
      }
      fetchAlertsData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [processAndSetFitbitData, fetchAlertsData]);
  
  useEffect(() => {
    if (!fitbitData) { 
       setDashboardMetrics(getDefaultMetrics(currentChildName));
    } else {
        processAndSetFitbitData(fitbitData); 
    }
  }, [currentChildName, getDefaultMetrics, fitbitData, processAndSetFitbitData]);


  const generatePlaceholderWeeklyData = (): WeeklyActivityRecord[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(day => ({
      day,
      steps: Math.floor(Math.random() * 5000) + 5000,
      calories: Math.floor(Math.random() * 200) + 200,
    }));
  };

  if (isLoadingData && dashboardMetrics.length === 0) {
    return (
      <div className="space-y-8">
        <div><Skeleton className="h-10 w-1/3 mb-1" /><Skeleton className="h-4 w-2/3" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
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
            Here's an overview of {currentChildName}'s activity and wellbeing.
            {/* In a real app, activeAlertsCount would come from a Firestore onSnapshot listener. */}
            </p>
            {lastFitbitUpdate && (
                <p className="text-xs text-muted-foreground">Data Source: {lastFitbitUpdate}</p>
            )}
        </div>
      </div>
      
      <Card className={cn("shadow-lg", activeAlertsCount > 0 ? "border-destructive bg-destructive/5 hover:border-destructive/80" : "border-primary bg-primary/5 hover:border-primary/80")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              {activeAlertsCount > 0 ? <ShieldAlert className="h-6 w-6 mr-2 text-destructive" /> : <Info className="h-6 w-6 mr-2 text-primary"/>}
              Active Alerts
            </CardTitle>
            <CardDescription>
              {activeAlertsCount > 0 
                ? `There are ${activeAlertsCount} active alert(s) for ${currentChildName}.`
                : `No active alerts for ${currentChildName}. System is clear.`}
            </CardDescription>
          </div>
           <Link href="/alerts">
            <Button variant={activeAlertsCount > 0 ? "destructive" : "default"} size="sm">View Alerts</Button>
          </Link>
        </CardHeader>
        {activeAlertsCount > 0 && (
           <CardContent>
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertTitle>Attention Required</AlertTitle>
                <AlertDescription>Please review the active alerts on the Alerts page.</AlertDescription>
             </Alert>
           </CardContent>
        )}
      </Card>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

