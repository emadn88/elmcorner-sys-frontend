/**
 * Package Service
 * Service layer for package operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  Package,
  FinishedPackage,
  PackageFilters,
  FinishedPackageFilters,
  PaginatedResponse,
  CreatePackageData,
  UpdatePackageData,
  BillSummary,
} from "@/lib/api/types";

export class PackageService {
  /**
   * Get packages list with filters and pagination
   */
  static async getPackages(filters: PackageFilters = {}): Promise<PaginatedResponse<Package>> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.student_id) params.append("student_id", filters.student_id.toString());
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.per_page) params.append("per_page", filters.per_page.toString());
    if (filters.page) params.append("page", filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.PACKAGES}?${params.toString()}`;
    const response = await apiClient.get<Package[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch packages");
  }

  /**
   * Get single package
   */
  static async getPackage(id: number): Promise<Package> {
    const response = await apiClient.get<{ package: Package; bills_summary: BillSummary }>(
      API_ENDPOINTS.ADMIN.PACKAGE(id)
    );

    if (response.status === "success" && response.data) {
      return (response.data as any).package || response.data;
    }

    throw new Error("Failed to fetch package");
  }

  /**
   * Create new package
   */
  static async createPackage(data: CreatePackageData): Promise<Package> {
    const response = await apiClient.post<Package>(API_ENDPOINTS.ADMIN.PACKAGES, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create package");
  }

  /**
   * Update package
   */
  static async updatePackage(id: number, data: UpdatePackageData): Promise<Package> {
    const response = await apiClient.put<Package>(API_ENDPOINTS.ADMIN.PACKAGE(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update package");
  }

  /**
   * Delete package
   */
  static async deletePackage(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.PACKAGE(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete package");
    }
  }

  /**
   * Get finished packages (for notifications center)
   */
  static async getFinishedPackages(
    filters: FinishedPackageFilters = {}
  ): Promise<PaginatedResponse<FinishedPackage>> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.student_status && filters.student_status !== "all")
      params.append("student_status", filters.student_status);
    if (filters.notification_status && filters.notification_status !== "all")
      params.append("notification_status", filters.notification_status);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.days_since_finished)
      params.append("days_since_finished", filters.days_since_finished.toString());
    if (filters.per_page) params.append("per_page", filters.per_page.toString());
    if (filters.page) params.append("page", filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.PACKAGES_FINISHED}?${params.toString()}`;
    const response = await apiClient.get<FinishedPackage[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch finished packages");
  }

  /**
   * Send WhatsApp notification for finished package
   */
  static async sendNotification(packageId: number): Promise<void> {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.PACKAGE_NOTIFY(packageId), {});

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to send notification");
    }
  }

  /**
   * Send bulk WhatsApp notifications
   */
  static async bulkSendNotifications(packageIds: number[]): Promise<{
    success_count: number;
    failed_count: number;
    errors: string[];
  }> {
    const response = await apiClient.post<{
      success_count: number;
      failed_count: number;
      errors: string[];
    }>(API_ENDPOINTS.ADMIN.PACKAGES_BULK_NOTIFY, {
      package_ids: packageIds,
    });

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to send bulk notifications");
  }

  /**
   * Get bills summary for a package
   */
  static async getPackageBills(packageId: number): Promise<BillSummary> {
    const response = await apiClient.get<BillSummary>(
      API_ENDPOINTS.ADMIN.PACKAGE_BILLS(packageId)
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch package bills");
  }

  /**
   * Download package PDF
   */
  static async downloadPackagePdf(packageId: number): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN.PACKAGE_PDF(packageId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download PDF: ${response.status} ${errorText}`);
    }

    return response.blob();
  }

  /**
   * Reactivate a finished package
   */
  static async reactivatePackage(
    packageId: number,
    data?: {
      total_hours?: number;
      total_classes?: number;
      start_date?: string;
      hour_price?: number;
      currency?: string;
    }
  ): Promise<Package> {
    const response = await apiClient.post<Package>(
      API_ENDPOINTS.ADMIN.PACKAGE_REACTIVATE(packageId),
      data || {}
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to reactivate package");
  }

  /**
   * Get package classes with cumulative hour counters
   */
  static async getPackageClasses(packageId: number): Promise<
    Array<{
      class: any;
      duration_hours: number;
      cumulative_hours: number;
      counter: number;
    }>
  > {
    const response = await apiClient.get<
      Array<{
        class: any;
        duration_hours: number;
        cumulative_hours: number;
        counter: number;
      }>
    >(API_ENDPOINTS.ADMIN.PACKAGE_CLASSES(packageId));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch package classes");
  }

  /**
   * Get count of finished packages without notifications
   */
  static async getUnnotifiedCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        API_ENDPOINTS.ADMIN.PACKAGES_UNNOTIFIED_COUNT
      );

      if (response.status === "success" && response.data) {
        // Response structure from backend: { status: 'success', data: { count: number } }
        // apiClient.get returns ApiResponse<T>, so response.data is { count: number }
        const count = (response.data as any)?.count ?? 0;
        return Number(count) || 0;
      }

      return 0;
    } catch (error) {
      console.error("Error fetching unnotified count:", error);
      return 0;
    }
  }
}
