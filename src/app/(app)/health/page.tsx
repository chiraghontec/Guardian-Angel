
"use client";

import { useState, useEffect } from 'react';
import { HeartRateWidget } from '@/components/health/heart-rate-widget';
import { HealthTrendsChart } from '@/components/health/health-trends-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HealthDataPoint, SimulatedHealthConnectData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/auth-context'; // Use auth context
import { Skeleton } from '@/components/ui/skeleton';


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
  const [historicalDailyHeartRate, setHistoricalDailyHeartRate] = useState<HealthDataPoint[]>([]);
  const [historicalWeeklyHeartRate, setHistoricalWeeklyHeartRate] = useState<HealthDataPoint[]>([]);
  const [historicalSleepData, setHistoricalSleepData] = useState<HealthDataPoint[]>([]);
  const [historicalStressData, setHistoricalStressData] = useState<HealthDataPoint[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { childNameContext } = useAuth(); // Get childName from context

  const currentChildName = childNameContext || "your child";


  useEffect(() => {
    setIsClient(true);
    setHistoricalDailyHeartRate(generateHistoricalDailyHeartRateData());
    setHistoricalWeeklyHeartRate(generateHistoricalWeeklyHeartRateData());
    setHistoricalSleepData(generateHistoricalHealthData(7, 5, 10, "Day ")); 
    setHistoricalStressData(generateHistoricalHealthData(7, 20, 80, "Day "));
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
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchHealthData(); 
      const intervalId = setInterval(fetchHealthData, 30000); 
      return () => clearInterval(intervalId); 
    }
  }, [isClient]);
  
  useEffect(() => {
    if (healthData?.lastUpdated) {
       const updateTimer = setInterval(() => {
         setLastUpdatedText(formatDistanceToNow(new Date(healthData.lastUpdated), { addSuffix: true }));
       }, 60000); 
       return () => clearInterval(updateTimer);
    }
  }, [healthData?.lastUpdated]);


  if (!isClient || !healthData) {
     return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <p className="text-muted-foreground">Loading health data for {currentChildName}...</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-1 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
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
            Overview of {currentChildName}'s health indicators from simulated Health Connect.
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
              dataKey="value" // Changed to 'value' as per HealthDataPoint
              color="hsl(var(--destructive))"
              unit="bpm"
            />
            <HealthTrendsChart
              data={historicalWeeklyHeartRate}
              title="Historical Weekly Heart Rate Avg."
              description="Average BPM over a sample week."
              dataKey="value" // Changed to 'value'
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
              dataKey="value" // Changed to 'value'
              color="hsl(var(--secondary))"
              unit="hrs"
            />
        </TabsContent>
        <TabsContent value="stress">
           <HealthTrendsChart
              data={historicalStressData}
              title="Historical Weekly Stress Levels"
              description="Estimated stress levels (HRV-based) over a sample week."
              dataKey="value" // Changed to 'value'
              color="hsl(var(--accent))"
              unit=""
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
