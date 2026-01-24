/**
 * Report Service
 * Service layer for report operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  Report,
  ReportFilters,
  GenerateReportRequest,
  PaginatedResponse,
} from "@/lib/api/types";

export class ReportService {
  /**
   * Generate a new report
   */
  static async generateReport(data: GenerateReportRequest): Promise<Report> {
    const response = await apiClient.post<Report>(API_ENDPOINTS.ADMIN.REPORT_GENERATE, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to generate report");
  }

  /**
   * Get reports list with filters and pagination
   */
  static async getReports(filters: ReportFilters = {}): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.student_id) params.append("student_id", filters.student_id.toString());
    if (filters.teacher_id) params.append("teacher_id", filters.teacher_id.toString());
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.per_page) params.append("per_page", filters.per_page.toString());
    if (filters.page) params.append("page", filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.REPORTS}?${params.toString()}`;
    const response = await apiClient.get<Report[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch reports");
  }

  /**
   * Get single report
   */
  static async getReport(id: number): Promise<Report> {
    const response = await apiClient.get<Report>(API_ENDPOINTS.ADMIN.REPORT(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch report");
  }

  /**
   * Download report PDF
   */
  static async downloadReport(id: number): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN.REPORT_DOWNLOAD(id)}`,
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
   * Send report via WhatsApp
   */
  static async sendReportViaWhatsApp(id: number, customMessage?: string): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.REPORT_SEND_WHATSAPP(id),
      { custom_message: customMessage }
    );

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to send report via WhatsApp");
    }
  }

  /**
   * Delete report
   */
  static async deleteReport(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.REPORT(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete report");
    }
  }
}
