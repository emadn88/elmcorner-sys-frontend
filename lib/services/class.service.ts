/**
 * Class Service
 * Service layer for class operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ClassInstance, ClassFilters, PaginatedResponse } from "@/lib/api/types";

export interface UpdateClassStatusRequest {
  status: 'pending' | 'attended' | 'cancelled_by_student' | 'cancelled_by_teacher' | 'absent_student';
  cancellation_reason?: string;
}

export interface UpdateClassRequest {
  class_date: string;
  start_time: string;
  end_time: string;
  student_id?: number;
  teacher_id?: number;
  notes?: string;
}

export class ClassService {
  /**
   * Get classes list with filters and pagination (calendar view)
   */
  static async getClasses(filters: ClassFilters = {}): Promise<PaginatedResponse<ClassInstance>> {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.student_id) params.append('student_id', filters.student_id.toString());
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id.toString());
    if (filters.course_id) params.append('course_id', filters.course_id.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.CLASSES}?${params.toString()}`;
    const response = await apiClient.get<ClassInstance[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 50,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch classes");
  }

  /**
   * Get single class
   */
  static async getClass(id: number): Promise<ClassInstance> {
    const response = await apiClient.get<ClassInstance>(API_ENDPOINTS.ADMIN.CLASS(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch class");
  }

  /**
   * Update class status
   */
  static async updateClassStatus(id: number, data: UpdateClassStatusRequest): Promise<ClassInstance> {
    const response = await apiClient.put<ClassInstance>(
      `${API_ENDPOINTS.ADMIN.CLASS(id)}/status`,
      data
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update class status");
  }

  /**
   * Update class time/details
   */
  static async updateClass(id: number, data: UpdateClassRequest): Promise<ClassInstance> {
    const response = await apiClient.put<ClassInstance>(API_ENDPOINTS.ADMIN.CLASS(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update class");
  }

  /**
   * Delete class
   */
  static async deleteClass(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.CLASS(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete class");
    }
  }

  /**
   * Delete this instance and all future recurring instances
   */
  static async deleteFutureRecurring(id: number): Promise<number> {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.CLASS(id)}/future`);

    if (response.status === "success" && response.data) {
      return (response.data as any).deleted_count || 0;
    }

    throw new Error(response.message || "Failed to delete future classes");
  }

  /**
   * Download classes PDF
   */
  static async downloadPdf(filters: ClassFilters = {}): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.student_id) params.append('student_id', filters.student_id.toString());
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id.toString());
    if (filters.course_id) params.append('course_id', filters.course_id.toString());
    if (filters.status) params.append('status', filters.status);

    const url = `${API_BASE_URL}${API_ENDPOINTS.ADMIN.CLASSES_EXPORT_PDF}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download PDF: ${response.status} ${errorText}`);
    }

    return response.blob();
  }
}
