/**
 * Activity Service
 * Service layer for activity log operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ActivityLog, ActivityFilters, ActivityStats, PaginatedResponse, StudentActivity, StudentActivityFilters, ReactivationRequest } from "@/lib/api/types";

export class ActivityService {
  /**
   * Get activity logs with filters and pagination
   */
  static async getActivityLogs(filters: ActivityFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.student_id) params.append('student_id', filters.student_id.toString());
    if (filters.action && filters.action !== 'all') params.append('action', filters.action);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.ACTIVITY}?${params.toString()}`;
    const response = await apiClient.get<ActivityLog[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 50,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch activity logs");
  }

  /**
   * Get activity statistics
   */
  static async getActivityStats(dateFrom?: string, dateTo?: string): Promise<ActivityStats> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const url = `${API_ENDPOINTS.ADMIN.ACTIVITY_STATS}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<ActivityStats>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch activity statistics");
  }

  /**
   * Get recent activities
   */
  static async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    const url = `${API_ENDPOINTS.ADMIN.ACTIVITY_RECENT}?limit=${limit}`;
    const response = await apiClient.get<ActivityLog[]>(url);

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error("Failed to fetch recent activities");
  }

  /**
   * Get students with activity levels
   */
  static async getStudentActivities(filters: StudentActivityFilters = {}): Promise<PaginatedResponse<StudentActivity>> {
    const params = new URLSearchParams();
    
    if (filters.activity_level && filters.activity_level !== 'all') {
      params.append('activity_level', filters.activity_level);
    }
    if (filters.threshold) params.append('threshold', filters.threshold.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.ACTIVITY_STUDENTS}?${params.toString()}`;
    const response = await apiClient.get<StudentActivity[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch student activities");
  }

  /**
   * Send reactivation offer to student
   */
  static async sendReactivationOffer(studentId: number, message?: string): Promise<void> {
    const data: ReactivationRequest = {};
    if (message) {
      data.message = message;
    }

    const response = await apiClient.post(API_ENDPOINTS.ADMIN.ACTIVITY_REACTIVATE(studentId), data);

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to send reactivation offer");
    }
  }
}
