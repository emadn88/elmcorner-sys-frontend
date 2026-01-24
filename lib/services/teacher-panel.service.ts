/**
 * Teacher Panel Service
 * Service layer for teacher panel operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { TeacherProfile, TeacherPerformance } from "@/types/teachers";

export interface TeacherDashboard {
  today_classes_count: number;
  today_classes: any[];
  upcoming_classes: any[];
  assigned_students_count: number;
  this_month_classes: number;
}

export class TeacherPanelService {
  /**
   * Get teacher dashboard data
   */
  static async getDashboard(): Promise<TeacherDashboard> {
    const response = await apiClient.get<TeacherDashboard>(API_ENDPOINTS.TEACHER.DASHBOARD);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teacher dashboard");
  }

  /**
   * Get teacher's classes
   */
  static async getClasses(dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const url = `${API_ENDPOINTS.TEACHER.CLASSES}?${params.toString()}`;
    const response = await apiClient.get<any[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch classes");
  }

  /**
   * Get assigned students
   */
  static async getStudents(): Promise<any[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.TEACHER.STUDENTS);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch students");
  }

  /**
   * Get duties
   */
  static async getDuties(): Promise<any[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.TEACHER.DUTIES);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch duties");
  }

  /**
   * Get teacher's own profile
   */
  static async getProfile(): Promise<TeacherProfile> {
    const response = await apiClient.get<TeacherProfile>(API_ENDPOINTS.TEACHER.PROFILE);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch profile");
  }

  /**
   * Get teacher's own performance stats
   */
  static async getPerformance(dateFrom?: string, dateTo?: string): Promise<TeacherPerformance> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const url = `${API_ENDPOINTS.TEACHER.PERFORMANCE}?${params.toString()}`;
    const response = await apiClient.get<TeacherPerformance>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch performance");
  }
}
