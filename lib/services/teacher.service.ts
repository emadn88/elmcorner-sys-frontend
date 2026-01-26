/**
 * Teacher Service
 * Service layer for teacher panel operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  TeacherDashboardStats,
  TeacherClass,
  ClassInstance,
  Student,
  TeacherAvailability,
  EvaluationOption,
  TrialClass,
  PaginatedResponse,
} from "@/lib/api/types";
import { Teacher, TeacherFilters, TeacherStats } from "@/types/teachers";

export interface TeacherDashboardResponse {
  stats: TeacherDashboardStats;
  today_classes: ClassInstance[];
  upcoming_classes: ClassInstance[];
}

export interface TeacherClassesResponse {
  classes: TeacherClass[];
  stats: {
    total: number;
    attended: number;
    pending: number;
    cancelled: number;
    attendance_rate: number;
  };
}

export class TeacherService {
  /**
   * Get teacher dashboard statistics
   */
  static async getDashboardStats(): Promise<TeacherDashboardResponse> {
    const response = await apiClient.get<TeacherDashboardResponse>(
      API_ENDPOINTS.TEACHER.DASHBOARD
    );
    return response.data;
  }

  /**
   * Get teacher's classes with filters
   */
  static async getClasses(filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
    student_id?: number;
    course_id?: number;
  }): Promise<TeacherClassesResponse> {
    const response = await apiClient.get<TeacherClassesResponse>(
      API_ENDPOINTS.TEACHER.CLASSES,
      { params: filters }
    );
    return response.data;
  }

  /**
   * Get single class details
   */
  static async getClass(id: number): Promise<TeacherClass> {
    const response = await apiClient.get<TeacherClass>(
      API_ENDPOINTS.TEACHER.CLASS(id)
    );
    return response.data;
  }

  /**
   * Update class status
   */
  static async updateClassStatus(
    id: number,
    status: "pending" | "attended" | "absent_student"
  ): Promise<ClassInstance> {
    const response = await apiClient.put<ClassInstance>(
      API_ENDPOINTS.TEACHER.CLASS_STATUS(id),
      { status }
    );
    return response.data;
  }

  /**
   * Enter meet link
   */
  static async enterMeet(id: number): Promise<{
    class: ClassInstance;
    meet_link: string;
  }> {
    const response = await apiClient.post<{
      class: ClassInstance;
      meet_link: string;
    }>(API_ENDPOINTS.TEACHER.CLASS_ENTER_MEET(id));
    return response.data;
  }

  /**
   * End class (mark as ready for details)
   */
  static async endClass(id: number): Promise<ClassInstance> {
    const response = await apiClient.post<ClassInstance>(
      API_ENDPOINTS.TEACHER.CLASS_END(id)
    );
    return response.data;
  }

  /**
   * Update class details (evaluation, report, notes)
   */
  static async updateClassDetails(
    id: number,
    data: {
      student_evaluation?: string;
      class_report?: string;
      notes?: string;
    }
  ): Promise<ClassInstance> {
    const response = await apiClient.put<ClassInstance>(
      API_ENDPOINTS.TEACHER.CLASS_UPDATE(id),
      data
    );
    return response.data;
  }

  /**
   * Request class cancellation
   */
  static async cancelClass(id: number, reason: string): Promise<ClassInstance> {
    const response = await apiClient.post<ClassInstance>(
      API_ENDPOINTS.TEACHER.CLASS_CANCEL(id),
      { reason }
    );
    return response.data;
  }

  /**
   * Get teacher's students
   */
  static async getStudents(search?: string): Promise<{
    students: Student[];
    stats: {
      total_students: number;
      active_students: number;
      less_active_students: number;
      stopped_students: number;
      total_salary: number;
      this_month_salary: number;
      this_month_hours: number;
      currency: string;
    };
  }> {
    const response = await apiClient.get<{
      data: Student[];
      stats: {
        total_students: number;
        active_students: number;
        less_active_students: number;
        stopped_students: number;
        total_salary: number;
        this_month_salary: number;
        this_month_hours: number;
        currency: string;
      };
    }>(API_ENDPOINTS.TEACHER.STUDENTS, { params: search ? { search } : {} });
    
    if (response.status === "success") {
      return {
        students: response.data,
        stats: response.stats,
      };
    }
    
    throw new Error("Failed to fetch students");
  }

  /**
   * Get teacher's availability
   */
  static async getAvailability(): Promise<TeacherAvailability[]> {
    const response = await apiClient.get<TeacherAvailability[]>(
      API_ENDPOINTS.TEACHER.AVAILABILITY
    );
    return response.data;
  }

  /**
   * Update teacher's availability
   */
  static async updateAvailability(
    availability: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
      timezone?: string;
      is_available?: boolean;
    }>
  ): Promise<TeacherAvailability[]> {
    const response = await apiClient.post<TeacherAvailability[]>(
      API_ENDPOINTS.TEACHER.AVAILABILITY,
      { availability }
    );
    return response.data;
  }

  /**
   * Get classes for calendar view
   */
  static async getCalendar(filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ClassInstance[]> {
    const response = await apiClient.get<ClassInstance[]>(
      API_ENDPOINTS.TEACHER.CALENDAR,
      { params: filters }
    );
    return response.data;
  }

  /**
   * Get evaluation options
   */
  static async getEvaluationOptions(): Promise<EvaluationOption[]> {
    const response = await apiClient.get<EvaluationOption[]>(
      API_ENDPOINTS.TEACHER.EVALUATION_OPTIONS
    );
    return response.data;
  }

  /**
   * Get teacher's assigned trials
   */
  static async getTrials(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<{
    trials: TrialClass[];
    stats: {
      total_trials: number;
      pending_trials: number;
      completed_trials: number;
      no_show_trials: number;
      converted_trials: number;
      successful_trials: number;
      unsuccessful_trials: number;
      conversion_rate: number;
    };
  }> {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get<{
      data: TrialClass[];
      stats: {
        total_trials: number;
        pending_trials: number;
        pending_review_trials: number;
        completed_trials: number;
        no_show_trials: number;
        converted_trials: number;
        successful_trials: number;
        unsuccessful_trials: number;
        conversion_rate: number;
      };
    }>(API_ENDPOINTS.TEACHER.TRIALS, { params });

    if (response.status === "success") {
      return {
        trials: response.data,
        stats: response.stats,
      };
    }

    throw new Error("Failed to fetch trials");
  }

  /**
   * Get single trial
   */
  static async getTrial(id: number): Promise<TrialClass> {
    const response = await apiClient.get<TrialClass>(API_ENDPOINTS.TEACHER.TRIAL(id));
    return response.data;
  }

  /**
   * Submit trial for review
   */
  static async submitTrialForReview(
    id: number,
    notes: string
  ): Promise<TrialClass> {
    const response = await apiClient.post<TrialClass>(
      `${API_ENDPOINTS.TEACHER.TRIAL(id)}/submit-review`,
      { notes }
    );
    return response.data;
  }

  /**
   * Enter trial (mark as entered)
   */
  static async enterTrial(id: number): Promise<TrialClass> {
    const response = await apiClient.post<TrialClass>(
      `${API_ENDPOINTS.TEACHER.TRIAL(id)}/enter-meet`
    );
    return response.data;
  }

  /**
   * Get all teachers with filters and pagination (Admin)
   */
  static async getTeachers(filters: TeacherFilters = {}): Promise<PaginatedResponse<Teacher>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.course_id) params.append('course_id', filters.course_id.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const url = `${API_ENDPOINTS.ADMIN.TEACHERS}?${params.toString()}`;
    const response = await apiClient.get<Teacher[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch teachers");
  }

  /**
   * Get teacher statistics (Admin)
   */
  static async getTeacherStats(): Promise<TeacherStats> {
    const response = await apiClient.get<TeacherStats>(
      `${API_ENDPOINTS.ADMIN.TEACHERS}/stats`
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teacher statistics");
  }

  /**
   * Get single teacher (Admin)
   */
  static async getTeacher(id: number): Promise<Teacher> {
    const response = await apiClient.get<Teacher>(API_ENDPOINTS.ADMIN.TEACHER(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teacher");
  }

  /**
   * Get teacher weekly schedule (Admin)
   */
  static async getTeacherWeeklySchedule(
    teacherId: number,
    weekStart?: string
  ): Promise<any> {
    const params: any = {};
    if (weekStart) {
      params.week_start = weekStart;
    }

    const response = await apiClient.get<any>(
      API_ENDPOINTS.ADMIN.TEACHER_WEEKLY_SCHEDULE(teacherId),
      { params }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teacher weekly schedule");
  }

  /**
   * Create a new teacher (Admin)
   */
  static async createTeacher(teacherData: Partial<Teacher>): Promise<Teacher> {
    const response = await apiClient.post<Teacher>(
      API_ENDPOINTS.ADMIN.TEACHERS,
      teacherData
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to create teacher");
  }

  /**
   * Update an existing teacher (Admin)
   */
  static async updateTeacher(
    id: number,
    teacherData: Partial<Teacher>
  ): Promise<Teacher> {
    const response = await apiClient.put<Teacher>(
      API_ENDPOINTS.ADMIN.TEACHER(id),
      teacherData
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to update teacher");
  }

  /**
   * Delete a teacher (Admin)
   */
  static async deleteTeacher(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.TEACHER(id));

    if (response.status !== "success") {
      throw new Error("Failed to delete teacher");
    }
  }
}
