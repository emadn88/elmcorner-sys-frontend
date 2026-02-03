/**
 * Notification Service
 * Service layer for unified notifications (packages and class cancellations)
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { NotificationItem } from "@/lib/api/types";

export class NotificationService {
  /**
   * Get all notifications (packages and class cancellations)
   */
  static async getNotifications(type?: "all" | "packages" | "class_cancellations"): Promise<NotificationItem[]> {
    const response = await apiClient.get<NotificationItem[]>(
      API_ENDPOINTS.ADMIN_NOTIFICATIONS.LIST,
      { params: type ? { type } : {} }
    );
    return response.data;
  }

  /**
   * Approve class cancellation request
   */
  static async approveCancellation(id: number): Promise<void> {
    await apiClient.put(API_ENDPOINTS.ADMIN_NOTIFICATIONS.APPROVE_CANCELLATION(id));
  }

  /**
   * Reject class cancellation request
   */
  static async rejectCancellation(id: number, reason: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.ADMIN_NOTIFICATIONS.REJECT_CANCELLATION(id), {
      reason,
    });
  }

  /**
   * Get all cancellation requests with filters (for log)
   */
  static async getAllCancellationRequests(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    teacher_id?: number;
    student_id?: number;
    course_id?: number;
    search?: string;
  }): Promise<NotificationItem[]> {
    const response = await apiClient.get<NotificationItem[]>(
      API_ENDPOINTS.ADMIN_NOTIFICATIONS.ALL_CANCELLATION_REQUESTS,
      { params: filters }
    );
    return response.data;
  }
}
