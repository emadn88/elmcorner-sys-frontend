/**
 * Timetable Service
 * Service layer for timetable operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Timetable, PaginatedResponse } from "@/lib/api/types";

export interface TimetableFilters {
  student_id?: number;
  teacher_id?: number;
  course_id?: number;
  status?: 'active' | 'paused' | 'stopped';
  per_page?: number;
  page?: number;
}

export interface GenerateClassesRequest {
  from_date: string;
  to_date: string;
}

export class TimetableService {
  /**
   * Get timetables list with filters and pagination
   */
  static async getTimetables(filters: TimetableFilters = {}): Promise<PaginatedResponse<Timetable>> {
    const params = new URLSearchParams();
    
    if (filters.student_id) params.append('student_id', filters.student_id.toString());
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id.toString());
    if (filters.course_id) params.append('course_id', filters.course_id.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.TIMETABLES}?${params.toString()}`;
    const response = await apiClient.get<Timetable[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch timetables");
  }

  /**
   * Get single timetable
   */
  static async getTimetable(id: number): Promise<Timetable> {
    const response = await apiClient.get<Timetable>(API_ENDPOINTS.ADMIN.TIMETABLE(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch timetable");
  }

  /**
   * Create new timetable
   */
  static async createTimetable(data: Partial<Timetable>): Promise<Timetable> {
    const response = await apiClient.post<Timetable>(API_ENDPOINTS.ADMIN.TIMETABLES, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create timetable");
  }

  /**
   * Update timetable
   */
  static async updateTimetable(id: number, data: Partial<Timetable>): Promise<Timetable> {
    const response = await apiClient.put<Timetable>(API_ENDPOINTS.ADMIN.TIMETABLE(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update timetable");
  }

  /**
   * Delete timetable
   */
  static async deleteTimetable(id: number, deleteFutureClasses: boolean = false): Promise<void> {
    const params = deleteFutureClasses ? '?delete_future_classes=true' : '';
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.TIMETABLE(id)}${params}`);

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete timetable");
    }
  }

  /**
   * Generate classes for a timetable
   */
  static async generateClasses(id: number, data: GenerateClassesRequest): Promise<any> {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ADMIN.TIMETABLE(id)}/generate-classes`,
      data
    );

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to generate classes");
  }

  /**
   * Pause timetable
   */
  static async pauseTimetable(id: number): Promise<Timetable> {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.TIMETABLE(id)}/pause`, {});

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to pause timetable");
  }

  /**
   * Resume timetable
   */
  static async resumeTimetable(id: number): Promise<Timetable> {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.TIMETABLE(id)}/resume`, {});

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to resume timetable");
  }
}
