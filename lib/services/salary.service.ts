/**
 * Salary Service
 * Service layer for salary operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  TeacherSalary,
  SalaryStatistics,
  SalaryBreakdown,
  SalaryHistoryItem,
  AllTeachersSalaryHistoryItem,
  SalaryFilters,
} from "@/types/salaries";

export class SalaryService {
  /**
   * Get all teachers with their salaries
   */
  static async getTeachersSalaries(filters: SalaryFilters = {}): Promise<TeacherSalary[]> {
    const params = new URLSearchParams();
    
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id.toString());

    const url = `${API_ENDPOINTS.ADMIN.SALARIES}?${params.toString()}`;
    const response = await apiClient.get<TeacherSalary[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teachers salaries");
  }

  /**
   * Get specific teacher salary
   */
  static async getTeacherSalary(
    teacherId: number,
    month?: string,
    year?: string
  ): Promise<TeacherSalary> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const url = `${API_ENDPOINTS.ADMIN.SALARY(teacherId)}?${params.toString()}`;
    const response = await apiClient.get<TeacherSalary>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teacher salary");
  }

  /**
   * Get monthly statistics
   */
  static async getMonthlyStatistics(month?: string, year?: string): Promise<SalaryStatistics> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const url = `${API_ENDPOINTS.ADMIN.SALARY_STATISTICS}?${params.toString()}`;
    const response = await apiClient.get<SalaryStatistics>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch salary statistics");
  }

  /**
   * Get detailed breakdown for a teacher
   */
  static async getSalaryBreakdown(
    teacherId: number,
    month?: string,
    year?: string
  ): Promise<SalaryBreakdown> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const url = `${API_ENDPOINTS.ADMIN.SALARY_BREAKDOWN(teacherId)}?${params.toString()}`;
    const response = await apiClient.get<SalaryBreakdown>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch salary breakdown");
  }

  /**
   * Get salary history for a teacher
   */
  static async getSalaryHistory(teacherId: number, months: number = 12): Promise<SalaryHistoryItem[]> {
    const params = new URLSearchParams();
    params.append('months', months.toString());

    const url = `${API_ENDPOINTS.ADMIN.SALARY_HISTORY(teacherId)}?${params.toString()}`;
    const response = await apiClient.get<SalaryHistoryItem[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch salary history");
  }

  /**
   * Get all teachers salary history for comparison
   */
  static async getAllTeachersSalaryHistory(
    month?: string,
    year?: string,
    months: number = 12
  ): Promise<AllTeachersSalaryHistoryItem[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    params.append('months', months.toString());

    const url = `${API_ENDPOINTS.ADMIN.SALARY_ALL_HISTORY}?${params.toString()}`;
    const response = await apiClient.get<AllTeachersSalaryHistoryItem[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch all teachers salary history");
  }
}
