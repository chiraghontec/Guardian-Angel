
import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  subItems?: NavItem[];
}

export interface ActivityMetric {
  id: string;
  label: string;
  value: number | string; // Can be number or formatted string like "75 BPM"
  goal?: number; // Optional goal
  unit: string;
  icon: LucideIcon;
  color?: string; 
}

// Replaces BullyingIncident
export type AlertType = 
  | 'ai_bullying' 
  | 'ai_depressive' 
  | 'fitbit_hr_high' 
  | 'fitbit_hr_low' 
  | 'fitbit_spo2_low'
  | 'fitbit_temp_high'
  | 'fitbit_temp_low';

export type AlertStatus = 'active' | 'resolved';

export interface AppAlert {
  id: string;
  userId?: string; // For Firestore, to associate with a user
  timestamp: Date;
  type: AlertType;
  title: string; // e.g., "Potential Bullying Detected", "High Heart Rate Alert"
  description: string; // The original text, or a summary of the health metric
  severity?: number; // 0-1, applicable for AI and some health alerts
  status: AlertStatus;
  details?: Record<string, any>; // For extra info like original text, explanation, metric value
  resolvedAt?: Date;
  resolvedBy?: string; // User ID or system
}


export interface HealthDataPoint {
  time: string; 
  value: number;
}

export interface WeeklyActivityRecord {
  day: string; 
  steps?: number;
  calories?: number;
  distance?: number; 
  activeMinutes?: number;
}

export interface SleepStage {
  stage: 'deep' | 'light' | 'rem' | 'awake' | 'restless'; // Expanded to include restless
  durationMinutes: number; // Duration in minutes
  startTime?: string; // ISO string, optional
}
export interface FitbitDeviceData {
  liveHeartRate: number | null; // Can be null if no recent reading
  restingHeartRate?: number; // Optional
  heartRateHistory?: HealthDataPoint[]; // For more granular display if needed
  dailySteps: number;
  lastSleepDuration: number; // Total hours
  sleepStages?: SleepStage[]; // Optional detailed sleep stages
  bodyTemperature?: number; // Celsius, optional
  spo2?: number; // Percentage, optional
  lastUpdated: string; // ISO string timestamp
}

// Conceptual structure for Firestore health records
export interface UserHealthRecord {
  id?: string; // Firestore document ID
  userId: string;
  timestamp: Date; // Firestore Timestamp or ISO string
  source: 'fitbit' | 'manual' | 'other';
  steps?: number;
  heartRate?: number;
  restingHeartRate?: number;
  sleepMinutes?: number;
  sleepStages?: SleepStage[];
  bodyTemperature?: number;
  spo2?: number;
  // Add other relevant fields
}


// Form input types
export type LoginFormInputs = {
  email: string;
  password: string;
};

export type SignupFormInputs = {
  parentName: string;
  childName: string; 
  email: string;
  password: string;
};

// This CsvActivityRecord can be removed if Fitbit is the sole source
// Or kept if manual CSV upload is still a desired fallback/alternative.
// For now, assuming Fitbit is primary.
// export interface CsvActivityRecord {
//   Date: string; 
//   Steps?: number;
//   Calories?: number;
//   Distance?: number; 
//   ActiveMinutes?: number;
// }

