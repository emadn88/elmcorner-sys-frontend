/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Auth Types
 */
export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface Role {
  id: number;
  name: string;
  label: string;
}

export interface RolesResponse {
  roles: Role[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  redirect_url?: string;
}

export interface TeacherProfile {
  id: number;
  meet_link?: string;
  hourly_rate: number;
  currency: string;
  timezone: string;
  status: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'support' | 'accountant';
  whatsapp?: string;
  timezone: string;
  status: 'active' | 'inactive';
  permissions?: string[];
  teacher?: TeacherProfile;
}

export interface AuthUserResponse {
  user: User;
}

/**
 * Student Types
 */
export interface Student {
  id: number;
  family_id?: number;
  full_name: string;
  email?: string;
  whatsapp?: string;
  country?: string;
  currency: string;
  timezone: string;
  status: 'active' | 'paused' | 'stopped';
  type: 'trial' | 'confirmed';
  notes?: string;
  tags?: string[];
  family?: Family;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: number;
  name: string;
  email?: string;
  whatsapp?: string;
  country?: string;
  currency: string;
  timezone: string;
  notes?: string;
  status: 'active' | 'inactive';
  students_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  student: Student;
  activity_level: 'highly_active' | 'medium' | 'low' | 'stopped';
  stats: {
    total_packages: number;
    active_packages: number;
    total_classes: number;
    attended_classes: number;
    total_bills: number;
    paid_bills: number;
    pending_bills: number;
    total_duties: number;
    total_reports: number;
  };
  packages?: any[];
  timetables?: any[];
  classes?: any[];
  bills?: any[];
  duties?: any[];
  reports?: any[];
  activityLogs?: any[];
}

export interface StudentStats {
  total: number;
  active: number;
  paused: number;
  stopped: number;
}

export interface StudentFilters {
  search?: string;
  status?: 'active' | 'paused' | 'stopped' | 'all';
  family_id?: number;
  per_page?: number;
  page?: number;
}

/**
 * Teacher Types
 */
export interface Teacher {
  id: number;
  user_id: number;
  user?: User;
  hourly_rate: number;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive';
  bio?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Course Types
 */
export interface Course {
  id: number;
  name: string;
  category?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

/**
 * Package Types
 */
export interface Package {
  id: number;
  student_id: number;
  student?: Student;
  start_date: string;
  total_classes: number;
  remaining_classes: number;
  total_hours?: number;
  remaining_hours?: number;
  hour_price: number;
  currency: string;
  round_number: number;
  status: 'active' | 'finished';
  last_notification_sent?: string;
  notification_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FinishedPackage extends Package {
  student: Student;
  bills_summary: {
    total_amount: number;
    unpaid_amount: number;
    bill_count: number;
    currency: string;
  };
  completion_date: string;
}

export interface PackageFilters {
  search?: string;
  status?: 'all' | 'active' | 'finished';
  student_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface FinishedPackageFilters extends PackageFilters {
  notification_status?: 'all' | 'sent' | 'not_sent';
  student_status?: 'all' | 'active' | 'paused' | 'stopped';
  days_since_finished?: number;
}

export interface BillSummary {
  total_amount: number;
  unpaid_amount: number;
  bill_count: number;
  currency: string;
}

export interface CreatePackageData {
  student_id: number;
  start_date: string;
  total_classes: number;
  hour_price: number;
  currency?: string;
}

export interface UpdatePackageData {
  student_id?: number;
  start_date?: string;
  total_classes?: number;
  remaining_classes?: number;
  hour_price?: number;
  currency?: string;
  status?: 'active' | 'finished';
}

/**
 * Timetable Types
 */
export interface TimeSlot {
  day: number; // 1-7 (Monday-Sunday)
  start: string; // 'HH:mm' format
  end: string; // 'HH:mm' format
}

export interface Timetable {
  id: number;
  student_id: number;
  teacher_id: number;
  course_id: number;
  days_of_week: number[]; // [1,3,5] for Mon, Wed, Fri
  time_slots: TimeSlot[]; // [{day: 1, start: '10:00', end: '11:00'}]
  student_timezone: string;
  teacher_timezone: string;
  status: 'active' | 'paused' | 'stopped';
  student?: Student;
  teacher?: Teacher;
  course?: Course;
  created_at: string;
  updated_at: string;
}

/**
 * Class Instance Types
 */
export interface ClassInstance {
  id: number;
  timetable_id?: number;
  package_id?: number;
  student_id: number;
  teacher_id: number;
  course_id: number;
  class_date: string; // ISO date
  start_time: string; // 'HH:mm:ss'
  end_time: string; // 'HH:mm:ss'
  duration: number; // minutes
  status: 'pending' | 'attended' | 'cancelled_by_student' | 'cancelled_by_teacher' | 'absent_student';
  cancelled_by?: number;
  cancellation_reason?: string;
  notes?: string;
  student_evaluation?: string;
  class_report?: string;
  meet_link_used?: boolean;
  meet_link_accessed_at?: string;
  cancellation_request_status?: 'pending' | 'approved' | 'rejected';
  can_enter_meet?: boolean;
  meet_link?: string;
  student?: Student;
  teacher?: Teacher;
  course?: Course;
  package?: Package;
  timetable?: Timetable;
  created_at: string;
  updated_at: string;
}

export interface TeacherClass extends ClassInstance {
  can_enter_meet: boolean;
  meet_link?: string;
}

export interface TeacherDashboardStats {
  today_classes_count: number;
  upcoming_classes_count: number;
  pending_classes_count: number;
  assigned_students_count: number;
  this_month_hours: number;
  attendance_rate: number;
  total_hours: number;
  total_salary: number;
  total_classes: number;
  total_courses: number;
  currency: string;
}

export interface EvaluationOption {
  id: number;
  option_text: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassCancellationRequest {
  id: number;
  type: 'class_cancellation';
  class_id: number;
  student_name: string;
  student_id: number;
  teacher_name: string;
  teacher_id: number;
  course_name: string;
  class_date: string;
  start_time: string;
  cancellation_reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: number;
  type: 'package' | 'class_cancellation';
  student_name?: string;
  student_id?: number;
  package_id?: number;
  class_id?: number;
  teacher_name?: string;
  teacher_id?: number;
  course_name?: string;
  class_date?: string;
  start_time?: string;
  cancellation_reason?: string;
  completion_date?: string;
  notification_sent?: boolean;
  notification_count?: number;
  status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ClassFilters {
  start_date?: string;
  end_date?: string;
  student_id?: number;
  teacher_id?: number;
  course_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

/**
 * Trial Class Types
 */
export interface TrialClass {
  id: number;
  student_id: number;
  teacher_id: number;
  course_id: number;
  trial_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'pending_review' | 'completed' | 'no_show' | 'converted';
  converted_to_package_id?: number;
  notes?: string;
  student?: Student;
  teacher?: Teacher;
  course?: Course;
  converted_package?: Package;
  created_at: string;
  updated_at: string;
}

export interface TrialFilters {
  status?: 'pending' | 'pending_review' | 'completed' | 'no_show' | 'converted' | 'all';
  student_id?: number;
  teacher_id?: number;
  course_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface TrialStats {
  total: number;
  pending: number;
  completed: number;
  no_show: number;
  converted: number;
}

export interface ConvertTrialRequest {
  package: {
    total_classes: number;
    hour_price: number;
    currency: string;
    start_date: string;
  };
  timetable: {
    days_of_week: number[];
    time_slots: TimeSlot[];
    student_timezone: string;
    teacher_timezone: string;
  };
}

/**
 * Teacher Availability Types
 */
export interface TeacherAvailability {
  id: number;
  teacher_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Calendar Types
 */
export type CalendarView = 'month' | 'week' | 'day' | 'timeline' | 'resource';

export interface CalendarEvent extends ClassInstance {
  // Extended properties for calendar rendering
  displayStart: Date;
  displayEnd: Date;
  isSelected?: boolean;
  isDragging?: boolean;
}

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedEvents: Set<number>;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: ClassFilters;
  searchQuery: string;
  isMultiSelectMode: boolean;
}

export interface DragDropState {
  isDragging: boolean;
  draggedEventId: number | null;
  dropTarget: {
    date: Date;
    time: string;
    resourceId?: number;
  } | null;
}

export interface CalendarEventPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  zIndex: number;
}

/**
 * Calendar Types
 */
export type CalendarView = "month" | "week" | "day" | "timeline" | "resource";

export interface CalendarEvent extends ClassInstance {
  // Extended properties for calendar display
  displayTitle?: string;
  color?: string;
  isSelected?: boolean;
  isDragging?: boolean;
}

export interface DragDropState {
  isDragging: boolean;
  draggedEventId: number | null;
  dropTarget: { date: Date; time: string } | null;
  originalPosition?: { date: Date; time: string };
}

export interface EventSelection {
  selectedIds: Set<number>;
  isMultiSelectMode: boolean;
}

export interface CalendarFilters {
  status?: string;
  studentId?: number;
  teacherId?: number;
  courseId?: number;
  dateRange?: { start: Date; end: Date };
}

/**
 * Activity Log Types
 */
export interface ActivityLog {
  id: number;
  user_id?: number;
  student_id?: number;
  action: string;
  description: string;
  ip_address?: string;
  created_at: string;
  user?: User;
  student?: Student;
}

export interface ActivityFilters {
  user_id?: number;
  student_id?: number;
  action?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ActivityStats {
  total: number;
  today: number;
  by_action: Record<string, number>;
  top_users: Array<{
    user_id: number;
    user_name: string;
    count: number;
  }>;
}

/**
 * Student Activity & Engagement Types
 */
export interface StudentActivity {
  id: number;
  full_name: string;
  email?: string;
  whatsapp?: string;
  status: 'active' | 'paused' | 'stopped';
  activity_level: 'highly_active' | 'medium' | 'low' | 'stopped';
  recent_classes_count: number;
  last_class_date?: string;
  days_since_last_class?: number;
  attendance_rate?: number;
  student?: Student;
  family?: Family;
}

export interface StudentActivityFilters {
  activity_level?: 'highly_active' | 'medium' | 'low' | 'stopped' | 'all';
  threshold?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ReactivationRequest {
  message?: string;
}

/**
 * Report Types
 */
export interface Report {
  id: number;
  student_id?: number;
  teacher_id?: number;
  report_type: 'lesson_summary' | 'package_report' | 'custom' | 'student_single' | 'students_multiple' | 'students_family' | 'students_all' | 'teacher_performance' | 'salaries' | 'income';
  content: Record<string, any>;
  pdf_path?: string;
  sent_via_whatsapp: boolean;
  student?: Student;
  teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  type?: string;
  student_id?: number;
  teacher_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface GenerateReportRequest {
  type: string;
  student_id?: number;
  student_ids?: number[];
  family_id?: number;
  teacher_id?: number;
  package_id?: number;
  date_from?: string;
  date_to?: string;
  currency?: string;
}

/**
 * Analytics Types
 */
export interface RevenueData {
  date_range: {
    from: string;
    to: string;
  };
  total_revenue: number;
  total_bills: number;
  data: Array<{
    period?: string;
    course?: string;
    teacher_id?: number;
    teacher_name?: string;
    revenue: number;
    count: number;
  }>;
}

export interface AttendanceData {
  date_range: {
    from: string;
    to: string;
  };
  total_classes: number;
  attended_classes: number;
  attendance_rate: number;
  by_date: Record<string, {
    total: number;
    attended: number;
    rate: number;
  }>;
}

export interface CourseAnalyticsData {
  date_range: {
    from: string;
    to: string;
  };
  courses: Array<{
    course_id: number;
    course_name: string;
    category?: string;
    total_classes: number;
    attended_classes: number;
    attendance_rate: number;
    enrolled_students: number;
    revenue: number;
    active_teachers: number;
  }>;
}

export interface DashboardOverview {
  active_students: number;
  classes_this_month: number;
  revenue_this_month: number;
  pending_bills: number;
  today_classes: number;
}

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  course_id?: number;
  teacher_id?: number;
  group_by?: 'month' | 'course' | 'teacher';
}

/**
 * Currency Statistics Types
 */
export interface CurrencyStatistics {
  currency: string;
  total_collected: number;
  salaries: number;
  expenses: number;
  net_profit: number;
  paid_bills_amount: number;
  paid_bills_count: number;
  unpaid_bills_amount: number;
  unpaid_bills_count: number;
  bill_count: number;
  expense_count: number;
  // Legacy fields for backward compatibility
  income?: number;
  profit?: number;
}

export interface CurrencyConversionRequest {
  amount: number;
  from_currency: string;
  to_currency: string;
  rate: number;
}

export interface CurrencyConversionResult {
  original_amount: number;
  converted_amount: number;
  from_currency: string;
  to_currency: string;
  rate: number;
}

/**
 * Expense Types
 */
export interface Expense {
  id: number;
  category: 'salaries' | 'tools' | 'marketing' | 'misc';
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  created_by: number;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  date_from?: string;
  date_to?: string;
  category?: 'salaries' | 'tools' | 'marketing' | 'misc' | 'all';
  currency?: string;
  page?: number;
  per_page?: number;
}

export interface CreateExpenseData {
  category: 'salaries' | 'tools' | 'marketing' | 'misc';
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
}

export interface UpdateExpenseData {
  category?: 'salaries' | 'tools' | 'marketing' | 'misc';
  description?: string;
  amount?: number;
  currency?: string;
  expense_date?: string;
}

/**
 * Financial Types
 */
export interface FinancialSummary {
  income: {
    total: number;
    paid: number;
    pending: number;
    currency: string;
  };
  expenses: {
    total: number;
    by_category: Record<string, number>;
    currency: string;
  };
  profit: {
    net: number;
    margin: number; // percentage
    currency: string;
  };
  trends: {
    monthly: Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>;
  };
  breakdown: {
    income_by_teacher?: Array<{ teacher_id: number; teacher_name: string; amount: number }>;
    income_by_course?: Array<{ course_id: number; course_name: string; amount: number }>;
    expenses_by_category: Array<{ category: string; amount: number; percentage: number }>;
  };
}

export interface IncomeBreakdown {
  breakdown: Array<{
    period?: string;
    month?: string;
    teacher_id?: number;
    teacher_name?: string;
    course_id?: number;
    course_name?: string;
    amount: number;
  }>;
  paid_total: number;
  pending_total: number;
  currency: string;
}

export interface ExpenseBreakdown {
  by_category: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  by_month: Array<{
    period: string;
    amount: number;
  }>;
  total: number;
  currency: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

/**
 * Lead Types
 */
export type LeadStatus = 'new' | 'contacted' | 'needs_follow_up' | 'trial_scheduled' | 'trial_confirmed' | 'converted' | 'not_interested' | 'cancelled';

export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
  id: number;
  name: string;
  whatsapp: string;
  country?: string;
  timezone?: string;
  number_of_students: number;
  ages?: number[];
  source?: string;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to?: number;
  assigned_user?: User;
  next_follow_up?: string;
  notes?: string;
  converted_to_student_id?: number;
  converted_student?: Student;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  status?: LeadStatus | 'all';
  priority?: LeadPriority | 'all';
  country?: string;
  assigned_to?: number;
  source?: string;
  overdue_follow_up?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface LeadStats {
  total: number;
  new: number;
  needs_follow_up: number;
  trials_scheduled: number;
  converted: number;
  conversion_rate: number;
}

export interface ConvertLeadRequest {
  student: {
    full_name: string;
    email?: string;
    whatsapp?: string;
    country?: string;
    currency?: string;
    timezone?: string;
  };
  trial?: {
    teacher_id: number;
    course_id: number;
    trial_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  };
}
