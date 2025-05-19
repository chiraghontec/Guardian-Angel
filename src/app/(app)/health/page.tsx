
"use client";

import { useState, useEffect } from 'react';
import { HeartRateWidget } from '@/components/health/heart-rate-widget';
import { HealthTrendsChart } from '@/components/health/health-trends-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HealthDataPoint, FitbitDeviceData, AppAlert, SleepStage } from '@/types'; // Updated types
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Thermometer, Droplet, BedDouble, TrendingUp, Activity, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';


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

// Constants for alert generation
const HIGH_HR_THRESHOLD = 120; 
const LOW_HR_THRESHOLD = 50; 
const LOW_SPO2_THRESHOLD = 92;
const HIGH_TEMP_THRESHOLD = 38.0;
const LOW_TEMP_THRESHOLD = 35.0;


export default function HealthPage() {
  const [fitbitData, setFitbitData] = useState<FitbitDeviceData | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>("never");
  const [historicalDailyHeartRate, setHistoricalDailyHeartRate] = useState<HealthDataPoint[]>([]);
  const [historicalWeeklyHeartRate, setHistoricalWeeklyHeartRate] = useState<HealthDataPoint[]>([]);
  const [historicalSleepData, setHistoricalSleepData] = useState<HealthDataPoint[]>([]);
  const [historicalStressData, setHistoricalStressData] = useState<HealthDataPoint[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { childNameContext, currentUser } = useAuth();
  const { toast } = useToast();

  const currentChildName = childNameContext || "your child";

  useEffect(() => {
    setIsClient(true);
    setHistoricalDailyHeartRate(generateHistoricalDailyHeartRateData());
    setHistoricalWeeklyHeartRate(generateHistoricalWeeklyHeartRateData());
    setHistoricalSleepData(generateHistoricalHealthData(7, 5, 10, "Day ")); 
    setHistoricalStressData(generateHistoricalHealthData(7, 20, 80, "Day "));
  }, []);

  const addNewAlert = (newAlert: Omit<AppAlert, 'id' | 'timestamp' | 'status' | 'userId'>) => {
    const alertToAdd: AppAlert = {
      ...newAlert,
      id: `${newAlert.type}-${new Date().getTime()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date(),
      status: 'active',
      userId: currentUser?.uid, // Associate with current user
    };

    // In a real app, this would write to Firestore:
    // e.g., await setDoc(doc(db, 'users', currentUser.uid, 'alerts', alertToAdd.id), alertToAdd);
    // For this prototype, we use localStorage.
    const existingAlertsRaw = localStorage.getItem('guardianAngelAlerts');
    let existingAlerts: AppAlert[] = [];
    if (existingAlertsRaw) {
      try {
        existingAlerts = JSON.parse(existingAlertsRaw).map((a: any) => ({...a, timestamp: new Date(a.timestamp)}));
      } catch (e) { console.error("Error parsing existing alerts", e); }
    }
    
    // Avoid duplicate active alerts of the same type for the same metric within a short timeframe (e.g. 1 hour)
    const recentSimilarAlert = existingAlerts.find(
      a => a.type === alertToAdd.type && 
           a.status === 'active' &&
           (new Date().getTime() - new Date(a.timestamp).getTime()) < 60 * 60 * 1000 // 1 hour
    );

    if (!recentSimilarAlert) {
      const updatedAlerts = [alertToAdd, ...existingAlerts];
      localStorage.setItem('guardianAngelAlerts', JSON.stringify(updatedAlerts));
      toast({
        title: `New Health Alert: ${alertToAdd.title}`,
        description: alertToAdd.description,
        variant: "destructive",
      });
    }
  };

  const checkHealthThresholds = (data: FitbitDeviceData) => {
    if (data.liveHeartRate && data.liveHeartRate > HIGH_HR_THRESHOLD) {
      addNewAlert({ type: 'fitbit_hr_high', title: 'High Heart Rate Detected', description: `${currentChildName}'s heart rate reached ${data.liveHeartRate} BPM.`, details: { metricValue: data.liveHeartRate }});
    }
    if (data.liveHeartRate && data.liveHeartRate < LOW_HR_THRESHOLD) { // Assuming LOW_HR_THRESHOLD is defined
       addNewAlert({ type: 'fitbit_hr_low', title: 'Low Heart Rate Detected', description: `${currentChildName}'s heart rate dropped to ${data.liveHeartRate} BPM.`, details: { metricValue: data.liveHeartRate }});
    }
    if (data.spo2 && data.spo2 < LOW_SPO2_THRESHOLD) {
      addNewAlert({ type: 'fitbit_spo2_low', title: 'Low SpO2 Detected', description: `${currentChildName}'s oxygen saturation is ${data.spo2}%.`, details: { metricValue: data.spo2 }});
    }
    if (data.bodyTemperature && data.bodyTemperature > HIGH_TEMP_THRESHOLD) { // Assuming HIGH_TEMP_THRESHOLD is defined
       addNewAlert({ type: 'fitbit_temp_high', title: 'High Body Temperature', description: `${currentChildName}'s temperature is ${data.bodyTemperature}°C.`, details: { metricValue: data.bodyTemperature }});
    }
    if (data.bodyTemperature && data.bodyTemperature < LOW_TEMP_THRESHOLD) { // Assuming LOW_TEMP_THRESHOLD is defined
       addNewAlert({ type: 'fitbit_temp_low', title: 'Low Body Temperature', description: `${currentChildName}'s temperature is ${data.bodyTemperature}°C.`, details: { metricValue: data.bodyTemperature }});
    }
  };


  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health-data');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: FitbitDeviceData = await response.json();
      setFitbitData(data);
      setLastUpdatedText(formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true }));
      checkHealthThresholds(data); // Check for alerts on new data
    } catch (error) {
      console.error("Failed to fetch health data:", error);
       toast({ title: "Fetch Error", description: "Could not load health data.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchHealthData(); 
      const intervalId = setInterval(fetchHealthData, 30000); // Poll every 30s
      return () => clearInterval(intervalId); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);
  
  useEffect(() => {
    if (fitbitData?.lastUpdated) {
       const updateTimer = setInterval(() => {
         setLastUpdatedText(formatDistanceToNow(new Date(fitbitData.lastUpdated), { addSuffix: true }));
       }, 60000); 
       return () => clearInterval(updateTimer);
    }
  }, [fitbitData?.lastUpdated]);

  const renderSleepStages = (stages?: SleepStage[]) => {
    if (!stages || stages.length === 0) return <p className="text-xs text-muted-foreground">No detailed sleep data.</p>;
    
    const totalDuration = stages.reduce((sum, s) => sum + s.durationMinutes, 0);
    if (totalDuration === 0) return <p className="text-xs text-muted-foreground">No detailed sleep data.</p>;

    return (
      <div className="space-y-1 mt-1">
        {stages.map(stage => (
          <div key={stage.stage} className="text-xs">
            <div className="flex justify-between">
              <span className="capitalize">{stage.stage}</span>
              <span>{stage.durationMinutes} min ({((stage.durationMinutes / totalDuration) * 100).toFixed(0)}%)</span>
            </div>
            <Progress value={(stage.durationMinutes / totalDuration) * 100} className="h-1.5 mt-0.5" 
              indicatorClassName={
                stage.stage === 'deep' ? 'bg-indigo-500' :
                stage.stage === 'light' ? 'bg-sky-500' :
                stage.stage === 'rem' ? 'bg-purple-500' :
                'bg-slate-300'
              } />
          </div>
        ))}
      </div>
    );
  }


  if (!isClient || !fitbitData) {
     return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <p className="text-muted-foreground">Loading health data for {currentChildName} from Fitbit (Simulated)...</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-lg"><CardHeader className="pb-2"><Skeleton className="h-5 w-3/4 rounded" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2 mb-1 rounded" /><Skeleton className="h-4 w-1/4 rounded" /></CardContent></Card>
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
            Overview of {currentChildName}'s health from Fitbit (Simulated).
            {/* In a real app, this data would be fetched from Firestore, populated by a Firebase Function syncing with Fitbit. */}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdatedText}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <HeartRateWidget currentBpm={fitbitData.liveHeartRate} />
        
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resting Heart Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fitbitData.restingHeartRate || '--'} <span className="text-sm font-normal text-muted-foreground">BPM</span></div>
            <p className="text-xs text-muted-foreground mt-1">Daily average</p>
          </CardContent>
        </Card>

        {fitbitData.spo2 !== undefined && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Oxygen Saturation (SpO2)</CardTitle>
              <Activity className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{fitbitData.spo2}%</div>
              <p className="text-xs text-muted-foreground mt-1">Current estimate</p>
            </CardContent>
          </Card>
        )}

        {fitbitData.bodyTemperature !== undefined && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Body Temperature</CardTitle>
              <Thermometer className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{fitbitData.bodyTemperature.toFixed(1)} °C</div>
              <p className="text-xs text-muted-foreground mt-1">Current estimate</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center"><BedDouble className="mr-2 h-6 w-6 text-primary"/> Sleep Overview</CardTitle>
          <CardDescription>Last recorded sleep duration and stages.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-2xl font-bold">{fitbitData.lastSleepDuration.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs total</span></div>
           {renderSleepStages(fitbitData.sleepStages)}
        </CardContent>
      </Card>


      <Tabs defaultValue="heartRate">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="heartRate">Heart Rate Trends</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Patterns</TabsTrigger>
          <TabsTrigger value="stress">Stress Levels (HRV)</TabsTrigger>
        </TabsList>

        <TabsContent value="heartRate">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <HealthTrendsChart data={historicalDailyHeartRate} title="Historical Daily Heart Rate" description="Average BPM throughout a sample day." dataKey="value" color="hsl(var(--destructive))" unit="bpm"/>
            <HealthTrendsChart data={historicalWeeklyHeartRate} title="Historical Weekly Heart Rate Avg." description="Average BPM over a sample week." dataKey="value" color="hsl(var(--primary))" unit="bpm"/>
          </div>
        </TabsContent>
        <TabsContent value="sleep">
           <HealthTrendsChart data={historicalSleepData} title="Historical Weekly Sleep Duration" description="Hours of sleep per night over a sample week." dataKey="value" color="hsl(var(--secondary))" unit="hrs"/>
        </TabsContent>
        <TabsContent value="stress">
           <HealthTrendsChart data={historicalStressData} title="Historical Weekly Stress Levels" description="Estimated stress levels (HRV-based) over a sample week." dataKey="value" color="hsl(var(--accent))" unit=""/>
        </TabsContent>
      </Tabs>
    </div>
  );
}

