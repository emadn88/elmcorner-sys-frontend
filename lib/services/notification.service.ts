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
  static async rejectCancellation(id: number): Promise<void> {
    await apiClient.put(API_ENDPOINTS.ADMIN_NOTIFICATIONS.REJECT_CANCELLATION(id));
  }
}
