
import type { NavItem } from '@/types';
import { LayoutDashboard, MessageSquareWarning, Heart, Settings, LogOut, ShieldCheck } from 'lucide-react';

export const APP_NAME = "Guardian Angel";

export const NAV_ITEMS_MAIN: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alerts', label: 'Bullying Alerts', icon: MessageSquareWarning },
  { href: '/health', label: 'Health Metrics', icon: Heart },
];

export const NAV_ITEMS_FOOTER: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  // { href: '/logout', label: 'Logout', icon: LogOut }, // Logout would typically be a function call
];

export const PLACEHOLDER_USER = {
  name: "Sarah Connor",
  email: "sarah@example.com",
  avatar: "https://placehold.co/100x100.png",
  childName: "John",
};

export const DEFAULT_ACTIVITY_GOALS = {
  steps: 10000,
  calories: 500,
  distance: 5, // km
  activeMinutes: 60,
};
