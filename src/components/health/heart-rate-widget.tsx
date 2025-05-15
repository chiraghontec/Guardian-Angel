
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';

export function HeartRateWidget() {
  const [bpm, setBpm] = useState(0); // Initial BPM
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simulate real-time heart rate updates
    // In a real app, this would come from a sensor or API
    setBpm(Math.floor(Math.random() * (100 - 60 + 1)) + 60); // Initial random BPM between 60-100

    const intervalId = setInterval(() => {
      setBpm(prevBpm => {
        const change = Math.floor(Math.random() * 5) - 2; // Small random change +/- 2
        let newBpm = prevBpm + change;
        if (newBpm < 55) newBpm = 55; // Min realistic BPM
        if (newBpm > 120) newBpm = 120; // Max realistic resting BPM for a child
        return newBpm;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, []);


  if (!isClient) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Live Heart Rate
          </CardTitle>
          <HeartPulse className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">--</div>
          <p className="text-xs text-muted-foreground mt-1">BPM</p>
        </CardContent>
      </Card>
    );
  }
  
  const animationDuration = 60 / bpm; // Duration for one beat cycle in seconds

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Live Heart Rate
        </CardTitle>
        <HeartPulse 
          className="h-5 w-5 text-destructive" 
          style={{ animation: `heartbeat ${animationDuration}s infinite ease-in-out` }}
        />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-destructive">
          {bpm}
        </div>
        <p className="text-xs text-muted-foreground mt-1">BPM</p>
      </CardContent>
      <style jsx global>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          10% { transform: scale(1.3); }
          20% { transform: scale(1); }
          30% { transform: scale(1.3); }
          40% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Card>
  );
}
