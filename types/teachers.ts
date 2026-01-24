/**
 * Teacher Types
 */

import { User } from "@/lib/api/types";

export interface Course {
  id: number;
  name: string;
  category?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  user?: User;
  hourly_rate: number;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive';
  bio?: string;
  courses?: Course[];
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  teacher: Teacher;
  assigned_students: any[];
  stats: {
    total_courses: number;
    active_courses: number;
    total_classes: number;
    attended_classes: number;
    total_bills: number;
    paid_bills: number;
    total_duties: number;
    total_reports: number;
    student_count: number;
  };
}

export interface TeacherPerformance {
  total_classes: number;
  attended_classes: number;
  attendance_rate: number;
  total_revenue: number;
  average_duration: number;
  student_count: number;
}

export interface TeacherFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  course_id?: number;
  page?: number;
  per_page?: number;
}

export interface TeacherStats {
  total: number;
  active: number;
  inactive: number;
}
