/**
 * Trial Service
 * Service layer for trial class operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { TrialClass, TrialFilters, TrialStats, ConvertTrialRequest, PaginatedResponse } from "@/lib/api/types";

export class TrialService {
  /**
   * Get trials list with filters and pagination
   */
  static async getTrials(filters: TrialFilters = {}): Promise<PaginatedResponse<TrialClass>> {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.student_id) params.append('student_id', filters.student_id.toString());
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id.toString());
    if (filters.course_id) params.append('course_id', filters.course_id.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.TRIALS}?${params.toString()}`;
    const response = await apiClient.get<TrialClass[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch trials");
  }

  /**
   * Get single trial with relationships
   */
  static async getTrial(id: number): Promise<TrialClass> {
    const response = await apiClient.get<TrialClass>(API_ENDPOINTS.ADMIN.TRIAL(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch trial");
  }

  /**
   * Create new trial
   */
  static async createTrial(data: Partial<TrialClass>): Promise<TrialClass> {
    const response = await apiClient.post<TrialClass>(API_ENDPOINTS.ADMIN.TRIALS, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create trial");
  }

  /**
   * Update trial
   */
  static async updateTrial(id: number, data: Partial<TrialClass>): Promise<TrialClass> {
    const response = await apiClient.put<TrialClass>(API_ENDPOINTS.ADMIN.TRIAL(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update trial");
  }

  /**
   * Update trial status
   */
  static async updateTrialStatus(id: number, status: TrialClass['status'], notes?: string): Promise<TrialClass> {
    const response = await apiClient.put<TrialClass>(
      API_ENDPOINTS.ADMIN.TRIAL_STATUS(id),
      { status, notes }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update trial status");
  }

  /**
   * Convert trial to regular package and timetable
   */
  static async convertTrial(id: number, packageData: ConvertTrialRequest['package'], timetableData: ConvertTrialRequest['timetable']): Promise<{ trial: TrialClass; package: any; timetable: any }> {
    const response = await apiClient.post<{ trial: TrialClass; package: any; timetable: any }>(
      API_ENDPOINTS.ADMIN.TRIAL_CONVERT(id),
      {
        package: packageData,
        timetable: timetableData,
      }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to convert trial");
  }

  /**
   * Delete trial
   */
  static async deleteTrial(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.TRIAL(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete trial");
    }
  }

  /**
   * Get trial statistics
   */
  static async getTrialStats(): Promise<TrialStats> {
    const response = await apiClient.get<TrialStats>(API_ENDPOINTS.ADMIN.TRIALS_STATS);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch trial statistics");
  }

  /**
   * Review trial (approve or reject)
   */
  static async reviewTrial(id: number, action: 'approve' | 'reject', notes?: string): Promise<TrialClass> {
    const response = await apiClient.post<TrialClass>(
      API_ENDPOINTS.ADMIN.TRIAL_REVIEW(id),
      { action, notes }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to review trial");
  }
}
