
"use client";

import { useState, useEffect } from 'react';
import { HeartRateWidget } from '@/components/health/heart-rate-widget';
import { HealthTrendsChart } from '@/components/health/health-trends-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HealthDataPoint, SimulatedHealthConnectData } from '@/types';
import { PLACEHOLDER_USER } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Activity, Droplet } from 'lucide-react'; // Activity for steps, Droplet for SpO2
import { formatDistanceToNow } from 'date-fns';

// Generate placeholder historical data (can be kept or removed if API provides history)
const generateHistoricalHealthData = (numPoints: number, minVal: number, maxVal: number, timePrefix: string = ""): HealthDataPoint[] => {
  return Array.from({ length: numPoints }, (_, i) => ({
    time: `${timePrefix}${i + 1}`,
    value: Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal,
  }));
};

const generateHistoricalDailyHeartRateData = (): HealthDataPoint[] => {
  const data: HealthDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.floor(Math.random() * (110 - 60 + 1)) + 60,
    });
  }
  return data;
};

const generateHistoricalWeeklyHeartRateData = (): HealthDataPoint[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({
    time: day,
    value: Math.floor(Math.random() * (95 - 70 + 1)) + 70, 
  }));
};


export default function HealthPage() {
  const [healthData, setHealthData] = useState<SimulatedHealthConnectData | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>("never");

  // Historical data states (can be replaced if API provides historical trends)
  const [historicalDailyHeartRate, setHistoricalDailyHeartRate] = useState<HealthDataPoint[]>([]);
  const [historicalWeeklyHeartRate, setHistoricalWeeklyHeartRate] = useState<HealthDataPoint[]>([]);
  const [historicalSleepData, setHistoricalSleepData] = useState<HealthDataPoint[]>([]);
  const [historicalStressData, setHistoricalStressData] = useState<HealthDataPoint[]>([]);
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize historical data (can be fetched if API supports it)
    setHistoricalDailyHeartRate(generateHistoricalDailyHeartRateData());
    setHistoricalWeeklyHeartRate(generateHistoricalWeeklyHeartRateData());
    setHistoricalSleepData(generateHistoricalHealthData(7, 5, 10, "Day ")); // Sleep hours
    setHistoricalStressData(generateHistoricalHealthData(7, 20, 80, "Day ")); // Stress level 0-100
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health-data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SimulatedHealthConnectData = await response.json();
      setHealthData(data);
      setLastUpdatedText(formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true }));
    } catch (error) {
      console.error("Failed to fetch health data:", error);
      // Optionally, set an error state and display it in the UI
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchHealthData(); // Initial fetch
      const intervalId = setInterval(fetchHealthData, 30000); // Poll every 30 seconds
      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [isClient]);
  
  useEffect(() => {
    if (healthData?.lastUpdated) {
       const updateTimer = setInterval(() => {
         setLastUpdatedText(formatDistanceToNow(new Date(healthData.lastUpdated), { addSuffix: true }));
       }, 60000); // Update "last updated" text every minute
       return () => clearInterval(updateTimer);
    }
  }, [healthData?.lastUpdated]);


  if (!isClient || !healthData) {
     return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <p className="text-muted-foreground">Loading health data for {PLACEHOLDER_USER.childName}...</p>
        {/* Basic skeleton loader for key metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="h-4 bg-muted rounded w-3/4"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <div className="flex justify-between items-center">
           <p className="text-muted-foreground">
            Overview of {PLACEHOLDER_USER.childName}'s health indicators from simulated Health Connect.
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdatedText}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <HeartRateWidget currentBpm={healthData.liveHeartRate} />
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Sleep</CardTitle>
            {/* Icon can be added here if desired */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{healthData.lastSleepDuration.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs</span></div>
            <p className="text-xs text-muted-foreground mt-1">Last recorded sleep</p>
          </CardContent>
        </Card>

        {healthData.spo2 !== undefined && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Oxygen Saturation (SpO2)</CardTitle>
              <Droplet className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{healthData.spo2}%</div>
              <p className="text-xs text-muted-foreground mt-1">Current estimate</p>
            </CardContent>
          </Card>
        )}

        {healthData.bodyTemperature !== undefined && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Body Temperature</CardTitle>
              <Thermometer className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{healthData.bodyTemperature.toFixed(1)} °C</div>
              <p className="text-xs text-muted-foreground mt-1">Current estimate</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historical Data Charts - these still use generated data but could be adapted for API-driven history */}
      <Tabs defaultValue="heartRate">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="heartRate">Heart Rate Trends</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Patterns</TabsTrigger>
          <TabsTrigger value="stress">Stress Levels (HRV)</TabsTrigger>
        </TabsList>

        <TabsContent value="heartRate">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <HealthTrendsChart
              data={historicalDailyHeartRate}
              title="Historical Daily Heart Rate"
              description="Average BPM throughout a sample day."
              dataKey="bpm"
              color="hsl(var(--destructive))"
              unit="bpm"
            />
            <HealthTrendsChart
              data={historicalWeeklyHeartRate}
              title="Historical Weekly Heart Rate Avg."
              description="Average BPM over a sample week."
              dataKey="bpm"
              color="hsl(var(--primary))"
              unit="bpm"
            />
          </div>
        </TabsContent>
        <TabsContent value="sleep">
           <HealthTrendsChart
              data={historicalSleepData}
              title="Historical Weekly Sleep Duration"
              description="Hours of sleep per night over a sample week."
              dataKey="sleep"
              color="hsl(var(--secondary))"
              unit="hrs"
            />
        </TabsContent>
        <TabsContent value="stress">
           <HealthTrendsChart
              data={historicalStressData}
              title="Historical Weekly Stress Levels"
              description="Estimated stress levels (HRV-based) over a sample week."
              dataKey="stress"
              color="hsl(var(--accent))"
              unit=""
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
