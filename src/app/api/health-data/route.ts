
import { NextResponse } from 'next/server';
import type { SimulatedHealthConnectData } from '@/types';

// In-memory store for mock data to simulate changes
let mockDataStore: SimulatedHealthConnectData = {
  liveHeartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60, // 60-100 BPM
  dailySteps: Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000, // 3000-10000 steps
  lastSleepDuration: Math.round((Math.random() * (9 - 5) + 5) * 10) / 10, // 5-9 hours
  bodyTemperature: Math.round((Math.random() * (37.5 - 36.0) + 36.0) * 10) / 10, // 36.0-37.5 C
  spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95, // 95-100%
  lastUpdated: new Date().toISOString(),
};

// Simulate data updates periodically (e.g., every 10 seconds for demo)
// In a real app, this would be driven by data pushed from a companion app
if (typeof global.healthDataInterval === 'undefined') {
  global.healthDataInterval = setInterval(() => {
    mockDataStore = {
      liveHeartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
      dailySteps: mockDataStore.dailySteps + Math.floor(Math.random() * 100), // Increment steps
      lastSleepDuration: Math.round((Math.random() * (9 - 5) + 5) * 10) / 10, // Fluctuate sleep
      bodyTemperature: Math.round((Math.random() * (37.5 - 36.0) + 36.0) * 10) / 10,
      spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
      lastUpdated: new Date().toISOString(),
    };
  }, 10000); // Update mock data every 10 seconds
}


export async function GET() {
  // In a real application, you would fetch this data from your database
  // which is populated by your companion Android app via Health Connect.
  return NextResponse.json(mockDataStore);
}
