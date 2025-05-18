
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
  value: number;
  goal: number;
  unit: string;
  icon: LucideIcon;
  color?: string; // e.g. 'hsl(var(--primary))'
}

export interface BullyingIncident {
  id: string;
  timestamp: Date;
  text: string;
  severity: number; // 0-1
  isBullying: boolean;
  explanation: string;
}

export interface HealthDataPoint {
  time: string; // Could be more specific, e.g., HH:mm or a full date string
  value: number;
}

export interface WeeklyActivityRecord {
  day: string; // e.g., "Mon", "Tue"
  steps?: number;
  calories?: number;
  distance?: number;
  activeMinutes?: number;
}

export interface HeartRateData {
  daily: HealthDataPoint[];
  weekly: HealthDataPoint[];
}

export interface SimulatedHealthConnectData {
  liveHeartRate: number;
  dailySteps: number;
  lastSleepDuration: number; // hours
  bodyTemperature?: number; // Celsius, optional
  spo2?: number; // Percentage, optional
  lastUpdated: string; // ISO string timestamp
}

// Form input types
export type LoginFormInputs = {
  email: string;
  password: string;
};

export type SignupFormInputs = {
  parentName: string;
  childName: string; // Consider making this optional or handling its storage separately
  email: string;
  password: string;
};

// Example Zod schema for reference if needed elsewhere, though defined in pages
// export const loginFormSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });
// export const signupFormSchema = z.object({
//   parentName: z.string().min(2),
//   childName: z.string().min(1), // Or optional: z.string().optional()
//   email: z.string().email(),
//   password: z.string().min(6),
// });
