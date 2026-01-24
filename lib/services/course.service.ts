/**
 * Course Service
 * Service layer for course operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Course, CourseFilters, CourseStats, PaginatedResponse } from "@/types/courses";
import { Teacher } from "@/types/teachers";

export class CourseService {
  /**
   * Get courses list with filters and pagination
   */
  static async getCourses(filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.COURSES}?${params.toString()}`;
    const response = await apiClient.get<Course[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch courses");
  }

  /**
   * Get single course
   */
  static async getCourse(id: number): Promise<Course> {
    const response = await apiClient.get<Course>(API_ENDPOINTS.ADMIN.COURSE(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch course");
  }

  /**
   * Create new course
   */
  static async createCourse(data: Partial<Course>): Promise<Course> {
    const response = await apiClient.post<Course>(API_ENDPOINTS.ADMIN.COURSES, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create course");
  }

  /**
   * Update course
   */
  static async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const response = await apiClient.put<Course>(API_ENDPOINTS.ADMIN.COURSE(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update course");
  }

  /**
   * Delete course
   */
  static async deleteCourse(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.COURSE(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete course");
    }
  }

  /**
   * Assign teachers to course
   */
  static async assignTeachers(courseId: number, teacherIds: number[]): Promise<Course> {
    const response = await apiClient.post<Course>(
      `${API_ENDPOINTS.ADMIN.COURSE(courseId)}/teachers`,
      { teacher_ids: teacherIds }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to assign teachers");
  }

  /**
   * Get course statistics
   */
  static async getCourseStats(): Promise<CourseStats> {
    const response = await apiClient.get<CourseStats>(`${API_ENDPOINTS.ADMIN.COURSES}/stats`);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch course statistics");
  }
}
