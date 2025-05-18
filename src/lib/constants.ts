
import type { NavItem } from '@/types';
import { LayoutDashboard, MessageSquareWarning, Heart, Settings } from 'lucide-react';

export const APP_NAME = "Guardian Angel";

export const NAV_ITEMS_MAIN: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alerts', label: 'Bullying Alerts', icon: MessageSquareWarning },
  { href: '/health', label: 'Health Metrics', icon: Heart },
];

export const NAV_ITEMS_FOOTER: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

// PLACEHOLDER_USER is less relevant now for parent's direct info
// but childName might still be used as a placeholder in some UIs
// until a proper data store for child profiles is implemented.
export const PLACEHOLDER_USER = {
  // name: "Sarah Connor", // Will come from auth currentUser.displayName
  // email: "sarah@example.com", // Will come from auth currentUser.email
  // avatar: "https://placehold.co/100x100.png", // Will come from auth currentUser.photoURL
  childName: "John", // This could be fetched or managed via AuthContext/Firestore later
};

export const DEFAULT_ACTIVITY_GOALS = {
  steps: 10000,
  calories: 500,
  distance: 5, // km
  activeMinutes: 60,
};
