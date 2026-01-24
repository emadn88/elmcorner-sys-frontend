/**
 * Course Types
 */

export interface Teacher {
  id: number;
  user_id: number;
  hourly_rate: number;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  category?: string;
  description?: string;
  status: 'active' | 'inactive';
  teachers?: Teacher[];
  created_at: string;
  updated_at: string;
}

export interface CourseFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  category?: string;
  page?: number;
  per_page?: number;
}

export interface CourseStats {
  total: number;
  active: number;
  inactive: number;
}
