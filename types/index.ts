import { LucideIcon } from "lucide-react";

/**
 * Navigation item type for sidebar
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[]; // Sub-items for dropdown
  permission?: string; // Required permission to show this item
  role?: string; // Required role to show this item
}

/**
 * Navigation group with title and items
 */
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Stat card component props
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  gradient?: boolean;
  className?: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * Activity item for recent activity list
 */
export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
  type: "course" | "student" | "assignment" | "grade" | "message";
}

/**
 * Progress card props
 */
export interface ProgressCardProps {
  label: string;
  value: number;
  subtitle?: string;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
}

