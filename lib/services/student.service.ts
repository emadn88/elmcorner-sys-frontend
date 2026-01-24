/**
 * Student Service
 * Service layer for student operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Student, StudentProfile, StudentStats, StudentFilters, PaginatedResponse } from "@/lib/api/types";

export class StudentService {
  /**
   * Get students list with filters and pagination
   */
  static async getStudents(filters: StudentFilters = {}): Promise<PaginatedResponse<Student>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.family_id) params.append('family_id', filters.family_id.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.STUDENTS}?${params.toString()}`;
    const response = await apiClient.get<Student[]>(url);

    if (response.status === "success") {
      // The backend returns data and meta separately
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch students");
  }

  /**
   * Get single student with full profile
   */
  static async getStudent(id: number): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>(API_ENDPOINTS.ADMIN.STUDENT(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch student");
  }

  /**
   * Create new student
   */
  static async createStudent(data: Partial<Student>): Promise<Student> {
    const response = await apiClient.post<Student>(API_ENDPOINTS.ADMIN.STUDENTS, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create student");
  }

  /**
   * Update student
   */
  static async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    const response = await apiClient.put<Student>(API_ENDPOINTS.ADMIN.STUDENT(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update student");
  }

  /**
   * Delete student
   */
  static async deleteStudent(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.STUDENT(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete student");
    }
  }

  /**
   * Get student statistics
   */
  static async getStudentStats(): Promise<StudentStats> {
    const response = await apiClient.get<StudentStats>(API_ENDPOINTS.ADMIN.STUDENTS_STATS);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch student statistics");
  }
}
