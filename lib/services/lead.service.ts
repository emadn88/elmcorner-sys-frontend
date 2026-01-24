/**
 * Lead Service
 * Service layer for lead operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Lead, LeadFilters, LeadStats, ConvertLeadRequest, PaginatedResponse } from "@/lib/api/types";

export class LeadService {
  /**
   * Get leads list with filters and pagination
   */
  static async getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.country) params.append('country', filters.country);
    if (filters.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters.source) params.append('source', filters.source);
    if (filters.overdue_follow_up) params.append('overdue_follow_up', 'true');
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.LEADS}?${params.toString()}`;
    const response = await apiClient.get<Lead[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch leads");
  }

  /**
   * Get single lead with relationships
   */
  static async getLead(id: number): Promise<Lead> {
    const response = await apiClient.get<Lead>(API_ENDPOINTS.ADMIN.LEAD(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch lead");
  }

  /**
   * Create new lead
   */
  static async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await apiClient.post<Lead>(API_ENDPOINTS.ADMIN.LEADS, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create lead");
  }

  /**
   * Update lead
   */
  static async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    const response = await apiClient.put<Lead>(API_ENDPOINTS.ADMIN.LEAD(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update lead");
  }

  /**
   * Update lead status
   */
  static async updateLeadStatus(id: number, status: Lead['status'], notes?: string): Promise<Lead> {
    const response = await apiClient.put<Lead>(
      API_ENDPOINTS.ADMIN.LEAD_STATUS(id),
      { status, notes }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update lead status");
  }

  /**
   * Bulk update lead status
   */
  static async bulkUpdateStatus(leadIds: number[], status: Lead['status']): Promise<{ updated_count: number }> {
    const response = await apiClient.post<{ updated_count: number }>(
      API_ENDPOINTS.ADMIN.LEADS_BULK_STATUS,
      { lead_ids: leadIds, status }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to bulk update leads");
  }

  /**
   * Convert lead to student and optionally create trial
   */
  static async convertLead(id: number, data: ConvertLeadRequest): Promise<{ lead: Lead; student: any; trial?: any }> {
    const response = await apiClient.post<{ lead: Lead; student: any; trial?: any }>(
      API_ENDPOINTS.ADMIN.LEAD_CONVERT(id),
      data
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to convert lead");
  }

  /**
   * Delete lead
   */
  static async deleteLead(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.LEAD(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete lead");
    }
  }

  /**
   * Get lead statistics
   */
  static async getLeadStats(): Promise<LeadStats> {
    const response = await apiClient.get<LeadStats>(API_ENDPOINTS.ADMIN.LEADS_STATS);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch lead statistics");
  }
}
