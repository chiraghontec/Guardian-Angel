
import { NextResponse } from 'next/server';
import type { FitbitDeviceData, SleepStage } from '@/types';

// Helper to generate random sleep stages
const generateSleepStages = (totalSleepMinutes: number): SleepStage[] => {
  const stages: SleepStage[] = [];
  let remainingMinutes = totalSleepMinutes;

  const deepMinutes = Math.floor(remainingMinutes * (Math.random() * 0.15 + 0.10)); // 10-25%
  if (deepMinutes > 0) {
    stages.push({ stage: 'deep', durationMinutes: deepMinutes });
    remainingMinutes -= deepMinutes;
  }

  const lightMinutes = Math.floor(remainingMinutes * (Math.random() * 0.20 + 0.45)); // 45-65%
  if (lightMinutes > 0) {
    stages.push({ stage: 'light', durationMinutes: lightMinutes });
    remainingMinutes -= lightMinutes;
  }
  
  const remMinutes = Math.floor(remainingMinutes * (Math.random() * 0.10 + 0.15)); // 15-25%
  if (remMinutes > 0) {
    stages.push({ stage: 'rem', durationMinutes: remMinutes });
    remainingMinutes -= remMinutes;
  }

  if (remainingMinutes > 0) { // Assign rest to awake/restless
    stages.push({ stage: 'awake', durationMinutes: remainingMinutes });
  }
  
  return stages.sort((a,b) => Math.random() - 0.5); // Shuffle for some randomness in order
};


let mockFitbitData: FitbitDeviceData = {
  liveHeartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
  restingHeartRate: Math.floor(Math.random() * (75 - 55 + 1)) + 55,
  dailySteps: Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000,
  lastSleepDuration: Math.round((Math.random() * (9 - 5) + 5) * 10) / 10,
  sleepStages: generateSleepStages(Math.round((Math.random() * (9 - 5) + 5) * 60)),
  bodyTemperature: Math.round((Math.random() * (37.5 - 36.0) + 36.0) * 10) / 10,
  spo2: Math.floor(Math.random() * (100 - 94 + 1)) + 94, // Range 94-100%
  lastUpdated: new Date().toISOString(),
};

if (typeof global.fitbitDataInterval === 'undefined') {
  global.fitbitDataInterval = setInterval(() => {
    const newSleepDurationHours = Math.round((Math.random() * (9 - 5) + 5) * 10) / 10;
    mockFitbitData = {
      liveHeartRate: Math.floor(Math.random() * (120 - 55 + 1)) + 55, // Wider range for live
      restingHeartRate: Math.floor(Math.random() * (75 - 55 + 1)) + 55,
      dailySteps: mockFitbitData.dailySteps + Math.floor(Math.random() * 200),
      lastSleepDuration: newSleepDurationHours,
      sleepStages: generateSleepStages(newSleepDurationHours * 60),
      bodyTemperature: Math.round((Math.random() * (37.8 - 35.8) + 35.8) * 10) / 10, // Slightly wider temp
      spo2: Math.floor(Math.random() * (100 - 92 + 1)) + 92, // Spo2 can dip a bit lower
      lastUpdated: new Date().toISOString(),
    };
  }, 15000); // Update mock data every 15 seconds for more "live" feel
}


export async function GET() {
  // In a real Fitbit integration, a Firebase Function would:
  // 1. Use OAuth2 tokens to fetch data from Fitbit API.
  // 2. Store this data in Firestore (e.g., users/{userId}/healthRecords/{recordId}).
  // This GET route would then ideally fetch the latest processed data from Firestore for the logged-in user.
  // For this prototype, we return the globally mocked data.
  return NextResponse.json(mockFitbitData);
}

