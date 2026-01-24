/**
 * Salary Types
 */

export interface TeacherSalary {
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  hourly_rate: number;
  currency: string;
  month: string;
  total_hours: number;
  total_classes: number;
  salary: number;
  status: 'active' | 'inactive';
}

export interface SalaryStatistics {
  month: string;
  total_teachers: number;
  total_salary: number;
  average_salary: number;
  total_hours: number;
  total_classes: number;
  previous_month_salary: number;
  salary_change_percentage: number;
}

export interface SalaryBreakdownClass {
  class_id: number;
  class_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  duration_hours: number;
  hourly_rate: number;
  salary: number;
  student_name: string;
  student_id: number;
  course_name: string;
  course_id: number;
}

export interface SalaryBreakdown {
  teacher_id: number;
  teacher_name: string;
  hourly_rate: number;
  currency: string;
  month: string;
  total_hours: number;
  total_classes: number;
  total_salary: number;
  classes: SalaryBreakdownClass[];
}

export interface SalaryHistoryItem {
  month: string;
  month_name: string;
  salary: number;
  hours: number;
  classes: number;
}

export interface AllTeachersSalaryHistoryItem {
  month: string;
  month_name: string;
  total_salary: number;
  teacher_count: number;
}

export interface SalaryFilters {
  month?: string;
  year?: string;
  teacher_id?: number;
  convertToEGP?: boolean;
  usdToEgpRate?: number;
}
