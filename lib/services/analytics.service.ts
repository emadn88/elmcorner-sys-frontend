/**
 * Analytics Service
 * Service layer for analytics operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  RevenueData,
  AttendanceData,
  CourseAnalyticsData,
  DashboardOverview,
  AnalyticsFilters,
} from "@/lib/api/types";

export class AnalyticsService {
  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(filters: AnalyticsFilters = {}): Promise<RevenueData> {
    const params = new URLSearchParams();

    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.group_by) params.append("group_by", filters.group_by);

    const url = `${API_ENDPOINTS.ADMIN.ANALYTICS_REVENUE}?${params.toString()}`;
    const response = await apiClient.get<RevenueData>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch revenue analytics");
  }

  /**
   * Get attendance analytics
   */
  static async getAttendanceAnalytics(filters: AnalyticsFilters = {}): Promise<AttendanceData> {
    const params = new URLSearchParams();

    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.course_id) params.append("course_id", filters.course_id.toString());
    if (filters.teacher_id) params.append("teacher_id", filters.teacher_id.toString());

    const url = `${API_ENDPOINTS.ADMIN.ANALYTICS_ATTENDANCE}?${params.toString()}`;
    const response = await apiClient.get<AttendanceData>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch attendance analytics");
  }

  /**
   * Get course analytics
   */
  static async getCourseAnalytics(filters: AnalyticsFilters = {}): Promise<CourseAnalyticsData> {
    const params = new URLSearchParams();

    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    const url = `${API_ENDPOINTS.ADMIN.ANALYTICS_COURSES}?${params.toString()}`;
    const response = await apiClient.get<CourseAnalyticsData>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch course analytics");
  }

  /**
   * Get dashboard overview
   */
  static async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<DashboardOverview>(API_ENDPOINTS.ADMIN.ANALYTICS_OVERVIEW);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch dashboard overview");
  }
}
