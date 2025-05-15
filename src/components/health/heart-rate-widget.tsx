
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';

interface HeartRateWidgetProps {
  currentBpm: number | null;
}

export function HeartRateWidget({ currentBpm }: HeartRateWidgetProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
  
  const bpmToShow = currentBpm ?? 0;
  const animationDuration = bpmToShow > 0 ? 60 / bpmToShow : 1; // Duration for one beat cycle in seconds, default 1s if bpm is 0

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Live Heart Rate
        </CardTitle>
        <HeartPulse 
          className="h-5 w-5 text-destructive" 
          style={{ 
            animation: bpmToShow > 0 ? `heartbeat ${animationDuration}s infinite ease-in-out` : 'none'
          }}
        />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-destructive">
          {currentBpm !== null ? currentBpm : '--'}
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
