
"use client";

import { useState, useEffect } from 'react';
import { HeartRateWidget } from '@/components/health/heart-rate-widget';
import { HealthTrendsChart } from '@/components/health/health-trends-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HealthDataPoint } from '@/types';
import { PLACEHOLDER_USER } from '@/lib/constants';

// Generate placeholder data
const generateHealthData = (numPoints: number, minVal: number, maxVal: number, timePrefix: string = ""): HealthDataPoint[] => {
  return Array.from({ length: numPoints }, (_, i) => ({
    time: `${timePrefix}${i + 1}`,
    value: Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal,
  }));
};

const generateDailyHeartRateData = (): HealthDataPoint[] => {
  const data: HealthDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.floor(Math.random() * (110 - 60 + 1)) + 60, // Random BPM between 60-110
    });
  }
  return data;
};

const generateWeeklyHeartRateData = (): HealthDataPoint[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({
    time: day,
    value: Math.floor(Math.random() * (95 - 70 + 1)) + 70, // Random average BPM 70-95
  }));
};

export default function HealthPage() {
  const [dailyHeartRate, setDailyHeartRate] = useState<HealthDataPoint[]>([]);
  const [weeklyHeartRate, setWeeklyHeartRate] = useState<HealthDataPoint[]>([]);
  const [sleepData, setSleepData] = useState<HealthDataPoint[]>([]);
  const [stressData, setStressData] = useState<HealthDataPoint[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDailyHeartRate(generateDailyHeartRateData());
    setWeeklyHeartRate(generateWeeklyHeartRateData());
    setSleepData(generateHealthData(7, 5, 10, "Day ")); // Sleep hours
    setStressData(generateHealthData(7, 20, 80, "Day ")); // Stress level 0-100
  }, []);

  if (!isClient) {
     return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <p className="text-muted-foreground">Loading health data for {PLACEHOLDER_USER.childName}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <p className="text-muted-foreground">
          Overview of {PLACEHOLDER_USER.childName}'s health indicators.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <HeartRateWidget />
        {/* Placeholder for Sleep Duration */}
        <div className="lg:col-span-1 p-4 border rounded-lg shadow-lg bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Average Sleep</h3>
            <p className="text-3xl font-bold">{(sleepData.reduce((acc, curr) => acc + curr.value, 0) / (sleepData.length || 1)).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs</span></p>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>
        {/* Placeholder for Stress Levels */}
        <div className="lg:col-span-1 p-4 border rounded-lg shadow-lg bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Average Stress</h3>
            <p className="text-3xl font-bold">{(stressData.reduce((acc, curr) => acc + curr.value, 0) / (stressData.length || 1)).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">/100</span></p>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days HRV-based estimate</p>
        </div>
      </div>

      <Tabs defaultValue="heartRate">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="heartRate">Heart Rate Trends</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Patterns</TabsTrigger>
          <TabsTrigger value="stress">Stress Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="heartRate">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <HealthTrendsChart
              data={dailyHeartRate}
              title="Daily Heart Rate"
              description="Average BPM throughout today."
              dataKey="bpm"
              color="hsl(var(--destructive))"
              unit="bpm"
            />
            <HealthTrendsChart
              data={weeklyHeartRate}
              title="Weekly Heart Rate Avg."
              description="Average BPM over the last 7 days."
              dataKey="bpm"
              color="hsl(var(--primary))"
              unit="bpm"
            />
          </div>
        </TabsContent>
        <TabsContent value="sleep">
           <HealthTrendsChart
              data={sleepData}
              title="Weekly Sleep Duration"
              description="Hours of sleep per night over the last 7 days."
              dataKey="sleep"
              color="hsl(var(--secondary))"
              unit="hrs"
            />
        </TabsContent>
        <TabsContent value="stress">
           <HealthTrendsChart
              data={stressData}
              title="Weekly Stress Levels"
              description="Estimated stress levels (HRV-based) over the last 7 days."
              dataKey="stress"
              color="hsl(var(--accent))"
              unit=""
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
